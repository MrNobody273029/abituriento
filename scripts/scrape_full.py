# -*- coding: utf-8 -*-
"""
Scrapes ALL 116 institutions from abituri.ge (universities + colleges)
and ALL their programs/faculties.
Output:
  data_raw/institutions_full.json
  data_raw/programs_full.json
"""
import sys, os, re, json, time
import urllib.request, urllib.error

sys.stdout.reconfigure(encoding='utf-8')
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW  = os.path.join(BASE, 'data_raw')

HEADERS = {
    'User-Agent': (
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
        'AppleWebKit/537.36 (KHTML, like Gecko) '
        'Chrome/124.0.0.0 Safari/537.36'
    ),
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'ka,en;q=0.9',
    'Accept-Encoding': 'identity',
}

def fetch(url, retries=3):
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            return urllib.request.urlopen(req, timeout=25).read().decode('utf-8', errors='ignore')
        except urllib.error.HTTPError as e:
            if e.code in (404, 410):
                return ''
            time.sleep(1.5)
        except Exception:
            time.sleep(1.5)
    return ''

def clean(s):
    return re.sub(r'\s+', ' ', s or '').strip()

# ── Load slug list ─────────────────────────────────────────────────────────────
with open(os.path.join(RAW, 'all_slugs.json'), encoding='utf-8') as f:
    slug_data = json.load(f)

all_slugs  = slug_data['slugs']           # 116 unique slugs
slug_cats  = slug_data['categories']       # slug → 'university' | 'college'
print(f'Total institutions to scrape: {len(all_slugs)}')

# ── City detector ──────────────────────────────────────────────────────────────
CITY_MAP = {
    'batumi': 'ბათუმი', 'batum': 'ბათუმი', 'ბათუმ': 'ბათუმი',
    'kutaisi': 'ქუთაისი', 'qutaisi': 'ქუთაისი', 'ქუთაის': 'ქუთაისი',
    'gori': 'გორი', 'გორ': 'გორი',
    'telavi': 'თელავი', 'თელავ': 'თელავი',
    'zugdidi': 'ზუგდიდი', 'zugdid': 'ზუგდიდი', 'ზუგდიდ': 'ზუგდიდი',
    'akhaltsikhe': 'ახალციხე', 'akhalcixe': 'ახალციხე', 'ახალციხ': 'ახალციხე',
    'akhalkalaki': 'ახალქალაქი', 'axalqalaq': 'ახალქალაქი',
    'poti': 'ფოთი', 'ფოთ': 'ფოთი',
    'rustavi': 'რუსთავი', 'rustaveli': 'თბილისი',
    'ozurgeti': 'ოზურგეთი',
    'ambrolauri': 'ამბროლაური',
    'senaki': 'სენაკი',
    'samtredia': 'სამტრედია',
    'khashuri': 'ხაშური',
    'gurjaani': 'გურჯაანი',
    'marneuli': 'მარნეული', 'marneulis': 'მარნეული',
    'sagarejo': 'საგარეჯო',
    'mtskheta': 'მცხეთა',
    'kaspi': 'კასპი',
    'tyibuli': 'ტყიბული',
    'sachkhere': 'საჩხერე',
    'chiatura': 'ჭიათურა',
}

def detect_city(name_ka, slug, html=''):
    combined = (name_ka + ' ' + slug + ' ' + html[:2000]).lower()
    for key, city in CITY_MAP.items():
        if key in combined:
            return city
    # Check HTML for city mentions
    city_m = re.search(r'(?:ქ\.|ქალაქ)\s*([ა-ჿ]{4,15})', html)
    if city_m:
        return city_m.group(1)
    return 'თბილისი'

# ── Type detector ──────────────────────────────────────────────────────────────
def detect_type(name_ka, slug):
    combined = (name_ka + ' ' + slug).lower()
    if any(x in combined for x in ['სსიპ', 'ssip', 'სახელმწიფო', 'sakhelmts']):
        return 'state'
    if any(x in combined for x in ['შპს', 'shps', 'ა(ა)იპ', 'aaip', 'კერძო']):
        return 'private'
    return 'private'

