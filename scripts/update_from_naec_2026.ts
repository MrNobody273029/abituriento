/**
 * Updates Program records from NAEC ცნობარი 2026 data.
 * Updates: tuition_fee, is_state_funded, seats_2026, naec_code
 * Does NOT overwrite: logos, descriptions, occupation_slug, grant scores, etc.
 */
import "dotenv/config"
import { prisma } from "../lib/prisma"
import fs from "fs"
import path from "path"

type PdfProgram = {
  naec_code: string
  name_ka: string
  uni_code: string | null
  tuition_fee: number | null
  is_state_funded: boolean
  seats: number | null
}

async function main() {
  const pdfData: PdfProgram[] = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "data_structured/naec_2026_extracted.json"), "utf-8")
  )
  const uniMapping: Record<string, string> = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "data_structured/naec_uni_mapping.json"), "utf-8")
  )

  console.log(`Loaded ${pdfData.length} PDF programs, ${Object.keys(uniMapping).length} uni mappings`)

  // Load all DB programs with university slug
  const dbPrograms = await prisma.program.findMany({
    select: {
      id: true,
      name_ka: true,
      tuition_fee: true,
      is_state_funded: true,
      university: { select: { slug: true, name_ka: true } },
    },
  })

  console.log(`Loaded ${dbPrograms.length} DB programs`)

  // Index DB programs by name_ka → array of { id, uni_slug }
  const dbByName = new Map<string, { id: string; uni_slug: string | null }[]>()
  for (const p of dbPrograms) {
    const name = p.name_ka.trim()
    if (!dbByName.has(name)) dbByName.set(name, [])
    dbByName.get(name)!.push({ id: p.id, uni_slug: p.university.slug })
  }

  let updated = 0
  let skipped = 0
  let noMatch = 0

  for (const pdf of pdfData) {
    const name = pdf.name_ka.trim()
    const candidates = dbByName.get(name) ?? []

    let targetId: string | null = null

    if (candidates.length === 1) {
      // Unique name — direct match
      targetId = candidates[0].id
    } else if (candidates.length > 1 && pdf.uni_code) {
      // Multiple programs with same name — use university mapping
      const targetSlug = uniMapping[pdf.uni_code]
      const match = candidates.find(c => c.uni_slug === targetSlug)
      if (match) targetId = match.id
    }

    if (!targetId) {
      noMatch++
      continue
    }

    // Build update payload — only set what we have
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: Record<string, any> = {
      naec_code: pdf.naec_code,
    }

    if (pdf.seats !== null) {
      updateData.seats_2026 = pdf.seats
    }

    if (pdf.is_state_funded) {
      updateData.is_state_funded = true
      // Don't override fee if it was already set to something real
      const existing = dbPrograms.find(p => p.id === targetId)
      if (existing && existing.tuition_fee === 0) {
        updateData.tuition_fee = 0
      }
    } else if (pdf.tuition_fee !== null && pdf.tuition_fee > 0) {
      updateData.tuition_fee = pdf.tuition_fee
      updateData.is_state_funded = false
    }

    await prisma.program.update({ where: { id: targetId }, data: updateData })
    updated++

    if (updated % 100 === 0) console.log(`  Updated ${updated}...`)
  }

  console.log(`\nDone. Updated: ${updated}, No match: ${noMatch}, Skipped: ${skipped}`)
  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
