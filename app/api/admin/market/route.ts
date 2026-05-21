import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const data = await prisma.marketData.findMany({ orderBy: { field: "asc" } })
  return NextResponse.json(data)
}
