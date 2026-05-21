import "dotenv/config"
import { prisma } from "../lib/prisma"

async function main() {
  // Clear page-title garbage: "პროგ. სახელი - უნივ. სახელი | Abituri.ge" pattern
  // These are page titles, not real faculty names
  const r1 = await prisma.program.updateMany({
    where: { faculty_ka: { contains: " - " } },
    data: { faculty_ka: "" },
  })
  console.log(`" - " pattern cleared: ${r1.count}`)

  // Clear anything still containing Abituri.ge
  const r2 = await prisma.program.updateMany({
    where: { faculty_ka: { contains: "Abituri" } },
    data: { faculty_ka: "" },
  })
  console.log(`"Abituri" cleared: ${r2.count}`)

  const remaining = await prisma.program.count({ where: { faculty_ka: { not: "" } } })
  console.log(`\nRemaining non-empty faculty_ka: ${remaining}`)
  if (remaining > 0) {
    const samples = await prisma.program.findMany({
      where: { faculty_ka: { not: "" } },
      take: 10,
      select: { name_ka: true, faculty_ka: true },
    })
    console.log(JSON.stringify(samples, null, 2))
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
