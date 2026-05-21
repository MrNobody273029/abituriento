# -*- coding: utf-8 -*-
"""Find downloadable datasets on GeoStat education categories"""
import urllib.request, re, ssl, sys
sys.stdout.reconfigure(encoding='utf-8')

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36',
    'Accept-Language': 'ka,en;q=0.9', 'Accept-Encoding': 'identity',
}

def fetch(url, timeout=25):
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        r = urllib.request.urlopen(req, timeout=timeout, context=ctx)
        return r.read().decode('utf-8', errors='ignore'), r.status
    except Exception as e:
        return f'ERROR: {e}', 0

# GeoStat education higher-ed page — find all stat links inside
url = 'https://geostat.ge/ka/modules/categories/563/umaghlesi-ganatleba'
r, s = fetch(url)
if r.startswith('ERROR'):
    print(f'ERROR: {r}')
else:
    # Find links to individual stat pages
    stat_links = list(dict.fromkeys(re.findall(r'href="(https://geostat\.ge/ka/modules/statistic/[^"]+)"', r)))
    print(f'Stat links ({len(stat_links)}):')
    for l in stat_links[:30]:
        print(f'  {l}')

    # Also find all xls/xlsx links
    xls_links = list(dict.fromkeys(re.findall(r'href="([^"]*\.xls[x]?[^"]*)"', r, re.I)))
    print(f'\nXLS links ({len(xls_links)}):')
    for l in xls_links[:10]:
        print(f'  {l}')

    # Find xlsx on sub-pages
    print('\n\n=== Checking each stat page for XLS downloads ===')
    for slink in stat_links[:15]:
        sr, ss = fetch(slink)
        if sr.startswith('ERROR'):
            print(f'❌ {slink}: {sr[:60]}')
            continue
        xls = list(dict.fromkeys(re.findall(r'href="([^"]*\.xls[x]?[^"]*)"', sr, re.I)))
        pdfs = list(dict.fromkeys(re.findall(r'href="([^"]*\.pdf[^"]*)"', sr, re.I)))
        text = re.sub(r'<[^>]+>', ' ', sr)
        text = re.sub(r'\s+', ' ', text).strip()
        title = text[:100]
        if xls or pdfs:
            print(f'\n✅ {slink}')
            print(f'   Title: {title}')
            for x in xls[:5]:
                print(f'   XLS: {x}')
            for p in pdfs[:3]:
                print(f'   PDF: {p}')
        else:
            print(f'  {slink}: {title[:80]}')
