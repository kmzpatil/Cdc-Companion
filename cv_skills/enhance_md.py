import os
import time
import json
import logging
import requests
from pathlib import Path
from dotenv import load_dotenv

logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s %(message)s')

# Global state for key rotation
_endpoints = []
_endpoint_index = 0

def init_endpoints():
    global _endpoints
    if _endpoints: return
    
    groq_keys = [k.strip() for k in os.getenv('GROQ_API_KEYS', '').split(',') if k.strip()]
    gemini_keys = [k.strip() for k in os.getenv('GEMINI_API_KEYS', '').split(',') if k.strip()]
    
    for k in groq_keys:
        _endpoints.append({'provider': 'groq', 'key': k})
    for k in gemini_keys:
        _endpoints.append({'provider': 'gemini', 'key': k})
        
    if not _endpoints:
        logging.error("No Groq or Gemini API keys found in .env!")
        exit(1)
        
    logging.info(f"Loaded {len(groq_keys)} Groq keys and {len(gemini_keys)} Gemini keys for rolling.")

def call_llm(prompt: str) -> str:
    global _endpoint_index, _endpoints
    init_endpoints()
    
    # Try all endpoints once
    for i in range(len(_endpoints)):
        idx = (_endpoint_index + i) % len(_endpoints)
        ep = _endpoints[idx]
        provider = ep['provider']
        key = ep['key']
        
        logging.info(f"Trying {provider.upper()} API (Key ending in ...{key[-4:]})")
        
        try:
            if provider == 'groq':
                url = "https://api.groq.com/openai/v1/chat/completions"
                headers = {'Authorization': f'Bearer {key}', 'Content-Type': 'application/json'}
                payload = {
                    'model': os.getenv('GROQ_MODEL', 'llama-3.3-70b-versatile'),
                    'messages': [{'role': 'user', 'content': prompt}],
                    'temperature': 0.0
                }
                resp = requests.post(url, json=payload, headers=headers, timeout=180)
                
                if resp.status_code == 200:
                    _endpoint_index = (idx + 1) % len(_endpoints) # Rotate for next call
                    return resp.json()['choices'][0]['message']['content']
                    
            elif provider == 'gemini':
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key={key}"
                headers = {'Content-Type': 'application/json'}
                payload = {
                    "contents": [{"parts": [{"text": prompt}]}],
                    "generationConfig": {"temperature": 0.0}
                }
                resp = requests.post(url, json=payload, headers=headers, timeout=180)
                
                if resp.status_code == 200:
                    _endpoint_index = (idx + 1) % len(_endpoints) # Rotate for next call
                    return resp.json()['candidates'][0]['content']['parts'][0]['text']
                    
            # Handle failures
            if resp.status_code == 429:
                logging.warning(f"Rate limit hit on {provider.upper()}. Rotating to next key...")
                time.sleep(1)
                continue
            else:
                logging.warning(f"{provider.upper()} returned {resp.status_code}: {resp.text[:200]}. Rotating...")
                continue
                
        except requests.exceptions.RequestException as e:
            logging.warning(f"Request failed for {provider.upper()}: {e}. Rotating...")
            continue
            
    logging.error("All API keys failed or rate-limited. Returning empty string.")
    return ""

def split_into_chunks(text, num_candidates_per_chunk=3):
    """Splits the aggregated txt file into chunks of multiple candidates."""
    candidates = text.split("=== Candidate: ")
    if candidates and not candidates[0].strip():
        candidates = candidates[1:]
    candidates = ["=== Candidate: " + c for c in candidates if c.strip()]
    
    chunks = []
    for i in range(0, len(candidates), num_candidates_per_chunk):
        chunk = "".join(candidates[i:i+num_candidates_per_chunk])
        chunks.append(chunk)
    return chunks

def enhance_markdown(current_md, candidates_chunk, domain):
    prompt = f"""You are an expert AI creating and refining CV evaluation guidelines for the "{domain}" domain.
Your goal is to prepare strict guidelines that another AI agent will use to evaluate new CVs.

CURRENT GUIDELINES (Markdown format):
{current_md if current_md.strip() else "No existing guidelines yet. Please create them from scratch based on the data below."}

RAW DATA CHUNK (Candidate CV texts & Reviewer Feedback):
{candidates_chunk}

TASK:
Analyze the RAW DATA CHUNK and ENHANCE the CURRENT GUIDELINES.
1. Extract new rules, common pitfalls, best practices, and required elements from the reviewer feedback and CV text.
2. INTEGRATE these new findings into the CURRENT GUIDELINES.
3. DO NOT LOSE any of the existing points from the CURRENT GUIDELINES. Expand and organize them logically.
4. Keep the format strictly in professional Markdown.
5. Emphasize *HOW* a CV should look and *WHAT* it should contain, not specific candidate details.

OUTPUT FORMAT:
Return ONLY the raw updated Markdown content. Do not include ```markdown wrappers or any conversational text.
"""
    response = call_llm(prompt)
    if not response:
        return ""
        
    if response.startswith("```markdown"):
        response = response[len("```markdown"):].strip()
    if response.startswith("```"):
        response = response[len("```"):].strip()
    if response.endswith("```"):
        response = response[:-3].strip()
        
    return response

def main():
    load_dotenv()
    
    cvs_dir = Path("extracted_cvs")
    if not cvs_dir.exists():
        print("Directory extracted_cvs/ not found.")
        return
        
    txt_files = list(cvs_dir.glob("*.txt"))
    if not txt_files:
        print("No .txt files found in extracted_cvs/")
        return
        
    print(f"Found {len(txt_files)} domain text files. Starting enhancement process...")
    
    for txt_file in txt_files:
        if txt_file.name == "Unknown.txt":
            print("Skipping Unknown.txt...")
            continue
            
        domain = txt_file.stem
        md_file = cvs_dir / f"{domain}.md"
        
        print(f"\n--- Processing Domain: {domain} ---")
        
        with open(txt_file, 'r', encoding='utf-8') as f:
            full_text = f.read()
            
        chunks = split_into_chunks(full_text, num_candidates_per_chunk=15)
        print(f"Split {txt_file.name} into {len(chunks)} chunks.")
        
        for i, chunk in enumerate(chunks, 1):
            print(f"  Enhancing chunk {i}/{len(chunks)}...")
            
            current_md = ""
            if md_file.exists():
                with open(md_file, 'r', encoding='utf-8') as f:
                    current_md = f.read()
            
            updated_md = enhance_markdown(current_md, chunk, domain)
            
            if updated_md and len(updated_md.strip()) > 50:
                with open(md_file, 'w', encoding='utf-8') as f:
                    f.write(updated_md)
                print(f"  -> Successfully updated {md_file.name}")
            else:
                print(f"  -> Warning: LLM returned empty or invalid response for chunk {i}. Skipping update.")
                
            time.sleep(2) # Brief pause between chunks

    print("\nAll domains enhanced successfully!")

if __name__ == '__main__':
    main()

