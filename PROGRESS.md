# Abituriento.ge — სამუშაო პროგრესი

> ყოველი სესიის დასაწყისში წაიკითხე ეს ფაილი. შემდეგ გახსენი CLAUDE.md.
> **წესი: არანაირი გამოგონილი მონაცემი. ყველაფერი ოფიციალური წყაროებიდან.**

---

## 🎯 პროდუქტი

**Abituriento.ge** — ქართველი აბიტურიენტისთვის გადაწყვეტილების მიღების რეალური ინსტრუმენტი.

> "ეს სფერო/სპეციალობა/უნივერსიტეტი ჩემთვის ღირს?"

---

## 📦 DB — Neon PostgreSQL

| Model | ჩანაწ. | შინაარსი |
|---|---|---|
| University | 116 | 56 univ + 60 college |
| Program | 1078 | სახ., ფაკ., ხარ., ფასი, სფერო, გრანტი, exams (651), scores (537), occupation_slug (968) |
| MarketData | 8 | GeoStat სფერო — ჩარიცხვა/კურსდამთ./ხელფ./ვაკ./ratio |
| GrantThreshold | 12 | NAEC 2025 — 9 საგ. × 3 დონე |
| ProfessionSalary | 21 | GeoStat ISCO-08 — 2021 × 1.511 → 2024 est. |
| OccupationSalary | 30 | 30 პროფ. — **GeoStat 2025 preliminary** (Mar 2026), ISCO კოდი, 🇬🇪+🌍 ხელფასი |

---

## ✅ დასრულებული — სრული სია

### მონაცემები
- [x] GeoStat ჩარიცხვა / კურსდამთ. / ხელფასი (NACE + ISCO-08) → DB
- [x] jobs.ge ვაკანსიები → DB + supply_demand_ratio
- [x] 116 სასწ. + 1078 სპეც. → DB
- [x] NAEC GrantThreshold 2025 → DB (9 საგ. × 3 დონე)
- [x] NAEC ჩარიცხულთა სია → admitted/score stats (537 prog with min_score_2025)
- [x] NAEC cnobari 2025 PDF (929 გვ.) → exams JSON (651 prog)
- [x] `grant_score_2025` — 537 prog seeded (round(min_score_2025))
- [x] **OccupationSalary** — 30 პროფ. → DB (`seed_occupations.ts`)
  - **GeoStat 2025 preliminary** (გამოქვ. 2026 მარტი) — ეროვ. საშ. 2,283 ₾ (+15.8%)
  - სექტ. growth rates: IT +9.1%, მშენ. +17.2%, ფინ. +11.1%, ჯანდ./საჯ. +13.0%, ბიზნ. +10.2%
  - 🇬🇪 min/avg/max ₾/თვე + 🌍 int_avg (EUR/USD) ყველასთვის
- [x] **Program.occupation_slug** — 968/1078 mapped (`map_program_occupations.ts`)
  - 110 unmapped: ენის მომზ., vocational edge cases (შედუღება, სარესტ. მომ. etc.)

### UI / Features
- [x] Home, Fields, Programs, Universities, Quiz, Grant კალკ., 404, error, loading
- [x] ქვიზი v2: 7 კითხვა multi-select → `/quiz/results` server component
  - field scoring (`lib/quiz-match.ts`)
  - DB query + group by name_ka + university dropdown (`<details>`)
  - top-3 field market summary (ხელფასი, ვაკ., demand badge)
  - min_score ჩანს university dropdown-ში
  - **🇬🇪 salary_avg + 🌍 salary_int_avg badge — ყველა program card-ზე** ✅ (2025-05-22)
- [x] Programs: search + 2-col + smart pagination (ellipsis) + sort (ანბ. / ფასი / ჩარიცხ. ქულა)
  - ბარიერის ქულა card-ზე ნაჩვენები (537 prog)
- [x] **Program detail sidebar — "კარიერა და ხელფასი" card** ✅ (2025-05-22)
  - 🇬🇪 min/avg/max ₾/თვე (GeoStat/Paylab წყარო)
  - 🌍 int salary (EUR/USD, country, source)
  - პოზიციების სია (5 tag)
