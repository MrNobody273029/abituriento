import "dotenv/config"
import { prisma } from "../lib/prisma"

async function main() {
  const unis = await prisma.university.count()
  const progs = await prisma.program.count()
  const sample = await prisma.program.findMany({
    take: 3,
    select: { name_ka: true, faculty_ka: true, field: true },
  })
  console.log("Universities:", unis)
  console.log("Programs:", progs)
  console.log("Sample:", JSON.stringify(sample, null, 2))
}

main().catch(console.error).finally(() => prisma.$disconnect())
