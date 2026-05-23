const ALL_FIELDS = [
  "science", "health", "social_business_law",
  "engineering", "humanities", "education", "agriculture", "services",
] as const

// ── Interest map ─────────────────────────────────────────────────────────────
// tech        = IT / Programming            → science (strong), engineering (light)
// medicine    = Medicine / Healthcare       → health (strong), science (pharmacy link)
// law         = Law                         → social_business_law
// business    = Business / Economics        → social_business_law + services
// engineering = Engineering / Construction  → engineering (strong), science (light)
// design      = Design / Architecture       → engineering + humanities (both fields have these programs)
// social      = Social / Psychology         → social_business_law + education
// natural     = Natural Sciences (Chem/Bio/Phys) → science (strong), health (pharmacy/bio link), agriculture (agrochemistry link)
// education   = Education / Pedagogy        → education (strong), social_business_law (light)
// humanities  = Arts / Languages / Literature → humanities (strong), social_business_law (political science, journalism)
// agriculture = Agriculture / Veterinary / Ecology → agriculture (strong), science (light), health (light)
// tourism     = Tourism / Hospitality / Sport → services (strong) — was MISSING, causing services to be unreachable
const INTEREST_MAP: Record<string, Partial<Record<string, number>>> = {
  tech:        { science: 10, engineering: 2 },
  medicine:    { health: 10, science: 2 },
  law:         { social_business_law: 10 },
  business:    { social_business_law: 9, services: 3 },
  engineering: { engineering: 10, science: 2 },
  design:      { engineering: 6, humanities: 6 },
  social:      { social_business_law: 7, education: 5 },
  natural:     { science: 10, health: 4, agriculture: 3 },
  education:   { education: 10, social_business_law: 2 },
  humanities:  { humanities: 10, social_business_law: 2 },
  agriculture: { agriculture: 10, science: 2, health: 2 },
  tourism:     { services: 10, social_business_law: 2 },
}

// ── Workstyle map ─────────────────────────────────────────────────────────────
// computer      → strongly science+engineering (IT, software)
// people        → health, education, services (human-facing work)
// outdoor       → agriculture (fieldwork), engineering (construction), services (light)
// lab           → science (chemistry/bio/physics lab), health (clinical/pharmacy)
// creative_work → humanities (arts/design), services (hospitality), engineering (architecture)
// remote        → science (IT remote), social_business_law (accounting/law remote), humanities (translation)
const WORKSTYLE_MAP: Record<string, Partial<Record<string, number>>> = {
  computer:      { science: 6, engineering: 4, social_business_law: 2 },
  people:        { health: 5, education: 5, services: 6, social_business_law: 2 },
  outdoor:       { agriculture: 6, engineering: 3, services: 2 },
  lab:           { science: 6, health: 5 },
  creative_work: { humanities: 6, services: 4, engineering: 3 },
  remote:        { science: 4, social_business_law: 2, humanities: 2 },
}

// ── Strength map ──────────────────────────────────────────────────────────────
// logic          → science (math/IT/physics), engineering (exact disciplines)
// language_skill → humanities (philology/journalism), services (tourism/hospitality), social_business_law (law/diplomacy), education
// creativity     → humanities (arts), services (design/hospitality), engineering (architecture)
// helping        → health (medicine/nursing/pharmacy), education (teaching), services (social work)
// analysis       → science (research), social_business_law (economics/law), engineering (analysis), agriculture (agronomy)
// leadership     → social_business_law (management/law), services (tourism/hotel mgmt), engineering (project management)
const STRENGTH_MAP: Record<string, Partial<Record<string, number>>> = {
  logic:          { science: 6, engineering: 5, social_business_law: 2 },
  language_skill: { humanities: 6, social_business_law: 3, services: 4, education: 2 },
  creativity:     { humanities: 5, services: 4, engineering: 3 },
  helping:        { health: 6, education: 6, services: 2 },
  analysis:       { science: 5, social_business_law: 4, engineering: 3, agriculture: 2 },
  leadership:     { social_business_law: 5, services: 5, engineering: 2 },
}

