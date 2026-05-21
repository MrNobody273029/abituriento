"""
Get vacancy counts from jobs.ge via pagination (last page × 20).
Also collect salary data from listings.
"""
import urllib.request, re, sys, time, json
sys.stdout.reconfigure(encoding="utf-8")

HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}

CATEGORIES = {
    1:  "ადმინ./მენეჯმენტი",
    3:  "ფინანსები",
    2:  "გაყიდვები",
    4:  "მარკეტინგი",
    18: "ტექნიკური",
    5:  "ლოგისტიკა",
    11: "მშენებლობა",
    6:  "IT/პროგ.",
    13: "მედია",
    12: "განათლება",
    7:  "სამართალი",
    8:  "მედიცინა",
    10: "კვება/სასტ.",
    9:  "სხვა",
}

def fetch(url):
    req = urllib.request.Request(url, headers=HEADERS)
    resp = urllib.request.urlopen(req, timeout=15)
    return resp.read().decode("utf-8", errors="ignore")

def get_last_page(html):
    # Find all page= links and return max
    pages = re.findall(r'\bpage=(\d+)', html)
    return max((int(p) for p in pages), default=1)

def count_listings(html):
    # Count actual job rows on current page
    return len(re.findall(r'class="vip"|/ge/\?view=jobs&id=\d+', html))

def get_salaries(html):
    # Extract salary mentions in ₾
    found = re.findall(r'(\d[\d\s]{1,6}\d)\s*(?:₾|ლარი)', html)
    nums = []
    for f in found:
        try:
            n = int(f.replace(" ", "").replace("\xa0", ""))
            if 300 <= n <= 20000:  # plausible salary range
                nums.append(n)
        except:
            pass
    return nums

results = {}
for cid, name in CATEGORIES.items():
    url = f"https://jobs.ge/?q=&cid={cid}&lid=0&jid=1&in_title=0"
    try:
        html = fetch(url)
        last_page = get_last_page(html)
        on_page = count_listings(html)
        salaries = get_salaries(html)

        # Estimate total: if only 1 page, use actual count; else last_page * 20
        if last_page == 1:
            total = on_page
        else:
            # Fetch last page to get exact count
            last_html = fetch(f"{url}&page={last_page}")
            last_count = count_listings(last_html)
            total = (last_page - 1) * 20 + last_count
            salaries += get_salaries(last_html)

        avg_sal = int(sum(salaries)/len(salaries)) if salaries else None
        results[cid] = {"name": name, "vacancies": total, "avg_salary": avg_sal, "salary_samples": salaries[:5]}

        sal_str = f"~{avg_sal}₾ (n={len(salaries)})" if avg_sal else "ხელფასი: —"
        print(f"cid={cid:2d} | {name:<25} | ვაკანსია: {total:4d} | {sal_str}")
        time.sleep(0.4)
    except Exception as e:
        print(f"cid={cid:2d} | {name:<25} | ERROR: {e}")
        results[cid] = {"name": name, "vacancies": None, "avg_salary": None}

print("\n=== TOP სფეროები (ვაკანსიების მიხედვით) ===")
sorted_r = sorted(results.items(), key=lambda x: x[1]["vacancies"] or 0, reverse=True)
for cid, d in sorted_r:
    print(f"  {d['name']}: {d['vacancies']}")

import json, os
out = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data_structured", "jobsge_counts.json")
os.makedirs(os.path.dirname(out), exist_ok=True)
with open(out, "w", encoding="utf-8") as f:
    json.dump({"source": "jobs.ge", "date": "2026-05-20", "categories": results}, f, ensure_ascii=False, indent=2)
print(f"\nSaved: {out}")
