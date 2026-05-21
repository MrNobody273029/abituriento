import "dotenv/config"
import { prisma } from "../lib/prisma"
import fs from "fs"
import path from "path"

async function main() {
  const file = path.join(process.cwd(), "data_structured", "grant_thresholds_2025.json")
  const { year, thresholds } = JSON.parse(fs.readFileSync(file, "utf-8"))

  console.log(`Seeding ${thresholds.length} grant thresholds for ${year}...`)

  await prisma.grantThreshold.deleteMany({ where: { year } })

  for (const t of thresholds) {
    await prisma.grantThreshold.create({
      data: {
        year,
        subject:   t.subject,
        grant_50:  t.grant_50,
        grant_70:  t.grant_70,
        grant_100: t.grant_100,
      },
    })
    console.log(`  ✓ ${t.subject}: 50%=${t.grant_50} 70%=${t.grant_70} 100%=${t.grant_100}`)
  }

  console.log(`\n✅ Done: ${thresholds.length} thresholds seeded.`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
