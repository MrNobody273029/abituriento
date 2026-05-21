# -*- coding: utf-8 -*-
"""Hunt for NAEC grant score / results data from official sources"""
import urllib.request, re, ssl, sys, json
sys.stdout.reconfigure(encoding='utf-8')

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36',
    'Accept-Language': 'ka,en;q=0.9', 'Accept-Encoding': 'identity',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
}

def fetch(url, timeout=25):
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        r = urllib.request.urlopen(req, timeout=timeout, context=ctx)
        content = r.read().decode('utf-8', errors='ignore')
        return content, r.status
    except Exception as e:
        return f'ERROR: {e}', 0

# 1. Wayback Machine CDX API — find archived NAEC pages with grant scores
print("=== Wayback Machine CDX for naec.ge ===")
cdx_urls = [
    'http://web.archive.org/cdx/search/cdx?url=naec.ge/ka/pages/shedegebi*&output=json&limit=10&fl=timestamp,original,statuscode',
    'http://web.archive.org/cdx/search/cdx?url=naec.ge/ka/download*&output=json&limit=10&fl=timestamp,original,statuscode',
    'http://web.archive.org/cdx/search/cdx?url=naec.ge/uploads/*.xlsx&output=json&limit=20&fl=timestamp,original',
    'http://web.archive.org/cdx/search/cdx?url=naec.ge/uploads/*.pdf&output=json&limit=20&fl=timestamp,original',
    'http://web.archive.org/cdx/search/cdx?url=naec.ge/files/*.xlsx&output=json&limit=20&fl=timestamp,original',
    'http://web.archive.org/cdx/search/cdx?url=naec.ge/*.xlsx&output=json&limit=20&fl=timestamp,original',
    'http://web.archive.org/cdx/search/cdx?url=naec.ge/*.pdf&output=json&limit=30&fl=timestamp,original',
]
for url in cdx_urls:
    r, s = fetch(url)
    if r.startswith('ERROR'):
        print(f'❌ {url[:70]}: {r[:60]}')
    else:
        try:
            data = json.loads(r)
            if len(data) > 1:  # first row is header
                print(f'\n✅ {url[:80]}')
                for row in data[1:]:
                    print(f'  {row}')
            else:
                print(f'⚠️  {url[:70]}: empty')
        except:
            print(f'?? {url[:70]}: {r[:100]}')

# 2. Try naec.ge actual download/results pages (fetched fresh)
print("\n\n=== naec.ge download/results pages ===")
naec_paths = [
    '/ka/pages/1',
    '/ka/pages/2',
    '/ka/pages/3',
    '/ka/pages/4',
    '/ka/pages/5',
    '/ka/shedegebi',
    '/ka/download',
    '/ka/statistica',
    '/ka/cnobari',
    '/en/results',
    '/en/download',
    '/en/statistics',
]
for p in naec_paths:
    r, s = fetch(f'https://naec.ge{p}')
    if not r.startswith('ERROR'):
        print(f'✅ {p}: {len(r)} chars')
        dl = re.findall(r'href="([^"]*(?:xls|xlsx|csv|pdf|download)[^"]*)"', r, re.I)
        for d in dl[:5]:
            print(f'  → {d}')
    else:
        print(f'❌ {p}: {r[:60]}')

# 3. res.naec.ge (results subdomain)
print("\n\n=== res.naec.ge ===")
for p in ['', '/ka', '/ka/results', '/api/results', '/api']:
    r, s = fetch(f'https://res.naec.ge{p}')
    if not r.startswith('ERROR'):
        print(f'✅ res.naec.ge{p}: {len(r)} chars')
        text = re.sub(r'<[^>]+>', ' ', r)
        text = re.sub(r'\s+', ' ', text).strip()
        print(f'  {text[:200]}')
    else:
        print(f'❌ res.naec.ge{p}: {r[:60]}')

# 4. GeoStat detailed education statistics
print("\n\n=== GeoStat education stats ===")
geostat_urls = [
    'https://geostat.ge/ka/modules/categories/563/umaghlesi-ganatleba',
    'https://geostat.ge/ka/modules/categories/563',
    'https://geostat.ge/ka/modules/categories/564',
    'https://geostat.ge/en/modules/categories/563/higher-education',
]
for url in geostat_urls:
    r, s = fetch(url)
    if not r.startswith('ERROR'):
        print(f'✅ {url}: {len(r)} chars')
        dl = re.findall(r'href="([^"]*(?:xls|xlsx|csv|pdf)[^"]*)"', r, re.I)
        for d in dl[:5]:
            print(f'  → {d}')
    else:
        print(f'❌ {url}: {r[:60]}')
