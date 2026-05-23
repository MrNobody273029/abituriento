import { writeFileSync } from "fs"
import { join } from "path"
import {
  computeFamilyScores,
  topFamilies,
  FAMILY_NAME_KA,
  type FamilyId,
} from "../lib/quiz-v2-scoring"

const THEORETICAL_MAX = 515

const Q3_KA: Record<string, string> = {
  q3_cs_apps:"IT-პროგ./აპლ.", q3_cs_web:"IT-ვებ/UI", q3_cs_data:"IT-მონაც./AI",
  q3_cs_sec:"IT-კიბერ.", q3_cs_robots:"IT-რობ.", q3_cs_biz:"IT-ბიზ.+ტექ.",
  q3_eng_civil:"ინჟ-შენ.", q3_eng_mech:"ინჟ-მექ.", q3_eng_elec:"ინჟ-ელ.",
  q3_eng_ind:"ინჟ-ინდ.", q3_eng_env:"ინჟ-გარ.", q3_eng_mecha:"ინჟ-მეხ.",
  q3_h_med:"ჯანდ-დიაგ.", q3_h_pharm:"ჯანდ-ფარმ.", q3_h_lab:"ჯანდ-ლაბ.",
  q3_h_physio:"ჯანდ-ფიზ.", q3_h_dent:"ჯანდ-სტომ.", q3_h_nutr:"ჯანდ-კვება.",
  q3_nat_bio:"ბუნ-ბიოლ.", q3_nat_chem:"ბუნ-ქიმ.", q3_nat_phys:"ბუნ-ფიზ.",
  q3_nat_env:"ბუნ-გარ.", q3_nat_gen:"ბუნ-გენ.", q3_nat_geo:"ბუნ-გეოლ.",
  q3_eco_fin:"ეკ-ფინ.", q3_eco_mgmt:"ეკ-მართ.", q3_eco_mkt:"ეკ-მარკ.",
  q3_eco_intl:"ეკ-საერთ.", q3_eco_anl:"ეკ-ანალ.", q3_eco_ent:"ეკ-სტარტ.",
  q3_data_stat:"DATA-სტატ.", q3_data_ai:"DATA-AI", q3_data_biz:"DATA-ბიზ.",
  q3_data_fin:"DATA-ფინ.", q3_data_res:"DATA-კვლ.", q3_data_algo:"DATA-ალგ.",
  q3_txt_journ:"ტექ-ჟურნ.", q3_txt_lit:"ტექ-ლიტ.", q3_txt_trans:"ტექ-თარგ.",
  q3_txt_cont:"ტექ-კონტ.", q3_txt_edit:"ტექ-რედ.", q3_txt_crw:"ტექ-კრ.წ.",
  q3_his_hist:"ისტ-ისტ.", q3_his_arch:"ისტ-არქ.", q3_his_cult:"ისტ-კულტ.",
  q3_his_mus:"ისტ-მუზ.", q3_his_anthr:"ისტ-ანთ.", q3_his_relig:"ისტ-რელ.",
  q3_soc_intrel:"სოც-საერთ.", q3_soc_pol:"სოც-პოლ.", q3_soc_dipl:"სოც-დიპლ.",
  q3_soc_sec:"სოც-უსაფ.", q3_soc_sociol:"სოც-სოც.", q3_soc_pub:"სოც-საჯ.",
  q3_law_adv:"სამ-ადვ.", q3_law_hr:"სამ-ად.უფ.", q3_law_corp:"სამ-ბიზ.სამ.",
  q3_law_intl:"სამ-საერთ.", q3_law_crim:"სამ-კრიმ.", q3_law_const:"სამ-სახ.",
  q3_phi_eth:"ფილ-ეთ.", q3_phi_phi:"ფილ-ფილ.", q3_phi_relig:"ფილ-რელ.",
  q3_phi_log:"ფილ-ლოგ.", q3_phi_soc:"ფილ-საზ.", q3_phi_acad:"ფილ-აკად.",
  q3_edu_child:"სწ-ბავ.", q3_edu_lang:"სწ-ენ.", q3_edu_ling:"სწ-ლინგ.",
  q3_edu_appl:"სწ-გამ.ლ.", q3_edu_edpsy:"სწ-სასწ.ფს.", q3_edu_tech:"სწ-ტექ.",
  q3_med_gen:"მედ-ექ.", q3_med_psych:"მედ-ფს.", q3_med_emerg:"მედ-გად.",
  q3_med_ped:"მედ-ბავ.", q3_med_surg:"მედ-ქირ.", q3_med_pub:"მედ-საჯ.",
  q3_psy_ther:"ფს-თერ.", q3_psy_child:"ფს-ბ.ფს.", q3_psy_org:"ფს-ორგ.",
  q3_psy_beh:"ფს-ქც.", q3_psy_clin:"ფს-კლ.", q3_psy_soc:"ფს-სოც.",
  q3_ch_edu:"ბავ-სკ.", q3_ch_spec:"ბავ-სპეც.", q3_ch_youth:"ბავ-ახ.",
  q3_ch_mgmt:"ბავ-მართ.", q3_ch_psych:"ბავ-ფს.", q3_ch_inf:"ბავ-ინფ.",
  q3_biz_mgmt:"ბიზ-მართ.", q3_biz_sales:"ბიზ-გაყ.", q3_biz_mkt:"ბიზ-მარკ.",
  q3_biz_hr:"ბიზ-HR", q3_biz_start:"ბიზ-სტარტ.", q3_biz_pm:"ბიზ-PM",
  q3_crt_adv:"სას-ადვ.", q3_crt_crim:"სას-კრ.", q3_crt_hr:"სას-ად.უფ.",
  q3_crt_lit:"სას-პრ.", q3_crt_med:"სას-მოლ.", q3_crt_crin:"სას-კრიმ.",
  q3_st_pub:"სახ-საჯ.", q3_st_dipl:"სახ-დიპლ.", q3_st_pol:"სახ-ანალ.",
  q3_st_sec:"სახ-უს.", q3_st_gov:"სახ-მ.", q3_st_reg:"სახ-რეგ.",
  q3_mda_journ:"მდ-ჟურნ.", q3_mda_pr:"მდ-PR", q3_mda_soc:"მდ-სოც.",
  q3_mda_tv:"მდ-ტელ.", q3_mda_strat:"მდ-სტრ.", q3_mda_adv:"მდ-რეკ.",
  q3_dig_ux:"კრ-UI/UX", q3_dig_web:"კრ-ვებ.", q3_dig_prod:"კრ-პ.დ.",
  q3_dig_game:"კრ-თამ.", q3_dig_mob:"კრ-მობ.", q3_dig_int:"კრ-კრ.კოდ.",
  q3_bld_arch:"შენ-არქ.", q3_bld_int:"შენ-ინტ.", q3_bld_urb:"შენ-ურბ.",
  q3_bld_land:"შენ-ლდ.", q3_bld_sust:"შენ-მდგ.", q3_bld_viz:"შენ-3D",
  q3_gfx_brand:"გრ-ბრ.", q3_gfx_illus:"გრ-ილ.", q3_gfx_mot:"გრ-მოშ.",
  q3_gfx_adv:"გრ-სარ.", q3_gfx_pack:"გრ-შ.დ.", q3_gfx_dart:"გრ-ც.არ.",
  q3_film_dir:"კინ-რეჟ.", q3_film_edit:"კინ-მ.", q3_film_cin:"კინ-ოპ.",
  q3_film_photo:"კინ-ფოტ.", q3_film_doc:"კინ-დოკ.", q3_film_cont:"კინ-კ.",
  q3_fsh_des:"მოდ-დ.", q3_fsh_text:"მოდ-ტ.", q3_fsh_styl:"მოდ-სტ.",
  q3_fsh_biz:"მოდ-ბ.", q3_fsh_acc:"მოდ-აქ.", q3_fsh_med:"მოდ-მ.",
  q3_mus_perf:"მუს-შ.", q3_mus_comp:"მუს-კ.", q3_mus_prod:"მუს-პ.",
  q3_mus_sound:"მუს-ს.", q3_mus_theo:"მუს-თ.", q3_mus_media:"მუს-მ.",
  q3_thea_act:"თ-მს.", q3_thea_dir:"თ-რეჟ.", q3_thea_scen:"თ-სც.",
  q3_thea_chor:"თ-ქ.", q3_thea_prod:"თ-პ.", q3_thea_perf:"თ-შ.",
  q3_fac_mech:"ქარ-მ.", q3_fac_elec:"ქარ-ელ.", q3_fac_auto:"ქარ-ავტ.",
  q3_fac_ind:"ქარ-ინდ.", q3_fac_serv:"ქარ-სერვ.", q3_fac_rob:"ქარ-რობ.",
  q3_con_civil:"მშ-შ.", q3_con_arch:"მშ-არქ.", q3_con_road:"მშ-გ.",
  q3_con_mgmt:"მშ-მ.", q3_con_urb:"მშ-ურბ.", q3_con_env:"მშ-გ.ინჟ.",
  q3_pna_vet:"ბუნ-ვეტ.", q3_pna_agro:"ბუნ-აგრ.", q3_pna_env:"ბუნ-გ.დ.",
  q3_pna_for:"ბუნ-ტყ.", q3_pna_anim:"ბუნ-ც.მ.", q3_pna_ecol:"ბუნ-ეკ.",
  q3_spo_sci:"სპ-მეც.", q3_spo_coach:"სპ-მწვ.", q3_spo_med:"სპ-მედ.",
  q3_spo_physio:"სპ-ფ.თ.", q3_spo_mgmt:"სპ-მართ.", q3_spo_fit:"სპ-ფ.ი.",
  q3_trv_tour:"ტ-ტ.", q3_trv_geo:"ტ-გეოლ.", q3_trv_geog:"ტ-გეოგ.",
  q3_trv_hosp:"ტ-სასტ.", q3_trv_env:"ტ-გ.კ.", q3_trv_cult:"ტ-კ.ტ.",
  q3_mil_mil:"სამ-სამს.", q3_mil_crim:"სამ-კ.", q3_mil_sec:"სამ-უ.მ.",
  q3_mil_cyber:"სამ-კ.უ.", q3_mil_emerg:"სამ-გ.", q3_mil_intel:"სამ-ი.ა.",
}

