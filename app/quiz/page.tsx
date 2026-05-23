"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, ArrowLeft, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  BrainCircuit, Calculator, FlaskConical, Code2, PenLine, BookOpen,
  Languages, MessageCircle, Crown, ClipboardList, Palette, Paintbrush,
  Music, Wrench, HeartHandshake, Handshake, Microscope, Dumbbell, Zap, Mic,
  Settings, Heart, TrendingUp, Database,
  Globe, Scale, Lightbulb, GraduationCap,
  Brain, Users, Briefcase, Building2, Newspaper,
  Monitor, Film, Sparkles,
  Hammer, Leaf, MapPin, Shield, Stethoscope,
  Terminal, Cpu, Activity, BarChart3, Camera,
} from "lucide-react"

// ── Types ─────────────────────────────────────────────────────────────────────

type Option = {
  value:     string
  label:     string
  sublabel?: string
  icon?:     React.ReactNode
}

type QuizStep = {
  id:          string
  question:    string
  hint:        string
  multiSelect: boolean
  maxSelect?:  number
  options:     Option[]
}

// ── Q1 ────────────────────────────────────────────────────────────────────────

const Q1_OPTIONS: Option[] = [
  { value: "logic",         label: "ლოგიკური აზროვნება და ამოცანების გადაჭრა",      icon: <BrainCircuit   className="w-5 h-5" /> },
  { value: "math",          label: "მათემატიკა და ციფრები",                          icon: <Calculator     className="w-5 h-5" /> },
  { value: "exact_sci",     label: "ზუსტი მეცნიერებები — ფიზიკა, ქიმია, ბიოლოგია",  icon: <FlaskConical   className="w-5 h-5" /> },
  { value: "programming",   label: "პროგრამირება და ტექნოლოგია",                    icon: <Code2          className="w-5 h-5" /> },
  { value: "writing",       label: "წერა და ტექსტის შედგენა",                       icon: <PenLine        className="w-5 h-5" /> },
  { value: "analysis",      label: "კითხვა და ანალიზი",                             icon: <BookOpen       className="w-5 h-5" /> },
  { value: "lang",          label: "უცხო ენები",                                    icon: <Languages      className="w-5 h-5" /> },
  { value: "communication", label: "კომუნიკაცია და დარწმუნება",                     icon: <MessageCircle  className="w-5 h-5" /> },
  { value: "leadership",    label: "ლიდერობა და გუნდის მართვა",                    icon: <Crown          className="w-5 h-5" /> },
  { value: "organizing",    label: "ორგანიზება და დაგეგმვა",                       icon: <ClipboardList  className="w-5 h-5" /> },
  { value: "creativity",    label: "შემოქმედება და დიზაინი",                       icon: <Palette        className="w-5 h-5" /> },
  { value: "visual_art",    label: "ხატვა და ვიზუალური ხელოვნება",                 icon: <Paintbrush     className="w-5 h-5" /> },
  { value: "music",         label: "მუსიკა და შემსრულებლობა",                      icon: <Music          className="w-5 h-5" /> },
  { value: "hands_tech",    label: "ხელებით მუშაობა და ტექნიკური უნარები",         icon: <Wrench         className="w-5 h-5" /> },
  { value: "helping",       label: "ადამიანების მოსმენა და დახმარება",             icon: <HeartHandshake className="w-5 h-5" /> },
  { value: "sales",         label: "გაყიდვები და მოლაპარაკება",                    icon: <Handshake      className="w-5 h-5" /> },
  { value: "research",      label: "კვლევა და ინფორმაციის მოძიება",                icon: <Microscope     className="w-5 h-5" /> },
  { value: "sports",        label: "სპორტი და ფიზიკური შესაძლებლობები",            icon: <Dumbbell       className="w-5 h-5" /> },
  { value: "fast_learning", label: "სწრაფი სწავლა და ადაპტაცია",                  icon: <Zap            className="w-5 h-5" /> },
  { value: "presentation",  label: "პრეზენტაცია და საჯარო გამოსვლა",              icon: <Mic            className="w-5 h-5" /> },
]

// ── Cluster scoring ────────────────────────────────────────────────────────────

const CLUSTER_MAP: Record<string, string[]> = {
  STEM:       ["logic", "math", "exact_sci", "programming", "research"],
  HUMANITIES: ["writing", "analysis", "lang", "research"],
  SOCIAL:     ["communication", "leadership", "helping", "sales", "presentation"],
  CREATIVE:   ["creativity", "visual_art", "music"],
  PRACTICAL:  ["hands_tech", "organizing", "sports", "fast_learning"],
}

const CLUSTER_PRIORITY = ["STEM", "SOCIAL", "HUMANITIES", "CREATIVE", "PRACTICAL"]

function getDominantCluster(skills: string[]): string {
  const scores: Record<string, number> = {}
  for (const [cluster, vals] of Object.entries(CLUSTER_MAP)) {
    scores[cluster] = skills.filter(s => vals.includes(s)).length
  }
  const max = Math.max(...Object.values(scores))
  if (max === 0) return "STEM"
  return CLUSTER_PRIORITY.find(c => scores[c] === max) || "STEM"
}

// ── Q2 per cluster ─────────────────────────────────────────────────────────────

