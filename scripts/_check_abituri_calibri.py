# -*- coding: utf-8 -*-
"""Check a few abituri.ge program pages for 2025 calibration/grant scores."""
import urllib.request, re, sys, time
sys.stdout.reconfigure(encoding='utf-8')

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36',
    'Accept-Language': 'ka,en;q=0.9',
    'Accept-Encoding': 'identity',
}

def fetch(url):
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        return urllib.request.urlopen(req, timeout=20).read().decode('utf-8', errors='ignore')
    except Exception as e:
        return f'ERROR: {e}'

# Test programs — well-known ones that definitely get grants
test_slugs = [
    'iurisprudencia-0420101',         # სამართალი — TSU
    'medicina-0510101',               # მედიცინა
    'kompiuteruli-mecniereba-0610101',# კომპ. მეცნ.
    'biznesis-administrireba-2040101',# ბიზნ. ადმ.
    'psikologia-0310101',             # ფსიქოლოგია
    'arqiteqtura-0730101',            # არქიტ.
]

# Score-related patterns to look for
SCORE_PATTERNS = [
    r'კალიბრ[^:]{0,30}?:\s*(\d{2,4})',
    r'საგრანტო[^:]{0,30}?:\s*(\d{2,4})',
    r'გრანტ[^:]{0,30}?:\s*(\d{2,4})',
    r'(\d{2,4})\s*(?:ქულ|ბარ|კალ)',
    r'min[_\s]?score[:\s]*(\d{2,4})',
    r'last[_\s]?score[:\s]*(\d{2,4})',
    r'composite[:\s]*(\d{2,4})',
    r'100%[^>]{0,50}?(\d{2,4})',
    r'70%[^>]{0,50}?(\d{2,4})',
    r'50%[^>]{0,50}?(\d{2,4})',
    r'(\d{3,4})\s*(?:ქ\.|ქ\s|ქულ)',  # Georgian score notation
]

GRANT_KEYWORDS = ['კალიბრ', 'გრანტ', 'საგრანტო', 'ბარიერ', 'კომპოზ', 'ქულ', '50%', '70%', '100%',
                  'grant', 'score', 'calibr', 'composite', 'minimum']

for slug in test_slugs:
    url = f'https://abituri.ge/faculties/{slug}'
    html = fetch(url)
    if html.startswith('ERROR'):
        print(f'{slug}: ERROR')
        continue

    print(f'\n=== {slug} ===')

    # Find all grant-related text blocks
    for kw in GRANT_KEYWORDS:
        if kw.lower() in html.lower():
            # Find surrounding context
            idx = html.lower().find(kw.lower())
            context = html[max(0, idx-50):idx+200]
            # Strip HTML tags
            clean = re.sub(r'<[^>]+>', ' ', context)
            clean = re.sub(r'\s+', ' ', clean).strip()
            if len(clean) > 10:
                print(f'  [{kw}] ...{clean[:200]}...')
                break

    # Try all score patterns
    text = re.sub(r'<[^>]+>', ' ', html)
    for pat in SCORE_PATTERNS:
        m = re.search(pat, text, re.I)
        if m:
            print(f'  PATTERN: {pat[:40]} → {m.group(0)[:60]}')

    time.sleep(0.5)
