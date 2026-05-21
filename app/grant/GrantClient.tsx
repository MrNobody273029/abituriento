"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calculator, Info, Trophy, TrendingUp } from "lucide-react"

type Threshold = {
  id: string
  year: number
  subject: string
  grant_50: number | null
  grant_70: number | null
  grant_100: number | null
}

// Subjects where weight of third exam = 1.5 (standard academic programs)
const THIRD_SUBJECTS = [
  "მათემატიკა",
  "ბიოლოგია",
  "ფიზიკა",
  "ქიმია",
  "ისტორია",
  "გეოგრაფია",
  "სამოქალაქო განათლება",
  "ლიტერატურა",
  "ხელოვნება",
]

function calcAbsoluteScore(geo: number, foreign: number, third: number): number {
  // Formula: (geo×1 + foreign×1 + third×1.5) × 10
  return (geo + foreign + third * 1.5) * 10
}

function getGrantLevel(score: number, threshold: Threshold): "100" | "70" | "50" | "none" {
  if (threshold.grant_100 !== null && score >= threshold.grant_100) return "100"
  if (threshold.grant_70 !== null && score >= threshold.grant_70) return "70"
  if (threshold.grant_50 !== null && score >= threshold.grant_50) return "50"
  return "none"
}

// Defined outside component so React never unmounts/remounts it on re-render
function InputField({
  label, value, onChange, hint,
}: { label: string; value: string; onChange: (v: string) => void; hint?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {hint && <p className="text-xs text-gray-400 mb-1">{hint}</p>}
      <input
        type="number"
        min={0}
        max={200}
        step={0.1}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0 – 200"
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
      />
    </div>
  )
}

const GRANT_COLORS = {
  "100": { bg: "bg-green-100 border-green-300", badge: "bg-green-600 text-white", label: "100%-იანი გრანტი 🏆" },
  "70":  { bg: "bg-blue-100 border-blue-300",  badge: "bg-blue-600 text-white",  label: "70%-იანი გრანტი" },
  "50":  { bg: "bg-yellow-100 border-yellow-300", badge: "bg-yellow-500 text-white", label: "50%-იანი გრანტი" },
  "none":{ bg: "bg-red-50 border-red-200",     badge: "bg-gray-400 text-white",  label: "გრანტის გარეშე" },
}