const Q2_BY_CLUSTER: Record<string, { question: string; hint: string; options: Option[] }> = {
  STEM: {
    question: "რომელი მიმართულება გაინტერესებს მეტად?",
    hint: "ერთი ვარიანტი",
    options: [
      { value: "stem_computers", label: "კომპიუტერები და პროგრამირება",         icon: <Code2        className="w-5 h-5" /> },
      { value: "stem_machines",  label: "მანქანები, შენობები, ინფრასტრუქტურა",  icon: <Settings     className="w-5 h-5" /> },
      { value: "stem_health",    label: "ადამიანის ორგანიზმი და ჯანმრთელობა",   icon: <Heart        className="w-5 h-5" /> },
      { value: "stem_nature",    label: "ბუნება, ქიმია, ბიოლოგია, ფიზიკა",     icon: <FlaskConical className="w-5 h-5" /> },
      { value: "stem_economics", label: "ეკონომიკა, ბაზარი, ფინანსები",         icon: <TrendingUp   className="w-5 h-5" /> },
      { value: "stem_data",      label: "მონაცემები, სტატისტიკა, ანალიტიკა",   icon: <Database     className="w-5 h-5" /> },
    ],
  },
  HUMANITIES: {
    question: "რა ტიპის სამუშაო გაინტერესებს?",
    hint: "ერთი ვარიანტი",
    options: [
      { value: "hum_text",       label: "ტექსტებთან მუშაობა — წერა, თარგმნა, რედაქტირება", icon: <PenLine       className="w-5 h-5" /> },
      { value: "hum_history",    label: "წარსულის შესწავლა და კულტურა",                      icon: <BookOpen      className="w-5 h-5" /> },
      { value: "hum_society",    label: "საზოგადოების და პოლიტიკის ანალიზი",                 icon: <Globe         className="w-5 h-5" /> },
      { value: "hum_law",        label: "სამართალი და სამართლიანობა",                        icon: <Scale         className="w-5 h-5" /> },
      { value: "hum_philosophy", label: "ფილოსოფია და ეთიკა",                                icon: <Lightbulb     className="w-5 h-5" /> },
      { value: "hum_teaching",   label: "ენების სწავლება",                                   icon: <GraduationCap className="w-5 h-5" /> },
    ],
  },
  SOCIAL: {
    question: "ვისთან და როგორ გინდა მუშაობა?",
    hint: "ერთი ვარიანტი",
    options: [
      { value: "soc_medical",    label: "ავადმყოფ ადამიანებთან — მათი განკურნება",  icon: <Stethoscope className="w-5 h-5" /> },
      { value: "soc_psychology", label: "ადამიანების ფსიქოლოგიური დახმარება",        icon: <Brain       className="w-5 h-5" /> },
      { value: "soc_children",   label: "ბავშვებთან და ახალგაზრდებთან",              icon: <Users       className="w-5 h-5" /> },
      { value: "soc_business",   label: "ბიზნესში — გაყიდვა, მართვა, ლიდერობა",     icon: <Briefcase   className="w-5 h-5" /> },
      { value: "soc_court",      label: "სასამართლოში — ადამიანების დაცვა",          icon: <Scale       className="w-5 h-5" /> },
      { value: "soc_state",      label: "სახელმწიფო და პოლიტიკა",                    icon: <Building2   className="w-5 h-5" /> },
      { value: "soc_media",      label: "მედია და კომუნიკაცია",                      icon: <Newspaper   className="w-5 h-5" /> },
    ],
  },
  CREATIVE: {
    question: "რა ფორმატში გინდა შექმნა?",
    hint: "ერთი ვარიანტი",
    options: [
      { value: "cre_digital",   label: "ციფრული — ვებსაიტები, აპლიკაციები, UI", icon: <Monitor   className="w-5 h-5" /> },
      { value: "cre_buildings", label: "შენობები და სივრცე",                     icon: <Building2 className="w-5 h-5" /> },
      { value: "cre_graphic",   label: "გრაფიკა, ბრენდი, ვიზუალი",              icon: <Palette   className="w-5 h-5" /> },
      { value: "cre_film",      label: "კინო, ვიდეო, ფოტოგრაფია",               icon: <Film      className="w-5 h-5" /> },
      { value: "cre_fashion",   label: "მოდა და ტექსტილი",                       icon: <Sparkles  className="w-5 h-5" /> },
      { value: "cre_music",     label: "მუსიკა — შედგენა ან შესრულება",         icon: <Music     className="w-5 h-5" /> },
      { value: "cre_theater",   label: "თეატრი და სცენა",                        icon: <Mic       className="w-5 h-5" /> },
    ],
  },
  PRACTICAL: {
    question: "რა ტიპის გარემო გირჩევნია?",
    hint: "ერთი ვარიანტი",
    options: [
      { value: "pra_factory",      label: "ქარხანა, სახელოსნო, ტექნიკური გარემო",   icon: <Settings  className="w-5 h-5" /> },
      { value: "pra_construction", label: "სამშენებლო — შენობები, გზები, ხიდები",   icon: <Hammer    className="w-5 h-5" /> },
      { value: "pra_nature",       label: "ბუნება — ტყე, მინდვრები, ცხოველები",     icon: <Leaf      className="w-5 h-5" /> },
      { value: "pra_sports",       label: "სპორტული გარემო — ვარჯიში, გუნდი",       icon: <Dumbbell  className="w-5 h-5" /> },
      { value: "pra_travel",       label: "სხვადასხვა ადგილი — მოგზაურობა, საველე", icon: <MapPin    className="w-5 h-5" /> },
      { value: "pra_military",     label: "ჯარი და უსაფრთხოება",                    icon: <Shield    className="w-5 h-5" /> },
    ],
  },
}

// ── Q3 by Q2 answer ────────────────────────────────────────────────────────────

