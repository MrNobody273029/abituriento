import { writeFileSync } from "fs"
import { join } from "path"
import {
  computeFamilyScores,
  topFamilies,
  FAMILY_NAME_KA,
  type FamilyId,
} from "../lib/quiz-v2-scoring"

const THEORETICAL_MAX = 515

// Q3 label lookup (Georgian)
const Q3_KA: Record<string, string> = {
  q3_cs_apps: "IT — პროგ./აპლ. შექმნა",      q3_cs_web: "IT — ვებ/UI·UX",
  q3_cs_data: "IT — მონაც./AI",               q3_cs_sec: "IT — კიბერუსაფ.",
  q3_cs_robots: "IT — რობოტ./სისტ.",          q3_cs_biz: "IT — ბიზ.+ტექნ.",
  q3_eng_civil: "ინჟ — შენობ./ხიდ.",          q3_eng_mech: "ინჟ — მექანიზმ.",
  q3_eng_elec: "ინჟ — ენერგ./ელ.",            q3_eng_ind: "ინჟ — ინდ.პროც.",
  q3_eng_env: "ინჟ — გარემო/მდგ.",            q3_eng_mecha: "ინჟ — ჭკვ.ტექ.",
  q3_h_med: "ჯანდ — დიაგნ./მკურნ.",          q3_h_pharm: "ჯანდ — ფარმ.",
  q3_h_lab: "ჯანდ — ლაბ./კვლ.",              q3_h_physio: "ჯანდ — ფიზ.თერ.",
  q3_h_dent: "ჯანდ — სტომ.",                  q3_h_nutr: "ჯანდ — კვება/ჯანდ.",
  q3_nat_bio: "ბუნ — ცოცხ.ორგ.",             q3_nat_chem: "ბუნ — ქიმ.",
  q3_nat_phys: "ბუნ — ფიზ.",                  q3_nat_env: "ბუნ — გარემო/ეკ.",
  q3_nat_gen: "ბუნ — გენეტ.",                 q3_nat_geo: "ბუნ — გეოლ.",
  q3_eco_fin: "ეკ — ფინ./ინვ.",               q3_eco_mgmt: "ეკ — კომ.მართ.",
  q3_eco_mkt: "ეკ — მარკ.",                   q3_eco_intl: "ეკ — საერთ.ბიზ.",
  q3_eco_anl: "ეკ — ანალ.",                   q3_eco_ent: "ეკ — სტარტ.",
  q3_data_stat: "DATA — სტატ.",               q3_data_ai: "DATA — AI",
  q3_data_biz: "DATA — ბიზ.ანალ.",            q3_data_fin: "DATA — ფინ.მოდ.",
  q3_data_res: "DATA — კვლ.",                 q3_data_algo: "DATA — ალგ.",
  q3_txt_journ: "ტექსტი — ჟურნ.",            q3_txt_lit: "ტექსტი — ლიტ.",
  q3_txt_trans: "ტექსტი — თარგმ.",           q3_txt_cont: "ტექსტი — კონტ.",
  q3_txt_edit: "ტექსტი — რედ.",              q3_txt_crw: "ტექსტი — კრ.წ.",
  q3_his_hist: "ისტ — ისტ.კვლ.",             q3_his_arch: "ისტ — არქეოლ.",
  q3_his_cult: "ისტ — კულტ.მემ.",            q3_his_mus: "ისტ — მუზ./არქ.",
  q3_his_anthr: "ისტ — ანთრ.",               q3_his_relig: "ისტ — რელ.",
  q3_soc_intrel: "სოც — საერთ.ურთ.",         q3_soc_pol: "სოც — პოლ.",
  q3_soc_dipl: "სოც — დიპლ.",               q3_soc_sec: "სოც — უსაფ.",
  q3_soc_sociol: "სოც — სოციოლ.",           q3_soc_pub: "სოც — საჯ.პოლ.",
  q3_law_adv: "სამ — ადვ.",                  q3_law_hr: "სამ — ადამ.უფ.",
  q3_law_corp: "სამ — ბიზ.სამ.",            q3_law_intl: "სამ — საერთ.",
  q3_law_crim: "სამ — კრიმ.",               q3_law_const: "სამ — სახ.",
  q3_phi_eth: "ფილ — ეთ.",                  q3_phi_phi: "ფილ — ფილოს.",
  q3_phi_relig: "ფილ — რელ.",               q3_phi_log: "ფილ — ლოგ.",
  q3_phi_soc: "ფილ — საზ.იდ.",             q3_phi_acad: "ფილ — აკად.",
  q3_edu_child: "სწ — ბავ.სწ.",             q3_edu_lang: "სწ — ენ.სწ.",
  q3_edu_ling: "სწ — ლინგვ.",              q3_edu_appl: "სწ — გამ.ლინგ.",
  q3_edu_edpsy: "სწ — სასწ.ფს.",          q3_edu_tech: "სწ — სასწ.ტექ.",
  q3_med_gen: "მედ — ექიმ.",               q3_med_psych: "მედ — ფს.ჯანმ.",
  q3_med_emerg: "მედ — გადაუდ.",           q3_med_ped: "მედ — ბავ.მკ.",
  q3_med_surg: "მედ — ქირ.",               q3_med_pub: "მედ — საჯ.ჯანმ.",
  q3_psy_ther: "ფს — თერ./კონს.",          q3_psy_child: "ფს — ბ.ფს.",
  q3_psy_org: "ფს — ორგ.ფს.",             q3_psy_beh: "ფს — ქც.კვლ.",
  q3_psy_clin: "ფს — კლინ.ფს.",           q3_psy_soc: "ფს — სოც.დახ.",
  q3_ch_edu: "ბავ — სკ.სწ.",              q3_ch_spec: "ბავ — სპეც.განათ.",
  q3_ch_youth: "ბავ — ახ.პრ.",            q3_ch_mgmt: "ბავ — გ.მართ.",
  q3_ch_psych: "ბავ — ბ.ფს.",             q3_ch_inf: "ბავ — ინფ.განათ.",
  q3_biz_mgmt: "ბიზ — კომ.მართ.",         q3_biz_sales: "ბიზ — გაყ.",
  q3_biz_mkt: "ბიზ — მარკ.",              q3_biz_hr: "ბიზ — HR",
  q3_biz_start: "ბიზ — სტარტ.",           q3_biz_pm: "ბიზ — პრ.მართ.",
  q3_crt_adv: "სასამ — ადვ.",             q3_crt_crim: "სასამ — კრ.სამ.",
  q3_crt_hr: "სასამ — ად.უფ.",           q3_crt_lit: "სასამ — სამ.პრ.",
  q3_crt_med: "სასამ — მოლ.",            q3_crt_crin: "სასამ — კრიმ.",
  q3_st_pub: "სახ — საჯ.მმ.",            q3_st_dipl: "სახ — დიპლ.",
  q3_st_pol: "სახ — პ.ანალ.",            q3_st_sec: "სახ — უს.",
  q3_st_gov: "სახ — სახ.მ.",             q3_st_reg: "სახ — რეგ.",
  q3_mda_journ: "მედ — ჟურნ.",            q3_mda_pr: "მედ — PR",
  q3_mda_soc: "მედ — სოც.მედ.",          q3_mda_tv: "მედ — ტელ.",
  q3_mda_strat: "მედ — კონტ.სტ.",        q3_mda_adv: "მედ — რეკ.",
  q3_dig_ux: "კრ — UI/UX",               q3_dig_web: "კრ — ვებ.დიზ.",
  q3_dig_prod: "კრ — პ.დიზ.",             q3_dig_game: "კრ — თ.ინტ.",
  q3_dig_mob: "კრ — მობ.დიზ.",           q3_dig_int: "კრ — კრ.კოდ.",
  q3_bld_arch: "შენ — არქ.",             q3_bld_int: "შენ — ინტ.დიზ.",
  q3_bld_urb: "შენ — ურბ.",              q3_bld_land: "შენ — ლ.დიზ.",
  q3_bld_sust: "შენ — მდგ.სივ.",         q3_bld_viz: "შენ — 3D",
  q3_gfx_brand: "გრ — ბრენდ.",           q3_gfx_illus: "გრ — ილ.",
  q3_gfx_mot: "გრ — მოშ.დ.",             q3_gfx_adv: "გრ — სარ.ვ.",
  q3_gfx_pack: "გრ — შ.დ.",              q3_gfx_dart: "გრ — ც.არტ.",
  q3_film_dir: "კინო — რეჟ.",            q3_film_edit: "კინო — მ.",
  q3_film_cin: "კინო — ოპ.",             q3_film_photo: "კინო — ფოტ.",
  q3_film_doc: "კინო — დოკ.",            q3_film_cont: "კინო — კ.კ.",
  q3_fsh_des: "მოდ — დიზ.",              q3_fsh_text: "მოდ — ტექ.დ.",
  q3_fsh_styl: "მოდ — სტილ.",           q3_fsh_biz: "მოდ — ბიზ.",
  q3_fsh_acc: "მოდ — აქ.",              q3_fsh_med: "მოდ — მ.მ.",
  q3_mus_perf: "მუს — შეს.",            q3_mus_comp: "მუს — კომ.",
  q3_mus_prod: "მუს — მ.პ.",             q3_mus_sound: "მუს — ს.დ.",
  q3_mus_theo: "მუს — თ.",              q3_mus_media: "მუს — კ./გ.",
  q3_thea_act: "თეატ — მსახ.",          q3_thea_dir: "თეატ — რეჟ.",
  q3_thea_scen: "თეატ — სც.",           q3_thea_chor: "თეატ — ქორ.",
  q3_thea_prod: "თეატ — პ.",            q3_thea_perf: "თეატ — შეს.",
  q3_fac_mech: "ქარ — მ.მ.",            q3_fac_elec: "ქარ — ელ.სისტ.",
  q3_fac_auto: "ქარ — ავტ.",            q3_fac_ind: "ქარ — საწ.პ.",
  q3_fac_serv: "ქარ — ტ.სერვ.",         q3_fac_rob: "ქარ — რობ.",
  q3_con_civil: "მშ — შ.კ.",            q3_con_arch: "მშ — არქ.დ.",
  q3_con_road: "მშ — გ.ინფ.",           q3_con_mgmt: "მშ — სამ.მ.",
  q3_con_urb: "მშ — ურბ.პ.",            q3_con_env: "მშ — გ.ინჟ.",
  q3_pna_vet: "ბუნ — ვეტ.",             q3_pna_agro: "ბუნ — აგრ.",
  q3_pna_env: "ბუნ — გ.დ.",             q3_pna_for: "ბუნ — ტყ.",
  q3_pna_anim: "ბუნ — ცხ.მ.",           q3_pna_ecol: "ბუნ — ეკ.",
  q3_spo_sci: "სპ — სპ.მეც.",           q3_spo_coach: "სპ — მწვ.",
  q3_spo_med: "სპ — სპ.მედ.",           q3_spo_physio: "სპ — ფ.თ.",
  q3_spo_mgmt: "სპ — სპ.მართ.",         q3_spo_fit: "სპ — ფ.ი.",
  q3_trv_tour: "ტ — ტური.",             q3_trv_geo: "ტ — გეოლ.",
  q3_trv_geog: "ტ — გეოგ.",             q3_trv_hosp: "ტ — სასტ.",
  q3_trv_env: "ტ — გ.კვ.",              q3_trv_cult: "ტ — კ.ტ.",
  q3_mil_mil: "სამ — სამს.",            q3_mil_crim: "სამ — კ.სამ.",
  q3_mil_sec: "სამ — უ.მ.",             q3_mil_cyber: "სამ — კ.უ.",
  q3_mil_emerg: "სამ — გადაუდ.",        q3_mil_intel: "სამ — ი.ა.",
}

