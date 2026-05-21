"""
Full scrape of abituri.ge:
  - All 56 universities (name, type, city, website, logo)
  - All faculties/programs per university (name, degree, tuition, grant score, field)
Saves: data_raw/abituri_universities.json, data_raw/abituri_programs.json
"""
import urllib.request, re, sys, json, time, os
sys.stdout.reconfigure(encoding="utf-8")

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(BASE, "data_raw")
os.makedirs(RAW, exist_ok=True)

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0",
    "Accept-Language": "ka,en;q=0.9",
}

def fetch(url):
    req = urllib.request.Request(url, headers=HEADERS)
    return urllib.request.urlopen(req, timeout=20).read().decode("utf-8", errors="ignore")

# ---- Step 1: Get all university slugs and names ----
html = fetch("https://abituri.ge/universities")
uni_slugs = list(dict.fromkeys(re.findall(
    r'href="https://abituri\.ge/universities/([^"]+)"', html
)))
print(f"University slugs: {len(uni_slugs)}")

universities = []
all_programs = []

for i, slug in enumerate(uni_slugs):
    url = f"https://abituri.ge/universities/{slug}"
    try:
        html = fetch(url)
    except Exception as e:
        print(f"  ERROR {slug}: {e}")
        continue

    # University name from JSON-LD
    ld = re.search(r'<script type="application/ld\+json">(.*?)</script>', html, re.DOTALL)
    uni_name = ""
    uni_logo = ""
    uni_web = ""
    if ld:
        try:
            d = json.loads(ld.group(1))
            uni_name = d.get("name", "")
            uni_logo = d.get("logo", "")
            uni_web = d.get("url", "")
        except:
            pass

    # Fallback: title tag
    if not uni_name:
        t = re.search(r'<title>([^<]+)</title>', html)
        if t:
            uni_name = t.group(1).strip().split("|")[0].strip()

    # Type: SSIP = state, SHPS = private, AAIP = religious/NGO
    if "სსიპ" in uni_name or slug.startswith("ssip-"):
        uni_type = "state"
    elif any(x in uni_name for x in ["სსიპ", "სახელმწიფო"]) and "კერძო" not in uni_name:
        uni_type = "state"
    else:
        uni_type = "private"

    # Website from page
    website_m = re.search(r'href="(https?://(?!abituri\.ge)[^"]{5,80})"[^>]*>(?:ვებ|საიტი|website|visit)', html, re.I)
    if not website_m:
        website_m = re.search(r'"sameAs"\s*:\s*"([^"]+)"', html)
    website = website_m.group(1) if website_m else f"https://abituri.ge/universities/{slug}"

    # City from name heuristic
    city = "თბილისი"
    for c in ["ბათუმი", "ქუთაისი", "გორი", "ახალციხე", "თელავი", "ზუგდიდი", "ახალქალაქი"]:
        if c.lower() in uni_name.lower() or c.lower() in slug.lower() or f"q-{c[0].lower()}" in slug:
            city = c
            break
    if "batumi" in slug or "batum" in slug:
        city = "ბათუმი"
    elif "qutaisi" in slug or "kutaisi" in slug:
        city = "ქუთაისი"
    elif "gori" in slug:
        city = "გორი"
    elif "telavi" in slug:
        city = "თელავი"
    elif "zugdidi" in slug:
        city = "ზუგდიდი"
    elif "akhaltsikhe" in slug or "akhalqalaqi" in slug:
        city = "ახალციხე"

    # Faculty/program links
    prog_slugs = list(dict.fromkeys(re.findall(
        r'href="https://abituri\.ge/faculties/([^"]+)"', html
    )))

    universities.append({
        "slug": slug,
        "name_ka": uni_name,
        "name_en": slug.replace("-", " ").title(),
        "website": website,
        "logo_url": uni_logo or None,
        "type": uni_type,
        "city": city,
        "program_slugs": prog_slugs,
    })

    print(f"[{i+1:02d}/{len(uni_slugs)}] {uni_name[:60]} | {uni_type} | {city} | {len(prog_slugs)} progs")
    time.sleep(0.3)

# Save universities
with open(os.path.join(RAW, "abituri_universities.json"), "w", encoding="utf-8") as f:
    json.dump(universities, f, ensure_ascii=False, indent=2)
print(f"\n✅ Saved {len(universities)} universities")

# ---- Step 2: Fetch each program page ----
print("\n=== Fetching program pages ===")
all_prog_slugs = []
for u in universities:
    for ps in u["program_slugs"]:
        all_prog_slugs.append((u["slug"], ps))

