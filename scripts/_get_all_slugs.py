# -*- coding: utf-8 -*-
import urllib.request, re, sys, json
sys.stdout.reconfigure(encoding='utf-8')
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36',
    'Accept-Language': 'ka,en;q=0.9', 'Accept-Encoding': 'identity'
}

def fetch(url):
    req = urllib.request.Request(url, headers=HEADERS)
    return urllib.request.urlopen(req, timeout=30).read().decode('utf-8', errors='ignore')

def get_uni_slugs(url):
    html = fetch(url)
    return list(dict.fromkeys(re.findall(
        r'href="https://abituri\.ge/universities/([^"?#]+)"', html
    )))

# Get slugs from /universities
uni_slugs = get_uni_slugs('https://abituri.ge/universities')
print(f'/universities: {len(uni_slugs)} slugs')

# Get slugs from /colleges (they link to /universities/...)
col_slugs = get_uni_slugs('https://abituri.ge/colleges')
print(f'/colleges: {len(col_slugs)} slugs')

# Get from professional-programs
pp_slugs = get_uni_slugs('https://abituri.ge/professional-programs')
print(f'/professional-programs: {len(pp_slugs)} slugs')

# Combine all unique
all_slugs = list(dict.fromkeys(uni_slugs + col_slugs + pp_slugs))
print(f'\nTotal unique slugs: {len(all_slugs)}')

# Which are new (in colleges but not in /universities)?
new_from_colleges = [s for s in col_slugs if s not in uni_slugs]
print(f'New slugs from /colleges (not in /universities): {len(new_from_colleges)}')
for s in new_from_colleges:
    print(' ', s)

# Tag each slug with category
slug_cats = {}
for s in uni_slugs:
    slug_cats[s] = 'university'
for s in col_slugs:
    if s not in slug_cats:
        slug_cats[s] = 'college'
    else:
        # already categorized - check if it looks like a college
        if 'koleji' in s or 'college' in s:
            slug_cats[s] = 'college'

# Save slug list
with open('data_raw/all_slugs.json', 'w', encoding='utf-8') as f:
    json.dump({'slugs': all_slugs, 'categories': slug_cats}, f, ensure_ascii=False, indent=2)
print(f'\nSaved to data_raw/all_slugs.json')
