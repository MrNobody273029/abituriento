# -*- coding: utf-8 -*-
"""Targeted search for grant score files on naec.ge - saves to JSON"""
import urllib.request, re, sys, json, time
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

# Grant-related keywords in Georgian (UTF-8)
GRANT_KWS = [
    'გრანტ', 'კალიბრ', '50%', '70%', '100%', 'ქულ',
    'შეჯამება', 'ბარიერ', 'სტატისტ', 'ჩარიცხ', 'შედეგ',
    'cnobari', 'ცნობარ', 'saertashoriso', 'erovnuli',
    'grant', 'score', 'result'
]

YEARS = ['2020', '2021', '2022', '2023', '2024', '2025']

all_xls = []
grant_xls = []
historical_xls = []

print("Scanning naec.ge posts for XLS files...")
for page_idx in range(0, 80):
    r = fetch(f'https://naec.ge/post/list?pageSize=50&pageIndex={page_idx}')
    if r.startswith('ERROR'):
        print(f'page {page_idx}: {r[:60]}')
        break
    try:
        data = json.loads(r)
        posts = data.get('results', [])
        if not posts:
            print(f'page {page_idx}: empty → done')
            break

        for p in posts:
            pid = p.get('id')
            name = p.get('name', '') or ''
            desc = p.get('desc', '') or ''
            combined = name + ' ' + desc

            # Find XLS/XLSX file links in the post HTML
            xls_links = list(dict.fromkeys(re.findall(
                r'href=["\']([^"\']*\.xlsx?[^"\']*)["\']', desc, re.I
            )))

            for link in xls_links:
                entry = {'post_id': pid, 'post_name': name[:120], 'link': link}
                all_xls.append(entry)

                # Check if grant-related
                combined_check = combined + ' ' + link
                if any(kw.lower() in combined_check.lower() for kw in GRANT_KWS):
                    grant_xls.append(entry)

                # Check if historical (2020-2025 in path)
                for yr in YEARS:
                    if yr in link:
                        historical_xls.append({**entry, 'year': yr})
                        break

    except Exception as e:
        print(f'page {page_idx} error: {e}')

    time.sleep(0.2)

print(f'\nTotal XLS entries: {len(all_xls)}')
print(f'Grant-related: {len(grant_xls)}')
print(f'Historical (2020-2025): {len(historical_xls)}')

# Save results
results = {
    'all_xls': all_xls[:500],
    'grant_xls': grant_xls[:200],
    'historical_xls': historical_xls
}

out = 'data_raw/naec_xls_links.json'
with open(out, 'w', encoding='utf-8') as f:
    json.dump(results, f, ensure_ascii=False, indent=2)
print(f'\nSaved to {out}')

# Print historical files
print('\n=== HISTORICAL XLS (2020-2025) ===')
for e in historical_xls[:50]:
    print(f"Year {e.get('year')} | Post {e['post_id']}: {e['post_name'][:60]}")
    print(f"  -> {e['link']}")

# Print grant-related
print('\n=== GRANT XLS (all) ===')
seen = set()
for e in grant_xls:
    if e['link'] not in seen:
        seen.add(e['link'])
        print(f"Post {e['post_id']}: {e['link']}")
