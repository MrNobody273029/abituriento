import "dotenv/config"
import { prisma } from "../lib/prisma"

async function main() {
  const withScore = await prisma.program.count({ where: { min_score_2025: { not: null } } })
  const withGrant = await prisma.program.count({ where: { grant_score_2025: { not: null } } })
  const total = await prisma.program.count()
  console.log("total:", total)
  console.log("min_score_2025 set:", withScore)
  console.log("grant_score_2025 set:", withGrant)
  
  // Sample a few programs with scores
  const sample = await prisma.program.findMany({
    where: { min_score_2025: { not: null } },
    take: 5,
    select: { name_ka: true, min_score_2025: true, grant_score_2025: true, grant_any_pct_2025: true }
  })
  console.log("\nSample programs with scores:")
  sample.forEach(p => console.log(` ${p.name_ka.slice(0,40)} | min=${p.min_score_2025} | grant_score=${p.grant_score_2025} | any_grant%=${p.grant_any_pct_2025}`))
}
main().catch(console.error).finally(() => prisma.$disconnect())
