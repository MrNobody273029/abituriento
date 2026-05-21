import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization")
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  await prisma.marketData.updateMany({
    data: { updated_at: new Date() },
  })

  return NextResponse.json({ ok: true, updated: new Date().toISOString() })
}
