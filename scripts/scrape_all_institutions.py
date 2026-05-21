# -*- coding: utf-8 -*-
"""
Full scrape of abituri.ge:
  - Universities (/universities)
  - Colleges      (/colleges)
  - Vocational    (/vocational-schools or similar)
  - All faculties/programs per institution
Output:
  data_raw/all_institutions.json   — every institution
  data_raw/all_programs.json       — every program/faculty
"""
import sys, os, re, json, time
import urllib.request, urllib.error

sys.stdout.reconfigure(encoding="utf-8")

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW  = os.path.join(BASE, "data_raw")
os.makedirs(RAW, exist_ok=True)

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "ka,en;q=0.9",
    "Accept-Encoding": "identity",
    "Connection": "keep-alive",
}

def fetch(url, retries=3):
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            resp = urllib.request.urlopen(req, timeout=25)
            return resp.read().decode("utf-8", errors="ignore")
        except urllib.error.HTTPError as e:
            print(f"  HTTP {e.code} for {url}")
            if e.code in (404, 410):
                return ""
            time.sleep(2)
        except Exception as e:
            print(f"  ERROR {url}: {e}")
            time.sleep(2)
    return ""

def strip_tags(html):
    return re.sub(r'<[^>]+>', ' ', html)

def clean(s):
    return re.sub(r'\s+', ' ', s).strip()

# ── Helper: extract all institution slugs from a listing page ──────────────────

def get_slugs_from_listing(url_path, link_pattern):
    """Fetch a listing page and extract all slugs matching link_pattern."""
    html = fetch(f"https://abituri.ge{url_path}")
    if not html:
        return []
    slugs = list(dict.fromkeys(re.findall(link_pattern, html)))
    return slugs

# ── Detect institution type ────────────────────────────────────────────────────

def detect_type(name_ka, slug):
    low = (name_ka + " " + slug).lower()
    if any(x in low for x in ["სსიპ", "sakhelmtsipo", "sax.", "სახელმწიფო", "saxelmwipo"]):
        return "state"
    if any(x in low for x in ["კერძო", "kerzo"]):
        return "private"
    # default by category
    return "private"

# ── Detect city ────────────────────────────────────────────────────────────────

CITIES = {
    "batumi": "ბათუმი", "batum": "ბათუმი", "ბათუმ": "ბათუმი",
    "kutaisi": "ქუთაისი", "qutaisi": "ქუთაისი", "ქუთაის": "ქუთაისი",
    "gori": "გორი", "გორ": "გორი",
    "telavi": "თელავი", "თელავ": "თელავი",
    "zugdidi": "ზუგდიდი", "zugdid": "ზუგდიდი", "ზუგდიდ": "ზუგდიდი",
    "akhaltsikhe": "ახალციხე", "axalcixe": "ახალციხე", "ახალციხ": "ახალციხე",
    "akhalkalaki": "ახალქალაქი", "axalqalaq": "ახალქალაქი",
    "poti": "ფოთი", "ფოთ": "ფოთი",
    "rustavi": "რუსთავი", "rusthav": "რუსთავი", "რუსთავ": "რუსთავი",
    "ozurgeti": "ოზურგეთი", "ozurgeth": "ოზურგეთი",
    "ambrolauri": "ამბროლაური",
    "mestia": "მესტია",
    "senaki": "სენაკი",
    "samtredia": "სამტრედია",
    "chiatura": "ჭიათურა",
    "tskaltubo": "წყალტუბო",
    "khashuri": "ხაშური",
    "gurjaani": "გურჯაანი",
    "sagarejo": "საგარეჯო",
    "tianeti": "თიანეთი",
    "mtskheta": "მცხეთა",
    "tbilisi": "თბილისი", "tbilis": "თბილისი",
}

def detect_city(name_ka, slug, html=""):
    combined = (name_ka + " " + slug + " " + html[:3000]).lower()
    for key, city in CITIES.items():
        if key in combined:
            return city
    return "თბილისი"

# ── Extract institution info from its page ─────────────────────────────────────

