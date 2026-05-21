# -*- coding: utf-8 -*-
"""
Parse GeoStat ISCO-08 wages (2021) → estimate 2024 → save structured JSON.
Scaling: 2021 national avg 1,304.52 GEL → 2024 avg 1,970.77 GEL → factor 1.511
"""
import openpyxl, json, sys
sys.stdout.reconfigure(encoding='utf-8')

SCALE_2024 = 1970.77 / 1304.5204990998814  # ≈ 1.511

# ISCO-08 2-digit groups that matter for university graduates
# isco_code → (name_ka, field, relevant)
ISCO_META = {
    "11": ("გენ. დირექტ. / ხელმძღვ.", "social_business_law", True),
    "12": ("კომ./ადმ. მენეჯერები",    "social_business_law", True),
    "13": ("წარმ./სერვ. მენეჯ.",       "engineering",          False),
    "14": ("სტუმ./საც./სხვ. მენ.",     "services",             False),
    "21": ("მეცნ. და ინჟ. სპეც.",      "engineering",          True),
    "22": ("ჯანდ. სპეც. (ექიმები)",    "health",               True),
    "23": ("პედაგ. სპეც. (მასწ.)",     "education",            True),
    "24": ("ბიზნეს-ადმ. სპეც.",        "social_business_law",  True),
    "25": ("IT სპეციალისტები",          "science",              True),
    "26": ("იურ./სოც./კულ. სპეც.",     "social_business_law",  True),
    "31": ("ტექ./ინჟ. ასოც. სპეც.",    "engineering",          True),
    "32": ("ჯანდ. ასოც. (ექთ.)",       "health",               True),
    "33": ("ბიზნ./ადმ. ასოც. (ბუღ.)", "social_business_law",  True),
    "34": ("სოც./კულ. ასოც. სპ.",      "humanities",           False),
    "35": ("IT ტექნიკოსები",           "science",              True),
    "41": ("კლერკი / მდივანი",         "services",             False),
    "52": ("გაყ./მარ. სპეც.",          "services",             False),
    "61": ("სოფ. მეურნ. სპეც.",        "agriculture",          True),
    "71": ("სამშ. სამ. სპეც.",         "engineering",          True),
    "72": ("ლით./მექ. სამ. სპ.",       "engineering",          False),
    "74": ("ელ./ელექტ. სამ. სპ.",      "engineering",          True),
}

wb = openpyxl.load_workbook('data_raw/geostat_wages_isco.xlsx', read_only=True, data_only=True)
ws = wb['2021']
rows = [r for r in ws.iter_rows(values_only=True) if r[0] is not None and r[2] is not None]

professions = []
for row in rows:
    code = str(row[0]).strip()
    name_en = str(row[1]).strip()
    total = row[2]
    try: female = float(row[3]) if row[3] else None
    except: female = None
    try: male = float(row[4]) if row[4] else None
    except: male = None

    if code == 'None' or not name_en or name_en in ('Occupation', 'Total'): continue
    try: total = float(row[2])
    except: continue

    meta = ISCO_META.get(code)
    if not meta: continue

    name_ka, field, relevant = meta

    professions.append({
        "isco_code":      code,
        "name_en":        name_en,
        "name_ka":        name_ka,
        "field":          field,
        "salary_2021":    round(total, 1),
        "salary_2024est": round(total * SCALE_2024),
        "salary_female_2021": round(female, 1) if female else None,
        "salary_male_2021":   round(male, 1)   if male   else None,
        "relevant":       relevant,
        "source":         "GeoStat ISCO-08 2021; 2024 est. via national avg scale ×1.511",
    })

out = {
    "year_data": 2021,
    "year_est":  2024,
    "national_avg_2021": 1304.52,
    "national_avg_2024": 1970.77,
    "scale_factor": round(SCALE_2024, 4),
    "source": "GeoStat — სსიპ სტატისტიკის ეროვნული სამსახური",
    "source_url": "https://geostat.ge/media/49168/11--wages-by-occupation-T.xlsx",
    "professions": professions,
}

with open('data_structured/isco_wages_2024.json', 'w', encoding='utf-8') as f:
    json.dump(out, f, ensure_ascii=False, indent=2)

print(f"Saved {len(professions)} profession records")
for p in sorted(professions, key=lambda x: -x['salary_2024est']):
    print(f"  [{p['isco_code']}] {p['name_ka']:30s} {p['salary_2024est']:6,} ₾/თვ  ({p['field']})")
