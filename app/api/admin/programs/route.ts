import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const programs = await prisma.program.findMany({
    include: { university: { select: { name_ka: true } } },
    orderBy: { name_ka: "asc" },
  })
  return NextResponse.json(programs)
}
