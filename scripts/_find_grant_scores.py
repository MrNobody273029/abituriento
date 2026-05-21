# -*- coding: utf-8 -*-
"""
Find grant score historical data from official Georgian sources.
Target: 50%/70%/100% grant min scores per program, per year.
"""
import urllib.request, re, sys, json
sys.stdout.reconfigure(encoding='utf-8')

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36',
    'Accept-Language': 'ka,en;q=0.9', 'Accept-Encoding': 'identity'
}

def fetch(url, timeout=20):
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        r = urllib.request.urlopen(req, timeout=timeout)
        content = r.read().decode('utf-8', errors='ignore')
        return content, r.status
    except Exception as e:
        return f"ERROR: {e}", 0

# Known NAEC sub-systems
urls_to_try = [
    # NAEC sub-domains
    'https://www.naec.ge',
    'https://results.naec.ge',
    'https://eap.naec.ge',
    'https://entrants.naec.ge',
    'https://registration.naec.ge',
    # Education Analytics Portal
    'https://eap.edu.ge',
    'https://analytics.edu.ge',
    # Ministry of Education
    'https://mes.gov.ge',
    'https://opendata.mes.gov.ge',
    # NAEC API attempts
    'https://naec.ge/api/results',
    'https://naec.ge/api/v1/grant-scores',
    'https://naec.ge/ka/pages/shedegebi',
    'https://naec.ge/ka/pages/statistica',
    'https://naec.ge/ka/pages/download',
    # Old naec
    'https://old.naec.ge/ge/results',
    # Statistics
    'https://geostat.ge/ka/modules/categories/563/umaghlesi-ganatleba',
]

print("Checking official sources for grant scores...\n")
accessible = []
for url in urls_to_try:
    html, status = fetch(url)
    if html.startswith('ERROR'):
        print(f"  ❌ {url}")
    else:
        size = len(html)
        print(f"  ✅ {url} ({size} chars, status={status})")
        accessible.append((url, html))
        # Quick look for relevant content
        if any(x in html.lower() for x in ['grant', 'გრანტ', 'score', 'ქულ', 'shedegebi', 'result', 'statist']):
            links = re.findall(r'href="([^"]*(?:grant|shedegebi|result|statist|download)[^"]*)"', html, re.I)
            for l in links[:3]:
                print(f"    → {l}")

print(f"\n\nAccessible sites: {len(accessible)}")
for url, html in accessible[:3]:
    print(f"\n=== {url} ===")
    text = re.sub(r'<[^>]+>', ' ', html)
    text = re.sub(r'\s+', ' ', text)
    print(text[200:1500])
