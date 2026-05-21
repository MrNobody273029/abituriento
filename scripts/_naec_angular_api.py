# -*- coding: utf-8 -*-
import urllib.request, re, sys, ssl
sys.stdout.reconfigure(encoding='utf-8')

# Disable SSL verification for problematic certs
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36',
    'Accept-Language': 'ka,en;q=0.9', 'Accept-Encoding': 'identity',
    'Referer': 'https://naec.ge/',
}

def fetch(url, timeout=20, use_ssl=False):
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        if use_ssl:
            r = urllib.request.urlopen(req, timeout=timeout, context=ctx)
        else:
            r = urllib.request.urlopen(req, timeout=timeout)
        return r.read().decode('utf-8', errors='ignore')
    except Exception as e:
        return f"ERROR: {e}"

# 1. naec.ge AngularJS — find API base URL in page source
html = fetch('https://naec.ge')
# AngularJS apps often have config in index.html
api_urls = re.findall(r'["\'](?:apiUrl|baseUrl|serviceUrl|api_url)["\'][\s:]+["\']([^"\']+)["\']', html)
print("API URLs found in page:", api_urls)

# 2. Try known naec sub-services
test_urls = [
    ('https://es.naec.ge', False),
    ('https://naec.ge/es', False),
    ('https://ems.naec.ge', False),
    ('https://results.naec.ge', False),
    ('https://naec.ge/ka/download', False),
    ('https://naec.ge/en/download', False),
    # Try naec old system
    ('https://old.naec.ge', True),
    ('https://old.naec.ge/ge/static', True),
    # Try other Georgian edu portals
    ('https://eap.edu.ge', False),
    ('https://eaqe.edu.ge', False),
    ('https://saba.edu.ge', False),
    ('https://meis.gov.ge', False),
    # Direct file paths on naec.ge
    ('https://naec.ge/uploads/files/results_2024.xlsx', False),
    ('https://naec.ge/uploads/files/2024_shedegebi.xlsx', False),
    ('https://naec.ge/assets/files/cnobari_2024.pdf', False),
    ('https://naec.ge/assets', False),
    ('https://naec.ge/files', False),
    ('https://naec.ge/static', False),
]

for url, ssl_off in test_urls:
    r = fetch(url, use_ssl=ssl_off)
    if r.startswith('ERROR'):
        print(f"❌ {url}: {r[:60]}")
    else:
        print(f"✅ {url}: {len(r)} chars")
        # Check for useful links
        links = re.findall(r'href="([^"]{5,100})"', r)
        for l in links[:5]:
            if any(x in l.lower() for x in ['result', 'shedegebi', 'grant', 'xls', 'pdf', 'cnobari', 'download']):
                print(f"    → {l}")
        # Check for API calls in JS-like content
        if 'angular' in r.lower() or 'ng-' in r.lower():
            api_calls = re.findall(r'\$http\.get\([\'"]([^\'"]+)[\'"]', r)
            print(f"    Angular API calls: {api_calls[:3]}")
