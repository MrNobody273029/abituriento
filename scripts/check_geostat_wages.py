"""
Navigate GeoStat PX-Web API - explore Social Statistics and Business Statistics for wages.
"""
import urllib.request, ssl, sys, json
sys.stdout.reconfigure(encoding="utf-8")

HEADERS = {"User-Agent": "Mozilla/5.0"}
CTX = ssl.create_default_context()
CTX.check_hostname = False
CTX.verify_mode = ssl.CERT_NONE
BASE = "https://pc-axis.geostat.ge/PXWeb/api/v1/en/Database"

def fetch_json(path):
    url = f"{BASE}/{path}"
    req = urllib.request.Request(url.replace(" ", "%20"), headers=HEADERS)
    data = urllib.request.urlopen(req, timeout=15, context=CTX).read().decode("utf-8", errors="ignore")
    return json.loads(data)

def explore(path, depth=0):
    prefix = "  " * depth
    try:
        items = fetch_json(path)
        for item in items:
            print(f"{prefix}[{item['type']}] {item['id']}")
            if item['type'] == 'l' and depth < 2:
                explore(f"{path}/{item['id']}", depth+1)
            elif item['type'] == 't':
                print(f"{prefix}  ^ TABLE: {item.get('text','')}")
    except Exception as e:
        print(f"{prefix}Error: {e}")

for section in ["Social Statistics", "Business Statistics"]:
    print(f"\n{'='*50}")
    print(f"=== {section} ===")
    explore(section, 0)
