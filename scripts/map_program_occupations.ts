import "dotenv/config"
import { prisma } from "../lib/prisma"

// Ordered patterns — first match wins. Most specific first.
const PATTERNS: { includes: string[]; slug: string }[] = [
  // ── Health ──────────────────────────────────────────────────────────
  { includes: ["სტომა", "კბილ"], slug: "dentist" },
  { includes: ["ფარმაც"], slug: "pharmacist" },
  { includes: ["საექთ", "ექთნ", "ექთა", "სამეანო", "ოკუპ. თ", "მასაჟ", "ფიზიო", "სპ. რეაბ", "სპორ. რ"], slug: "nurse" },
  { includes: ["ვეტ"], slug: "veterinarian" },
  { includes: [
      "მედიცინ", "სამედ", "კლინ. ს", "ჯანდაცვ",
      "საზოგ. ჯ", "ს. ჯ.", "ოჯახ. მ", "ესთეტ"
    ], slug: "doctor" },

  // ── Law ─────────────────────────────────────────────────────────────
  { includes: ["სამართ"], slug: "lawyer" },

  // ── IT / Computer Science ───────────────────────────────────────────
  { includes: [
      "კომპიუტ", "ინფ. ტ", "ინფ.ტ", "ინფ-ტ",
      "IT", "I.T", "კიბერ", "ვებ-", "ვებ დ",
      "ინფორმაც", "ინფორმატ", "ციფ. ტ", "ხელ. ინტ",
      "ბიოინფ", "მონაც. ბ", "მონაც.ბ",
      "Front-end", "front-end", "ვებტექ", "ციფ. სატ",
      "პროგრამ", "ტელეკომ", "ნ. ბ-ი",
    ], slug: "programmer" },

  // ── Finance / Accounting ────────────────────────────────────────────
  { includes: ["ბუღ"], slug: "accountant" },
  { includes: ["ბანკ", "ეკონომ", "ფინანს", "საბანკ"], slug: "economist" },

  // ── Business / Management ───────────────────────────────────────────
  { includes: ["ბიზნეს ადმ", "ბიზ.ადმ", "ბიზნ. ადმ"], slug: "business_manager" },
  { includes: ["მენეჯ", "ინოვ", "მეწარ", "ლიდ"], slug: "business_manager" },
  { includes: [
      "მარქეტ", "მარ. კ", "ციფ. მ",
      "ციფრული მ", "ციფ.მ", "PR", "პიარ",
      "სტრატ. კ",
    ], slug: "marketing_specialist" },

  // ── Media / Journalism ──────────────────────────────────────────────
  { includes: [
      "ჟურნ", "მასმ", "კინო", "ტელ.რ", "ტელ-რ",
      "მასობ. კ", "მასობრ. კ", "ციფ. მ", "ციფ. კ",
      "კომუნიკ", "მედია-ა", "ვიდ. მ",
      "მულტ. რ", "ტელ. ა", "ტელ.-ა", "ტელ.ა",
    ], slug: "journalist" },

  // ── Tourism ─────────────────────────────────────────────────────────
  { includes: [
      "ტურიზ", "სტუმ", "ს/ბ. მ", "ს/ბ.მ",
      "ოთ. ბ", "სასტ", "სარ. მ", "ღ-ობ. ო",
      "ღ-ობ", "ღონ", "სარ-ო",
    ], slug: "tourism_manager" },

  // ── Psychology ──────────────────────────────────────────────────────
  { includes: ["ფსიქ"], slug: "psychologist" },

  // ── HR ──────────────────────────────────────────────────────────────
  { includes: ["ადამიანის რ", "ადამ. რ", "HR", "ადამიანური"], slug: "hr_specialist" },

  // ── International Relations / Diplomacy / Public Admin ──────────────
  { includes: [
      "საერთ. ურ", "საერთ.ურ", "საერთ.ო ურ",
      "საერთაშ", "დიპლ", "კავკ. ს",
      "ევროპ", "ამერ", "საჯარო", "სახელმ. მმ",
      "კავკ", "ს-გ. მმ",
    ], slug: "diplomat" },
  { includes: ["პოლიტ"], slug: "diplomat" },

  // ── Philology / Translation / Languages ─────────────────────────────
  { includes: [
      "ფილოლ", "ლინგვ", "თარგმ", "ენათ",
      "ქართ. ლ", "ქართ. ენ", "ინგ. ფ",
      "ინგლ. ენ", "გერმ. ენ", "ფრანგ. ენ",
      "ინგლისური", "გერმანული", "ფრანგული",
      "ქართული ენ", "ქართ.ენ",
      "სლავ", "სემ.", "ბიბლ",
      "ფილოს", "ევ.-ა", "ამ.-ა", "ს.-ა",
      "სინოლ", "არმ", "თურქ", "ასირ",
      "შ. ა.", "კ-ა", "თ-ა", "კ. მ",
    ], slug: "translator" },

  // ── Education / Pedagogy ────────────────────────────────────────────
  { includes: [
      "განათლ", "პედაგ", "სასკ", "სკ. ფ", "ლოგოპ",
      "სკოლამდ", "სკ-ო", "სასკ-ო", "ბ-ო ა-ი",
      "ბ-ო სა.", "ა-ი", "სპ.", "ოლ. ს",
      "სპ. ს-ი", "ფიტნ", "სპ. ს.",
    ], slug: "teacher" },

  // ── Engineering ─────────────────────────────────────────────────────
  { includes: [
      "სამ. ინ", "სამოქ", "მშენ", "გ. ინ",
      "შ-ი", "ს. მ-ი", "გ-ო ი.", "ს-ო ი.",
      "ს-ბ. მ.", "ს-კ ი.", "ს-ო მ.", "ნ-ო ი.",
      "ნ-ბ. ი.", "გ. ი.", "ხ. ი.",
      "ნავ", "საჰ", "გემ",
      "ნავთ", "ს-ო. ი.", "ს-ო.ი.",
      "შ-ბ. მ.", "ხ-ო. ი.", "ს-ბ. ი.",
      "ს-ბ.ი.", "შ-ი.", "ქ-ო. ი.",
      "სასაზ", "ს/მ. ი.", "მ. ი.",
      "ს-ო", "სამშ", "ს.მ.", "ს. ი.",
    ], slug: "civil_engineer" },
  { includes: ["ელ. ინ", "ელექ", "ენერ", "ატომ", "ბირთ", "სამ. ავტ", "ს-ო ავ"], slug: "electrical_engineer" },
  { includes: ["მექ. ინ", "მექ.ინ", "მანქ", "სამ-სა", "ინდ. ინ", "მეტ", "ს-ო. ო.", "ს-ო.ო.", "გემ. მ"], slug: "mechanical_engineer" },
  { includes: ["არქიტ"], slug: "architect" },
  { includes: ["ქიმ. ინ", "ქ. ინ", "ქ.ინ", "ქ-ო. ი.", "ნ. ინ", "ნ.ინ", "ქ-ო ი."], slug: "electrical_engineer" },
  { includes: ["ინჟინ"], slug: "civil_engineer" }, // catch-all engineering

  // ── Agriculture ─────────────────────────────────────────────────────
  { includes: [
      "სოფ. მ", "სოფ.მ", "სოფლ. მ", "სოფლ.მ",
      "აგრო", "აგრარ", "ვინ", "ენოლ",
      "მევენ", "მეცხ", "ტყ", "ტ-ა", "ს-ო. ი. (მ)",
      "სასოფ", "ფ-ვ", "ს-ო ბ.",
    ], slug: "agronomist" },

  // ── Natural Sciences ────────────────────────────────────────────────
  { includes: [
      "ბიოლ", "ბიოქ", "ბიო", "ბ-ო მ.", "მ. ბ.",
      "ქიმია", "ფიზიკ", "მათემ", "ასტრ",
      "ბ-ო ბ.", "ბ-ო", "მ-ო ი.",
      "სურ", "სასუ", "სა-ო პ.", "ს-ო. ტ.",
      "ს-ო.ტ.", "ს-ო ტ.", "ბ-კ",
    ], slug: "scientist" },

  // ── Ecology / Geology ───────────────────────────────────────────────
  { includes: [
      "ეკოლ", "გეოლ", "გეოგ",
      "გარემ", "ბ-ო ს.", "შ-ო უ.", "ს-ო უ.",
      "ს. უ.", "ს.უ.",
    ], slug: "ecologist" },

  // ── Social Work ─────────────────────────────────────────────────────
  { includes: ["სოც. მ", "სოც.მ", "სოციალ. მ", "სოციალური მ"], slug: "social_worker" },

  // ── Logistics / Customs / Transport ─────────────────────────────────
  { includes: [
      "ლოგის", "საბაჟ", "ტრანსპ",
      "გადაზ", "გადაყ", "ს. ლ.", "ს.ლ.",
      "საავ", "სარ-ო", "სა-ო გ.",
    ], slug: "logistics" },

  // ── Design / Arts ───────────────────────────────────────────────────
  { includes: [
      "დიზ", "ხელოვ", "გრაფ", "მხატვ", "ილუს",
      "ინტ. დ", "ინდ. დ", "ა. მ.", "სახ. ხ", "ფ. ხ.",
      "ფერ", "ქანდ", "კ-ო", "ს-ბ-ო",
      "კომპ", "მ-ო ი.", "ს-ო კ.", "ი. ხ.",
      "ს-ბ-ო", "ბ-ო ი.", "ბ-ო ს-ბ.",
    ], slug: "designer" },

  // ── Sociology / Social Science ──────────────────────────────────────
  { includes: ["სოციოლ", "ეთნ", "ს. მ-ვ"], slug: "sociologist" },

  // ── History / Archaeology ───────────────────────────────────────────
  { includes: [
      "ისტ", "არქეო", "კულ. მ",
      "კ-ო ს.", "კ-ო ი.", "ა-ო ი.",
      "ც-ა ი.", "ც-ა კ.", "ც-ა მ.",
    ], slug: "historian" },

  // ── Catch-alls ──────────────────────────────────────────────────────
  { includes: ["ბიზნეს", "ბიზ."], slug: "business_manager" },
  { includes: ["სოციალ"], slug: "sociologist" },
]

function matchOccupation(name_ka: string): string | null {
  const lower = name_ka.toLowerCase()
  for (const { includes, slug } of PATTERNS) {
    for (const kw of includes) {
      if (lower.includes(kw.toLowerCase())) return slug
    }
  }
  return null
}

async function main() {
  const programs = await prisma.program.findMany({ select: { id: true, name_ka: true } })
  console.log(`📋 ${programs.length} programs to map…`)

  const stats: Record<string, number> = {}
  let mapped = 0, skipped = 0

  for (const p of programs) {
    const slug = matchOccupation(p.name_ka)
    if (slug) {
      await prisma.program.update({ where: { id: p.id }, data: { occupation_slug: slug } })
      stats[slug] = (stats[slug] || 0) + 1
      mapped++
    } else {
      skipped++
      console.log(`  ⚠ no match: "${p.name_ka}"`)
    }
  }

  console.log("\n📊 Mapping results:")
  for (const [slug, count] of Object.entries(stats).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${slug}: ${count}`)
  }
  console.log(`\n✅ Mapped: ${mapped} | Skipped (no match): ${skipped}`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
