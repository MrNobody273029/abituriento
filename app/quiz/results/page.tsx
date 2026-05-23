import Link from "next/link"
import { ArrowRight, RotateCcw, MapPin, Banknote } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { FIELDS, DEGREE_LABELS } from "@/lib/constants"
import {
  computeFamilyScores,
  topFamilies,
  FAMILY_TO_FIELD,
  FAMILY_NAME_KA,
  detectFamily,
  type FamilyId,
} from "@/lib/quiz-v2-scoring"

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
  title: "ქვიზის შედეგები — შენთვის რეკომენდებული სპეციალობები",
  description: "ქვიზისა და შრომის ბაზრის ანალიზის საფუძველზე შერჩეული სპეციალობები · GeoStat & NAEC 2025",
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

export default async function QuizResultsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const params = await searchParams
  const parse  = (k: string) => params[k]?.split(",").filter(Boolean) ?? []

  const skills    = parse("skills")
  const q3        = params["q3"] ?? ""
  const worklife  = parse("worklife")
  const negfilter = parse("negfilter")
  const city      = parse("city")

  // ── Score families ────────────────────────────────────────────────────────
  const familyScores = computeFamilyScores({ skills, q3, worklife, negfilter })
  const bestFamilies = topFamilies(familyScores, 10)

  // Fallback when no signals
  const queryFamilies: FamilyId[] = bestFamilies.length > 0
    ? bestFamilies
    : ["business_mgmt", "software", "medicine", "law", "education", "tourism"]

  const fields = [...new Set(queryFamilies.map(f => FAMILY_TO_FIELD[f]))]

  // ── DB where clause ───────────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const uniFilter: Record<string, any> = { category: { not: "college" } }

  if (city.length > 0) {
    const cityMap: Record<string, string> = { tbilisi: "თბილისი", kutaisi: "ქუთაისი", batumi: "ბათუმი" }
    const names = city.filter(c => c !== "other_city").map(c => cityMap[c]).filter(Boolean)
    if (names.length > 0) uniFilter.city = { in: names }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: Record<string, any> = { field: { in: fields }, university: uniFilter }

  // ── Fetch ─────────────────────────────────────────────────────────────────
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
        occupation_slug: true,
        university: { select: { id: true, name_ka: true, city: true, type: true, logo_url: true } },
      },
      orderBy: [{ is_state_funded: "desc" }, { tuition_fee: "asc" }],
      take: 400,
    }),
    prisma.marketData.findMany({ where: { field: { in: fields } } }) as Promise<MarketRow[]>,
  ])

  const occupationSlugs = [...new Set(programs.map(p => p.occupation_slug).filter((s): s is string => !!s))]
  const occupations     = await prisma.occupationSalary.findMany({ where: { slug: { in: occupationSlugs } } })
  const occupationMap   = Object.fromEntries(occupations.map(o => [o.slug, o]))
  const marketMap       = Object.fromEntries(marketRows.map(r => [r.field, r]))

  // ── Group by name_ka ──────────────────────────────────────────────────────
  type ProgInstance = typeof programs[number]
  const groupMap = new Map<string, ProgInstance[]>()
  programs.forEach(p => {
    const arr = groupMap.get(p.name_ka) ?? []
    groupMap.set(p.name_ka, [...arr, p])
  })

  const scoredGroups = Array.from(groupMap.entries())
    .map(([name, progs]) => {
      const field      = progs[0].field
      const md         = marketMap[field]
      const family     = detectFamily(name)
      const famScore   = family ? (familyScores[family] ?? 0) : 0
      // Small bonuses: market demand + grant availability
      const demandBonus = (md?.supply_demand_ratio ?? 0) * 40
      const grantBonus  = progs.some(p => p.is_state_funded) ? 15 : 0
      const relevance   = famScore + demandBonus + grantBonus
      const occSlug     = progs[0].occupation_slug
      const occupation  = occSlug ? occupationMap[occSlug] : null
      return { name, field, family, degree: progs[0].degree, relevance, famScore, occupation }
    })
    .filter(g => g.relevance > 0)
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 3)

  // Second pass: fetch ALL universities for top-6 program names (ignore city filter)
  const topNames    = scoredGroups.map(g => g.name)
  const allInstances = await prisma.program.findMany({
    where: {
      name_ka: { in: topNames },
      university: { category: { not: "college" } },
    },
    select: {
      id: true, name_ka: true, tuition_fee: true,
      is_state_funded: true, min_score_2025: true,
      occupation_slug: true,
      university: { select: { id: true, name_ka: true, city: true, type: true, logo_url: true } },
    },
    orderBy: [{ is_state_funded: "desc" }, { tuition_fee: "asc" }],
  })

  const instancesByName = new Map<string, typeof allInstances>()
  allInstances.forEach(p => {
    const arr = instancesByName.get(p.name_ka) ?? []
    instancesByName.set(p.name_ka, [...arr, p])
  })

  const groups = scoredGroups.map(g => {
    const allProgs = instancesByName.get(g.name) ?? []
    return {
      ...g,
      hasGrant: allProgs.some(p => p.is_state_funded),
      minFee:   allProgs.length ? Math.min(...allProgs.map(p => p.tuition_fee)) : 0,
      maxFee:   allProgs.length ? Math.max(...allProgs.map(p => p.tuition_fee)) : 0,
      uniCount: allProgs.length,
      progs:    allProgs,
    }
  })

  const MIN_MATCH_PCT = 20
  // Theoretical max: Q3(200) + 5×Q1(35) + 2×Q4(70) = 515
  const THEORETICAL_MAX = 515

  const displayGroups = (() => {
    const filtered = groups.filter(g =>
      Math.min(97, Math.max(15, Math.round(g.famScore / THEORETICAL_MAX * 100))) >= MIN_MATCH_PCT
    )
    return filtered.length > 0 ? filtered : groups.slice(0, 1)
  })()

  const hasResults = displayGroups.length > 0

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">შენთვის რეკომენდებული სპეციალობები</h1>
          <p className="text-sm text-gray-500 mt-1">ქვიზის + შრომის ბაზრის ანალიზის საფუძველზე · GeoStat & jobs.ge 2025</p>
        </div>
        <Link href="/quiz">
          <Button variant="outline" className="gap-2 cursor-pointer">
            <RotateCcw className="w-4 h-4" />
            ქვიზის გამეორება
          </Button>
        </Link>
      </div>

      {/* ── Program groups ── */}
      {!hasResults ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg font-medium">სპეციალობა ვერ მოიძებნა</p>
          <p className="text-sm mt-2">სცადე ფილტრები შეცვალო — მაგალითად სხვა ქალაქი</p>
          <Link href="/quiz" className="mt-4 inline-block">
            <Button variant="outline" className="gap-2 cursor-pointer mt-4">
              <RotateCcw className="w-4 h-4" />
              ქვიზის გამეორება
            </Button>
          </Link>
        </div>
      ) : (
        <>
          <h2 className="text-base font-semibold text-gray-700 mb-4">საუკეთესო {displayGroups.length} რეკომენდაცია შენი პასუხებით</h2>
          {displayGroups.length >= 2 && (() => {
            const pct0 = Math.min(97, Math.max(15, Math.round(displayGroups[0].famScore / THEORETICAL_MAX * 100)))
            const pct1 = Math.min(97, Math.max(15, Math.round(displayGroups[1].famScore / THEORETICAL_MAX * 100)))
            return pct0 - pct1 <= 3 ? (
              <div className="mb-4 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm font-medium">
                შენ ორი მიმართულება თანაბრად გერგება
              </div>
            ) : null
          })()}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayGroups.map((g) => {
              const fieldMeta = FIELDS[g.field as keyof typeof FIELDS]
              const gAccent   = FIELD_ACCENT[g.field] || "#1E3A8A"
              const matchPct  = Math.min(97, Math.max(15, Math.round(g.famScore / THEORETICAL_MAX * 100)))
              const famLabel  = g.family ? FAMILY_NAME_KA[g.family] : null
              return (
                <div key={g.name} className="bg-white rounded-2xl border border-gray-100 border-l-[3px] shadow-sm overflow-hidden" style={{ borderLeftColor: gAccent }}>
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
                      {famLabel && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: `${gAccent}1a`, color: gAccent }}>{famLabel}</span>
                      )}
                      {fieldMeta && !famLabel && (
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
                    {g.occupation && (
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-full px-2 py-0.5">
                          🇬🇪 საშ. ხელფ. {g.occupation.salary_avg.toLocaleString()} ₾/თვე
                        </span>
                        {g.occupation.salary_int_avg && (
                          <span className="flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-50 rounded-full px-2 py-0.5">
                            🌍 საშ. {g.occupation.salary_int_avg.toLocaleString()} {g.occupation.salary_int_currency}
                          </span>
                        )}
                      </div>
                    )}
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
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-900 truncate">{p.university.name_ka}</p>
                            <p className="text-[10px] text-gray-400 flex items-center gap-1">
                              <MapPin className="w-2.5 h-2.5" />{p.university.city}
                            </p>
                          </div>
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
            <Link href={`/programs?field=${fields[0] ?? ""}`}>
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
