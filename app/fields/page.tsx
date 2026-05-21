export const dynamic = "force-dynamic"

import Link from "next/link"
import { TrendingUp, TrendingDown, Minus, ArrowRight, BookOpen, Users, GraduationCap, Briefcase, Banknote } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import { TREND_LABELS } from "@/lib/constants"
import FieldIcon from "@/components/FieldIcon"

import { SITE_URL } from "@/lib/site"

export const metadata = {
  title: "სფეროები და კარიერა — შრომის ბაზარი საქართველოში 2025",
  description:
    "კარიერის არჩევანი: ხელფასები, ვაკანსიები და კარიერული ტენდენციები 8 სფეროში — GeoStat და jobs.ge 2025. IT, მედიცინა, სამართალი, ბიზნესი, ინჟინერია.",
  keywords: ["კარიერა საქართველოში", "შრომის ბაზარი 2025", "საშუალო ხელფასი სფეროები", "ვაკანსიები საქართველო"],
  alternates: { canonical: `${SITE_URL}/fields` },
  openGraph: {
    title: "სფეროები და კარიერა — შრომის ბაზარი საქართველოში 2025",
    description: "ხელფასები, ვაკანსიები და ტენდენციები 8 სფეროში · GeoStat & jobs.ge 2025",
    url: `${SITE_URL}/fields`,
  },
}

const TREND_COLORS: Record<string, string> = {
  growing: "text-[#16A34A]",
  stable: "text-gray-500",
  declining: "text-[#DC2626]",
}

const TREND_BG: Record<string, string> = {
  growing: "bg-green-50 text-green-800 border-green-200",
  stable: "bg-gray-50 text-gray-600 border-gray-200",
  declining: "bg-red-50 text-red-800 border-red-200",
}

const FIELD_ACCENT: Record<string, string> = {
  education:           "#f97316",
  humanities:          "#16a34a",
  social_business_law: "#ca8a04",
  science:             "#2563eb",
  engineering:         "#4f46e5",
  agriculture:         "#65a30d",
  health:              "#dc2626",
  services:            "#0891b2",
}

function TrendIcon({ trend }: { trend: string }) {
  const cls = TREND_COLORS[trend] || "text-gray-400"
  if (trend === "growing") return <TrendingUp className={`w-5 h-5 ${cls}`} />
  if (trend === "declining") return <TrendingDown className={`w-5 h-5 ${cls}`} />
  return <Minus className={`w-5 h-5 ${cls}`} />
}

function AdmissionBar({ value, max, year, color = "#1E3A8A" }: { value: number; max: number; year: string; color?: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-14 text-gray-500 shrink-0">{year}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-2">
        <div className="h-2 rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="w-16 text-right font-medium text-gray-800">{value.toLocaleString()}</span>
    </div>
  )
}

