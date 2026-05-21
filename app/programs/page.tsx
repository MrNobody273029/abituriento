export const dynamic = "force-dynamic"

import { Suspense } from "react"
import { prisma } from "@/lib/prisma"
import ProgramsClient from "./ProgramsClient"

async function getPrograms(params: {
  field?: string
  degree?: string
  funded?: string
  sort?: string
  page?: string
  category?: string
  q?: string
}) {
  const where: Record<string, unknown> = {}
  if (params.field) where.field = params.field
  if (params.degree) where.degree = params.degree
  if (params.funded === "true") where.is_state_funded = true
  if (params.category === "college") {
    where.university = { category: "college" }
  } else if (params.category === "university") {
    where.university = { category: { not: "college" } }
  }
  if (params.q?.trim()) {
    where.name_ka = { contains: params.q.trim(), mode: "insensitive" }
  }

  const orderBy: Record<string, unknown>[] = []
  if (params.sort === "price_asc")   orderBy.push({ tuition_fee: "asc" })
  else if (params.sort === "price_desc") orderBy.push({ tuition_fee: "desc" })
  else if (params.sort === "score_desc") orderBy.push({ min_score_2025: { sort: "desc", nulls: "last" } })
  else orderBy.push({ name_ka: "asc" })

  const page = parseInt(params.page || "1")
  const perPage = 12
  const skip = (page - 1) * perPage

  const [programs, total] = await Promise.all([
    prisma.program.findMany({
      where,
      orderBy: orderBy as never,
      skip,
      take: perPage,
      include: { university: true },
    }),
    prisma.program.count({ where }),
  ])

  return { programs, total, page, perPage }
}

async function getFilterOptions() {
  const [universities] = await Promise.all([
    prisma.university.findMany({ select: { id: true, name_ka: true } }),
  ])
  return { universities }
}

import { SITE_URL } from "@/lib/site"

export const metadata = {
  title: "სპეციალობები — ყველა უნივერსიტეტი საქართველოში 2025",
  description:
    "1000+ სპეციალობა 116 უნივერსიტეტსა და კოლეჯში. ფილტრი სფეროს, ფასის, გრანტის და ქალაქის მიხედვით. NAEC 2025 ჩარიცხვის ქულები.",
  keywords: ["სპეციალობები საქართველო", "ფაკულტეტები", "გრანტი 2025", "სწავლის ფასი", "ჩარიცხვის ქულა"],
  alternates: { canonical: `${SITE_URL}/programs` },
  openGraph: {
    title: "სპეციალობები — ყველა უნივერსიტეტი საქართველოში 2025",
    description: "1000+ სპეციალობა · გრანტი · ჩარიცხვის ქულები · NAEC 2025",
    url: `${SITE_URL}/programs`,
  },
}

export default async function ProgramsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const params = await searchParams
  const [{ programs, total, page, perPage }, { universities }] = await Promise.all([
    getPrograms(params),
    getFilterOptions(),
  ])

  return (
    <ProgramsClient
      programs={programs}
      universities={universities}
      total={total}
      page={page}
      perPage={perPage}
      currentParams={params}
    />
  )
}
