import { writeFileSync } from "fs"
import { join } from "path"
import { SCORES } from "../lib/quiz-v2-scoring"

type Row = {
  answer_type: string
  answer_key:  string
  answer_label: string
  family_id:   string
  points:      number
}

const Q3_LABELS: Record<string, string> = {
  q3_cs_apps:   "პროგრამების/აპლ. შექმნა",     q3_cs_web:    "ვებ / UI/UX",
  q3_cs_data:   "მონაცემები / AI",               q3_cs_sec:    "კიბერუსაფრთხ.",
  q3_cs_robots: "რობოტები/სისტ.",               q3_cs_biz:    "ბიზ. + ტექნ.",
  q3_eng_civil: "შენობ./ხიდ./ქ-ბი",            q3_eng_mech:  "მექანიზმ./მანქ.",
  q3_eng_elec:  "ენერგ./ელ.სისტ.",              q3_eng_ind:   "ინდ. პროც./წარმ.",
  q3_eng_env:   "გარემო/მდგ.ინფ.",              q3_eng_mecha: "ჭკვ.ტექ.სისტ.",
  q3_h_med:     "დიაგნ./მკურნ.",               q3_h_pharm:   "მედიკ./ფარმ.",
  q3_h_lab:     "ლაბ./კვლ.",                    q3_h_physio:  "რეაბ./ფიზ.დახმ.",
  q3_h_dent:    "კბილ./პირის ღრუ",             q3_h_nutr:    "კვება/საჯ.ჯანდ.",
  q3_nat_bio:   "ცოცხ.ორგ.",                    q3_nat_chem:  "ქიმ.პროც.",
  q3_nat_phys:  "ფიზ.კანონ.",                   q3_nat_env:   "გარემო/ეკოს.",
  q3_nat_gen:   "გენეტ./მიკრობ.",              q3_nat_geo:   "დედამ./ბუნ.რეს.",
  q3_eco_fin:   "ფინ./ინვ.",                    q3_eco_mgmt:  "კომ.მართვა",
  q3_eco_mkt:   "მარკ./ბრენდ.",                q3_eco_intl:  "საერთ.ბიზ.",
  q3_eco_anl:   "ეკ.ანალ.",                     q3_eco_ent:   "საკ.ბიზ.შეს.",
  q3_data_stat: "სტატ.ანალ.",                   q3_data_ai:   "AI/პროგნ.",
  q3_data_biz:  "ბიზ.მონ.ანალ.",               q3_data_fin:  "ფინ.მოდ.",
  q3_data_res:  "კვლ./აკად.ანალ.",             q3_data_algo: "ალგ./მოდ.",
  q3_txt_journ: "ჟურნ.სტ./მედია",             q3_txt_lit:   "ლიტ./ანალ.",
  q3_txt_trans: "თარგმ./ენ.",                   q3_txt_cont:  "კონტ.შეს.",
  q3_txt_edit:  "რედ./გამ.",                    q3_txt_crw:   "სც./კრ.ტ.",
  q3_his_hist:  "ისტ.კვლ.",                     q3_his_arch:  "არქეოლ.",
  q3_his_cult:  "კულტ.მემ.",                    q3_his_mus:   "მუზ./არქ.",
  q3_his_anthr: "ცივ.ანალ.",                    q3_his_relig: "რელ./კულტ.",
  q3_soc_intrel:"საერთ.ურთ.",                  q3_soc_pol:   "პოლ.კვლ.",
  q3_soc_dipl:  "დიპლ.",                        q3_soc_sec:   "უსაფ./გეოპ.",
  q3_soc_sociol:"სოც.კვლ.",                    q3_soc_pub:   "საჯ.პოლ.",
  q3_law_adv:   "ადვ./სასამ.",                 q3_law_hr:    "ადამ.უფლ.",
  q3_law_corp:  "ბიზ.სამ.",                     q3_law_intl:  "საერთ.სამ.",
  q3_law_crim:  "კრიმ.",                        q3_law_const: "სახ.სამ.",
  q3_phi_eth:   "ეთ.საკ.",                      q3_phi_phi:   "ადამ.აზრ.",
  q3_phi_relig: "რელ./კულტ.",                  q3_phi_log:   "ლოგ./ანალ.",
  q3_phi_soc:   "საზ.იდ.",                      q3_phi_acad:  "აკად.კვლ.",
  q3_edu_child: "ბავ.სწ.",                      q3_edu_lang:  "ენ.სწ.",
  q3_edu_ling:  "ლინგვ.",                       q3_edu_appl:  "გამ.ლინგვ.",
  q3_edu_edpsy: "სასწ.ფსიქ.",                  q3_edu_tech:  "სასწ.ტექ.",
  q3_med_gen:   "ექიმობა",                      q3_med_psych: "ფს.ჯანმრთ.",
  q3_med_emerg: "გადაუდ.დახ.",                 q3_med_ped:   "ბავ.მკ.",
  q3_med_surg:  "ქირ.სფ.",                      q3_med_pub:   "საზ.ჯანმრთ.",
  q3_psy_ther:  "თერ./კონს.",                   q3_psy_child: "ბ.ფსიქ.",
  q3_psy_org:   "ორგ.ფსიქ.",                   q3_psy_beh:   "ქც.კვლ.",
  q3_psy_clin:  "ფს.ჯ.პროგ.",                 q3_psy_soc:   "სოც.დახ.",
  q3_ch_edu:    "სკ.სწ.",                       q3_ch_spec:   "სპეც.განათ.",
  q3_ch_youth:  "ახ.პრ.",                       q3_ch_mgmt:   "გან.მართ.",
  q3_ch_psych:  "ბ.ფს.",                        q3_ch_inf:    "არაფ.განათ.",
  q3_biz_mgmt:  "კომ.მართ.",                   q3_biz_sales: "გაყ.",
  q3_biz_mkt:   "მარკ.",                        q3_biz_hr:    "HR",
  q3_biz_start: "სტარტ.",                       q3_biz_pm:    "პრ.მართ.",
  q3_crt_adv:   "ადვ.",                          q3_crt_crim:  "კრ.სამ.",
  q3_crt_hr:    "ად.უფლ.",                      q3_crt_lit:   "სასამ.პრ.",
  q3_crt_med:   "მედ./მოლ.",                   q3_crt_crin:  "კრიმ.",
  q3_st_pub:    "საჯ.მმ.",                      q3_st_dipl:   "დიპლ.",
  q3_st_pol:    "პ.ანალ.",                       q3_st_sec:    "უს.",
  q3_st_gov:    "სახ.მ.",                        q3_st_reg:    "რეგ.კვ.",
  q3_mda_journ: "ჟურნ.",                        q3_mda_pr:    "PR/ბრ.კომ.",
  q3_mda_soc:   "სოც.მედ.",                     q3_mda_tv:    "ტელ./პრ.",
  q3_mda_strat: "კონტ.სტ.",                     q3_mda_adv:   "რეკ.",
  q3_dig_ux:    "UI/UX დიზ.",                   q3_dig_web:   "ვებ დიზ.",
  q3_dig_prod:  "პრ.დიზ.",                      q3_dig_game:  "თ.ინტ.",
  q3_dig_mob:   "მობ.დიზ.",                     q3_dig_int:   "Creat.Cod.",
  q3_bld_arch:  "არქ.",                          q3_bld_int:   "ინტ.დიზ.",
  q3_bld_urb:   "ურბ.დ.",                        q3_bld_land:  "ლ.დიზ.",
  q3_bld_sust:  "მდგ.სივ.",                     q3_bld_viz:   "3D ვიზ.",
  q3_gfx_brand: "ბრენდ.",                        q3_gfx_illus: "ილ.",
  q3_gfx_mot:   "მოშ.დ.",                        q3_gfx_adv:   "სარ.ვ.",
  q3_gfx_pack:  "შ.დ.",                          q3_gfx_dart:  "ც.არტ.",
  q3_film_dir:  "რეჟ.",                           q3_film_edit: "ვ.მ.",
  q3_film_cin:  "ოპ.",                            q3_film_photo:"ფოტ.",
  q3_film_doc:  "დოკ.მ.",                        q3_film_cont: "კ.კ.",
  q3_fsh_des:   "ტ.დ.",                           q3_fsh_text:  "ტექ.დ.",
  q3_fsh_styl:  "სტ.",                            q3_fsh_biz:   "მოდ.ბ.",
  q3_fsh_acc:   "აქ.",                             q3_fsh_med:   "მ.მ.",
  q3_mus_perf:  "შეს.",                            q3_mus_comp:  "კომ.",
  q3_mus_prod:  "მ.პ.",                            q3_mus_sound: "ს.დ.",
  q3_mus_theo:  "თ.",                              q3_mus_media: "კ./გ.ა.",
  q3_thea_act:  "მსახ.",                          q3_thea_dir:  "თ.რ.",
  q3_thea_scen: "სც.",                             q3_thea_chor: "ქ.",
  q3_thea_prod: "თ.პ.",                            q3_thea_perf: "პ.ა.",
  q3_fac_mech:  "მ.მ.",                            q3_fac_elec:  "ელ.სისტ.",
  q3_fac_auto:  "ავტ.",                            q3_fac_ind:   "საწ.პრ.",
  q3_fac_serv:  "ტ.სერვ.",                        q3_fac_rob:   "რ.",
  q3_con_civil: "შ.კ.",                            q3_con_arch:  "არქ.დ.",
  q3_con_road:  "გ.ინფ.",                          q3_con_mgmt:  "სამ.მ.",
  q3_con_urb:   "ურბ.პ.",                          q3_con_env:   "გ.ინჟ.",
  q3_pna_vet:   "ვეტ.",                            q3_pna_agro:  "აგრ.",
  q3_pna_env:   "გ.დ.",                            q3_pna_for:   "სატ.",
  q3_pna_anim:  "ც.მ.",                            q3_pna_ecol:  "ეკ.",
  q3_spo_sci:   "სპ.მეც.",                         q3_spo_coach: "მწვ.",
  q3_spo_med:   "სპ.მედ.",                         q3_spo_physio:"ფ.თ.",
  q3_spo_mgmt:  "სპ.მართ.",                        q3_spo_fit:   "ფ.ი.",
  q3_trv_tour:  "ტ.",                               q3_trv_geo:   "გეოლ.",
  q3_trv_geog:  "გეოგ.",                           q3_trv_hosp:  "სასტ.",
  q3_trv_env:   "გ.კვ.",                            q3_trv_cult:  "კ.ტ.",
  q3_mil_mil:   "სამ.სამს.",                       q3_mil_crim:  "კ.",
  q3_mil_sec:   "უ.მ.",                             q3_mil_cyber: "კ.უ.",
  q3_mil_emerg: "სიტ.",                             q3_mil_intel: "დ.ა.",
}