export default function GrantClient({
  mainSubjects,
  minoritySubjects,
}: {
  mainSubjects: Threshold[]
  minoritySubjects: Threshold[]
}) {
  const [geo, setGeo] = useState("")
  const [foreign, setForeign] = useState("")
  const [third, setThird] = useState("")
  const [selectedSubject, setSelectedSubject] = useState(THIRD_SUBJECTS[0])

  const geoN = parseFloat(geo) || 0
  const foreignN = parseFloat(foreign) || 0
  const thirdN = parseFloat(third) || 0

  const hasInput = geoN > 0 && foreignN > 0 && thirdN > 0

  const absoluteScore = useMemo(
    () => (hasInput ? calcAbsoluteScore(geoN, foreignN, thirdN) : null),
    [geoN, foreignN, thirdN, hasInput]
  )

  const threshold = mainSubjects.find((t) => t.subject === selectedSubject) ?? null
  const grantLevel = absoluteScore !== null && threshold ? getGrantLevel(absoluteScore, threshold) : null

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Calculator className="w-6 h-6 text-[#1E3A8A]" />
          საგრანტო კალკულატორი — 2025
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          შეიყვანე ქულები და გაიგე, 2025 წლის ზღვრების მიხედვით, რა გრანტს მოიპოვებდი.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Calculator */}
        <Card className="border-gray-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">ქულების შეყვანა</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <InputField label="ქართული ენა და ლიტერატურა" value={geo} onChange={setGeo} hint="მაქსიმუმი 200 ქულა (წონა ×1)" />
            <InputField label="უცხოური ენა" value={foreign} onChange={setForeign} hint="მაქსიმუმი 200 ქულა (წონა ×1)" />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">მესამე (სავარჯიშო) საგანი</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
              >
                {THIRD_SUBJECTS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">მაქსიმუმი 200 ქულა (წონა ×1.5)</p>
            </div>

            <InputField label={`${selectedSubject} — ქულა`} value={third} onChange={setThird} />

            {/* Formula explanation */}
            <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500 space-y-1">
              <p className="font-medium text-gray-600">ფორმულა (NAEC 2025):</p>
              <p>(ქართული + უცხოური + მესამე×1.5) × 10 = საგრანტო ქულა</p>
              {hasInput && (
                <p className="text-[#1E3A8A] font-semibold text-sm mt-1">
                  ({geoN} + {foreignN} + {thirdN}×1.5) × 10 = <strong>{absoluteScore?.toFixed(1)}</strong>
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Result */}
        <Card className={`border shadow-sm ${grantLevel ? GRANT_COLORS[grantLevel].bg : "border-gray-100"}`}>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              შედეგი
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!hasInput ? (
              <p className="text-sm text-gray-400">შეიყვანე ქულები მარცხნივ.</p>
            ) : (
              <>
                <div className="text-center py-4">
                  <p className="text-xs text-gray-500 mb-1">შენი საგრანტო ქულა</p>
                  <p className="text-4xl font-bold text-[#1E3A8A]">{absoluteScore?.toFixed(1)}</p>
                  <p className="text-xs text-gray-400 mt-1">საგანი: {selectedSubject}</p>
                </div>

                {grantLevel && (
                  <div className="text-center">
                    <Badge className={`text-sm px-4 py-1 ${GRANT_COLORS[grantLevel].badge}`}>
                      {GRANT_COLORS[grantLevel].label}
                    </Badge>
                  </div>
                )}

                {threshold && (
                  <div className="space-y-2 mt-2">
                    <p className="text-xs font-medium text-gray-600">2025 ზღვრები — {selectedSubject}:</p>
                    {[
                      { level: "100%", val: threshold.grant_100 },
                      { level: "70%", val: threshold.grant_70 },
                      { level: "50%", val: threshold.grant_50 },
                    ].map(({ level, val }) => {
                      if (!val) return null
                      const reached = absoluteScore !== null && absoluteScore >= val
                      return (
                        <div key={level} className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm ${reached ? "bg-green-50 border border-green-200" : "bg-gray-50"}`}>
                          <span className="font-medium">{level} გრანტი</span>
                          <span className={reached ? "text-green-700 font-bold" : "text-gray-500"}>
                            {val.toLocaleString()} {reached ? "✓" : ""}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Info box */}
      <Card className="border-blue-100 bg-blue-50 shadow-sm">
        <CardContent className="p-4 flex gap-3">
          <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800 space-y-1">
            <p className="font-semibold">როგორ გამოითვლება საგრანტო ქულა? (NAEC 2025)</p>
            <p>სამი საგნის სკალირებული ქულები: ქართული (×1) + უცხოური (×1) + მე-3 საგანი (×1.5), ჯამი ×10.</p>
            <p>მიღებული ქულა შედარდება <strong>მე-3 საგნისათვის</strong> გამოყოფილი გრანტის ფარგლებში ყველა გამსვლელის ქულათა სიასთან.</p>
            <p className="text-xs text-blue-600">წყარო: NAEC 2025 საინფორმაციო ცნობარი + ოფიციალური მინიმალური ზღვრები</p>
          </div>
        </CardContent>
      </Card>

      {/* Thresholds Table */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#1E3A8A]" />
          2025 წლის მინიმალური საგრანტო ქულები (NAEC)
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-4 py-3 font-semibold text-gray-700 border-b border-gray-200">საგანი</th>
                <th className="text-center px-4 py-3 font-semibold text-yellow-700 border-b border-gray-200">50% გრანტი</th>
                <th className="text-center px-4 py-3 font-semibold text-blue-700 border-b border-gray-200">70% გრანტი</th>
                <th className="text-center px-4 py-3 font-semibold text-green-700 border-b border-gray-200">100% გრანტი</th>
              </tr>
            </thead>
            <tbody>
              {mainSubjects.map((t, i) => (
                <tr
                  key={t.id}
                  className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${t.subject === selectedSubject ? "bg-blue-50" : i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}
                >
                  <td className="px-4 py-3 font-medium text-gray-900">{t.subject}</td>
                  <td className="px-4 py-3 text-center text-yellow-700 font-mono">{t.grant_50?.toLocaleString() ?? "—"}</td>
                  <td className="px-4 py-3 text-center text-blue-700 font-mono">{t.grant_70?.toLocaleString() ?? "—"}</td>
                  <td className="px-4 py-3 text-center text-green-700 font-mono font-semibold">{t.grant_100?.toLocaleString() ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {minoritySubjects.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-semibold text-gray-500 mb-2">უმცირესობათა ენები (100%-იანი გრანტი)</p>
            <div className="flex flex-wrap gap-2">
              {minoritySubjects.map((t) => (
                <div key={t.id} className="bg-gray-50 rounded-lg px-3 py-2 text-sm">
                  <span className="text-gray-700">{t.subject}:</span>{" "}
                  <span className="font-mono font-semibold text-green-700">{t.grant_100}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <p className="text-xs text-gray-400 mt-3">წყარო: შეფასებისა და გამოცდების ეროვნული ცენტრი (NAEC) — 2025</p>
      </div>
    </div>
  )
}