export default async function FieldsPage() {
  const [marketData, programCounts, professions] = await Promise.all([
    prisma.marketData.findMany({ orderBy: { admitted_2024: "desc" } }),
    prisma.program.groupBy({ by: ["field"], _count: { field: true } }),
    prisma.professionSalary.findMany({ where: { relevant: true }, orderBy: { salary_2024est: "desc" } }),
  ])

  const countMap = Object.fromEntries(
    programCounts.map((p: { field: string; _count: { field: number } }) => [p.field, p._count.field])
  )

  const profByField: Record<string, typeof professions> = {}
  for (const p of professions) {
    if (!profByField[p.field]) profByField[p.field] = []
    profByField[p.field].push(p)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">სფეროები — რეალური სტატისტიკა</h1>
        <p className="text-gray-500 max-w-2xl mx-auto">
          ჩარიცხვისა და დამთავრების მონაცემები GeoStat-ის ოფიციალური მონაცემების მიხედვით, 2022–2025.
        </p>
        <p className="text-xs text-gray-400 mt-2">
          წყარო: სტატისტიკის ეროვნული სამსახური (geostat.ge) — სახელმწიფო და კერძო უნივერსიტეტები ჯამში
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {marketData.map((md) => {
          const admissions = [
            { year: "2022-23", val: md.admitted_2022 },
            { year: "2023-24", val: md.admitted_2023 },
            { year: "2024-25", val: md.admitted_2024 },
            { year: "2025-26", val: md.admitted_2025 },
          ].filter((a): a is { year: string; val: number } => a.val != null)

          const graduates = [
            { year: "2022", val: md.graduated_2022 },
            { year: "2023", val: md.graduated_2023 },
            { year: "2024", val: md.graduated_2024 },
            { year: "2025", val: md.graduated_2025 },
          ].filter((g): g is { year: string; val: number } => g.val != null)

          const maxAdmitted = admissions.length > 0 ? Math.max(...admissions.map((a) => a.val)) : 1
          const subs = md.subprograms as Record<string, number> | null
          const programCount = countMap[md.field] || 0
          const fieldProfs = profByField[md.field] || []

          const accent = FIELD_ACCENT[md.field] || "#1E3A8A"
          return (
            <div key={md.field} className="bg-white rounded-2xl border border-gray-100 border-l-[4px] shadow-sm p-6 flex flex-col gap-4" style={{ borderLeftColor: accent }}>
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: `${accent}1a` }}>
                    <span style={{ color: accent }}><FieldIcon field={md.field} className="w-6 h-6" /></span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base leading-tight">{md.field_name_ka}</h3>
                    {programCount > 0 && (
                      <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                        <BookOpen className="w-3 h-3" />
                        <span>{programCount} სპეციალობა</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <TrendIcon trend={md.trend} />
                  <Badge variant="outline" className={`text-xs border ${TREND_BG[md.trend]}`}>
                    {TREND_LABELS[md.trend]}
                    {md.trend_pct != null && (
                      <span className="ml-1 opacity-75">
                        ({md.trend_pct > 0 ? "+" : ""}{md.trend_pct}%)
                      </span>
                    )}
                  </Badge>
                </div>
              </div>

              {/* Admissions bar chart */}
              {admissions.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Users className="w-3.5 h-3.5 text-[#1E3A8A]" />
                    <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">ჩარიცხული სტუდენტები</p>
                  </div>
                  <div className="space-y-1.5">
                    {admissions.map((a) => (
                      <AdmissionBar key={a.year} value={a.val} max={maxAdmitted} year={a.year} color={accent} />
                    ))}
                  </div>
                </div>
              )}

              {/* Graduates row */}
              {graduates.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <GraduationCap className="w-3.5 h-3.5 text-gray-600" />
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">კურსდამთავრებული</p>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {graduates.map((g) => (
                      <div key={g.year} className="text-center">
                        <p className="text-[11px] text-gray-400">{g.year}</p>
                        <p className="text-sm font-bold text-gray-800">{g.val.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Salary + Vacancies */}
              {(md.avg_salary_2024 != null || md.vacancies_jobsge != null) && (
                <div className="grid grid-cols-2 gap-3">
                  {md.avg_salary_2024 != null && (
                    <div className="bg-blue-50 rounded-xl p-3">
                      <div className="flex items-center gap-1 mb-1">
                        <Banknote className="w-3.5 h-3.5 text-[#1E3A8A]" />
                        <p className="text-xs font-semibold text-[#1E3A8A] uppercase tracking-wide">საშუალო ხელფასი</p>
                      </div>
                      <p className="text-lg font-bold text-gray-900">
                        {Math.round(md.avg_salary_2024).toLocaleString()} <span className="text-sm font-normal">₾/თვე</span>
                      </p>
                      {md.avg_salary_2022 != null && (
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          2022: {Math.round(md.avg_salary_2022).toLocaleString()}₾ → 2024
                        </p>
                      )}
                      <p className="text-[10px] text-gray-400 mt-0.5">GeoStat NACE, 2024</p>
                    </div>
                  )}
                  {md.vacancies_jobsge != null && (
                    <div className="bg-orange-50 rounded-xl p-3">
                      <div className="flex items-center gap-1 mb-1">
                        <Briefcase className="w-3.5 h-3.5 text-[#F97316]" />
                        <p className="text-xs font-semibold text-[#F97316] uppercase tracking-wide">ვაკანსიები</p>
                      </div>
                      <p className="text-lg font-bold text-gray-900">
                        {md.vacancies_jobsge.toLocaleString()}
                      </p>
                      {md.graduated_2025 != null && md.vacancies_jobsge != null && (
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          {md.graduated_2025.toLocaleString()} კურსდამთავრებული / {md.vacancies_jobsge.toLocaleString()} ვაკანსია
                        </p>
                      )}
                      <p className="text-[10px] text-gray-400 mt-0.5">jobs.ge, 2026-05-20</p>
                    </div>
                  )}
                </div>
              )}

              {/* Supply / Demand ratio */}
              {md.supply_demand_ratio != null && (() => {
                const ratio: number = md.supply_demand_ratio
                const pct = Math.min(Math.round(ratio * 100), 100)
                const barPct = Math.min(pct, 100)
                const config =
                  ratio >= 0.8  ? { label: "მოთხოვნა > მიწოდება",  color: "bg-green-500",  text: "text-green-700",  bg: "bg-green-50" } :
                  ratio >= 0.25 ? { label: "საშუალო ბაზარი",      color: "bg-yellow-500", text: "text-yellow-700", bg: "bg-yellow-50" } :
                  ratio >= 0.10 ? { label: "კონკურენტული",         color: "bg-orange-500", text: "text-orange-700", bg: "bg-orange-50" } :
                                  { label: "გაჯერებული ბაზარი",    color: "bg-red-500",    text: "text-red-700",    bg: "bg-red-50" }
                return (
                  <div className={`${config.bg} rounded-xl p-3`}>
                    <div className="flex items-center justify-between mb-2">
                      <p className={`text-xs font-semibold ${config.text}`}>მიწოდება / მოთხოვნა</p>
                      <span className={`text-xs font-bold ${config.text}`}>{config.label}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-gray-500 shrink-0 text-[11px]">ვაკანსია/კურსდამთ</span>
                      <div className="flex-1 bg-white/60 rounded-full h-2">
                        <div className={`${config.color} h-2 rounded-full`} style={{ width: `${barPct}%` }} />
                      </div>
                      <span className={`font-bold ${config.text} w-10 text-right`}>{ratio.toFixed(2)}</span>
                    </div>
                  </div>
                )
              })()}

              {/* Profession salaries (ISCO-08) */}
              {fieldProfs.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Banknote className="w-3.5 h-3.5 text-[#1E3A8A]" />
                    <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">პროფესიული ხელფასები 2024</p>
                  </div>
                  <div className="space-y-1.5">
                    {fieldProfs.map((prof) => {
                      const maxSal = Math.max(...fieldProfs.map((p) => p.salary_2024est))
                      const pct = maxSal > 0 ? (prof.salary_2024est / maxSal) * 100 : 0
                      return (
                        <div key={prof.isco_code} className="flex items-center gap-2 text-xs">
                          <span className="w-36 text-gray-600 shrink-0 truncate">{prof.name_ka}</span>
                          <div className="flex-1 bg-gray-100 rounded-full h-2">
                            <div className="bg-[#1E3A8A]/60 h-2 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="w-16 text-right font-semibold text-gray-900">{prof.salary_2024est.toLocaleString()} ₾</span>
                        </div>
                      )
                    })}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1.5">GeoStat ISCO-08 2021, შეფასება 2024 · ×1.511</p>
                </div>
              )}

              {/* Subprograms */}
              {subs && Object.keys(subs).length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                    ქვე-სფეროები (სახელმწიფო უნივერსიტეტი, 2024-25)
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(subs).map(([name, count]) => (
                      <span
                        key={name}
                        className="inline-flex items-center gap-1 text-xs bg-[#1E3A8A]/5 text-[#1E3A8A] border border-[#1E3A8A]/10 rounded-full px-2.5 py-0.5"
                      >
                        {name}
                        <span className="font-semibold opacity-60">({(count as number).toLocaleString()})</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                <span className="text-[11px] text-gray-400">GeoStat — სახელმწიფო + კერძო</span>
                <Link
                  href={`/programs?field=${md.field}`}
                  className="text-xs text-[#1E3A8A] font-medium hover:underline flex items-center gap-1"
                >
                  სპეციალობები <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