// ── Goal map ──────────────────────────────────────────────────────────────────
// salary       → science (IT), engineering, health (medicine), social_business_law (finance/law)
// stability    → education (state teachers), health (doctors/nurses), services (stable tourism jobs)
// own_business → social_business_law (business mgmt), services (own hotel/agency), agriculture (farm)
// research     → science (strong — chem/bio/phys/IT R&D), health (medical research), agriculture (agro research)
// abroad       → science (IT globally mobile), engineering (construction abroad), humanities (translation/diplomacy), services (international tourism)
// public_good  → education (teachers), health (doctors/public health), agriculture (food security)
const GOAL_MAP: Record<string, Partial<Record<string, number>>> = {
  salary:       { science: 5, engineering: 5, health: 4, social_business_law: 3 },
  stability:    { education: 5, health: 4, services: 3 },
  own_business: { social_business_law: 5, services: 5, agriculture: 2 },
  research:     { science: 6, health: 3, agriculture: 2 },
  abroad:       { science: 4, engineering: 4, humanities: 3, services: 3 },
  public_good:  { education: 5, health: 6, agriculture: 3 },
}

// ── Q2 → GeoStat field mapping (branching quiz v2) ───────────────────────────
export const Q2_TO_FIELDS: Record<string, string[]> = {
  // STEM cluster
  stem_computers: ["science", "engineering"],
  stem_machines:  ["engineering"],
  stem_health:    ["health", "science"],
  stem_nature:    ["science", "agriculture"],
  stem_economics: ["social_business_law"],
  stem_data:      ["science"],
  // HUMANITIES cluster
  hum_text:       ["humanities"],
  hum_history:    ["humanities"],
  hum_society:    ["social_business_law", "humanities"],
  hum_law:        ["social_business_law"],
  hum_philosophy: ["humanities"],
  hum_teaching:   ["education", "humanities"],
  // SOCIAL cluster
  soc_medical:    ["health"],
  soc_psychology: ["social_business_law", "health"],
  soc_children:   ["education", "social_business_law"],
  soc_business:   ["social_business_law", "services"],
  soc_court:      ["social_business_law"],
  soc_state:      ["social_business_law"],
  soc_media:      ["humanities", "social_business_law"],
  // CREATIVE cluster
  cre_digital:    ["engineering", "science"],
  cre_buildings:  ["engineering"],
  cre_graphic:    ["humanities", "services"],
  cre_film:       ["humanities"],
  cre_fashion:    ["services"],
  cre_music:      ["humanities"],
  cre_theater:    ["humanities"],
  // PRACTICAL cluster
  pra_factory:      ["engineering"],
  pra_construction: ["engineering"],
  pra_nature:       ["agriculture", "science"],
  pra_sports:       ["services", "education"],
  pra_travel:       ["services"],
  pra_military:     ["services"],
}

