/**
 * Seeds Universities and Programs from scraped abituri.ge data.
 * Reads: data_raw/institutions_full.json + data_raw/programs_full.json
 *
 * Field names follow GeoStat taxonomy (see lib/constants.ts):
 *   education | humanities | social_business_law | science |
 *   engineering | agriculture | health | services
 */
import "dotenv/config"
import { prisma } from "../lib/prisma"
import fs from "fs"
import path from "path"

const RAW = path.join(process.cwd(), "data_raw")

function cleanFacultyKa(v: string | null | undefined): string {
  if (!v) return ""
  if (v.includes("faculty-show") || v.includes(" - ") || v.length < 3) return ""
  return v
}

function cleanAddress(v: string | null | undefined): string | null {
  if (!v) return null
  if (v.includes("@type") || v.includes("addressLocality") || v.startsWith('"')) return null
  return v
}

type ScrapedInstitution = {
  slug: string
  name_ka: string
  name_en: string
  website: string
  logo_url: string | null
  type: string
  category: string
  city: string
  description_ka: string | null
  email: string | null
  phone: string | null
  address: string | null
  program_slugs: string[]
}

type ScrapedProgram = {
  slug: string
  institution_slug: string
  institution_category: string
  name_ka: string
  faculty_ka: string
  degree: string
  duration_years: number
  tuition_fee: number | null
  is_state_funded: boolean
  grant_score_2025: number | null
  seats: number | null
  field: string
}

async function main() {
  const instFile = path.join(RAW, "institutions_full.json")
  const progFile = path.join(RAW, "programs_full.json")

  if (!fs.existsSync(instFile) || !fs.existsSync(progFile)) {
    console.error("Missing scraped data files. Run scripts/scrape_full.py first.")
    process.exit(1)
  }

  const institutions: ScrapedInstitution[] = JSON.parse(fs.readFileSync(instFile, "utf-8"))
  const programs: ScrapedProgram[] = JSON.parse(fs.readFileSync(progFile, "utf-8"))

  console.log(`Loaded ${institutions.length} institutions, ${programs.length} programs`)
  console.log("Clearing existing data...")

  await prisma.program.deleteMany()
  await prisma.university.deleteMany()

  // Build program lookup: institution_slug → programs[]
  const progsByInst = new Map<string, ScrapedProgram[]>()
  for (const p of programs) {
    if (!progsByInst.has(p.institution_slug)) progsByInst.set(p.institution_slug, [])
    progsByInst.get(p.institution_slug)!.push(p)
  }

  let totalUnis = 0
  let totalProgs = 0
  let skipped = 0

  for (const inst of institutions) {
    // Skip if no name
    if (!inst.name_ka || inst.name_ka.length < 3) {
      skipped++
      continue
    }

    const uni = await prisma.university.create({
      data: {
        name_ka:        inst.name_ka,
        name_en:        inst.name_en || inst.slug.replace(/-/g, " "),
        website:        inst.website || `https://abituri.ge/universities/${inst.slug}`,
        logo_url:       inst.logo_url,
        type:           inst.type || "private",
        category:       inst.category || "university",
        city:           inst.city || "თბილისი",
        description_ka: inst.description_ka,
        email:          inst.email,
        phone:          inst.phone,
        address:        cleanAddress(inst.address),
        slug:           inst.slug,
      },
    })
    totalUnis++

    const instProgs = progsByInst.get(inst.slug) || []
    for (const p of instProgs) {
      if (!p.name_ka || p.name_ka.length < 2) continue
      await prisma.program.create({
        data: {
          universityId:    uni.id,
          name_ka:         p.name_ka,
          name_en:         p.slug.replace(/-/g, " "),
          faculty_ka:      cleanFacultyKa(p.faculty_ka),
          degree:          p.degree || "bachelor",
          duration_years:  p.duration_years || 4,
          tuition_fee:     p.tuition_fee || 0,
          is_state_funded: p.is_state_funded,
          grant_score_2025: p.grant_score_2025,
          grant_score_2024: null,
          grant_score_2023: null,
          field:           p.field || "social_business_law",
        },
      })
      totalProgs++
    }

    console.log(`✓ [${inst.category}] ${inst.name_ka.substring(0, 55)} (${instProgs.length} სპეც.)`)
  }

  console.log("\n✅ Done!")
  console.log(`   Institutions: ${totalUnis} (skipped: ${skipped})`)
  console.log(`   Programs:     ${totalProgs}`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
