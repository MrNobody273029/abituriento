# -*- coding: utf-8 -*-
"""
Hunt naec.ge for 2025 grant calibration data.
Strategy 1: scan post list pages with from/to date params
Strategy 2: scan individual post IDs 3200-3500 (Aug-Nov 2025)
Strategy 3: try known URL patterns for calibration Excel files
"""
import urllib.request, re, sys, json, time, os
sys.stdout.reconfigure(encoding='utf-8')

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/json,*/*',
    'Accept-Language': 'ka,en;q=0.9',
    'Accept-Encoding': 'identity',
}

def fetch(url, timeout=15):
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        r = urllib.request.urlopen(req, timeout=timeout)
        return r.read().decode('utf-8', errors='ignore')
    except Exception as e:
        return f'ERROR: {e}'

GRANT_KWS = ['გრანტ', 'კალიბრ', 'კომპოზ', 'ბარიერ', 'ჩარიცხ',
             'grant', 'calibr', 'composite', '50%', '70%', '100%']

# ── Strategy 1: post list with search ────────────────────────────────────────
print("=== Strategy 1: naec.ge post list search ===")
for kw in ['კალიბრი', 'გრანტი', 'ჩარიცხვა', 'shedegebi']:
    url = f'https://naec.ge/post/list?pageSize=50&pageIndex=0&searchText={urllib.request.quote(kw)}'
    r = fetch(url)
    if not r.startswith('ERROR'):
        try:
            data = json.loads(r)
            posts = data.get('results', [])
            print(f"\nSearch '{kw}': {len(posts)} results")
            for p in posts[:5]:
                name = p.get('name', '')[:80]
                files = re.findall(r'href=["\']([^"\']*\.xlsx?[^"\']*)["\']', p.get('desc',''), re.I)
                print(f"  [{p.get('id')}] {name}")
                for f in files[:2]:
                    print(f"    FILE: {f}")
        except Exception as e:
            print(f"  parse error: {e}")
    else:
        print(f"Search '{kw}': {r[:60]}")
    time.sleep(0.3)

# ── Strategy 2: direct post ID scan (fast range) ─────────────────────────────
print("\n=== Strategy 2: Scanning post IDs 3200-3520 ===")
found = []

for pid in range(3200, 3521):
    # Use the post API endpoint
    url = f'https://naec.ge/post/{pid}'
    html = fetch(url)

    if html.startswith('ERROR') or len(html) < 200:
        continue

    is_grant = any(kw.lower() in html.lower() for kw in GRANT_KWS)
    if not is_grant:
        continue

    title_m = re.search(r'<h1[^>]*>([^<]{5,150})</h1>', html, re.I)
    if not title_m:
        title_m = re.search(r'<title>([^<]{5,100})</title>', html, re.I)
    title = title_m.group(1).strip() if title_m else ''

    files = list(dict.fromkeys(
        re.findall(r'href=["\']([^"\']*\.(?:xlsx?|pdf)[^"\']*)["\']', html, re.I)
    ))

    entry = {'id': pid, 'title': title[:100], 'files': files[:5]}
    found.append(entry)
    print(f"\n  [{pid}] {title[:80]}")
    for f in files[:3]:
        print(f"    -> {f}")

    time.sleep(0.08)  # be polite

print(f"\nTotal grant posts found: {len(found)}")

# ── Strategy 3: known URL patterns ───────────────────────────────────────────
print("\n=== Strategy 3: Direct URL patterns ===")
candidate_urls = [
    'https://naec.ge/uploads/postData/2025/კალიბრი/კალიბრი_2025.xlsx',
    'https://naec.ge/uploads/postData/2025/kalibri.xlsx',
    'https://naec.ge/uploads/postData/2025/grant_2025.xlsx',
    'https://naec.ge/uploads/postData/2025/shedegebi_2025.xlsx',
    'https://naec.ge/uploads/postData/2025/ჩარიცხვა_2025.xlsx',
    'https://naec.ge/uploads/postData/2025/charicxva_2025.xlsx',
    'https://naec.ge/uploads/postData/2025/grantis_kalibri.xlsx',
    'https://naec.ge/uploads/postData/2025/saxelmwifo_granti.xlsx',
    'https://naec.ge/ka/pages/shedegebi_2025',
    'https://naec.ge/ka/news/2025',
]

for url in candidate_urls:
    r = fetch(url)
    if r.startswith('ERROR'):
        print(f"  ❌ {url.split('naec.ge')[-1]}")
    else:
        print(f"  ✅ {url.split('naec.ge')[-1]} ({len(r)} chars)")

# Save found posts
if found:
    out = os.path.join(BASE, 'data_raw', 'grant_posts_2025.json')
    with open(out, 'w', encoding='utf-8') as f:
        json.dump(found, f, ensure_ascii=False, indent=2)
    print(f"\nSaved to {out}")