- [x] Real logos: universities list, university detail, program cards (96/116)
- [x] University/college გამოყოფა — home, universities, programs, quiz results

### SEO
- [x] Root layout: `metadataBase`, title template, keywords, OG, Twitter (`summary_large_image`), robots, `lang="ka"`, hreflang
- [x] Unique metadata ყველა გვერდზე (title + description + canonical + openGraph)
- [x] `/sitemap.xml` — 1078 programs + 116 universities + static pages
- [x] `/robots.txt` — allow all / disallow /admin /api/
- [x] JSON-LD structured data:
  - Homepage: `WebSite` (SearchAction) + `Organization` + `FAQPage`
  - `/programs/[id]`: `Course` + `BreadcrumbList`
  - `/universities/[id]`: `CollegeOrUniversity` + `BreadcrumbList`
- [x] ISR `revalidate: 86400` — programs/[id] + universities/[id]
- [x] OG Images — Noto Sans Georgian, 1200×630:
  - `app/opengraph-image.tsx` — homepage (gradient + tagline + stats)
  - `app/programs/[id]/opengraph-image.tsx` — per-program (name, univ, field/degree/price/grant)
  - `app/universities/[id]/opengraph-image.tsx` — per-university (name, city, prog count)

### Bug fixes / polish
- [x] Double title bug fix (template duplicate)
- [x] JSON-LD logo.png 404 გასწორდა
- [x] `as any` / type cast გასუფთავება
- [x] naec.ge URL footer-ში (was naec.gov.ge)
- [x] Footer © სიმბოლო
- [x] თავსუმბათო გვერდზე ბმული (ყველა ადგილი)
- [x] **"კვიზი" → "ქვიზი"** ყველა ფაილში (layout, results, page.tsx) ✅ (2025-05-22)

---

## ⏳ გასაკეთებელი

### [1] 📊 Google Search Console
- შენი ვერიფიკაციის კოდი (HTML tag): `<meta name="google-site-verification" content="ᲨᲔᲜᲘ_ᲙᲝᲓᲘ">`
- დაამატე `app/layout.tsx`-ში `metadata` ობიექტში: `verification: { google: "ᲨᲔᲜᲘ_ᲙᲝᲓᲘ" }`
- შემდეგ GSC-ში დაამატე sitemap: `https://www.abituriento.ge/sitemap.xml`

### [2] 💰 OccupationSalary — მომავალი გაუმჯობესება
- **ISCO-08 დეტალური ცხრილები**: geostat.ge/salarium → XLS/CSV სტატ. ცხრ. — პირდაპირი ISCO-08 კატ. 2025 მონ. (ახლა estimation-ით გვაქვს სექტ. growth-ით)
- 110 unmapped prog-ის დამატება (vocational + edge cases: შედუღება, სარესტ. მომ. etc.)
- `hr_specialist` ≈ 0 match — patterns გაძლიერება საჭიროა

---

## 📁 ძირითადი ფაილები

| ფაილი | შინაარსი |
|---|---|
| `prisma/schema.prisma` | University, Program, MarketData, GrantThreshold, ProfessionSalary, **OccupationSalary** |
| `data_structured/occupations_salary.json` | 30 პროფ. — slug, name_ka/en, isco_code, positions_ka, 🇬🇪+🌍 salary, sources |
| `scripts/seed_occupations.ts` | occupations_salary.json → OccupationSalary DB |
| `scripts/map_program_occupations.ts` | Program.name_ka pattern match → occupation_slug |
| `lib/quiz-match.ts` | field scoring — interests/workstyle/strengths/goals → GeoStat |
| `lib/site.ts` | SITE_URL, SITE_NAME constants |
| `components/JsonLd.tsx` | JSON-LD structured data component |
| `app/sitemap.ts` | dynamic sitemap (1194+ URLs) |
| `app/robots.ts` | robots.txt |
| `app/opengraph-image.tsx` | homepage OG image (1200×630) |
| `public/fonts/` | NotoSansGeorgian-Regular.ttf + Bold.ttf (OG images-ისთვის) |
| `scripts/seed_from_scrape.ts` | institutions + programs → DB |
| `scripts/seed_market_data.ts` | GeoStat + jobs.ge → MarketData |
| `scripts/seed_grant_thresholds.ts` | NAEC → GrantThreshold |
| `scripts/seed_naec_exams.ts` | cnobari PDF → Program.exams |
| `scripts/seed_isco_wages.ts` | ISCO-08 → ProfessionSalary |
| `scripts/seed_program_grant_stats.ts` | NAEC ჩარიცხულთა სია → min/median/max scores |
| `scripts/seed_grant_scores.ts` | grant_score_2025 = round(min_score_2025) |
| `scripts/update_supply_demand.ts` | vacancies/graduates → ratio |

