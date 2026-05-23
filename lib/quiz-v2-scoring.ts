// ── Program families ──────────────────────────────────────────────────────────

export type FamilyId =
  | "software" | "info_sys" | "cybersec" | "data_ai"
  | "civil_eng" | "mech_eng" | "elec_eng" | "robotics" | "env_eng" | "architecture"
  | "medicine" | "dentistry" | "pharmacy" | "nursing" | "physiotherapy" | "public_health" | "biomedical"
  | "psychology" | "law" | "business_mgmt" | "finance" | "marketing" | "intl_rel" | "social_work"
  | "education"
  | "humanities" | "journalism" | "languages"
  | "natural_sci"
  | "tourism" | "sports"
  | "agriculture"
  | "design_arts" | "performing_arts"

export const ALL_FAMILIES: FamilyId[] = [
  "cybersec", "data_ai", "info_sys", "software",
  "civil_eng", "mech_eng", "elec_eng", "robotics", "env_eng", "architecture",
  "dentistry", "pharmacy", "physiotherapy", "public_health", "biomedical", "nursing", "medicine",
  "psychology", "law", "business_mgmt", "finance", "marketing", "intl_rel", "social_work",
  "education",
  "humanities", "journalism", "languages",
  "natural_sci",
  "tourism", "sports",
  "agriculture",
  "design_arts", "performing_arts",
]

// Family → GeoStat field (used for DB queries)
export const FAMILY_TO_FIELD: Record<FamilyId, string> = {
  software:       "engineering",
  info_sys:       "engineering",
  cybersec:       "engineering",
  data_ai:        "science",
  civil_eng:      "engineering",
  mech_eng:       "engineering",
  elec_eng:       "engineering",
  robotics:       "engineering",
  env_eng:        "engineering",
  architecture:   "engineering",
  medicine:       "health",
  dentistry:      "health",
  pharmacy:       "health",
  nursing:        "health",
  physiotherapy:  "health",
  public_health:  "health",
  biomedical:     "health",
  psychology:     "social_business_law",
  law:            "social_business_law",
  business_mgmt:  "social_business_law",
  finance:        "social_business_law",
  marketing:      "social_business_law",
  intl_rel:       "social_business_law",
  social_work:    "social_business_law",
  education:      "education",
  humanities:     "humanities",
  journalism:     "humanities",
  languages:      "humanities",
  natural_sci:    "science",
  tourism:        "services",
  sports:         "services",
  agriculture:    "agriculture",
  design_arts:    "humanities",
  performing_arts:"humanities",
}

export const FAMILY_NAME_KA: Record<FamilyId, string> = {
  software:       "პროგრამული ინჟინ. / IT",
  info_sys:       "ბიზნეს-ინფ. სისტემები",
  cybersec:       "კიბერუსაფრთხოება",
  data_ai:        "მონაცემები / სტატ. / AI",
  civil_eng:      "სამოქალაქო ინჟინერია",
  mech_eng:       "მექ. ინჟინერია",
  elec_eng:       "ელ. ინჟინ. / ენერგეტ.",
  robotics:       "მექატრონიკა / რობოტიკა",
  env_eng:        "გარემ. / ქიმ. ინჟინ.",
  architecture:   "არქიტექტურა",
  medicine:       "მედიცინა",
  dentistry:      "სტომატოლოგია",
  pharmacy:       "ფარმაცია",
  nursing:        "ექთნობა / მედდა",
  physiotherapy:  "ფიზიოთერაპია",
  public_health:  "საზ. ჯანდაცვა",
  biomedical:     "ბიომედ. მეცნ.",
  psychology:     "ფსიქოლოგია",
  law:            "სამართალი",
  business_mgmt:  "ბიზ. ადმინისტ.",
  finance:        "ფინანსები / ეკონ.",
  marketing:      "მარკეტინგი / PR",
  intl_rel:       "საერთ. ურთ. / პოლიტ.",
  social_work:    "სოციალური მუშ.",
  education:      "განათლება / პედ.",
  humanities:     "ჰუმანიტ. მეცნ.",
  journalism:     "ჟურნალისტ. / მედია",
  languages:      "ენები / ლინგვ.",
  natural_sci:    "საბუნ. მეცნ.",
  tourism:        "ტურიზმი / სტუმ.",
  sports:         "სპორტი / ფიზ. განათ.",
  agriculture:    "სოფლ. მეურნ. / ვეტ.",
  design_arts:    "დიზაინი / სახ. ხელ.",
  performing_arts:"მუსიკა / თეატ. / კინო",
}

