import { ImageResponse } from "next/og"
import { readFileSync } from "fs"
import { join } from "path"

export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function Image() {
  const fontRegular = readFileSync(join(process.cwd(), "public/fonts/NotoSansGeorgian-Regular.ttf"))
  const fontBold = readFileSync(join(process.cwd(), "public/fonts/NotoSansGeorgian-Bold.ttf"))

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(135deg, #1E3A8A 0%, #1e40af 60%, #2563eb 100%)",
          padding: "60px",
          fontFamily: "Noto Sans Georgian",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -80,
            right: -80,
            width: 320,
            height: 320,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.06)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -60,
            left: -60,
            width: 240,
            height: 240,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.04)",
            display: "flex",
          }}
        />

        {/* Logo row */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "8px 16px",
              fontSize: 22,
              fontWeight: 700,
              color: "#1E3A8A",
            }}
          >
            A
          </div>
          <div style={{ color: "rgba(255,255,255,0.9)", fontSize: 22, fontWeight: 600, display: "flex" }}>
            Abituriento.ge
          </div>
        </div>

        {/* Main content */}
        <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center" }}>
          <div
            style={{
              fontSize: 64,
              fontWeight: 700,
              color: "white",
              lineHeight: 1.15,
              marginBottom: 8,
              display: "flex",
            }}
          >
            გადაწყვეტილება —
          </div>
          <div
            style={{
              fontSize: 64,
              fontWeight: 700,
              color: "white",
              lineHeight: 1.15,
              marginBottom: 24,
              display: "flex",
            }}
          >
            შენი ხელშია.
          </div>
          <div style={{ fontSize: 28, color: "rgba(255,255,255,0.75)", fontWeight: 400, display: "flex" }}>
            უნივერსიტეტი · სპეციალობა · კარიერა
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(255,255,255,0.15)",
            paddingTop: 24,
          }}
        >
          <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 18, display: "flex" }}>
            116 სასწავლებელი · 1 000+ სპეციალობა
          </div>
          <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 18, display: "flex" }}>2025</div>
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
