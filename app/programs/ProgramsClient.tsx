"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight, Filter, ChevronLeft, ChevronRight, Building2, Search, X, SlidersHorizontal } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
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

type Program = {
  id: string
  name_ka: string
  faculty_ka: string
  degree: string
  tuition_fee: number
  is_state_funded: boolean
  grant_score_2025: number | null
  grant_score_2024: number | null
  field: string
  university: { id: string; name_ka: string; type: string; logo_url: string | null }
}

type University = { id: string; name_ka: string }

export default function ProgramsClient({
  programs,
  universities,
  total,
  page,
  perPage,
  currentParams,
}: {
  programs: Program[]
  universities: University[]
  total: number
  page: number
  perPage: number
  currentParams: Record<string, string>
}) {
  const router = useRouter()
  const totalPages = Math.ceil(total / perPage)
  const [searchVal, setSearchVal] = useState(currentParams.q || "")

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(currentParams)
    if (value) params.set(key, value)
    else params.delete(key)
    params.delete("page")
    router.push(`/programs?${params.toString()}`)
  }

  function goToPage(p: number) {
    const params = new URLSearchParams(currentParams)
    params.set("page", String(p))
    router.push(`/programs?${params.toString()}`)
  }

  const FiltersContent = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">სფერო</h3>
        <div className="space-y-1.5">
          {Object.entries(FIELDS).map(([key, val]) => (
            <div
              key={key}
              className={`flex items-center gap-2.5 cursor-pointer px-2 py-1.5 rounded-lg transition-colors ${currentParams.field === key ? "bg-[#1E3A8A]/8" : "hover:bg-gray-50"}`}
              onClick={() => updateParam("field", currentParams.field === key ? null : key)}
            >
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: FIELD_ACCENT[key] || "#6b7280" }} />
              <span className="text-sm text-gray-700">{val.name_ka}</span>
              {currentParams.field === key && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#1E3A8A]" />}
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">ხარისხი</h3>
        <div className="space-y-1.5">
          {Object.entries(DEGREE_LABELS).map(([key, label]) => (
            <div
              key={key}
              className={`flex items-center gap-2.5 cursor-pointer px-2 py-1.5 rounded-lg transition-colors ${currentParams.degree === key ? "bg-[#1E3A8A]/8" : "hover:bg-gray-50"}`}
              onClick={() => updateParam("degree", currentParams.degree === key ? null : key)}
            >
              <Checkbox checked={currentParams.degree === key} className="cursor-pointer" />
              <span className="text-sm text-gray-700">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">სასწავლებელი</h3>
        <div className="flex flex-col gap-1">
          {[
            { value: null,         label: "ყველა" },
            { value: "university", label: "მხოლოდ უნივერსიტეტი" },
            { value: "college",    label: "მხოლოდ კოლეჯი" },
          ].map(({ value, label }) => (
            <button
              key={label}
              onClick={() => updateParam("category", value)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer font-medium ${
                (currentParams.category ?? null) === value
                  ? "bg-[#1E3A8A] text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      <div className="flex items-center justify-between">
        <Label className="font-semibold text-gray-900 cursor-pointer text-sm">მხოლოდ გრანტიანი</Label>
        <Switch
          checked={currentParams.funded === "true"}
          onCheckedChange={(v) => updateParam("funded", v ? "true" : null)}
          className="cursor-pointer"
        />
      </div>

      <Separator />

      <Button
        variant="outline"
        size="sm"
        className="w-full cursor-pointer text-sm"
        onClick={() => router.push("/programs")}
      >
        ფილტრების გასუფთავება
      </Button>
    </div>
  )

  function submitSearch(val: string) {
    const params = new URLSearchParams(currentParams)
    if (val.trim()) params.set("q", val.trim())
    else params.delete("q")
    params.delete("page")
    router.push(`/programs?${params.toString()}`)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page header */}
      <div className="mb-6">
        <div className="flex items-end justify-between mb-4 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-950">სპეციალობები</h1>
            <p className="text-gray-400 text-sm mt-0.5">{total.toLocaleString()} სპეციალობა</p>
          </div>

          <div className="flex items-center gap-2">
            <Select
              value={currentParams.sort || "alpha"}
              onValueChange={(v) => updateParam("sort", v === "alpha" ? null : v)}
            >
              <SelectTrigger className="w-48 cursor-pointer h-9 text-sm bg-white">
                <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400 mr-1" />
                <SelectValue placeholder="დალაგება" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="alpha" className="cursor-pointer">ანბანური</SelectItem>
                <SelectItem value="price_asc" className="cursor-pointer">ფასი ↑</SelectItem>
                <SelectItem value="price_desc" className="cursor-pointer">ფასი ↓</SelectItem>
                <SelectItem value="score_desc" className="cursor-pointer">ჩარიცხვის ქულა ↓</SelectItem>
              </SelectContent>
            </Select>

            <Sheet>
              <SheetTrigger className="md:hidden inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-50 cursor-pointer h-9">
                <Filter className="w-4 h-4" />
                ფილტრი
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle>ფილტრები</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FiltersContent />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Search */}
        <form
          onSubmit={(e) => { e.preventDefault(); submitSearch(searchVal) }}
          className="relative"
        >
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder="სპეციალობის სახელი..."
            className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A]/50 transition-all shadow-sm"
          />
          {searchVal && (
            <button
              type="button"
              onClick={() => { setSearchVal(""); submitSearch("") }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </form>
      </div>

      <div className="flex gap-7">
        {/* Sidebar filters */}
        <aside className="hidden md:block w-52 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm sticky top-24">
            <FiltersContent />
          </div>
        </aside>

        {/* Cards grid */}
        <div className="flex-1 min-w-0">
          {programs.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-base font-medium">სპეციალობა ვერ მოიძებნა</p>
              <p className="text-sm mt-1">სცადე ფილტრების შეცვლა</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {programs.map((program) => {
                const accent = FIELD_ACCENT[program.field] || "#1E3A8A"
                const fieldMeta = FIELDS[program.field as keyof typeof FIELDS]
                return (
                  <div
                    key={program.id}
                    className="group bg-white rounded-2xl border border-gray-100 border-l-[3px] shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 flex flex-col min-w-0 overflow-hidden"
                    style={{ borderLeftColor: accent }}
                  >
                    <div className="p-4 flex flex-col gap-2.5 flex-1">
                      {/* Badges row */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {fieldMeta && (
                          <span
                            className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                            style={{ background: `${accent}18`, color: accent }}
                          >
                            {fieldMeta.name_ka}
                          </span>
                        )}
                        <span className="text-[11px] text-gray-400 border border-gray-200 px-2 py-0.5 rounded-full">
                          {DEGREE_LABELS[program.degree] ?? program.degree}
                        </span>
                        {program.university.type === "state" && (
                          <span className="text-[11px] text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full font-medium">
                            სახელმწიფო
                          </span>
                        )}
                        {program.is_state_funded && (
                          <span className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full font-semibold">
                            ✓ გრანტი
                          </span>
                        )}
                      </div>

                      {/* Program name */}
                      <div>
                        <h3 className="font-bold text-gray-950 text-[14.5px] leading-snug break-words">
                          {program.name_ka}
                        </h3>
                        {program.faculty_ka && (
                          <p className="text-[12px] text-gray-400 mt-0.5 break-words line-clamp-1">
                            {program.faculty_ka}
                          </p>
                        )}
                      </div>

                      {/* University */}
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-5 h-5 rounded-md overflow-hidden shrink-0 border border-gray-100 bg-gray-50 flex items-center justify-center">
                          {program.university.logo_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={program.university.logo_url} alt="" className="w-full h-full object-contain" />
                          ) : (
                            <Building2 className="w-3 h-3 text-gray-300" />
                          )}
                        </div>
                        <span className="text-[12px] text-gray-500 truncate">{program.university.name_ka}</span>
                      </div>
                    </div>

                    {/* Bottom row */}
                    <div className="px-4 py-3 border-t border-gray-50 flex items-center justify-between gap-2 bg-gray-50/50">
                      <div className="flex flex-col min-w-0">
                        <span className="text-base font-bold text-gray-900 leading-none">
                          {program.tuition_fee.toLocaleString()} <span className="text-xs font-medium text-gray-400">₾/წელი</span>
                        </span>
                        {program.grant_score_2025 ? (
                          <span className="text-[11px] text-amber-600 font-medium mt-0.5">
                            ბარიერი {program.grant_score_2025.toLocaleString()}
                          </span>
                        ) : null}
                      </div>
                      <Link href={`/programs/${program.id}`}>
                        <button
                          className="inline-flex items-center gap-1 text-[12px] font-semibold text-white px-3 py-1.5 rounded-lg transition-all duration-200 group-hover:gap-1.5 cursor-pointer"
                          style={{ background: accent }}
                        >
                          დეტალები
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1.5 mt-8">
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer h-8 w-8 p-0 bg-white"
                disabled={page <= 1}
                onClick={() => goToPage(page - 1)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              {(() => {
                const items: (number | "…")[] = []
                const delta = 2
                for (let i = 1; i <= totalPages; i++) {
                  if (i === 1 || i === totalPages || (i >= page - delta && i <= page + delta)) {
                    items.push(i)
                  } else if (items[items.length - 1] !== "…") {
                    items.push("…")
                  }
                }
                return items.map((item, idx) =>
                  item === "…" ? (
                    <span key={`e-${idx}`} className="px-1 text-gray-300 text-sm select-none">…</span>
                  ) : (
                    <Button
                      key={item}
                      variant={item === page ? "default" : "outline"}
                      size="sm"
                      className={`cursor-pointer h-8 w-8 p-0 text-sm ${item === page ? "bg-[#1E3A8A] border-[#1E3A8A]" : "bg-white"}`}
                      onClick={() => goToPage(item)}
                    >
                      {item}
                    </Button>
                  )
                )
              })()}

              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer h-8 w-8 p-0 bg-white"
                disabled={page >= totalPages}
                onClick={() => goToPage(page + 1)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