const SKILL_KA: Record<string, string> = {
  logic:"ლოგ.", math:"მათ.", exact_sci:"ზ.მეცნ.", programming:"პროგ.",
  writing:"წ.", analysis:"ანალ.", lang:"ენ.", communication:"კომ.",
  leadership:"ლიდ.", organizing:"ორგ.", creativity:"შემ.", visual_art:"ხ.ხ.",
  music:"მუს.", hands_tech:"ხ.+ტ.", helping:"დახ.", sales:"გაყ.",
  research:"კვლ.", sports:"სპ.", fast_learning:"სწ.სწ.", presentation:"პრეზ.",
}

const WL_KA: Record<string, string> = {
  wl_stable:"სტაბ.", wl_highpay:"მ.ხ.", wl_creative:"კრეატ.",
  wl_people:"ადამ.", wl_research:"კვლ.", wl_active:"აქტ.",
  wl_leadership:"ლიდ.", wl_independent:"დ.მ.", wl_intl:"საერთ.",
  wl_helping:"დახ.",
}

const NEG_KA: Record<string, string> = {
  neg_study:"ხ.სწ.", neg_stress:"სტრ.", neg_people:"ად.კ.",
  neg_office:"ოფ.", neg_physical:"ფიზ.", neg_routine:"რუტ.",
  neg_public:"საჯ.", neg_compete:"კონ.", neg_tech:"ტექ.",
  neg_emotional:"ემ.", neg_strict:"მკ.წ.", neg_unpred:"გ.გ.",
}

type Scenario = {
  label: string
  skills: string[]
  q3: string
  worklife: string[]
  negfilter: string[]
}

