import "dotenv/config"
import { prisma } from "../lib/prisma"
import data from "../data_structured/occupations_salary.json"

async function main() {
  let upserted = 0
  for (const occ of data.occupations) {
    await prisma.occupationSalary.upsert({
      where: { slug: occ.slug },
      update: {
        name_ka:             occ.name_ka,
        name_en:             occ.name_en,
        isco_code:           occ.isco_code ?? null,
        positions_ka:        occ.positions_ka,
        salary_min:          occ.salary_min,
        salary_avg:          occ.salary_avg,
        salary_max:          occ.salary_max,
        salary_source_ka:    occ.salary_source_ka,
        salary_int_avg:      occ.salary_int_avg ?? null,
        salary_int_currency: occ.salary_int_currency ?? null,
        salary_int_country:  occ.salary_int_country ?? null,
        salary_int_source:   occ.salary_int_source ?? null,
        year:                data.year,
      },
      create: {
        slug:                occ.slug,
        name_ka:             occ.name_ka,
        name_en:             occ.name_en,
        isco_code:           occ.isco_code ?? null,
        positions_ka:        occ.positions_ka,
        salary_min:          occ.salary_min,
        salary_avg:          occ.salary_avg,
        salary_max:          occ.salary_max,
        salary_source_ka:    occ.salary_source_ka,
        salary_int_avg:      occ.salary_int_avg ?? null,
        salary_int_currency: occ.salary_int_currency ?? null,
        salary_int_country:  occ.salary_int_country ?? null,
        salary_int_source:   occ.salary_int_source ?? null,
        year:                data.year,
      },
    })
    upserted++
    console.log(`  ✓ ${occ.slug} (${occ.name_ka}) — ${occ.salary_avg.toLocaleString()}₾/თვე`)
  }
  console.log(`\n✅ Upserted ${upserted} occupations`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
