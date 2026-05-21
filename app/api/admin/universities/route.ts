import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const universities = await prisma.university.findMany({
    include: { _count: { select: { programs: true } } },
    orderBy: { name_ka: "asc" },
  })
  return NextResponse.json(universities)
}