def parse_institution_page(html, slug, category):
    # Name from JSON-LD
    name_ka, logo_url, website = "", "", ""
    ld_match = re.search(r'<script[^>]*type="application/ld\+json"[^>]*>(.*?)</script>', html, re.DOTALL | re.I)
    if ld_match:
        try:
            d = json.loads(ld_match.group(1))
            name_ka  = d.get("name", "")
            logo_url = d.get("logo", "")
            website  = d.get("url", "") or d.get("sameAs", "")
            if isinstance(website, list):
                website = website[0] if website else ""
        except Exception:
            pass

    # Fallback: h1
    if not name_ka:
        h1 = re.search(r'<h1[^>]*>(.*?)</h1>', html, re.DOTALL | re.I)
        if h1:
            name_ka = clean(strip_tags(h1.group(1)))

    # Fallback: title
    if not name_ka:
        t = re.search(r'<title>([^<]+)</title>', html, re.I)
        if t:
            name_ka = t.group(1).strip().split("|")[0].strip()

    # Website from external links
    if not website:
        m = re.search(
            r'href="(https?://(?!abituri\.ge)(?!www\.facebook)(?!www\.instagram)[^"]{6,80})"',
            html
        )
        if m:
            website = m.group(1)
    if not website:
        website = f"https://abituri.ge/{category}/{slug}"

    # Description (og:description or first paragraph)
    desc = ""
    og_desc = re.search(r'<meta[^>]+name="description"[^>]+content="([^"]+)"', html, re.I)
    if og_desc:
        desc = clean(og_desc.group(1))

    # Accreditation / authorization status
    accredited = bool(re.search(r'აკრედიტ|accredit', html, re.I))
    authorized = bool(re.search(r'ავტორიზ|authoriz', html, re.I))

    # Email, phone
    email_m = re.search(r'[\w.\-]+@[\w.\-]+\.[a-z]{2,6}', html)
    email = email_m.group(0) if email_m else None

    phone_m = re.search(r'(?:\+995|0)\s*\d[\d\s\-\(\)]{6,15}', html)
    phone = clean(phone_m.group(0)) if phone_m else None

    # Address
    address_m = re.search(r'(?:მისამართი|address)[:\s]*([^\n<]{5,100})', html, re.I)
    address = clean(address_m.group(1)) if address_m else None

    # Faculty/program slugs
    prog_slugs = list(dict.fromkeys(re.findall(
        r'href="https://abituri\.ge/faculties/([^"?#]+)"', html
    )))

    inst_type = detect_type(name_ka, slug)
    city = detect_city(name_ka, slug, html)

    return {
        "slug": slug,
        "category": category,          # "university" | "college" | "vocational" | etc.
        "name_ka": name_ka,
        "name_en": "",                  # filled later if available
        "website": website,
        "logo_url": logo_url or None,
        "type": inst_type,
        "city": city,
        "description_ka": desc or None,
        "email": email,
        "phone": phone,
        "address": address,
        "accredited": accredited,
        "authorized": authorized,
        "program_slugs": prog_slugs,
    }

# ── Extract field from program page ───────────────────────────────────────────

FIELD_KEYWORDS = {
    "science": [
        "informatic", "computer", "software", "it ", " it,", "programming",
        "კომპიუტ", "ინფორმ", "მათემ", "ფიზიკ", "ქიმი", "ბიოლ", "math",
        "physic", "chemi", "biolog", "data science", "cyber", "network", "ქსელ",
    ],
    "health": [
        "medic", "სამედიც", "pharma", "ფარმ", "health", "ჯანდ",
        "stomatolog", "სტომატ", "nurse", "მედდ", "rehabilitation", "რეაბილ",
        "public health", "ვეტ", "veterinar",
    ],
    "engineering": [
        "engineer", "ინჟინ", "architect", "არქიტ", "construct", "მშენ",
        "mechanic", "მექ", "electr", "ელექტ", "civil", "სამოქ", "transport",
        "მანქ", "energy", "ენერგ", "mining", "სამთ", "chemical technol", "ქიმიური ტექ",
    ],
    "agriculture": [
        "agron", "agricultur", "სასოფლ", "forestry", "სატყ",
        "food engineer", "სასურს", "wine", "ღვინ", "land", "მიწ",
    ],
    "education": [
        "pedagog", "teach", "განათლ", "education", "მასწავ", "preschool",
        "სკოლამდ", "სკოლ", "school", "სასწავ",
    ],
    "humanities": [
        "philolog", "history", "ისტორ", "philosoph", "ფილოს",
        "humanit", "ჰუმანი", "literature", "literature", "art", "music",
        "ხელოვ", "კულტ", "culture", "theatre", "kino", "კინო", "ჟურნ",
        "journalism", "ლინგვ", "linguist", "religion", "რელიგ", "archaeology",
        "archeolog", "არქეოლ",
    ],
    "services": [
        "tourism", "ტურიზ", "hotel", "სასტ", "navigation", "ნავ",
        "aviation", "ავიაც", "sport", "სპორტ", "physical", "ფიზიკ",
        "hospitality", "სამზარ", "culinary", "design", "დიზაინ",
    ],
    "social_business_law": [
        "law", "სამართ", "legal", "jurisprudence", "business", "ბიზნეს",
        "economics", "ეკონ", "finance", "ფინანს", "management", "marketing",
        "მარკეტ", "accounting", "სოციალ", "political", "პოლიტ",
        "international", "საერთ", "psychology", "ფსიქ", "sociology", "სოციოლ",
        "journalism", "ჟურნ", "public administr", "საჯარო", "diplomacy", "დიპლ",
    ],
}