const Q3_BY_Q2: Record<string, { question: string; hint: string; options: Option[] }> = {

  // ── STEM ──────────────────────────────────────────────────────────────────────

  stem_computers: {
    question: "ტექნოლოგიებში ყველაზე მეტად რა გაინტერესებს?",
    hint: "ერთი ვარიანტი",
    options: [
      { value: "q3_cs_apps",   label: "პროგრამების და აპლიკაციების შექმნა",       sublabel: "Computer Science / Software Engineering", icon: <Terminal   className="w-5 h-5" /> },
      { value: "q3_cs_web",    label: "ვებსაიტები და მომხმარებლის გამოცდილება",   sublabel: "Front-end / UI/UX",                       icon: <Monitor    className="w-5 h-5" /> },
      { value: "q3_cs_data",   label: "მონაცემები და ხელოვნური ინტელექტი",        sublabel: "Data Science / AI",                       icon: <Database   className="w-5 h-5" /> },
      { value: "q3_cs_sec",    label: "ქსელები და კიბერუსაფრთხოება",              sublabel: "Cybersecurity / IT",                      icon: <Shield     className="w-5 h-5" /> },
      { value: "q3_cs_robots", label: "რობოტები და ჭკვიანი სისტემები",            sublabel: "Robotics / Embedded Systems",             icon: <Cpu        className="w-5 h-5" /> },
      { value: "q3_cs_biz",    label: "ბიზნესისა და ტექნოლოგიის გაერთიანება",    sublabel: "Information Systems / Tech Management",   icon: <Briefcase  className="w-5 h-5" /> },
    ],
  },

  stem_machines: {
    question: "ინჟინერიაში რა ტიპის პროექტები მოგწონს?",
    hint: "ერთი ვარიანტი",
    options: [
      { value: "q3_eng_civil",  label: "შენობები, ხიდები, ქალაქები",              sublabel: "Civil Engineering",                       icon: <Building2  className="w-5 h-5" /> },
      { value: "q3_eng_mech",   label: "მექანიზმები და მანქანები",                 sublabel: "Mechanical Engineering",                  icon: <Settings   className="w-5 h-5" /> },
      { value: "q3_eng_elec",   label: "ენერგია და ელექტროსისტემები",             sublabel: "Electrical Engineering",                  icon: <Zap        className="w-5 h-5" /> },
      { value: "q3_eng_ind",    label: "ინდუსტრიული პროცესები და წარმოება",       sublabel: "Industrial Engineering",                  icon: <Wrench     className="w-5 h-5" /> },
      { value: "q3_eng_env",    label: "გარემო და მდგრადი ინფრასტრუქტურა",       sublabel: "Environmental Engineering",               icon: <Leaf       className="w-5 h-5" /> },
      { value: "q3_eng_mecha",  label: "ჭკვიანი ტექნოლოგიური სისტემები",         sublabel: "Mechatronics",                            icon: <Cpu        className="w-5 h-5" /> },
    ],
  },

  stem_health: {
    question: "ჯანმრთელობის სფეროში რა როლი უფრო მოგწონს?",
    hint: "ერთი ვარიანტი",
    options: [
      { value: "q3_h_med",     label: "ადამიანების დიაგნოსტიკა და მკურნალობა",   sublabel: "Medicine (MD)",                           icon: <Stethoscope  className="w-5 h-5" /> },
      { value: "q3_h_pharm",   label: "მედიკამენტები და ფარმაცევტიკა",            sublabel: "Pharmacy",                                icon: <FlaskConical className="w-5 h-5" /> },
      { value: "q3_h_lab",     label: "ლაბორატორია და კვლევა",                    sublabel: "Biomedical Sciences",                     icon: <Microscope   className="w-5 h-5" /> },
      { value: "q3_h_physio",  label: "რეაბილიტაცია და ფიზიკური დახმარება",      sublabel: "Physiotherapy",                           icon: <Activity     className="w-5 h-5" /> },
      { value: "q3_h_dent",    label: "კბილები და პირის ღრუ",                     sublabel: "Dentistry",                               icon: <Sparkles     className="w-5 h-5" /> },
      { value: "q3_h_nutr",    label: "კვება და საჯარო ჯანდაცვა",                sublabel: "Nutrition / Public Health",               icon: <Leaf         className="w-5 h-5" /> },
    ],
  },

  stem_nature: {
    question: "საბუნებისმეტყველოში რა გაინტერესებს ყველაზე მეტად?",
    hint: "ერთი ვარიანტი",
    options: [
      { value: "q3_nat_bio",   label: "ცოცხალი ორგანიზმები",                      sublabel: "Biology",                                 icon: <Leaf         className="w-5 h-5" /> },
      { value: "q3_nat_chem",  label: "ქიმიური პროცესები და ნივთიერებები",        sublabel: "Chemistry",                               icon: <FlaskConical className="w-5 h-5" /> },
      { value: "q3_nat_phys",  label: "ფიზიკური კანონები და ტექნოლოგია",          sublabel: "Physics",                                 icon: <Zap          className="w-5 h-5" /> },
      { value: "q3_nat_env",   label: "გარემო და ეკოსისტემები",                   sublabel: "Environmental Science / Ecology",         icon: <Globe        className="w-5 h-5" /> },
      { value: "q3_nat_gen",   label: "გენეტიკა და მიკრობიოლოგია",               sublabel: "Biotechnology / Microbiology",            icon: <Microscope   className="w-5 h-5" /> },
      { value: "q3_nat_geo",   label: "დედამიწა და ბუნებრივი რესურსები",          sublabel: "Geology / Geography",                     icon: <MapPin       className="w-5 h-5" /> },
    ],
  },

  stem_economics: {
    question: "ბიზნესში რა საქმიანობა გიზიდავს?",
    hint: "ერთი ვარიანტი",
    options: [
      { value: "q3_eco_fin",   label: "ფინანსები და ინვესტიციები",                 sublabel: "Finance",                                 icon: <TrendingUp   className="w-5 h-5" /> },
      { value: "q3_eco_mgmt",  label: "კომპანიის მართვა",                          sublabel: "Business Administration",                 icon: <Briefcase    className="w-5 h-5" /> },
      { value: "q3_eco_mkt",   label: "მარკეტინგი და ბრენდინგი",                   sublabel: "Marketing",                               icon: <MessageCircle className="w-5 h-5" /> },
      { value: "q3_eco_intl",  label: "საერთაშორისო ბიზნესი",                      sublabel: "International Business",                  icon: <Globe        className="w-5 h-5" /> },
      { value: "q3_eco_anl",   label: "ეკონომიკური ანალიზი",                       sublabel: "Economics",                               icon: <BarChart3    className="w-5 h-5" /> },
      { value: "q3_eco_ent",   label: "საკუთარი ბიზნესის შექმნა",                  sublabel: "Entrepreneurship",                        icon: <Lightbulb    className="w-5 h-5" /> },
    ],
  },

  stem_data: {
    question: "მონაცემებთან მუშაობაში რა მოგწონს?",
    hint: "ერთი ვარიანტი",
    options: [
      { value: "q3_data_stat", label: "სტატისტიკური ანალიზი",                      sublabel: "Statistics",                              icon: <BarChart3   className="w-5 h-5" /> },
      { value: "q3_data_ai",   label: "AI და პროგნოზირება",                         sublabel: "Data Science / AI",                       icon: <Brain       className="w-5 h-5" /> },
      { value: "q3_data_biz",  label: "ბიზნეს მონაცემების ანალიზი",                 sublabel: "Business Analytics",                      icon: <Briefcase   className="w-5 h-5" /> },
      { value: "q3_data_fin",  label: "ფინანსური მოდელები",                         sublabel: "Quantitative Finance",                    icon: <TrendingUp  className="w-5 h-5" /> },
      { value: "q3_data_res",  label: "კვლევა და აკადემიური ანალიტიკა",             sublabel: "Applied Mathematics",                     icon: <Microscope  className="w-5 h-5" /> },
      { value: "q3_data_algo", label: "ალგორითმები და მოდელირება",                 sublabel: "Computational Mathematics",               icon: <Code2       className="w-5 h-5" /> },
    ],
  },

  // ── HUMANITIES ────────────────────────────────────────────────────────────────

  hum_text: {
    question: "ტექსტური საქმიანობიდან რა გიზიდავს?",
    hint: "ერთი ვარიანტი",
    options: [
      { value: "q3_txt_journ", label: "ჟურნალისტური სტატიები და მედია",            sublabel: "Journalism",                              icon: <Newspaper   className="w-5 h-5" /> },
      { value: "q3_txt_lit",   label: "ლიტერატურა და ანალიზი",                     sublabel: "Literature",                              icon: <BookOpen    className="w-5 h-5" /> },
      { value: "q3_txt_trans", label: "თარგმნა და ენები",                           sublabel: "Translation / Linguistics",               icon: <Languages   className="w-5 h-5" /> },
      { value: "q3_txt_cont",  label: "კონტენტის შექმნა",                           sublabel: "Media Communications",                    icon: <Monitor     className="w-5 h-5" /> },
      { value: "q3_txt_edit",  label: "რედაქტირება და გამომცემლობა",                sublabel: "Publishing / Editing",                    icon: <PenLine     className="w-5 h-5" /> },
      { value: "q3_txt_crw",   label: "სცენარის და კრეატიული ტექსტის წერა",         sublabel: "Creative Writing / Scriptwriting",        icon: <Sparkles    className="w-5 h-5" /> },
    ],
  },

  hum_history: {
    question: "ისტორიასა და კულტურაში კონკრეტულად რა?",
    hint: "ერთი ვარიანტი",
    options: [
      { value: "q3_his_hist",  label: "ისტორიული კვლევა",                           sublabel: "History",                                 icon: <BookOpen    className="w-5 h-5" /> },
      { value: "q3_his_arch",  label: "არქეოლოგიური აღმოჩენები",                    sublabel: "Archaeology",                             icon: <MapPin      className="w-5 h-5" /> },
      { value: "q3_his_cult",  label: "კულტურული მემკვიდრეობა",                     sublabel: "Cultural Heritage Studies",               icon: <Building2   className="w-5 h-5" /> },
      { value: "q3_his_mus",   label: "მუზეუმები და არქივები",                       sublabel: "Museum Studies",                          icon: <ClipboardList className="w-5 h-5" /> },
      { value: "q3_his_anthr", label: "ცივილიზაციების ანალიზი",                     sublabel: "Anthropology",                            icon: <Globe       className="w-5 h-5" /> },
      { value: "q3_his_relig", label: "რელიგიებისა და კულტურების კვლევა",           sublabel: "Cultural / Religious Studies",            icon: <Sparkles    className="w-5 h-5" /> },
    ],
  },

  hum_society: {
    question: "საზოგადოებასა და პოლიტიკაში კონკრეტულად რა?",
    hint: "ერთი ვარიანტი",
    options: [
      { value: "q3_soc_intrel", label: "საერთაშორისო ურთიერთობები",                 sublabel: "International Relations",                 icon: <Globe       className="w-5 h-5" /> },
      { value: "q3_soc_pol",    label: "პოლიტიკის კვლევა",                          sublabel: "Political Science",                       icon: <Crown       className="w-5 h-5" /> },
      { value: "q3_soc_dipl",   label: "დიპლომატია",                                sublabel: "Diplomacy",                               icon: <Handshake   className="w-5 h-5" /> },
      { value: "q3_soc_sec",    label: "უსაფრთხოება და გეოპოლიტიკა",               sublabel: "Security Studies",                        icon: <Shield      className="w-5 h-5" /> },
      { value: "q3_soc_sociol", label: "სოციალური კვლევა",                           sublabel: "Sociology",                               icon: <Users       className="w-5 h-5" /> },
      { value: "q3_soc_pub",    label: "საჯარო პოლიტიკა",                           sublabel: "Public Policy",                           icon: <ClipboardList className="w-5 h-5" /> },
    ],
  },

  hum_law: {
    question: "სამართლის სფეროში კონკრეტულად რა?",
    hint: "ერთი ვარიანტი",
    options: [
      { value: "q3_law_adv",   label: "ადვოკატურა და სასამართლო",                   sublabel: "Law (General)",                           icon: <Scale       className="w-5 h-5" /> },
      { value: "q3_law_hr",    label: "ადამიანის უფლებები",                          sublabel: "Human Rights Law",                        icon: <Heart       className="w-5 h-5" /> },
      { value: "q3_law_corp",  label: "ბიზნეს სამართალი",                            sublabel: "Corporate Law",                           icon: <Briefcase   className="w-5 h-5" /> },
      { value: "q3_law_intl",  label: "საერთაშორისო სამართალი",                     sublabel: "International Law",                       icon: <Globe       className="w-5 h-5" /> },
      { value: "q3_law_crim",  label: "კრიმინოლოგია",                               sublabel: "Criminology",                             icon: <Shield      className="w-5 h-5" /> },
      { value: "q3_law_const", label: "სახელმწიფო სამართალი",                       sublabel: "Constitutional Law",                      icon: <Building2   className="w-5 h-5" /> },
    ],
  },

  hum_philosophy: {
    question: "ფილოსოფიასა და ეთიკაში კონკრეტულად რა?",
    hint: "ერთი ვარიანტი",
    options: [
      { value: "q3_phi_eth",   label: "ეთიკური საკითხები",                          sublabel: "Ethics",                                  icon: <Scale       className="w-5 h-5" /> },
      { value: "q3_phi_phi",   label: "ადამიანის აზროვნება",                         sublabel: "Philosophy",                              icon: <Brain       className="w-5 h-5" /> },
      { value: "q3_phi_relig", label: "რელიგია და კულტურა",                          sublabel: "Religious Studies",                       icon: <Sparkles    className="w-5 h-5" /> },
      { value: "q3_phi_log",   label: "ლოგიკა და ანალიზი",                          sublabel: "Logic / Analytic Philosophy",             icon: <BrainCircuit className="w-5 h-5" /> },
      { value: "q3_phi_soc",   label: "საზოგადოებრივი იდეები",                      sublabel: "Social Philosophy",                       icon: <Users       className="w-5 h-5" /> },
      { value: "q3_phi_acad",  label: "აკადემიური კვლევა",                           sublabel: "Academic Philosophy",                     icon: <Microscope  className="w-5 h-5" /> },
    ],
  },

  hum_teaching: {
    question: "სასწავლო სფეროში კონკრეტულად რა?",
    hint: "ერთი ვარიანტი",
    options: [
      { value: "q3_edu_child", label: "ბავშვების სწავლება",                          sublabel: "Education / Teaching",                    icon: <GraduationCap className="w-5 h-5" /> },
      { value: "q3_edu_lang",  label: "უცხო ენების სწავლება",                        sublabel: "Language Education",                      icon: <Languages   className="w-5 h-5" /> },
      { value: "q3_edu_ling",  label: "ლინგვისტიკა",                                 sublabel: "Linguistics",                             icon: <BookOpen    className="w-5 h-5" /> },
      { value: "q3_edu_appl",  label: "გამოყენებითი ლინგვისტიკა",                   sublabel: "Applied Linguistics",                     icon: <Microscope  className="w-5 h-5" /> },
      { value: "q3_edu_edpsy", label: "საგანმანათლებლო ფსიქოლოგია",                 sublabel: "Educational Psychology",                  icon: <Brain       className="w-5 h-5" /> },
      { value: "q3_edu_tech",  label: "თანამედროვე სასწავლო ტექნოლოგიები",          sublabel: "Educational Technology",                  icon: <Monitor     className="w-5 h-5" /> },
    ],
  },

  // ── SOCIAL ────────────────────────────────────────────────────────────────────

  soc_medical: {
    question: "ჯანდაცვის სფეროში კონკრეტულად რა?",
    hint: "ერთი ვარიანტი",
    options: [
      { value: "q3_med_gen",   label: "ექიმობა",                                    sublabel: "Medicine (MD)",                           icon: <Stethoscope className="w-5 h-5" /> },
      { value: "q3_med_psych", label: "ფსიქიკური ჯანმრთელობა",                      sublabel: "Psychiatry",                              icon: <Brain       className="w-5 h-5" /> },
      { value: "q3_med_emerg", label: "გადაუდებელი დახმარება",                       sublabel: "Emergency Medicine",                      icon: <Zap         className="w-5 h-5" /> },
      { value: "q3_med_ped",   label: "ბავშვების მკურნალობა",                       sublabel: "Pediatrics",                              icon: <Heart       className="w-5 h-5" /> },
      { value: "q3_med_surg",  label: "ქირურგიული სფერო",                            sublabel: "Surgery",                                 icon: <Activity    className="w-5 h-5" /> },
      { value: "q3_med_pub",   label: "საზოგადოებრივი ჯანმრთელობა",                 sublabel: "Public Health",                           icon: <Globe       className="w-5 h-5" /> },
    ],
  },

  soc_psychology: {
    question: "ფსიქოლოგიაში კონკრეტულად რა?",
    hint: "ერთი ვარიანტი",
    options: [
      { value: "q3_psy_ther",  label: "თერაპია და კონსულტაცია",                     sublabel: "Clinical Psychology",                     icon: <HeartHandshake className="w-5 h-5" /> },
      { value: "q3_psy_child", label: "ბავშვთა ფსიქოლოგია",                         sublabel: "Child Psychology",                        icon: <Heart       className="w-5 h-5" /> },
      { value: "q3_psy_org",   label: "ორგანიზაციული ფსიქოლოგია",                   sublabel: "Organizational Psychology",               icon: <Briefcase   className="w-5 h-5" /> },
      { value: "q3_psy_beh",   label: "ქცევის კვლევა",                              sublabel: "Behavioral Science",                      icon: <Microscope  className="w-5 h-5" /> },
      { value: "q3_psy_clin",  label: "ფსიქიკური ჯანმრთელობის პროგრამები",          sublabel: "Mental Health Programs",                  icon: <Brain       className="w-5 h-5" /> },
      { value: "q3_psy_soc",   label: "სოციალური დახმარება",                        sublabel: "Social Work",                             icon: <Users       className="w-5 h-5" /> },
    ],
  },

  soc_children: {
    question: "ახალგაზრდებთან მუშაობაში კონკრეტულად რა?",
    hint: "ერთი ვარიანტი",
    options: [
      { value: "q3_ch_edu",    label: "სკოლის სწავლება",                             sublabel: "Education / Teaching",                    icon: <GraduationCap className="w-5 h-5" /> },
      { value: "q3_ch_spec",   label: "სპეციალური განათლება",                        sublabel: "Special Education",                       icon: <HeartHandshake className="w-5 h-5" /> },
      { value: "q3_ch_youth",  label: "ახალგაზრდული პროგრამები",                     sublabel: "Youth Development",                       icon: <Users       className="w-5 h-5" /> },
      { value: "q3_ch_mgmt",   label: "განათლების მართვა",                           sublabel: "Educational Management",                  icon: <Crown       className="w-5 h-5" /> },
      { value: "q3_ch_psych",  label: "ბავშვთა ფსიქოლოგია",                         sublabel: "Educational Psychology",                  icon: <Brain       className="w-5 h-5" /> },
      { value: "q3_ch_inf",    label: "არაფორმალური განათლება",                      sublabel: "Training & Development",                  icon: <Zap         className="w-5 h-5" /> },
    ],
  },

  soc_business: {
    question: "ბიზნესში კონკრეტულად რა?",
    hint: "ერთი ვარიანტი",
    options: [
      { value: "q3_biz_mgmt",  label: "კომპანიის მართვა",                            sublabel: "Business Administration",                 icon: <Building2   className="w-5 h-5" /> },
      { value: "q3_biz_sales", label: "გაყიდვები",                                   sublabel: "Sales Management",                        icon: <Handshake   className="w-5 h-5" /> },
      { value: "q3_biz_mkt",   label: "მარკეტინგი",                                  sublabel: "Marketing",                               icon: <MessageCircle className="w-5 h-5" /> },
      { value: "q3_biz_hr",    label: "HR — ადამიანური რესურსები",                   sublabel: "Human Resource Management",               icon: <Users       className="w-5 h-5" /> },
      { value: "q3_biz_start", label: "სტარტაპები",                                  sublabel: "Entrepreneurship",                        icon: <Lightbulb   className="w-5 h-5" /> },
      { value: "q3_biz_pm",    label: "პროექტების მართვა",                           sublabel: "Project Management",                      icon: <ClipboardList className="w-5 h-5" /> },
    ],
  },

  soc_court: {
    question: "სამართალი და დაცვა — კონკრეტულად რა?",
    hint: "ერთი ვარიანტი",
    options: [
      { value: "q3_crt_adv",   label: "ადვოკატურა",                                 sublabel: "Law / Advocacy",                          icon: <Scale       className="w-5 h-5" /> },
      { value: "q3_crt_crim",  label: "კრიმინალური სამართალი",                      sublabel: "Criminal Law",                            icon: <Shield      className="w-5 h-5" /> },
      { value: "q3_crt_hr",    label: "ადამიანის უფლებები",                          sublabel: "Human Rights",                            icon: <Heart       className="w-5 h-5" /> },
      { value: "q3_crt_lit",   label: "სასამართლო პროცესი",                         sublabel: "Litigation",                              icon: <Briefcase   className="w-5 h-5" /> },
      { value: "q3_crt_med",   label: "მედიაცია და მოლაპარაკება",                   sublabel: "Mediation",                               icon: <Handshake   className="w-5 h-5" /> },
      { value: "q3_crt_crin",  label: "კრიმინოლოგია",                               sublabel: "Criminology",                             icon: <Microscope  className="w-5 h-5" /> },
    ],
  },

  soc_state: {
    question: "სახელმწიფო სფეროში კონკრეტულად რა?",
    hint: "ერთი ვარიანტი",
    options: [
      { value: "q3_st_pub",    label: "საჯარო მმართველობა",                         sublabel: "Public Administration",                   icon: <Building2   className="w-5 h-5" /> },
      { value: "q3_st_dipl",   label: "დიპლომატია",                                 sublabel: "International Relations",                 icon: <Globe       className="w-5 h-5" /> },
      { value: "q3_st_pol",    label: "პოლიტიკის ანალიზი",                          sublabel: "Political Science",                       icon: <Crown       className="w-5 h-5" /> },
      { value: "q3_st_sec",    label: "უსაფრთხოება",                                sublabel: "Security Studies",                        icon: <Shield      className="w-5 h-5" /> },
      { value: "q3_st_gov",    label: "სახელმწიფო მართვა",                          sublabel: "Governance",                              icon: <ClipboardList className="w-5 h-5" /> },
      { value: "q3_st_reg",    label: "რეგიონული კვლევები",                          sublabel: "Regional Studies",                        icon: <MapPin      className="w-5 h-5" /> },
    ],
  },

  soc_media: {
    question: "მედიასა და კომუნიკაციაში კონკრეტულად რა?",
    hint: "ერთი ვარიანტი",
    options: [
      { value: "q3_mda_journ", label: "ჟურნალისტიკა",                               sublabel: "Journalism",                              icon: <Newspaper   className="w-5 h-5" /> },
      { value: "q3_mda_pr",    label: "PR და ბრენდ კომუნიკაცია",                    sublabel: "Public Relations",                        icon: <MessageCircle className="w-5 h-5" /> },
      { value: "q3_mda_soc",   label: "სოციალური მედია",                             sublabel: "Digital Media",                           icon: <Monitor     className="w-5 h-5" /> },
      { value: "q3_mda_tv",    label: "ტელევიზია და პროდაქშენი",                     sublabel: "Broadcasting",                            icon: <Film        className="w-5 h-5" /> },
      { value: "q3_mda_strat", label: "კონტენტის სტრატეგია",                         sublabel: "Media Strategy",                          icon: <TrendingUp  className="w-5 h-5" /> },
      { value: "q3_mda_adv",   label: "რეკლამა",                                     sublabel: "Advertising",                             icon: <Sparkles    className="w-5 h-5" /> },
    ],
  },

  // ── CREATIVE ──────────────────────────────────────────────────────────────────

  cre_digital: {
    question: "ციფრულ სფეროში კონკრეტულად რა?",
    hint: "ერთი ვარიანტი",
    options: [
      { value: "q3_dig_ux",    label: "UI/UX დიზაინი",                              sublabel: "UX/UI Design",                            icon: <Monitor     className="w-5 h-5" /> },
      { value: "q3_dig_web",   label: "ვებ დიზაინი",                                 sublabel: "Web Design",                              icon: <Code2       className="w-5 h-5" /> },
      { value: "q3_dig_prod",  label: "პროდუქტის დიზაინი",                           sublabel: "Product Design",                          icon: <Cpu         className="w-5 h-5" /> },
      { value: "q3_dig_game",  label: "თამაშების ინტერფეისი",                        sublabel: "Game Design",                             icon: <Sparkles    className="w-5 h-5" /> },
      { value: "q3_dig_mob",   label: "მობილური აპების დიზაინი",                     sublabel: "Digital Product Design",                  icon: <Zap         className="w-5 h-5" /> },
      { value: "q3_dig_int",   label: "Creative Coding / Interactive Media",         sublabel: "Interactive Media Arts",                  icon: <Palette     className="w-5 h-5" /> },
    ],
  },

  cre_buildings: {
    question: "სივრცის დიზაინში კონკრეტულად რა?",
    hint: "ერთი ვარიანტი",
    options: [
      { value: "q3_bld_arch",  label: "არქიტექტურა",                                sublabel: "Architecture",                            icon: <Building2   className="w-5 h-5" /> },
      { value: "q3_bld_int",   label: "ინტერიერის დიზაინი",                          sublabel: "Interior Design",                         icon: <Sparkles    className="w-5 h-5" /> },
      { value: "q3_bld_urb",   label: "ურბანული დაგეგმარება",                        sublabel: "Urban Planning",                          icon: <MapPin      className="w-5 h-5" /> },
      { value: "q3_bld_land",  label: "ლანდშაფტის დიზაინი",                         sublabel: "Landscape Architecture",                  icon: <Leaf        className="w-5 h-5" /> },
      { value: "q3_bld_sust",  label: "მდგრადი სივრცეები",                          sublabel: "Sustainable Architecture",                icon: <Globe       className="w-5 h-5" /> },
      { value: "q3_bld_viz",   label: "3D ვიზუალიზაცია",                            sublabel: "Architectural Visualization",             icon: <Monitor     className="w-5 h-5" /> },
    ],
  },

  cre_graphic: {
    question: "გრაფიკულ სფეროში კონკრეტულად რა?",
    hint: "ერთი ვარიანტი",
    options: [
      { value: "q3_gfx_brand", label: "ბრენდინგი",                                  sublabel: "Graphic Design / Branding",               icon: <Palette     className="w-5 h-5" /> },
      { value: "q3_gfx_illus", label: "ილუსტრაცია",                                 sublabel: "Illustration",                            icon: <Paintbrush  className="w-5 h-5" /> },
      { value: "q3_gfx_mot",   label: "Motion დიზაინი",                             sublabel: "Motion Graphics",                         icon: <Film        className="w-5 h-5" /> },
      { value: "q3_gfx_adv",   label: "სარეკლამო ვიზუალები",                        sublabel: "Advertising Design",                      icon: <MessageCircle className="w-5 h-5" /> },
      { value: "q3_gfx_pack",  label: "შეფუთვის დიზაინი",                           sublabel: "Packaging Design",                        icon: <Sparkles    className="w-5 h-5" /> },
      { value: "q3_gfx_dart",  label: "ციფრული არტი",                               sublabel: "Digital Art",                             icon: <Monitor     className="w-5 h-5" /> },
    ],
  },

  cre_film: {
    question: "ფილმსა და მედიაში კონკრეტულად რა?",
    hint: "ერთი ვარიანტი",
    options: [
      { value: "q3_film_dir",  label: "რეჟისურა",                                   sublabel: "Film Directing",                          icon: <Film        className="w-5 h-5" /> },
      { value: "q3_film_edit", label: "ვიდეო მონტაჟი",                              sublabel: "Video Editing",                           icon: <Monitor     className="w-5 h-5" /> },
      { value: "q3_film_cin",  label: "ოპერატორობა",                                sublabel: "Cinematography",                          icon: <Camera      className="w-5 h-5" /> },
      { value: "q3_film_photo",label: "ფოტოგრაფია",                                 sublabel: "Photography",                             icon: <Camera      className="w-5 h-5" /> },
      { value: "q3_film_doc",  label: "დოკუმენტური მედია",                          sublabel: "Documentary Media",                       icon: <Newspaper   className="w-5 h-5" /> },
      { value: "q3_film_cont", label: "კონტენტ კრეაცია",                            sublabel: "Content Creation",                        icon: <Sparkles    className="w-5 h-5" /> },
    ],
  },

  cre_fashion: {
    question: "მოდასა და ტექსტილში კონკრეტულად რა?",
    hint: "ერთი ვარიანტი",
    options: [
      { value: "q3_fsh_des",   label: "ტანსაცმლის დიზაინი",                         sublabel: "Fashion Design",                          icon: <Sparkles    className="w-5 h-5" /> },
      { value: "q3_fsh_text",  label: "ტექსტილის დიზაინი",                          sublabel: "Textile Design",                          icon: <Paintbrush  className="w-5 h-5" /> },
      { value: "q3_fsh_styl",  label: "სტილისტიკა",                                 sublabel: "Fashion Styling",                         icon: <Crown       className="w-5 h-5" /> },
      { value: "q3_fsh_biz",   label: "მოდის ბიზნესი",                              sublabel: "Fashion Business",                        icon: <Briefcase   className="w-5 h-5" /> },
      { value: "q3_fsh_acc",   label: "აქსესუარები",                                sublabel: "Accessory Design",                        icon: <Palette     className="w-5 h-5" /> },
      { value: "q3_fsh_med",   label: "მოდის მედია",                                sublabel: "Fashion Communication",                   icon: <Newspaper   className="w-5 h-5" /> },
    ],
  },

  cre_music: {
    question: "მუსიკაში კონკრეტულად რა?",
    hint: "ერთი ვარიანტი",
    options: [
      { value: "q3_mus_perf",  label: "შესრულება",                                  sublabel: "Music Performance",                       icon: <Music       className="w-5 h-5" /> },
      { value: "q3_mus_comp",  label: "კომპოზიცია",                                 sublabel: "Music Composition",                       icon: <Mic         className="w-5 h-5" /> },
      { value: "q3_mus_prod",  label: "მუსიკალური პროდაქშენი",                      sublabel: "Music Production",                        icon: <Settings    className="w-5 h-5" /> },
      { value: "q3_mus_sound", label: "საუნდ დიზაინი",                              sublabel: "Sound Engineering",                       icon: <Zap         className="w-5 h-5" /> },
      { value: "q3_mus_theo",  label: "მუსიკის თეორია",                             sublabel: "Musicology",                              icon: <BookOpen    className="w-5 h-5" /> },
      { value: "q3_mus_media", label: "კინო / გეიმ აუდიო",                          sublabel: "Audio for Media",                         icon: <Film        className="w-5 h-5" /> },
    ],
  },

  cre_theater: {
    question: "სცენაზე კონკრეტულად რა?",
    hint: "ერთი ვარიანტი",
    options: [
      { value: "q3_thea_act",  label: "მსახიობობა",                                 sublabel: "Acting",                                  icon: <Mic         className="w-5 h-5" /> },
      { value: "q3_thea_dir",  label: "რეჟისურა",                                   sublabel: "Theatre Directing",                       icon: <Crown       className="w-5 h-5" /> },
      { value: "q3_thea_scen", label: "სცენოგრაფია",                                sublabel: "Scenography / Stage Design",              icon: <Hammer      className="w-5 h-5" /> },
      { value: "q3_thea_chor", label: "ქორეოგრაფია",                                sublabel: "Choreography",                            icon: <Dumbbell    className="w-5 h-5" /> },
      { value: "q3_thea_prod", label: "თეატრალური პროდაქშენი",                      sublabel: "Stage Production",                        icon: <ClipboardList className="w-5 h-5" /> },
      { value: "q3_thea_perf", label: "პერფორმანს არტი",                            sublabel: "Performance Art",                         icon: <Sparkles    className="w-5 h-5" /> },
    ],
  },

  // ── PRACTICAL ─────────────────────────────────────────────────────────────────

  pra_factory: {
    question: "ტექნიკურ გარემოში კონკრეტულად რა?",
    hint: "ერთი ვარიანტი",
    options: [
      { value: "q3_fac_mech",  label: "მანქანები და მოწყობილობები",                 sublabel: "Mechanical Engineering",                  icon: <Settings    className="w-5 h-5" /> },
      { value: "q3_fac_elec",  label: "ელექტრო სისტემები",                          sublabel: "Electrical Engineering",                  icon: <Zap         className="w-5 h-5" /> },
      { value: "q3_fac_auto",  label: "ავტომატიზაცია",                              sublabel: "Mechatronics / Automation",               icon: <Cpu         className="w-5 h-5" /> },
      { value: "q3_fac_ind",   label: "საწარმოო პროცესები",                         sublabel: "Industrial Technology",                   icon: <Wrench      className="w-5 h-5" /> },
      { value: "q3_fac_serv",  label: "ტექნიკური სერვისი",                          sublabel: "Technical Operations",                    icon: <Hammer      className="w-5 h-5" /> },
      { value: "q3_fac_rob",   label: "რობოტიკა",                                   sublabel: "Robotics",                                icon: <BrainCircuit className="w-5 h-5" /> },
    ],
  },

  pra_construction: {
    question: "სამშენებლო სფეროში კონკრეტულად რა?",
    hint: "ერთი ვარიანტი",
    options: [
      { value: "q3_con_civil", label: "შენობების კონსტრუქცია",                      sublabel: "Civil Engineering",                       icon: <Building2   className="w-5 h-5" /> },
      { value: "q3_con_arch",  label: "არქიტექტურული დაგეგმარება",                  sublabel: "Architecture",                            icon: <Palette     className="w-5 h-5" /> },
      { value: "q3_con_road",  label: "გზები და ინფრასტრუქტურა",                   sublabel: "Transportation Engineering",              icon: <MapPin      className="w-5 h-5" /> },
      { value: "q3_con_mgmt",  label: "სამშენებლო მენეჯმენტი",                      sublabel: "Construction Management",                 icon: <ClipboardList className="w-5 h-5" /> },
      { value: "q3_con_urb",   label: "ურბანული პროექტები",                         sublabel: "Urban Development",                       icon: <Globe       className="w-5 h-5" /> },
      { value: "q3_con_env",   label: "გარემოს ინჟინერია",                          sublabel: "Environmental Engineering",               icon: <Leaf        className="w-5 h-5" /> },
    ],
  },

  pra_nature: {
    question: "ბუნებასა და ცხოველებში კონკრეტულად რა?",
    hint: "ერთი ვარიანტი",
    options: [
      { value: "q3_pna_vet",   label: "ვეტერინარია",                                sublabel: "Veterinary Medicine",                     icon: <Heart       className="w-5 h-5" /> },
      { value: "q3_pna_agro",  label: "აგრონომია",                                  sublabel: "Agronomy",                                icon: <Leaf        className="w-5 h-5" /> },
      { value: "q3_pna_env",   label: "გარემოს დაცვა",                              sublabel: "Environmental Management",                icon: <Globe       className="w-5 h-5" /> },
      { value: "q3_pna_for",   label: "სატყეო საქმე",                               sublabel: "Forestry",                                icon: <MapPin      className="w-5 h-5" /> },
      { value: "q3_pna_anim",  label: "ცხოველთა მეცნიერება",                        sublabel: "Animal Science",                          icon: <Microscope  className="w-5 h-5" /> },
      { value: "q3_pna_ecol",  label: "ეკოლოგია",                                   sublabel: "Ecology",                                 icon: <FlaskConical className="w-5 h-5" /> },
    ],
  },

  pra_sports: {
    question: "სპორტულ სფეროში კონკრეტულად რა?",
    hint: "ერთი ვარიანტი",
    options: [
      { value: "q3_spo_sci",   label: "სპორტის მეცნიერება",                         sublabel: "Sports Science",                          icon: <Dumbbell    className="w-5 h-5" /> },
      { value: "q3_spo_coach", label: "მწვრთნელობა",                                sublabel: "Coaching",                                icon: <Crown       className="w-5 h-5" /> },
      { value: "q3_spo_med",   label: "სპორტის მედიცინა",                           sublabel: "Sports Medicine",                         icon: <Stethoscope className="w-5 h-5" /> },
      { value: "q3_spo_physio",label: "ფიზიკური თერაპია",                           sublabel: "Physiotherapy",                           icon: <Activity    className="w-5 h-5" /> },
      { value: "q3_spo_mgmt",  label: "სპორტის მართვა",                             sublabel: "Sports Management",                       icon: <Briefcase   className="w-5 h-5" /> },
      { value: "q3_spo_fit",   label: "ფიტნეს ინდუსტრია",                           sublabel: "Fitness & Wellness",                      icon: <HeartHandshake className="w-5 h-5" /> },
    ],
  },

  pra_travel: {
    question: "მოგზაურობასა და საველე სფეროში კონკრეტულად რა?",
    hint: "ერთი ვარიანტი",
    options: [
      { value: "q3_trv_tour",  label: "ტურიზმი",                                    sublabel: "Tourism Management",                      icon: <MapPin      className="w-5 h-5" /> },
      { value: "q3_trv_geo",   label: "გეოლოგია",                                   sublabel: "Geology",                                 icon: <Hammer      className="w-5 h-5" /> },
      { value: "q3_trv_geog",  label: "გეოგრაფია",                                  sublabel: "Geography",                               icon: <Globe       className="w-5 h-5" /> },
      { value: "q3_trv_hosp",  label: "სასტუმრო და ტურ ოპერატორობა",               sublabel: "Hospitality & Travel",                    icon: <Building2   className="w-5 h-5" /> },
      { value: "q3_trv_env",   label: "გარემოს კვლევა",                             sublabel: "Environmental Field Studies",             icon: <Leaf        className="w-5 h-5" /> },
      { value: "q3_trv_cult",  label: "კულტურული ტურიზმი",                          sublabel: "Cultural Tourism",                        icon: <Sparkles    className="w-5 h-5" /> },
    ],
  },

  pra_military: {
    question: "უსაფრთხოებისა და სამხედრო სფეროში კონკრეტულად რა?",
    hint: "ერთი ვარიანტი",
    options: [
      { value: "q3_mil_mil",   label: "სამხედრო სამსახური",                         sublabel: "Military Studies",                        icon: <Shield      className="w-5 h-5" /> },
      { value: "q3_mil_crim",  label: "კრიმინოლოგია",                               sublabel: "Criminology",                             icon: <Microscope  className="w-5 h-5" /> },
      { value: "q3_mil_sec",   label: "უსაფრთხოების მართვა",                        sublabel: "Security Management",                     icon: <ClipboardList className="w-5 h-5" /> },
      { value: "q3_mil_cyber", label: "კიბერუსაფრთხოება",                           sublabel: "Cybersecurity",                           icon: <Code2       className="w-5 h-5" /> },
      { value: "q3_mil_emerg", label: "საგანგებო სიტუაციები",                       sublabel: "Emergency Management",                    icon: <Zap         className="w-5 h-5" /> },
      { value: "q3_mil_intel", label: "დაზვერვა და ანალიზი",                        sublabel: "Intelligence Studies",                    icon: <Brain       className="w-5 h-5" /> },
    ],
  },
}

