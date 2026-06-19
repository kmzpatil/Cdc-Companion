"""
CV Pipeline
- Reads CV files (PDF/TXT) from `exports/` or a specified folder
- Uses an LLM (via environment-configured API keys) to extract structured info and categorize domains
- Appends results to `master.md` and per-domain markdown files under `domains/`
- Includes error handling and logging

Usage:
  python cv_pipeline.py --input-dir exports --out-dir docs

Environment:
  - GROQ_API_KEYS: comma-separated API keys (optional for local LLM)
  - GROQ_MODEL: model id to use

This script is intentionally provider-agnostic; you can plug in any LLM by editing `call_llm`.
"""

import argparse
import os
import json
import csv
import sys
import logging
from pathlib import Path
from typing import List, Dict, Any, Optional
import time
import json
import pandas as pd

try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    pass

logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s %(message)s')

# Config
API_KEYS = os.getenv('GEMINI_API_KEYS')  # comma separated
MODEL = os.getenv('GEMINI_MODEL', 'gemini-1.5-pro')

# internal rotating key index
_key_index = 0
_gemini_available: Optional[bool] = None

def call_llm(prompt: str, api_key: Optional[str]=None) -> str:
    """Call Gemini HTTP API with rotating keys and exponential backoff."""
    global _key_index
    logging.debug('call_llm: prompt length=%d', len(prompt))

    try:
        import requests
    except Exception:
        logging.warning('`requests` library not available; using local LLM stub')
        return _stub_response()

    keys = [k.strip() for k in (API_KEYS or '').split(',') if k.strip()]
    if api_key and api_key not in keys:
        keys.insert(0, api_key)

    if not keys:
        logging.warning('No GEMINI keys configured; using local LLM stub')
        return _stub_response()

    global _gemini_available
    if _gemini_available is False:
        return _stub_response()

    # Single-cycle rotation across keys to handle rate limits without long backoffs
    for i in range(len(keys)):
        idx = (_key_index + i) % len(keys)
        key = keys[idx]
        endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent?key={key}"
        
        headers = {'Content-Type': 'application/json'}
        payload = {
            "contents": [{
                "parts": [{"text": prompt}]
            }],
            "generationConfig": {
                "temperature": 0.0
            }
        }
        
        try:
            logging.info("DEBUG: making request to Gemini with key index %d (...%s)...", idx, key[-4:])
            resp = requests.post(endpoint, json=payload, headers=headers, timeout=30)
        except requests.exceptions.RequestException as exc:
            logging.warning('request exception with key index %d: %s', idx, exc)
            continue

        # rotate to next key on next call
        _key_index = (idx + 1) % len(keys)
        
        logging.info("Response status %d", resp.status_code)

        if resp.status_code == 200:
            data = resp.json()
            try:
                return data['candidates'][0]['content']['parts'][0]['text']
            except (KeyError, IndexError):
                logging.error('Unexpected Gemini response format: %s', resp.text[:400])
                return _stub_response()
        elif resp.status_code == 429:
            err_msg = resp.text
            logging.warning(f"Rate limit hit for key index {idx}: {err_msg}. Rotating to next key...")
            time.sleep(2)
            continue
        else:
            logging.error('Gemini request failed: %d %s', resp.status_code, resp.text[:400])
            # If 400 or 403, it might be a bad key, let's rotate anyway
            continue

    logging.warning('Tried all GEMINI keys once; none returned 200. Falling back to local stub.')
    _gemini_available = False
    return _stub_response()


def _stub_response() -> str:
    return json.dumps({
        'name': 'John Doe',
        'domains': ['software', 'ml'],
        'items': {'software': [{'title': 'Built X', 'description': 'Worked on...'}]},
        'summary': 'Experienced developer...'
    })


