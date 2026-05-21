# -*- coding: utf-8 -*-
import urllib.request, re, sys
sys.stdout.reconfigure(encoding='utf-8')

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36',
    'Accept-Language': 'ka,en;q=0.9', 'Accept-Encoding': 'identity'
}

def fetch(url):
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        return urllib.request.urlopen(req, timeout=20).read().decode('utf-8', errors='ignore')
    except Exception as e:
        return f"ERROR: {e}"

# Get naec.ge homepage and find all navigation links
html = fetch('https://naec.ge')
print("NAEC.GE navigation links:")
all_links = list(dict.fromkeys(re.findall(r'href="(/[^"#]{2,80})"', html)))
for l in sorted(all_links):
    print(f"  {l}")

print("\nAll abituri-related links:")
links2 = re.findall(r'href="([^"]{5,120})"', html)
for l in links2:
    if any(x in l.lower() for x in ['result', 'shedegebi', 'grant', 'score', 'statist', 'download', 'xls', 'pdf']):
        print(f"  {l}")

# Also check the page text
text = re.sub(r'<[^>]+>', ' ', html)
text = re.sub(r'\s+', ' ', text)
print("\nPage text preview:")
print(text[500:2000])
