// GeoStat field names — used by Program.field and MarketData.field
export const FIELDS = {
  education:           { name_ka: "განათლება",                      color: "bg-orange-100 text-orange-800" },
  humanities:          { name_ka: "ჰუმანიტარული მეცნიერება და ხელოვნება",   color: "bg-green-100 text-green-800" },
  social_business_law: { name_ka: "სოციალური მეცნიერება, ბიზნესი, სამართალი",  color: "bg-yellow-100 text-yellow-800" },
  science:             { name_ka: "მეცნიერება / IT",                color: "bg-blue-100 text-blue-800" },
  engineering:         { name_ka: "ინჟინერია და მშენებლობა",        color: "bg-indigo-100 text-indigo-800" },
  agriculture:         { name_ka: "სოფლის მეურნეობა",               color: "bg-lime-100 text-lime-800" },
  health:              { name_ka: "ჯანდაცვა და მედიცინა",           color: "bg-red-100 text-red-800" },
  services:            { name_ka: "მომსახურება",                     color: "bg-gray-100 text-gray-800" },
} as const

export const TREND_LABELS: Record<string, string> = {
  growing:  "მზარდი",
  stable:   "სტაბილური",
  declining: "კლებადი",
}

export const DEGREE_LABELS: Record<string, string> = {
  bachelor: "ბაკალავრი",
  master:   "მაგისტრი",
  doctor:   "დოქტორი",
}

export const TYPE_LABELS: Record<string, string> = {
  state:   "სახელმწიფო",
  private: "კერძო",
}
