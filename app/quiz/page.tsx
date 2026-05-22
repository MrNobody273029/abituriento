"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, ArrowLeft, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Code2, Stethoscope, Scale, BookText, Palette, FlaskConical,
  GraduationCap, HardHat, Sprout, Briefcase, Users, Monitor,
  Microscope, TreePine, Lightbulb, Target, Globe, TrendingUp,
  Building2, HeartHandshake,
} from "lucide-react"

type Option  = { value: string; label: string; icon?: React.ReactNode }
type Question = { id: string; question: string; hint: string; options: Option[] }

const QUESTIONS: Question[] = [
  {
    id: "interests",
    question: "რა გაინტერესებს?",
    hint: "შეგიძლია რამდენიმე ვარიანტი აირჩიო",
    options: [
      { value: "tech",        label: "ტექნოლოგია / IT",           icon: <Code2        className="w-5 h-5" /> },
      { value: "medicine",    label: "მედიცინა / ჯანდაცვა",       icon: <Stethoscope  className="w-5 h-5" /> },
      { value: "law",         label: "სამართალი",                  icon: <Scale        className="w-5 h-5" /> },
      { value: "business",    label: "ბიზნესი / ეკონომიკა",       icon: <Briefcase    className="w-5 h-5" /> },
      { value: "engineering", label: "ინჟინერია / მშენებლობა",    icon: <HardHat      className="w-5 h-5" /> },
      { value: "design",      label: "დიზაინი / არქიტექტურა",     icon: <Palette      className="w-5 h-5" /> },
      { value: "social",      label: "სოციალური / ფსიქოლოგია",    icon: <Users        className="w-5 h-5" /> },
      { value: "natural",     label: "ბუნებისმეტყველო / ბიოლოგია",  icon: <FlaskConical className="w-5 h-5" /> },
      { value: "education",   label: "განათლება / პედაგოგიკა",    icon: <GraduationCap className="w-5 h-5" /> },
      { value: "humanities",  label: "ჰუმანიტარული / ენები",      icon: <BookText     className="w-5 h-5" /> },
      { value: "agriculture", label: "სოფლის მეურნეობა / აგრო",      icon: <Sprout       className="w-5 h-5" /> },
    ],
  },
  {
    id: "workstyle",
    question: "სად / როგორ გიყვარს მუშაობა?",
    hint: "შეგიძლია რამდენიმე ვარიანტი აირჩიო",
    options: [
      { value: "computer",      label: "კომპიუტერთან",               icon: <Monitor       className="w-5 h-5" /> },
      { value: "people",        label: "ადამიანებთან / კლიენტებთან", icon: <Users         className="w-5 h-5" /> },
      { value: "outdoor",       label: "გარეთ / ველზე",              icon: <TreePine      className="w-5 h-5" /> },
      { value: "lab",           label: "ლაბორატორიაში / კლინიკაში",  icon: <Microscope    className="w-5 h-5" /> },
      { value: "creative_work", label: "კრეატიულ გარემოში",          icon: <Lightbulb     className="w-5 h-5" /> },
      { value: "remote",        label: "დისტანციურად (remote)",       icon: <Globe         className="w-5 h-5" /> },
    ],
  },
  {
    id: "strengths",
    question: "რა გამოგდის კარგად?",
    hint: "შეგიძლია რამდენიმე ვარიანტი აირჩიო",
    options: [
      { value: "logic",          label: "ლოგიკა / მათემატიკა",         icon: <Code2          className="w-5 h-5" /> },
      { value: "language_skill", label: "ენები / წერა / კომუნიკაცია",  icon: <BookText       className="w-5 h-5" /> },
      { value: "creativity",     label: "კრეატიულობა / ხელოვნება",     icon: <Palette        className="w-5 h-5" /> },
      { value: "helping",        label: "ადამიანებს დახმარება",         icon: <HeartHandshake className="w-5 h-5" /> },
      { value: "analysis",       label: "ანალიზი / კვლევა",             icon: <Microscope     className="w-5 h-5" /> },
      { value: "leadership",     label: "ლიდერობა / ორგანიზება",       icon: <Target         className="w-5 h-5" /> },
    ],
  },
  {
    id: "goals",
    question: "კარიერის მთავარი მიზანი?",
    hint: "შეგიძლია რამდენიმე ვარიანტი აირჩიო",
    options: [
      { value: "salary",       label: "მაღალი ხელფასი",              icon: <TrendingUp     className="w-5 h-5" /> },
      { value: "stability",    label: "სტაბილური სამუშაო",           icon: <Building2      className="w-5 h-5" /> },
      { value: "own_business", label: "საკუთარი ბიზნესი",            icon: <Briefcase      className="w-5 h-5" /> },
      { value: "public_good",  label: "საზოგადოებრივი სარგებელი",    icon: <HeartHandshake className="w-5 h-5" /> },
      { value: "research",     label: "მეცნიერება / კვლევა",          icon: <Microscope     className="w-5 h-5" /> },
      { value: "abroad",       label: "საზღვარგარეთ მუშაობა",        icon: <Globe          className="w-5 h-5" /> },
    ],
  },
  {
    id: "city",
    question: "სასწავლო ქალაქი?",
    hint: "შეგიძლია რამდენიმე ვარიანტი აირჩიო",
    options: [
      { value: "tbilisi",    label: "თბილისი" },
      { value: "kutaisi",    label: "ქუთაისი" },
      { value: "batumi",     label: "ბათუმი"  },
      { value: "other_city", label: "სხვა ქალაქი" },
      { value: "any_city",   label: "ნებისმიერი"  },
    ],
  },
  {
    id: "budget",
    question: "წლიური სწავლის ბიუჯეტი?",
    hint: "შეგიძლია რამდენიმე ვარიანტი აირჩიო",
    options: [
      { value: "grant",       label: "გრანტი (0 ₾)"    },
      { value: "budget_low",  label: "2,000 – 4,000 ₾" },
      { value: "budget_mid",  label: "4,000 – 7,000 ₾" },
      { value: "budget_high", label: "7,000+ ₾"         },
    ],
  },
  {
    id: "duration",
    question: "სწავლის ხანგრძლივობა?",
    hint: "შეგიძლია რამდენიმე ვარიანტი აირჩიო",
    options: [
      { value: "short",    label: "3 წელი"                  },
      { value: "standard", label: "4 წელი — ბაკალავრი (სტანდარტული)" },
      { value: "long",     label: "5–6 წელი (სამედიცინო / ინჟინერია)" },
      { value: "any_dur",  label: "არ მაქვს მნიშვნელობა"   },
    ],
  },
]