---

## ⚙️ გაშვება

```bash
npx next dev --port 3001
npx prisma db push && npx prisma generate
npx tsx scripts/seed_from_scrape.ts
npx tsx scripts/seed_market_data.ts
npx tsx scripts/seed_grant_thresholds.ts
npx tsx scripts/seed_naec_exams.ts
npx tsx scripts/seed_isco_wages.ts
npx tsx scripts/seed_program_grant_stats.ts
npx tsx scripts/seed_grant_scores.ts
npx tsx scripts/update_supply_demand.ts
npx tsx scripts/seed_occupations.ts        # 30 occupation → DB
npx tsx scripts/map_program_occupations.ts # 968/1078 programs → occupation_slug
python scripts/parse_cnobari_exams.py
python scripts/parse_isco_wages.py
```

---

## 🗂️ Field Mapping

| field | ქართ. | supply_demand_ratio |
|---|---|---|
| `services` | მომსახ. | 1.0 🟢 |
| `engineering` | ინჟინ. | 0.85 🟡 |
| `social_business_law` | სოც./ბიზ./სამ. | 0.25 🔴 |
| `education` | განათლება | 0.19 🔴 |
| `science` | მეცნ./IT | 0.16 🔴 |
| `health` | ჯანდაც. | 0.13 🔴 |
| `humanities` | ჰუმანიტ. | 0.01 🔴 |
| `agriculture` | სოფ. მეურნ. | N/A |

---

## 📊 OccupationSalary — 30 პროფ. (GeoStat/Paylab 2024)

| slug | 🇬🇪 საშ. ₾/თვე | 🌍 int (EUR/USD) |
|---|---|---|
| programmer | 2,850 | 5,500 USD |
| dentist | 4,200 | 6,500 EUR |
| doctor | 2,600 | 6,000 EUR |
| lawyer | 2,150 | 4,500 EUR |
| business_manager | 2,700 | 5,000 EUR |
| civil_engineer | 2,050 | 3,800 EUR |
| diplomat | 2,050 | 4,500 EUR |
| architect | 1,850 | 4,000 EUR |
| hr_specialist | 1,750 | 3,500 EUR |
| mechanical_engineer | 1,750 | 3,600 EUR |
| economist | 1,800 | 4,000 EUR |
| electrical_engineer | 1,800 | 3,800 EUR |
| marketing_specialist | 1,700 | 3,500 EUR |
| psychologist | 1,600 | 3,500 EUR |
| accountant | 1,550 | 3,200 EUR |
| translator | 1,550 | 3,000 EUR |
| ecologist | 1,500 | 3,500 EUR |
| logistics | 1,500 | 3,000 EUR |
| pharmacist | 1,900 | 4,200 EUR |
| teacher | 1,450 | 3,000 EUR |
| journalist | 1,450 | 2,800 EUR |
| designer | 1,450 | 3,500 EUR |
| tourism_manager | 1,400 | 2,500 EUR |
| veterinarian | 1,400 | 3,500 EUR |
| sociologist | 1,400 | 3,200 EUR |
| scientist | 1,350 | 4,000 EUR |
| nurse | 1,300 | 2,800 EUR |
| historian | 1,200 | 2,800 EUR |
| social_worker | 1,150 | 2,800 EUR |
| agronomist | 1,150 | 2,500 EUR |
