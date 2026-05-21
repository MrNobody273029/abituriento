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

html = fetch('https://abituri.ge')
hrefs = sorted(set(re.findall(r'href="/([a-z][a-z0-9\-/]*)"', html)))
print('=== abituri.ge nav paths ===')
for h in hrefs:
    if not any(x in h for x in ['#', 'faculties/', 'universities/', 'quiz', 'blog', 'auth']):
        print(' ', h)

# Also check what institution-type listing pages exist
for path in ['/colleges', '/vocational-schools', '/vocational', '/professional-colleges',
             '/schools', '/institutions', '/higher-education', '/professional-education']:
    try:
        r = fetch(f'https://abituri.ge{path}')
        slugs = re.findall(r'href="https://abituri\.ge/[^/]+/([^"?#]+)"', r)
        print(f'{path}: HTTP OK, {len(slugs)} items found')
    except Exception as e:
        print(f'{path}: {e}')
