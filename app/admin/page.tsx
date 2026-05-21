"use client"

import { useState } from "react"
import { Lock, Building2, BookOpen, BarChart3, LogOut, Plus, Trash2, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AdminDashboard from "./AdminDashboard"

const PASSWORD = "abituriento2025"

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [pw, setPw] = useState("")
  const [error, setError] = useState("")

  function login() {
    if (pw === PASSWORD) {
      setAuthed(true)
      setError("")
    } else {
      setError("პაროლი არასწორია")
    }
  }

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-sm shadow-lg border-gray-100">
          <CardHeader className="text-center">
            <div className="w-14 h-14 bg-[#1E3A8A] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lock className="w-7 h-7 text-white" />
            </div>
            <CardTitle>ადმინ პანელი</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">პაროლი</Label>
              <Input
                type="password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && login()}
                className="mt-1"
                placeholder="შეიყვანე პაროლი"
              />
              {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
            </div>
            <Button onClick={login} className="w-full bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white cursor-pointer">
              შესვლა
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <AdminDashboard onLogout={() => setAuthed(false)} />
}