// ── Q4 — work-life style (max 2) ──────────────────────────────────────────────

const Q4_STEP: QuizStep = {
  id: "worklife",
  question: "როგორი სამუშაო ცხოვრების სტილი წარმოგიდგენია?",
  hint: "1 ან 2 ვარიანტი",
  multiSelect: true,
  maxSelect: 2,
  options: [
    { value: "wl_stable",      label: "სტაბილური და პროგნოზირებადი გარემო",       icon: <Building2      className="w-5 h-5" /> },
    { value: "wl_highpay",     label: "მაღალი შემოსავალი და კონკურენტული გარემო", icon: <TrendingUp     className="w-5 h-5" /> },
    { value: "wl_creative",    label: "თავისუფალი და კრეატიული მუშაობა",           icon: <Palette        className="w-5 h-5" /> },
    { value: "wl_people",      label: "ადამიანებთან ყოველდღიური ურთიერთობა",      icon: <Users          className="w-5 h-5" /> },
    { value: "wl_research",    label: "კვლევა, ანალიზი და ღრმა ფიქრი",            icon: <Microscope     className="w-5 h-5" /> },
    { value: "wl_active",      label: "აქტიური და მუდმივად მოძრავი სამუშაო",     icon: <Dumbbell       className="w-5 h-5" /> },
    { value: "wl_leadership",  label: "ლიდერობა და გადაწყვეტილებების მიღება",     icon: <Crown          className="w-5 h-5" /> },
    { value: "wl_independent", label: "დამოუკიდებელი და მშვიდი მუშაობა",          icon: <BrainCircuit   className="w-5 h-5" /> },
    { value: "wl_intl",        label: "საერთაშორისო და მრავალფეროვანი გარემო",    icon: <Globe          className="w-5 h-5" /> },
    { value: "wl_helping",     label: "საზოგადოების დახმარება და გავლენა",         icon: <HeartHandshake className="w-5 h-5" /> },
  ],
}

