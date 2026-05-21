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

# Get colleges page and find react app JS bundles
html = fetch('https://abituri.ge/colleges')
js_bundles = list(dict.fromkeys(re.findall(r'(https://abituri\.ge/react-apps/[^"]+\.js[^"]*)"', html)))
print(f'JS bundles found: {len(js_bundles)}')
for b in js_bundles:
    print(' ', b)

# Fetch each bundle and look for API patterns
for bundle_url in js_bundles[:5]:
    print(f'\n--- {bundle_url} ---')
    try:
        js = fetch(bundle_url)
        # Find API endpoints
        apis = re.findall(r'["\x60]/api/v?\d*/[a-z\-/]+', js)
        apis += re.findall(r'["\x60]/[a-z\-/]*(?:college|universit|program|institution|school)[a-z\-/]*', js)
        for a in sorted(set(apis)):
            print(' ', a)
        # Also look for base URL patterns
        bases = re.findall(r'["\x60]https?://[^"` ]{10,60}(?:api|v1|v2)[^"` ]{0,40}', js)
        for b in sorted(set(bases))[:10]:
            print('  BASE:', b)
    except Exception as e:
        print(f'  Error: {e}')
