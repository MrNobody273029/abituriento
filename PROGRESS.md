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
| Program | 1078 | სახ., ფაკ., ხარ., ფასი, სფერო, გრანტი, exams (651), scores (537) |
| MarketData | 8 | GeoStat სფერო — ჩარიცხვა/კურსდამთ./ხელფ./ვაკ./ratio |
| GrantThreshold | 12 | NAEC 2025 — 9 საგ. × 3 დონე |
| ProfessionSalary | 21 | GeoStat ISCO-08 — 2021 × 1.511 → 2024 est. |

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

### UI / Features
- [x] Home, Fields, Programs, Universities, Quiz, Grant კალკ., 404, error, loading
- [x] Quiz v2: 7 კითხვა multi-select → `/quiz/results` server component
  - field scoring (`lib/quiz-match.ts`)
  - DB query + group by name_ka + university dropdown (`<details>`)
  - top-3 field market summary (ხელფასი, ვაკ., demand badge)
  - min_score ჩანს university dropdown-ში
- [x] Programs: search + 2-col + smart pagination (ellipsis) + sort (ანბ. / ფასი / ჩარიცხ. ქულა)
  - ბარიერის ქულა card-ზე ნაჩვენები (537 prog)
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

---

## ⏳ გასაკეთებელი

### [1] 📊 Google Search Console
- შენი ვერიფიკაციის კოდი (HTML tag): `<meta name="google-site-verification" content="ᲨᲔᲜᲘ_ᲙᲝᲓᲘ">`
- დაამატე `app/layout.tsx`-ში `metadata` ობიექტში: `verification: { google: "ᲨᲔᲜᲘ_ᲙᲝᲓᲘ" }`
- შემდეგ GSC-ში დაამატე sitemap: `https://www.abituriento.ge/sitemap.xml`

---

## 📁 ძირითადი ფაილები

| ფაილი | შინაარსი |
|---|---|
| `prisma/schema.prisma` | University, Program, MarketData, GrantThreshold, ProfessionSalary |
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