# ── Field keywords ─────────────────────────────────────────────────────────────
FIELD_KW = {
    'science': ['informatic', 'computer', 'software', 'it ', 'programming', 'კომპიუტ',
                'ინფორმ', 'math', 'physic', 'chemi', 'biolog', 'data ', 'cyber', 'ქსელ',
                'მათემ', 'ფიზიკ', 'ქიმი', 'ბიოლ', 'ხელოვნური ინტელ', 'artificial'],
    'health':  ['medic', 'სამედიც', 'pharma', 'ფარმ', 'health', 'ჯანდ', 'nurse', 'მედდ',
                'rehabilit', 'რეაბილ', 'სტომატ', 'stomatol', 'veterinar', 'ვეტ', 'სამედდ'],
    'engineering': ['engineer', 'ინჟინ', 'architect', 'არქიტ', 'construct', 'მშენ',
                    'mechanic', 'მექ', 'electr', 'ელექტ', 'civil', 'სამოქ', 'energy',
                    'ენერგ', 'mining', 'სამთ', 'სამრეწ', 'industrial', 'ტექნოლ'],
    'agriculture': ['agron', 'agricultur', 'სასოფლ', 'forestry', 'სატყ', 'food', 'ღვინ',
                    'wine', 'აგრო', 'სასურს', 'ვენახ'],
    'education': ['pedagog', 'teach', 'განათლ', 'preschool', 'სკოლამდ', 'მასწავ',
                  'სასწავ', 'სამასწავ'],
    'humanities': ['philolog', 'history', 'ისტორ', 'philosoph', 'ფილოს', 'humanit',
                   'ჰუმანი', 'literatur', 'art ', 'music', 'ხელოვ', 'კულტ', 'theatre',
                   'kino', 'კინო', 'ჟურნ', 'journalism', 'ლინგვ', 'linguist', 'religion',
                   'არქეოლ', 'archeolog', 'მუსიკ', 'სახვ'],
    'services':  ['tourism', 'ტურიზ', 'hotel', 'სასტ', 'navigation', 'ნავ', 'aviation',
                  'ავიაც', 'sport', 'სპორტ', 'hospitality', 'culinary', 'design', 'დიზაინ',
                  'logistics', 'ლოჯის', 'სამზარ', 'security', 'უსაფრ'],
    'social_business_law': ['law', 'სამართ', 'legal', 'jurisprudence', 'business',
                            'ბიზნეს', 'economics', 'ეკონ', 'finance', 'ფინანს',
                            'management', 'marketing', 'მარკეტ', 'accounting',
                            'სოციალ', 'political', 'პოლიტ', 'international', 'საერთ',
                            'psychology', 'ფსიქ', 'sociology', 'სოციოლ', 'public adm',
                            'საჯარო', 'diplomacy', 'დიპლ'],
}

def detect_field(html, name):
    text = (html[:8000] + ' ' + name).lower()
    scores = {f: sum(1 for kw in kws if kw in text) for f, kws in FIELD_KW.items()}
    best = max(scores, key=lambda f: scores[f])
    return best if scores[best] > 0 else 'social_business_law'

