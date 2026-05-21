import "dotenv/config"
import { prisma } from "../lib/prisma"
async function main() {
  const total = await prisma.university.count()
  const withLogo = await prisma.university.count({ where: { logo_url: { not: null } } })
  const sample = await prisma.university.findFirst({ where: { logo_url: { not: null } }, select: { name_ka: true, logo_url: true, slug: true } })
  const noLogo = await prisma.university.findMany({ where: { logo_url: null }, select: { name_ka: true, slug: true } })
  console.log(`Total: ${total}, with logo: ${withLogo}`)
  console.log("Sample:", JSON.stringify(sample))
  console.log("Without logo:", noLogo.map(u => u.name_ka).join("\n"))
}
main().catch(console.error).finally(() => prisma.$disconnect())