// ── Q5 — negative filter ──────────────────────────────────────────────────────

const Q5_STEP: QuizStep = {
  id: "negfilter",
  question: "რისი კეთება არ მოგწონს ან გიჭირს ყველაზე მეტად?",
  hint: "შეგიძლია რამდენიმე ვარიანტი აირჩიო",
  multiSelect: true,
  options: [
    { value: "neg_study",     label: "მუდმივი სწავლა და რთული თეორიული მასალა",    icon: <BookOpen      className="w-5 h-5" /> },
    { value: "neg_stress",    label: "მაღალი სტრესი და დიდი პასუხისმგებლობა",       icon: <Zap           className="w-5 h-5" /> },
    { value: "neg_people",    label: "ადამიანებთან მუდმივი ურთიერთობა",             icon: <Users         className="w-5 h-5" /> },
    { value: "neg_office",    label: "ოფისში ან კომპიუტერთან მთელი დღე ყოფნა",     icon: <Monitor       className="w-5 h-5" /> },
    { value: "neg_physical",  label: "ფიზიკური დატვირთვა და აქტიური გარემო",       icon: <Dumbbell      className="w-5 h-5" /> },
    { value: "neg_routine",   label: "რუტინული და ერთფეროვანი საქმე",               icon: <ClipboardList className="w-5 h-5" /> },
    { value: "neg_public",    label: "საჯარო გამოსვლა და პრეზენტაციები",           icon: <Mic           className="w-5 h-5" /> },
    { value: "neg_compete",   label: "კონკურენტული და აგრესიული გარემო",            icon: <Handshake     className="w-5 h-5" /> },
    { value: "neg_tech",      label: "ტექნოლოგიებთან მუდმივი მუშაობა",             icon: <Code2         className="w-5 h-5" /> },
    { value: "neg_emotional", label: "ემოციურად მძიმე სიტუაციები",                  icon: <Heart         className="w-5 h-5" /> },
    { value: "neg_strict",    label: "მკაცრი წესები და დისციპლინა",                icon: <Shield        className="w-5 h-5" /> },
    { value: "neg_unpred",    label: "არაპროგნოზირებადი და ცვალებადი გარემო",       icon: <Sparkles      className="w-5 h-5" /> },
  ],
}