# ── Scrape institution page ─────────────────────────────────────────────────────
def parse_inst(html, slug):
    name_ka = logo = website = ''
    ld = re.search(r'<script[^>]*type="application/ld\+json"[^>]*>(.*?)</script>', html, re.DOTALL | re.I)
    if ld:
        try:
            d = json.loads(ld.group(1))
            name_ka = d.get('name', '')
            logo    = d.get('logo', '')
            ws = d.get('url', '') or d.get('sameAs', '')
            website = ws[0] if isinstance(ws, list) else ws
        except Exception:
            pass
    if not name_ka:
        m = re.search(r'<h1[^>]*>(.*?)</h1>', html, re.DOTALL | re.I)
        if m: name_ka = clean(re.sub(r'<[^>]+>', ' ', m.group(1)))
    if not name_ka:
        m = re.search(r'<title>([^<]+)</title>', html, re.I)
        if m: name_ka = m.group(1).strip().split('|')[0].strip()

    if not website:
        m = re.search(
            r'href="(https?://(?!abituri\.ge)(?!www\.facebook)(?!www\.instagram)(?!t\.me)[^"]{6,80})"',
            html
        )
        if m: website = m.group(1)
    if not website:
        website = f'https://abituri.ge/universities/{slug}'

    # Description
    desc = ''
    m = re.search(r'<meta[^>]+name="description"[^>]+content="([^"]{10,400})"', html, re.I)
    if m: desc = clean(m.group(1))

    # Email / phone / address
    em = re.search(r'[\w.\-+]+@[\w.\-]+\.[a-z]{2,6}', html)
    ph = re.search(r'(?:\+995[\s\-]?)?(?:5\d\d|(?:32|79)\d[\d\s\-]{5,10})\d', html)
    addr = re.search(r'(?:მისამართი|address)[:\s]*([^\n<]{5,120})', html, re.I)

    prog_slugs = list(dict.fromkeys(re.findall(
        r'href="https://abituri\.ge/faculties/([^"?#]+)"', html
    )))

    return {
        'slug': slug,
        'name_ka': name_ka,
        'name_en': '',
        'website': website,
        'logo_url': logo or None,
        'type': detect_type(name_ka, slug),
        'city': detect_city(name_ka, slug, html),
        'description_ka': desc or None,
        'email': em.group(0) if em else None,
        'phone': clean(ph.group(0)) if ph else None,
        'address': clean(addr.group(1)) if addr else None,
        'program_slugs': prog_slugs,
    }

# ── Scrape program page ─────────────────────────────────────────────────────────
def parse_prog(html, prog_slug, uni_slug, category):
    name_ka = ''
    ld = re.search(r'<script[^>]*type="application/ld\+json"[^>]*>(.*?)</script>', html, re.DOTALL | re.I)
    if ld:
        try:
            d = json.loads(ld.group(1))
            name_ka = d.get('name', '')
        except Exception:
            pass
    if not name_ka:
        m = re.search(r'<h1[^>]*>(.*?)</h1>', html, re.DOTALL | re.I)
        if m: name_ka = clean(re.sub(r'<[^>]+>', ' ', m.group(1)))
    if not name_ka:
        m = re.search(r'<title>([^<]+)</title>', html, re.I)
        if m: name_ka = m.group(1).strip().split('|')[0].strip()

    degree = 'bachelor'
    if re.search(r'მაგისტრ|master', html, re.I): degree = 'master'
    elif re.search(r'დოქტ|doctor|phd', html, re.I): degree = 'doctor'

    dur_m = re.search(r'(\d)[.,]?5?\s*(?:წელი|year|წლ)', html, re.I)
    duration = int(dur_m.group(1)) if dur_m else (6 if degree == 'doctor' else 4)

    tuition = None
    for pat in [
        r'(?:სწავლ[ი|ის]\s*)?(?:საფ?ასური|ფასი|fee)[^\d]{0,40}?(\d[\d\s]{2,6})\s*(?:₾|ლარ|GEL)',
        r'(\d[\d\s]{2,6})\s*(?:₾|ლარ|GEL)',
    ]:
        m = re.search(pat, html, re.I)
        if m:
            try:
                v = int(m.group(1).replace(' ', ''))
                if 500 <= v <= 60000:
                    tuition = v
                    break
            except Exception:
                pass

    is_funded = bool(re.search(r'სახელმწიფო\s*დაფინ|გრანტ|grant|state\s*fund', html, re.I))
    score_m = re.search(r'(?:საგრანტო\s*)?(?:ბარიერი|ზღვარი)[:\s]*(\d{2,3})', html, re.I)
    grant_score = int(score_m.group(1)) if score_m else None

    seats_m = re.search(r'(?:ადგილ)[^\d]{0,20}?(\d{1,4})', html, re.I)
    seats = int(seats_m.group(1)) if seats_m else None

    # Faculty name
    fac = ''
    m = re.search(r'(?:ფაკულტეტი|faculty|სკოლა)[:\s]*([^\n<]{5,80})', html, re.I)
    if m: fac = clean(m.group(0))

    return {
        'slug': prog_slug,
        'institution_slug': uni_slug,
        'institution_category': category,
        'name_ka': name_ka,
        'faculty_ka': fac,
        'degree': degree,
        'duration_years': duration,
        'tuition_fee': tuition,
        'is_state_funded': is_funded,
        'grant_score_2025': grant_score,
        'seats': seats,
        'field': detect_field(html, name_ka),
    }