const SCENARIOS: Scenario[] = [
  // ── SOFTWARE (12) ─────────────────────────────────────────────────────────
  { label:"001 — Software (Apps+Logic)",    skills:["logic","programming","math"],            q3:"q3_cs_apps",    worklife:["wl_highpay","wl_independent"], negfilter:["neg_people"] },
  { label:"002 — Software (Web+Creative)",  skills:["creativity","programming","visual_art"], q3:"q3_cs_web",     worklife:["wl_creative","wl_independent"],negfilter:[] },
  { label:"003 — Software (Web Design)",    skills:["creativity","programming","visual_art"], q3:"q3_dig_web",    worklife:["wl_creative","wl_highpay"],    negfilter:["neg_routine"] },
  { label:"004 — Software (Mobile)",        skills:["programming","creativity","visual_art"], q3:"q3_dig_mob",    worklife:["wl_highpay","wl_independent"], negfilter:[] },
  { label:"005 — Software (Algorithms)",    skills:["math","logic","programming"],            q3:"q3_data_algo",  worklife:["wl_independent","wl_highpay"], negfilter:["neg_people"] },
  { label:"006 — Software (Automation)",    skills:["programming","hands_tech","logic"],      q3:"q3_fac_auto",   worklife:["wl_highpay","wl_stable"],      negfilter:[] },
  { label:"007 — Software (Creative Cod)",  skills:["creativity","programming","visual_art"], q3:"q3_dig_int",    worklife:["wl_creative","wl_independent"],negfilter:["neg_routine"] },
  { label:"008 — Software (Game Dev)",      skills:["creativity","programming","visual_art"], q3:"q3_dig_game",   worklife:["wl_creative","wl_independent"],negfilter:["neg_routine"] },
  { label:"009 — Software (Prod Design)",   skills:["creativity","visual_art","programming"], q3:"q3_dig_prod",   worklife:["wl_creative","wl_highpay"],    negfilter:[] },
  { label:"010 — Software (+Org)",          skills:["organizing","programming","logic"],      q3:"q3_cs_apps",    worklife:["wl_stable","wl_highpay"],      negfilter:[] },
  { label:"011 — Software (+Research)",     skills:["research","programming","analysis"],     q3:"q3_cs_apps",    worklife:["wl_research","wl_independent"],negfilter:["neg_people"] },
  { label:"012 — Software (FastLearner)",   skills:["programming","fast_learning","math"],    q3:"q3_cs_apps",    worklife:["wl_highpay","wl_independent"], negfilter:[] },

  // ── CYBERSEC (8) ──────────────────────────────────────────────────────────
  { label:"013 — Cybersec (IT)",            skills:["logic","programming","analysis"],        q3:"q3_cs_sec",     worklife:["wl_highpay","wl_independent"], negfilter:["neg_people"] },
  { label:"014 — Cybersec (Military)",      skills:["logic","programming","fast_learning"],   q3:"q3_mil_cyber",  worklife:["wl_independent","wl_highpay"], negfilter:[] },
  { label:"015 — Cybersec (State Sec)",     skills:["analysis","logic","research"],           q3:"q3_st_sec",     worklife:["wl_stable","wl_highpay"],      negfilter:[] },
  { label:"016 — Cybersec (Intel)",         skills:["analysis","writing","research"],         q3:"q3_mil_intel",  worklife:["wl_independent","wl_stable"],  negfilter:[] },
  { label:"017 — Cybersec (Research)",      skills:["research","logic","programming"],        q3:"q3_cs_sec",     worklife:["wl_research","wl_independent"],negfilter:["neg_people"] },
  { label:"018 — Cybersec (FastLearner)",   skills:["fast_learning","logic","programming"],   q3:"q3_cs_sec",     worklife:["wl_highpay","wl_stable"],      negfilter:["neg_people"] },
  { label:"019 — Cybersec (Mil+Stable)",    skills:["analysis","logic","organizing"],         q3:"q3_mil_cyber",  worklife:["wl_stable","wl_highpay"],      negfilter:[] },
  { label:"020 — Cybersec (IntlSec)",       skills:["analysis","writing","logic"],            q3:"q3_soc_sec",    worklife:["wl_stable","wl_independent"],  negfilter:[] },

  // ── DATA / AI (10) ────────────────────────────────────────────────────────
  { label:"021 — Data/AI (Core)",           skills:["math","logic","programming"],            q3:"q3_data_ai",    worklife:["wl_independent","wl_highpay"], negfilter:[] },
  { label:"022 — Data/AI (Stats)",          skills:["math","analysis","research"],            q3:"q3_data_stat",  worklife:["wl_research","wl_independent"],negfilter:[] },
  { label:"023 — Data/AI (BizAnal)",        skills:["analysis","math","organizing"],          q3:"q3_data_biz",   worklife:["wl_highpay","wl_independent"], negfilter:[] },
  { label:"024 — Data/AI (FinModel)",       skills:["math","analysis","logic"],               q3:"q3_data_fin",   worklife:["wl_highpay","wl_stable"],      negfilter:[] },
  { label:"025 — Data/AI (AcadRes)",        skills:["research","analysis","math"],            q3:"q3_data_res",   worklife:["wl_research","wl_independent"],negfilter:["neg_people"] },
  { label:"026 — Data/AI (Algorithms2)",    skills:["math","logic","programming"],            q3:"q3_data_algo",  worklife:["wl_independent","wl_highpay"], negfilter:["neg_people"] },
  { label:"027 — Data/AI (EconAnal)",       skills:["analysis","math","logic"],               q3:"q3_eco_anl",    worklife:["wl_highpay","wl_stable"],      negfilter:[] },
  { label:"028 — Data/AI (Physics→Data)",   skills:["math","exact_sci","research"],           q3:"q3_nat_phys",   worklife:["wl_research","wl_independent"],negfilter:["neg_people"] },
  { label:"029 — Data/AI (+Research)",      skills:["research","math","analysis"],            q3:"q3_data_ai",    worklife:["wl_research","wl_independent"],negfilter:["neg_people"] },
  { label:"030 — Data/AI (+Highpay)",       skills:["programming","math","analysis"],         q3:"q3_data_ai",    worklife:["wl_highpay","wl_independent"], negfilter:[] },

  // ── INFO SYS (8) ──────────────────────────────────────────────────────────
  { label:"031 — InfoSys (BIS core)",       skills:["organizing","logic","fast_learning"],    q3:"q3_cs_biz",     worklife:["wl_stable","wl_highpay"],      negfilter:[] },
  { label:"032 — InfoSys (ProjMgmt)",       skills:["organizing","logic","communication"],    q3:"q3_biz_pm",     worklife:["wl_stable","wl_people"],       negfilter:[] },
  { label:"033 — InfoSys (IntlBiz)",        skills:["lang","communication","organizing"],     q3:"q3_eco_intl",   worklife:["wl_intl","wl_stable"],         negfilter:[] },
  { label:"034 — InfoSys (IndProcess)",     skills:["organizing","logic","hands_tech"],       q3:"q3_fac_ind",    worklife:["wl_stable","wl_highpay"],      negfilter:[] },
  { label:"035 — InfoSys (+Analysis)",      skills:["analysis","organizing","programming"],   q3:"q3_cs_biz",     worklife:["wl_highpay","wl_stable"],      negfilter:["neg_people"] },
  { label:"036 — InfoSys (Leadership)",     skills:["leadership","organizing","analysis"],    q3:"q3_biz_pm",     worklife:["wl_leadership","wl_stable"],   negfilter:[] },
  { label:"037 — InfoSys (Tech+Biz)",       skills:["programming","organizing","logic"],      q3:"q3_cs_biz",     worklife:["wl_stable","wl_highpay"],      negfilter:[] },
  { label:"038 — InfoSys (FastLearner)",    skills:["fast_learning","organizing","communication"],q3:"q3_cs_biz", worklife:["wl_stable","wl_people"],       negfilter:[] },

  // ── ROBOTICS (12) ─────────────────────────────────────────────────────────
  { label:"039 — Robotics (CS path)",       skills:["programming","math","hands_tech"],       q3:"q3_cs_robots",  worklife:["wl_highpay","wl_independent"], negfilter:[] },
  { label:"040 — Robotics (Mechatronics)",  skills:["math","hands_tech","logic"],             q3:"q3_eng_mecha",  worklife:["wl_highpay","wl_stable"],      negfilter:[] },
  { label:"041 — Robotics (FactoryRob)",    skills:["hands_tech","programming","math"],       q3:"q3_fac_rob",    worklife:["wl_highpay","wl_stable"],      negfilter:[] },
  { label:"042 — Robotics (Mech+Elec)",     skills:["hands_tech","math","logic"],             q3:"q3_fac_mech",   worklife:["wl_stable","wl_highpay"],      negfilter:[] },
  { label:"043 — Robotics (ElecSys)",       skills:["hands_tech","math","logic"],             q3:"q3_fac_elec",   worklife:["wl_stable","wl_highpay"],      negfilter:["neg_people"] },
  { label:"044 — Robotics (no people)",     skills:["math","programming","exact_sci"],        q3:"q3_cs_robots",  worklife:["wl_highpay","wl_independent"], negfilter:["neg_people"] },
  { label:"045 — Robotics (Mechatron2)",    skills:["programming","hands_tech","exact_sci"],  q3:"q3_eng_mecha",  worklife:["wl_highpay","wl_stable"],      negfilter:[] },
  { label:"046 — Robotics (Factory2)",      skills:["programming","hands_tech","logic"],      q3:"q3_fac_auto",   worklife:["wl_highpay","wl_stable"],      negfilter:[] },
  { label:"047 — Robotics (StablePath)",    skills:["math","hands_tech","organizing"],        q3:"q3_cs_robots",  worklife:["wl_stable","wl_highpay"],      negfilter:[] },
  { label:"048 — Robotics (IndWorker)",     skills:["programming","math","analysis"],         q3:"q3_cs_robots",  worklife:["wl_independent","wl_highpay"], negfilter:["neg_people"] },
  { label:"049 — Robotics (+Research)",     skills:["research","math","hands_tech"],          q3:"q3_eng_mecha",  worklife:["wl_research","wl_highpay"],    negfilter:[] },
  { label:"050 — Robotics (FactElec)",      skills:["hands_tech","math","exact_sci"],         q3:"q3_fac_elec",   worklife:["wl_highpay","wl_stable"],      negfilter:[] },

  // ── CIVIL ENG (8) ─────────────────────────────────────────────────────────
  { label:"051 — CivilEng (Core)",          skills:["math","hands_tech","analysis"],          q3:"q3_eng_civil",  worklife:["wl_stable","wl_highpay"],      negfilter:["neg_people"] },
  { label:"052 — CivilEng (ConCivil)",      skills:["math","hands_tech","organizing"],        q3:"q3_con_civil",  worklife:["wl_stable","wl_highpay"],      negfilter:[] },
  { label:"053 — CivilEng (Roads)",         skills:["math","hands_tech","analysis"],          q3:"q3_con_road",   worklife:["wl_stable","wl_highpay"],      negfilter:[] },
  { label:"054 — CivilEng (Mgmt)",          skills:["organizing","leadership","math"],        q3:"q3_con_mgmt",   worklife:["wl_leadership","wl_stable"],   negfilter:[] },
  { label:"055 — CivilEng (UrbanPlan)",     skills:["creativity","analysis","hands_tech"],    q3:"q3_con_urb",    worklife:["wl_creative","wl_stable"],     negfilter:[] },
  { label:"056 — CivilEng (+ExactSci)",     skills:["exact_sci","math","hands_tech"],         q3:"q3_eng_civil",  worklife:["wl_stable","wl_highpay"],      negfilter:[] },
  { label:"057 — CivilEng (+Research)",     skills:["research","math","hands_tech"],          q3:"q3_eng_civil",  worklife:["wl_research","wl_stable"],     negfilter:[] },
  { label:"058 — CivilEng (AltPath)",       skills:["analysis","math","organizing"],          q3:"q3_eng_ind",    worklife:["wl_stable","wl_highpay"],      negfilter:[] },

  // ── MECH ENG (8) ──────────────────────────────────────────────────────────
  { label:"059 — MechEng (Core)",           skills:["math","hands_tech","logic"],             q3:"q3_eng_mech",   worklife:["wl_highpay","wl_stable"],      negfilter:[] },
  { label:"060 — MechEng (Factory)",        skills:["hands_tech","math","logic"],             q3:"q3_fac_mech",   worklife:["wl_stable","wl_highpay"],      negfilter:[] },
  { label:"061 — MechEng (TechServ)",       skills:["hands_tech","organizing","logic"],       q3:"q3_fac_serv",   worklife:["wl_stable","wl_highpay"],      negfilter:[] },
  { label:"062 — MechEng (IndProcess)",     skills:["organizing","hands_tech","analysis"],    q3:"q3_eng_ind",    worklife:["wl_stable","wl_highpay"],      negfilter:[] },
  { label:"063 — MechEng (Automation)",     skills:["programming","hands_tech","math"],       q3:"q3_fac_auto",   worklife:["wl_highpay","wl_stable"],      negfilter:[] },
  { label:"064 — MechEng (no people)",      skills:["math","hands_tech","exact_sci"],         q3:"q3_eng_mech",   worklife:["wl_highpay","wl_stable"],      negfilter:["neg_people"] },
  { label:"065 — MechEng (StablePath)",     skills:["logic","math","hands_tech"],             q3:"q3_eng_mech",   worklife:["wl_stable","wl_highpay"],      negfilter:[] },
  { label:"066 — MechEng (+Leadership)",    skills:["leadership","math","hands_tech"],        q3:"q3_con_mgmt",   worklife:["wl_leadership","wl_stable"],   negfilter:[] },

  // ── ELEC ENG (8) ──────────────────────────────────────────────────────────
  { label:"067 — ElecEng (Core)",           skills:["math","logic","hands_tech"],             q3:"q3_eng_elec",   worklife:["wl_highpay","wl_stable"],      negfilter:["neg_people"] },
  { label:"068 — ElecEng (Factory)",        skills:["hands_tech","math","logic"],             q3:"q3_fac_elec",   worklife:["wl_stable","wl_highpay"],      negfilter:[] },
  { label:"069 — ElecEng (Automation)",     skills:["programming","hands_tech","math"],       q3:"q3_fac_auto",   worklife:["wl_highpay","wl_stable"],      negfilter:["neg_people"] },
  { label:"070 — ElecEng (+Prog)",          skills:["math","programming","hands_tech"],       q3:"q3_eng_elec",   worklife:["wl_highpay","wl_independent"], negfilter:[] },
  { label:"071 — ElecEng (+ExactSci)",      skills:["hands_tech","math","exact_sci"],         q3:"q3_eng_elec",   worklife:["wl_stable","wl_highpay"],      negfilter:[] },
  { label:"072 — ElecEng (no people 2)",    skills:["math","logic","hands_tech"],             q3:"q3_fac_elec",   worklife:["wl_stable","wl_highpay"],      negfilter:["neg_people"] },
  { label:"073 — ElecEng (Research)",       skills:["research","math","hands_tech"],          q3:"q3_eng_elec",   worklife:["wl_research","wl_stable"],     negfilter:[] },
  { label:"074 — ElecEng (Stable+High)",    skills:["logic","math","exact_sci"],              q3:"q3_eng_elec",   worklife:["wl_highpay","wl_stable"],      negfilter:[] },

  // ── ENV ENG (8) ───────────────────────────────────────────────────────────
  { label:"075 — EnvEng (Core)",            skills:["exact_sci","research","hands_tech"],     q3:"q3_eng_env",    worklife:["wl_research","wl_active"],     negfilter:[] },
  { label:"076 — EnvEng (ConEnv)",          skills:["hands_tech","research","analysis"],      q3:"q3_con_env",    worklife:["wl_research","wl_active"],     negfilter:[] },
  { label:"077 — EnvEng (NaturePath)",      skills:["exact_sci","research","analysis"],       q3:"q3_pna_env",    worklife:["wl_research","wl_active"],     negfilter:[] },
  { label:"078 — EnvEng (NatEnv)",          skills:["research","exact_sci","analysis"],       q3:"q3_nat_env",    worklife:["wl_research","wl_independent"],negfilter:[] },
  { label:"079 — EnvEng (no people)",       skills:["exact_sci","research","analysis"],       q3:"q3_eng_env",    worklife:["wl_research","wl_active"],     negfilter:["neg_people"] },
  { label:"080 — EnvEng (Ecology)",         skills:["research","exact_sci","analysis"],       q3:"q3_pna_ecol",   worklife:["wl_research","wl_active"],     negfilter:[] },
  { label:"081 — EnvEng (+Active)",         skills:["exact_sci","hands_tech","research"],     q3:"q3_eng_env",    worklife:["wl_active","wl_research"],     negfilter:[] },
  { label:"082 — EnvEng (GeoEnv)",          skills:["research","exact_sci","writing"],        q3:"q3_trv_env",    worklife:["wl_research","wl_active"],     negfilter:[] },

  // ── ARCHITECTURE (8) ──────────────────────────────────────────────────────
  { label:"083 — Architecture (Core)",      skills:["creativity","visual_art","analysis"],    q3:"q3_bld_arch",   worklife:["wl_creative","wl_highpay"],    negfilter:[] },
  { label:"084 — Architecture (Interior)",  skills:["creativity","visual_art","organizing"],  q3:"q3_bld_int",    worklife:["wl_creative","wl_highpay"],    negfilter:[] },
  { label:"085 — Architecture (Urban)",     skills:["creativity","analysis","hands_tech"],    q3:"q3_bld_urb",    worklife:["wl_creative","wl_stable"],     negfilter:[] },
  { label:"086 — Architecture (Landscape)", skills:["creativity","visual_art","exact_sci"],   q3:"q3_bld_land",   worklife:["wl_creative","wl_research"],   negfilter:[] },
  { label:"087 — Architecture (Sustain)",   skills:["creativity","exact_sci","analysis"],     q3:"q3_bld_sust",   worklife:["wl_creative","wl_research"],   negfilter:["neg_routine"] },
  { label:"088 — Architecture (3D Viz)",    skills:["creativity","visual_art","programming"], q3:"q3_bld_viz",    worklife:["wl_creative","wl_independent"],negfilter:[] },
  { label:"089 — Architecture (ConArch)",   skills:["creativity","visual_art","organizing"],  q3:"q3_con_arch",   worklife:["wl_creative","wl_highpay"],    negfilter:[] },
  { label:"090 — Architecture (Highpay)",   skills:["creativity","visual_art","math"],        q3:"q3_bld_arch",   worklife:["wl_highpay","wl_creative"],    negfilter:[] },

  // ── MEDICINE (10) ─────────────────────────────────────────────────────────
  { label:"091 — Medicine (General)",       skills:["exact_sci","helping","research"],        q3:"q3_med_gen",    worklife:["wl_highpay","wl_people"],      negfilter:[] },
  { label:"092 — Medicine (Surgeon)",       skills:["exact_sci","hands_tech","logic"],        q3:"q3_med_surg",   worklife:["wl_highpay","wl_stable"],      negfilter:[] },
  { label:"093 — Medicine (Pediatrics)",    skills:["helping","exact_sci","communication"],   q3:"q3_med_ped",    worklife:["wl_people","wl_helping"],      negfilter:["neg_stress"] },
  { label:"094 — Medicine (Diagnosis)",     skills:["exact_sci","helping","analysis"],        q3:"q3_h_med",      worklife:["wl_highpay","wl_people"],      negfilter:[] },
  { label:"095 — Medicine (Emergency)",     skills:["exact_sci","hands_tech","helping"],      q3:"q3_med_emerg",  worklife:["wl_highpay","wl_people"],      negfilter:[] },
  { label:"096 — Medicine (+Research)",     skills:["exact_sci","research","analysis"],       q3:"q3_med_gen",    worklife:["wl_highpay","wl_research"],    negfilter:["neg_people"] },
  { label:"097 — Medicine (MentalPath)",    skills:["helping","analysis","writing"],          q3:"q3_med_psych",  worklife:["wl_people","wl_helping"],      negfilter:[] },
  { label:"098 — Medicine (+Helping)",      skills:["exact_sci","helping","communication"],   q3:"q3_med_ped",    worklife:["wl_people","wl_helping"],      negfilter:[] },
  { label:"099 — Medicine (AltHmed)",       skills:["exact_sci","helping","research"],        q3:"q3_h_med",      worklife:["wl_highpay","wl_stable"],      negfilter:[] },
  { label:"100 — Medicine (Surgeon2)",      skills:["exact_sci","leadership","hands_tech"],   q3:"q3_med_surg",   worklife:["wl_highpay","wl_leadership"],  negfilter:[] },

  // ── DENTISTRY (8) ─────────────────────────────────────────────────────────
  { label:"101 — Dentistry (Core)",         skills:["exact_sci","hands_tech","logic"],        q3:"q3_h_dent",     worklife:["wl_highpay","wl_stable"],      negfilter:["neg_stress"] },
  { label:"102 — Dentistry (+Visual)",      skills:["exact_sci","hands_tech","visual_art"],   q3:"q3_h_dent",     worklife:["wl_highpay","wl_stable"],      negfilter:[] },
  { label:"103 — Dentistry (+Analysis)",    skills:["hands_tech","exact_sci","analysis"],     q3:"q3_h_dent",     worklife:["wl_highpay","wl_stable"],      negfilter:["neg_stress"] },
  { label:"104 — Dentistry (+Creativity)",  skills:["exact_sci","hands_tech","creativity"],   q3:"q3_h_dent",     worklife:["wl_stable","wl_highpay"],      negfilter:[] },
  { label:"105 — Dentistry (no people)",    skills:["exact_sci","hands_tech","organizing"],   q3:"q3_h_dent",     worklife:["wl_highpay","wl_stable"],      negfilter:["neg_people"] },
  { label:"106 — Dentistry (+Research)",    skills:["hands_tech","exact_sci","research"],     q3:"q3_h_dent",     worklife:["wl_highpay","wl_stable"],      negfilter:[] },
  { label:"107 — Dentistry (+Math)",        skills:["exact_sci","math","hands_tech"],         q3:"q3_h_dent",     worklife:["wl_highpay","wl_stable"],      negfilter:["neg_stress"] },
  { label:"108 — Dentistry (StablePath)",   skills:["exact_sci","hands_tech","fast_learning"],q3:"q3_h_dent",     worklife:["wl_stable","wl_highpay"],      negfilter:[] },

  // ── PHARMACY (8) ──────────────────────────────────────────────────────────
  { label:"109 — Pharmacy (Core)",          skills:["exact_sci","research","logic"],          q3:"q3_h_pharm",    worklife:["wl_research","wl_stable"],     negfilter:[] },
  { label:"110 — Pharmacy (+Analysis)",     skills:["exact_sci","research","analysis"],       q3:"q3_h_pharm",    worklife:["wl_research","wl_independent"],negfilter:[] },
  { label:"111 — Pharmacy (+Writing)",      skills:["exact_sci","research","writing"],        q3:"q3_h_pharm",    worklife:["wl_research","wl_stable"],     negfilter:[] },
  { label:"112 — Pharmacy (no people)",     skills:["exact_sci","analysis","organizing"],     q3:"q3_h_pharm",    worklife:["wl_stable","wl_highpay"],      negfilter:["neg_people"] },
  { label:"113 — Pharmacy (+Math)",         skills:["research","exact_sci","math"],           q3:"q3_h_pharm",    worklife:["wl_research","wl_stable"],     negfilter:[] },
  { label:"114 — Pharmacy (FastLearner)",   skills:["exact_sci","research","fast_learning"],  q3:"q3_h_pharm",    worklife:["wl_research","wl_stable"],     negfilter:["neg_stress"] },
  { label:"115 — Pharmacy (NatSci path)",   skills:["exact_sci","research","analysis"],       q3:"q3_nat_chem",   worklife:["wl_research","wl_stable"],     negfilter:["neg_people"] },
  { label:"116 — Pharmacy (Highpay)",       skills:["exact_sci","research","logic"],          q3:"q3_h_pharm",    worklife:["wl_highpay","wl_stable"],      negfilter:[] },

  // ── PHYSIOTHERAPY (8) ─────────────────────────────────────────────────────
  { label:"117 — Physio (Core)",            skills:["helping","sports","hands_tech"],         q3:"q3_h_physio",   worklife:["wl_active","wl_helping"],      negfilter:["neg_office"] },
  { label:"118 — Physio (SportPath)",       skills:["sports","helping","hands_tech"],         q3:"q3_spo_physio", worklife:["wl_active","wl_helping"],      negfilter:["neg_office"] },
  { label:"119 — Physio (+Comm)",           skills:["helping","sports","communication"],      q3:"q3_h_physio",   worklife:["wl_active","wl_people"],       negfilter:["neg_office"] },
  { label:"120 — Physio (SpoPath2)",        skills:["helping","hands_tech","sports"],         q3:"q3_spo_physio", worklife:["wl_helping","wl_active"],      negfilter:[] },
  { label:"121 — Physio (+Research)",       skills:["helping","hands_tech","research"],       q3:"q3_h_physio",   worklife:["wl_active","wl_helping"],      negfilter:["neg_office"] },
  { label:"122 — Physio (+ExactSci)",       skills:["sports","helping","exact_sci"],          q3:"q3_spo_physio", worklife:["wl_active","wl_helping"],      negfilter:["neg_office"] },
  { label:"123 — Physio (no office)",       skills:["helping","hands_tech","organizing"],     q3:"q3_h_physio",   worklife:["wl_helping","wl_people"],      negfilter:["neg_office"] },
  { label:"124 — Physio (AltNutr)",         skills:["helping","research","exact_sci"],        q3:"q3_h_nutr",     worklife:["wl_active","wl_helping"],      negfilter:[] },

  // ── PUBLIC HEALTH (7) ─────────────────────────────────────────────────────
  { label:"125 — PubHealth (Core)",         skills:["research","helping","analysis"],         q3:"q3_med_pub",    worklife:["wl_stable","wl_helping"],      negfilter:[] },
  { label:"126 — PubHealth (Nutrition)",    skills:["helping","research","analysis"],         q3:"q3_h_nutr",     worklife:["wl_helping","wl_active"],      negfilter:[] },
  { label:"127 — PubHealth (+Comm)",        skills:["research","analysis","communication"],   q3:"q3_med_pub",    worklife:["wl_stable","wl_people"],       negfilter:[] },
  { label:"128 — PubHealth (Nutr+Exact)",   skills:["research","helping","exact_sci"],        q3:"q3_h_nutr",     worklife:["wl_active","wl_helping"],      negfilter:[] },
  { label:"129 — PubHealth (no people)",    skills:["analysis","research","writing"],         q3:"q3_med_pub",    worklife:["wl_research","wl_stable"],     negfilter:["neg_people"] },
  { label:"130 — PubHealth (OrgPath)",      skills:["helping","analysis","organizing"],       q3:"q3_med_pub",    worklife:["wl_stable","wl_helping"],      negfilter:[] },
  { label:"131 — PubHealth (Research)",     skills:["research","analysis","exact_sci"],       q3:"q3_med_pub",    worklife:["wl_research","wl_stable"],     negfilter:[] },

  // ── BIOMEDICAL (8) ────────────────────────────────────────────────────────
  { label:"132 — Biomedical (LabPath)",     skills:["research","exact_sci","analysis"],       q3:"q3_h_lab",      worklife:["wl_research","wl_independent"],negfilter:["neg_people"] },
  { label:"133 — Biomedical (Genetics)",    skills:["research","exact_sci","analysis"],       q3:"q3_nat_gen",    worklife:["wl_research","wl_independent"],negfilter:[] },
  { label:"134 — Biomedical (Biology)",     skills:["research","exact_sci","math"],           q3:"q3_nat_bio",    worklife:["wl_research","wl_independent"],negfilter:["neg_people"] },
  { label:"135 — Biomedical (Lab2)",        skills:["exact_sci","research","math"],           q3:"q3_h_lab",      worklife:["wl_research","wl_independent"],negfilter:["neg_people"] },
  { label:"136 — Biomedical (Chemistry)",   skills:["exact_sci","research","analysis"],       q3:"q3_nat_chem",   worklife:["wl_research","wl_independent"],negfilter:[] },
  { label:"137 — Biomedical (+Genetics2)",  skills:["exact_sci","research","analysis"],       q3:"q3_nat_gen",    worklife:["wl_research","wl_independent"],negfilter:["neg_people"] },
  { label:"138 — Biomedical (DataPath)",    skills:["research","analysis","math"],            q3:"q3_data_res",   worklife:["wl_research","wl_independent"],negfilter:["neg_people"] },
  { label:"139 — Biomedical (Microbiol)",   skills:["research","exact_sci","writing"],        q3:"q3_nat_gen",    worklife:["wl_research","wl_stable"],     negfilter:[] },

  // ── NURSING (7) ───────────────────────────────────────────────────────────
  { label:"140 — Nursing (Emergency)",      skills:["helping","organizing","communication"],  q3:"q3_med_emerg",  worklife:["wl_helping","wl_stable"],      negfilter:["neg_stress"] },
  { label:"141 — Nursing (+HandsTech)",     skills:["helping","organizing","hands_tech"],     q3:"q3_med_emerg",  worklife:["wl_helping","wl_stable"],      negfilter:[] },
  { label:"142 — Nursing (Pediatrics)",     skills:["helping","communication","organizing"],  q3:"q3_med_ped",    worklife:["wl_people","wl_helping"],      negfilter:["neg_stress"] },
  { label:"143 — Nursing (StableFocus)",    skills:["helping","communication","organizing"],  q3:"q3_med_emerg",  worklife:["wl_stable","wl_helping"],      negfilter:["neg_stress"] },
  { label:"144 — Nursing (PeopleFocus)",    skills:["helping","organizing","communication"],  q3:"q3_med_emerg",  worklife:["wl_helping","wl_people"],      negfilter:["neg_stress"] },
  { label:"145 — Nursing (+Research)",      skills:["helping","research","exact_sci"],        q3:"q3_med_pub",    worklife:["wl_helping","wl_stable"],      negfilter:[] },
  { label:"146 — Nursing (AltPath)",        skills:["helping","organizing","hands_tech"],     q3:"q3_med_emerg",  worklife:["wl_helping","wl_stable"],      negfilter:[] },

  // ── PSYCHOLOGY (10) ───────────────────────────────────────────────────────
  { label:"147 — Psychology (Therapy)",     skills:["helping","writing","analysis"],          q3:"q3_psy_ther",   worklife:["wl_people","wl_helping"],      negfilter:["neg_physical"] },
  { label:"148 — Psychology (Child)",       skills:["helping","analysis","communication"],    q3:"q3_psy_child",  worklife:["wl_people","wl_helping"],      negfilter:["neg_physical"] },
  { label:"149 — Psychology (OrgPsych)",    skills:["analysis","leadership","communication"], q3:"q3_psy_org",    worklife:["wl_people","wl_leadership"],   negfilter:[] },
  { label:"150 — Psychology (Behavioral)",  skills:["research","analysis","writing"],         q3:"q3_psy_beh",    worklife:["wl_research","wl_independent"],negfilter:[] },
  { label:"151 — Psychology (Clinical)",    skills:["helping","analysis","writing"],          q3:"q3_psy_clin",   worklife:["wl_helping","wl_people"],      negfilter:["neg_physical"] },
  { label:"152 — Psychology (Social)",      skills:["helping","communication","organizing"],  q3:"q3_psy_soc",    worklife:["wl_helping","wl_people"],      negfilter:[] },
  { label:"153 — Psychology (ChildPsych)",  skills:["helping","analysis","organizing"],       q3:"q3_ch_psych",   worklife:["wl_people","wl_helping"],      negfilter:[] },
  { label:"154 — Psychology (MedPsych)",    skills:["helping","exact_sci","analysis"],        q3:"q3_med_psych",  worklife:["wl_people","wl_helping"],      negfilter:["neg_physical"] },
  { label:"155 — Psychology (+Research)",   skills:["helping","analysis","research"],         q3:"q3_psy_ther",   worklife:["wl_research","wl_helping"],    negfilter:[] },
  { label:"156 — Psychology (EduPsych)",    skills:["helping","analysis","organizing"],       q3:"q3_edu_edpsy",  worklife:["wl_people","wl_helping"],      negfilter:[] },

  // ── SOCIAL WORK (8) ───────────────────────────────────────────────────────
  { label:"157 — SocialWork (Social)",      skills:["helping","communication","organizing"],  q3:"q3_psy_soc",    worklife:["wl_helping","wl_people"],      negfilter:["neg_office"] },
  { label:"158 — SocialWork (Youth)",       skills:["helping","communication","creativity"],  q3:"q3_ch_youth",   worklife:["wl_people","wl_helping"],      negfilter:[] },
  { label:"159 — SocialWork (Sociology)",   skills:["research","writing","analysis"],         q3:"q3_soc_sociol", worklife:["wl_research","wl_independent"],negfilter:[] },
  { label:"160 — SocialWork (InfEduc)",     skills:["helping","communication","organizing"],  q3:"q3_ch_inf",     worklife:["wl_people","wl_helping"],      negfilter:[] },
  { label:"161 — SocialWork (Leadership)",  skills:["helping","organizing","leadership"],     q3:"q3_psy_soc",    worklife:["wl_helping","wl_leadership"],  negfilter:[] },
  { label:"162 — SocialWork (ChildEduc)",   skills:["helping","communication","organizing"],  q3:"q3_ch_edu",     worklife:["wl_people","wl_helping"],      negfilter:["neg_office"] },
  { label:"163 — SocialWork (+Analysis)",   skills:["helping","analysis","communication"],    q3:"q3_soc_sociol", worklife:["wl_people","wl_helping"],      negfilter:[] },
  { label:"164 — SocialWork (AltPath)",     skills:["helping","organizing","communication"],  q3:"q3_ch_youth",   worklife:["wl_helping","wl_stable"],      negfilter:[] },

  // ── LAW (10) ──────────────────────────────────────────────────────────────
  { label:"165 — Law (Advocate)",           skills:["writing","analysis","communication"],    q3:"q3_law_adv",    worklife:["wl_highpay","wl_leadership"],  negfilter:[] },
  { label:"166 — Law (Corporate)",          skills:["analysis","writing","logic"],            q3:"q3_law_corp",   worklife:["wl_highpay","wl_stable"],      negfilter:["neg_physical"] },
  { label:"167 — Law (Criminal)",           skills:["analysis","writing","logic"],            q3:"q3_law_crim",   worklife:["wl_stable","wl_highpay"],      negfilter:["neg_physical"] },
  { label:"168 — Law (HumanRights)",        skills:["writing","communication","helping"],     q3:"q3_law_hr",     worklife:["wl_leadership","wl_stable"],   negfilter:[] },
  { label:"169 — Law (Intl)",               skills:["lang","writing","analysis"],             q3:"q3_law_intl",   worklife:["wl_intl","wl_highpay"],        negfilter:[] },
  { label:"170 — Law (Constitutional)",     skills:["writing","analysis","research"],         q3:"q3_law_const",  worklife:["wl_stable","wl_research"],     negfilter:[] },
  { label:"171 — Law (Court)",              skills:["writing","analysis","communication"],    q3:"q3_crt_lit",    worklife:["wl_stable","wl_highpay"],      negfilter:[] },
  { label:"172 — Law (Mediation)",          skills:["communication","analysis","writing"],    q3:"q3_crt_med",    worklife:["wl_stable","wl_people"],       negfilter:[] },
  { label:"173 — Law (HRAdv)",              skills:["writing","communication","helping"],     q3:"q3_crt_hr",     worklife:["wl_leadership","wl_stable"],   negfilter:[] },
  { label:"174 — Law (Criminology2)",       skills:["analysis","research","writing"],         q3:"q3_crt_crin",   worklife:["wl_stable","wl_research"],     negfilter:["neg_physical"] },

  // ── BUSINESS MGMT (10) ────────────────────────────────────────────────────
  { label:"175 — Business (Manager)",       skills:["leadership","communication","organizing"],q3:"q3_eco_mgmt",  worklife:["wl_leadership","wl_highpay"],  negfilter:[] },
  { label:"176 — Business (Sales)",         skills:["sales","communication","leadership"],    q3:"q3_biz_sales",  worklife:["wl_people","wl_highpay"],      negfilter:[] },
  { label:"177 — Business (HRMgr)",         skills:["communication","leadership","organizing"],q3:"q3_biz_hr",   worklife:["wl_people","wl_stable"],       negfilter:["neg_physical"] },
  { label:"178 — Business (Startup)",       skills:["leadership","communication","sales"],    q3:"q3_biz_start",  worklife:["wl_leadership","wl_highpay"],  negfilter:[] },
  { label:"179 — Business (ProjMgmt)",      skills:["organizing","leadership","analysis"],    q3:"q3_biz_pm",     worklife:["wl_leadership","wl_stable"],   negfilter:[] },
  { label:"180 — Business (Entrepreneur)",  skills:["leadership","sales","creativity"],       q3:"q3_eco_ent",    worklife:["wl_leadership","wl_highpay"],  negfilter:[] },
  { label:"181 — Business (IntlBiz)",       skills:["lang","communication","organizing"],     q3:"q3_eco_intl",   worklife:["wl_intl","wl_highpay"],        negfilter:[] },
  { label:"182 — Business (Mgmt+Anal)",     skills:["analysis","organizing","leadership"],    q3:"q3_biz_mgmt",   worklife:["wl_leadership","wl_highpay"],  negfilter:[] },
  { label:"183 — Business (StablePath)",    skills:["communication","organizing","leadership"],q3:"q3_biz_mgmt",  worklife:["wl_stable","wl_people"],       negfilter:[] },
  { label:"184 — Business (PubAdmin)",      skills:["leadership","organizing","communication"],q3:"q3_st_pub",    worklife:["wl_leadership","wl_stable"],   negfilter:[] },

  // ── FINANCE (8) ───────────────────────────────────────────────────────────
  { label:"185 — Finance (Invest)",         skills:["math","analysis","logic"],               q3:"q3_eco_fin",    worklife:["wl_highpay","wl_leadership"],  negfilter:["neg_physical"] },
  { label:"186 — Finance (FinModel)",       skills:["math","analysis","logic"],               q3:"q3_data_fin",   worklife:["wl_highpay","wl_stable"],      negfilter:[] },
  { label:"187 — Finance (EconAnal)",       skills:["analysis","math","logic"],               q3:"q3_eco_anl",    worklife:["wl_highpay","wl_stable"],      negfilter:[] },
  { label:"188 — Finance (BizData)",        skills:["analysis","math","research"],            q3:"q3_data_biz",   worklife:["wl_highpay","wl_independent"], negfilter:[] },
  { label:"189 — Finance (no routine)",     skills:["math","analysis","leadership"],          q3:"q3_eco_fin",    worklife:["wl_highpay","wl_leadership"],  negfilter:["neg_routine"] },
  { label:"190 — Finance (Research)",       skills:["research","analysis","math"],            q3:"q3_data_fin",   worklife:["wl_research","wl_highpay"],    negfilter:[] },
  { label:"191 — Finance (+Writing)",       skills:["writing","analysis","math"],             q3:"q3_eco_fin",    worklife:["wl_stable","wl_highpay"],      negfilter:["neg_physical"] },
  { label:"192 — Finance (+Econ)",          skills:["math","logic","analysis"],               q3:"q3_eco_anl",    worklife:["wl_highpay","wl_independent"], negfilter:[] },

  // ── MARKETING (8) ─────────────────────────────────────────────────────────
  { label:"193 — Marketing (Core)",         skills:["creativity","communication","sales"],    q3:"q3_eco_mkt",    worklife:["wl_people","wl_creative"],     negfilter:["neg_routine"] },
  { label:"194 — Marketing (BizPath)",      skills:["creativity","communication","sales"],    q3:"q3_biz_mkt",    worklife:["wl_creative","wl_people"],     negfilter:["neg_routine"] },
  { label:"195 — Marketing (Advertising)",  skills:["creativity","communication","visual_art"],q3:"q3_mda_adv",   worklife:["wl_creative","wl_people"],     negfilter:["neg_routine"] },
  { label:"196 — Marketing (PR)",           skills:["communication","writing","creativity"],  q3:"q3_mda_pr",     worklife:["wl_people","wl_creative"],     negfilter:["neg_routine"] },
  { label:"197 — Marketing (Content)",      skills:["writing","creativity","communication"],  q3:"q3_mda_strat",  worklife:["wl_creative","wl_independent"],negfilter:["neg_routine"] },
  { label:"198 — Marketing (SocialMed)",    skills:["creativity","communication","presentation"],q3:"q3_mda_soc", worklife:["wl_creative","wl_people"],     negfilter:["neg_routine"] },
  { label:"199 — Marketing (+Analysis)",    skills:["analysis","communication","creativity"],  q3:"q3_eco_mkt",   worklife:["wl_highpay","wl_people"],      negfilter:[] },
  { label:"200 — Marketing (Tourism path)", skills:["communication","creativity","organizing"],q3:"q3_eco_mkt",   worklife:["wl_people","wl_intl"],         negfilter:["neg_routine"] },

  // ── INT'L REL (9) ─────────────────────────────────────────────────────────
  { label:"201 — IntlRel (Core)",           skills:["lang","communication","leadership"],     q3:"q3_soc_intrel", worklife:["wl_intl","wl_leadership"],     negfilter:[] },
  { label:"202 — IntlRel (Diplomat)",       skills:["lang","communication","writing"],        q3:"q3_soc_dipl",   worklife:["wl_intl","wl_leadership"],     negfilter:["neg_routine"] },
  { label:"203 — IntlRel (PolAnalyst)",     skills:["writing","analysis","communication"],    q3:"q3_soc_pol",    worklife:["wl_leadership","wl_intl"],     negfilter:[] },
  { label:"204 — IntlRel (PubAdmin)",       skills:["leadership","organizing","analysis"],    q3:"q3_st_pub",     worklife:["wl_leadership","wl_stable"],   negfilter:[] },
  { label:"205 — IntlRel (StateDipl)",      skills:["lang","leadership","communication"],     q3:"q3_st_dipl",    worklife:["wl_intl","wl_leadership"],     negfilter:[] },
  { label:"206 — IntlRel (PolAnalysis2)",   skills:["writing","analysis","research"],         q3:"q3_st_pol",     worklife:["wl_research","wl_intl"],       negfilter:[] },
  { label:"207 — IntlRel (Security)",       skills:["analysis","logic","writing"],            q3:"q3_mil_sec",    worklife:["wl_stable","wl_intl"],         negfilter:[] },
  { label:"208 — IntlRel (PubPolicy)",      skills:["analysis","writing","communication"],    q3:"q3_soc_pub",    worklife:["wl_leadership","wl_stable"],   negfilter:[] },
  { label:"209 — IntlRel (GovMgmt)",        skills:["organizing","leadership","analysis"],    q3:"q3_st_gov",     worklife:["wl_leadership","wl_stable"],   negfilter:[] },

  // ── EDUCATION (10) ────────────────────────────────────────────────────────
  { label:"210 — Education (Child)",        skills:["helping","creativity","communication"],  q3:"q3_ch_edu",     worklife:["wl_people","wl_stable"],       negfilter:["neg_office"] },
  { label:"211 — Education (EduChild)",     skills:["helping","communication","creativity"],  q3:"q3_edu_child",  worklife:["wl_people","wl_stable"],       negfilter:[] },
  { label:"212 — Education (SpecEduc)",     skills:["helping","communication","organizing"],  q3:"q3_ch_spec",    worklife:["wl_people","wl_helping"],      negfilter:[] },
  { label:"213 — Education (Mgmt)",         skills:["leadership","organizing","analysis"],    q3:"q3_ch_mgmt",    worklife:["wl_leadership","wl_stable"],   negfilter:[] },
  { label:"214 — Education (EdPsych)",      skills:["helping","analysis","organizing"],       q3:"q3_edu_edpsy",  worklife:["wl_people","wl_helping"],      negfilter:["neg_physical"] },
  { label:"215 — Education (EdTech)",       skills:["programming","organizing","communication"],q3:"q3_edu_tech", worklife:["wl_stable","wl_independent"],  negfilter:[] },
  { label:"216 — Education (LangTeach)",    skills:["lang","communication","helping"],        q3:"q3_edu_lang",   worklife:["wl_people","wl_stable"],       negfilter:[] },
  { label:"217 — Education (+Creativity)",  skills:["creativity","communication","helping"],  q3:"q3_ch_edu",     worklife:["wl_creative","wl_people"],     negfilter:[] },
  { label:"218 — Education (InfEduc)",      skills:["helping","organizing","communication"],  q3:"q3_ch_inf",     worklife:["wl_people","wl_stable"],       negfilter:[] },
  { label:"219 — Education (+Research)",    skills:["research","helping","analysis"],         q3:"q3_edu_child",  worklife:["wl_research","wl_stable"],     negfilter:[] },

  // ── HUMANITIES (10) ───────────────────────────────────────────────────────
  { label:"220 — Humanities (History)",     skills:["writing","research","analysis"],         q3:"q3_his_hist",   worklife:["wl_research","wl_independent"],negfilter:["neg_physical"] },
  { label:"221 — Humanities (Archaeol)",    skills:["research","analysis","hands_tech"],      q3:"q3_his_arch",   worklife:["wl_research","wl_active"],     negfilter:[] },
  { label:"222 — Humanities (CultHerit)",   skills:["writing","research","creativity"],       q3:"q3_his_cult",   worklife:["wl_research","wl_independent"],negfilter:[] },
  { label:"223 — Humanities (Museums)",     skills:["writing","research","visual_art"],       q3:"q3_his_mus",    worklife:["wl_research","wl_independent"],negfilter:[] },
  { label:"224 — Humanities (Anthropol)",   skills:["research","writing","analysis"],         q3:"q3_his_anthr",  worklife:["wl_research","wl_independent"],negfilter:[] },
  { label:"225 — Humanities (Religion)",    skills:["writing","research","analysis"],         q3:"q3_his_relig",  worklife:["wl_research","wl_independent"],negfilter:[] },
  { label:"226 — Humanities (Ethics)",      skills:["writing","analysis","research"],         q3:"q3_phi_eth",    worklife:["wl_research","wl_independent"],negfilter:["neg_physical"] },
  { label:"227 — Humanities (Philosophy)",  skills:["writing","analysis","research"],         q3:"q3_phi_phi",    worklife:["wl_research","wl_independent"],negfilter:["neg_physical"] },
  { label:"228 — Humanities (ReligStud)",   skills:["writing","research","analysis"],         q3:"q3_phi_relig",  worklife:["wl_research","wl_independent"],negfilter:[] },
  { label:"229 — Humanities (SocialIdea)",  skills:["writing","analysis","communication"],    q3:"q3_phi_soc",    worklife:["wl_research","wl_independent"],negfilter:["neg_physical"] },

  // ── JOURNALISM / MEDIA (8) ────────────────────────────────────────────────
  { label:"230 — Journalism (Core)",        skills:["writing","communication","creativity"],  q3:"q3_txt_journ",  worklife:["wl_people","wl_creative"],     negfilter:["neg_routine"] },
  { label:"231 — Journalism (Media)",       skills:["writing","communication","creativity"],  q3:"q3_mda_journ",  worklife:["wl_people","wl_creative"],     negfilter:["neg_routine"] },
  { label:"232 — Journalism (TV)",          skills:["communication","presentation","creativity"],q3:"q3_mda_tv",  worklife:["wl_creative","wl_people"],     negfilter:["neg_routine"] },
  { label:"233 — Journalism (Content)",     skills:["writing","creativity","communication"],  q3:"q3_txt_cont",   worklife:["wl_creative","wl_independent"],negfilter:["neg_routine"] },
  { label:"234 — Journalism (Editing)",     skills:["writing","analysis","creativity"],       q3:"q3_txt_edit",   worklife:["wl_independent","wl_creative"],negfilter:["neg_routine"] },
  { label:"235 — Journalism (CreativeW)",   skills:["writing","creativity","analysis"],       q3:"q3_txt_crw",    worklife:["wl_creative","wl_independent"],negfilter:["neg_routine"] },
  { label:"236 — Journalism (LitAnalys)",   skills:["writing","analysis","research"],         q3:"q3_txt_lit",    worklife:["wl_research","wl_independent"],negfilter:["neg_physical"] },
  { label:"237 — Journalism (+PRPath)",     skills:["communication","writing","creativity"],  q3:"q3_mda_pr",     worklife:["wl_people","wl_creative"],     negfilter:["neg_routine"] },

  // ── LANGUAGES (8) ─────────────────────────────────────────────────────────
  { label:"238 — Languages (Linguistics)",  skills:["lang","writing","analysis"],             q3:"q3_edu_ling",   worklife:["wl_intl","wl_research"],       negfilter:[] },
  { label:"239 — Languages (AppLing)",      skills:["lang","analysis","writing"],             q3:"q3_edu_appl",   worklife:["wl_intl","wl_research"],       negfilter:[] },
  { label:"240 — Languages (Translation)",  skills:["lang","writing","analysis"],             q3:"q3_txt_trans",  worklife:["wl_intl","wl_independent"],    negfilter:[] },
  { label:"241 — Languages (LangTeach)",    skills:["lang","communication","helping"],        q3:"q3_edu_lang",   worklife:["wl_people","wl_intl"],         negfilter:[] },
  { label:"242 — Languages (Diplomacy)",    skills:["lang","communication","writing"],        q3:"q3_soc_dipl",   worklife:["wl_intl","wl_leadership"],     negfilter:["neg_routine"] },
  { label:"243 — Languages (CultTour)",     skills:["lang","communication","organizing"],     q3:"q3_trv_cult",   worklife:["wl_intl","wl_people"],         negfilter:["neg_routine"] },
  { label:"244 — Languages (+Creative)",    skills:["lang","writing","creativity"],           q3:"q3_txt_trans",  worklife:["wl_creative","wl_intl"],       negfilter:[] },
  { label:"245 — Languages (IntlBiz)",      skills:["lang","organizing","communication"],     q3:"q3_eco_intl",   worklife:["wl_intl","wl_highpay"],        negfilter:[] },

  // ── NATURAL SCI (9) ───────────────────────────────────────────────────────
  { label:"246 — NaturalSci (Biology)",     skills:["research","exact_sci","analysis"],       q3:"q3_nat_bio",    worklife:["wl_research","wl_independent"],negfilter:["neg_people"] },
  { label:"247 — NaturalSci (Chemistry)",   skills:["exact_sci","research","analysis"],       q3:"q3_nat_chem",   worklife:["wl_research","wl_independent"],negfilter:[] },
  { label:"248 — NaturalSci (Physics)",     skills:["math","exact_sci","research"],           q3:"q3_nat_phys",   worklife:["wl_research","wl_independent"],negfilter:["neg_people"] },
  { label:"249 — NaturalSci (NatEnv)",      skills:["research","exact_sci","analysis"],       q3:"q3_nat_env",    worklife:["wl_research","wl_active"],     negfilter:[] },
  { label:"250 — NaturalSci (Genetics)",    skills:["research","exact_sci","analysis"],       q3:"q3_nat_gen",    worklife:["wl_research","wl_independent"],negfilter:["neg_people"] },
  { label:"251 — NaturalSci (Geography)",   skills:["research","exact_sci","analysis"],       q3:"q3_nat_geo",    worklife:["wl_research","wl_active"],     negfilter:[] },
  { label:"252 — NaturalSci (+Math)",       skills:["math","research","exact_sci"],           q3:"q3_nat_phys",   worklife:["wl_research","wl_independent"],negfilter:["neg_people"] },
  { label:"253 — NaturalSci (AcadPath)",    skills:["research","writing","analysis"],         q3:"q3_phi_acad",   worklife:["wl_research","wl_independent"],negfilter:["neg_physical"] },
  { label:"254 — NaturalSci (DataPath)",    skills:["research","analysis","exact_sci"],       q3:"q3_data_res",   worklife:["wl_research","wl_independent"],negfilter:["neg_people"] },

  // ── TOURISM (8) ───────────────────────────────────────────────────────────
  { label:"255 — Tourism (Manager)",        skills:["lang","communication","organizing"],     q3:"q3_trv_tour",   worklife:["wl_intl","wl_people"],         negfilter:["neg_routine"] },
  { label:"256 — Tourism (Hospitality)",    skills:["communication","organizing","helping"],  q3:"q3_trv_hosp",   worklife:["wl_people","wl_intl"],         negfilter:["neg_routine"] },
  { label:"257 — Tourism (EnvTour)",        skills:["research","exact_sci","communication"],  q3:"q3_trv_env",    worklife:["wl_active","wl_intl"],         negfilter:[] },
  { label:"258 — Tourism (CultTour)",       skills:["lang","communication","writing"],        q3:"q3_trv_cult",   worklife:["wl_intl","wl_people"],         negfilter:["neg_routine"] },
  { label:"259 — Tourism (GeoPath)",        skills:["research","analysis","exact_sci"],       q3:"q3_trv_geo",    worklife:["wl_research","wl_active"],     negfilter:[] },
  { label:"260 — Tourism (Geography)",      skills:["research","analysis","writing"],         q3:"q3_trv_geog",   worklife:["wl_research","wl_active"],     negfilter:[] },
  { label:"261 — Tourism (IntlFocus)",      skills:["lang","communication","leadership"],     q3:"q3_trv_tour",   worklife:["wl_intl","wl_leadership"],     negfilter:[] },
  { label:"262 — Tourism (HotelMgmt)",      skills:["organizing","leadership","communication"],q3:"q3_trv_hosp",  worklife:["wl_people","wl_stable"],       negfilter:[] },

  // ── SPORTS (8) ────────────────────────────────────────────────────────────
  { label:"263 — Sports (Coach)",           skills:["sports","leadership","communication"],   q3:"q3_spo_coach",  worklife:["wl_active","wl_people"],       negfilter:["neg_office"] },
  { label:"264 — Sports (SportsSci)",       skills:["sports","research","exact_sci"],         q3:"q3_spo_sci",    worklife:["wl_research","wl_active"],     negfilter:["neg_office"] },
  { label:"265 — Sports (FitnessInstr)",    skills:["sports","communication","helping"],      q3:"q3_spo_fit",    worklife:["wl_active","wl_people"],       negfilter:["neg_office"] },
  { label:"266 — Sports (Mgmt)",            skills:["organizing","leadership","communication"],q3:"q3_spo_mgmt",  worklife:["wl_leadership","wl_active"],   negfilter:[] },
  { label:"267 — Sports (MedPath)",         skills:["sports","helping","exact_sci"],          q3:"q3_spo_med",    worklife:["wl_active","wl_people"],       negfilter:["neg_office"] },
  { label:"268 — Sports (PhysioPath)",      skills:["sports","helping","hands_tech"],         q3:"q3_spo_physio", worklife:["wl_active","wl_helping"],      negfilter:["neg_office"] },
  { label:"269 — Sports (no office+rut)",   skills:["sports","leadership","helping"],         q3:"q3_spo_coach",  worklife:["wl_people","wl_active"],       negfilter:["neg_office","neg_routine"] },
  { label:"270 — Sports (SciResearch)",     skills:["research","sports","analysis"],          q3:"q3_spo_sci",    worklife:["wl_research","wl_active"],     negfilter:[] },

  // ── AGRICULTURE (8) ───────────────────────────────────────────────────────
  { label:"271 — Agri (Vet)",               skills:["exact_sci","hands_tech","research"],     q3:"q3_pna_vet",    worklife:["wl_active","wl_research"],     negfilter:["neg_office","neg_strict"] },
  { label:"272 — Agri (Agronomy)",          skills:["exact_sci","research","hands_tech"],     q3:"q3_pna_agro",   worklife:["wl_active","wl_research"],     negfilter:["neg_office"] },
  { label:"273 — Agri (Forestry)",          skills:["research","exact_sci","hands_tech"],     q3:"q3_pna_for",    worklife:["wl_active","wl_research"],     negfilter:["neg_office"] },
  { label:"274 — Agri (AnimalSci)",         skills:["exact_sci","hands_tech","helping"],      q3:"q3_pna_anim",   worklife:["wl_active","wl_people"],       negfilter:["neg_office"] },
  { label:"275 — Agri (Ecology)",           skills:["research","exact_sci","analysis"],       q3:"q3_pna_ecol",   worklife:["wl_research","wl_active"],     negfilter:[] },
  { label:"276 — Agri (NatProtect)",        skills:["research","exact_sci","hands_tech"],     q3:"q3_pna_env",    worklife:["wl_active","wl_research"],     negfilter:[] },
  { label:"277 — Agri (Vet2)",              skills:["hands_tech","exact_sci","helping"],      q3:"q3_pna_vet",    worklife:["wl_active","wl_research"],     negfilter:["neg_office"] },
  { label:"278 — Agri (AgroResearch)",      skills:["research","analysis","exact_sci"],       q3:"q3_pna_agro",   worklife:["wl_research","wl_active"],     negfilter:[] },

  // ── DESIGN / ARTS (10) ────────────────────────────────────────────────────
  { label:"279 — Design (UI/UX)",           skills:["creativity","visual_art","programming"], q3:"q3_dig_ux",     worklife:["wl_creative","wl_independent"],negfilter:["neg_routine"] },
  { label:"280 — Design (Graphic)",         skills:["creativity","visual_art","presentation"],q3:"q3_gfx_brand",  worklife:["wl_creative","wl_independent"],negfilter:["neg_routine"] },
  { label:"281 — Design (Illustration)",    skills:["creativity","visual_art","hands_tech"],  q3:"q3_gfx_illus",  worklife:["wl_creative","wl_independent"],negfilter:["neg_routine"] },
  { label:"282 — Design (Motion)",          skills:["creativity","visual_art","programming"], q3:"q3_gfx_mot",    worklife:["wl_creative","wl_independent"],negfilter:["neg_routine"] },
  { label:"283 — Design (Packaging)",       skills:["creativity","visual_art","organizing"],  q3:"q3_gfx_pack",   worklife:["wl_creative","wl_highpay"],    negfilter:["neg_routine"] },
  { label:"284 — Design (Fashion)",         skills:["creativity","visual_art","organizing"],  q3:"q3_fsh_des",    worklife:["wl_creative","wl_independent"],negfilter:["neg_routine"] },
  { label:"285 — Design (FashionStyl)",     skills:["creativity","visual_art","communication"],q3:"q3_fsh_styl",  worklife:["wl_creative","wl_people"],     negfilter:["neg_routine"] },
  { label:"286 — Design (Interior)",        skills:["creativity","visual_art","organizing"],  q3:"q3_bld_int",    worklife:["wl_creative","wl_highpay"],    negfilter:[] },
  { label:"287 — Design (Product)",         skills:["creativity","visual_art","hands_tech"],  q3:"q3_dig_prod",   worklife:["wl_creative","wl_highpay"],    negfilter:[] },
  { label:"288 — Design (DigitalArt)",      skills:["creativity","visual_art","logic"],       q3:"q3_gfx_dart",   worklife:["wl_creative","wl_independent"],negfilter:["neg_routine"] },

  // ── PERFORMING ARTS (10) ──────────────────────────────────────────────────
  { label:"289 — PerfArts (Musician)",      skills:["music","creativity","presentation"],     q3:"q3_mus_perf",   worklife:["wl_creative","wl_independent"],negfilter:["neg_routine","neg_office"] },
  { label:"290 — PerfArts (Composer)",      skills:["music","creativity","analysis"],         q3:"q3_mus_comp",   worklife:["wl_creative","wl_independent"],negfilter:["neg_routine"] },
  { label:"291 — PerfArts (MusicProd)",     skills:["music","creativity","programming"],      q3:"q3_mus_prod",   worklife:["wl_creative","wl_independent"],negfilter:["neg_routine"] },
  { label:"292 — PerfArts (SoundDes)",      skills:["music","creativity","hands_tech"],       q3:"q3_mus_sound",  worklife:["wl_creative","wl_independent"],negfilter:["neg_routine"] },
  { label:"293 — PerfArts (TheaterAct)",    skills:["creativity","presentation","communication"],q3:"q3_thea_act",worklife:["wl_creative","wl_people"],     negfilter:["neg_routine","neg_office"] },
  { label:"294 — PerfArts (TheaterDir)",    skills:["creativity","leadership","visual_art"],  q3:"q3_thea_dir",   worklife:["wl_creative","wl_leadership"], negfilter:["neg_routine"] },
  { label:"295 — PerfArts (FilmDir)",       skills:["creativity","visual_art","leadership"],  q3:"q3_film_dir",   worklife:["wl_creative","wl_independent"],negfilter:["neg_routine"] },
  { label:"296 — PerfArts (FilmEdit)",      skills:["creativity","visual_art","programming"], q3:"q3_film_edit",  worklife:["wl_creative","wl_independent"],negfilter:["neg_routine"] },
  { label:"297 — PerfArts (Photography)",   skills:["creativity","visual_art","hands_tech"],  q3:"q3_film_photo", worklife:["wl_creative","wl_independent"],negfilter:["neg_routine"] },
  { label:"298 — PerfArts (Dance/Chor)",    skills:["creativity","sports","music"],           q3:"q3_thea_chor",  worklife:["wl_creative","wl_active"],     negfilter:["neg_routine","neg_office"] },

  // ── EDGE / MIXED (2) ──────────────────────────────────────────────────────
  { label:"299 — Edge (Tech+Helping)",      skills:["programming","helping","communication"], q3:"q3_edu_tech",   worklife:["wl_stable","wl_people"],       negfilter:[] },
  { label:"300 — Edge (Research+Creative)", skills:["research","creativity","writing"],       q3:"q3_txt_lit",    worklife:["wl_research","wl_independent"],negfilter:["neg_physical"] },
]

