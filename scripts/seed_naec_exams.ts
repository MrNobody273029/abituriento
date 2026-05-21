import "dotenv/config"
import { prisma } from "../lib/prisma"
import fs from "fs"
import path from "path"

type ExamEntry = {
  subject: string
  coeff: number
  min_pct: number
  priority: number
  is_required: boolean
}

type NaecProgram = {
  naec_code: string
  name_ka: string
  uni_id: string
  uni_name: string
  exams: ExamEntry[]
}

function norm(s: string): string {
  return s
    .toLowerCase()
    .replace(/სსიპ\s*-?\s*/g, "")
    .replace(/შპს\s*-?\s*/g, "")
    .replace(/ა\(ა\)იპ\s*-?\s*/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

function similarity(a: string, b: string): number {
  const na = norm(a)
  const nb = norm(b)
  if (na === nb) return 1.0
  if (na.includes(nb) || nb.includes(na)) return 0.9
  const wa = new Set(na.split(" "))
  const wb = new Set(nb.split(" "))
  const inter = [...wa].filter((w) => wb.has(w)).length
  return inter / Math.max(wa.size, wb.size)
}

async function main() {
  const file = path.join(process.cwd(), "data_structured", "naec_exams_2025.json")
  const { programs: naecProgs }: { programs: NaecProgram[] } = JSON.parse(fs.readFileSync(file, "utf-8"))

  // Group naec programs by uni_id
  const naecByUni = new Map<string, NaecProgram[]>()
  for (const p of naecProgs) {
    if (!naecByUni.has(p.uni_id)) naecByUni.set(p.uni_id, [])
    naecByUni.get(p.uni_id)!.push(p)
  }

  const universities = await prisma.university.findMany({
    include: { programs: { select: { id: true, name_ka: true } } },
  })

  let updated = 0
  let skipped = 0

  for (const dbUni of universities) {
    // Find best-matching NAEC uni by name
    let bestUniKey: string | null = null
    let bestUniScore = 0
    for (const [naecUniId, progs] of naecByUni) {
      const uniName = progs[0]?.uni_name ?? ""
      const score = similarity(dbUni.name_ka, uniName)
      if (score > bestUniScore) {
        bestUniScore = score
        bestUniKey = naecUniId
      }
    }
    if (!bestUniKey || bestUniScore < 0.4) continue

    const naecProgList = naecByUni.get(bestUniKey)!

    for (const dbProg of dbUni.programs) {
      // Find best-matching NAEC program by name
      let bestScore = 0
      let bestNaec: NaecProgram | null = null
      for (const np of naecProgList) {
        const score = similarity(dbProg.name_ka, np.name_ka)
        if (score > bestScore) {
          bestScore = score
          bestNaec = np
        }
      }
      if (!bestNaec || bestScore < 0.5) {
        skipped++
        continue
      }

      await prisma.program.update({
        where: { id: dbProg.id },
        data: { exams: bestNaec.exams as never },
      })
      updated++
    }
  }

  console.log(`✅ Updated: ${updated} programs, Skipped: ${skipped}`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
