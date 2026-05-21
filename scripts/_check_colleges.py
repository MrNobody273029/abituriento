# -*- coding: utf-8 -*-
import urllib.request, re, sys, json
sys.stdout.reconfigure(encoding='utf-8')
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36',
    'Accept-Language': 'ka,en;q=0.9', 'Accept-Encoding': 'identity'
}

def fetch(url):
    req = urllib.request.Request(url, headers=HEADERS)
    return urllib.request.urlopen(req, timeout=20).read().decode('utf-8', errors='ignore')

# check colleges
html = fetch('https://abituri.ge/colleges')
slugs = list(dict.fromkeys(re.findall(r'href="https://abituri\.ge/colleges/([^"?#]+)"', html)))
print(f'Colleges slugs: {len(slugs)}')
print('First 10:', slugs[:10])

# check professional-programs
html2 = fetch('https://abituri.ge/professional-programs')
slugs2 = list(dict.fromkeys(re.findall(r'href="https://abituri\.ge/professional-programs/([^"?#]+)"', html2)))
print(f'\nProfessional-program slugs: {len(slugs2)}')
print('First 5:', slugs2[:5])

# check one college page
if slugs:
    html3 = fetch(f'https://abituri.ge/colleges/{slugs[0]}')
    prog_slugs = list(dict.fromkeys(re.findall(r'href="https://abituri\.ge/[^"?#]+/([^"?#]+)"', html3)))
    print(f'\nFirst college {slugs[0]}: {len(prog_slugs)} prog links')
    # what URL pattern do program pages use?
    all_links = list(dict.fromkeys(re.findall(r'href="(https://abituri\.ge/[^"?#]+)"', html3)))
    print('Sample links:')
    for l in all_links[:10]:
        print(' ', l)