const SKILL_KA: Record<string, string> = {
  logic: "ლოგიკური აზრ.", math: "მათემ.", exact_sci: "ზუსტ.მეცნ.",
  programming: "პროგ.", writing: "წერა", analysis: "ანალ.",
  lang: "უცხ.ენები", communication: "კომუნ.", leadership: "ლიდერ.",
  organizing: "ორგ.", creativity: "შემოქ.", visual_art: "ხ.ხელ.",
  music: "მუსიკა", hands_tech: "ხელ.+ტექ.", helping: "დახ.ადამ.",
  sales: "გაყიდვები", research: "კვლევა", sports: "სპორტი",
  fast_learning: "სწრ.სწავლ.", presentation: "პრეზენტ.",
}

const WL_KA: Record<string, string> = {
  wl_stable: "სტაბ.სამ.", wl_highpay: "მ.ხელფ.", wl_creative: "კრეატ.საქ.",
  wl_people: "ადამ.კონტ.", wl_research: "კვლ.საქ.", wl_active: "აქტ.მოძრ.",
  wl_leadership: "ლიდ.როლი", wl_independent: "დამ.სამ.", wl_intl: "საერთ.კარ.",
  wl_helping: "სხვ.დახ.",
}

const NEG_KA: Record<string, string> = {
  neg_study: "ხ.სწ.არა", neg_stress: "სტრ.არა", neg_people: "ადამ.კ.არა",
  neg_office: "ოფ.არა", neg_physical: "ფიზ.არა", neg_routine: "რუტ.არა",
  neg_public: "საჯ.გ.არა", neg_compete: "კონკ.არა", neg_tech: "ტექ.არა",
  neg_emotional: "ემ.დ.არა", neg_strict: "მკ.წ.არა", neg_unpred: "გაუგ.არა",
}

