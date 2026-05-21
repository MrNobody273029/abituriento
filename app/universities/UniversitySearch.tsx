"use client"

import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useTransition } from "react"

export default function UniversitySearch({ defaultValue }: { defaultValue: string }) {
  const router = useRouter()
  const [, startTransition] = useTransition()

  return (
    <div className="relative max-w-md">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      <Input
        defaultValue={defaultValue}
        placeholder="მოიძიე უნივერსიტეტი..."
        className="pl-9 cursor-text"
        onChange={(e) => {
          startTransition(() => {
            const q = e.target.value
            if (q) router.push(`/universities?q=${encodeURIComponent(q)}`)
            else router.push("/universities")
          })
        }}
      />
    </div>
  )
}