// Pattern order matters — more specific first within each GeoStat field group
// detectFamily() tries ALL_FAMILIES in order and returns first match
export const FAMILY_PATTERNS: Record<FamilyId, RegExp> = {
  // ── engineering field ──
  cybersec:       /კიბერ|cyber|ინფ.*უსაფ|information.*secur/i,
  robotics:       /მექატ|რობოტ|mechatr|automation.*eng/i,
  info_sys:       /ბიზნ.*ინფ|info.*sys|ინფ.*სამ|business.*inform/i,
  software:       /ინფ(ო?რ)?მ|კომპ|პროგრ?|software|ვებ.*ინჟ|data.*eng/i,
  elec_eng:       /ელ(?:ექ|ეკ)?\.?\s*ინჟ|ენერგ|ტელ.*ინჟ|electrical|electr(?!on.*med)/i,
  mech_eng:       /მექ.*ინჟ|მანქ.*ინჟ|სამ.*ინჟ.*ტ|სამ.*ტ.*ინჟ|მეტალ|სამთ|ავტ.*ინჟ|mechanical|სატრ.*ინჟ|ტრანსპ.*ინჟ/i,
  env_eng:        /ქიმ.*ინჟ|ქიმ.*ტექ|გარემ.*ინჟ|სურსათ.*ინჟ|food.*eng|chemical.*eng|industrial.*eng/i,
  civil_eng:      /სამოქ|სამშ|ჰიდ|გეოდ|კარტ|სანიტ|civil.*eng|ტრანსპ.*ინფ|გზ.*ინჟ/i,
  architecture:   /არქ(?!ეოლ)|ლანდ.*დიზ|ლანდ.*სივ|landscape.*arch/i,
  // ── health field ──
  dentistry:      /სტომ/i,
  pharmacy:       /ფარმ/i,
  physiotherapy:  /ფიზ.*რეაბ|რეაბ.*ფიზ|occupational.*ther/i,
  public_health:  /საზ.*ჯანდ|ჯანდ.*მენ|ეპიდ|კვება.*ჯანდ|კლინ.*კვება|public.*health/i,
  biomedical:     /ბიოქ|ბიომ.*მეც|სამ.*ლაბ|medical.*lab|biomedic|ბიოტ(?!ექ.*სოფ)/i,
  nursing:        /მედდ|ექთ|ბავ.*მოვ/i,
  medicine:       /მედ(?!ია|ი[აი]ც.*კომ|ი[აი]ი)/i,
  // ── social_business_law field ──
  psychology:     /ფსიქ/i,
  law:            /სამართ/i,
  social_work:    /სოციალ.*მუშ|სოც.*მუშ|სოციოლ/i,
  finance:        /ფინ|ეკონ|ბუღ|ბანკ|bank(?!ing.*inform)/i,
  marketing:      /მარკ|advertising|branding/i,
  intl_rel:       /საერთ.*ურთ|დიპლ|პოლიტ/i,
  business_mgmt:  /ბიზნ|მ(?:ართ|ენ).*ბ(?:იზ|ი)|business|management|ადამ.*რეს/i,
  // ── education field ──
  education:      /პედ|სკოლამდელ|სპეც.*განათ|განათლება|სასკ/i,
  // ── humanities field ──
  journalism:     /ჟურ|მედი.*კომ|ბრ?ო?ადკ|კინოჟ/i,
  languages:      /ლინგ|ენათ|თარგმ|ინგლ.*ენ|გერმ.*ენ|ფრანგ.*ენ|ჩინ.*ენ|ესპ.*ენ|რუს.*ენ/i,
  performing_arts:/მუს(?!.*ზ)|თეატ|ქორეო|დრამ|ოპერ|ბალეტ|კინ(?!ო?ჟ|ო?ლ)/i,
  design_arts:    /დიზ(?!.*ლანდ)|სახ.*ხელ|გამ.*ხელ|ინტ.*დიზ|მოდ(?!ელ)|ფოტ/i,
  humanities:     /ისტ|ფილოს|ღვთ|ქართ.*ფილ|ხელოვ.*მეც|ხელ.*ცოდ|კულტ.*მემ|არქეოლ|ეთნ/i,
  // ── science field ──
  data_ai:        /მათ|სტატ|data.*sci|ხელოვ.*ინტ|applied.*math/i,
  natural_sci:    /ბიოლ|ქიმ(?!.*ინჟ|.*ტექ)|ფიზ(?!.*რეაბ|.*ინჟ)|გეოლ|გეოგ|ეკოლ|გარემ(?!.*ინჟ)/i,
  // ── services field ──
  sports:         /სპორ|ფიზ.*კულ|ფიზ.*ვ|სპ.*პედ/i,
  tourism:        /ტური|სასტ(?:უმ)?|სტუმ|hospitality|hotel/i,
  // ── agriculture field ──
  agriculture:    /სოფ.*მეურ|ვეტ|აგრ|სატყ|მეღვ|მევენ|მეფუტ|მეცხ|მებაღ|ბოსტ|სურსათ(?!.*ინჟ)/i,
}