def detect_field(html, name):
    text = (html + " " + name).lower()
    scores = {field: 0 for field in FIELD_KEYWORDS}
    for field, keywords in FIELD_KEYWORDS.items():
        for kw in keywords:
            if kw in text:
                scores[field] += 1
    best = max(scores, key=lambda f: scores[f])
    return best if scores[best] > 0 else "social_business_law"

# ── Parse a program/faculty page ──────────────────────────────────────────────

def parse_program_page(html, prog_slug, uni_slug, category):
    name_ka = ""
    ld = re.search(r'<script[^>]*type="application/ld\+json"[^>]*>(.*?)</script>', html, re.DOTALL | re.I)
    if ld:
        try:
            d = json.loads(ld.group(1))
            name_ka = d.get("name", "")
        except Exception:
            pass
    if not name_ka:
        h1 = re.search(r'<h1[^>]*>(.*?)</h1>', html, re.DOTALL | re.I)
        if h1:
            name_ka = clean(strip_tags(h1.group(1)))
    if not name_ka:
        t = re.search(r'<title>([^<]+)</title>', html, re.I)
        if t:
            name_ka = t.group(1).strip().split("|")[0].strip()

    # Degree
    degree = "bachelor"
    if re.search(r'მაგისტრ|master', html, re.I):
        degree = "master"
    elif re.search(r'დოქტ|doctor|phd', html, re.I):
        degree = "doctor"
    elif re.search(r'დიპლომირ|diplomat', html, re.I):
        degree = "specialist"

    # Duration
    dur_m = re.search(r'(\d)[,.]?5?\s*(?:წელი|year|წლ)', html, re.I)
    duration = int(dur_m.group(1)) if dur_m else (6 if degree == "doctor" else 4)

    # Tuition fee — try to find the most specific match
    tuition = None
    fee_patterns = [
        r'(?:სწავლის\s*)?(?:საფ?ასური|fee|ფასი)[^\d]{0,30}?(\d[\d\s,]{2,6})\s*(?:₾|ლარი|GEL)',
        r'(\d[\d\s,]{2,6})\s*(?:₾|ლარი|GEL)',
    ]
    for pat in fee_patterns:
        m = re.search(pat, html, re.I)
        if m:
            try:
                val = int(m.group(1).replace(" ", "").replace(",", ""))
                if 500 <= val <= 60000:
                    tuition = val
                    break
            except Exception:
                pass

    # State funded
    is_funded = bool(re.search(r'სახელმწიფო\s*დაფინ|გრანტ|grant|state\s*fund', html, re.I))

    # Grant score (barrier)
    score_m = re.search(
        r'(?:საგრანტო\s*)?(?:ბარიერი|ზღვარი|min[^a-z])[:\s]*(\d{2,3})',
        html, re.I
    )
    grant_score = int(score_m.group(1)) if score_m else None

    # Seats / places
    seats_m = re.search(r'(?:ადგილ|seat|place)[^\d]{0,20}?(\d{1,4})', html, re.I)
    seats = int(seats_m.group(1)) if seats_m else None

    # Faculty name (group within university)
    faculty_m = re.search(r'(?:ფაკულტეტი|faculty|school|სკოლა)[:\s]*([^\n<]{5,80})', html, re.I)
    faculty_ka = clean(faculty_m.group(0)) if faculty_m else ""

    field = detect_field(html, name_ka)

    return {
        "slug": prog_slug,
        "institution_slug": uni_slug,
        "institution_category": category,
        "name_ka": name_ka,
        "name_en": prog_slug.replace("-", " ").title(),
        "faculty_ka": faculty_ka,
        "degree": degree,
        "duration_years": duration,
        "tuition_fee": tuition,
        "is_state_funded": is_funded,
        "grant_score_2025": grant_score,
        "seats": seats,
        "field": field,
    }

