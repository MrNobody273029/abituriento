# -*- coding: utf-8 -*-
import urllib.request, re, ssl, sys
sys.stdout.reconfigure(encoding='utf-8')

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36',
    'Accept-Language': 'ka,en;q=0.9', 'Accept-Encoding': 'identity',
    'Content-Type': 'application/x-www-form-urlencoded',
    'Referer': 'https://old.naec.ge/'
}

def post(url):
    try:
        req = urllib.request.Request(url, data=b'', headers=HEADERS, method='POST')
        r = urllib.request.urlopen(req, timeout=20, context=ctx)
        return r.read().decode('utf-8', errors='ignore'), r.status
    except Exception as e:
        return f'ERROR: {e}', 0

def get(url):
    try:
        req = urllib.request.Request(url, headers={k:v for k,v in HEADERS.items() if k != 'Content-Type'})
        r = urllib.request.urlopen(req, timeout=20, context=ctx)
        return r.read().decode('utf-8', errors='ignore'), r.status
    except Exception as e:
        return f'ERROR: {e}', 0

print("=== old.naec.ge content pages ===\n")
body_ids = [1, 2, 3, 4, 5, 6, 7, 10, 29]
all_links = []

for bid in body_ids:
    url = f'https://old.naec.ge/content/body{bid}.jsp'
    r, s = post(url)
    if r.startswith('ERROR'):
        print(f'body{bid}: {r[:80]}')
        continue
    text = re.sub(r'<[^>]+>', ' ', r)
    text = re.sub(r'\s+', ' ', text).strip()
    print(f'\n=== body{bid} ({len(r)} chars) ===')
    print(text[:500])
    # Find all links
    links = re.findall(r'href="([^"]+)"', r)
    for l in links:
        all_links.append(l)
        if any(x in l.lower() for x in ['xls', 'xlsx', 'csv', 'pdf', 'json', 'result', 'shedegebi', 'grant', 'stat', 'download', 'cnobari']):
            print(f'  *** INTERESTING LINK: {l}')
    # Also look for onclick or JS calls that might contain more body IDs
    calls = re.findall(r"getBody[23]\('([^']+)'", r)
    print(f'  -> Sub-bodies: {calls}')

# Also try to find what sub-pages exist by checking Supa.js
print("\n\n=== Checking Supa.js ===")
r, s = get('https://old.naec.ge/js/Supa.js')
if not r.startswith('ERROR'):
    print(r[:3000])

# Try fetching actual sub-bodies found
print("\n\n=== Fetching sub-bodies ===")
sub_bodies = ['body10', 'body29', 'body6', 'body3', 'body4', 'body5']
for sb in sub_bodies:
    url = f'https://old.naec.ge/content/{sb}.jsp'
    r, s = post(url)
    if not r.startswith('ERROR'):
        text = re.sub(r'<[^>]+>', ' ', r)
        text = re.sub(r'\s+', ' ', text).strip()
        print(f'\n{sb}: {text[:400]}')
        calls = re.findall(r"getBody[23]\('([^']+)'", r)
        print(f'  Sub: {calls}')
        links = re.findall(r'href="([^"]+)"', r)
        for l in links[:10]:
            print(f'  link: {l}')