// ── Scoring matrix ────────────────────────────────────────────────────────────
// Weight philosophy (v2, balanced):
//   Q3 primary:    180–200 pts   (was 400–500 — too dominant)
//   Q3 secondary:   60–90 pts   (was 100–200)
//   Q3 tertiary:    35–50 pts   (was 50–100)
//   Q1 skills:      20–35 pts   (was 30–50)
//   Q4 worklife:    45–70 pts   (was 20–30 — boosted to matter more)
//   Q5 negatives:  -35 to -100 (was -60 to -150 — softened to not kill families)
//
// THEORETICAL_MAX = Q3(200) + 5×Q1(35) + 2×Q4(70) = 515
// Match% = min(97, max(15, round(famScore / 515 × 100)))

export const SCORES: Record<string, Partial<Record<FamilyId, number>>> = {

  // ════════════════════════════════════════════════════════
  // Q3 — STEM / Computers
  // ════════════════════════════════════════════════════════
  q3_cs_apps:    { software: 200, data_ai: 70, cybersec: 50, info_sys: 40 },
  q3_cs_web:     { software: 160, design_arts: 120, info_sys: 60 },
  q3_cs_data:    { data_ai: 200, software: 80, info_sys: 50 },
  q3_cs_sec:     { cybersec: 200, software: 70, info_sys: 45 },
  q3_cs_robots:  { robotics: 200, software: 65, elec_eng: 60 },
  q3_cs_biz:     { info_sys: 200, business_mgmt: 70, finance: 50 },

  // ════════════════════════════════════════════════════════
  // Q3 — STEM / Machines
  // ════════════════════════════════════════════════════════
  q3_eng_civil:  { civil_eng: 200, architecture: 70, env_eng: 45 },
  q3_eng_mech:   { mech_eng: 200, robotics: 70, elec_eng: 45 },
  q3_eng_elec:   { elec_eng: 200, robotics: 70, mech_eng: 45 },
  q3_eng_ind:    { env_eng: 200, mech_eng: 70, civil_eng: 45 },
  q3_eng_env:    { env_eng: 195, civil_eng: 70, natural_sci: 45 },
  q3_eng_mecha:  { robotics: 200, mech_eng: 80, elec_eng: 60 },

  // ════════════════════════════════════════════════════════
  // Q3 — STEM / Health
  // ════════════════════════════════════════════════════════
  q3_h_med:      { medicine: 200, biomedical: 50, public_health: 45 },
  q3_h_pharm:    { pharmacy: 200, biomedical: 70, natural_sci: 45 },
  q3_h_lab:      { biomedical: 200, natural_sci: 80, pharmacy: 50 },
  q3_h_physio:   { physiotherapy: 200, sports: 60, medicine: 40 },
  q3_h_dent:     { dentistry: 200, medicine: 40 },
  q3_h_nutr:     { public_health: 200, medicine: 50, natural_sci: 45 },

  // ════════════════════════════════════════════════════════
  // Q3 — STEM / Nature
  // ════════════════════════════════════════════════════════
  q3_nat_bio:    { natural_sci: 200, biomedical: 80, agriculture: 45 },
  q3_nat_chem:   { natural_sci: 200, pharmacy: 70, biomedical: 50, env_eng: 40 },
  q3_nat_phys:   { natural_sci: 200, elec_eng: 70, data_ai: 45 },
  q3_nat_env:    { natural_sci: 160, env_eng: 80, agriculture: 45 },
  q3_nat_gen:    { biomedical: 200, natural_sci: 80, pharmacy: 50 },
  q3_nat_geo:    { natural_sci: 200, agriculture: 60, civil_eng: 45 },

  // ════════════════════════════════════════════════════════
  // Q3 — STEM / Economics
  // ════════════════════════════════════════════════════════
  q3_eco_fin:    { finance: 200, business_mgmt: 80, data_ai: 50 },
  q3_eco_mgmt:   { business_mgmt: 200, finance: 70, marketing: 50 },
  q3_eco_mkt:    { marketing: 200, business_mgmt: 70, journalism: 50 },
  q3_eco_intl:   { intl_rel: 200, business_mgmt: 70, finance: 45 },
  q3_eco_anl:    { finance: 180, data_ai: 80, business_mgmt: 45 },
  q3_eco_ent:    { business_mgmt: 200, marketing: 70, finance: 45 },

  // ════════════════════════════════════════════════════════
  // Q3 — STEM / Data
  // ════════════════════════════════════════════════════════
  q3_data_stat:  { data_ai: 200, finance: 70, natural_sci: 45 },
  q3_data_ai:    { data_ai: 200, software: 80, robotics: 45 },
  q3_data_biz:   { info_sys: 200, business_mgmt: 80, finance: 45 },
  q3_data_fin:   { finance: 200, data_ai: 80, business_mgmt: 45 },
  q3_data_res:   { natural_sci: 160, data_ai: 80, humanities: 45 },
  q3_data_algo:  { software: 180, data_ai: 120, robotics: 45 },

  // ════════════════════════════════════════════════════════
  // Q3 — HUMANITIES / Text
  // ════════════════════════════════════════════════════════
  q3_txt_journ:  { journalism: 200, humanities: 60, languages: 45 },
  q3_txt_lit:    { humanities: 200, languages: 80, journalism: 45 },
  q3_txt_trans:  { languages: 200, humanities: 60, journalism: 45 },
  q3_txt_cont:   { journalism: 170, marketing: 80, humanities: 45 },
  q3_txt_edit:   { humanities: 200, journalism: 70, languages: 45 },
  q3_txt_crw:    { humanities: 170, performing_arts: 80, journalism: 45 },

  // ════════════════════════════════════════════════════════
  // Q3 — HUMANITIES / History
  // ════════════════════════════════════════════════════════
  q3_his_hist:   { humanities: 200, languages: 45 },
  q3_his_arch:   { humanities: 200, natural_sci: 45 },
  q3_his_cult:   { humanities: 200, languages: 60, tourism: 45 },
  q3_his_mus:    { humanities: 200, education: 45 },
  q3_his_anthr:  { humanities: 200, social_work: 60, languages: 45 },
  q3_his_relig:  { humanities: 200, languages: 45 },

  // ════════════════════════════════════════════════════════
  // Q3 — HUMANITIES / Society
  // ════════════════════════════════════════════════════════
  q3_soc_intrel: { intl_rel: 200, law: 70, humanities: 45 },
  q3_soc_pol:    { intl_rel: 200, law: 50, humanities: 45 },
  q3_soc_dipl:   { intl_rel: 200, languages: 80, law: 45 },
  q3_soc_sec:    { intl_rel: 170, law: 80 },
  q3_soc_sociol: { social_work: 200, psychology: 70, humanities: 45 },
  q3_soc_pub:    { intl_rel: 200, social_work: 70, law: 45 },

  // ════════════════════════════════════════════════════════
  // Q3 — HUMANITIES / Law
  // ════════════════════════════════════════════════════════
  q3_law_adv:    { law: 200, intl_rel: 50 },
  q3_law_hr:     { law: 200, social_work: 70, intl_rel: 45 },
  q3_law_corp:   { law: 200, business_mgmt: 70, finance: 45 },
  q3_law_intl:   { law: 200, intl_rel: 90 },
  q3_law_crim:   { law: 200, social_work: 50 },
  q3_law_const:  { law: 200, intl_rel: 50 },

  // ════════════════════════════════════════════════════════
  // Q3 — HUMANITIES / Philosophy
  // ════════════════════════════════════════════════════════
  q3_phi_eth:    { humanities: 200, psychology: 60, social_work: 45 },
  q3_phi_phi:    { humanities: 200, social_work: 50 },
  q3_phi_relig:  { humanities: 200, languages: 45 },
  q3_phi_log:    { humanities: 160, data_ai: 70, natural_sci: 45 },
  q3_phi_soc:    { humanities: 160, social_work: 80 },
  q3_phi_acad:   { humanities: 200, education: 45 },

  // ════════════════════════════════════════════════════════
  // Q3 — HUMANITIES / Teaching
  // ════════════════════════════════════════════════════════
  q3_edu_child:  { education: 200, psychology: 70, social_work: 45 },
  q3_edu_lang:   { languages: 200, education: 80, humanities: 45 },
  q3_edu_ling:   { languages: 200, humanities: 80, education: 45 },
  q3_edu_appl:   { languages: 170, education: 80, journalism: 45 },
  q3_edu_edpsy:  { psychology: 200, education: 80, social_work: 45 },
  q3_edu_tech:   { education: 200, info_sys: 70 },

  // ════════════════════════════════════════════════════════
  // Q3 — SOCIAL / Medical
  // ════════════════════════════════════════════════════════
  q3_med_gen:    { medicine: 200, biomedical: 50 },
  q3_med_psych:  { psychology: 200, medicine: 80, social_work: 45 },
  q3_med_emerg:  { medicine: 200, nursing: 160 },
  q3_med_ped:    { medicine: 200, psychology: 50 },
  q3_med_surg:   { medicine: 200, biomedical: 50 },
  q3_med_pub:    { public_health: 200, medicine: 70, natural_sci: 45 },

  // ════════════════════════════════════════════════════════
  // Q3 — SOCIAL / Psychology
  // ════════════════════════════════════════════════════════
  q3_psy_ther:   { psychology: 200, social_work: 70, medicine: 45 },
  q3_psy_child:  { psychology: 200, education: 70, social_work: 45 },
  q3_psy_org:    { psychology: 200, business_mgmt: 70, social_work: 45 },
  q3_psy_beh:    { psychology: 200, natural_sci: 70, social_work: 45 },
  q3_psy_clin:   { psychology: 200, medicine: 70, social_work: 45 },
  q3_psy_soc:    { social_work: 200, psychology: 80, education: 45 },

  // ════════════════════════════════════════════════════════
  // Q3 — SOCIAL / Children
  // ════════════════════════════════════════════════════════
  q3_ch_edu:     { education: 200, psychology: 70, social_work: 45 },
  q3_ch_spec:    { education: 200, psychology: 80, social_work: 60 },
  q3_ch_youth:   { social_work: 200, education: 80, psychology: 45 },
  q3_ch_mgmt:    { education: 200, business_mgmt: 70 },
  q3_ch_psych:   { psychology: 200, education: 80 },
  q3_ch_inf:     { education: 200, social_work: 70 },

  // ════════════════════════════════════════════════════════
  // Q3 — SOCIAL / Business
  // ════════════════════════════════════════════════════════
  q3_biz_mgmt:   { business_mgmt: 200, finance: 70, marketing: 45 },
  q3_biz_sales:  { marketing: 200, business_mgmt: 80 },
  q3_biz_mkt:    { marketing: 200, business_mgmt: 70, journalism: 45 },
  q3_biz_hr:     { business_mgmt: 170, psychology: 70, social_work: 45 },
  q3_biz_start:  { business_mgmt: 200, marketing: 70, finance: 45 },
  q3_biz_pm:     { business_mgmt: 200, info_sys: 70, finance: 45 },

  // ════════════════════════════════════════════════════════
  // Q3 — SOCIAL / Court
  // ════════════════════════════════════════════════════════
  q3_crt_adv:    { law: 200, intl_rel: 50 },
  q3_crt_crim:   { law: 200, social_work: 50 },
  q3_crt_hr:     { law: 200, social_work: 70, intl_rel: 45 },
  q3_crt_lit:    { law: 200, business_mgmt: 50 },
  q3_crt_med:    { law: 200, intl_rel: 50, business_mgmt: 45 },
  q3_crt_crin:   { law: 200, social_work: 50 },

  // ════════════════════════════════════════════════════════
  // Q3 — SOCIAL / State
  // ════════════════════════════════════════════════════════
  q3_st_pub:     { intl_rel: 200, law: 70, social_work: 45 },
  q3_st_dipl:    { intl_rel: 200, languages: 70, law: 45 },
  q3_st_pol:     { intl_rel: 200, law: 50, humanities: 45 },
  q3_st_sec:     { intl_rel: 170, law: 80 },
  q3_st_gov:     { intl_rel: 170, law: 70, business_mgmt: 45 },
  q3_st_reg:     { intl_rel: 160, humanities: 70, social_work: 45 },

  // ════════════════════════════════════════════════════════
  // Q3 — SOCIAL / Media
  // ════════════════════════════════════════════════════════
  q3_mda_journ:  { journalism: 200, humanities: 60, languages: 45 },
  q3_mda_pr:     { marketing: 170, journalism: 80, business_mgmt: 45 },
  q3_mda_soc:    { journalism: 170, marketing: 80 },
  q3_mda_tv:     { journalism: 170, performing_arts: 80, humanities: 45 },
  q3_mda_strat:  { marketing: 200, business_mgmt: 70, journalism: 45 },
  q3_mda_adv:    { marketing: 200, journalism: 70, design_arts: 45 },

  // ════════════════════════════════════════════════════════
  // Q3 — CREATIVE / Digital
  // ════════════════════════════════════════════════════════
  q3_dig_ux:     { design_arts: 200, software: 70 },
  q3_dig_web:    { design_arts: 160, software: 100 },
  q3_dig_prod:   { design_arts: 200, software: 70 },
  q3_dig_game:   { software: 170, design_arts: 100 },
  q3_dig_mob:    { software: 160, design_arts: 100 },
  q3_dig_int:    { design_arts: 180, software: 80 },

  // ════════════════════════════════════════════════════════
  // Q3 — CREATIVE / Buildings
  // ════════════════════════════════════════════════════════
  q3_bld_arch:   { architecture: 200, civil_eng: 70 },
  q3_bld_int:    { design_arts: 170, architecture: 100 },
  q3_bld_urb:    { civil_eng: 170, architecture: 120 },
  q3_bld_land:   { architecture: 170, natural_sci: 50 },
  q3_bld_sust:   { architecture: 160, env_eng: 80, civil_eng: 60 },
  q3_bld_viz:    { design_arts: 160, architecture: 120, software: 45 },

  // ════════════════════════════════════════════════════════
  // Q3 — CREATIVE / Graphic
  // ════════════════════════════════════════════════════════
  q3_gfx_brand:  { design_arts: 200, marketing: 70 },
  q3_gfx_illus:  { design_arts: 200 },
  q3_gfx_mot:    { design_arts: 200, performing_arts: 70 },
  q3_gfx_adv:    { design_arts: 170, marketing: 80 },
  q3_gfx_pack:   { design_arts: 200 },
  q3_gfx_dart:   { design_arts: 200, performing_arts: 50 },

  // ════════════════════════════════════════════════════════
  // Q3 — CREATIVE / Film
  // ════════════════════════════════════════════════════════
  q3_film_dir:   { performing_arts: 200, journalism: 50 },
  q3_film_edit:  { performing_arts: 200 },
  q3_film_cin:   { performing_arts: 200, design_arts: 50 },
  q3_film_photo: { performing_arts: 160, design_arts: 120 },
  q3_film_doc:   { journalism: 160, performing_arts: 120, humanities: 45 },
  q3_film_cont:  { journalism: 160, performing_arts: 100, marketing: 45 },

  // ════════════════════════════════════════════════════════
  // Q3 — CREATIVE / Fashion
  // ════════════════════════════════════════════════════════
  q3_fsh_des:    { design_arts: 200 },
  q3_fsh_text:   { design_arts: 200 },
  q3_fsh_styl:   { design_arts: 200, marketing: 50 },
  q3_fsh_biz:    { business_mgmt: 160, marketing: 90, design_arts: 60 },
  q3_fsh_acc:    { design_arts: 200 },
  q3_fsh_med:    { journalism: 160, marketing: 90, design_arts: 60 },

  // ════════════════════════════════════════════════════════
  // Q3 — CREATIVE / Music
  // ════════════════════════════════════════════════════════
  q3_mus_perf:   { performing_arts: 200 },
  q3_mus_comp:   { performing_arts: 200 },
  q3_mus_prod:   { performing_arts: 200, software: 30 },
  q3_mus_sound:  { performing_arts: 200, software: 30 },
  q3_mus_theo:   { performing_arts: 200, humanities: 50 },
  q3_mus_media:  { performing_arts: 170, journalism: 70 },

  // ════════════════════════════════════════════════════════
  // Q3 — CREATIVE / Theater
  // ════════════════════════════════════════════════════════
  q3_thea_act:   { performing_arts: 200 },
  q3_thea_dir:   { performing_arts: 200, humanities: 50 },
  q3_thea_scen:  { performing_arts: 170, design_arts: 90 },
  q3_thea_chor:  { performing_arts: 200, sports: 45 },
  q3_thea_prod:  { performing_arts: 170, business_mgmt: 70 },
  q3_thea_perf:  { performing_arts: 200 },

  // ════════════════════════════════════════════════════════
  // Q3 — PRACTICAL / Factory
  // ════════════════════════════════════════════════════════
  q3_fac_mech:   { mech_eng: 200, elec_eng: 70, robotics: 45 },
  q3_fac_elec:   { elec_eng: 200, mech_eng: 70, robotics: 45 },
  q3_fac_auto:   { robotics: 200, mech_eng: 80, elec_eng: 60 },
  q3_fac_ind:    { env_eng: 200, mech_eng: 70 },
  q3_fac_serv:   { mech_eng: 170, elec_eng: 90, env_eng: 45 },
  q3_fac_rob:    { robotics: 200, software: 60, mech_eng: 45 },

  // ════════════════════════════════════════════════════════
  // Q3 — PRACTICAL / Construction
  // ════════════════════════════════════════════════════════
  q3_con_civil:  { civil_eng: 200, architecture: 70, env_eng: 45 },
  q3_con_arch:   { architecture: 200, civil_eng: 80 },
  q3_con_road:   { civil_eng: 200, env_eng: 70 },
  q3_con_mgmt:   { civil_eng: 160, business_mgmt: 80 },
  q3_con_urb:    { civil_eng: 170, architecture: 90 },
  q3_con_env:    { env_eng: 200, civil_eng: 70, natural_sci: 45 },

  // ════════════════════════════════════════════════════════
  // Q3 — PRACTICAL / Nature
  // ════════════════════════════════════════════════════════
  q3_pna_vet:    { agriculture: 200, natural_sci: 70, medicine: 40 },
  q3_pna_agro:   { agriculture: 200, natural_sci: 70 },
  q3_pna_env:    { natural_sci: 170, agriculture: 90, env_eng: 45 },
  q3_pna_for:    { agriculture: 200, natural_sci: 70 },
  q3_pna_anim:   { agriculture: 200, natural_sci: 70 },
  q3_pna_ecol:   { natural_sci: 170, agriculture: 90, env_eng: 45 },

  // ════════════════════════════════════════════════════════
  // Q3 — PRACTICAL / Sports
  // ════════════════════════════════════════════════════════
  q3_spo_sci:    { sports: 200, natural_sci: 70, physiotherapy: 45 },
  q3_spo_coach:  { sports: 200, education: 70 },
  q3_spo_med:    { sports: 160, medicine: 90, physiotherapy: 90 },
  q3_spo_physio: { physiotherapy: 200, sports: 90, medicine: 45 },
  q3_spo_mgmt:   { sports: 160, business_mgmt: 90, tourism: 45 },
  q3_spo_fit:    { sports: 200, physiotherapy: 70 },

  // ════════════════════════════════════════════════════════
  // Q3 — PRACTICAL / Travel
  // ════════════════════════════════════════════════════════
  q3_trv_tour:   { tourism: 200, business_mgmt: 70, languages: 45 },
  q3_trv_geo:    { natural_sci: 200, agriculture: 45 },
  q3_trv_geog:   { natural_sci: 200, tourism: 70 },
  q3_trv_hosp:   { tourism: 200, business_mgmt: 70 },
  q3_trv_env:    { natural_sci: 160, agriculture: 90, env_eng: 60 },
  q3_trv_cult:   { tourism: 170, humanities: 90 },

  // ════════════════════════════════════════════════════════
  // Q3 — PRACTICAL / Military
  // ════════════════════════════════════════════════════════
  q3_mil_mil:    { law: 160, intl_rel: 90 },
  q3_mil_crim:   { law: 200, social_work: 50 },
  q3_mil_sec:    { law: 160, intl_rel: 90, business_mgmt: 45 },
  q3_mil_cyber:  { cybersec: 200, software: 80, law: 45 },
  q3_mil_emerg:  { medicine: 120, civil_eng: 90, law: 70 },
  q3_mil_intel:  { intl_rel: 200, law: 70, data_ai: 45 },

  // ════════════════════════════════════════════════════════
  // Q1 — Skills (20–35 pts; boosted for underrepresented families)
  // ════════════════════════════════════════════════════════
  logic:         { software: 35, data_ai: 35, cybersec: 30, robotics: 30, natural_sci: 25, finance: 20, pharmacy: 20, dentistry: 20 },
  math:          { data_ai: 35, finance: 35, software: 30, natural_sci: 30, robotics: 25, pharmacy: 20, civil_eng: 20 },
  exact_sci:     { natural_sci: 35, biomedical: 30, pharmacy: 30, medicine: 25, dentistry: 15 },
  programming:   { software: 35, data_ai: 30, cybersec: 30, robotics: 25, info_sys: 25 },
  writing:       { humanities: 35, journalism: 35, languages: 30, marketing: 20 },
  analysis:      { data_ai: 30, finance: 30, intl_rel: 25, law: 25, natural_sci: 20, public_health: 20 },
  lang:          { languages: 35, intl_rel: 30, humanities: 25, tourism: 25 },
  communication: { marketing: 35, journalism: 30, business_mgmt: 25, law: 20, tourism: 20 },
  leadership:    { business_mgmt: 35, intl_rel: 30, law: 25, sports: 20 },
  organizing:    { business_mgmt: 30, info_sys: 25, education: 25, tourism: 25, nursing: 20 },
  creativity:    { design_arts: 35, performing_arts: 30, architecture: 30, marketing: 20 },
  visual_art:    { design_arts: 35, performing_arts: 30, architecture: 25, dentistry: 15 },
  music:         { performing_arts: 35 },
  hands_tech:    { mech_eng: 35, elec_eng: 35, civil_eng: 30, robotics: 30, agriculture: 20, dentistry: 10 },
  helping:       { medicine: 35, psychology: 35, education: 35, social_work: 30, nursing: 30, physiotherapy: 25, public_health: 20 },
  sales:         { marketing: 35, business_mgmt: 30, tourism: 25 },
  research:      { natural_sci: 35, data_ai: 30, humanities: 30, biomedical: 30, medicine: 25, pharmacy: 25, public_health: 20 },
  sports:        { sports: 35, physiotherapy: 25 },
  fast_learning: { software: 30, data_ai: 25, info_sys: 25, cybersec: 20 },
  presentation:  { journalism: 30, marketing: 30, business_mgmt: 25, education: 25 },

  // ════════════════════════════════════════════════════════
  // Q4 — Work-life style (45–70 pts; doubled vs old system)
  // Underrepresented families get premium bonuses here
  // ════════════════════════════════════════════════════════
  wl_stable:      { education: 60, law: 55, public_health: 65, civil_eng: 55,
                    business_mgmt: 45, nursing: 65, pharmacy: 55, info_sys: 50,
                    mech_eng: 50, elec_eng: 50, robotics: 40, dentistry: 35 },
  wl_highpay:     { finance: 65, law: 55, medicine: 60, software: 60,
                    business_mgmt: 45, dentistry: 45, cybersec: 55,
                    mech_eng: 45, elec_eng: 45, robotics: 40, civil_eng: 35 },
  wl_creative:    { design_arts: 65, performing_arts: 65, architecture: 65, marketing: 45 },
  wl_people:      { medicine: 55, psychology: 60, education: 60, social_work: 60,
                    marketing: 40, tourism: 55, nursing: 55, physiotherapy: 50 },
  wl_research:    { natural_sci: 65, biomedical: 70, data_ai: 60,
                    humanities: 45, medicine: 40, pharmacy: 60, env_eng: 55 },
  wl_active:      { sports: 65, physiotherapy: 70, agriculture: 45, medicine: 35, env_eng: 40 },
  wl_leadership:  { business_mgmt: 60, intl_rel: 60, law: 45, sports: 40 },
  wl_independent: { data_ai: 60, software: 60, natural_sci: 45,
                    humanities: 40, design_arts: 45, cybersec: 50 },
  wl_intl:        { intl_rel: 65, languages: 65, tourism: 65, business_mgmt: 40 },
  wl_helping:     { medicine: 55, nursing: 70, psychology: 65, social_work: 65,
                    education: 45, physiotherapy: 60, public_health: 55 },

  // ════════════════════════════════════════════════════════
  // Q5 — Negative filter (-35 to -100 pts; softened vs old system)
  // No single answer should kill a family below 0 alone
  // ════════════════════════════════════════════════════════
  neg_study:     { medicine: -100, dentistry: -100, law: -75, natural_sci: -70, pharmacy: -70, biomedical: -70 },
  neg_stress:    { medicine: -100, dentistry: -50, law: -70, finance: -55 },
  neg_people:    { medicine: -75, psychology: -75, education: -60, social_work: -60,
                   marketing: -40, tourism: -40, nursing: -55 },
  neg_office:    { software: -75, data_ai: -75, finance: -60, business_mgmt: -45, info_sys: -60, law: -45 },
  neg_physical:  { sports: -100, physiotherapy: -75, agriculture: -70, civil_eng: -40, mech_eng: -40 },
  neg_routine:   { finance: -75, nursing: -60, law: -45, education: -45, business_mgmt: -45 },
  neg_public:    { journalism: -75, marketing: -60, education: -45, law: -45, intl_rel: -45 },
  neg_compete:   { finance: -60, law: -45, business_mgmt: -45, sports: -45 },
  neg_tech:      { software: -100, data_ai: -100, cybersec: -75, robotics: -75, elec_eng: -55, info_sys: -60 },
  neg_emotional: { psychology: -75, social_work: -60, medicine: -60, nursing: -45 },
  neg_strict:    { law: -75, medicine: -60, education: -45 },
  neg_unpred:    { tourism: -75, marketing: -45, performing_arts: -60, sports: -60, journalism: -45 },
}

