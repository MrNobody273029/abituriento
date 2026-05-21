import Link from "next/link"
import { ArrowLeft, ArrowRight, RotateCcw, MapPin, Banknote, TrendingUp, TrendingDown, Minus, Briefcase } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { computeFieldScores, topFields } from "@/lib/quiz-match"
import { FIELDS, DEGREE_LABELS } from "@/lib/constants"

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
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export const dynamic = "force-dynamic"

import { SITE_URL } from "@/lib/site"

export const metadata = {
  title: "კვიზის შედეგები — შენთვის რეკომენდებული სპეციალობები",
  description: "კვიზისა და შრომის ბაზრის ანალიზის საფუძველზე შერჩეული სპეციალობები · GeoStat & NAEC 2025",
  alternates: { canonical: `${SITE_URL}/quiz/results` },
}

type MarketRow = {
  field: string
  field_name_ka: string
  avg_salary_2024: number | null
  avg_salary_2022: number | null
  vacancies_jobsge: number | null
  graduated_2025: number | null
  supply_demand_ratio: number | null
  trend: string
}

function demandBadge(ratio: number | null) {
  if (ratio == null) return null
  if (ratio >= 0.8)  return { label: "მაღალი მოთხოვნა",  cls: "bg-green-100 text-green-800 border-green-200" }
  if (ratio >= 0.25) return { label: "საშუალო",        cls: "bg-yellow-100 text-yellow-800 border-yellow-200" }
  if (ratio >= 0.10) return { label: "კონკურენტული",   cls: "bg-orange-100 text-orange-800 border-orange-200" }
  return               { label: "გაჯერებული ბაზარი",    cls: "bg-red-100 text-red-800 border-red-200" }
}

