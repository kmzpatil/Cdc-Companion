import re
import sys
import io
import requests

def get_file_id(url):
    # Match docs.google.com/document/d/<ID>
    match = re.search(r'/document/d/([a-zA-Z0-9-_]+)', url)
    if match:
        return match.group(1), 'document'
    # Match drive.google.com/file/d/<ID>
    match = re.search(r'/file/d/([a-zA-Z0-9-_]+)', url)
    if match:
        return match.group(1), 'file'
    # Match id=<ID> query param
    match = re.search(r'[?&]id=([a-zA-Z0-9-_]+)', url)
    if match:
        return match.group(1), 'file'
    return None, None

def extract_from_google_doc(file_id):
    export_url = f"https://docs.google.com/document/d/{file_id}/export?format=txt"
    response = requests.get(export_url, timeout=15)
    if response.status_code == 200:
        return response.text
    else:
        raise Exception(f"Failed to export Google Doc, status code: {response.status_code}")

def extract_from_pdf_stream(pdf_bytes):
    # Try importing pypdf or PyPDF2 dynamically
    try:
        from pypdf import PdfReader
    except ImportError:
        try:
            from PyPDF2 import PdfReader
        except ImportError:
            raise Exception("Neither 'pypdf' nor 'PyPDF2' is installed. Please install one of them.")
    
    reader = PdfReader(io.BytesIO(pdf_bytes))
    text = ""
    for page in reader.pages:
        extracted = page.extract_text()
        if extracted:
            text += extracted + "\n"
    return text

def extract_from_google_drive_file(file_id):
    download_url = f"https://drive.google.com/uc?export=download&id={file_id}"
    response = requests.get(download_url, timeout=20)
    if response.status_code != 200:
        raise Exception(f"Failed to download file from Google Drive, status code: {response.status_code}")
    
    content_type = response.headers.get('content-type', '').lower()
    
    # If the response is HTML, it might be a Google Doc edit page or confirmation page
    if 'text/html' in content_type:
        # Let's try to export it as a Google Doc plain text anyway
        try:
            return extract_from_google_doc(file_id)
        except Exception:
            raise Exception("Cannot download file content. Ensure sharing is set to 'Anyone with the link can view'.")
            
    # Otherwise treat it as PDF or text
    if 'pdf' in content_type or response.content.startswith(b'%PDF'):
        return extract_from_pdf_stream(response.content)
    else:
        try:
            return response.content.decode('utf-8')
        except UnicodeDecodeError:
            # Fallback to pdf extraction if content header was wrong
            return extract_from_pdf_stream(response.content)

def main():
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except AttributeError:
        pass # fallback for older python versions
        
    if len(sys.argv) < 2:
        print("Usage: python extract_text.py <google_drive_url>")
        sys.exit(1)
        
    url = sys.argv[1]
    file_id, link_type = get_file_id(url)
    
    if not file_id:
        print("Error: Could not extract a valid file ID from the provided URL.")
        sys.exit(1)
        
    try:
        if link_type == 'document':
            text = extract_from_google_doc(file_id)
        else:
            text = extract_from_google_drive_file(file_id)
            
        print(text)
    except Exception as e:
        print(f"Error extracting text: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
