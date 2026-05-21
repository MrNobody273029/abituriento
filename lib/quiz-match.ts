const ALL_FIELDS = [
  "science", "health", "social_business_law",
  "engineering", "humanities", "education", "agriculture", "services",
] as const

// Each interest maps to one or more fields with weights
const INTEREST_MAP: Record<string, Partial<Record<string, number>>> = {
  tech:        { science: 10 },
  medicine:    { health: 10 },
  law:         { social_business_law: 10 },
  business:    { social_business_law: 9, services: 3 },
  engineering: { engineering: 10 },
  design:      { humanities: 8, services: 5 },
  social:      { social_business_law: 7, education: 5 },
  natural:     { science: 9, agriculture: 3 },
  education:   { education: 10 },
  humanities:  { humanities: 10 },
  agriculture: { agriculture: 10 },
}

const WORKSTYLE_MAP: Record<string, Partial<Record<string, number>>> = {
  computer:      { science: 5, engineering: 3 },
  people:        { health: 4, education: 4, services: 5, social_business_law: 2 },
  outdoor:       { agriculture: 5, engineering: 2 },
  lab:           { science: 4, health: 4 },
  creative_work: { humanities: 5, services: 4 },
  remote:        { science: 3, social_business_law: 2 },
}

const STRENGTH_MAP: Record<string, Partial<Record<string, number>>> = {
  logic:          { science: 5, engineering: 4 },
  language_skill: { humanities: 5, social_business_law: 2, services: 3 },
  creativity:     { humanities: 5, services: 4 },
  helping:        { health: 5, education: 5 },
  analysis:       { science: 4, social_business_law: 3, engineering: 2 },
  leadership:     { social_business_law: 5, services: 3 },
}

const GOAL_MAP: Record<string, Partial<Record<string, number>>> = {
  salary:       { science: 4, engineering: 4, health: 3, social_business_law: 2 },
  stability:    { education: 4, health: 3, services: 2 },
  own_business: { social_business_law: 5, services: 4 },
  research:     { science: 5, health: 2 },
  abroad:       { science: 4, engineering: 3, humanities: 2 },
  public_good:  { education: 4, health: 5 },
}

function applyMap(
  scores: Record<string, number>,
  selections: string[],
  mapping: Record<string, Partial<Record<string, number>>>
) {
  for (const sel of selections) {
    const m = mapping[sel]
    if (!m) continue
    for (const [field, weight] of Object.entries(m)) {
      scores[field] = (scores[field] || 0) + (weight ?? 0)
    }
  }
}

export function computeFieldScores(p: {
  interests: string[]
  workstyle: string[]
  strengths: string[]
  goals:     string[]
}): Record<string, number> {
  const scores: Record<string, number> = Object.fromEntries(ALL_FIELDS.map(f => [f, 0]))
  applyMap(scores, p.interests, INTEREST_MAP)
  applyMap(scores, p.workstyle, WORKSTYLE_MAP)
  applyMap(scores, p.strengths, STRENGTH_MAP)
  applyMap(scores, p.goals,     GOAL_MAP)
  return scores
}

// Returns top N fields — only those scoring ≥ 50% of the top field's score
export function topFields(scores: Record<string, number>, n = 3): string[] {
  const sorted = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .filter(([, v]) => v > 0)
  if (sorted.length === 0) return []
  const maxScore = sorted[0][1]
  return sorted
    .filter(([, v]) => v >= maxScore * 0.5)
    .slice(0, n)
    .map(([f]) => f)
}
