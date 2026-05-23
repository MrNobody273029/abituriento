import { notFound } from "next/navigation"
import Link from "next/link"
import { ChevronRight, MapPin, ExternalLink, BookOpen, TrendingUp, TrendingDown, Minus, ArrowRight } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FIELDS, DEGREE_LABELS, TYPE_LABELS } from "@/lib/constants"

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
  const uni = await prisma.university.findUnique({ where: { id } })
  if (!uni) return { title: "უნივერსიტეტი" }
  const title = `${uni.name_ka} — ფაკულტეტები და სწავლის ფასი`
  const description =
    uni.description_ka ||
    `${uni.name_ka} — სპეციალობები, სწავლის საფასური, გრანტის ინფორმაცია და ჩარიცხვის სტატისტიკა.`
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/universities/${id}` },
    openGraph: { title, description, url: `${SITE_URL}/universities/${id}` },
  }
}

export default async function UniversityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const university = await prisma.university.findUnique({
    where: { id },
    include: { programs: { orderBy: { name_ka: "asc" } } },
  })

  if (!university) notFound()

  const initials = university.name_ka
    .replace(/სსიპ\s*-?\s*/g, "").replace(/შპს\s*-?\s*/g, "").trim()
    .split(/\s+/).slice(0, 2).map((w: string) => w[0]).join("")

  const grouped = university.programs.reduce((acc, p) => {
    if (!acc[p.field]) acc[p.field] = []
    acc[p.field].push(p)
    return acc
  }, {} as Record<string, typeof university.programs>)

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "CollegeOrUniversity",
    name: university.name_ka,
    alternateName: university.name_en,
    url: university.website,
    address: { "@type": "PostalAddress", addressLocality: university.city, addressCountry: "GE" },
    description: university.description_ka || university.name_ka,
    numberOfStudents: { "@type": "QuantitativeValue", value: university.programs.length, unitText: "სპეციალობა" },
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "მთავარი",        item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "უნივერსიტეტები", item: `${SITE_URL}/universities` },
      { "@type": "ListItem", position: 3, name: university.name_ka, item: `${SITE_URL}/universities/${university.id}` },
    ],
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <JsonLd data={orgSchema} />
      <JsonLd data={breadcrumbSchema} />
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-gray-900 cursor-pointer transition-colors">მთავარი</Link>
        <ChevronRight className="w-4 h-4" />
        <Link href="/universities" className="hover:text-gray-900 cursor-pointer transition-colors">უნივერსიტეტები</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 font-medium truncate max-w-xs">{university.name_ka}</span>
      </nav>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
        <div className="flex items-center gap-6 flex-wrap">
          <div className="w-20 h-20 rounded-2xl shrink-0 overflow-hidden border border-gray-100 bg-white flex items-center justify-center">
            {university.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={university.logo_url} alt={university.name_ka} className="w-full h-full object-contain p-1.5" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] flex items-center justify-center text-white font-bold text-2xl">
                {initials}
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className={university.type === "state" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-gray-50 text-gray-600"}>
                {TYPE_LABELS[university.type]}
              </Badge>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{university.name_ka}</h1>
            <p className="text-gray-500 text-sm">{university.name_en}</p>
            {university.description_ka && (
              <p className="text-gray-600 text-sm mt-2 leading-relaxed">{university.description_ka}</p>
            )}
            <div className="flex items-center gap-4 mt-3 flex-wrap">
              <div className="flex items-center gap-1.5 text-sm text-gray-500">
                <MapPin className="w-4 h-4" />
                <span>{university.city}</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-gray-500">
                <BookOpen className="w-4 h-4" />
                <span>{university.programs.length} სპეციალობა</span>
              </div>
              {university.website && !university.website.includes("abituri.ge") && (
                <a href={university.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-[#1E3A8A] hover:underline cursor-pointer">
                  <ExternalLink className="w-4 h-4" />
                  ვებსაიტი
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-5">სპეციალობები</h2>
        {Object.entries(grouped).map(([field, programs]) => {
          const fieldAccent = FIELD_ACCENT[field] || "#1E3A8A"
          return (
          <div key={field} className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 rounded-full shrink-0" style={{ background: fieldAccent }} />
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                {FIELDS[field as keyof typeof FIELDS]?.name_ka || field}
              </h3>
              <span className="text-xs text-gray-400 ml-1">{programs.length}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {programs.map((program) => (
                <Link
                  key={program.id}
                  href={`/programs/${program.id}`}
                  className="group bg-white rounded-xl border border-gray-100 border-l-[3px] shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 p-4 cursor-pointer"
                  style={{ borderLeftColor: fieldAccent }}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-semibold text-sm text-gray-900 leading-tight group-hover:text-[#1E3A8A] transition-colors">{program.name_ka}</h4>
                    <Badge variant="outline" className="text-xs shrink-0">{DEGREE_LABELS[program.degree]}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold" style={{ color: program.tuition_fee > 0 ? fieldAccent : program.is_state_funded ? "#16a34a" : undefined }}>
                      {program.tuition_fee > 0 ? `${program.tuition_fee.toLocaleString()} ₾` : program.is_state_funded ? "0 ₾" : "—"}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <span>გრანტი: {program.grant_score_2025 ?? "—"}</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
          )
        })}
      </div>
    </div>
  )
}