# Deduplicate
seen = set()
unique_progs = []
for uni_slug, prog_slug in all_prog_slugs:
    if prog_slug not in seen:
        seen.add(prog_slug)
        unique_progs.append((uni_slug, prog_slug))

print(f"Unique programs to fetch: {len(unique_progs)}")

programs = []
for j, (uni_slug, prog_slug) in enumerate(unique_progs):
    url = f"https://abituri.ge/faculties/{prog_slug}"
    try:
        html = fetch(url)
    except Exception as e:
        print(f"  ERROR {prog_slug}: {e}")
        continue

    # JSON-LD for program
    ld = re.search(r'<script type="application/ld\+json">(.*?)</script>', html, re.DOTALL)
    prog_name = ""
    if ld:
        try:
            d = json.loads(ld.group(1))
            prog_name = d.get("name", "")
        except:
            pass

    # Title fallback
    if not prog_name:
        t = re.search(r'<title>([^<]+)</title>', html)
        if t:
            prog_name = t.group(1).strip().split("|")[0].strip()

    # Extract degree
    degree = "bachelor"
    if re.search(r'მაგისტრ|master', html, re.I):
        degree = "master"
    elif re.search(r'დოქტ|doctor', html, re.I):
        degree = "doctor"

    # Duration
    dur_m = re.search(r'(\d)\s*(?:წელი|year|years)', html, re.I)
    duration = int(dur_m.group(1)) if dur_m else 4

    # Tuition fee
    fee_m = re.search(r'(\d[\d\s,]{2,6})\s*(?:₾|ლარი|GEL)', html)
    tuition = None
    if fee_m:
        try:
            tuition = int(fee_m.group(1).replace(" ", "").replace(",", ""))
            if tuition < 500 or tuition > 50000:
                tuition = None
        except:
            tuition = None

    # Grant
    is_funded = bool(re.search(r'გრანტ|grant', html, re.I))

    # Grant score
    score_m = re.search(r'(?:საგრანტო\s*)?ბარიერი[:\s]*(\d{2,3})', html)
    grant_score = int(score_m.group(1)) if score_m else None

    # Faculty/field from page text (rough)
    field = "social_business_law"  # default
    text = html.lower()
    if any(x in text for x in ["informatic", "computer", "software", "it ", "programming", "კომპიუტ", "ინფორმ"]):
        field = "science"
    elif any(x in text for x in ["medic", "სამედიც", "pharma", "ფარმ", "health", "ჯანდ", "stomatolog", "სტომატ"]):
        field = "health"
    elif any(x in text for x in ["law", "სამართ", "legal", "jurisprudence"]):
        field = "social_business_law"
    elif any(x in text for x in ["engineer", "ინჟინ", "architect", "არქიტ", "construct", "მშენ", "mechanic", "მექ"]):
        field = "engineering"
    elif any(x in text for x in ["agron", "agricultur", "სასოფლ", "ვეტ", "forestry", "სატყ"]):
        field = "agriculture"
    elif any(x in text for x in ["pedagog", "teach", "განათლ", "education", "მასწავ"]):
        field = "education"
    elif any(x in text for x in ["art", "music", "ხელოვ", "musiq", "concert", "theatre", "kino", "კინო"]):
        field = "humanities"
    elif any(x in text for x in ["philolog", "history", "ისტორ", "philosoph", "ფილოს", "humanit", "ჰუმანი", "literature"]):
        field = "humanities"
    elif any(x in text for x in ["tourism", "ტურიზ", "hotel", "სასტ", "transport", "ავიაც", "navigation", "ნავ"]):
        field = "services"
    elif any(x in text for x in ["business", "ბიზნეს", "economics", "ეკონ", "finance", "ფინანს", "management", "marketing", "მარკეტ", "accounting", "სოციალ"]):
        field = "social_business_law"

    prog = {
        "slug": prog_slug,
        "university_slug": uni_slug,
        "name_ka": prog_name,
        "name_en": prog_slug.replace("-", " ").title(),
        "degree": degree,
        "duration_years": duration,
        "tuition_fee": tuition,
        "is_state_funded": is_funded,
        "grant_score_2025": grant_score,
        "field": field,
    }
    programs.append(prog)

    if (j + 1) % 20 == 0 or j < 5:
        print(f"  [{j+1}/{len(unique_progs)}] {prog_name[:50]} | {field} | {tuition}₾ | grant:{grant_score}")

    time.sleep(0.25)

with open(os.path.join(RAW, "abituri_programs.json"), "w", encoding="utf-8") as f:
    json.dump(programs, f, ensure_ascii=False, indent=2)

print(f"\n✅ Saved {len(programs)} programs")
print(f"Fields: { {p['field'] for p in programs} }")
