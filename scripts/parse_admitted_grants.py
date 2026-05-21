# -*- coding: utf-8 -*-
"""
Parse ჩარიცხულთა-სია-სახელმწიფო-სასწავლო-გრანტის-მითითებით.xlsx
Aggregate per-program stats and match to our DB programs by name.
Outputs: data_structured/program_grant_stats_2025.json
"""
import openpyxl, sys, json, re, statistics, unicodedata
from collections import defaultdict

sys.stdout.reconfigure(encoding='utf-8')

# ── helpers ──────────────────────────────────────────────────────────────────
def norm(s):
    """Normalize Georgian text for fuzzy matching."""
    if not s: return ""
    s = s.lower().strip()
    # remove prefixes
    for pref in ["სსიპ - ", "სსიპ- ", "სსიპ ", "შპს - ", "შპს- ", "შპს ", "ა(ა)იპ - ", "ა(ა)იპ- ", "ა(ა)იპ "]:
        if s.startswith(pref.lower()):
            s = s[len(pref):]
    # remove city annotations like (ქ. ქუთაისი)
    s = re.sub(r'\(ქ\.?\s*[\w\s]+\)', '', s)
    # collapse spaces
    s = re.sub(r'\s+', ' ', s).strip()
    return s

def score_similarity(a, b):
    """Simple similarity: how many chars of shorter are in longer."""
    if not a or not b: return 0.0
    na, nb = norm(a), norm(b)
    if na == nb: return 1.0
    shorter, longer = (na, nb) if len(na) <= len(nb) else (nb, na)
    # check containment
    if shorter in longer: return 0.9
    # word overlap
    wa = set(shorter.split())
    wb = set(longer.split())
    if not wa or not wb: return 0.0
    return len(wa & wb) / max(len(wa), len(wb))

# ── load Excel ────────────────────────────────────────────────────────────────
print("Loading Excel...")
wb = openpyxl.load_workbook(
    "ჩარიცხულთა-სია-სახელმწიფო-სასწავლო-გრანტის-მითითებით.xlsx",
    read_only=True, data_only=True
)
ws = wb["Sheet1"]
rows = list(ws.iter_rows(values_only=True))
HEADER = rows[0]
data = rows[1:]
print(f"  Rows: {len(data)}")

# ── aggregate per-program ────────────────────────────────────────────────────
# key = (uni_code, prog_code, prog_name, uni_name)
agg = defaultdict(lambda: {
    "uni_code": "", "uni_name": "", "prog_code": "", "prog_name": "",
    "scores": [], "grants": []
})

for r in data:
    uni_code   = str(r[0]).strip() if r[0] else ""
    uni_name   = str(r[1]).strip() if r[1] else ""
    prog_code  = str(r[2]).strip() if r[2] else ""
    prog_name  = str(r[3]).strip() if r[3] else ""
    score      = r[16]  # საკონკ. ქ.
    grant_pct  = r[17]  # None / 50 / 70 / 100

    key = (uni_code, prog_code)
    e = agg[key]
    e["uni_code"]  = uni_code
    e["uni_name"]  = uni_name
    e["prog_code"] = prog_code
    e["prog_name"] = prog_name
    if isinstance(score, (int, float)):
        e["scores"].append(float(score))
    e["grants"].append(grant_pct)

print(f"  Unique programs: {len(agg)}")

# ── compute stats per program ─────────────────────────────────────────────────
stats = []
for key, e in agg.items():
    sc = sorted(e["scores"])
    gr = e["grants"]
    n  = len(gr)
    if n == 0 or not sc:
        continue
    g50  = sum(1 for g in gr if g == 50)
    g70  = sum(1 for g in gr if g == 70)
    g100 = sum(1 for g in gr if g == 100)
    g_any = g50 + g70 + g100

    stats.append({
        "naec_uni_code":  e["uni_code"],
        "uni_name_ka":    e["uni_name"],
        "naec_prog_code": e["prog_code"],
        "prog_name_ka":   e["prog_name"],
        "total_admitted": n,
        "min_score":      round(sc[0], 1),
        "median_score":   round(statistics.median(sc), 1),
        "max_score":      round(sc[-1], 1),
        "grant_50_count":  g50,
        "grant_70_count":  g70,
        "grant_100_count": g100,
        "grant_any_count": g_any,
        "grant_any_pct":  round(g_any / n * 100, 1),
        "db_program_id":  None,  # filled in matching step
        "db_program_slug": None,
    })

