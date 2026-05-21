import "dotenv/config"
import { prisma } from "../lib/prisma"

async function main() {
  const unis = await prisma.university.count()
  const progs = await prisma.program.count()
  const fields = await prisma.program.groupBy({ by: ["field"], _count: { field: true } })
  console.log("Universities:", unis)
  console.log("Programs:", progs)
  console.log("Fields:", JSON.stringify(fields, null, 2))
  const sampleUni = await prisma.university.findFirst({ include: { programs: { take: 3 } } })
  console.log("Sample uni:", JSON.stringify(sampleUni, null, 2))
}
main().catch(console.error).finally(() => prisma.$disconnect())
