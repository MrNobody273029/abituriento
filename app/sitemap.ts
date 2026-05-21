import { MetadataRoute } from "next"
import { prisma } from "@/lib/prisma"
import { SITE_URL } from "@/lib/site"

export const dynamic = "force-dynamic"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [programs, universities] = await Promise.all([
    prisma.program.findMany({ select: { id: true, createdAt: true } }),
    prisma.university.findMany({ select: { id: true, createdAt: true } }),
  ])

  const statics: MetadataRoute.Sitemap = [
    { url: SITE_URL,                      lastModified: new Date(), changeFrequency: "weekly",  priority: 1.0 },
    { url: `${SITE_URL}/programs`,        lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/universities`,    lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/fields`,          lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/quiz`,            lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/grant`,           lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/quiz/results`,    lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ]

  const programPages: MetadataRoute.Sitemap = programs.map((p) => ({
    url:             `${SITE_URL}/programs/${p.id}`,
    lastModified:    p.createdAt,
    changeFrequency: "monthly",
    priority:        0.8,
  }))

  const universityPages: MetadataRoute.Sitemap = universities.map((u) => ({
    url:             `${SITE_URL}/universities/${u.id}`,
    lastModified:    u.createdAt,
    changeFrequency: "monthly",
    priority:        0.8,
  }))

  return [...statics, ...programPages, ...universityPages]
}
