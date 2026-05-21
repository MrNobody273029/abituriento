import "dotenv/config"
import { prisma } from "../lib/prisma"

async function main() {
  const result = await prisma.$executeRaw`
    UPDATE "Program"
    SET grant_score_2025 = ROUND(min_score_2025)::int
    WHERE min_score_2025 IS NOT NULL
      AND grant_score_2025 IS NULL
  `
  console.log(`✅ Set grant_score_2025 for ${result} programs`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
