import os
import csv
from pathlib import Path
import pandas as pd
import json

def parse_reviewers_csv(path: Path):
    reviewers = {}
    if not path.exists(): return reviewers
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

def parse_review_csv(path: Path, reviewers_map):
    reviews = {}
    if not path.exists(): return reviews
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

def read_cv_text_from_csv(row):
    for f in ['profile', 'cvLink', 'profile_text']:
        if row.get(f): return row[f]
    return ' '.join(str(v) for v in row.values() if v)

def clean_domain(domain_str):
    # Keep it simple, extract the primary domain or use raw string
    d = str(domain_str).split('|')[0].strip()
    # Remove invalid chars for filename
    valid = "".join(c for c in d if c.isalnum() or c in (' ', '_', '-'))
    return valid or "Unknown"

def write_to_domain_file(out_dir, domain, name, text, reviews):
    domain_clean = clean_domain(domain)
    filepath = out_dir / f"{domain_clean}.txt"
    with filepath.open('a', encoding='utf-8') as f:
        f.write(f"=== Candidate: {name} ===\n")
        f.write(f"Domain: {domain}\n\n")
        f.write(f"--- PDF Text / Profile ---\n{text}\n\n")
        f.write(f"--- Reviews ---\n")
        for r in reviews:
            f.write(f"Reviewer Name: {r.get('reviewer_name', 'Unknown')}\n")
            f.write(f"Comments: {r.get('comments', '')}\n")
            f.write("-" * 20 + "\n")
        f.write("\n" + "=" * 40 + "\n\n")

def is_restricted(status, text, reviews):
    if str(status).lower() == 'false':
        return True
    if text and ("access restrictions" in text.lower() or "not accessible" in text.lower()):
        return True
    for r in reviews:
        comments = r.get('comments', '').lower()
        if any(ph in comments for ph in ['not able to access', 'no access', 'change access', 'give access', 'provide access', 'access permissions', 'access denied']):
            return True
    return False

def main():
    input_dir = Path('exports')
    out_dir = Path('aggregated_txts')
    out_dir.mkdir(parents=True, exist_ok=True)
    
    print(f"Aggregating data into {out_dir}...")
    
    reviewers_map = parse_reviewers_csv(input_dir / 'reviewers.csv')
    reviews_map = parse_review_csv(input_dir / 'reviews.csv', reviewers_map)
    
    # Process reviewees.csv
    reviewees_path = input_dir / 'reviewees.csv'
    if reviewees_path.exists():
        print("Processing reviewees.csv...")
        with reviewees_path.open('r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                try: rid = int(row.get('id') or 0)
                except Exception: rid = 0
                
                status = str(row.get('status', 'True')).lower()
                text = read_cv_text_from_csv(row)
                related_reviews = reviews_map.get(rid, [])
                
                if is_restricted(status, text, related_reviews):
                    continue
                    
                domain_val = row.get('profiles') or row.get('Profile') or 'Unknown'
                name = row.get('name') or f"candidate_{rid}"
                write_to_domain_file(out_dir, domain_val, name, text, related_reviews)
                
    # Process XLSX
    file_2023 = input_dir / 'CV Review 2023 Sorted.xlsx'
    if file_2023.exists():
        print("Processing 2023 XLSX...")
        df = pd.read_excel(file_2023).dropna(subset=['Name of the Applicant', 'Review by the Panelists'])
        for _, row in df.iterrows():
            name = str(row['Name of the Applicant']).strip()
            profile = str(row.get('Profile', '')).strip()
            review_text = str(row['Review by the Panelists']).strip()
            reviewer_name = str(row.get('Name of the panelist', '')).strip()
            
            text = profile
            related_reviews = [{'comments': review_text, 'reviewer_name': reviewer_name}]
            
            if is_restricted('True', text, related_reviews):
                continue
            write_to_domain_file(out_dir, profile, name, text, related_reviews)

    file_2024 = input_dir / 'CV Review Drive 2024-25 - Reviews.xlsx'
    if file_2024.exists():
        print("Processing 2024 XLSX...")
        df = pd.read_excel(file_2024).dropna(subset=['Name', 'Reviews'])
        for _, row in df.iterrows():
            name = str(row['Name']).strip()
            profile = str(row.get('Profile', '')).strip()
            review_text = str(row['Reviews']).strip()
            reviewer_name = str(row.get('Reviewer Name', '')).strip()
            
            text = profile
            related_reviews = [{'comments': review_text, 'reviewer_name': reviewer_name}]
            
            if is_restricted('True', text, related_reviews):
                continue
            write_to_domain_file(out_dir, profile, name, text, related_reviews)
            
    print("Aggregation complete! Check the aggregated_txts/ folder.")

if __name__ == '__main__':
    main()
