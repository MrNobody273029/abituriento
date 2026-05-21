# -*- coding: utf-8 -*-
import urllib.request, re, sys
sys.stdout.reconfigure(encoding='utf-8')
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36',
    'Accept-Language': 'ka,en;q=0.9', 'Accept-Encoding': 'identity'
}

def fetch(url):
    req = urllib.request.Request(url, headers=HEADERS)
    return urllib.request.urlopen(req, timeout=20).read().decode('utf-8', errors='ignore')

html = fetch('https://abituri.ge/colleges')
# All href links
all_hrefs = list(dict.fromkeys(re.findall(r'href="([^"]+)"', html)))
print(f'Total hrefs: {len(all_hrefs)}')
# Filter to abituri.ge links
abituri_links = [h for h in all_hrefs if 'abituri.ge' in h or h.startswith('/')]
print(f'Abituri links: {len(abituri_links)}')
for l in abituri_links[:30]:
    print(' ', l)
print('...')
# Check page structure
print('\nFirst 2000 chars of body:')
# Find main content area
body_m = re.search(r'<main[^>]*>(.*?)</main>', html, re.DOTALL | re.I)
if body_m:
    body = re.sub(r'<[^>]+>', ' ', body_m.group(1))
    body = re.sub(r'\s+', ' ', body)
    print(body[:2000])
else:
    body = re.sub(r'<[^>]+>', ' ', html)
    body = re.sub(r'\s+', ' ', body)
    print(body[1000:3000])
