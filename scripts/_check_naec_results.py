# -*- coding: utf-8 -*-
"""
Find grant score data on naec.ge:
- Results pages for 2024, 2023, 2022
- Grant barriers: 50%, 70%, 100%
- Per-program last admitted score
"""
import urllib.request, re, sys
sys.stdout.reconfigure(encoding='utf-8')

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36',
    'Accept-Language': 'ka,en;q=0.9', 'Accept-Encoding': 'identity'
}

def fetch(url, timeout=20):
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        return urllib.request.urlopen(req, timeout=timeout).read().decode('utf-8', errors='ignore')
    except Exception as e:
        return f"ERROR: {e}"

# Try naec.ge pages that might have results/grant scores
urls = [
    'https://naec.ge',
    'https://naec.ge/ka/results',
    'https://naec.ge/ka/statistics',
    'https://naec.ge/ka/pages/5',
    'https://naec.ge/en/results',
    'https://old.naec.ge',
    'https://naec.ge/ka/grant',
    'https://naec.ge/ka/news',
    'https://2024.naec.ge',
]

for url in urls:
    html = fetch(url)
    if html.startswith('ERROR'):
        print(f"{url}: {html}")
    else:
        print(f"{url}: OK ({len(html)} chars)")
        # Look for result/score links
        links = re.findall(r'href="([^"]*(?:result|resul|shedegebi|sheded|grant|grani|statistic)[^"]*)"', html, re.I)
        for l in links[:5]:
            print(f"  LINK: {l}")
        # Look for Excel/PDF downloads
        dl = re.findall(r'href="([^"]*\.(?:xlsx|xls|pdf|csv)[^"]*)"', html, re.I)
        for d in dl[:5]:
            print(f"  DOWNLOAD: {d}")
