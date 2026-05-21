import "dotenv/config"
import { prisma } from "../lib/prisma"

async function main() {
  const rows = await prisma.marketData.findMany()
  let updated = 0

  for (const m of rows) {
    const vac  = (m as any).vacancies_jobsge as number | null
    const grad = m.graduated_2025

    const ratio = (vac != null && grad != null && grad > 0)
      ? Math.round((vac / grad) * 100) / 100
      : null

    await prisma.marketData.update({
      where: { id: m.id },
      data: { supply_demand_ratio: ratio } as never,
    })

    const label = ratio == null ? "N/A" : ratio >= 1.0 ? "🟢 deficit" : ratio >= 0.4 ? "🟡 balanced" : "🔴 saturated"
    console.log(`${m.field.padEnd(22)} ratio=${String(ratio).padEnd(6)} ${label}`)
    updated++
  }

  console.log(`\n✅ Updated ${updated} MarketData rows`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
