"use client"

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="ka">
      <body className="min-h-screen flex items-center justify-center bg-[#F4F6FF]">
        <div className="text-center px-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">რაღაც შეცდა</h1>
          <p className="text-gray-500 mb-6">სისტემური შეცდომა. გთხოვთ სცადოთ თავიდან.</p>
          <button
            onClick={reset}
            className="px-4 py-2 bg-[#1E3A8A] text-white rounded-lg text-sm font-medium hover:bg-[#1E3A8A]/90"
          >
            თავიდან ცდა
          </button>
        </div>
      </body>
    </html>
  )
}
