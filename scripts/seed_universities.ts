/**
 * Seeds Universities and Programs.
 * Universities: official list from NAEC / naec.ge
 * Programs: representative programs per university, matching GeoStat field taxonomy
 * Tuition fees: from university public websites (2024-2025 academic year)
 * Grant scores: NULL until NAEC PDF (cnobari_2025.pdf) is parsed [Task 2]
 *
 * Field names match GeoStat taxonomy:
 *   education | humanities | social_business_law | science |
 *   engineering | agriculture | health | services
 */
import "dotenv/config"
import { prisma } from "../lib/prisma"

// ─── Universities ─────────────────────────────────────────────────────────────

const UNIVERSITIES = [
  // STATE
  {
    name_ka: "თბილისის სახელმწიფო უნივერსიტეტი",
    name_en: "Tbilisi State University",
    website: "https://www.tsu.ge",
    type: "state",
    city: "თბილისი",
    description_ka: "საქართველოს წამყვანი სახელმწიფო უნივერსიტეტი, 1918 წელს დაარსებული.",
  },
  {
    name_ka: "საქართველოს ტექნიკური უნივერსიტეტი",
    name_en: "Georgian Technical University",
    website: "https://www.gtu.ge",
    type: "state",
    city: "თბილისი",
    description_ka: "ტექნიკური და საინჟინრო სპეციალობების წამყვანი სახელმწიფო უნივერსიტეტი.",
  },
  {
    name_ka: "თბილისის სახელმწიფო სამედიცინო უნივერსიტეტი",
    name_en: "Tbilisi State Medical University",
    website: "https://www.tsmu.edu",
    type: "state",
    city: "თბილისი",
    description_ka: "სამედიცინო განათლების უმთავრესი სახელმწიფო უნივერსიტეტი საქართველოში.",
  },
  {
    name_ka: "ილიას სახელმწიფო უნივერსიტეტი",
    name_en: "Ilia State University",
    website: "https://iliauni.edu.ge",
    type: "state",
    city: "თბილისი",
    description_ka: "კვლევაზე ორიენტირებული სახელმწიფო უნივერსიტეტი.",
  },
  {
    name_ka: "საქართველოს სახელმწიფო სასოფლო-სამეურნეო უნივერსიტეტი",
    name_en: "Agricultural University of Georgia",
    website: "https://www.agruni.edu.ge",
    type: "state",
    city: "თბილისი",
    description_ka: "სასოფლო-სამეურნეო სპეციალობების სახელმწიფო უნივერსიტეტი.",
  },
  {
    name_ka: "ბათუმის შოთა რუსთაველის სახელმწიფო უნივერსიტეტი",
    name_en: "Batumi Shota Rustaveli State University",
    website: "https://www.bsu.edu.ge",
    type: "state",
    city: "ბათუმი",
    description_ka: "აჭარის რეგიონის მთავარი სახელმწიფო უნივერსიტეტი.",
  },
  {
    name_ka: "აკაკი წერეთლის სახელმწიფო უნივერსიტეტი",
    name_en: "Akaki Tsereteli State University",
    website: "https://www.atsu.edu.ge",
    type: "state",
    city: "ქუთაისი",
    description_ka: "იმერეთის რეგიონის მთავარი სახელმწიფო უნივერსიტეტი.",
  },
  {
    name_ka: "ქუთაისის საერთაშორისო უნივერსიტეტი",
    name_en: "Kutaisi International University",
    website: "https://kiu.edu.ge",
    type: "state",
    city: "ქუთაისი",
    description_ka: "ახალი სახელმწიფო უნივერსიტეტი ქუთაისის ინოვაციური ტექნოლოგიების ქალაქში.",
  },
  {
    name_ka: "გორის სახელმწიფო სასწავლო უნივერსიტეტი",
    name_en: "Gori State Teaching University",
    website: "https://www.goruni.edu.ge",
    type: "state",
    city: "გორი",
    description_ka: "შიდა ქართლის სახელმწიფო სასწავლო უნივერსიტეტი.",
  },
  {
    name_ka: "სამცხე-ჯავახეთის სახელმწიფო უნივერსიტეტი",
    name_en: "Samtskhe-Javakheti State University",
    website: "https://www.sjuni.edu.ge",
    type: "state",
    city: "ახალციხე",
    description_ka: "სამცხე-ჯავახეთის რეგიონის სახელმწიფო უნივერსიტეტი.",
  },
  // PRIVATE
  {
    name_ka: "ევროპის უნივერსიტეტი",
    name_en: "European University",
    website: "https://www.eu.edu.ge",
    type: "private",
    city: "თბილისი",
    description_ka: "კერძო უნივერსიტეტი სამართლის, ბიზნესის და სამედიცინო სპეციალობებით.",
  },
  {
    name_ka: "კავკასიის უნივერსიტეტი",
    name_en: "Caucasus University",
    website: "https://www.cu.edu.ge",
    type: "private",
    city: "თბილისი",
    description_ka: "ბიზნესისა და ტექნოლოგიების კერძო უნივერსიტეტი.",
  },
  {
    name_ka: "ფრეე უნივერსიტეტი",
    name_en: "Free University of Tbilisi",
    website: "https://www.freeuni.edu.ge",
    type: "private",
    city: "თბილისი",
    description_ka: "IT და ბიზნეს სკოლებით ცნობილი კერძო უნივერსიტეტი.",
  },
  {
    name_ka: "ბიზნეს და ტექნოლოგიების უნივერსიტეტი",
    name_en: "Business and Technology University",
    website: "https://www.btu.edu.ge",
    type: "private",
    city: "თბილისი",
    description_ka: "ტექნოლოგიებზე ორიენტირებული კერძო უნივერსიტეტი.",
  },
  {
    name_ka: "საქართველოს უნივერსიტეტი",
    name_en: "University of Georgia",
    website: "https://www.ug.edu.ge",
    type: "private",
    city: "თბილისი",
    description_ka: "მრავალპროფილიანი კერძო უნივერსიტეტი.",
  },
]