export default function QuizPage() {
  const router     = useRouter()
  const [step, setStep]       = useState(0)
  const [answers, setAnswers] = useState<Record<string, string[]>>({})
  const touchStart = useRef<{ x: number; y: number } | null>(null)

  const q       = QUESTIONS[step]
  const current = answers[q?.id] || []

  function toggle(value: string) {
    const arr = answers[q.id] || []
    setAnswers({
      ...answers,
      [q.id]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value],
    })
  }

  function canNext() { return (answers[q?.id] || []).length > 0 }

  function next() {
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    } else {
      const params = new URLSearchParams()
      Object.entries(answers).forEach(([k, v]) => { if (v.length > 0) params.set(k, v.join(",")) })
      router.push(`/quiz/results?${params.toString()}`)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-8">
        <div className="flex items-center justify-between text-sm text-gray-500 mb-2.5">
          <span className="font-medium text-gray-700">კითხვა {step + 1} / {QUESTIONS.length}</span>
          <span className="font-semibold text-[#1E3A8A]">{Math.round(((step + 1) / QUESTIONS.length) * 100)}%</span>
        </div>
        <Progress value={((step + 1) / QUESTIONS.length) * 100} className="h-2.5 rounded-full" />
      </div>

      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1.5">{q.question}</h2>
        <p className="text-sm text-gray-400">{q.hint}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
        {q.options.map((opt) => {
          const selected = current.includes(opt.value)
          return (
            <button
              key={opt.value}
              onTouchStart={(e) => { touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY } }}
              onTouchEnd={(e) => {
                if (!touchStart.current) return
                const dx = Math.abs(e.changedTouches[0].clientX - touchStart.current.x)
                const dy = Math.abs(e.changedTouches[0].clientY - touchStart.current.y)
                touchStart.current = null
                if (dx > 10 || dy > 10) return
                e.preventDefault(); toggle(opt.value)
              }}
              onClick={() => toggle(opt.value)}
              style={{ touchAction: "manipulation" }}
              className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer select-none hover:shadow-md ${
                selected ? "border-[#1E3A8A] bg-[#1E3A8A]/5 shadow-sm" : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-3">
                {opt.icon && (
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 shrink-0 ${selected ? "bg-[#1E3A8A] text-white" : "bg-gray-100 text-gray-500"}`}>
                    {opt.icon}
                  </div>
                )}
                <span className={`font-medium text-sm flex-1 ${selected ? "text-[#1E3A8A]" : "text-gray-700"}`}>
                  {opt.label}
                </span>
                {selected && <CheckCircle className="w-4 h-4 text-[#1E3A8A] shrink-0" />}
              </div>
            </button>
          )
        })}
      </div>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          style={{ touchAction: "manipulation" }}
          className="cursor-pointer gap-2 select-none"
          onClick={() => { if (step > 0) setStep(step - 1) }}
          disabled={step === 0}
        >
          <ArrowLeft className="w-4 h-4" />
          უკან
        </Button>
        <Button
          className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white cursor-pointer gap-2 select-none hover:scale-105 transition-transform"
          style={{ touchAction: "manipulation" }}
          disabled={!canNext()}
          onTouchStart={(e) => { touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY } }}
          onTouchEnd={(e) => {
            if (!touchStart.current) return
            const dy = Math.abs(e.changedTouches[0].clientY - touchStart.current.y)
            touchStart.current = null
            if (dy > 10) return
            e.preventDefault(); if (canNext()) next()
          }}
          onClick={next}
        >
          {step === QUESTIONS.length - 1 ? "შედეგები" : "შემდეგი"}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