// ── Sub-field bonus v2 — driven by Q2 answer + Q1 skills context ──────────────
export function computeSubFieldBonusV2(
  programNameKa: string,
  q2: string,
  skills: string[]
): number {
  const n = programNameKa.toLowerCase()
  let bonus = 0

  const isIT       = /ინფ(ო?რ)?მ|კომპ|პროგ(რ)?|კიბ|software|ვებ|data/.test(n)
  const isMath     = /მათ/.test(n)
  const isStat     = /სტატ/.test(n)
  const isChem     = /ქიმ/.test(n)
  const isBio      = /ბიოლ/.test(n)
  const isPhys     = /ფიზ/.test(n)
  const isPharm    = /ფარმ/.test(n)
  const isDent     = /სტომ|კბ/.test(n)
  const isNursing  = /მედდ|ექ[ტთ]|საზ.*ჯანდ/.test(n)
  const isPhysio   = /ფიზ.*რეაბ|რეაბ/.test(n)
  const isPsych    = /ფსიქ/.test(n)
  const isLaw      = /სამართ/.test(n)
  const isIntRel   = /საერთ.*ურთ|დიპლ/.test(n)
  const isPolitSci = /პოლიტ/.test(n)
  const isMarketing= /მარკ/.test(n)
  const isFinance  = /ფინ/.test(n)
  const isJourn    = /ჟურ|მედი.*კომ/.test(n)
  const isHistory  = /ისტ/.test(n)
  const isPhilos   = /ფილოს/.test(n)
  const isLinguist = /ენათ|ლინგ/.test(n)
  const isLiterat  = /ლიტ/.test(n)
  const isPedag    = /პედ/.test(n)
  const isTour     = /ტური|სასტ(უმ)?|სტუმ/.test(n)
  const isSport    = /სპორ/.test(n)
  const isVet      = /ვეტ/.test(n)
  const isEcol     = /ეკოლ|გარემ/.test(n)
  const isAgro     = /აგრ/.test(n)
  const isArch     = /არქ/.test(n)
  const isDesign   = /დიზ/.test(n)
  const isChemEng  = /ქიმ.*ინჟ|ქიმ.*ტექ/.test(n)
  const isEnergy   = /ენერგ/.test(n)
  const isTelecom  = /ტელ|კომ.*ინჟ/.test(n)
  const isMining   = /სამთ/.test(n)
  const isMusicArt = /მუს|სახ.*ხელ|გამ.*ხელ/.test(n)
  const isFilm     = /კინ|ფოტ/.test(n)
  const isFashion  = /მოდ|სამ.*ტექ/.test(n)
  const isDefSec   = /თავდ|სამხ|უსაფ/.test(n)

  switch (q2) {
    case "stem_computers":
      if (isIT)    bonus += 30
      if (isMath)  bonus += 12
      if (isStat)  bonus += 10
      if (!skills.includes("exact_sci") && (isChem || isBio || isPhys)) bonus -= 15
      break
    case "stem_machines":
      if (isChemEng || isEnergy || isTelecom) bonus += 20
      if (isMining)  bonus += 15
      if (isIT)      bonus -= 10
      break
    case "stem_health":
      if (isPharm)   bonus += 28
      if (isDent)    bonus += 28
      if (isNursing) bonus += 22
      if (isPhysio)  bonus += 20
      if (isIT)      bonus -= 15
      break
    case "stem_nature":
      if (isChem)    bonus += 28
      if (isBio)     bonus += 26
      if (isPhys)    bonus += 22
      if (isEcol)    bonus += 18
      if (isVet)     bonus += 20
      if (isIT)      bonus -= 20
      break
    case "stem_economics":
      if (isFinance)    bonus += 26
      if (isMarketing)  bonus += 22
      if (isIntRel)     bonus += 18
      break
    case "stem_data":
      if (isStat)  bonus += 28
      if (isMath)  bonus += 26
      if (isIT)    bonus += 18
      break
    case "hum_text":
      if (isJourn)    bonus += 26
      if (isLinguist) bonus += 24
      if (isLiterat)  bonus += 22
      break
    case "hum_history":
      if (isHistory) bonus += 30
      if (isPhilos)  bonus += 18
      break
    case "hum_society":
      if (isPolitSci) bonus += 28
      if (isIntRel)   bonus += 26
      if (isJourn)    bonus += 20
      break
    case "hum_law":
      if (isLaw)    bonus += 30
      if (isIntRel) bonus += 20
      break
    case "hum_philosophy":
      if (isPhilos)  bonus += 30
      if (isHistory) bonus += 14
      break
    case "hum_teaching":
      if (isPedag)    bonus += 28
      if (isLinguist) bonus += 26
      break
    case "soc_medical":
      if (isPharm)   bonus += 22
      if (isDent)    bonus += 22
      if (isNursing) bonus += 26
      if (isPhysio)  bonus += 22
      break
    case "soc_psychology":
      if (isPsych)  bonus += 30
      if (isPedag)  bonus += 16
      break
    case "soc_children":
      if (isPedag)  bonus += 30
      if (isPsych)  bonus += 18
      break
    case "soc_business":
      if (isMarketing) bonus += 28
      if (isFinance)   bonus += 22
      if (isTour)      bonus += 16
      break
    case "soc_court":
      if (isLaw)    bonus += 32
      if (isIntRel) bonus += 18
      break
    case "soc_state":
      if (isPolitSci) bonus += 28
      if (isIntRel)   bonus += 26
      if (isLaw)      bonus += 18
      break
    case "soc_media":
      if (isJourn)    bonus += 30
      if (isPolitSci) bonus += 16
      break
    case "cre_digital":
      if (isIT)     bonus += 28
      if (isDesign) bonus += 22
      if (isArch)   bonus += 10
      break
    case "cre_buildings":
      if (isArch)   bonus += 30
      if (isDesign) bonus += 14
      break
    case "cre_graphic":
      if (isDesign)   bonus += 28
      if (isJourn)    bonus += 18
      if (isMusicArt) bonus += 16
      break
    case "cre_film":
      if (isFilm)  bonus += 30
      if (isJourn) bonus += 20
      break
    case "cre_fashion":
      if (isFashion) bonus += 30
      if (isDesign)  bonus += 20
      break
    case "cre_music":
      if (isMusicArt) bonus += 30
      break
    case "cre_theater":
      if (isMusicArt) bonus += 28
      if (isFilm)     bonus += 18
      break
    case "pra_factory":
      if (isChemEng) bonus += 24
      if (isEnergy)  bonus += 22
      if (isMining)  bonus += 20
      break
    case "pra_construction":
      if (isArch)   bonus += 26
      if (isEnergy) bonus += 18
      break
    case "pra_nature":
      if (isVet)   bonus += 28
      if (isAgro)  bonus += 26
      if (isEcol)  bonus += 22
      break
    case "pra_sports":
      if (isSport) bonus += 30
      if (isPedag) bonus += 16
      break
    case "pra_travel":
      if (isTour) bonus += 30
      break
    case "pra_military":
      if (isDefSec) bonus += 32
      break
  }

  // Q1 skill context — secondary boosts
  if (skills.includes("research") && (isMath || isStat || isChem || isBio || isPhys)) bonus += 6
  if (skills.includes("creativity") && (isDesign || isArch)) bonus += 6
  if (skills.includes("helping") && (isNursing || isPsych || isPedag)) bonus += 6
  if (skills.includes("leadership") && (isPolitSci || isIntRel || isMarketing)) bonus += 6
  if (skills.includes("analysis") && (isLaw || isPolitSci || isJourn)) bonus += 6

  return bonus
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

// Returns top N fields — only those scoring ≥ 45% of the top field's score
// (45% rather than 50% ensures pharmacy/health qualifies alongside science
//  when a student selects natural + lab, where health trails science by a few pts)
export function topFields(scores: Record<string, number>, n = 3): string[] {
  const sorted = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .filter(([, v]) => v > 0)
  if (sorted.length === 0) return []
  const maxScore = sorted[0][1]
  return sorted
    .filter(([, v]) => v >= maxScore * 0.45)
    .slice(0, n)
    .map(([f]) => f)
}

// ── Sub-field program name bonus ──────────────────────────────────────────────
// Within a broad GeoStat field, this disambiguates between niche programs using
// the student's actual quiz signals (interest combos, workstyle, strengths, goals).
//
// Key problems fixed:
//   1. IT vs Chemistry/Bio/Physics inside "science" field
//   2. Winemaking vs general Agriculture inside "agriculture" field
//   3. Every other field's niche specialisations (architecture, journalism, etc.)
export function computeSubFieldBonus(
  programNameKa: string,
  answers: {
    interests: string[]
    workstyle: string[]
    strengths: string[]
    goals:     string[]
  }
): number {
  const n = programNameKa.toLowerCase()
  const { interests, workstyle, strengths, goals } = answers
  let bonus = 0

  // ── Answer signals ───────────────────────────────────────────────────────────
  const wantsIT       = interests.includes("tech")        || workstyle.includes("computer")
  const wantsNatSci   = interests.includes("natural")     || workstyle.includes("lab")
  const wantsResearch = goals.includes("research")
  const wantsMed      = interests.includes("medicine")
  const wantsTourism  = interests.includes("tourism")
  const wantsDesign   = interests.includes("design")
  const wantsAgro     = interests.includes("agriculture")
  const wantsHuman    = interests.includes("humanities")
  const wantsLaw      = interests.includes("law")
  const wantsBiz      = interests.includes("business")
  const wantsSocial   = interests.includes("social")
  const wantsEdu      = interests.includes("education")
  const wantsEng      = interests.includes("engineering")
  const wantsLang     = strengths.includes("language_skill")
  const wantsHelp     = strengths.includes("helping")
  const wantsLogic    = strengths.includes("logic")
  const wantsCreative = strengths.includes("creativity")
  const wantsLeader   = strengths.includes("leadership")
  const wantsAnalysis = strengths.includes("analysis")
  const goalSalary    = goals.includes("salary")
  const goalBiz       = goals.includes("own_business")
  const goalAbroad    = goals.includes("abroad")
  const goalPublic    = goals.includes("public_good")
  const goalStable    = goals.includes("stability")
  const hasLab        = workstyle.includes("lab")
  const hasOutdoor    = workstyle.includes("outdoor")
  const hasPeople     = workstyle.includes("people")
  const hasCreative   = workstyle.includes("creative_work")

  // ── Program type patterns ────────────────────────────────────────────────────
  // science
  const isIT        = /ინფ(ო?რ)?მ|კომპ|პროგ(რ)?|კიბ|software|ვებ|data/.test(n)
  const isChem      = /ქიმ/.test(n)
  const isBio       = /ბიოლ/.test(n)
  const isPhys      = /ფიზ/.test(n)
  const isMath      = /მათ/.test(n)
  const isPharm     = /ფარმ/.test(n)
  const isEcol      = /ეკოლ|გარემ/.test(n)
  const isGeo       = /გეოლ|გეოგ/.test(n)
  const isStat      = /სტატ/.test(n)
  // health
  const isNursing   = /მედდ|ექ[ტთ]|საზ.*ჯანდ/.test(n)
  const isDent      = /სტომ|კბ/.test(n)
  const isPhysio    = /ფიზ.*რეაბ|რეაბ/.test(n)
  const isPubHealth = /საზ.*ჯანდ|ჯანდ.*მენ/.test(n)
  const isBiochem   = /ბიოქ/.test(n)
  // agriculture
  const isViti      = /მეღვ|მევენ/.test(n)
  const isVet       = /ვეტ/.test(n)
  const isForest    = /სატყ/.test(n)
  const isHort      = /მებაღ|ბოსტ|ხილ/.test(n)
  const isAnimal    = /მეცხ/.test(n)
  const isFood      = /სურს|საკ.*ტექ/.test(n)
  const isAgroBiz   = /აგრობ/.test(n)
  const isLandArch  = /ლანდ/.test(n)
  const isBee       = /მეფუტ/.test(n)
  // engineering
  const isArch      = /არქ/.test(n)
  const isDesign    = /დიზ/.test(n)
  const isMining    = /სამთ/.test(n)
  const isChemEng   = /ქიმ.*ინჟ|ქიმ.*ტექ/.test(n)
  const isEnergy    = /ენერგ/.test(n)
  const isTelecom   = /ტელ|კომ.*ინჟ/.test(n)
  const isGeodesy   = /გეოდ|კარტ/.test(n)
  const isTransp    = /სატრ|ტრანსპ/.test(n)
  const isMetal     = /მეტალ/.test(n)
  // social_business_law
  const isLaw       = /სამართ/.test(n)
  const isPsych     = /ფსიქ/.test(n)
  const isSociol    = /სოციოლ/.test(n)
  const isPolitSci  = /პოლიტ/.test(n)
  const isIntRel    = /საერთ.*ურთ|დიპლ/.test(n)
  const isMarketing = /მარკ/.test(n)
  const isFinance   = /ფინ/.test(n)
  const isAcct      = /ბუღ/.test(n)
  const isHR        = /მართ.*ადამ|ადამ.*რეს/.test(n)
  // humanities
  const isJourn     = /ჟურ|მედი.*კომ/.test(n)
  const isPhilos    = /ფილოს/.test(n)
  const isHistory   = /ისტ/.test(n)
  const isArtHist   = /ხელოვ.*მეც|ხელ.*ცოდ/.test(n)
  const isLinguist  = /ენათ|ლინგ/.test(n)
  const isLiterat   = /ლიტ/.test(n)
  const isMusicArt  = /მუს|სახ.*ხელ|გამ.*ხელ/.test(n)
  const isKartFil   = /ქართ.*ფილ/.test(n)
  // education
  const isPedag     = /პედ/.test(n)
  const isPresch    = /სკოლამდელ/.test(n)
  const isSportEdu  = /სპ.*პედ|ფ.*ვ/.test(n)
  const isSpecEdu   = /სპეც.*განათ/.test(n)
  // services
  const isTour      = /ტური|სასტ(უმ)?|სტუმ/.test(n)
  const isSport     = /სპორ/.test(n)
  const isSocWork   = /სოციალ.*მუშ|სოც.*მუშ/.test(n)
  const isCosmet    = /კოსმ/.test(n)
  const isDefSec    = /თავდ|სამხ|უსაფ/.test(n)

  // ════════════════════════════════════════════════════════════════════════════
  // SCIENCE FIELD — IT vs Natural Sciences disambiguation
  // ════════════════════════════════════════════════════════════════════════════

  if (wantsIT) {
    if (isIT)    bonus += 24
    if (isMath)  bonus += 10
    if (isStat)  bonus += 8
    if (!wantsNatSci && (isChem || isBio || isPhys)) bonus -= 15
  }

  if (wantsNatSci || wantsResearch) {
    const base = wantsNatSci ? 24 : 10
    if (isChem)   bonus += base
    if (isBio)    bonus += base - 2
    if (isPhys)   bonus += base - 4
    if (isPharm)  bonus += base - 4
    if (isMath)   bonus += (wantsLogic ? base - 4 : base - 12)
    if (isEcol)   bonus += base - 10
    if (isGeo)    bonus += base - 12
    if (isStat)   bonus += base - 14
    if (!wantsIT && isIT) bonus -= 20
  }

  // ════════════════════════════════════════════════════════════════════════════
  // HEALTH FIELD — medicine sub-specialties
  // ════════════════════════════════════════════════════════════════════════════

  if (wantsMed) {
    if (isPharm)      bonus += 14
    if (isDent)       bonus += 14
    if (isNursing)    bonus += (wantsHelp ? 18 : 10)
    if (isPhysio)     bonus += (wantsHelp ? 16 : 8)
    if (isPubHealth)  bonus += (goalPublic ? 18 : 8)
    if (isBiochem)    bonus += (wantsNatSci ? 16 : 8)
  }
  if (wantsHelp) {
    if (isNursing)    bonus += 14
    if (isPhysio)     bonus += 12
  }

  // ════════════════════════════════════════════════════════════════════════════
  // AGRICULTURE FIELD — მეღვინეობა და ყველა ვიწრო სპეციალობა
  // ════════════════════════════════════════════════════════════════════════════

  if (wantsAgro) {
    // მეღვინეობა / მევენახეობა — სოფ.მეურ + ლაბ (ბიოქიმია) ან საკ.ბიზ (ღვინო)
    if (isViti)     bonus += (hasLab || goalBiz ? 28 : 20)
    // ვეტერინარია — მედ. ინტ. ან helping
    if (isVet)      bonus += (wantsMed || wantsHelp ? 26 : 16)
    // ეკოლოგია / გარემოს დაცვა — კვლ. ან outdoor
    if (isEcol)     bonus += (wantsResearch || hasOutdoor ? 22 : 12)
    // სატყეო საქმე — outdoor
    if (isForest)   bonus += (hasOutdoor ? 20 : 10)
    // მებოსტნეობა / მებაღეობა / ხილ — outdoor
    if (isHort)     bonus += (hasOutdoor ? 18 : 8)
    // მეცხოველეობა — outdoor
    if (isAnimal)   bonus += (hasOutdoor ? 18 : 8)
    // სურსათის უვნებლობა / ტექ — lab
    if (isFood)     bonus += (hasLab ? 22 : 12)
    // აგრობიზნესი — ბიზ. მიზ.
    if (isAgroBiz)  bonus += (goalBiz || wantsBiz ? 20 : 10)
    // ლანდშ. არქ — design interest
    if (isLandArch) bonus += (wantsDesign ? 22 : 10)
    // მეფუტკრეობა — outdoor + ბიზ
    if (isBee)      bonus += (hasOutdoor && goalBiz ? 18 : 8)
  }

  // ════════════════════════════════════════════════════════════════════════════
  // ENGINEERING FIELD — ინჟ. სპეციალობები
  // ════════════════════════════════════════════════════════════════════════════

  if (wantsDesign) {
    if (isArch)    bonus += 26
    if (isDesign)  bonus += 26
    if (isLandArch) bonus += 18
  }
  if (wantsEng) {
    if (isMining)   bonus += (hasOutdoor ? 20 : 10)
    if (isChemEng)  bonus += (wantsNatSci ? 22 : 10)
    if (isEnergy)   bonus += (wantsLogic || goalSalary ? 18 : 10)
    if (isTelecom)  bonus += (wantsIT ? 18 : 10)
    if (isGeodesy)  bonus += (hasOutdoor ? 16 : 8)
    if (isTransp)   bonus += 10
    if (isMetal)    bonus += 8
  }

  // ════════════════════════════════════════════════════════════════════════════
  // SOCIAL_BUSINESS_LAW FIELD
  // ════════════════════════════════════════════════════════════════════════════

  if (wantsLaw) {
    if (isLaw)      bonus += 26
    if (isIntRel)   bonus += (wantsLang || goalAbroad ? 20 : 10)
    if (isPolitSci) bonus += (wantsLang ? 16 : 8)
  }
  if (wantsBiz) {
    if (isMarketing) bonus += (wantsCreative ? 22 : 14)
    if (isFinance)   bonus += (wantsLogic ? 22 : 14)
    if (isAcct)      bonus += (wantsLogic || goalStable ? 18 : 10)
    if (isHR)        bonus += (wantsHelp || wantsLeader ? 18 : 8)
  }
  if (wantsSocial) {
    if (isPsych)    bonus += (wantsHelp || hasPeople ? 24 : 14)
    if (isSociol)   bonus += (wantsAnalysis ? 20 : 10)
    if (isPolitSci) bonus += (wantsLang ? 14 : 8)
  }
  if (goalAbroad && wantsLang) {
    if (isIntRel)   bonus += 18
  }

  // ════════════════════════════════════════════════════════════════════════════
  // HUMANITIES FIELD
  // ════════════════════════════════════════════════════════════════════════════

  if (wantsHuman) {
    if (isJourn)    bonus += (wantsLang ? 24 : 12)
    if (isKartFil)  bonus += (wantsLang ? 20 : 10)
    if (isLinguist) bonus += (wantsLang ? 22 : 12)
    if (isLiterat)  bonus += (wantsLang ? 20 : 10)
    if (isHistory)  bonus += (wantsAnalysis ? 18 : 10)
    if (isPhilos)   bonus += (wantsAnalysis ? 16 : 8)
    if (isArtHist)  bonus += (wantsCreative ? 20 : 10)
    if (isMusicArt) bonus += (wantsCreative || hasCreative ? 22 : 10)
  }

  // ════════════════════════════════════════════════════════════════════════════
  // EDUCATION FIELD
  // ════════════════════════════════════════════════════════════════════════════

  if (wantsEdu) {
    if (isPedag)    bonus += (wantsHelp || hasPeople ? 20 : 10)
    if (isPresch)   bonus += (wantsHelp && hasPeople ? 22 : 10)
    if (isSportEdu) bonus += (wantsTourism ? 18 : 8)
    if (isSpecEdu)  bonus += (wantsHelp ? 20 : 8)
  }

  // ════════════════════════════════════════════════════════════════════════════
  // SERVICES FIELD
  // ════════════════════════════════════════════════════════════════════════════

  if (wantsTourism) {
    if (isTour)    bonus += 26
    if (isSport)   bonus += (hasOutdoor ? 20 : 14)
    if (isSocWork) bonus += (wantsHelp ? 16 : 8)
    if (isCosmet)  bonus += (wantsCreative ? 14 : 6)
  }
  if (wantsHelp && hasPeople) {
    if (isSocWork) bonus += 16
  }
  if (goalAbroad && wantsLang) {
    if (isTour)    bonus += 10
  }
  if (wantsEng || wantsLaw) {
    if (isDefSec)  bonus += 10
  }

  return bonus
}