const SKILL_LABELS: Record<string, string> = {
  logic:"ლოგ.აზრ.", math:"მათ.", exact_sci:"ზ.მეცნ.",
  programming:"პროგ.", writing:"წ.", analysis:"ანალ.",
  lang:"უ.ენ.", communication:"კომ.", leadership:"ლიდ.",
  organizing:"ორგ.", creativity:"შემ.", visual_art:"ხ.ხ.",
  music:"მუს.", hands_tech:"ხ.მ.+ტ.ი.", helping:"დახ.",
  sales:"გ.", research:"კ.", sports:"სპ.",
  fast_learning:"სწ.სწ.", presentation:"პ.",
}

const WL_LABELS: Record<string, string> = {
  wl_stable:"სტაბ.", wl_highpay:"მ.შემ.", wl_creative:"კრ.",
  wl_people:"ადამ.", wl_research:"კვლ.", wl_active:"აქტ.",
  wl_leadership:"ლიდ.", wl_independent:"დ.მ.", wl_intl:"საერ.",
  wl_helping:"დახ.",
}

const NEG_LABELS: Record<string, string> = {
  neg_study:"სწ.", neg_stress:"სტ.", neg_people:"ად.",
  neg_office:"ოფ.", neg_physical:"ფ.", neg_routine:"რ.",
  neg_public:"საჯ.", neg_compete:"კ.", neg_tech:"ტ.",
  neg_emotional:"ემ.", neg_strict:"მ.", neg_unpred:"ა.გ.",
}