function matchPct(score: number): number {
  return Math.min(97, Math.max(15, Math.round(score / THEORETICAL_MAX * 100)))
}

type ResultRow = {
  test_id: string
  q1_skills: string
  q3_answer: string
  q4_worklife: string
  q5_neg: string
  rec1: string; pct1: number
  rec2: string; pct2: number
  rec3: string; pct3: number
  rec4: string; pct4: number
  rec5: string; pct5: number
}

const results: ResultRow[] = []

for (const sc of SCENARIOS) {
  const scores = computeFamilyScores({ skills: sc.skills, q3: sc.q3, worklife: sc.worklife, negfilter: sc.negfilter })
  const top    = topFamilies(scores, 5) as FamilyId[]
  const get    = (i: number) => top[i] ? FAMILY_NAME_KA[top[i]] : "-"
  const pct    = (i: number) => top[i] ? matchPct(scores[top[i]]) : 0

  results.push({
    test_id:    sc.label,
    q1_skills:  sc.skills.map(s => SKILL_KA[s] ?? s).join("+"),
    q3_answer:  Q3_KA[sc.q3] ?? sc.q3,
    q4_worklife:sc.worklife.map(w => WL_KA[w] ?? w).join("+"),
    q5_neg:     sc.negfilter.map(n => NEG_KA[n] ?? n).join("+") || "-",
    rec1: get(0), pct1: pct(0),
    rec2: get(1), pct2: pct(1),
    rec3: get(2), pct3: pct(2),
    rec4: get(3), pct4: pct(3),
    rec5: get(4), pct5: pct(4),
  })
}