# ══════════════════════════════════════════════════════════════════════════════
# MAIN
# ══════════════════════════════════════════════════════════════════════════════

# Institution listing pages to crawl
LISTING_PAGES = [
    ("/universities",        r'href="https://abituri\.ge/universities/([^"?#]+)"',        "university"),
    ("/colleges",            r'href="https://abituri\.ge/colleges/([^"?#]+)"',             "college"),
    ("/vocational-schools",  r'href="https://abituri\.ge/vocational-schools/([^"?#]+)"',   "vocational"),
    ("/georgian-language-schools", r'href="https://abituri\.ge/georgian-language-schools/([^"?#]+)"', "language_school"),
]

institutions = []
all_programs = []
seen_inst   = set()
seen_prog   = set()

for path, pattern, category in LISTING_PAGES:
    print(f"\n{'='*60}")
    print(f"Crawling: {path}  ({category})")
    slugs = get_slugs_from_listing(path, pattern)
    print(f"  Found {len(slugs)} slugs")
    if not slugs:
        # Try pagination
        for page in range(1, 10):
            paged_slugs = get_slugs_from_listing(f"{path}?page={page}", pattern)
            if not paged_slugs:
                break
            for s in paged_slugs:
                if s not in slugs:
                    slugs.append(s)
        print(f"  After pagination: {len(slugs)} slugs")

    for i, slug in enumerate(slugs):
        if slug in seen_inst:
            continue
        seen_inst.add(slug)

        url = f"https://abituri.ge/{category.replace('_','-')}s/{slug}"
        # Map category to URL segment
        cat_url_map = {
            "university":    "universities",
            "college":       "colleges",
            "vocational":    "vocational-schools",
            "language_school": "georgian-language-schools",
        }
        url = f"https://abituri.ge/{cat_url_map.get(category, category)}/{slug}"

        html = fetch(url)
        if not html:
            continue

        inst = parse_institution_page(html, slug, category)
        institutions.append(inst)

        prog_count = len(inst["program_slugs"])
        print(f"  [{i+1:03d}/{len(slugs)}] {inst['name_ka'][:55]} | {inst['type']} | {inst['city']} | {prog_count} progs")
        time.sleep(0.4)

# ── Save institutions ──────────────────────────────────────────────────────────
out_inst = os.path.join(RAW, "all_institutions.json")
with open(out_inst, "w", encoding="utf-8") as f:
    json.dump(institutions, f, ensure_ascii=False, indent=2)
print(f"\n✅ Saved {len(institutions)} institutions → {out_inst}")

# ── Fetch all programs ─────────────────────────────────────────────────────────
print("\n" + "="*60)
print("Fetching all program pages...")

all_prog_jobs = []
for inst in institutions:
    for ps in inst["program_slugs"]:
        if ps not in seen_prog:
            seen_prog.add(ps)
            all_prog_jobs.append((inst["slug"], inst["category"], ps))

print(f"Unique programs to fetch: {len(all_prog_jobs)}")

for j, (uni_slug, category, prog_slug) in enumerate(all_prog_jobs):
    url = f"https://abituri.ge/faculties/{prog_slug}"
    html = fetch(url)
    if not html:
        continue

    prog = parse_program_page(html, prog_slug, uni_slug, category)
    all_programs.append(prog)

    if (j + 1) % 50 == 0 or j < 5:
        print(f"  [{j+1}/{len(all_prog_jobs)}] {prog['name_ka'][:50]} | {prog['field']} | {prog['tuition_fee']}₾")

    time.sleep(0.3)

out_prog = os.path.join(RAW, "all_programs.json")
with open(out_prog, "w", encoding="utf-8") as f:
    json.dump(all_programs, f, ensure_ascii=False, indent=2)

print(f"\n✅ Saved {len(all_programs)} programs → {out_prog}")

# ── Summary ────────────────────────────────────────────────────────────────────
from collections import Counter
cats  = Counter(i["category"] for i in institutions)
types = Counter(i["type"] for i in institutions)
cities = Counter(i["city"] for i in institutions)

print("\n── Summary ────────────────────────────────────")
print("By category:", dict(cats))
print("By type:    ", dict(types))
print("Top cities: ", cities.most_common(8))
print("Total progs:", len(all_programs))
