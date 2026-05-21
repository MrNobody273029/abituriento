import { ImageResponse } from "next/og"
import { readFileSync } from "fs"
import { join } from "path"
import { prisma } from "@/lib/prisma"
import { FIELDS, DEGREE_LABELS } from "@/lib/constants"

export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

const FIELD_COLORS: Record<string, string> = {
  education:           "#ea580c",
  humanities:          "#16a34a",
  social_business_law: "#ca8a04",
  science:             "#2563eb",
  engineering:         "#4f46e5",
  agriculture:         "#65a30d",
  health:              "#dc2626",
  services:            "#0891b2",
}

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const fontRegular = readFileSync(join(process.cwd(), "public/fonts/NotoSansGeorgian-Regular.ttf"))
  const fontBold = readFileSync(join(process.cwd(), "public/fonts/NotoSansGeorgian-Bold.ttf"))

  const program = await prisma.program.findUnique({
    where: { id },
    include: { university: { select: { name_ka: true, city: true } } },
  })

  const name = program?.name_ka ?? "სპეციალობა"
  const uniName = program?.university.name_ka ?? ""
  const city = program?.university.city ?? ""
  const fieldKey = program?.field ?? "science"
  const fieldName = FIELDS[fieldKey as keyof typeof FIELDS]?.name_ka ?? fieldKey
  const fieldColor = FIELD_COLORS[fieldKey] ?? "#2563eb"
  const degree = DEGREE_LABELS[program?.degree ?? "bachelor"] ?? "ბაკალავრი"
  const price = program?.tuition_fee ? `${program.tuition_fee.toLocaleString()} ₾/წ.` : ""
  const hasGrant = program?.is_state_funded

  const displayName = name.length > 46 ? name.slice(0, 44) + "…" : name
  const uniLine = city ? `${uniName} · ${city}` : uniName
  const displayUni = uniLine.length > 62 ? uniLine.slice(0, 60) + "…" : uniLine

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
        {/* Accent bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 4,
            height: "100%",
            background: fieldColor,
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

        {/* Program name */}
        <div
          style={{
            display: "flex",
            fontSize: name.length > 38 ? 42 : 52,
            fontWeight: 700,
            color: "white",
            lineHeight: 1.2,
            flex: 1,
            alignItems: "center",
          }}
        >
          {displayName}
        </div>

        {/* University + city */}
        <div
          style={{
            display: "flex",
            fontSize: 22,
            color: "rgba(255,255,255,0.65)",
            marginBottom: 32,
            fontWeight: 400,
          }}
        >
          {displayUni}
        </div>

        {/* Badges row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            borderTop: "1px solid rgba(255,255,255,0.12)",
            paddingTop: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              background: `${fieldColor}22`,
              border: `1px solid ${fieldColor}66`,
              borderRadius: 8,
              padding: "6px 14px",
              fontSize: 18,
              color: fieldColor,
              fontWeight: 600,
            }}
          >
            {fieldName}
          </div>

          <div
            style={{
              display: "flex",
              background: "rgba(255,255,255,0.08)",
              borderRadius: 8,
              padding: "6px 14px",
              fontSize: 18,
              color: "rgba(255,255,255,0.75)",
              fontWeight: 500,
            }}
          >
            {degree}
          </div>

          {price ? (
            <div
              style={{
                display: "flex",
                background: "rgba(255,255,255,0.08)",
                borderRadius: 8,
                padding: "6px 14px",
                fontSize: 18,
                color: "rgba(255,255,255,0.75)",
                fontWeight: 500,
              }}
            >
              {price}
            </div>
          ) : null}

          {hasGrant ? (
            <div
              style={{
                display: "flex",
                background: "#16a34a22",
                border: "1px solid #16a34a66",
                borderRadius: 8,
                padding: "6px 14px",
                fontSize: 18,
                color: "#4ade80",
                fontWeight: 600,
              }}
            >
              სახელმწიფო გრანტი
            </div>
          ) : null}
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
