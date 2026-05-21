export const dynamic = "force-dynamic"

import Link from "next/link"
import { MapPin, BookOpen } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import { TYPE_LABELS } from "@/lib/constants"
import UniversitySearch from "./UniversitySearch"

import { SITE_URL } from "@/lib/site"

export const metadata = {
  title: "უნივერსიტეტები საქართველოში — 116 სასწავლებელი 2025",
  description:
    "საქართველოს 56 უნივერსიტეტი და 60 კოლეჯი: სპეციალობები, სწავლის ფასები, ადგილმდებარეობა. კავკასიის, თბსუ, ივ. ჯავახიშვილი და სხვ.",
  keywords: ["უნივერსიტეტები საქართველოში", "კოლეჯები", "სახელმწიფო უნივერსიტეტი", "კერძო უნივერსიტეტი"],
  alternates: { canonical: `${SITE_URL}/universities` },
  openGraph: {
    title: "უნივერსიტეტები საქართველოში — 116 სასწავლებელი 2025",
    description: "56 უნივერსიტეტი · 60 კოლეჯი · სწავლის ფასები · სპეციალობები",
    url: `${SITE_URL}/universities`,
  },
}

export default async function UniversitiesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const params = await searchParams
  const q = params.q?.toLowerCase() || ""

  const all = await prisma.university.findMany({
    include: { _count: { select: { programs: true } } },
    orderBy: { name_ka: "asc" },
  })

  const filtered = q
    ? all.filter(
        (u) =>
          u.name_ka.toLowerCase().includes(q) ||
          u.name_en.toLowerCase().includes(q) ||
          u.city.toLowerCase().includes(q)
      )
    : all

  const universities = filtered.filter((u) => u.category !== "college")
  const colleges = filtered.filter((u) => u.category === "college")

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-950 mb-0.5">უნივერსიტეტები</h1>
        <p className="text-gray-400 text-sm">
          {universities.length} უნივერსიტეტი
          {colleges.length > 0 && ` · ${colleges.length} კოლეჯი`}
        </p>
      </div>

      <UniversitySearch defaultValue={q} />

      {/* Universities */}
      <section className="mt-6">
        {q && universities.length === 0 && colleges.length === 0 && (
          <p className="text-gray-400 text-sm mt-8">ვერ მოიძებნა: &quot;{q}&quot;</p>
        )}

        {universities.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {universities.map((uni) => (
              <UniCard key={uni.id} uni={uni} />
            ))}
          </div>
        )}
      </section>

      {/* Colleges — separate section */}
      {colleges.length > 0 && (
        <section className="mt-14">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-gray-950">კოლეჯები</h2>
            <p className="text-gray-400 text-sm mt-0.5">{colleges.length} პროფესიული სასწავლებელი</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {colleges.map((uni) => (
              <UniCard key={uni.id} uni={uni} compact />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

type UniWithCount = {
  id: string
  name_ka: string
  name_en: string
  city: string
  type: string
  category: string
  logo_url: string | null
  _count: { programs: number }
}

function UniCard({ uni, compact }: { uni: UniWithCount; compact?: boolean }) {
  const initials = uni.name_ka
    .replace(/სსიპ\s*-?\s*/g, "")
    .replace(/შპს\s*-?\s*/g, "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")

  const isState = uni.type === "state"

  return (
    <Link
      href={`/universities/${uni.id}`}
      className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 cursor-pointer overflow-hidden block"
    >
      <div className={`${compact ? "p-4" : "p-5"} flex flex-col gap-3`}>
        {/* Logo + name */}
        <div className="flex items-start gap-3.5">
          <div className={`${compact ? "w-10 h-10" : "w-12 h-12"} rounded-xl shrink-0 overflow-hidden border border-gray-100 bg-white flex items-center justify-center shadow-sm`}>
            {uni.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={uni.logo_url} alt={uni.name_ka} className="w-full h-full object-contain p-1" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] flex items-center justify-center text-white font-bold text-sm">
                {initials}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className={`font-bold text-gray-950 ${compact ? "text-[13px]" : "text-[13.5px]"} leading-snug group-hover:text-[#1E3A8A] transition-colors break-words`}>
              {uni.name_ka}
            </h3>
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${isState ? "bg-blue-50 text-blue-700 border-blue-100" : "bg-gray-50 text-gray-600 border-gray-200"}`}>
                {TYPE_LABELS[uni.type] ?? uni.type}
              </span>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center justify-between pt-2.5 border-t border-gray-50">
          <div className="flex items-center gap-1 text-gray-400">
            <MapPin className="w-3.5 h-3.5" />
            <span className="text-xs">{uni.city}</span>
          </div>
          <div className="flex items-center gap-1 font-semibold text-[#1E3A8A]">
            <BookOpen className="w-3.5 h-3.5" />
            <span className="text-xs">{uni._count.programs} სპეციალობა</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
