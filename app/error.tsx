"use client"

import { useEffect } from "react"
import Link from "next/link"
import { AlertCircle, Home, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8 text-red-500" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">რაღაც შეცდა</h1>
      <p className="text-gray-500 mb-8 max-w-sm text-sm leading-relaxed">
        მოხდა მოულოდნელი შეცდომა. სცადე გვერდის გადატვირთვა.
      </p>
      <div className="flex gap-3">
        <Button
          onClick={reset}
          className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white cursor-pointer gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          სცადე თავიდან
        </Button>
        <Link href="/">
          <Button variant="outline" className="cursor-pointer gap-2">
            <Home className="w-4 h-4" />
            მთავარი
          </Button>
        </Link>
      </div>
    </div>
  )
}