const ALL_LABELS: Record<string, string> = {
  ...Q3_LABELS, ...SKILL_LABELS, ...WL_LABELS, ...NEG_LABELS,
}

function getType(key: string): string {
  if (key.startsWith("q3_"))  return "Q3"
  if (key.startsWith("wl_"))  return "Q4-worklife"
  if (key.startsWith("neg_")) return "Q5-negative"
  return "Q1-skill"
}

const rows: Row[] = []
for (const [key, families] of Object.entries(SCORES)) {
  for (const [fam, pts] of Object.entries(families)) {
    if (pts === undefined) continue
    rows.push({
      answer_type:  getType(key),
      answer_key:   key,
      answer_label: ALL_LABELS[key] ?? key,
      family_id:    fam,
      points:       pts as number,
    })
  }
}

rows.sort((a, b) => {
  const order = ["Q3", "Q1-skill", "Q4-worklife", "Q5-negative"]
  const ta = order.indexOf(a.answer_type)
  const tb = order.indexOf(b.answer_type)
  if (ta !== tb) return ta - tb
  if (a.answer_key !== b.answer_key) return a.answer_key.localeCompare(b.answer_key)
  return b.points - a.points
})

const header = "answer_type,answer_key,answer_label,family_id,points"
const lines  = rows.map(r =>
  `${r.answer_type},${r.answer_key},${r.answer_label},${r.family_id},${r.points}`
)

const csv = [header, ...lines].join("\n")
const out = join(process.cwd(), "data_structured", "quiz-v2-scores.csv")
writeFileSync(out, csv, "utf8")
console.log(`✅  ${rows.length} rows → ${out}`)