def parse_reviewers_csv(path: Path) -> Dict[str, Dict[str, str]]:
    """Read reviewers.csv and return mapping of reviewerId -> details"""
    reviewers = {}
    if not path.exists():
        return reviewers
    with path.open('r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            reviewer_id = str(row.get('id', '')).strip()
            if reviewer_id:
                reviewers[reviewer_id] = {
                    'name': row.get('name', ''),
                    'profiles': row.get('profiles', '')
                }
    return reviewers

def parse_review_csv(path: Path, reviewers_map: Dict[str, Dict[str, str]]) -> Dict[int, List[Dict[str, Any]]]:
    """Read reviews.csv and return mapping of revieweeId -> review data list"""
    reviews = {}
    if not path.exists():
        return reviews
    with path.open('r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                rid = int(row.get('revieweeId') or row.get('reviewee_id') or 0)
            except Exception:
                continue
            reviewer_id = str(row.get('reviewerId', '')).strip()
            if reviewer_id in reviewers_map:
                row['reviewer_name'] = reviewers_map[reviewer_id]['name']
                row['reviewer_profiles'] = reviewers_map[reviewer_id]['profiles']
            reviews.setdefault(rid, []).append(row)
    return reviews


def read_cv_text_from_csv(reviewee_row: Dict[str, str]) -> str:
    """Extract CV text from a reviewee row. If `cvLink` is a URL, we could fetch it; for now we use profile or cvLink text fields."""
    fields = ['profile', 'cvLink', 'profile_text']
    for f in fields:
        if reviewee_row.get(f):
            return reviewee_row[f]
    # fallback: join all columns
    return ' '.join(str(v) for v in reviewee_row.values() if v)


def analyze_cv_text(text: str, reviews: List[Dict[str, Any]], status: str = "True") -> Dict[str, Any]:
    """Send text + reviews to LLM, get structured output with domains and items."""
    # Pre-check: if status is False, skip
    if str(status).lower() == 'false':
        return {'restricted': True}

    # Pre-check: if text contains access restriction message, skip
    if text and ("access restrictions" in text.lower() or "not accessible" in text.lower()):
        return {'restricted': True}
        
    # Pre-check for access issues to save LLM tokens
    for r in reviews:
        comments = r.get('comments', '').lower()
        if any(ph in comments for ph in ['not able to access', 'no access', 'change access', 'give access', 'provide access', 'access permissions', 'access denied']):
            return {'restricted': True}

    prompt = {
        'instruction': 'Based on this CV and the reviewer feedback, act as an expert CV reviewer and extract evaluation guidelines for a CV in these domains. Provide: 1. "best_practices" (what this CV did well that others should copy), 2. "common_pitfalls" (flaws identified by reviewers to avoid), 3. "required_elements" (sections, metrics, or data points a good CV in this domain must have). Group these by domain. Do not output specific personal content from the CV. Provide a boolean "restricted": true if the CV content is inaccessible or missing, otherwise false. STRICTLY output valid JSON matching this schema: {"domains": ["Domain Name"], "best_practices": {"Domain Name": ["rule1"]}, "common_pitfalls": {"Domain Name": ["rule1"]}, "required_elements": {"Domain Name": ["rule1"]}, "restricted": false}',
        'text': text,
        'reviews': reviews,
    }
    prompt_str = json.dumps(prompt)
    response = call_llm(prompt_str, api_key=(API_KEYS.split(',')[0] if API_KEYS else None))
    
    cleaned = response.strip()
    if cleaned.startswith("```json"):
        cleaned = cleaned[7:]
    elif cleaned.startswith("```"):
        cleaned = cleaned[3:]
    if cleaned.endswith("```"):
        cleaned = cleaned[:-3]
    cleaned = cleaned.strip()

    try:
        parsed = json.loads(cleaned)
    except Exception:
        # Best-effort: return fallback structure
        parsed = {
            'domains': [],
            'best_practices': {},
            'common_pitfalls': {},
            'required_elements': {},
            'restricted': False
        }
    return parsed


def ensure_dirs(base: Path):
    base.mkdir(parents=True, exist_ok=True)
    (base / 'domains').mkdir(parents=True, exist_ok=True)


def append_restricted_reviews(out_dir: Path, domain: str, reviews: List[Dict[str, Any]]):
    """Save reviews of restricted CVs to a JSON lines file for later processing."""
    if not reviews:
        return
    restricted_file = out_dir / 'restricted_reviews.jsonl'
    with restricted_file.open('a', encoding='utf-8') as f:
        f.write(json.dumps({'domain': domain, 'reviews': reviews}) + '\n')


def append_master(master_path: Path, parsed: Dict[str, Any]):
    with master_path.open('a', encoding='utf-8') as f:
        for domain in parsed.get('domains', []):
            f.write(f"## {domain} Guidelines\n\n")
            
            best = parsed.get('best_practices', {}).get(domain, [])
            if best:
                f.write("**Best Practices (Do's):**\n")
                for b in best: f.write(f"- {b}\n")
                f.write("\n")
                
            pitfalls = parsed.get('common_pitfalls', {}).get(domain, [])
            if pitfalls:
                f.write("**Common Pitfalls (Don'ts):**\n")
                for p in pitfalls: f.write(f"- {p}\n")
                f.write("\n")
                
            required = parsed.get('required_elements', {}).get(domain, [])
            if required:
                f.write("**Required Elements:**\n")
                for r in required: f.write(f"- {r}\n")
                f.write("\n")
        
        f.write('---\n\n')


def append_domain_files(base: Path, parsed: Dict[str, Any]):
    for domain in parsed.get('domains', []):
        domain_file = base / 'domains' / f"{domain}_guidelines.md"
        with domain_file.open('a', encoding='utf-8') as f:
            best = parsed.get('best_practices', {}).get(domain, [])
            if best:
                f.write("**Best Practices (Do's):**\n")
                for b in best: f.write(f"- {b}\n")
                f.write("\n")
                
            pitfalls = parsed.get('common_pitfalls', {}).get(domain, [])
            if pitfalls:
                f.write("**Common Pitfalls (Don'ts):**\n")
                for p in pitfalls: f.write(f"- {p}\n")
                f.write("\n")
                
            required = parsed.get('required_elements', {}).get(domain, [])
            if required:
                f.write("**Required Elements:**\n")
                for r in required: f.write(f"- {r}\n")
                f.write("\n")
            f.write('---\n\n')


def main(input_dir: Path = Path('exports'), out_dir: Path = Path('outputs')):
    ensure_dirs(out_dir)

    master = out_dir / 'master.md'
    reviewers_map = parse_reviewers_csv(input_dir / 'reviewers.csv')
    reviews_map = parse_review_csv(input_dir / 'reviews.csv', reviewers_map)

    reviewees_path = input_dir / 'reviewees.csv'
    if not reviewees_path.exists():
        logging.error('reviewees.csv not found in %s', input_dir)
        sys.exit(1)

    with reviewees_path.open('r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                rid = int(row.get('id') or 0)
            except Exception:
                rid = 0
            
            logging.info(f"Processing candidate ID: {rid}...")
            
            text = read_cv_text_from_csv(row)
            related_reviews = reviews_map.get(rid, [])
            parsed = analyze_cv_text(text, related_reviews, row.get('status', 'True'))
            
            if parsed.get('restricted') is True:
                logging.info('Skipping restricted CV for candidate %s, saving reviews', rid)
                domain_val = row.get('profiles') or row.get('Profile') or 'Unknown'
                append_restricted_reviews(out_dir, domain_val, related_reviews)
                continue
                
            append_master(master, parsed)
            append_domain_files(out_dir, parsed)
            
            logging.info(f"Successfully appended data for candidate {rid}")
            time.sleep(3)  # Rate limiting sleep

    # Process XLSX files
    process_xlsx_files(input_dir, out_dir, master)

    logging.info('Done. Master and domain files updated in %s', out_dir)

def process_xlsx_files(input_dir: Path, out_dir: Path, master_file: Path):
    # Process 2023 file
    file_2023 = input_dir / 'CV Review 2023 Sorted.xlsx'
    if file_2023.exists():
        logging.info("Processing CV Review 2023 Sorted.xlsx...")
        df_2023 = pd.read_excel(file_2023)
        df_2023 = df_2023.dropna(subset=['Name of the Applicant', 'Review by the Panelists'])
        for _, row in df_2023.iterrows():
            name = str(row['Name of the Applicant']).strip()
            profile = str(row.get('Profile', '')).strip()
            review_text = str(row['Review by the Panelists']).strip()
            reviewer_name = str(row.get('Name of the panelist', '')).strip()
            
            logging.info(f"Processing candidate (2023 XLSX): {name}...")
            
            text = profile
            related_reviews = [{'comments': review_text, 'reviewer_name': reviewer_name, 'reviewer_profiles': ''}]
            
            parsed = analyze_cv_text(text, related_reviews, 'True')
            if parsed.get('restricted') is True:
                logging.info('Skipping restricted CV for candidate %s, saving reviews', name)
                append_restricted_reviews(out_dir, profile, related_reviews)
                continue
            
            append_master(master_file, parsed)
            append_domain_files(out_dir, parsed)
            logging.info(f"Successfully appended data for {name}")
            time.sleep(3)  # Rate limiting sleep

    # Process 2024-25 file
    file_2024 = input_dir / 'CV Review Drive 2024-25 - Reviews.xlsx'
    if file_2024.exists():
        logging.info("Processing CV Review Drive 2024-25 - Reviews.xlsx...")
        df_2024 = pd.read_excel(file_2024)
        df_2024 = df_2024.dropna(subset=['Name', 'Reviews'])
        for _, row in df_2024.iterrows():
            name = str(row['Name']).strip()
            profile = str(row.get('Profile', '')).strip()
            review_text = str(row['Reviews']).strip()
            reviewer_name = str(row.get('Reviewer Name', '')).strip()
            
            logging.info(f"Processing candidate (2024 XLSX): {name}...")
            
            text = profile
            related_reviews = [{'comments': review_text, 'reviewer_name': reviewer_name, 'reviewer_profiles': ''}]
            
            parsed = analyze_cv_text(text, related_reviews, 'True')
            if parsed.get('restricted') is True:
                logging.info('Skipping restricted CV for candidate %s, saving reviews', name)
                append_restricted_reviews(out_dir, profile, related_reviews)
                continue
            
            append_master(master_file, parsed)
            append_domain_files(out_dir, parsed)
            logging.info(f"Successfully appended data for {name}")
            time.sleep(3)  # Rate limiting sleep

if __name__ == '__main__':
    main()