// ─── Programs ─────────────────────────────────────────────────────────────────
// grant_score_* is null — will be filled after NAEC PDF parse (Task 2)

type ProgramData = {
  name_ka: string; name_en: string; faculty_ka: string;
  degree: string; duration_years: number; tuition_fee: number;
  is_state_funded: boolean; field: string; description_ka?: string;
}

const PROGRAMS_BY_UNI: Record<string, ProgramData[]> = {
  "თბილისის სახელმწიფო უნივერსიტეტი": [
    { name_ka: "კომპიუტერული მეცნიერება", name_en: "Computer Science", faculty_ka: "ზუსტ და საბუნებისმეტყველო მეცნიერებათა ფაკულტეტი", degree: "bachelor", duration_years: 4, tuition_fee: 2250, is_state_funded: true, field: "science" },
    { name_ka: "მათემატიკა", name_en: "Mathematics", faculty_ka: "ზუსტ და საბუნებისმეტყველო მეცნიერებათა ფაკულტეტი", degree: "bachelor", duration_years: 4, tuition_fee: 2250, is_state_funded: true, field: "science" },
    { name_ka: "ფიზიკა", name_en: "Physics", faculty_ka: "ზუსტ და საბუნებისმეტყველო მეცნიერებათა ფაკულტეტი", degree: "bachelor", duration_years: 4, tuition_fee: 2250, is_state_funded: true, field: "science" },
    { name_ka: "სამართალი", name_en: "Law", faculty_ka: "იურიდიული ფაკულტეტი", degree: "bachelor", duration_years: 4, tuition_fee: 2250, is_state_funded: true, field: "social_business_law" },
    { name_ka: "ეკონომიკა", name_en: "Economics", faculty_ka: "ეკონომიკისა და ბიზნესის ფაკულტეტი", degree: "bachelor", duration_years: 4, tuition_fee: 2250, is_state_funded: true, field: "social_business_law" },
    { name_ka: "ბიზნესის ადმინისტრირება", name_en: "Business Administration", faculty_ka: "ეკონომიკისა და ბიზნესის ფაკულტეტი", degree: "bachelor", duration_years: 4, tuition_fee: 2250, is_state_funded: true, field: "social_business_law" },
    { name_ka: "ქართული ფილოლოგია", name_en: "Georgian Philology", faculty_ka: "ჰუმანიტარულ მეცნიერებათა ფაკულტეტი", degree: "bachelor", duration_years: 4, tuition_fee: 2250, is_state_funded: true, field: "humanities" },
    { name_ka: "ისტორია", name_en: "History", faculty_ka: "ჰუმანიტარულ მეცნიერებათა ფაკულტეტი", degree: "bachelor", duration_years: 4, tuition_fee: 2250, is_state_funded: true, field: "humanities" },
    { name_ka: "ფსიქოლოგია", name_en: "Psychology", faculty_ka: "სოციალურ და პოლიტიკურ მეცნიერებათა ფაკულტეტი", degree: "bachelor", duration_years: 4, tuition_fee: 2250, is_state_funded: true, field: "social_business_law" },
    { name_ka: "მედიცინა", name_en: "Medicine", faculty_ka: "მედიცინის ფაკულტეტი", degree: "bachelor", duration_years: 6, tuition_fee: 8500, is_state_funded: false, field: "health" },
    { name_ka: "ბიოლოგია", name_en: "Biology", faculty_ka: "ზუსტ და საბუნებისმეტყველო მეცნიერებათა ფაკულტეტი", degree: "bachelor", duration_years: 4, tuition_fee: 2250, is_state_funded: true, field: "science" },
    { name_ka: "გეოგრაფია", name_en: "Geography", faculty_ka: "ზუსტ და საბუნებისმეტყველო მეცნიერებათა ფაკულტეტი", degree: "bachelor", duration_years: 4, tuition_fee: 2250, is_state_funded: true, field: "science" },
    { name_ka: "ჟურნალისტიკა", name_en: "Journalism", faculty_ka: "სოციალურ და პოლიტიკურ მეცნიერებათა ფაკულტეტი", degree: "bachelor", duration_years: 4, tuition_fee: 2250, is_state_funded: true, field: "social_business_law" },
    { name_ka: "განათლების მეცნიერებები", name_en: "Education Sciences", faculty_ka: "პედაგოგიკის ფაკულტეტი", degree: "bachelor", duration_years: 4, tuition_fee: 2250, is_state_funded: true, field: "education" },
  ],
  "საქართველოს ტექნიკური უნივერსიტეტი": [
    { name_ka: "ინფორმატიკა და მართვის სისტემები", name_en: "Informatics and Control Systems", faculty_ka: "ინფორმატიკის ფაკულტეტი", degree: "bachelor", duration_years: 4, tuition_fee: 2250, is_state_funded: true, field: "science" },
    { name_ka: "პროგრამული ინჟინერია", name_en: "Software Engineering", faculty_ka: "ინფორმატიკის ფაკულტეტი", degree: "bachelor", duration_years: 4, tuition_fee: 2250, is_state_funded: true, field: "science" },
    { name_ka: "სამოქალაქო ინჟინერია", name_en: "Civil Engineering", faculty_ka: "სამშენებლო ფაკულტეტი", degree: "bachelor", duration_years: 4, tuition_fee: 2250, is_state_funded: true, field: "engineering" },
    { name_ka: "არქიტექტურა", name_en: "Architecture", faculty_ka: "არქიტექტურის ფაკულტეტი", degree: "bachelor", duration_years: 5, tuition_fee: 2250, is_state_funded: true, field: "engineering" },
    { name_ka: "ელექტრო და კომპიუტერული ინჟინერია", name_en: "Electrical and Computer Engineering", faculty_ka: "ენერგეტიკის ფაკულტეტი", degree: "bachelor", duration_years: 4, tuition_fee: 2250, is_state_funded: true, field: "engineering" },
    { name_ka: "ქიმიური ტექნოლოგია და მეტალურგია", name_en: "Chemical Technology and Metallurgy", faculty_ka: "ქიმიური ტექნოლოგიის ფაკულტეტი", degree: "bachelor", duration_years: 4, tuition_fee: 2250, is_state_funded: true, field: "engineering" },
    { name_ka: "სამთო და გეოლოგიური ინჟინერია", name_en: "Mining and Geological Engineering", faculty_ka: "სამთო-გეოლოგიური ფაკულტეტი", degree: "bachelor", duration_years: 4, tuition_fee: 2250, is_state_funded: true, field: "engineering" },
    { name_ka: "ბიზნეს-ინჟინერია", name_en: "Business Engineering", faculty_ka: "ბიზნეს-ინჟინერიის ფაკულტეტი", degree: "bachelor", duration_years: 4, tuition_fee: 2250, is_state_funded: true, field: "social_business_law" },
    { name_ka: "ტრანსპორტი და მანქანათმშენებლობა", name_en: "Transport and Mechanical Engineering", faculty_ka: "ტრანსპორტის ფაკულტეტი", degree: "bachelor", duration_years: 4, tuition_fee: 2250, is_state_funded: true, field: "engineering" },
  ],
  "თბილისის სახელმწიფო სამედიცინო უნივერსიტეტი": [
    { name_ka: "მედიცინა", name_en: "Medicine", faculty_ka: "სამედიცინო ფაკულტეტი", degree: "bachelor", duration_years: 6, tuition_fee: 9000, is_state_funded: true, field: "health", description_ka: "ექიმის კვალიფიკაცია — MD" },
    { name_ka: "სტომატოლოგია", name_en: "Dentistry", faculty_ka: "სტომატოლოგიის ფაკულტეტი", degree: "bachelor", duration_years: 5, tuition_fee: 9500, is_state_funded: true, field: "health" },
    { name_ka: "ფარმაცია", name_en: "Pharmacy", faculty_ka: "ფარმაციის ფაკულტეტი", degree: "bachelor", duration_years: 5, tuition_fee: 4500, is_state_funded: true, field: "health" },
    { name_ka: "საზოგადოებრივი ჯანდაცვა", name_en: "Public Health", faculty_ka: "საზოგადოებრივი ჯანმრთელობის ფაკულტეტი", degree: "bachelor", duration_years: 4, tuition_fee: 3500, is_state_funded: true, field: "health" },
    { name_ka: "ფიზიკური მედიცინა და რეაბილიტაცია", name_en: "Physical Medicine and Rehabilitation", faculty_ka: "სამედიცინო ფაკულტეტი", degree: "bachelor", duration_years: 4, tuition_fee: 4000, is_state_funded: false, field: "health" },
  ],
  "ილიას სახელმწიფო უნივერსიტეტი": [
    { name_ka: "კომპიუტერული მეცნიერება და მათემატიკა", name_en: "Computer Science and Mathematics", faculty_ka: "საბუნებისმეტყველო მეცნიერებების ფაკულტეტი", degree: "bachelor", duration_years: 4, tuition_fee: 2250, is_state_funded: true, field: "science" },
    { name_ka: "ბიზნესის ადმინისტრირება", name_en: "Business Administration", faculty_ka: "ბიზნეს სკოლა", degree: "bachelor", duration_years: 4, tuition_fee: 3750, is_state_funded: true, field: "social_business_law" },
    { name_ka: "სამართალი", name_en: "Law", faculty_ka: "სამართლის სკოლა", degree: "bachelor", duration_years: 4, tuition_fee: 3750, is_state_funded: true, field: "social_business_law" },
    { name_ka: "ფილოსოფია", name_en: "Philosophy", faculty_ka: "ილიას სკოლა", degree: "bachelor", duration_years: 4, tuition_fee: 2250, is_state_funded: true, field: "humanities" },
    { name_ka: "ხელოვნებათმცოდნეობა", name_en: "Art Studies", faculty_ka: "ხელოვნებისა და კულტურის ინსტიტუტი", degree: "bachelor", duration_years: 4, tuition_fee: 2250, is_state_funded: true, field: "humanities" },
    { name_ka: "ინგლისური ფილოლოგია", name_en: "English Philology", faculty_ka: "ჰუმანიტარულ მეცნიერებათა ფაკულტეტი", degree: "bachelor", duration_years: 4, tuition_fee: 2250, is_state_funded: true, field: "humanities" },
  ],
  "საქართველოს სახელმწიფო სასოფლო-სამეურნეო უნივერსიტეტი": [
    { name_ka: "აგრონომია", name_en: "Agronomy", faculty_ka: "აგრონომიის ფაკულტეტი", degree: "bachelor", duration_years: 4, tuition_fee: 2250, is_state_funded: true, field: "agriculture" },
    { name_ka: "ვეტერინარია", name_en: "Veterinary Medicine", faculty_ka: "ვეტერინარული მედიცინის ფაკულტეტი", degree: "bachelor", duration_years: 5, tuition_fee: 2250, is_state_funded: true, field: "agriculture" },
    { name_ka: "სასოფლო-სამეურნეო ეკონომიკა", name_en: "Agricultural Economics", faculty_ka: "ეკონომიკის ფაკულტეტი", degree: "bachelor", duration_years: 4, tuition_fee: 2250, is_state_funded: true, field: "agriculture" },
    { name_ka: "სატყეო საქმე", name_en: "Forestry", faculty_ka: "სატყეო-საინჟინრო ფაკულტეტი", degree: "bachelor", duration_years: 4, tuition_fee: 2250, is_state_funded: true, field: "agriculture" },
    { name_ka: "სასურსათო ინჟინერია", name_en: "Food Engineering", faculty_ka: "სასოფლო-სამეურნეო ინჟინერიის ფაკულტეტი", degree: "bachelor", duration_years: 4, tuition_fee: 2250, is_state_funded: true, field: "engineering" },
  ],
  "ბათუმის შოთა რუსთაველის სახელმწიფო უნივერსიტეტი": [
    { name_ka: "ბიზნესის ადმინისტრირება", name_en: "Business Administration", faculty_ka: "ეკონომიკისა და ბიზნესის ფაკულტეტი", degree: "bachelor", duration_years: 4, tuition_fee: 2250, is_state_funded: true, field: "social_business_law" },
    { name_ka: "სამართალი", name_en: "Law", faculty_ka: "იურიდიული ფაკულტეტი", degree: "bachelor", duration_years: 4, tuition_fee: 2250, is_state_funded: true, field: "social_business_law" },
    { name_ka: "ტურიზმი", name_en: "Tourism", faculty_ka: "ტურიზმის ფაკულტეტი", degree: "bachelor", duration_years: 4, tuition_fee: 2250, is_state_funded: true, field: "services" },
    { name_ka: "ინფორმაციული ტექნოლოგიები", name_en: "Information Technology", faculty_ka: "ტექნოლოგიების ფაკულტეტი", degree: "bachelor", duration_years: 4, tuition_fee: 2250, is_state_funded: true, field: "science" },
    { name_ka: "ქართული ფილოლოგია", name_en: "Georgian Philology", faculty_ka: "ჰუმანიტარულ მეცნიერებათა ფაკულტეტი", degree: "bachelor", duration_years: 4, tuition_fee: 2250, is_state_funded: true, field: "humanities" },
  ],
  "აკაკი წერეთლის სახელმწიფო უნივერსიტეტი": [
    { name_ka: "ბიზნესის ადმინისტრირება", name_en: "Business Administration", faculty_ka: "ეკონომიკისა და ბიზნესის ფაკულტეტი", degree: "bachelor", duration_years: 4, tuition_fee: 2250, is_state_funded: true, field: "social_business_law" },
    { name_ka: "სამართალი", name_en: "Law", faculty_ka: "იურიდიული ფაკულტეტი", degree: "bachelor", duration_years: 4, tuition_fee: 2250, is_state_funded: true, field: "social_business_law" },
    { name_ka: "ინფორმატიკა", name_en: "Computer Science", faculty_ka: "ზუსტ და საბუნებისმეტყველო მეცნ. ფაკ.", degree: "bachelor", duration_years: 4, tuition_fee: 2250, is_state_funded: true, field: "science" },
    { name_ka: "პედაგოგიკა", name_en: "Pedagogy", faculty_ka: "პედაგოგიკური ფაკულტეტი", degree: "bachelor", duration_years: 4, tuition_fee: 2250, is_state_funded: true, field: "education" },
  ],
  "ქუთაისის საერთაშორისო უნივერსიტეტი": [
    { name_ka: "კომპიუტერული მეცნიერება", name_en: "Computer Science", faculty_ka: "ტექნოლოგიებისა და ინოვაციების სკოლა", degree: "bachelor", duration_years: 4, tuition_fee: 2250, is_state_funded: true, field: "science" },
    { name_ka: "ბიზნეს ადმინისტრირება", name_en: "Business Administration", faculty_ka: "ბიზნეს სკოლა", degree: "bachelor", duration_years: 4, tuition_fee: 2250, is_state_funded: true, field: "social_business_law" },
    { name_ka: "ინჟინერია", name_en: "Engineering", faculty_ka: "ინჟინერიის სკოლა", degree: "bachelor", duration_years: 4, tuition_fee: 2250, is_state_funded: true, field: "engineering" },
  ],
  "გორის სახელმწიფო სასწავლო უნივერსიტეტი": [
    { name_ka: "საგანმანათლებლო ფსიქოლოგია", name_en: "Educational Psychology", faculty_ka: "პედაგოგიკური ფაკულტეტი", degree: "bachelor", duration_years: 4, tuition_fee: 2250, is_state_funded: true, field: "education" },
    { name_ka: "ქართული ფილოლოგია", name_en: "Georgian Philology", faculty_ka: "ჰუმანიტარულ მეცნ. ფაკ.", degree: "bachelor", duration_years: 4, tuition_fee: 2250, is_state_funded: true, field: "humanities" },
    { name_ka: "ბიზნესის ადმინისტრირება", name_en: "Business Administration", faculty_ka: "ეკონ. ფაკ.", degree: "bachelor", duration_years: 4, tuition_fee: 2250, is_state_funded: true, field: "social_business_law" },
  ],
  "სამცხე-ჯავახეთის სახელმწიფო უნივერსიტეტი": [
    { name_ka: "ბიზნესის ადმინისტრირება", name_en: "Business Administration", faculty_ka: "ეკონ. და ბიზნ. ფაკ.", degree: "bachelor", duration_years: 4, tuition_fee: 2250, is_state_funded: true, field: "social_business_law" },
    { name_ka: "ისტორია", name_en: "History", faculty_ka: "ჰუმანიტ. ფაკ.", degree: "bachelor", duration_years: 4, tuition_fee: 2250, is_state_funded: true, field: "humanities" },
  ],
  // PRIVATE
  "ევროპის უნივერსიტეტი": [
    { name_ka: "სამართალი", name_en: "Law", faculty_ka: "სამართლის სკოლა", degree: "bachelor", duration_years: 4, tuition_fee: 5000, is_state_funded: true, field: "social_business_law" },
    { name_ka: "მედიცინა", name_en: "Medicine", faculty_ka: "სამედიცინო სკოლა", degree: "bachelor", duration_years: 6, tuition_fee: 14000, is_state_funded: false, field: "health" },
    { name_ka: "ბიზნესის ადმინისტრირება", name_en: "Business Administration", faculty_ka: "ბიზნეს სკოლა", degree: "bachelor", duration_years: 4, tuition_fee: 5000, is_state_funded: true, field: "social_business_law" },
    { name_ka: "ფსიქოლოგია", name_en: "Psychology", faculty_ka: "სოციალური მეცნ. სკოლა", degree: "bachelor", duration_years: 4, tuition_fee: 4500, is_state_funded: false, field: "social_business_law" },
  ],
  "კავკასიის უნივერსიტეტი": [
    { name_ka: "ბიზნეს ადმინისტრირება", name_en: "Business Administration", faculty_ka: "კავკასიის სკოლა ბიზნესისა", degree: "bachelor", duration_years: 4, tuition_fee: 7200, is_state_funded: true, field: "social_business_law" },
    { name_ka: "სამართალი", name_en: "Law", faculty_ka: "კავკასიის სამართლის სკოლა", degree: "bachelor", duration_years: 4, tuition_fee: 6500, is_state_funded: true, field: "social_business_law" },
    { name_ka: "კომპიუტერული მეცნიერება", name_en: "Computer Science", faculty_ka: "ტექნოლ. სკოლა", degree: "bachelor", duration_years: 4, tuition_fee: 6500, is_state_funded: true, field: "science" },
    { name_ka: "მედიცინა", name_en: "Medicine", faculty_ka: "კავკასიის სამედიცინო სკოლა", degree: "bachelor", duration_years: 6, tuition_fee: 15000, is_state_funded: false, field: "health" },
  ],
  "ფრეე უნივერსიტეტი": [
    { name_ka: "კომპიუტერული მეცნიერება", name_en: "Computer Science", faculty_ka: "IT სკოლა", degree: "bachelor", duration_years: 4, tuition_fee: 6500, is_state_funded: true, field: "science" },
    { name_ka: "ბიზნეს ადმინისტრირება", name_en: "Business Administration", faculty_ka: "ბიზნეს სკოლა", degree: "bachelor", duration_years: 4, tuition_fee: 6500, is_state_funded: true, field: "social_business_law" },
    { name_ka: "სამართალი", name_en: "Law", faculty_ka: "სამართლის სკოლა", degree: "bachelor", duration_years: 4, tuition_fee: 6500, is_state_funded: true, field: "social_business_law" },
  ],
  "ბიზნეს და ტექნოლოგიების უნივერსიტეტი": [
    { name_ka: "კომპიუტერული მეცნ. და IT", name_en: "Computer Science and IT", faculty_ka: "IT ფაკულტეტი", degree: "bachelor", duration_years: 4, tuition_fee: 5500, is_state_funded: true, field: "science" },
    { name_ka: "ბიზნეს ადმინისტრირება", name_en: "Business Administration", faculty_ka: "ბიზნეს ფაკულტეტი", degree: "bachelor", duration_years: 4, tuition_fee: 5000, is_state_funded: true, field: "social_business_law" },
    { name_ka: "მარკეტინგი", name_en: "Marketing", faculty_ka: "ბიზნეს ფაკულტეტი", degree: "bachelor", duration_years: 4, tuition_fee: 5000, is_state_funded: true, field: "social_business_law" },
    { name_ka: "ინფორმაციული სისტემები", name_en: "Information Systems", faculty_ka: "IT ფაკულტეტი", degree: "bachelor", duration_years: 4, tuition_fee: 5500, is_state_funded: true, field: "science" },
  ],
  "საქართველოს უნივერსიტეტი": [
    { name_ka: "მედიცინა", name_en: "Medicine", faculty_ka: "სამედიცინო ფაკულტეტი", degree: "bachelor", duration_years: 6, tuition_fee: 12000, is_state_funded: false, field: "health" },
    { name_ka: "სამართალი", name_en: "Law", faculty_ka: "სამართლის ფაკულტეტი", degree: "bachelor", duration_years: 4, tuition_fee: 5500, is_state_funded: true, field: "social_business_law" },
    { name_ka: "ბიზნეს ადმინისტრირება", name_en: "Business Administration", faculty_ka: "ბიზნეს ფაკულტეტი", degree: "bachelor", duration_years: 4, tuition_fee: 5500, is_state_funded: true, field: "social_business_law" },
    { name_ka: "ფსიქოლოგია", name_en: "Psychology", faculty_ka: "სოციალურ მეცნ. ფაკ.", degree: "bachelor", duration_years: 4, tuition_fee: 4800, is_state_funded: false, field: "social_business_law" },
    { name_ka: "ტურიზმი", name_en: "Tourism", faculty_ka: "ბიზნეს ფაკულტეტი", degree: "bachelor", duration_years: 4, tuition_fee: 4500, is_state_funded: false, field: "services" },
  ],
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("Seeding universities and programs...\n")

  // Clear existing
  await prisma.program.deleteMany()
  await prisma.university.deleteMany()

  let totalUnis = 0
  let totalProgs = 0

  for (const uniData of UNIVERSITIES) {
    const uni = await prisma.university.create({ data: uniData })
    totalUnis++

    const programs = PROGRAMS_BY_UNI[uniData.name_ka] || []
    for (const prog of programs) {
      await prisma.program.create({
        data: {
          ...prog,
          universityId: uni.id,
          grant_score_2025: null, // → Task 2: parse NAEC PDF
          grant_score_2024: null,
          grant_score_2023: null,
        },
      })
      totalProgs++
    }

    console.log(`✓ ${uniData.name_ka} (${programs.length} სპეც.)`)
  }

  console.log(`\n✅ Done!`)
  console.log(`   Universities: ${totalUnis}`)
  console.log(`   Programs: ${totalProgs}`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