const header = ["test_id","q1_skills","q3_answer","q4_worklife","q5_neg",
  "rec1","match1%","rec2","match2%","rec3","match3%","rec4","match4%","rec5","match5%"].join(",")

const lines = results.map(r =>
  [`"${r.test_id}"`,`"${r.q1_skills}"`,`"${r.q3_answer}"`,`"${r.q4_worklife}"`,`"${r.q5_neg}"`,
   `"${r.rec1}"`,r.pct1,`"${r.rec2}"`,r.pct2,`"${r.rec3}"`,r.pct3,
   `"${r.rec4}"`,r.pct4,`"${r.rec5}"`,r.pct5].join(",")
)

const csv = [header, ...lines].join("\n")
const out = join(process.cwd(), "data_structured", "quiz-simulation-300.csv")
writeFileSync(out, csv, "utf8")
console.log(`✅  300 სიმულაცია → ${out}`)

// ── Summary ────────────────────────────────────────────────────────────────
console.log("\n" + "=".repeat(80))
console.log("300 SIMULATION SUMMARY")
console.log("=".repeat(80))
for (const r of results) {
  console.log(`\n${r.test_id}`)
  console.log(`  Q1: ${r.q1_skills}  Q3: ${r.q3_answer}`)
  console.log(`  Q4: ${r.q4_worklife}  Q5: ${r.q5_neg}`)
  console.log(`  → #1: ${r.rec1}(${r.pct1}%)  #2: ${r.rec2}(${r.pct2}%)  #3: ${r.rec3}(${r.pct3}%)`)
}
