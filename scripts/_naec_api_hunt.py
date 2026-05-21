# -*- coding: utf-8 -*-
"""Find NAEC API endpoints and grant score data"""
import urllib.request, re, sys, json
sys.stdout.reconfigure(encoding='utf-8')

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/html, */*',
    'Accept-Language': 'ka,en;q=0.9', 'Accept-Encoding': 'identity'
}

def fetch(url, timeout=20):
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        r = urllib.request.urlopen(req, timeout=timeout)
        return r.read().decode('utf-8', errors='ignore'), r.status
    except Exception as e:
        return f"ERROR: {e}", 0

# 1. Fetch naec.ge main JS app to find API endpoints
html, _ = fetch('https://naec.ge')
scripts = re.findall(r'src="(/[^"]+\.js[^"]*)"', html)
print("Scripts found:", scripts[:10])

# 2. Try known naec API patterns (AngularJS typically uses /api/ or /service/)
api_urls = [
    'https://naec.ge/api',
    'https://naec.ge/api/results/2024',
    'https://naec.ge/api/grant',
    'https://naec.ge/api/programs',
    'https://naec.ge/service',
    'https://naec.ge/service/results',
    'https://naec.ge/en/api',
    # data.gov.ge open data
    'https://data.gov.ge/dataset',
    'https://data.gov.ge/dataset/naec',
    'https://data.gov.ge/dataset?q=naec',
    'https://data.gov.ge/dataset?q=grant',
    'https://data.gov.ge/dataset?q=%E1%83%92%E1%83%A0%E1%83%90%E1%83%9C%E1%83%A2',  # "გრანტ"
    # Opengov
    'https://opendata.mes.gov.ge/dataset',
    'https://www.opendata.ge',
]

for url in api_urls:
    html, status = fetch(url)
    if not html.startswith('ERROR'):
        print(f"✅ {url} ({len(html)} chars)")
        if html.strip().startswith('{') or html.strip().startswith('['):
            try:
                data = json.loads(html)
                print(f"   JSON! keys: {list(data.keys())[:5] if isinstance(data, dict) else 'array'}")
            except: pass
        # Look for data links
        dl = re.findall(r'href="([^"]*(?:xls|xlsx|csv|json|pdf)[^"]*)"', html, re.I)
        for d in dl[:3]: print(f"  DL: {d}")
    else:
        print(f"❌ {url}: {html[:60]}")

# 3. Try data.gov.ge API (CKAN)
print("\n=== data.gov.ge CKAN API ===")
ckan_searches = [
    'https://data.gov.ge/api/3/action/package_search?q=naec',
    'https://data.gov.ge/api/3/action/package_search?q=grant+score',
    'https://data.gov.ge/api/3/action/package_search?q=university+admission',
    'https://data.gov.ge/api/3/action/package_search?q=%E1%83%92%E1%83%A0%E1%83%90%E1%83%9C%E1%83%A2%E1%83%98',
]
for url in ckan_searches:
    html, status = fetch(url)
    if not html.startswith('ERROR') and (html.startswith('{') or html.startswith('[')):
        try:
            data = json.loads(html)
            if data.get('success'):
                results = data.get('result', {}).get('results', [])
                print(f"✅ {url}: {len(results)} results")
                for r in results[:3]:
                    print(f"   - {r.get('title', '')} | {r.get('name', '')}")
        except: print(f"  JSON parse error for {url}")
    else:
        print(f"❌ {url}: {html[:60]}")
