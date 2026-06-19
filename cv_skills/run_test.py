import os
import sys
from pathlib import Path
import pandas as pd
import cv_pipeline

def setup_test_data():
    base = Path('test_exports')
    base.mkdir(exist_ok=True)
    
    # reviewees
    with open(base / 'reviewees.csv', 'w', encoding='utf-8') as f:
        f.write('id,name,profiles,status\n')
        f.write('1,Test User 1,Software,True\n')
        f.write('2,Test User 2,Data,False\n')
        f.write('3,Test User 3,Core,True\n')
        
    # reviews
    with open(base / 'reviews.csv', 'w', encoding='utf-8') as f:
        f.write('revieweeId,reviewerId,comments\n')
        f.write('1,101,Great formatting but could add more impact metrics to your projects.\n')
        f.write('2,102,Could not access CV. Please fix permissions.\n')
        f.write('3,103,Solid core experience. Needs better action verbs in bullet points.\n')
        
    # reviewers
    with open(base / 'reviewers.csv', 'w', encoding='utf-8') as f:
        f.write('id,name,profiles\n')
        f.write('101,Rev 1,Software\n')
        f.write('102,Rev 2,Data\n')
        f.write('103,Rev 3,Core\n')
        
    print("Test data setup complete.")

if __name__ == '__main__':
    setup_test_data()
    print("Running CV pipeline on test data...")
    cv_pipeline.main(input_dir=Path('test_exports'), out_dir=Path('test_outputs'))
    print("Pipeline run complete.")
