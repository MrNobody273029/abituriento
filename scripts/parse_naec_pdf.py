# -*- coding: utf-8 -*-
"""
Parse NAEC cnobari_2025.pdf (929 pages).
Extracts per program:
  - naec_code       (e.g. "0010101")
  - uni_code        (e.g. "001")
  - name_ka         (e.g. "ქართული ფილოლოგია")
  - qualification   (კვალიფიკაცია)
  - accredited      (bool)
  - language        (ქართული / ინგლისური / ...)
  - state_funded    (bool — "ფინანსდება" / "არ ფინანსდება")
  - credits         (int)
  - tuition_fee     (int, GEL/year)
  - seats_total     (int)
  - exams           (list of {name, coefficient, min_pct, priority, seats})

NOTE: Historical grant cutoff scores are NOT in this document.
      This is the 2025 pre-exam guide (ცნობარი). Official source: naec.ge

Output: data_structured/naec_programs_2025.json
"""
import sys, os, re, json
sys.stdout.reconfigure(encoding='utf-8')
import pdfplumber

PDF  = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                    "data_raw", "cnobari_2025.pdf")
OUT  = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                    "data_structured", "naec_programs_2025.json")

def clean(s):
    return re.sub(r'\s+', ' ', (s or '')).strip()

def parse_info_row(row):
    """
    Info table row:
    [accreditation, date, language, funding, credits, fee, seats]
    """
    if not row or len(row) < 7:
        return None
    return {
        "accredited":   "აკრედიტებული" in (row[0] or ""),
        "accr_until":   clean(row[1]),
        "language":     clean(row[2]),
        "state_funded": "ფინანსდება" in (row[3] or "") and "არ" not in (row[3] or ""),
        "credits":      int(row[4]) if str(row[4] or "").strip().isdigit() else None,
        "tuition_fee":  int(row[5]) if str(row[5] or "").strip().isdigit() else None,
        "seats_total":  int(row[6]) if str(row[6] or "").strip().isdigit() else None,
    }

def parse_exam_row(row):
    """
    Exam table row:
    [exam_name, coefficient, min_threshold_pct, priority, seats]
    """
    if not row or not clean(row[0]):
        return None
    name = clean(row[0])
    if name in ("გამოცდა", ""):
        return None
    coef_raw = clean(row[1] or "")
    try:   coef = float(coef_raw)
    except Exception: coef = None
    min_pct_raw = clean(row[2] or "")
    min_pct_m = re.search(r'(\d+)', min_pct_raw)
    min_pct = int(min_pct_m.group(1)) if min_pct_m else None
    prio_raw = clean(row[3] or "") if len(row) > 3 else ""
    try:   prio = int(prio_raw)
    except Exception: prio = None
    seats_raw = clean(row[4] or "") if len(row) > 4 else ""
    try:   seats = int(seats_raw)
    except Exception: seats = None
    return {"name": name, "coefficient": coef, "min_pct": min_pct,
            "priority": prio, "seats": seats}

# Patterns
RE_PROG_CODE = re.compile(r'^(\d{7})\s+(.+)$')          # e.g. "0010101 ქართული ფილოლოგია"
RE_UNI_FOOTER = re.compile(r'^(\d{3})\s+.{10,}')        # e.g. "001 სსიპ - ..."
RE_QUAL = re.compile(r'კვალიფიკაცია:\s*(.+)')

programs = []
current_uni_code = None

print(f"Opening {PDF}")
with pdfplumber.open(PDF) as pdf:
    total = len(pdf.pages)
    print(f"Total pages: {total}")

    for i, page in enumerate(pdf.pages):
        pn = i + 1

        # Detect current university from footer
        text = page.extract_text() or ""
        lines = [l.strip() for l in text.split('\n') if l.strip()]

        # Footer line: "001 სსიპ - ..." at the bottom
        for line in reversed(lines[-4:]):
            m = RE_UNI_FOOTER.match(line)
            if m:
                current_uni_code = m.group(1)
                break

        # Check if page has a program code as first content line
        prog_code = None
        prog_name = None
        for line in lines[:5]:
            m = RE_PROG_CODE.match(line)
            if m and len(m.group(1)) == 7:
                prog_code = m.group(1)
                prog_name = clean(m.group(2))
                break

        if not prog_code:
            continue

        # Qualification
        qual = ""
        for line in lines:
            m = RE_QUAL.search(line)
            if m:
                qual = clean(m.group(1))
                break

        # Tables
        tables = page.extract_tables()
        info_data = None
        exams = []

        for table in tables:
            if not table:
                continue
            # Info table: header row has "აკრედიტაცია"
            if any("აკრედიტაცია" in (c or "") for c in (table[0] or [])):
                for row in table[1:]:
                    parsed = parse_info_row(row)
                    if parsed:
                        info_data = parsed
                        break
                continue
            # Exam table: header row has "გამოცდა"
            if any("გამოცდა" in (c or "") for c in (table[0] or [])):
                for row in table[1:]:
                    parsed = parse_exam_row(row)
                    if parsed:
                        exams.append(parsed)

        uni_code = prog_code[:3]  # first 3 digits = uni code
        if current_uni_code:
            uni_code = current_uni_code

        prog = {
            "naec_code":     prog_code,
            "uni_code":      uni_code,
            "name_ka":       prog_name,
            "qualification": qual,
            "exams":         exams,
        }
        if info_data:
            prog.update(info_data)
        else:
            prog.update({"accredited": None, "language": None,
                         "state_funded": None, "credits": None,
                         "tuition_fee": None, "seats_total": None})

        programs.append(prog)

        if pn % 100 == 0 or pn <= 40:
            print(f"  p{pn:4d} | {prog_code} | {uni_code} | {prog_name[:45]} | "
                  f"seats={prog.get('seats_total')} fee={prog.get('tuition_fee')}")

# Save
os.makedirs(os.path.dirname(OUT), exist_ok=True)
with open(OUT, 'w', encoding='utf-8') as f:
    json.dump(programs, f, ensure_ascii=False, indent=2)

print(f"\n✅ Parsed {len(programs)} programs → {OUT}")

# Summary
funded   = sum(1 for p in programs if p.get("state_funded"))
accred   = sum(1 for p in programs if p.get("accredited"))
no_seats = sum(1 for p in programs if not p.get("seats_total"))
print(f"   State funded:   {funded}")
print(f"   Accredited:     {accred}")
print(f"   Missing seats:  {no_seats}")

unis = {}
for p in programs:
    unis.setdefault(p["uni_code"], 0)
    unis[p["uni_code"]] += 1
print(f"   Unique uni codes: {len(unis)}")
print(f"   Top unis: {sorted(unis.items(), key=lambda x: -x[1])[:5]}")
