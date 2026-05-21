/**
 * Seeds MarketData with real data from:
 * 1. GeoStat Excel files — admissions & graduates by field 2022-2025
 *    https://www.geostat.ge/ka/modules/categories/61/umaghlesi-ganatleba
 * 2. GeoStat PX-Web API — average monthly salary by NACE sector (Wages_Nace2.px)
 *    https://pc-axis.geostat.ge/PXWeb/api/v1/en/Database/Social Statistics/Labour/Wages_Nace2.px
 * 3. jobs.ge — vacancy counts by category (scraped 2026-05-20)
 * No fabricated values. All numbers from official sources.
 */
import "dotenv/config"
import { prisma } from "../lib/prisma"

// GeoStat: total admissions (state + private), by field, by academic year
const ADMISSIONS: Record<string, Record<string, number>> = {
  "2022-2023": {
    education: 1741, humanities: 4674, social_business_law: 20000,
    science: 6907, engineering: 2952, agriculture: 1192, health: 9587, services: 3075,
  },
  "2023-2024": {
    education: 2240, humanities: 4744, social_business_law: 22191,
    science: 8234, engineering: 3225, agriculture: 1270, health: 8894, services: 3529,
  },
  "2024-2025": {
    education: 2198, humanities: 4424, social_business_law: 19602,
    science: 8034, engineering: 3042, agriculture: 1151, health: 13058, services: 2703,
  },
  "2025-2026": {
    education: 2686, humanities: 4541, social_business_law: 22826,
    science: 7942, engineering: 3409, agriculture: 1216, health: 13140, services: 2794,
  },
}

// GeoStat: graduates (state + private), by field, by calendar year
const GRADUATES: Record<string, Record<string, number>> = {
  "2022": {
    education: 1188, humanities: 2288, social_business_law: 11376,
    science: 3618, engineering: 1540, agriculture: 453, health: 3814, services: 1501,
  },
  "2023": {
    education: 1290, humanities: 2399, social_business_law: 11759,
    science: 3236, engineering: 1617, agriculture: 343, health: 3943, services: 1725,
  },
  "2024": {
    education: 1220, humanities: 2081, social_business_law: 13329,
    science: 2907, engineering: 1624, agriculture: 551, health: 5987, services: 1872,
  },
  "2025": {
    education: 1849, humanities: 2383, social_business_law: 14090,
    science: 3189, engineering: 1594, agriculture: 569, health: 7016, services: 1804,
  },
}

// GeoStat PX-Web: Average Monthly Nominal Salary (₾) by NACE Rev.2, annual
// Source: Social Statistics/Labour/Wages_Nace2.px
// Mapping: GeoStat education field → closest NACE sector(s)
// education    → NACE P: Education (941.6 / 1061.6 / 1233.3)
// humanities   → NACE R: Arts, entertainment and recreation (1482.3 / 1654.1 / 1818.5)
// social_biz_law → NACE K+J+M avg: Finance(2730/3215/3677) + IT(3033/3858/3923) + Prof/sci(2285/2506/2823) + Trade(1356/1531/1710)
//   → weighted toward Finance+Trade+Admin: ~2200 / ~2500 / ~2700 (Finance+Trade avg)
// science      → NACE J: Information and communication (3033.4 / 3858.5 / 3923.1)
// engineering  → NACE F: Construction (2040.1 / 2311.7 / 2666.6)
// agriculture  → NACE A: Agriculture, forestry and fishing (1061.2 / 1206.5 / 1281.9)
// health       → NACE Q: Human health and social work (1395.8 / 1513.9 / 1653.8)
// services     → NACE I+H avg: Transport(1680/1846/1972) + Accommodation(1163/1354/1495) → avg ~1420/1600/1734
const WAGES: Record<string, { y2022: number; y2023: number; y2024: number }> = {
  education:            { y2022: 941.6,  y2023: 1061.6, y2024: 1233.3 },
  humanities:           { y2022: 1482.3, y2023: 1654.1, y2024: 1818.5 },
  social_business_law:  { y2022: 2043.0, y2023: 2373.5, y2024: 2694.3 }, // (Finance+Trade)/2
  science:              { y2022: 3033.4, y2023: 3858.5, y2024: 3923.1 }, // IT/Communication
  engineering:          { y2022: 2040.1, y2023: 2311.7, y2024: 2666.6 }, // Construction
  agriculture:          { y2022: 1061.2, y2023: 1206.5, y2024: 1281.9 },
  health:               { y2022: 1395.8, y2023: 1513.9, y2024: 1653.8 },
  services:             { y2022: 1421.9, y2023: 1600.4, y2024: 1733.7 }, // (Transport+Accommodation)/2
}

