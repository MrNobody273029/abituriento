import { Code2, Stethoscope, Scale, Briefcase, BookText, Wrench, Wheat, GraduationCap, MoreHorizontal, Users } from "lucide-react"

const icons: Record<string, React.ComponentType<{ className?: string }>> = {
  education:           GraduationCap,
  humanities:          BookText,
  social_business_law: Briefcase,
  science:             Code2,
  engineering:         Wrench,
  agriculture:         Wheat,
  health:              Stethoscope,
  services:            Users,
}

export default function FieldIcon({ field, className }: { field: string; className?: string }) {
  const Icon = icons[field] || MoreHorizontal
  return <Icon className={className} />
}