type Scenario = {
  label:     string
  skills:    string[]
  q3:        string
  worklife:  string[]
  negfilter: string[]
}

const SCENARIOS: Scenario[] = [
  // ── 1–10: IT & Engineering ──────────────────────────────────────────────
  { label:"01 — Software Dev",      skills:["logic","programming","math"],         q3:"q3_cs_apps",    worklife:["wl_highpay","wl_independent"],  negfilter:["neg_people"] },
  { label:"02 — Cybersecurity",     skills:["logic","programming","fast_learning"],q3:"q3_cs_sec",     worklife:["wl_highpay","wl_independent"],  negfilter:["neg_people"] },
  { label:"03 — Data / AI",         skills:["math","logic","programming"],         q3:"q3_data_ai",    worklife:["wl_independent","wl_highpay"],  negfilter:[] },
  { label:"04 — Info Systems (BIS)",skills:["organizing","logic","fast_learning"], q3:"q3_cs_biz",     worklife:["wl_stable","wl_highpay"],       negfilter:[] },
  { label:"05 — Robotics",          skills:["programming","math","hands_tech"],    q3:"q3_cs_robots",  worklife:["wl_highpay","wl_independent"],  negfilter:[] },
  { label:"06 — Civil Eng.",        skills:["math","hands_tech","analysis"],       q3:"q3_eng_civil",  worklife:["wl_stable","wl_highpay"],       negfilter:["neg_people"] },
  { label:"07 — Elec. Eng.",        skills:["math","logic","hands_tech"],          q3:"q3_eng_elec",   worklife:["wl_highpay","wl_stable"],       negfilter:["neg_people"] },
  { label:"08 — Mech. Eng.",        skills:["math","hands_tech","logic"],          q3:"q3_eng_mech",   worklife:["wl_highpay","wl_stable"],       negfilter:[] },
  { label:"09 — Env. Eng.",         skills:["exact_sci","research","hands_tech"],  q3:"q3_eng_env",    worklife:["wl_research","wl_active"],      negfilter:[] },
  { label:"10 — UI/UX Designer",    skills:["creativity","visual_art","programming"],q3:"q3_dig_ux",   worklife:["wl_creative","wl_independent"], negfilter:["neg_routine"] },

  // ── 11–20: Health ─────────────────────────────────────────────────────────
  { label:"11 — Doctor (General)",  skills:["exact_sci","helping","research"],     q3:"q3_med_gen",    worklife:["wl_highpay","wl_people"],       negfilter:[] },
  { label:"12 — Surgeon",           skills:["exact_sci","hands_tech","logic"],     q3:"q3_med_surg",   worklife:["wl_highpay","wl_stable"],       negfilter:[] },
  { label:"13 — Pediatrician",      skills:["helping","exact_sci","communication"],q3:"q3_med_ped",    worklife:["wl_people","wl_helping"],       negfilter:["neg_stress"] },
  { label:"14 — Dentist",           skills:["exact_sci","hands_tech","logic"],     q3:"q3_h_dent",     worklife:["wl_highpay","wl_stable"],       negfilter:["neg_stress"] },
  { label:"15 — Pharmacist",        skills:["exact_sci","research","logic"],       q3:"q3_h_pharm",    worklife:["wl_research","wl_stable"],      negfilter:[] },
  { label:"16 — Nurse (Emergency)", skills:["helping","organizing","communication"],q3:"q3_med_emerg",  worklife:["wl_helping","wl_stable"],       negfilter:["neg_stress"] },
  { label:"17 — Physiotherapist",   skills:["helping","sports","hands_tech"],      q3:"q3_h_physio",   worklife:["wl_active","wl_helping"],       negfilter:["neg_office"] },
  { label:"18 — Biomedical Sci.",   skills:["research","exact_sci","analysis"],    q3:"q3_h_lab",      worklife:["wl_research","wl_independent"], negfilter:["neg_people"] },
  { label:"19 — Public Health",     skills:["research","helping","analysis"],      q3:"q3_med_pub",    worklife:["wl_stable","wl_helping"],       negfilter:[] },
  { label:"20 — Sports Medicine",   skills:["sports","helping","exact_sci"],       q3:"q3_spo_med",    worklife:["wl_active","wl_people"],        negfilter:["neg_office"] },

  // ── 21–30: Business & Law ─────────────────────────────────────────────────
  { label:"21 — Lawyer (Advocate)", skills:["writing","analysis","communication"], q3:"q3_law_adv",    worklife:["wl_highpay","wl_leadership"],   negfilter:[] },
  { label:"22 — Corporate Law",     skills:["analysis","writing","logic"],         q3:"q3_law_corp",   worklife:["wl_highpay","wl_stable"],       negfilter:["neg_physical"] },
  { label:"23 — HR Manager",        skills:["communication","leadership","organizing"],q3:"q3_biz_hr", worklife:["wl_people","wl_stable"],        negfilter:["neg_physical"] },
  { label:"24 — Entrepreneur",      skills:["leadership","communication","sales"],  q3:"q3_biz_start",  worklife:["wl_leadership","wl_highpay"],   negfilter:[] },
  { label:"25 — Finance / Invest.", skills:["math","analysis","logic"],             q3:"q3_eco_fin",    worklife:["wl_highpay","wl_leadership"],   negfilter:["neg_physical"] },
  { label:"26 — Marketing",         skills:["creativity","communication","sales"],  q3:"q3_eco_mkt",    worklife:["wl_people","wl_creative"],      negfilter:["neg_routine"] },
  { label:"27 — Int'l Relations",   skills:["lang","communication","leadership"],   q3:"q3_soc_intrel", worklife:["wl_intl","wl_leadership"],      negfilter:[] },
  { label:"28 — Diplomat",          skills:["lang","communication","writing"],      q3:"q3_soc_dipl",   worklife:["wl_intl","wl_leadership"],      negfilter:["neg_routine"] },
  { label:"29 — Public Admin.",     skills:["leadership","organizing","analysis"],  q3:"q3_st_pub",     worklife:["wl_leadership","wl_stable"],    negfilter:[] },
  { label:"30 — Criminologist",     skills:["analysis","writing","logic"],          q3:"q3_law_crim",   worklife:["wl_stable","wl_highpay"],       negfilter:["neg_physical"] },

  // ── 31–40: Humanities & Social ───────────────────────────────────────────
  { label:"31 — Psychologist",      skills:["helping","writing","analysis"],        q3:"q3_psy_ther",   worklife:["wl_people","wl_helping"],       negfilter:["neg_physical"] },
  { label:"32 — Social Worker",     skills:["helping","communication","organizing"],q3:"q3_psy_soc",    worklife:["wl_helping","wl_people"],       negfilter:["neg_office"] },
  { label:"33 — Historian",         skills:["writing","research","analysis"],       q3:"q3_his_hist",   worklife:["wl_research","wl_independent"], negfilter:["neg_physical"] },
  { label:"34 — Journalist",        skills:["writing","communication","creativity"],q3:"q3_txt_journ",  worklife:["wl_people","wl_creative"],      negfilter:["neg_routine"] },
  { label:"35 — Translator/Ling.",  skills:["lang","writing","analysis"],           q3:"q3_edu_ling",   worklife:["wl_intl","wl_research"],        negfilter:[] },
  { label:"36 — Teacher (Child)",   skills:["helping","creativity","communication"],q3:"q3_ch_edu",     worklife:["wl_people","wl_stable"],        negfilter:["neg_office"] },
  { label:"37 — Edu-Psychologist",  skills:["helping","analysis","organizing"],     q3:"q3_edu_edpsy",  worklife:["wl_people","wl_helping"],       negfilter:["neg_physical"] },
  { label:"38 — Ed.Tech Specialist",skills:["programming","organizing","communication"],q3:"q3_edu_tech",worklife:["wl_stable","wl_independent"],  negfilter:[] },
  { label:"39 — Philosophy",        skills:["writing","analysis","research"],       q3:"q3_phi_phi",    worklife:["wl_research","wl_independent"], negfilter:["neg_physical"] },
  { label:"40 — Political Analyst", skills:["writing","analysis","communication"],  q3:"q3_soc_pol",    worklife:["wl_leadership","wl_intl"],      negfilter:[] },

  // ── 41–50: Creative, Sports, Agriculture ─────────────────────────────────
  { label:"41 — Graphic Designer",  skills:["creativity","visual_art","presentation"],q3:"q3_gfx_brand",worklife:["wl_creative","wl_independent"], negfilter:["neg_routine"] },
  { label:"42 — Architect",         skills:["creativity","visual_art","analysis"],  q3:"q3_bld_arch",   worklife:["wl_creative","wl_highpay"],     negfilter:[] },
  { label:"43 — Musician",          skills:["music","creativity","presentation"],   q3:"q3_mus_perf",   worklife:["wl_creative","wl_independent"], negfilter:["neg_routine","neg_office"] },
  { label:"44 — Film Director",     skills:["creativity","visual_art","leadership"],q3:"q3_film_dir",   worklife:["wl_creative","wl_independent"], negfilter:["neg_routine"] },
  { label:"45 — Fashion Designer",  skills:["creativity","visual_art","organizing"],q3:"q3_fsh_des",    worklife:["wl_creative","wl_independent"], negfilter:["neg_routine"] },
  { label:"46 — Sports Coach",      skills:["sports","leadership","communication"], q3:"q3_spo_coach",  worklife:["wl_active","wl_people"],        negfilter:["neg_office"] },
  { label:"47 — Physiotherapy (Sp)",skills:["sports","helping","hands_tech"],       q3:"q3_spo_physio", worklife:["wl_active","wl_helping"],       negfilter:["neg_office"] },
  { label:"48 — Tourism Manager",   skills:["lang","communication","organizing"],   q3:"q3_trv_tour",   worklife:["wl_intl","wl_people"],          negfilter:["neg_routine"] },
  { label:"49 — Veterinarian",      skills:["exact_sci","hands_tech","research"],   q3:"q3_pna_vet",    worklife:["wl_active","wl_research"],      negfilter:["neg_office","neg_strict"] },
  { label:"50 — Natural Scientist", skills:["research","exact_sci","analysis"],     q3:"q3_nat_bio",    worklife:["wl_research","wl_independent"], negfilter:["neg_people"] },
]

