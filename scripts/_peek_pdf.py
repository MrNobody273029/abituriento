# -*- coding: utf-8 -*-
import pdfplumber, sys, re
sys.stdout.reconfigure(encoding='utf-8')

PDF = r"C:\Users\MSI-KATANA\Desktop\abituriento\data_raw\cnobari_2025.pdf"

with pdfplumber.open(PDF) as pdf:
    total = len(pdf.pages)
    print(f"Total pages: {total}")

    # peek pages 1,2,3,4,5 and 50,51,100
    for pn in [1, 2, 3, 4, 5, 10, 50, 100]:
        if pn > total:
            continue
        page = pdf.pages[pn - 1]
        text = page.extract_text() or ""
        print(f"\n{'='*60}")
        print(f"PAGE {pn}")
        print(text[:1200])

        # Also check if page has tables
        tables = page.extract_tables()
        if tables:
            print(f"  [Tables: {len(tables)}]")
            for t in tables[:1]:
                for row in t[:5]:
                    print("  ROW:", row)