# ══════════════════════════════════════════════════════════════════════════════
# PHASE 1: Scrape all institutions
# ══════════════════════════════════════════════════════════════════════════════
print('\n=== PHASE 1: Institutions ===')
institutions = []

for i, slug in enumerate(all_slugs):
    category = slug_cats.get(slug, 'university')
    url = f'https://abituri.ge/universities/{slug}'
    html = fetch(url)
    if not html:
        print(f'  [{i+1:03d}/{len(all_slugs)}] SKIP {slug}')
        continue

    inst = parse_inst(html, slug)
    inst['category'] = category
    institutions.append(inst)
    print(f'  [{i+1:03d}/{len(all_slugs)}] {inst["name_ka"][:60]} | {inst["type"]} | {inst["city"]} | {len(inst["program_slugs"])} progs | {category}')
    time.sleep(0.35)

out_inst = os.path.join(RAW, 'institutions_full.json')
with open(out_inst, 'w', encoding='utf-8') as f:
    json.dump(institutions, f, ensure_ascii=False, indent=2)
print(f'\n✅ Phase 1 done: {len(institutions)} institutions → {out_inst}')

# ══════════════════════════════════════════════════════════════════════════════
# PHASE 2: Scrape all programs
# ══════════════════════════════════════════════════════════════════════════════
print('\n=== PHASE 2: Programs ===')
seen_progs = set()
prog_jobs = []
for inst in institutions:
    for ps in inst['program_slugs']:
        if ps not in seen_progs:
            seen_progs.add(ps)
            prog_jobs.append((inst['slug'], inst['category'], ps))

print(f'Unique programs: {len(prog_jobs)}')
programs = []

for j, (uni_slug, category, prog_slug) in enumerate(prog_jobs):
    url = f'https://abituri.ge/faculties/{prog_slug}'
    html = fetch(url)
    if not html:
        continue

    prog = parse_prog(html, prog_slug, uni_slug, category)
    programs.append(prog)

    if (j + 1) % 100 == 0 or j < 5:
        print(f'  [{j+1}/{len(prog_jobs)}] {prog["name_ka"][:50]} | {prog["field"]} | {prog["tuition_fee"]}₾')

    time.sleep(0.3)

out_prog = os.path.join(RAW, 'programs_full.json')
with open(out_prog, 'w', encoding='utf-8') as f:
    json.dump(programs, f, ensure_ascii=False, indent=2)
print(f'\n✅ Phase 2 done: {len(programs)} programs → {out_prog}')

# ── Summary ─────────────────────────────────────────────────────────────────────
from collections import Counter
print('\n── SUMMARY ──────────────────────────────────')
print('By category:', dict(Counter(i['category'] for i in institutions)))
print('By type:    ', dict(Counter(i['type'] for i in institutions)))
print('Top cities: ', Counter(i['city'] for i in institutions).most_common(10))
print('Programs by field:', dict(Counter(p['field'] for p in programs)))
print(f'Total institutions: {len(institutions)}')
print(f'Total programs:     {len(programs)}')