function matchPct(score: number): number {
  return Math.min(97, Math.max(15, Math.round(score / THEORETICAL_MAX * 100)))
}

type ResultRow = {
  test_id:     string
  q1_skills:   string
  q3_answer:   string
  q4_worklife: string
  q5_negfilter:string
  rec1: string; pct1: number
  rec2: string; pct2: number
  rec3: string; pct3: number
  rec4: string; pct4: number
  rec5: string; pct5: number
  rec6: string; pct6: number
  rec7: string; pct7: number
  rec8: string; pct8: number
}

const results: ResultRow[] = []

for (const sc of SCENARIOS) {
  const scores  = computeFamilyScores({
    skills:    sc.skills,
    q3:        sc.q3,
    worklife:  sc.worklife,
    negfilter: sc.negfilter,
  })
  const top = topFamilies(scores, 8) as FamilyId[]
  const get = (i: number) => top[i] ? FAMILY_NAME_KA[top[i]] : "-"
  const pct = (i: number) => top[i] ? matchPct(scores[top[i]]) : 0

  results.push({
    test_id:     sc.label,
    q1_skills:   sc.skills.map(s => SKILL_KA[s] ?? s).join(" + "),
    q3_answer:   Q3_KA[sc.q3] ?? sc.q3,
    q4_worklife: sc.worklife.map(w => WL_KA[w] ?? w).join(" + "),
    q5_negfilter:sc.negfilter.map(n => NEG_KA[n] ?? n).join(" + ") || "-",
    rec1: get(0), pct1: pct(0),
    rec2: get(1), pct2: pct(1),
    rec3: get(2), pct3: pct(2),
    rec4: get(3), pct4: pct(3),
    rec5: get(4), pct5: pct(4),
    rec6: get(5), pct6: pct(5),
    rec7: get(6), pct7: pct(6),
    rec8: get(7), pct8: pct(7),
  })
}

