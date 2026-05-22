export const dynamic = "force-dynamic"

import type { Metadata } from "next"
import Link from "next/link"
import JsonLd from "@/components/JsonLd"
import { SITE_URL, SITE_NAME } from "@/lib/site"

export const metadata: Metadata = {
  title: `${SITE_NAME} — საქართველოს უნივერსიტეტები და სპეციალობები`,
  description:
    "აბიტურიენტისთვის: საქართველოს 116 უნივერსიტეტი და კოლეჯი, 1000+ სპეციალობა, გრანტის ქულები, სწავლის ფასები და შრომის ბაზრის სტატისტიკა 2025.",
  alternates: { canonical: SITE_URL },
  openGraph: {
    url: SITE_URL,
    title: `${SITE_NAME} — საქართველოს უნივერსიტეტები და სპეციალობები`,
    description: "116 უნივერსიტეტი · 1000+ სპეციალობა · გრანტის ქულები · შრომის ბაზარი 2025",
  },
}
import { ArrowRight, BookOpen, Building2, Layers, TrendingUp, TrendingDown, Minus, Search, BarChart3, Star, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { prisma } from "@/lib/prisma"
import { TREND_LABELS } from "@/lib/constants"
import FieldIcon from "@/components/FieldIcon"

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

async function getStats() {
  const [uniCount, collegeCount, programCount, marketData] = await Promise.all([
    prisma.university.count({ where: { category: { not: "college" } } }),
    prisma.university.count({ where: { category: "college" } }),
    prisma.program.count(),
    prisma.marketData.findMany(),
  ])
  const totalEnrolled = 50748 // GeoStat 2024-2025: state(30464) + approx private
  const growingFields = marketData.filter(m => m.trend === "growing").length
  return { uniCount, collegeCount, programCount, fieldCount: 9, totalEnrolled, growingFields }
}

async function getMarketData() {
  return prisma.marketData.findMany({ orderBy: { field: "asc" } })
}

function TrendIcon({ trend }: { trend: string }) {
  if (trend === "growing") return <TrendingUp className="w-4 h-4 text-[#16A34A]" />
  if (trend === "declining") return <TrendingDown className="w-4 h-4 text-[#DC2626]" />
  return <Minus className="w-4 h-4 text-gray-400" />
}

export default async function HomePage() {
  const [stats, marketData] = await Promise.all([getStats(), getMarketData()])

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: "საქართველოს უნივერსიტეტები, სპეციალობები და შრომის ბაზრის ანალიზი",
    inLanguage: "ka",
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/programs?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  }

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/opengraph-image`,
    description: "საქართველოს აბიტურიენტებისთვის განათლებისა და კარიერის გზამკვლევი",
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "რომელ უნივერსიტეტში ჩავაბარო?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Abituriento.ge-ზე შეგიძლია შეადარო 56 უნივერსიტეტი — სწავლის ფასი, სპეციალობები, გრანტის ქულები და შრომის ბაზრის მოთხოვნა ერთ ადგილას.",
        },
      },
      {
        "@type": "Question",
        name: "როგორ ავირჩიო სპეციალობა?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "გამოიყენე ჩვენი ქვიზი — 7 კითხვით გამოვლენ შენი ინტერესები, ძლიერი მხარეები და ბიუჯეტი, შემდეგ გაჩვენებ კონკრეტულ სპეციალობებს შრომის ბაზრის სტატისტიკით.",
        },
      },
      {
        "@type": "Question",
        name: "რა არის გრანტის ქულა?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "გრანტის ქულა არის ეროვნული გამოცდების მინიმალური ქულა, რომლის მიღწევის შემთხვევაში სახელმწიფო ანაზღაურებს სწავლის საფასურს. 2025 წელს ბაზური ზღვარია 50%, 70% და 100% გრანტებისთვის.",
        },
      },
      {
        "@type": "Question",
        name: "რომელ სფეროში არის მეტი სამუშაო საქართველოში?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "2025 წლის მონაცემებით, ყველაზე მეტი ვაკანსია jobs.ge-ზე არის მომსახურების (სერვის) და ინჟინერიის სფეროში. IT სფერო ასევე მაღალი მოთხოვნით გამოირჩევა.",
        },
      },
    ],
  }

  return (
    <div className="min-h-screen">
      <JsonLd data={websiteSchema} />
      <JsonLd data={orgSchema} />
      <JsonLd data={faqSchema} />
      <section className="bg-gradient-to-br from-[#1E3A8A] via-[#2563EB] to-[#4F46E5] text-white py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-4 py-2 text-sm mb-8 border border-white/20">
            <Star className="w-4 h-4 text-yellow-300" />
            <span>{stats.programCount}+ სპეციალობა · {stats.uniCount} უნივერსიტეტი + {stats.collegeCount} კოლეჯი · GeoStat 2025</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            აირჩიე შენი გზა
          </h1>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            სრული ინფორმაცია საქართველოს უნივერსიტეტებისა და სპეციალობების შესახებ.
            გაანალიზე შრომის ბაზარი და მიიღე სწორი გადაწყვეტილება.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/quiz">
              <Button size="lg" className="bg-[#F97316] hover:bg-[#EA6C0A] text-white cursor-pointer transition-all duration-200 hover:scale-105 gap-2 shadow-lg">
                კითხვარი დაიწყე
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/programs">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 cursor-pointer transition-all duration-200 hover:scale-105 gap-2 bg-white/5">
                <Search className="w-5 h-5" />
                სპეციალობები
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white/70 border-b border-gray-100 py-6 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {[
              { icon: <Building2 className="w-4 h-4" />, value: stats.uniCount, label: "უნივ-ტი", color: "#1E3A8A", bg: "#1E3A8A1A" },
              { icon: <Building2 className="w-4 h-4" />, value: stats.collegeCount, label: "კოლეჯი", color: "#7c3aed", bg: "#7c3aed1A" },
              { icon: <BookOpen className="w-4 h-4" />, value: `${stats.programCount}+`, label: "სპეციალობა", color: "#F97316", bg: "#F973161A" },
              { icon: <Layers className="w-4 h-4" />, value: stats.totalEnrolled.toLocaleString(), label: "ჩარიცხული", color: "#16a34a", bg: "#16a34a1A" },
              { icon: <TrendingUp className="w-4 h-4" />, value: `${stats.growingFields}`, label: "იზრდება", color: "#0891b2", bg: "#0891b21A" },
            ].map((s) => (
              <div key={s.label} className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl" style={{ background: s.bg }}>
                <div style={{ color: s.color }}>{s.icon}</div>
                <span className="text-xl sm:text-2xl font-bold leading-none" style={{ color: s.color }}>{s.value}</span>
                <span className="text-[11px] text-gray-500 font-medium">{s.label}</span>
              </div>
            ))}
          </div>
          <p className="text-center text-[11px] text-gray-400 mt-3">GeoStat · NAEC · jobs.ge — 2025</p>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">სფეროები და შრომის ბაზარი</h2>
            <p className="text-gray-500">რეალური მონაცემები 2024-2025 · GeoStat</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {marketData.map((md) => {
              const admitted22 = md.admitted_2022 ?? 0
              const admitted24 = md.admitted_2024 ?? 0
              const accent = FIELD_ACCENT[md.field] || "#1E3A8A"
              return (
                <Link
                  key={md.field}
                  href={`/fields`}
                  className="group bg-white rounded-2xl p-5 border border-gray-100 border-l-[3px] shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer"
                  style={{ borderLeftColor: accent }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200" style={{ background: `${accent}1a` }}>
                      <span style={{ color: accent }}><FieldIcon field={md.field} className="w-5 h-5" /></span>
                    </div>
                    <TrendIcon trend={md.trend} />
                  </div>

                  <h3 className="font-semibold text-gray-900 text-sm mb-3">{md.field_name_ka}</h3>

                  <div className="space-y-2">
                    {md.admitted_2024 != null && (
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          ჩარიცხული 2024-25:{" "}
                          <span className="font-semibold text-gray-800">{md.admitted_2024.toLocaleString()}</span>
                        </span>
                      </div>
                    )}
                    {md.avg_salary_2024 != null && (
                      <div className="flex items-center gap-1 pt-1 border-t border-gray-50">
                        <span className="text-xs text-gray-400">ხელფასი:</span>
                        <span className="text-xs font-bold text-[#1E3A8A]">{Math.round(md.avg_salary_2024).toLocaleString()} ₾</span>
                      </div>
                    )}
                    {md.trend_pct != null && admitted22 > 0 && admitted24 > 0 && (
                      <p className={`text-[11px] font-medium ${
                        md.trend === "growing" ? "text-green-700" : md.trend === "declining" ? "text-red-600" : "text-gray-500"
                      }`}>
                        {TREND_LABELS[md.trend]}: {md.trend_pct > 0 ? "+" : ""}{md.trend_pct}%
                      </p>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>

          <div className="text-center mt-8">
            <Link href="/fields">
              <Button variant="outline" className="cursor-pointer transition-all duration-200 hover:scale-105 gap-2">
                <BarChart3 className="w-4 h-4" />
                ყველა სფეროს ანალიზი
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">როგორ მუშაობს</h2>
            <p className="text-gray-500">3 მარტივი ნაბიჯი სწორი არჩევანისთვის</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: 1, icon: <Search className="w-6 h-6 text-white" />, title: "კითხვარი შეავსე", desc: "7 კითხვა შენი ინტერესების, ბიუჯეტისა და მიზნების შესახებ" },
              { step: 2, icon: <BarChart3 className="w-6 h-6 text-white" />, title: "შედეგები ნახე", desc: "შრომის ბაზრის ანალიზი და შენთვის შესაფერისი სპეციალობები" },
              { step: 3, icon: <BookOpen className="w-6 h-6 text-white" />, title: "გააკეთე არჩევანი", desc: "გრანტის ქულები, სწავლის ფასი, კარიერული პერსპექტივები" },
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-center text-center group">
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-[#1E3A8A] rounded-2xl flex items-center justify-center group-hover:scale-105 transition-all duration-200 shadow-lg">
                    {item.icon}
                  </div>
                  <div className="absolute -top-3 -right-3 w-7 h-7 rounded-full bg-[#F97316] text-white text-sm font-bold flex items-center justify-center shadow-md border-2 border-white">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/quiz">
              <Button size="lg" className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white cursor-pointer transition-all duration-200 hover:scale-105 gap-2">
                კითხვარი დაიწყე
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
