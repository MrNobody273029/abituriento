# -*- coding: utf-8 -*-
"""
Scrapes tuition fees for private college programs from abituri.ge.
Uses programs_full.json to get slugs, then fetches each program page.
Output: data_raw/college_fees_scraped.json  →  { slug: fee_or_null }
"""
import sys, re, json, time, os
import urllib.request, urllib.error

sys.stdout.reconfigure(encoding='utf-8')
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW  = os.path.join(BASE, 'data_raw')

HEADERS = {
    'User-Agent': (
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
        'AppleWebKit/537.36 (KHTML, like Gecko) '
        'Chrome/124.0.0.0 Safari/537.36'
    ),
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'ka,en;q=0.9',
    'Accept-Encoding': 'identity',
}

def fetch(url, retries=3):
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            return urllib.request.urlopen(req, timeout=25).read().decode('utf-8', errors='ignore')
        except urllib.error.HTTPError as e:
            if e.code in (404, 410):
                return ''
            time.sleep(2)
        except Exception as ex:
            time.sleep(2)
    return ''

def extract_fee(html):
    """
    Extract annual tuition fee from abituri.ge program page.
    The page uses: <div data-label="წლიური საფასური">1000 ₾</div>
    Returns: int fee (0 = verified free, None = not found on page)
    """
    # Primary: structured data-label attribute (most reliable)
    m = re.search(r'data-label="წლიური საფასური"[^>]*>\s*(\d[\d\s,]*)\s*(?:₾|ლარ|GEL)', html)
    if m:
        try:
            return int(m.group(1).replace(' ', '').replace(',', ''))
        except Exception:
            pass

    # Fallback: JSON-LD price
    ld = re.search(r'"price"\s*:\s*"?(\d+)"?', html)
    if ld:
        try:
            v = int(ld.group(1))
            if 0 <= v <= 30000:
                return v
        except Exception:
            pass

    # Fallback: generic fee pattern
    m = re.search(r'(?:საფ?ასური|გადასახადი)[^\d]{0,40}(\d[\d\s]{2,5})\s*(?:₾|ლარ)', html, re.I)
    if m:
        try:
            v = int(m.group(1).replace(' ', ''))
            if 0 <= v <= 30000:
                return v
        except Exception:
            pass

    return None  # not found = unknown

# Load raw program data
with open(os.path.join(RAW, 'programs_full.json'), encoding='utf-8') as f:
    programs = json.load(f)

# Target: private colleges with no fee
targets = [
    p for p in programs
    if p['institution_category'] == 'college'
    and not p['institution_slug'].startswith('ssip')
    and (not p.get('tuition_fee') or p['tuition_fee'] == 0)
]

print(f'Targeting {len(targets)} college programs without fees')

results = {}  # slug → fee (or None)

for i, prog in enumerate(targets):
    url = f'https://abituri.ge/faculties/{prog["slug"]}'
    html = fetch(url)
    fee = extract_fee(html) if html else None

    results[prog['slug']] = {
        'name_ka': prog['name_ka'],
        'institution_slug': prog['institution_slug'],
        'fee': fee,
    }

    status = f'{fee} ₾' if fee is not None else 'unknown'
    print(f'  [{i+1:03d}/{len(targets)}] {prog["institution_slug"][:35]} | {prog["name_ka"][:40]} → {status}')
    time.sleep(0.4)

# Summary
found_pos = sum(1 for v in results.values() if v['fee'] is not None and v['fee'] > 0)
found_zero = sum(1 for v in results.values() if v['fee'] == 0)
unknown = sum(1 for v in results.values() if v['fee'] is None)
print(f'\nDone. Fee > 0: {found_pos} | Fee = 0 (free): {found_zero} | Unknown: {unknown}')

out = os.path.join(RAW, 'college_fees_scraped.json')
with open(out, 'w', encoding='utf-8') as f:
    json.dump(results, f, ensure_ascii=False, indent=2)
print(f'Saved → {out}')