// jobs.ge vacancy counts per category, scraped 2026-05-20
// Mapping: GeoStat field → most relevant jobs.ge cid(s) summed
// education: cid=12 (განათლება) = 357
// humanities: cid=13 (მედია) = 15
// social_business_law: cid=1(ადმინ/მენეჯ 912) + cid=3(ფინ 900) + cid=2(გაყ 918) + cid=7(სამართ 171) + cid=4(მარკ 567) = 3468
// science: cid=6 (IT) = 513
// engineering: cid=18(ტექნ 897) + cid=11(მშენ 456) = 1353
// agriculture: no direct category = null
// health: cid=8 (მედ) = 903
// services: cid=5(ლოგ 903) + cid=10(კვება 903) = 1806
const VACANCIES: Record<string, number | null> = {
  education:           357,
  humanities:           15,
  social_business_law: 3468,
  science:              513,
  engineering:         1353,
  agriculture:          null,
  health:               903,
  services:            1806,
}

// Sub-program breakdown, 2024-2025, state universities (GeoStat file 02)
const SUBPROGRAMS_2024: Record<string, object> = {
  education: { "მასწავლებელთა მომზადება": 569 },
  humanities: { "ხელოვნება": 906, "ჰუმანიტარული მეცნიერებები": 3022 },
  social_business_law: {
    "სოციალური და ბიჰევიორისტული მეცნ.": 4011,
    "ჟურნალისტიკა და ინფორმაცია": 621,
    "ბიზნესი და მართვა": 7466,
    "სამართალი": 4012,
  },
  science: {
    "სიცოცხლის მეცნიერებები": 2176,
    "ფიზიკური მეცნიერებები": 1027,
    "მათემატიკა და სტატისტიკა": 195,
    "კომპიუტერული საქმე (IT)": 3279,
  },
  engineering: {
    "ინჟინერია": 1136,
    "საწარმოო და დამამუშავებელი": 164,
    "არქიტექტურა და მშენებლობა": 1193,
  },
  agriculture: { "სასოფლო-სამეურნეო": 824 },
  health: { "ჯანდაცვა": 2700, "სოციალური უზრუნველყოფა": 30 },
  services: {
    "მომსახურების სფერო": 1177,
    "ტრანსპორტი": 832,
    "გარემოს დაცვა": 146,
  },
}

const FIELD_NAMES_KA: Record<string, string> = {
  education: "განათლება",
  humanities: "ჰუმანიტარული მეცნ. და ხელოვნება",
  social_business_law: "სოციალური მეცნ., ბიზნესი, სამართალი",
  science: "მეცნიერება (IT ჩათვლით)",
  engineering: "საინჟინრო და მშენებლობა",
  agriculture: "სოფლის მეურნეობა",
  health: "ჯანდაცვა",
  services: "მომსახურება",
}

function calcTrend(field: string): { trend: string; pct: number } {
  const v2022 = ADMISSIONS["2022-2023"][field] ?? 0
  const v2024 = ADMISSIONS["2024-2025"][field] ?? 0
  if (!v2022) return { trend: "stable", pct: 0 }
  const pct = ((v2024 - v2022) / v2022) * 100
  return {
    trend: pct >= 8 ? "growing" : pct <= -8 ? "declining" : "stable",
    pct: Math.round(pct * 10) / 10,
  }
}

async function main() {
  console.log("Seeding MarketData with real GeoStat + jobs.ge data...\n")
  await prisma.marketData.deleteMany()

  for (const field of Object.keys(FIELD_NAMES_KA)) {
    const { trend, pct } = calcTrend(field)
    const w = WAGES[field]

    await prisma.marketData.create({
      data: {
        field,
        field_name_ka: FIELD_NAMES_KA[field],
        admitted_2022: ADMISSIONS["2022-2023"][field] ?? null,
        admitted_2023: ADMISSIONS["2023-2024"][field] ?? null,
        admitted_2024: ADMISSIONS["2024-2025"][field] ?? null,
        admitted_2025: ADMISSIONS["2025-2026"][field] ?? null,
        graduated_2022: GRADUATES["2022"][field] ?? null,
        graduated_2023: GRADUATES["2023"][field] ?? null,
        graduated_2024: GRADUATES["2024"][field] ?? null,
        graduated_2025: GRADUATES["2025"][field] ?? null,
        trend,
        trend_pct: pct,
        subprograms: SUBPROGRAMS_2024[field] ?? null,
        avg_salary_2022: w?.y2022 ?? null,
        avg_salary_2023: w?.y2023 ?? null,
        avg_salary_2024: w?.y2024 ?? null,
        vacancies_jobsge: VACANCIES[field] ?? null,
        source: "GeoStat (geostat.ge) + jobs.ge scrape 2026-05-20",
      },
    })

    const sal = w ? `${w.y2024.toLocaleString()}₾/თვე` : "—"
    const vac = VACANCIES[field] != null ? `${VACANCIES[field]} ვაკ.` : "—"
    console.log(`✓ ${FIELD_NAMES_KA[field]}`)
    console.log(`    ხელფასი 2024: ${sal} | ვაკანსია: ${vac} | trend: ${trend} (${pct > 0 ? "+" : ""}${pct}%)`)
  }

  console.log("\n✅ Done!")
  const count = await prisma.marketData.count()
  console.log(`Records: ${count}`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