export default async function QuizResultsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const params = await searchParams
  const parse  = (k: string) => params[k]?.split(",").filter(Boolean) || []

  const interests = parse("interests")
  const workstyle = parse("workstyle")
  const strengths = parse("strengths")
  const goals     = parse("goals")
  const city      = parse("city")
  const budget    = parse("budget")
  const duration  = parse("duration")

  // ── Field scoring ──────────────────────────────────────────────
  const scores    = computeFieldScores({ interests, workstyle, strengths, goals })
  const matched   = topFields(scores, 3)
  const fields    = matched.length > 0 ? matched : ["science", "social_business_law", "engineering"]

  // ── DB where clause ───────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const uniFilter: Record<string, any> = { category: { not: "college" } }

  if (city.length > 0 && !city.includes("any_city")) {
    const cityMap: Record<string, string> = { tbilisi: "თბილისი", kutaisi: "ქუთაისი", batumi: "ბათუმი" }
    const names = city.filter(c => c !== "other_city").map(c => cityMap[c]).filter(Boolean)
    if (names.length > 0) uniFilter.city = { in: names }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: Record<string, any> = { field: { in: fields }, university: uniFilter }

  if (budget.length > 0) {
    if (budget.includes("budget_high")) {
      // no price cap
    } else if (budget.includes("budget_mid")) {
      where.tuition_fee = { lte: 7500 }
    } else if (budget.includes("budget_low")) {
      where.tuition_fee = { lte: 4500 }
    } else if (budget.includes("grant") && budget.length === 1) {
      where.is_state_funded = true
    }
  }

  if (duration.length > 0 && !duration.includes("any_dur")) {
    const deg: string[] = []
    if (duration.includes("standard") || duration.includes("short")) deg.push("bachelor")
    if (duration.includes("long")) deg.push("medicine", "specialist", "integrated")
    if (deg.length > 0) where.degree = { in: deg }
  }

  // ── Fetch data ────────────────────────────────────────────────
  const [programs, marketRows] = await Promise.all([
    prisma.program.findMany({
      where: where as never,
      select: {
        id: true,
        name_ka: true,
        field: true,
        degree: true,
        tuition_fee: true,
        is_state_funded: true,
        min_score_2025: true,
        university: { select: { id: true, name_ka: true, city: true, type: true, logo_url: true } },
      },
      orderBy: [{ is_state_funded: "desc" }, { tuition_fee: "asc" }],
      take: 300,
    }),
    prisma.marketData.findMany({ where: { field: { in: fields } } }) as Promise<MarketRow[]>,
  ])

  const marketMap = Object.fromEntries(marketRows.map(r => [r.field, r]))

  // ── Group by name_ka ─────────────────────────────────────────
  type ProgInstance = typeof programs[number]
  const groupMap = new Map<string, ProgInstance[]>()
  programs.forEach(p => {
    const arr = groupMap.get(p.name_ka) || []
    groupMap.set(p.name_ka, [...arr, p])
  })

  const groups = Array.from(groupMap.entries())
    .map(([name, progs]) => {
      const field     = progs[0].field
      const fieldScore = scores[field] ?? 0
      const md        = marketMap[field]
      // Multi-signal relevance: field match + job market demand + grant + breadth
      const demandBonus = (md?.supply_demand_ratio ?? 0) * 20
      const grantBonus  = progs.some(p => p.is_state_funded) ? 12 : 0
      const breadth     = Math.min(progs.length * 1.5, 8)
      const relevance   = fieldScore * 2 + demandBonus + grantBonus + breadth
      return {
        name,
        field,
        degree:    progs[0].degree,
        hasGrant:  progs.some(p => p.is_state_funded),
        minFee:    Math.min(...progs.map(p => p.tuition_fee)),
        maxFee:    Math.max(...progs.map(p => p.tuition_fee)),
        uniCount:  progs.length,
        progs:     progs.slice(0, 8),
        relevance,
        fieldScore,
      }
    })
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 6)

  const hasResults = groups.length > 0
  const maxRel = groups[0]?.relevance || 1

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">შენთვის რეკომენდებული სპეციალობები</h1>
          <p className="text-sm text-gray-500 mt-1">კვიზის + შრომის ბაზრის ანალიზის საფუძველზე · GeoStat & jobs.ge 2025</p>
        </div>
        <Link href="/quiz">
          <Button variant="outline" className="gap-2 cursor-pointer">
            <RotateCcw className="w-4 h-4" />
            კვიზის გამეორება
          </Button>
        </Link>
      </div>

      {/* ── Field market summaries ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        {fields.map((f, i) => {
          const md        = marketMap[f]
          const demand    = demandBadge(md?.supply_demand_ratio ?? null)
          const salaryGrowth = md?.avg_salary_2024 && md?.avg_salary_2022
            ? Math.round(((md.avg_salary_2024 - md.avg_salary_2022) / md.avg_salary_2022) * 100)
            : null
          const TrendIcon = md?.trend === "growing" ? TrendingUp : md?.trend === "declining" ? TrendingDown : Minus
          const trendColor = md?.trend === "growing" ? "text-green-600" : md?.trend === "declining" ? "text-red-500" : "text-gray-400"
          const RANK_BG = ["bg-[#F97316]", "bg-[#1E3A8A]", "bg-gray-400"]

          const fAccent = FIELD_ACCENT[f] || "#1E3A8A"
          return (
            <div key={f} className="bg-white rounded-2xl border border-gray-100 border-l-[3px] shadow-sm p-4" style={{ borderLeftColor: fAccent }}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${RANK_BG[i]}`}>{i + 1}</span>
                <span className="font-semibold text-sm text-gray-900 leading-tight">
                  {FIELDS[f as keyof typeof FIELDS]?.name_ka || f}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500 gap-2">
                {md?.avg_salary_2024 ? (
                  <span className="font-bold text-[#1E3A8A]">{Math.round(md.avg_salary_2024).toLocaleString()} ₾/თვე</span>
                ) : <span>—</span>}
                {salaryGrowth !== null && (
                  <span className={`flex items-center gap-0.5 font-medium ${trendColor}`}>
                    <TrendIcon className="w-3 h-3" />
                    {salaryGrowth > 0 ? "+" : ""}{salaryGrowth}%
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1.5">
                {demand && (
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${demand.cls}`}>
                    {demand.label}
                  </span>
                )}
                {md?.vacancies_jobsge != null && (
                  <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                    <Briefcase className="w-3 h-3" />{md.vacancies_jobsge.toLocaleString()} ვაკანსია
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Program groups ── */}
      {!hasResults ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg font-medium">სპეციალობა ვერ მოიძებნა</p>
          <p className="text-sm mt-2">სცადე ფილტრები შეცვალო — მაგალითად სხვა ქალაქი ან ბიუჯეტი</p>
          <Link href="/quiz" className="mt-4 inline-block">
            <Button variant="outline" className="gap-2 cursor-pointer mt-4">
              <RotateCcw className="w-4 h-4" />
              კვიზის გამეორება
            </Button>
          </Link>
        </div>
      ) : (
        <>
          <h2 className="text-base font-semibold text-gray-700 mb-4">საუკეთესო {groups.length} რეკომენდაცია შენი პასუხებით</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {groups.map((g) => {
              const fieldMeta = FIELDS[g.field as keyof typeof FIELDS]
              const gAccent = FIELD_ACCENT[g.field] || "#1E3A8A"
              const matchPct = Math.round((g.relevance / maxRel) * 100)
              return (
                <div key={g.name} className="bg-white rounded-2xl border border-gray-100 border-l-[3px] shadow-sm overflow-hidden" style={{ borderLeftColor: gAccent }} >
                  {/* card header */}
                  <div className="p-4 pb-3">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-bold text-gray-900 text-sm leading-tight flex-1">{g.name}</h3>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${gAccent}18`, color: gAccent }}>{matchPct}% match</span>
                        {g.hasGrant && (
                          <span className="text-[10px] bg-green-100 text-green-800 font-semibold px-2 py-0.5 rounded-full">გრანტი</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      {fieldMeta && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: `${gAccent}1a`, color: gAccent }}>{fieldMeta.name_ka}</span>
                      )}
                      <Badge variant="outline" className="text-[10px] px-2 py-0.5 text-gray-600">
                        {DEGREE_LABELS[g.degree] || g.degree}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Banknote className="w-3.5 h-3.5" />
                        {g.minFee === g.maxFee
                          ? `${g.minFee.toLocaleString()} ₾/წელი`
                          : `${g.minFee.toLocaleString()} – ${g.maxFee.toLocaleString()} ₾/წელი`}
                      </span>
                      <span className="text-gray-400">{g.uniCount} უნივერსიტეტი</span>
                    </div>
                  </div>

                  {/* expandable university list */}
                  <details className="group border-t border-gray-50">
                    <summary className="px-4 py-2.5 text-xs font-semibold text-[#1E3A8A] cursor-pointer select-none flex items-center gap-1.5 hover:bg-gray-50 transition-colors list-none">
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-open:rotate-90" />
                      სად ისწავლება? ({g.uniCount})
                    </summary>
                    <div className="divide-y divide-gray-50">
                      {g.progs.map((p) => (
                        <Link
                          key={p.id}
                          href={`/programs/${p.id}`}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                        >
                          {/* logo */}
                          <div className="w-7 h-7 rounded-lg shrink-0 overflow-hidden border border-gray-100 bg-white flex items-center justify-center">
                            {p.university.logo_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={p.university.logo_url} alt="" className="w-full h-full object-contain p-0.5" />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] flex items-center justify-center text-white text-[8px] font-bold">
                                {p.university.name_ka.replace(/სსიპ\s*-?\s*/g,"").replace(/შპს\s*-?\s*/g,"").trim().split(/\s+/).slice(0,2).map((w:string)=>w[0]).join("")}
                              </div>
                            )}
                          </div>
                          {/* info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-900 truncate">{p.university.name_ka}</p>
                            <p className="text-[10px] text-gray-400 flex items-center gap-1">
                              <MapPin className="w-2.5 h-2.5" />{p.university.city}
                            </p>
                          </div>
                          {/* price + grant */}
                          <div className="text-right shrink-0">
                            <p className="text-xs font-bold text-[#1E3A8A]">
                              {p.is_state_funded ? "0 ₾" : `${p.tuition_fee.toLocaleString()} ₾`}
                            </p>
                            {p.is_state_funded && (
                              <p className="text-[9px] text-gray-400">{p.tuition_fee.toLocaleString()} სრული</p>
                            )}
                            {p.min_score_2025 != null && (
                              <p className="text-[9px] text-gray-400">
                                ქ. {Math.round(p.min_score_2025)}
                              </p>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </details>
                </div>
              )
            })}
          </div>

          {/* footer actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-10">
            <Link href={`/programs?field=${fields[0]}`}>
              <Button className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white cursor-pointer gap-2">
                ყველა სპეციალობა ამ სფეროში
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/programs">
              <Button variant="outline" className="cursor-pointer gap-2">
                სრული სია
              </Button>
            </Link>
          </div>
          <p className="text-center text-xs text-gray-400 mt-4">
            მონაცემები: GeoStat · jobs.ge · NAEC 2025
          </p>
        </>
      )}
    </div>
  )
}
