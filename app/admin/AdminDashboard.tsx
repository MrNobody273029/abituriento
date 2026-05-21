"use client"

import { useState, useEffect } from "react"
import { Building2, BookOpen, BarChart3, LogOut, Loader2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { TYPE_LABELS, TREND_LABELS, DEGREE_LABELS } from "@/lib/constants"
import { toast } from "sonner"

type Stats = { universities: number; programs: number; marketData: number }

export default function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [stats, setStats] = useState<Stats | null>(null)
  const [universities, setUniversities] = useState<any[]>([])
  const [programs, setPrograms] = useState<any[]>([])
  const [marketData, setMarketData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [s, u, p, m] = await Promise.all([
          fetch("/api/admin/stats").then((r) => r.json()),
          fetch("/api/admin/universities").then((r) => r.json()),
          fetch("/api/admin/programs").then((r) => r.json()),
          fetch("/api/admin/market").then((r) => r.json()),
        ])
        setStats(s)
        setUniversities(u)
        setPrograms(p)
        setMarketData(m)
      } catch {
        toast.error("მონაცემები ვერ ჩაიტვირთა")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1E3A8A]" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ადმინ პანელი</h1>
          <p className="text-gray-500 text-sm">Abituriento.ge მართვის სისტემა</p>
        </div>
        <Button variant="outline" onClick={onLogout} className="cursor-pointer gap-2">
          <LogOut className="w-4 h-4" />
          გასვლა
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        {[
          { icon: <Building2 className="w-6 h-6 text-[#1E3A8A]" />, label: "უნივერსიტეტი", value: stats?.universities },
          { icon: <BookOpen className="w-6 h-6 text-[#F97316]" />, label: "სპეციალობა", value: stats?.programs },
          { icon: <BarChart3 className="w-6 h-6 text-[#16A34A]" />, label: "ბაზრის მონაცემი", value: stats?.marketData },
        ].map((item) => (
          <Card key={item.label} className="border-gray-100 shadow-sm">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center">{item.icon}</div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{item.value ?? "—"}</p>
                <p className="text-sm text-gray-500">{item.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="universities">
        <TabsList className="mb-6">
          <TabsTrigger value="universities" className="cursor-pointer">უნივერსიტეტები</TabsTrigger>
          <TabsTrigger value="programs" className="cursor-pointer">სპეციალობები</TabsTrigger>
          <TabsTrigger value="market" className="cursor-pointer">ბაზრის მონაცემები</TabsTrigger>
        </TabsList>

        <TabsContent value="universities">
          <Card className="border-gray-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">უნივერსიტეტები ({universities.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>სახელი</TableHead>
                    <TableHead>ტიპი</TableHead>
                    <TableHead>ქალაქი</TableHead>
                    <TableHead>სპეციალობა</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {universities.map((u: any) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.name_ka}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {TYPE_LABELS[u.type]}
                        </Badge>
                      </TableCell>
                      <TableCell>{u.city}</TableCell>
                      <TableCell>{u._count?.programs ?? 0}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="programs">
          <Card className="border-gray-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">სპეციალობები ({programs.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>სახელი</TableHead>
                    <TableHead>უნივერსიტეტი</TableHead>
                    <TableHead>ხარისხი</TableHead>
                    <TableHead>ფასი</TableHead>
                    <TableHead>გრანტი</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {programs.slice(0, 30).map((p: any) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.name_ka}</TableCell>
                      <TableCell className="text-xs text-gray-500">{p.university?.name_ka}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{DEGREE_LABELS[p.degree]}</Badge>
                      </TableCell>
                      <TableCell>{p.tuition_fee?.toLocaleString()} ₾</TableCell>
                      <TableCell>{p.grant_score_2025 ?? "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="market">
          <Card className="border-gray-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">ბაზრის მონაცემები</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>სფერო</TableHead>
                    <TableHead>ტენდენცია</TableHead>
                    <TableHead>ჩარიცხული 2024-25</TableHead>
                    <TableHead>კურსდამთავრებული 2025</TableHead>
                    <TableHead>ცვლილება %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {marketData.map((m: any) => (
                    <TableRow key={m.id}>
                      <TableCell className="font-medium">{m.field_name_ka}</TableCell>
                      <TableCell>{TREND_LABELS[m.trend]}</TableCell>
                      <TableCell>{m.admitted_2024?.toLocaleString() ?? "—"}</TableCell>
                      <TableCell>{m.graduated_2025?.toLocaleString() ?? "—"}</TableCell>
                      <TableCell>{m.trend_pct != null ? `${m.trend_pct > 0 ? "+" : ""}${m.trend_pct}%` : "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
