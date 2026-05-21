import Link from "next/link"
import { Home, Search } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <div className="text-8xl font-black text-[#1E3A8A]/10 mb-4">404</div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">გვერდი ვერ მოიძებნა</h1>
      <p className="text-gray-500 mb-8 max-w-sm">
        სამწუხაროდ, ეს გვერდი არ არსებობს. შეამოწმე მისამართი ან დაბრუნდი მთავარ გვერდზე.
      </p>
      <div className="flex gap-3">
        <Link href="/">
          <Button className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white cursor-pointer gap-2">
            <Home className="w-4 h-4" />
            მთავარი
          </Button>
        </Link>
        <Link href="/programs">
          <Button variant="outline" className="cursor-pointer gap-2">
            <Search className="w-4 h-4" />
            სპეციალობები
          </Button>
        </Link>
      </div>
    </div>
  )
}
