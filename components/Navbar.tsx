"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Menu, X, GraduationCap } from "lucide-react"
import { Button } from "@/components/ui/button"

const links = [
  { href: "/programs", label: "სპეციალობები" },
  { href: "/universities", label: "უნივერსიტეტები" },
  { href: "/fields", label: "სფეროები" },
  { href: "/grant", label: "გრანტი" },
]

export default function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/60 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 cursor-pointer group">
            <div className="w-8 h-8 bg-[#1E3A8A] rounded-lg flex items-center justify-center transition-all duration-200 group-hover:scale-105">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-[#1E3A8A] text-xl tracking-tight">Abituriento</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                  pathname.startsWith(link.href)
                    ? "bg-[#1E3A8A]/10 text-[#1E3A8A]"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link href="/quiz" className="hidden md:block">
              <Button className="bg-[#F97316] hover:bg-[#EA6C0A] text-white cursor-pointer transition-all duration-200 hover:scale-105">
                კითხვარი
              </Button>
            </Link>
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 cursor-pointer"
              onClick={() => setOpen(!open)}
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {open && (
          <div className="md:hidden pb-4 border-t border-gray-100 pt-3 flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                  pathname.startsWith(link.href)
                    ? "bg-[#1E3A8A]/10 text-[#1E3A8A]"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/quiz" onClick={() => setOpen(false)}>
              <Button className="w-full mt-2 bg-[#F97316] hover:bg-[#EA6C0A] text-white cursor-pointer">
                კითხვარი
              </Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
