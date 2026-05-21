import "dotenv/config"
import { prisma } from "../lib/prisma"
async function main() {
  const data = await prisma.marketData.findMany()
  data.forEach(m => {
    console.log(`${m.field.padEnd(22)} grad2025=${String(m.graduated_2025).padEnd(6)} vac=${String((m as any).vacancies_jobsge)}`)
  })
}
main().finally(() => prisma.$disconnect())
