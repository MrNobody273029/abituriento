import type { Metadata } from "next"
import "./globals.css"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { Toaster } from "@/components/ui/sonner"
import { SITE_URL, SITE_NAME } from "@/lib/site"

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    template: `%s | ${SITE_NAME}`,
    default: `${SITE_NAME} — აბიტურიენტის გზამკვლევი`,
  },
  description:
    "საქართველოს უნივერსიტეტები, სპეციალობები, გრანტის ქულები და შრომის ბაზრის სტატისტიკა ერთ ადგილას. დაეხმარე საკუთარ თავს სწორი არჩევანის გაკეთებაში.",
  keywords: [
    "აბიტურიენტი",
    "უნივერსიტეტები საქართველოში",
    "სპეციალობის არჩევა",
    "გრანტი 2025",
    "ეროვნული გამოცდები 2025",
    "რომელ უნივერსიტეტში ჩავაბარო",
    "სწავლის საფასური უნივერსიტეტი",
    "კარიერა საქართველოში",
    "რა პროფესია ავირჩიო",
    "შრომის ბაზარი საქართველო 2025",
    "საშუალო ხელფასი საქართველოში",
    "სამართალი უნივერსიტეტი",
    "მედიცინა სპეციალობა",
    "IT სპეციალობა საქართველო",
    "ბიზნესი სპეციალობა",
    "ინჟინერია სპეციალობა",
    "აბიტურიენტი 2025",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  openGraph: {
    type: "website",
    locale: "ka_GE",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — აბიტურიენტის გზამკვლევი`,
    description:
      "საქართველოს უნივერსიტეტები, სპეციალობები, გრანტის ქულები და შრომის ბაზრის სტატისტიკა ერთ ადგილას.",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — აბიტურიენტის გზამკვლევი`,
    description: "საქართველოს უნივერსიტეტები, სპეციალობები და შრომის ბაზრის ანალიზი.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
    languages: { ka: SITE_URL },
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ka" className="h-full">
      <body className="min-h-full flex flex-col bg-[#F4F6FF] antialiased">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <Toaster />
      </body>
    </html>
  )
}
