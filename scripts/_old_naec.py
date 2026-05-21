# -*- coding: utf-8 -*-
import urllib.request, re, sys, ssl, json
sys.stdout.reconfigure(encoding='utf-8')

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36',
    'Accept-Language': 'ka,en;q=0.9', 'Accept-Encoding': 'identity',
}

def fetch(url):
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        r = urllib.request.urlopen(req, timeout=20, context=ctx)
        return r.read().decode('utf-8', errors='ignore'), r.status
    except Exception as e:
        return f"ERROR: {e}", 0

# Explore old.naec.ge
html, status = fetch('https://old.naec.ge')
print(f"old.naec.ge: {len(html)} chars")

# Extract all links
links = list(dict.fromkeys(re.findall(r'href="([^"#]{4,120})"', html)))
print(f"\nAll links ({len(links)}):")
for l in links[:40]:
    print(f"  {l}")

# Text
text = re.sub(r'<[^>]+>', ' ', html)
text = re.sub(r'\s+', ' ', text)
print("\nText preview:")
print(text[200:2000])

# Try specific paths on old.naec.ge
paths = [
    '/ge', '/ka', '/en',
    '/ge/results', '/ge/shedegebi', '/ge/statistics',
    '/ge/static', '/ge/download', '/ge/news',
    '/ge/pages', '/ge/pages/1', '/ge/pages/2',
    '/api', '/api/results', '/data',
    '/ka/results', '/ka/statistics',
]
print("\n\nChecking paths on old.naec.ge:")
for p in paths:
    r, s = fetch(f'https://old.naec.ge{p}')
    if not r.startswith('ERROR'):
        size = len(r)
        print(f"  ✅ {p}: {size} chars")
        dl = re.findall(r'href="([^"]*(?:xls|xlsx|csv|pdf)[^"]*)"', r, re.I)
        for d in dl[:3]: print(f"    DL: {d}")
    else:
        print(f"  ❌ {p}: {r[:50]}")
