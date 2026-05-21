import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const [data, allPrograms] = await Promise.all([
    prisma.marketData.findMany({ orderBy: { field: "asc" } }),
    prisma.program.findMany({
      select: { field: true, university: { select: { category: true } } },
    }),
  ])

  const uniCountByField: Record<string, number> = {}
  const collegeCountByField: Record<string, number> = {}

  for (const p of allPrograms) {
    const f = p.field
    if (p.university.category === "college") {
      collegeCountByField[f] = (collegeCountByField[f] ?? 0) + 1
    } else {
      uniCountByField[f] = (uniCountByField[f] ?? 0) + 1
    }
  }

  const enriched = data.map((d) => ({
    ...d,
    program_count:         (uniCountByField[d.field] ?? 0) + (collegeCountByField[d.field] ?? 0),
    uni_program_count:     uniCountByField[d.field] ?? 0,
    college_program_count: collegeCountByField[d.field] ?? 0,
  }))

  return NextResponse.json(enriched)
}
