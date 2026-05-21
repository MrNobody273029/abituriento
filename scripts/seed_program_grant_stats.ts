import "dotenv/config"
import { prisma } from "../lib/prisma"
import fs from "fs"
import path from "path"

type StatEntry = {
  naec_uni_code: string
  uni_name_ka: string
  naec_prog_code: string
  prog_name_ka: string
  total_admitted: number
  min_score: number
  median_score: number
  max_score: number
  grant_50_count: number
  grant_70_count: number
  grant_100_count: number
  grant_any_count: number
  grant_any_pct: number
  db_program_slug: string | null
}

function normName(s: string): string {
  return s
    .toLowerCase()
    .replace(/სსიპ\s*-?\s*/g, "")
    .replace(/შპს\s*-?\s*/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

function similarity(a: string, b: string): number {
  const na = normName(a)
  const nb = normName(b)
  if (na === nb) return 1.0
  if (na.includes(nb) || nb.includes(na)) return 0.9
  const wa = new Set(na.split(" "))
  const wb = new Set(nb.split(" "))
  const inter = [...wa].filter((w) => wb.has(w)).length
  return inter / Math.max(wa.size, wb.size)
}

async function main() {
  const statsFile = path.join(process.cwd(), "data_structured", "program_grant_stats_2025.json")
  const progsFile = path.join(process.cwd(), "data_raw", "programs_full.json")

  const { programs: stats }: { programs: StatEntry[] } = JSON.parse(fs.readFileSync(statsFile, "utf-8"))
  const rawProgs: { slug: string; institution_slug: string; name_ka: string }[] = JSON.parse(fs.readFileSync(progsFile, "utf-8"))

  // Build: program_slug → { institution_slug, name_ka }
  const rawBySlug = new Map(rawProgs.map((p) => [p.slug, p]))

  // Load all universities with their programs
  const universities = await prisma.university.findMany({
    include: { programs: { select: { id: true, name_ka: true } } },
  })
  const uniBySlug = new Map(universities.map((u) => [u.slug ?? "", u]))

  let updated = 0
  let skipped = 0

  for (const stat of stats) {
    if (!stat.db_program_slug) { skipped++; continue }

    const raw = rawBySlug.get(stat.db_program_slug)
    if (!raw) { skipped++; continue }

    const uni = uniBySlug.get(raw.institution_slug)
    if (!uni) { skipped++; continue }

    // Find best-matching program within this university
    let bestId: string | null = null
    let bestSim = 0
    for (const p of uni.programs) {
      const sim = similarity(stat.prog_name_ka, p.name_ka)
      if (sim > bestSim) { bestSim = sim; bestId = p.id }
    }

    if (!bestId || bestSim < 0.55) { skipped++; continue }

    await prisma.program.update({
      where: { id: bestId },
      data: {
        admitted_2025:        stat.total_admitted,
        min_score_2025:       stat.min_score,
        median_score_2025:    stat.median_score,
        max_score_2025:       stat.max_score,
        grant_any_pct_2025:   stat.grant_any_pct,
        grant_50_count_2025:  stat.grant_50_count,
        grant_70_count_2025:  stat.grant_70_count,
        grant_100_count_2025: stat.grant_100_count,
      },
    })
    updated++
  }

  console.log(`\n✅ Updated: ${updated} programs`)
  console.log(`   Skipped: ${skipped} (unmatched or no slug)`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
