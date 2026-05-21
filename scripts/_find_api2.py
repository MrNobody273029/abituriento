# -*- coding: utf-8 -*-
import urllib.request, re, sys
sys.stdout.reconfigure(encoding='utf-8')
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36',
    'Accept-Language': 'ka,en;q=0.9', 'Accept-Encoding': 'identity'
}

def fetch(url):
    req = urllib.request.Request(url, headers=HEADERS)
    return urllib.request.urlopen(req, timeout=30).read().decode('utf-8', errors='ignore')

# Get colleges page and ALL js/css references
html = fetch('https://abituri.ge/colleges')
all_js = list(dict.fromkeys(re.findall(r'src="(https://abituri\.ge/[^"]+\.js[^"]*)"', html)))
all_css = list(dict.fromkeys(re.findall(r'href="(https://abituri\.ge/[^"]+\.css[^"]*)"', html)))
print('ALL JS:', all_js)
print('ALL CSS:', all_css)

# Also check inline script blocks for data
inline_scripts = re.findall(r'<script(?![^>]*src)[^>]*>(.*?)</script>', html, re.DOTALL)
print(f'\nInline scripts: {len(inline_scripts)}')
for i, sc in enumerate(inline_scripts[:6]):
    sc_clean = sc.strip()[:400]
    if sc_clean and 'function' not in sc_clean[:50]:
        print(f'  Script {i}: {sc_clean[:200]}')

# look for data attributes or JSON in HTML
json_blocks = re.findall(r'data-[a-z\-]+=["\']\{[^"\']{10,}', html)
print(f'\nData attrs with JSON: {len(json_blocks)}')
for j in json_blocks[:3]:
    print(' ', j[:200])

# try to find the map app
map_js = re.findall(r'src="(https://abituri\.ge/react-apps/university-map/[^"]+)"', html)
print(f'\nMap app JS: {map_js}')

# Try calling potential API endpoints directly
for endpoint in [
    'https://abituri.ge/api/colleges',
    'https://abituri.ge/api/institutions',
    'https://abituri.ge/api/v1/colleges',
    'https://abituri.ge/api/universities',
    'https://abituri.ge/api/v1/universities',
    'https://abituri.ge/colleges/api',
    'https://abituri.ge/api/institutions/list',
]:
    try:
        r = fetch(endpoint)
        print(f'{endpoint}: OK len={len(r)} preview={r[:200]}')
    except Exception as e:
        print(f'{endpoint}: {type(e).__name__}')
