# -*- coding: utf-8 -*-
"""
Parse NAEC cnobari_2025.pdf → extract per-program exam subjects.
Output: data_structured/naec_exams_2025.json

Structure per program:
  naec_code, name_ka, uni_id, uni_name, exams: [{subject, coeff, min_pct, is_required}]
"""
import pdfplumber, re, json, sys
sys.stdout.reconfigure(encoding='utf-8')

NAEC_RE     = re.compile(r'^(\d{7})\s+(.+)$')
EXAM_HEADER = 'გამოცდა კოეფიციენტი'
CHOICE_MARK = 'ერთ-ერთი შემდეგი'
# "subject_name COEFF XX%-ზე მეტი PRIORITY [seats]"
EXAM_ROW_RE = re.compile(
    r'^(.+?)\s+(\d+)\s+(\d+)%-ზე მეტი\s+(\d+)(?:\s+(\d+))?$'
)
UNI_FOOTER_RE = re.compile(
    r'^(\d{3})\s+(სსიპ|შპს|ა\(ა\)იპ|სახ\.|სსს).+\d{2}\.\d{2}\.\d{4}'
)

programs = []
current   = None
in_exams  = False
is_choice = False
cur_uni_id   = None
cur_uni_name = None

with pdfplumber.open('data_raw/cnobari_2025.pdf') as pdf:
    print(f'Total pages: {len(pdf.pages)}')

    for page_idx, page in enumerate(pdf.pages):
        txt = page.extract_text()
        if not txt:
            continue

        lines = [l.strip() for l in txt.split('\n') if l.strip()]

        for line in lines:
            # ---- new program ----
            m = NAEC_RE.match(line)
            if m:
                if current and current['exams']:
                    current['uni_id']   = cur_uni_id
                    current['uni_name'] = cur_uni_name
                    programs.append(current)
                current   = {'naec_code': m.group(1), 'name_ka': m.group(2), 'exams': []}
                in_exams  = False
                is_choice = False
                continue

            # ---- university footer line ----
            if UNI_FOOTER_RE.match(line):
                cur_uni_id = line[:3].strip()
                # extract name between the code and the date
                name_part = re.sub(r'\d{2}\.\d{2}\.\d{4}.*', '', line[3:]).strip()
                name_part = re.sub(r'^(სსიპ|შპს|ა\(ა\)იპ)\s*-?\s*', '', name_part).strip()
                cur_uni_name = name_part
                if current:
                    current['uni_id']   = cur_uni_id
                    current['uni_name'] = cur_uni_name
                continue

            # ---- exam table header ----
            if EXAM_HEADER in line:
                in_exams  = True
                is_choice = False
                continue

            if not in_exams or not current:
                continue

            # ---- choice-section marker ----
            if CHOICE_MARK in line:
                is_choice = True
                continue

            # ---- exam row ----
            em = EXAM_ROW_RE.match(line)
            if em:
                current['exams'].append({
                    'subject':     em.group(1).strip(),
                    'coeff':       int(em.group(2)),
                    'min_pct':     int(em.group(3)),
                    'priority':    int(em.group(4)),
                    'is_required': not is_choice,
                })

# flush last program
if current and current['exams']:
    current.setdefault('uni_id',   cur_uni_id)
    current.setdefault('uni_name', cur_uni_name)
    programs.append(current)

print(f'Parsed {len(programs)} programs')

# quick sanity check
for p in programs[:5]:
    print(f"  [{p['naec_code']}] {p['name_ka'][:40]}")
    for e in p['exams']:
        req = '✓' if e['is_required'] else '○'
        print(f"    {req} {e['subject'][:35]:35s} coeff={e['coeff']} min={e['min_pct']}%")

out = {
    'year': 2025,
    'source': 'NAEC — შეფასებისა და გამოცდების ეროვნული ცენტრი',
    'programs': programs,
}
with open('data_structured/naec_exams_2025.json', 'w', encoding='utf-8') as f:
    json.dump(out, f, ensure_ascii=False, indent=2)

print(f'\nSaved → data_structured/naec_exams_2025.json')
