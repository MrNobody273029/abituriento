import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const [universities, programs, marketData] = await Promise.all([
    prisma.university.count(),
    prisma.program.count(),
    prisma.marketData.count(),
  ])
  return NextResponse.json({ universities, programs, marketData })
}