// Write CSV
const header = [
  "test_id","q1_skills","q3_answer","q4_worklife","q5_negfilter",
  "rec1","match1%","rec2","match2%","rec3","match3%",
  "rec4","match4%","rec5","match5%","rec6","match6%",
  "rec7","match7%","rec8","match8%",
].join(",")

const lines = results.map(r =>
  [
    `"${r.test_id}"`,
    `"${r.q1_skills}"`,
    `"${r.q3_answer}"`,
    `"${r.q4_worklife}"`,
    `"${r.q5_negfilter}"`,
    `"${r.rec1}"`,r.pct1,
    `"${r.rec2}"`,r.pct2,
    `"${r.rec3}"`,r.pct3,
    `"${r.rec4}"`,r.pct4,
    `"${r.rec5}"`,r.pct5,
    `"${r.rec6}"`,r.pct6,
    `"${r.rec7}"`,r.pct7,
    `"${r.rec8}"`,r.pct8,
  ].join(",")
)

const csv = [header, ...lines].join("\n")
const out = join(process.cwd(), "data_structured", "quiz-simulation-50.csv")
writeFileSync(out, csv, "utf8")
console.log(`✅  50 სიმულაცია → ${out}`)

// Print summary to console
console.log("\n" + "=".repeat(80))
console.log("SIMULATION SUMMARY")
console.log("=".repeat(80))
for (const r of results) {
  console.log(`\n${r.test_id}`)
  console.log(`  Q1: ${r.q1_skills}`)
  console.log(`  Q3: ${r.q3_answer}`)
  console.log(`  Q4: ${r.q4_worklife}  |  Q5: ${r.q5_negfilter}`)
  console.log(`  → #1: ${r.rec1} (${r.pct1}%)  #2: ${r.rec2} (${r.pct2}%)  #3: ${r.rec3} (${r.pct3}%)`)
}
