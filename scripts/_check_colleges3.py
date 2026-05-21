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

html = fetch('https://abituri.ge/colleges')

# Find all href values that contain 'college'
college_hrefs = re.findall(r'href="([^"]*colleg[^"]*)"', html, re.I)
print('College hrefs:')
for h in college_hrefs[:20]:
    print(' ', h)

# All abituri.ge links
all_abituri = list(dict.fromkeys(re.findall(r'href="(https://abituri\.ge/[^"?#]+)"', html)))
print(f'\nAll abituri.ge links ({len(all_abituri)}):')
for l in all_abituri[:30]:
    print(' ', l)
