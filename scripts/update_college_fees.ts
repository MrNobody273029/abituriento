/**
 * 1. Marks all სსიპ college programs as is_state_funded=true (they're free).
 * 2. Updates tuition_fee from data_raw/college_fees_scraped.json
 *    (scraped from abituri.ge).
 * Matches by: program slug stored in naec_code fallback → name_ka + uni slug.
 */
import "dotenv/config"
import { prisma } from "../lib/prisma"
import fs from "fs"
import path from "path"

async function main() {
  // ── Step 1: Load raw data to get slug→name_ka+inst_slug mapping ──────────
  const raw: {
    slug: string
    institution_slug: string
    institution_category: string
    name_ka: string
    tuition_fee: number | null
    is_state_funded: boolean
  }[] = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "data_raw/programs_full.json"), "utf-8")
  )

  // ── Step 2: Mark სსიპ college programs as state-funded (free) ─────────────
  const ssipSlugs = [
    ...new Set(
      raw
        .filter(p => p.institution_category === "college" && p.institution_slug.startsWith("ssip"))
        .map(p => p.institution_slug)
    ),
  ]

  console.log(`Marking programs at ${ssipSlugs.length} სსიპ colleges as state-funded...`)

  const ssipUnis = await prisma.university.findMany({
    where: { slug: { in: ssipSlugs } },
    select: { id: true, slug: true },
  })

  let ssipUpdated = 0
  for (const uni of ssipUnis) {
    const result = await prisma.program.updateMany({
      where: { universityId: uni.id, is_state_funded: false, tuition_fee: 0 },
      data: { is_state_funded: true },
    })
    ssipUpdated += result.count
  }
  console.log(`  Marked ${ssipUpdated} სსიპ college programs as state-funded (free)`)

  // ── Step 3: Load scraped college fees ─────────────────────────────────────
  const feesFile = path.join(process.cwd(), "data_raw/college_fees_scraped.json")
  if (!fs.existsSync(feesFile)) {
    console.log("No college_fees_scraped.json found — skipping fee updates.")
    console.log("Run: python scripts/scrape_college_fees.py first")
    await prisma.$disconnect()
    return
  }

  const scraped: Record<string, { name_ka: string; institution_slug: string; fee: number | null }> =
    JSON.parse(fs.readFileSync(feesFile, "utf-8"))

  // Build DB index: name_ka → { id, uni_slug }[]
  const dbPrograms = await prisma.program.findMany({
    where: { university: { category: "college" } },
    select: { id: true, name_ka: true, university: { select: { slug: true } } },
  })

  const byName = new Map<string, { id: string; uni_slug: string | null }[]>()
  for (const p of dbPrograms) {
    const key = p.name_ka.trim()
    if (!byName.has(key)) byName.set(key, [])
    byName.get(key)!.push({ id: p.id, uni_slug: p.university.slug })
  }

  let feeUpdated = 0
  let markedFree = 0
  let noMatch = 0

  for (const [, entry] of Object.entries(scraped)) {
    if (entry.fee === null) continue // truly unknown — skip

    const name = entry.name_ka.trim()
    const candidates = byName.get(name) ?? []

    let targetId: string | null = null
    if (candidates.length === 1) {
      targetId = candidates[0].id
    } else if (candidates.length > 1) {
      const match = candidates.find(c => c.uni_slug === entry.institution_slug)
      if (match) targetId = match.id
    }

    if (!targetId) { noMatch++; continue }

    if (entry.fee > 0) {
      // Real paid fee
      await prisma.program.update({
        where: { id: targetId },
        data: { tuition_fee: entry.fee, is_state_funded: false },
      })
      feeUpdated++
    } else {
      // Verified as 0 ₾ on abituri.ge — mark as state-funded (free)
      await prisma.program.update({
        where: { id: targetId },
        data: { tuition_fee: 0, is_state_funded: true },
      })
      markedFree++
    }
  }

  const totalFound = Object.values(scraped).filter(v => v.fee !== null).length
  console.log(`\nScraped: ${totalFound} programs verified on abituri.ge`)
  console.log(`Real fees updated: ${feeUpdated} | Marked free (0 ₾): ${markedFree} | No match: ${noMatch}`)

  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
