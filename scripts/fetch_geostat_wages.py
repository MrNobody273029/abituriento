"""
Fetch wages + employment by NACE sector from GeoStat PX-Web API.
"""
import urllib.request, ssl, sys, json, os
sys.stdout.reconfigure(encoding="utf-8")

HEADERS = {"User-Agent": "Mozilla/5.0", "Content-Type": "application/json"}
CTX = ssl.create_default_context()
CTX.check_hostname = False
CTX.verify_mode = ssl.CERT_NONE
BASE = "https://pc-axis.geostat.ge/PXWeb/api/v1/en/Database"

def get_meta(path):
    url = f"{BASE}/{path}".replace(" ", "%20")
    req = urllib.request.Request(url, headers=HEADERS)
    return json.loads(urllib.request.urlopen(req, timeout=15, context=CTX).read().decode("utf-8-sig", errors="ignore"))

def query(path, body):
    url = f"{BASE}/{path}".replace(" ", "%20")
    req = urllib.request.Request(url, data=json.dumps(body).encode("utf-8"), headers=HEADERS, method="POST")
    return json.loads(urllib.request.urlopen(req, timeout=30, context=CTX).read().decode("utf-8-sig", errors="ignore"))

# ---- Wages by NACE ----
meta = get_meta("Social Statistics/Labour/Wages_Nace2.px")
vars_map = {v["code"]: v for v in meta["variables"]}

# Get all economic activities and latest years
nace_codes = vars_map["Economic Activity"]["values"]
nace_texts = vars_map["Economic Activity"]["valueTexts"]
year_codes = vars_map["Years"]["values"]
latest_years = year_codes[-4:]  # last 4 years

body = {
    "query": [
        {"code": "Sex, Sectors", "selection": {"filter": "item", "values": ["0"]}},  # Total
        {"code": "Economic Activity", "selection": {"filter": "item", "values": nace_codes}},
        {"code": "Years", "selection": {"filter": "item", "values": latest_years}},
        {"code": "Quarters", "selection": {"filter": "item", "values": ["4"]}},  # annual
    ],
    "response": {"format": "json"}
}

resp = query("Social Statistics/Labour/Wages_Nace2.px", body)
data = resp.get("data", [])

print("=== საშუალო თვიური ხელფასი (₾) NACE სექტორების მიხედვით ===")
year_texts = vars_map["Years"]["valueTexts"]
years = [year_texts[year_codes.index(y)] for y in latest_years]
print(f"{'სფერო':<55} | " + " | ".join(f"{y}" for y in years))
print("-" * 100)

# Organize: nace -> year -> value
wage_data = {}
for row in data:
    keys = row["key"]
    val = row["values"][0]
    # keys: [sex_sector, nace, year, quarter]
    nace_idx = nace_codes.index(keys[1])
    year_idx = latest_years.index(keys[2])
    nace_name = nace_texts[nace_idx]
    if nace_name not in wage_data:
        wage_data[nace_name] = {}
    try:
        wage_data[nace_name][years[year_idx]] = round(float(val), 1)
    except:
        wage_data[nace_name][years[year_idx]] = None

for nace_name, ydata in wage_data.items():
    vals = [str(ydata.get(y, "—")) for y in years]
    print(f"{nace_name:<55} | " + " | ".join(f"{v:>6}" for v in vals))

# ---- Also get employed persons by NACE ----
print("\n\n=== დასაქმებულთა რაოდენობა (ათ. კაცი) NACE სექტორების მიხედვით ===")
meta2 = get_meta("Business Statistics/Number of Persons Employed/number_of_persons_employed_seq_NACE_2.px")
vars2 = {v["code"]: v for v in meta2["variables"]}
print("Variables:", [v["code"] for v in meta2["variables"]])
# Print available economic activities
nace2_codes = vars2.get("NACE_2", vars2.get("Economic activity", vars2.get("Kind of Economic Activity", list(vars2.values())[0])))
print("NACE codes sample:", nace2_codes["values"][:5], nace2_codes["valueTexts"][:5])

# Save wage data
out_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data_structured")
os.makedirs(out_dir, exist_ok=True)
with open(os.path.join(out_dir, "geostat_wages_nace.json"), "w", encoding="utf-8") as f:
    json.dump({"source": "GeoStat PX-Web API", "table": "Wages_Nace2", "years": years, "data": wage_data}, f, ensure_ascii=False, indent=2)
print(f"\nSaved wage data to data_structured/geostat_wages_nace.json")
