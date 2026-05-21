import { ImageResponse } from "next/og"
import { readFileSync } from "fs"
import { join } from "path"
import { prisma } from "@/lib/prisma"
import { TYPE_LABELS } from "@/lib/constants"

export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const fontRegular = readFileSync(join(process.cwd(), "public/fonts/NotoSansGeorgian-Regular.ttf"))
  const fontBold = readFileSync(join(process.cwd(), "public/fonts/NotoSansGeorgian-Bold.ttf"))

  const university = await prisma.university.findUnique({
    where: { id },
    include: { _count: { select: { programs: true } } },
  })

  const name = university?.name_ka ?? "უნივერსიტეტი"
  const city = university?.city ?? ""
  const typeLabel = TYPE_LABELS[university?.type ?? "state"] ?? ""
  const category = university?.category === "college" ? "კოლეჯი" : "უნივერსიტეტი"
  const progCount = university?._count.programs ?? 0
  const isState = university?.type === "state"

  const displayName = name.length > 48 ? name.slice(0, 46) + "…" : name
  const subLine = [city, category, typeLabel].filter(Boolean).join(" · ")

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(135deg, #0f172a 0%, #1E3A8A 100%)",
          padding: "52px 60px",
          fontFamily: "Noto Sans Georgian",
          position: "relative",
        }}
      >
        {/* Top gradient bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: "linear-gradient(90deg, #2563eb, #60a5fa)",
            display: "flex",
          }}
        />

        {/* Site label */}
        <div style={{ display: "flex", marginBottom: 40 }}>
          <div
            style={{
              display: "flex",
              background: "rgba(255,255,255,0.1)",
              borderRadius: 8,
              padding: "5px 14px",
              fontSize: 18,
              color: "rgba(255,255,255,0.7)",
              fontWeight: 600,
            }}
          >
            Abituriento.ge
          </div>
        </div>

        {/* University name */}
        <div
          style={{
            display: "flex",
            fontSize: name.length > 35 ? 40 : 50,
            fontWeight: 700,
            color: "white",
            lineHeight: 1.2,
            flex: 1,
            alignItems: "center",
          }}
        >
          {displayName}
        </div>

        {/* City + category */}
        <div
          style={{
            display: "flex",
            fontSize: 22,
            color: "rgba(255,255,255,0.65)",
            marginBottom: 32,
            fontWeight: 400,
          }}
        >
          {subLine}
        </div>

        {/* Bottom row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            borderTop: "1px solid rgba(255,255,255,0.12)",
            paddingTop: 24,
          }}
        >
          {progCount > 0 ? (
            <div
              style={{
                display: "flex",
                background: "rgba(255,255,255,0.08)",
                borderRadius: 8,
                padding: "6px 16px",
                fontSize: 18,
                color: "rgba(255,255,255,0.8)",
                fontWeight: 600,
              }}
            >
              {progCount} სპეციალობა
            </div>
          ) : null}

          <div
            style={{
              display: "flex",
              background: isState ? "#1d4ed822" : "#71717a22",
              border: isState ? "1px solid #3b82f666" : "1px solid #71717a66",
              borderRadius: 8,
              padding: "6px 14px",
              fontSize: 18,
              color: isState ? "#93c5fd" : "rgba(255,255,255,0.6)",
              fontWeight: 600,
            }}
          >
            {typeLabel} {category}
          </div>

          <div style={{ display: "flex", flex: 1 }} />

          <div style={{ display: "flex", fontSize: 18, color: "rgba(255,255,255,0.4)" }}>
            2025
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Noto Sans Georgian", data: fontRegular, weight: 400, style: "normal" },
        { name: "Noto Sans Georgian", data: fontBold,    weight: 700, style: "normal" },
      ],
    }
  )
}
