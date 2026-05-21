import Link from "next/link"
import { GraduationCap, Mail, ExternalLink } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-[#1E3A8A] text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl">Abituriento</span>
            </div>
            <p className="text-blue-200 text-sm leading-relaxed">
              გზამკვლევი საქართველოს აბიტურიენტებისთვის. შეარჩიე სწორი გზა.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-blue-100">ნავიგაცია</h3>
            <ul className="space-y-2">
              {[
                { href: "/programs", label: "სპეციალობები" },
                { href: "/universities", label: "უნივერსიტეტები" },
                { href: "/fields", label: "სფეროები" },
                { href: "/quiz", label: "კითხვარი" },
                { href: "/grant", label: "საგრანტო კალკულატორი" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-blue-200 hover:text-white transition-colors duration-200 text-sm cursor-pointer">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-blue-100">სასარგებლო ბმულები</h3>
            <ul className="space-y-2">
              {[
                { href: "https://mes.gov.ge", label: "განათლების სამინისტრო" },
                { href: "https://naec.ge", label: "შეფასებისა და გამოცდების ცენტრი (NAEC)" },
                { href: "https://jobs.ge", label: "Jobs.ge" },
              ].map((link) => (
                <li key={link.href}>
                  <a href={link.href} target="_blank" rel="noopener noreferrer" className="text-blue-200 hover:text-white transition-colors duration-200 text-sm cursor-pointer flex items-center gap-1">
                    {link.label}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-blue-100">კონტაქტი</h3>
            <a href="mailto:info@abituriento.ge" className="text-blue-200 hover:text-white transition-colors duration-200 text-sm cursor-pointer flex items-center gap-2">
              <Mail className="w-4 h-4" />
              info@abituriento.ge
            </a>
          </div>
        </div>

        <div className="border-t border-blue-800 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-blue-300 text-sm">
            © 2025 Abituriento.ge — ყველა უფლება დაცულია
          </p>
          <p className="text-blue-400 text-xs">
            მონაცემები განახლდება ყოველთვიურად
          </p>
        </div>
      </div>
    </footer>
  )
}
