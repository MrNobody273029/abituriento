# -*- coding: utf-8 -*-
import pdfplumber, sys, re
sys.stdout.reconfigure(encoding='utf-8')

PDF = r"C:\Users\MSI-KATANA\Desktop\abituriento\data_raw\cnobari_2025.pdf"

with pdfplumber.open(PDF) as pdf:
    # Pages 36-42: TSU programs begin
    for pn in [36, 37, 38, 39, 40, 41, 42]:
        page = pdf.pages[pn - 1]
        text = page.extract_text() or ""
        print(f"\n{'='*60}\nPAGE {pn}")
        print(text[:2000])
        tables = page.extract_tables()
        if tables:
            print(f"  [Tables: {len(tables)}]")
            for t in tables:
                for row in t:
                    if any(c for c in row if c):
                        print("  |", " | ".join(str(c or '').strip() for c in row))
