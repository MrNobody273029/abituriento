# -*- coding: utf-8 -*-
"""Deep scan naec.ge posts for grant score / calibration Excel files"""
import urllib.request, re, ssl, sys, json, time
sys.stdout.reconfigure(encoding='utf-8')

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36',
    'Accept-Language': 'ka,en;q=0.9', 'Accept-Encoding': 'identity',
    'Accept': 'application/json, */*', 'X-Requested-With': 'XMLHttpRequest',
    'Referer': 'https://naec.ge/'
}

def fetch(url):
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        r = urllib.request.urlopen(req, timeout=25)
        return r.read().decode('utf-8', errors='ignore')
    except Exception as e:
        return f'ERROR: {e}'

GRANT_KWS = ['გრანტ', 'კალიბრ', 'გრანტ', 'grant', '50%', '70%', '100%',
             'შეჯამება', 'ქულა', 'ქულათა', 'ბარიერ', 'სტატისტ',
             'ჩარიცხ', 'ჩარიცხ', 'shedegebi', 'შედეგ']

all_xls_posts = []  # posts with Excel files
grant_score_posts = []  # posts with grant + Excel

print("Scanning all naec.ge posts for grant score Excel files...\n")

for page_idx in range(0, 80):  # posts are numbered up to ~3572, 50 per page = ~72 pages
    r = fetch(f'https://naec.ge/post/list?pageSize=50&pageIndex={page_idx}')
    if r.startswith('ERROR'):
        print(f'page {page_idx}: ERROR {r[:60]}')
        break
    try:
        data = json.loads(r)
        posts = data.get('results', [])
        if not posts:
            print(f'page {page_idx}: empty → stopping')
            break

        for p in posts:
            pid = p.get('id')
            name = p.get('name', '') or ''
            desc = p.get('desc', '') or ''
            combined = name + desc

            # Find XLS/Excel files
            xls = list(dict.fromkeys(re.findall(
                r'href=["\']([^"\']*\.(?:xls|xlsx)[^"\']*)["\']', desc, re.I
            )))

            if xls:
                is_grant = any(k.lower() in combined.lower() for k in GRANT_KWS)
                entry = {'id': pid, 'name': name[:100], 'xls': xls, 'is_grant': is_grant}
                all_xls_posts.append(entry)
                if is_grant:
                    grant_score_posts.append(entry)

    except Exception as e:
        print(f'page {page_idx} error: {e}')

    if page_idx % 10 == 9:
        print(f'  → page {page_idx+1}: {len(all_xls_posts)} posts with XLS, {len(grant_score_posts)} grant-related')
    time.sleep(0.2)

print(f"\n=== GRANT-RELATED XLS POSTS ({len(grant_score_posts)}) ===")
for p in grant_score_posts:
    print(f"\nPost {p['id']}: {p['name']}")
    for x in p['xls']:
        # Try to detect if it's a grant score file
        is_score = any(k in x.lower() for k in ['grant', 'გრანტ', 'calibr', 'კალიბ', 'stat', 'result', 'შეჯ', 'ქულ'])
        marker = '*** ' if is_score else '    '
        print(f"  {marker}{x}")

print(f"\n=== ALL XLS POSTS ({len(all_xls_posts)}) - first 50 ===")
for p in all_xls_posts[:50]:
    print(f"\nPost {p['id']}: {p['name'][:80]}")
    for x in p['xls'][:3]:
        print(f"  {x[:120]}")
