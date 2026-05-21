import type { Metadata } from "next"
import { SITE_URL } from "@/lib/site"

export const metadata: Metadata = {
  title: "კარიერის კვიზი — რა სპეციალობა ავირჩიო?",
  description:
    "7 კითხვა შენი ინტერესებისა და მიზნების შესახებ — და მივიღებ კონკრეტულ სპეციალობებს შრომის ბაზრის სტატისტიკით. GeoStat & NAEC 2025.",
  keywords: ["სპეციალობის არჩევა", "კარიერის გზამკვლევი", "რა პროფესია ავირჩიო", "კვიზი აბიტურიენტი"],
  alternates: { canonical: `${SITE_URL}/quiz` },
  openGraph: {
    title: "კარიერის კვიზი — რა სპეციალობა ავირჩიო?",
    description: "7 კითხვა → კონკრეტული სპეციალობები + ბაზრის სტატისტიკა",
    url: `${SITE_URL}/quiz`,
  },
}

export default function QuizLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