print(f"  Stats computed: {len(stats)}")

# ── load our DB programs ──────────────────────────────────────────────────────
with open("data_raw/programs_full.json", encoding="utf-8") as f:
    our_progs = json.load(f)
with open("data_raw/institutions_full.json", encoding="utf-8") as f:
    our_insts = json.load(f)

inst_by_slug = {i["slug"]: i for i in our_insts}

# build prog lookup: institution_slug → list of programs
progs_by_inst = defaultdict(list)
for p in our_progs:
    progs_by_inst[p["institution_slug"]].append(p)

# ── match uni first ───────────────────────────────────────────────────────────
# build naec_uni_code → list of our institution slugs (best match)
naec_unis = {s["naec_uni_code"]: s["uni_name_ka"] for s in stats}
uni_match = {}  # naec_uni_code → institution_slug

for naec_code, naec_uni_name in naec_unis.items():
    best_slug, best_score = None, 0.0
    for inst in our_insts:
        sc = score_similarity(naec_uni_name, inst["name_ka"])
        if sc > best_score:
            best_score = sc
            best_slug = inst["slug"]
    if best_score >= 0.5:
        uni_match[naec_code] = best_slug

print(f"\nUniversity matches: {len(uni_match)} / {len(naec_unis)}")

# ── match programs ────────────────────────────────────────────────────────────
matched = 0
unmatched_progs = []

for s in stats:
    inst_slug = uni_match.get(s["naec_uni_code"])
    if not inst_slug:
        continue
    candidates = progs_by_inst.get(inst_slug, [])
    if not candidates:
        continue
    best_p, best_sc = None, 0.0
    for p in candidates:
        sc = score_similarity(s["prog_name_ka"], p["name_ka"])
        if sc > best_sc:
            best_sc = sc
            best_p = p
    if best_p and best_sc >= 0.6:
        s["db_program_slug"] = best_p["slug"]
        matched += 1

print(f"Program matches: {matched} / {len(stats)} ({matched/len(stats)*100:.1f}%)")

# ── summary stats (for understanding the dataset) ───────────────────────────
total_admitted   = sum(s["total_admitted"] for s in stats)
total_with_grant = sum(s["grant_any_count"] for s in stats)
print(f"\nDataset summary:")
print(f"  Total admitted (academic): {total_admitted:,}")
print(f"  Received any grant: {total_with_grant:,} ({total_with_grant/total_admitted*100:.1f}%)")
print(f"  Received 100% grant: {sum(s['grant_100_count'] for s in stats):,}")
print(f"  Received 70%  grant: {sum(s['grant_70_count']  for s in stats):,}")
print(f"  Received 50%  grant: {sum(s['grant_50_count']  for s in stats):,}")

# top 10 most competitive programs (highest min_score)
top_comp = sorted(stats, key=lambda x: x["min_score"], reverse=True)[:10]
print("\nTop 10 most competitive programs (min_score = last admitted student):")
for s in top_comp:
    print(f"  {s['min_score']:.0f}  {s['prog_name_ka'][:50]}  [{s['uni_name_ka'][:30]}]")

# ── save output ───────────────────────────────────────────────────────────────
output = {
    "year": 2025,
    "source": "NAEC — ჩარიცხულთა სია სახელმწიფო სასწავლო გრანტის მითითებით",
    "total_records": len(data),
    "programs": stats,
}

with open("data_structured/program_grant_stats_2025.json", "w", encoding="utf-8") as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print(f"\n✅ Saved {len(stats)} program stats → data_structured/program_grant_stats_2025.json")