// ── Q6 — city ─────────────────────────────────────────────────────────────────

const Q6_STEP: QuizStep = {
  id: "city",
  question: "სად გინდა სწავლა?",
  hint: "ერთი ვარიანტი",
  multiSelect: false,
  options: [
    { value: "tbilisi",    label: "თბილისი"     },
    { value: "kutaisi",    label: "ქუთაისი"     },
    { value: "batumi",     label: "ბათუმი"       },
    { value: "other_city", label: "სხვა ქალაქი" },
  ],
}

// ── Step logic ────────────────────────────────────────────────────────────────

const TOTAL_STEPS = 6

const STEP_IDS = ["skills", "q2", "q3", "worklife", "negfilter", "city"]

function getStep(step: number, answers: Record<string, string[]>): QuizStep {
  switch (step) {
    case 0: return {
      id: "skills",
      question: "რაში თვლი თავს ძლიერად?",
      hint: "შეგიძლია რამდენიმე ვარიანტი აირჩიო",
      multiSelect: true,
      options: Q1_OPTIONS,
    }
    case 1: {
      const cluster = getDominantCluster(answers.skills || [])
      return { id: "q2", multiSelect: false, ...Q2_BY_CLUSTER[cluster] }
    }
    case 2: {
      const q2val = (answers.q2 || [])[0] || ""
      const q3    = Q3_BY_Q2[q2val]
      if (!q3) return { id: "q3", question: "კონკრეტულად რა გაინტერესებს?", hint: "ერთი ვარიანტი", multiSelect: false, options: [] }
      return { id: "q3", multiSelect: false, ...q3 }
    }
    case 3: return Q4_STEP
    case 4: return Q5_STEP
    case 5: return Q6_STEP
    default: return { id: "skills", question: "", hint: "", multiSelect: true, options: [] }
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function QuizPage() {
  const router     = useRouter()
  const [step, setStep]       = useState(0)
  const [answers, setAnswers] = useState<Record<string, string[]>>({})
  const touchStart = useRef<{ x: number; y: number } | null>(null)

  const q       = getStep(step, answers)
  const current = answers[q.id] || []

  function select(value: string) {
    const arr = answers[q.id] || []
    if (q.multiSelect) {
      if (arr.includes(value)) {
        setAnswers({ ...answers, [q.id]: arr.filter(v => v !== value) })
      } else {
        if (q.maxSelect !== undefined && arr.length >= q.maxSelect) return
        setAnswers({ ...answers, [q.id]: [...arr, value] })
      }
    } else {
      setAnswers({ ...answers, [q.id]: [value] })
    }
  }

  function canNext(): boolean {
    return (answers[q.id] || []).length > 0
  }

  function next() {
    if (step < TOTAL_STEPS - 1) {
      setStep(step + 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    } else {
      const cluster = getDominantCluster(answers.skills || [])
      const params  = new URLSearchParams()
      Object.entries(answers).forEach(([k, v]) => { if (v.length > 0) params.set(k, v.join(",")) })
      params.set("cluster", cluster)
      router.push(`/quiz/results?${params.toString()}`)
    }
  }

  function back() {
    if (step === 0) return
    const updated = { ...answers }
    delete updated[STEP_IDS[step]]
    setAnswers(updated)
    setStep(step - 1)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-8">
        <div className="flex items-center justify-between text-sm text-gray-500 mb-2.5">
          <span className="font-medium text-gray-700">კითხვა {step + 1} / {TOTAL_STEPS}</span>
          <span className="font-semibold text-[#1E3A8A]">{Math.round(((step + 1) / TOTAL_STEPS) * 100)}%</span>
        </div>
        <Progress value={((step + 1) / TOTAL_STEPS) * 100} className="h-2.5 rounded-full" />
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
                e.preventDefault(); select(opt.value)
              }}
              onClick={() => select(opt.value)}
              style={{ touchAction: "manipulation" }}
              className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer select-none hover:shadow-md ${
                selected
                  ? "border-[#1E3A8A] bg-[#1E3A8A]/5 shadow-sm"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-3">
                {opt.icon && (
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 shrink-0 ${
                    selected ? "bg-[#1E3A8A] text-white" : "bg-gray-100 text-gray-500"
                  }`}>
                    {opt.icon}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <span className={`font-medium text-sm block ${selected ? "text-[#1E3A8A]" : "text-gray-700"}`}>
                    {opt.label}
                  </span>
                  {opt.sublabel && (
                    <span className={`text-xs block mt-0.5 ${selected ? "text-[#1E3A8A]/60" : "text-gray-400"}`}>
                      {opt.sublabel}
                    </span>
                  )}
                </div>
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
          onClick={back}
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
          {step === TOTAL_STEPS - 1 ? "შედეგები" : "შემდეგი"}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
