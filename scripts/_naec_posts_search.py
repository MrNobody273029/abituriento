# -*- coding: utf-8 -*-
"""Search naec.ge posts for grant score data and file downloads"""
import urllib.request, re, ssl, sys, json, time
sys.stdout.reconfigure(encoding='utf-8')

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36',
    'Accept-Language': 'ka,en;q=0.9', 'Accept-Encoding': 'identity',
    'Accept': 'application/json, */*',
    'X-Requested-With': 'XMLHttpRequest',
    'Referer': 'https://naec.ge/'
}

def fetch(url):
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        r = urllib.request.urlopen(req, timeout=25)
        return r.read().decode('utf-8', errors='ignore')
    except Exception as e:
        return f'ERROR: {e}'

# 1. Get all categories (try with visible=false option or other params)
print("=== All categories ===")
for params in ['pageSize=-255', 'pageSize=100', 'pageSize=100&showHidden=true']:
    r = fetch(f'https://naec.ge/categories/list?{params}')
    if not r.startswith('ERROR'):
        try:
            data = json.loads(r)
            cats = data.get('results', data) if isinstance(data, dict) else data
            print(f'  {params}: {len(cats)} categories')
            for c in cats:
                print(f'    id={c.get("id")}: {c.get("name")} (visible={c.get("visible")})')
        except Exception as e:
            print(f'  parse error: {e}: {r[:100]}')

# 2. Browse posts with large page - look for grant/calibration
print("\n=== Posts with large page scan (searching for grant scores) ===")
grant_posts = []
file_links = []

for page_idx in range(0, 15):
    r = fetch(f'https://naec.ge/post/list?pageSize=50&pageIndex={page_idx}')
    if r.startswith('ERROR'):
        print(f'  page {page_idx}: {r[:60]}')
        break
    try:
        data = json.loads(r)
        posts = data.get('results', [])
        if not posts:
            print(f'  page {page_idx}: empty, stopping')
            break

        for p in posts:
            pid = p.get('id')
            name = p.get('name', '')
            desc = p.get('desc', '') or ''

            # Search for grant/calibration keywords in Georgian
            keywords = ['გრანტ', 'კალიბრ', 'ქულ', 'შედეგ', 'calibr', 'grant score', 'statist', 'სტატისტ', 'cnobari', 'ცნობარ']
            if any(k.lower() in (name + desc).lower() for k in keywords):
                grant_posts.append({'id': pid, 'name': name[:100]})

            # Find file links in desc
            xls = re.findall(r'href="([^"]*\.(?:xls|xlsx|csv|pdf|doc|docx|zip)[^"]*)"', desc, re.I)
            upload_links = re.findall(r'href="((?:https?://)?(?:naec\.ge|www\.naec\.ge)/uploads/[^"]+)"', desc, re.I)
            for l in xls + upload_links:
                file_links.append({'post_id': pid, 'post_name': name[:60], 'link': l})

        print(f'  page {page_idx}: {len(posts)} posts, total grant matches so far: {len(grant_posts)}, files: {len(file_links)}')
        time.sleep(0.3)
    except Exception as e:
        print(f'  page {page_idx} parse error: {e}')

print(f"\n=== Grant-related posts ({len(grant_posts)}) ===")
for p in grant_posts[:30]:
    print(f"  id={p['id']}: {p['name']}")

print(f"\n=== File links found ({len(file_links)}) ===")
for f in file_links[:30]:
    print(f"  [post {f['post_id']}] {f['post_name']}")
    print(f"    -> {f['link']}")

# 3. Check uploads directory for Excel/PDF files
print("\n=== Checking naec.ge/uploads/ ===")
for path in [
    'https://naec.ge/uploads/',
    'https://naec.ge/uploads/files/',
    'https://naec.ge/uploads/stats/',
    'https://naec.ge/uploads/results/',
    'https://naec.ge/uploads/documents/',
    'https://naec.ge/resources/files/',
]:
    r = fetch(path)
    if not r.startswith('ERROR'):
        print(f'  ✅ {path}: {len(r)} chars')
        links = re.findall(r'href="([^"]+(?:xls|xlsx|csv|pdf)[^"]*)"', r, re.I)
        for l in links[:5]:
            print(f'    → {l}')
    else:
        print(f'  ❌ {path}: {r[:60]}')
