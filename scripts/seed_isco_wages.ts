import "dotenv/config"
import { prisma } from "../lib/prisma"
import data from "../data_structured/isco_wages_2024.json"

async function main() {
  let upserted = 0
  for (const p of data.professions) {
    await prisma.professionSalary.upsert({
      where: { isco_code: p.isco_code },
      update: {
        name_ka:            p.name_ka,
        name_en:            p.name_en,
        field:              p.field,
        salary_2021:        p.salary_2021,
        salary_2024est:     p.salary_2024est,
        salary_female_2021: p.salary_female_2021 ?? null,
        salary_male_2021:   p.salary_male_2021   ?? null,
        relevant:           p.relevant,
        source:             p.source,
      },
      create: {
        isco_code:          p.isco_code,
        name_ka:            p.name_ka,
        name_en:            p.name_en,
        field:              p.field,
        salary_2021:        p.salary_2021,
        salary_2024est:     p.salary_2024est,
        salary_female_2021: p.salary_female_2021 ?? null,
        salary_male_2021:   p.salary_male_2021   ?? null,
        relevant:           p.relevant,
        source:             p.source,
      },
    })
    upserted++
  }
  console.log(`✅ Upserted ${upserted} profession salary records`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
