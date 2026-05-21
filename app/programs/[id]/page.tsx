import { notFound } from "next/navigation"
import Link from "next/link"
import { ChevronRight, ExternalLink, Building2, Clock, Banknote, CheckCircle, XCircle, Calculator, Users, TrendingUp, TrendingDown, Minus, BookOpen } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FIELDS, TREND_LABELS, DEGREE_LABELS, TYPE_LABELS } from "@/lib/constants"

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
import JsonLd from "@/components/JsonLd"
import { SITE_URL } from "@/lib/site"

export const revalidate = 86400

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const program = await prisma.program.findUnique({ where: { id }, include: { university: true } })
  if (!program) return { title: "სპეციალობა" }
  const title = `${program.name_ka} — ${program.university.name_ka}`
  const description =
    program.description_ka ||
    `${program.name_ka} სპეციალობა ${program.university.name_ka}-ში. სწავლის ფასი: ${program.tuition_fee.toLocaleString()} ₾/წელი${program.is_state_funded ? ", სახელმწიფო გრანტი ხელმისაწვდომია." : "."}`
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/programs/${id}` },
    openGraph: { title, description, url: `${SITE_URL}/programs/${id}` },
  }
}

export default async function ProgramDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const program = await prisma.program.findUnique({
    where: { id },
    include: { university: true },
  })

  if (!program) notFound()

  const [marketData, relatedPrograms, grantThresholds] = await Promise.all([
    prisma.marketData.findUnique({ where: { field: program.field } }),
    prisma.program.findMany({
      where: { field: program.field, NOT: { id: program.id } },
      take: 6,
      include: { university: true },
    }),
    program.is_state_funded
      ? prisma.grantThreshold.findMany({ where: { year: 2025, grant_50: { not: null } }, orderBy: { subject: "asc" } })
      : Promise.resolve([]),
  ])

  const courseSchema = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: program.name_ka,
    description:
      program.description_ka ||
      `${program.name_ka} — ${DEGREE_LABELS[program.degree] || program.degree}, ${program.duration_years} წელი`,
    inLanguage: "ka",
    courseCode: program.id,
    educationalLevel: DEGREE_LABELS[program.degree] || program.degree,
    provider: {
      "@type": "CollegeOrUniversity",
      name: program.university.name_ka,
      url: program.university.website,
    },
    offers: {
      "@type": "Offer",
      price: program.tuition_fee,
      priceCurrency: "GEL",
      category: program.is_state_funded ? "სახელმწიფო გრანტი ხელმისაწვდომია" : "კერძო დაფინანსება",
    },
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "მთავარი",      item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "სპეციალობები", item: `${SITE_URL}/programs` },
      { "@type": "ListItem", position: 3, name: program.name_ka, item: `${SITE_URL}/programs/${program.id}` },
    ],
  }

  const accent = FIELD_ACCENT[program.field] || "#1E3A8A"

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <JsonLd data={courseSchema} />
      <JsonLd data={breadcrumbSchema} />
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-gray-900 cursor-pointer transition-colors">მთავარი</Link>
        <ChevronRight className="w-4 h-4" />
        <Link href="/programs" className="hover:text-gray-900 cursor-pointer transition-colors">სპეციალობები</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 font-medium truncate max-w-xs">{program.name_ka}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-gray-100 shadow-sm overflow-hidden">
            <div className="h-1 w-full" style={{ background: accent }} />
            <CardContent className="p-6">
              <div className="flex items-start gap-4 flex-wrap">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full" style={{ background: `${accent}1a`, color: accent }}>
                      {FIELDS[program.field as keyof typeof FIELDS]?.name_ka || program.field}
                    </span>
                    <Badge variant="outline" className="text-xs">{DEGREE_LABELS[program.degree]}</Badge>
                    {program.is_state_funded && <Badge className="text-xs bg-green-100 text-green-800">გრანტი</Badge>}
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">{program.name_ka}</h1>
                  {program.faculty_ka && <p className="text-gray-500 text-sm">{program.faculty_ka}</p>}
                </div>
              </div>

              {program.description_ka && (
                <p className="text-gray-600 mt-4 leading-relaxed">{program.description_ka}</p>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <Banknote className="w-5 h-5 text-[#1E3A8A] mx-auto mb-1" />
                  <div className="font-bold text-gray-900 text-lg">{program.tuition_fee.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">₾/წელი</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <Clock className="w-5 h-5 text-[#F97316] mx-auto mb-1" />
                  <div className="font-bold text-gray-900 text-lg">{program.duration_years}</div>
                  <div className="text-xs text-gray-500">წელი</div>
                </div>
                <div className={`rounded-xl p-3 text-center ${program.is_state_funded ? "bg-green-50" : "bg-gray-50"}`}>
                  {program.is_state_funded
                    ? <CheckCircle className="w-5 h-5 text-green-600 mx-auto mb-1" />
                    : <XCircle className="w-5 h-5 text-gray-400 mx-auto mb-1" />}
                  <div className={`font-bold text-sm ${program.is_state_funded ? "text-green-700" : "text-gray-400"}`}>
                    {program.is_state_funded ? "ხელმისაწვდომი" : "ხელმიუწვდომი"}
                  </div>
                  <div className="text-xs text-gray-500">სახელმწიფო გრანტი</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <Building2 className="w-5 h-5 text-purple-500 mx-auto mb-1" />
                  <div className="font-bold text-gray-900 text-sm leading-tight">{TYPE_LABELS[program.university.type]}</div>
                  <div className="text-xs text-gray-500">ტიპი</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Exam subjects from NAEC cnobari 2025 */}
          {Array.isArray(program.exams) && (program.exams as any[]).length > 0 && (() => {
            const exams = program.exams as { subject: string; coeff: number; min_pct: number; is_required: boolean }[]
            const required = exams.filter(e => e.is_required)
            const choices  = exams.filter(e => !e.is_required)
            return (
              <Card className="border-gray-100 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#1E3A8A]" />
                    ჩასაბარებელი საგნები — 2025
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {required.length > 0 && (
                    <div>
                      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">სავალდებულო</p>
                      <div className="space-y-1.5">
                        {required.map((e, i) => (
                          <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                            <span className="text-sm text-gray-800">{e.subject}</span>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[11px] text-gray-400">×{e.coeff}</span>
                              <span className="text-[11px] text-gray-400">მინიმალური {e.min_pct}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {choices.length > 0 && (
                    <div>
                      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">
                        3-ე საგანი — ერთ-ერთი
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {choices.map((e, i) => (
                          <div key={i} className="flex items-center gap-1.5 bg-[#1E3A8A]/5 border border-[#1E3A8A]/10 rounded-lg px-2.5 py-1.5">
                            <span className="text-xs font-medium text-[#1E3A8A]">{e.subject}</span>
                            <span className="text-[10px] text-gray-400">×{e.coeff}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <p className="text-[10px] text-gray-400 border-t border-gray-50 pt-2">
                    წყარო: NAEC — ცნობარი აბიტურიენტებისათვის · 2025
                  </p>
                </CardContent>
              </Card>
            )
          })()}

          {/* Admission stats from NAEC 2025 */}
          {program.admitted_2025 != null && (
            <Card className="border-gray-100 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#1E3A8A]" />
                  ჩარიცხვის სტატისტიკა — 2025
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* key numbers */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-[11px] text-gray-400 mb-1">ჩარიცხული</p>
                    <p className="font-bold text-gray-900 text-lg">{program.admitted_2025}</p>
                    <p className="text-[10px] text-gray-400">სტუდენტი</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-3 text-center border border-blue-100">
                    <p className="text-[11px] text-blue-500 mb-1">მინიმალური ქულა</p>
                    <p className="font-bold text-blue-800 text-lg">{program.min_score_2025?.toFixed(0)}</p>
                    <p className="text-[10px] text-blue-400">ბოლო მოხვედრილი</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-[11px] text-gray-400 mb-1">საშუალო ქულა</p>
                    <p className="font-bold text-gray-900 text-lg">{program.median_score_2025?.toFixed(0)}</p>
                    <p className="text-[10px] text-gray-400">მედიანა</p>
                  </div>
                  <div className={`rounded-xl p-3 text-center ${(program.grant_any_pct_2025 ?? 0) >= 20 ? "bg-green-50 border border-green-100" : "bg-gray-50"}`}>
                    <p className={`text-[11px] mb-1 ${(program.grant_any_pct_2025 ?? 0) >= 20 ? "text-green-500" : "text-gray-400"}`}>გრანტიანი</p>
                    <p className={`font-bold text-lg ${(program.grant_any_pct_2025 ?? 0) >= 20 ? "text-green-700" : "text-gray-900"}`}>
                      {program.grant_any_pct_2025?.toFixed(0)}%
                    </p>
                    <p className="text-[10px] text-gray-400">სტუდენტი</p>
                  </div>
                </div>

                {/* grant breakdown */}
                {((program.grant_50_count_2025 ?? 0) + (program.grant_70_count_2025 ?? 0) + (program.grant_100_count_2025 ?? 0)) > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-500">გრანტის განაწილება:</p>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      {[
                        { label: "50%", count: program.grant_50_count_2025, color: "bg-yellow-50 border-yellow-200 text-yellow-800" },
                        { label: "70%", count: program.grant_70_count_2025, color: "bg-blue-50 border-blue-200 text-blue-800" },
                        { label: "100%", count: program.grant_100_count_2025, color: "bg-green-50 border-green-200 text-green-800" },
                      ].map(({ label, count, color }) => (
                        count ? (
                          <div key={label} className={`rounded-lg border px-2 py-2 ${color}`}>
                            <p className="text-sm font-bold">{count} სტ-ტი</p>
                            <p className="text-[11px]">{label} გრანტი</p>
                          </div>
                        ) : null
                      ))}
                    </div>
                  </div>
                )}

                {/* score bar */}
                {program.min_score_2025 != null && program.max_score_2025 != null && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-gray-400">
                      <span>მინ: {program.min_score_2025.toFixed(0)}</span>
                      <span>მედ: {program.median_score_2025?.toFixed(0)}</span>
                      <span>მაქს: {program.max_score_2025.toFixed(0)}</span>
                    </div>
                    <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-red-300 via-yellow-300 to-green-400 rounded-full" />
                    </div>
                  </div>
                )}
                <p className="text-[10px] text-gray-400">წყარო: NAEC — ჩარიცხულთა სია სახელმწიფო სასწავლო გრანტის მითითებით · 2025</p>
              </CardContent>
            </Card>
          )}

          {/* Related programs */}
          {relatedPrograms.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">სხვა პროგრამები ამ სფეროში</h2>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {relatedPrograms.map((rp) => (
                  <Link
                    key={rp.id}
                    href={`/programs/${rp.id}`}
                    className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 p-4 min-w-52 cursor-pointer"
                  >
                    <h3 className="font-semibold text-sm text-gray-900 mb-1 line-clamp-2">{rp.name_ka}</h3>
                    <p className="text-xs text-gray-500 mb-2">{rp.university.name_ka}</p>
                    <p className="text-sm font-bold text-[#1E3A8A]">{rp.tuition_fee.toLocaleString()} ₾</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* University card */}
          <Card className="border-gray-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">უნივერსიტეტი</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-semibold text-gray-900">{program.university.name_ka}</p>
                <Badge variant="outline" className="text-xs mt-1">
                  {TYPE_LABELS[program.university.type]}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Link href={`/universities/${program.universityId}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full cursor-pointer transition-all duration-200 hover:scale-105 text-xs gap-1.5">
                    <Building2 className="w-3.5 h-3.5" />
                    პროფილი
                  </Button>
                </Link>
                <a href={program.university.website} target="_blank" rel="noopener noreferrer" className="flex-1">
                  <Button variant="outline" size="sm" className="w-full cursor-pointer transition-all duration-200 hover:scale-105 text-xs gap-1.5">
                    <ExternalLink className="w-3.5 h-3.5" />
                    ვებსაიტი
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Grant info */}
          <Card className={`shadow-sm ${program.is_state_funded ? "border-green-200 bg-green-50/40" : "border-gray-100"}`}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Calculator className="w-4 h-4 text-[#1E3A8A]" />
                სახელმწიფო გრანტი
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {program.is_state_funded ? (
                <>
                  <div className="flex items-center gap-2 text-sm text-green-700 font-medium">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    ეს პროგრამა სახელმწიფო გრანტით ფინანსდება
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    გრანტი ფარავს სწავლის საფასურის 50%, 70% ან 100%-ს — ეროვნული გამოცდების კომპოზიტური ქულის მიხედვით.
                  </p>
                  {grantThresholds.length > 0 && (
                    <div className="space-y-1.5 border-t border-green-100 pt-3">
                      <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">2025 ეროვნული მინიმალური ზღვრები</p>
                      <div className="grid grid-cols-3 gap-1 text-center">
                        <div className="bg-yellow-50 rounded-lg px-1.5 py-2">
                          <p className="text-[10px] text-yellow-700 font-medium">50%</p>
                          <p className="text-xs font-bold text-yellow-800">{Math.min(...grantThresholds.map(t => t.grant_50!)).toLocaleString()}</p>
                          <p className="text-[9px] text-yellow-600">–</p>
                          <p className="text-xs font-bold text-yellow-800">{Math.max(...grantThresholds.map(t => t.grant_50!)).toLocaleString()}</p>
                        </div>
                        <div className="bg-blue-50 rounded-lg px-1.5 py-2">
                          <p className="text-[10px] text-blue-700 font-medium">70%</p>
                          <p className="text-xs font-bold text-blue-800">{Math.min(...grantThresholds.map(t => t.grant_70!)).toLocaleString()}</p>
                          <p className="text-[9px] text-blue-600">–</p>
                          <p className="text-xs font-bold text-blue-800">{Math.max(...grantThresholds.map(t => t.grant_70!)).toLocaleString()}</p>
                        </div>
                        <div className="bg-green-50 rounded-lg px-1.5 py-2">
                          <p className="text-[10px] text-green-700 font-medium">100%</p>
                          <p className="text-xs font-bold text-green-800">{Math.min(...grantThresholds.map(t => t.grant_100!)).toLocaleString()}</p>
                          <p className="text-[9px] text-green-600">–</p>
                          <p className="text-xs font-bold text-green-800">{Math.max(...grantThresholds.map(t => t.grant_100!)).toLocaleString()}</p>
                        </div>
                      </div>
                      <p className="text-[10px] text-gray-400">range ყველა 3-ე საგნის მიხედვით · NAEC 2025</p>
                    </div>
                  )}
                  <Link href="/grant" className="block">
                    <Button size="sm" className="w-full bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white cursor-pointer gap-1.5 text-xs">
                      <Calculator className="w-3.5 h-3.5" />
                      საგრანტო კალკულატორი
                    </Button>
                  </Link>
                </>
              ) : (
                <div className="flex items-start gap-2 text-sm text-gray-500">
                  <XCircle className="w-4 h-4 shrink-0 mt-0.5 text-gray-400" />
                  <span>ეს პროგრამა სახელმწიფო გრანტით არ ფინანსდება.</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Market data */}
          {marketData && (
            <Card className="border-gray-100 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">სფეროს სტატისტიკა (GeoStat)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">ტენდენცია (2022→2024)</p>
                  <div className="flex items-center gap-1.5">
                    {marketData.trend === "growing" ? <TrendingUp className="w-4 h-4 text-green-600" /> : marketData.trend === "declining" ? <TrendingDown className="w-4 h-4 text-red-500" /> : <Minus className="w-4 h-4 text-gray-400" />}
                    <span className="text-sm font-medium">{TREND_LABELS[marketData.trend]}</span>
                    {marketData.trend_pct != null && (
                      <span className="text-xs text-gray-400">({marketData.trend_pct > 0 ? "+" : ""}{marketData.trend_pct}%)</span>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {marketData.admitted_2024 != null && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500">ჩარიცხული 2024-25</p>
                      <p className="font-bold text-gray-900">{marketData.admitted_2024.toLocaleString()}</p>
                    </div>
                  )}
                  {marketData.graduated_2025 != null && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500">კურსდამთავრებული 2025</p>
                      <p className="font-bold text-[#1E3A8A]">{marketData.graduated_2025.toLocaleString()}</p>
                    </div>
                  )}
                </div>
                {marketData.source && (
                  <p className="text-[11px] text-gray-400 border-t border-gray-50 pt-2">{marketData.source}</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
