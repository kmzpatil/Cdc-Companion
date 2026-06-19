import os
import csv
import re
import io
from pathlib import Path
import pandas as pd
from PyPDF2 import PdfReader
import requests
import time

def extract_gdrive_id(url):
    if not url or type(url) != str:
        return None
    match = re.search(r"/d/([a-zA-Z0-9_-]+)", url)
    if match:
        return match.group(1)
    match = re.search(r"id=([a-zA-Z0-9_-]+)", url)
    if match:
        return match.group(1)
    return None

def extract_text_from_pdf_url(url):
    file_id = extract_gdrive_id(url)
    if not file_id:
        return None
        
    download_url = f"https://drive.google.com/uc?export=download&id={file_id}"
    
    # Use requests to download the PDF
    try:
        response = requests.get(download_url, timeout=10)
        # Check if the downloaded content is actually a PDF
        if response.status_code == 200 and b"%PDF" in response.content[:10]:
            reader = PdfReader(io.BytesIO(response.content))
            text = ""
            for page in reader.pages:
                t = page.extract_text()
                if t: text += t
            if text.strip():
                return text.strip()
    except Exception as e:
        print(f"Error extracting PDF: {e}")
                
    return None

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

def clean_domain(domain_str):
    d = str(domain_str).split('|')[0].strip()
    valid = "".join(c for c in d if c.isalnum() or c in (' ', '_', '-'))
    return valid or "Unknown"

def write_to_domain_file(out_dir, domain, name, text, reviews):
    domain_clean = clean_domain(domain)
    filepath = out_dir / f"{domain_clean}.txt"
    with filepath.open('a', encoding='utf-8') as f:
        f.write(f"=== Candidate: {name} ===\n")
        f.write(f"Domain: {domain}\n\n")
        f.write(f"--- Extracted PDF Text ---\n{text}\n\n")
        f.write(f"--- Reviews ---\n")
        for r in reviews:
            f.write(f"Reviewer Name: {r.get('reviewer_name', 'Unknown')}\n")
            f.write(f"Comments: {r.get('comments', '')}\n")
            f.write("-" * 20 + "\n")
        f.write("\n" + "=" * 40 + "\n\n")

def main():
    input_dir = Path('exports')
    out_dir = Path('extracted_cvs')
    out_dir.mkdir(parents=True, exist_ok=True)
    
    print(f"Downloading PDFs, extracting text, and writing to {out_dir}...")
    
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
                cv_link = row.get('cvLink')
                related_reviews = reviews_map.get(rid, [])
                domain_val = row.get('profile') or row.get('Profile') or row.get('profiles') or 'Unknown'
                name = row.get('name') or f"candidate_{rid}"
                
                if status == 'false':
                    continue
                    
                print(f"Downloading CV for {name} ({cv_link})")
                pdf_text = extract_text_from_pdf_url(cv_link)
                
                if pdf_text:
                    write_to_domain_file(out_dir, domain_val, name, pdf_text, related_reviews)
                else:
                    print(f"Skipping {name} - PDF not accessible or invalid.")
                
                time.sleep(0.5) # Slight delay to avoid drive limits
                
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
            cv_link = str(row.get('Link to CV (with access)', ''))
            
            related_reviews = [{'comments': review_text, 'reviewer_name': reviewer_name}]
            
            print(f"Downloading CV for {name} ({cv_link})")
            pdf_text = extract_text_from_pdf_url(cv_link)
            
            if pdf_text:
                write_to_domain_file(out_dir, profile, name, pdf_text, related_reviews)
            else:
                print(f"Skipping {name} - PDF not accessible or invalid.")
                
            time.sleep(0.5)

    file_2024 = input_dir / 'CV Review Drive 2024-25 - Reviews.xlsx'
    if file_2024.exists():
        print("Processing 2024 XLSX...")
        df = pd.read_excel(file_2024).dropna(subset=['Name', 'Reviews'])
        for _, row in df.iterrows():
            name = str(row['Name']).strip()
            profile = str(row.get('Profile', '')).strip()
            review_text = str(row['Reviews']).strip()
            reviewer_name = str(row.get('Reviewer Name', '')).strip()
            cv_link = str(row.get('Google Drive Link for the CV:', ''))
            
            related_reviews = [{'comments': review_text, 'reviewer_name': reviewer_name}]
            
            print(f"Downloading CV for {name} ({cv_link})")
            pdf_text = extract_text_from_pdf_url(cv_link)
            
            if pdf_text:
                write_to_domain_file(out_dir, profile, name, pdf_text, related_reviews)
            else:
                print(f"Skipping {name} - PDF not accessible or invalid.")
                
            time.sleep(0.5)
            
    print("Process complete! Check the extracted_cvs/ folder.")

if __name__ == '__main__':
    main()
