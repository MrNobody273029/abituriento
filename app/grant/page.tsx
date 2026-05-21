import { prisma } from "@/lib/prisma"
import GrantClient from "./GrantClient"

import { SITE_URL } from "@/lib/site"

export const metadata = {
  title: "საგრანტო კალკულატორი 2025 — ეროვნული გამოცდები",
  description: "გამოთვალე საგრანტო ქულა და გაიგე მოიპოვებ თუ არა 50%, 70% ან 100%-იან სახელმწიფო სასწავლო გრანტს. NAEC 2025 ზღვრები.",
  keywords: ["გრანტი 2025", "საგრანტო ქულა", "ეროვნული გამოცდები", "სახელმწიფო გრანტი"],
  alternates: { canonical: `${SITE_URL}/grant` },
  openGraph: {
    title: "საგრანტო კალკულატორი 2025",
    description: "50% / 70% / 100% გრანტი — გამოთვალე შენი ქულა · NAEC 2025",
    url: `${SITE_URL}/grant`,
  },
}

export default async function GrantPage() {
  const thresholds = await prisma.grantThreshold.findMany({
    where: { year: 2025 },
    orderBy: { subject: "asc" },
  })

  // Separate main subjects from minority language ones
  const mainSubjects = thresholds.filter((t) => t.grant_50 !== null)
  const minoritySubjects = thresholds.filter((t) => t.grant_50 === null)

  return <GrantClient mainSubjects={mainSubjects} minoritySubjects={minoritySubjects} />
}