// ── Engine ────────────────────────────────────────────────────────────────────

function applyKey(scores: Record<FamilyId, number>, key: string): void {
  const map = SCORES[key]
  if (!map) return
  for (const [fam, pts] of Object.entries(map)) {
    if (pts === undefined) continue
    scores[fam as FamilyId] = (scores[fam as FamilyId] ?? 0) + pts
  }
}

export function computeFamilyScores(answers: {
  skills:    string[]
  q3:        string
  worklife:  string[]
  negfilter: string[]
}): Record<FamilyId, number> {
  const scores = Object.fromEntries(ALL_FAMILIES.map(f => [f, 0])) as Record<FamilyId, number>
  applyKey(scores, answers.q3)
  answers.skills.forEach(s  => applyKey(scores, s))
  answers.worklife.forEach(w => applyKey(scores, w))
  answers.negfilter.forEach(n => applyKey(scores, n))
  return scores
}

export function topFamilies(scores: Record<FamilyId, number>, n = 10): FamilyId[] {
  return (Object.entries(scores) as [FamilyId, number][])
    .sort((a, b) => b[1] - a[1])
    .filter(([, v]) => v > 0)
    .slice(0, n)
    .map(([f]) => f)
}

// Detects which program family a program belongs to by name matching
// Tries ALL_FAMILIES in order (specific→generic) — returns first match
export function detectFamily(name_ka: string): FamilyId | null {
  const n = name_ka.toLowerCase()
  for (const fam of ALL_FAMILIES) {
    if (FAMILY_PATTERNS[fam].test(n)) return fam
  }
  return null
}
