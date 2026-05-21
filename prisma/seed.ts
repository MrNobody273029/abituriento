import "dotenv/config"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter } as never)

async function main() {
  console.log("Seeding database...")

  await prisma.marketData.deleteMany()
  await prisma.program.deleteMany()
  await prisma.university.deleteMany()

  const marketData = [
    { field: "tech", field_name_ka: "ტექნოლოგია", avg_salary_entry: 2000, avg_salary_mid: 4000, demand_level: "high", trend: "growing", vacancy_count: 850, source: "jobs.ge" },
    { field: "medicine", field_name_ka: "მედიცინა", avg_salary_entry: 1500, avg_salary_mid: 3500, demand_level: "high", trend: "stable", vacancy_count: 620, source: "jobs.ge" },
    { field: "law", field_name_ka: "სამართალი", avg_salary_entry: 1200, avg_salary_mid: 2500, demand_level: "medium", trend: "stable", vacancy_count: 280, source: "jobs.ge" },
    { field: "business", field_name_ka: "ბიზნესი", avg_salary_entry: 1300, avg_salary_mid: 2800, demand_level: "high", trend: "growing", vacancy_count: 740, source: "jobs.ge" },
    { field: "humanities", field_name_ka: "ჰუმანიტარული", avg_salary_entry: 800, avg_salary_mid: 1500, demand_level: "low", trend: "declining", vacancy_count: 120, source: "jobs.ge" },
    { field: "arts", field_name_ka: "ხელოვნება", avg_salary_entry: 700, avg_salary_mid: 1400, demand_level: "low", trend: "stable", vacancy_count: 95, source: "jobs.ge" },
    { field: "social", field_name_ka: "სოციალური", avg_salary_entry: 900, avg_salary_mid: 1800, demand_level: "medium", trend: "stable", vacancy_count: 210, source: "jobs.ge" },
    { field: "natural_science", field_name_ka: "საბუნებისმეტყველო", avg_salary_entry: 1000, avg_salary_mid: 2000, demand_level: "medium", trend: "growing", vacancy_count: 190, source: "jobs.ge" },
    { field: "education", field_name_ka: "განათლება", avg_salary_entry: 900, avg_salary_mid: 1600, demand_level: "medium", trend: "stable", vacancy_count: 310, source: "jobs.ge" },
    { field: "other", field_name_ka: "სხვა", avg_salary_entry: 800, avg_salary_mid: 1500, demand_level: "low", trend: "stable", vacancy_count: 150, source: "jobs.ge" },
  ]

  for (const md of marketData) {
    await prisma.marketData.create({ data: md })
  }

  const tsu = await prisma.university.create({
    data: {
      name_ka: "თბილისის სახელმწიფო უნივერსიტეტი",
      name_en: "Tbilisi State University",
      website: "https://www.tsu.ge",
      type: "state",
      city: "თბილისი",
      description_ka: "საქართველოს უძველესი და ყველაზე დიდი უნივერსიტეტი, დაარსებული 1918 წელს.",
    },
  })

  const gtu = await prisma.university.create({
    data: {
      name_ka: "საქართველოს ტექნიკური უნივერსიტეტი",
      name_en: "Georgian Technical University",
      website: "https://gtu.ge",
      type: "state",
      city: "თბილისი",
      description_ka: "ტექნიკური განათლების წამყვანი დაწესებულება საქართველოში.",
    },
  })

  const iliauni = await prisma.university.create({
    data: {
      name_ka: "ილიას სახელმწიფო უნივერსიტეტი",
      name_en: "Ilia State University",
      website: "https://iliauni.edu.ge",
      type: "state",
      city: "თბილისი",
      description_ka: "თანამედროვე კვლევაზე ორიენტირებული უნივერსიტეტი.",
    },
  })

  const freeuni = await prisma.university.create({
    data: {
      name_ka: "თავისუფალი უნივერსიტეტი",
      name_en: "Free University of Tbilisi",
      website: "https://freeuni.edu.ge",
      type: "private",
      city: "თბილისი",
      description_ka: "ბიზნეს და სამართლის საუკეთესო კერძო უნივერსიტეტი.",
    },
  })

  const caucasus = await prisma.university.create({
    data: {
      name_ka: "კავკასიის უნივერსიტეტი",
      name_en: "Caucasus University",
      website: "https://cu.edu.ge",
      type: "private",
      city: "თბილისი",
      description_ka: "ბიზნეს-განათლების ლიდერი კავკასიის რეგიონში.",
    },
  })

  const europa = await prisma.university.create({
    data: {
      name_ka: "ევროპის უნივერსიტეტი",
      name_en: "European University",
      website: "https://eu.edu.ge",
      type: "private",
      city: "თბილისი",
      description_ka: "ევროპული განათლების სტანდარტებზე ორიენტირებული უნივერსიტეტი.",
    },
  })

  const unigeorgia = await prisma.university.create({
    data: {
      name_ka: "საქართველოს უნივერსიტეტი",
      name_en: "University of Georgia",
      website: "https://ug.edu.ge",
      type: "private",
      city: "თბილისი",
      description_ka: "მულტიდისციპლინური კერძო უნივერსიტეტი.",
    },
  })

  const ciu = await prisma.university.create({
    data: {
      name_ka: "კავკასიის საერთაშორისო უნივერსიტეტი",
      name_en: "Caucasus International University",
      website: "https://www.ciu.edu.ge",
      type: "private",
      city: "თბილისი",
      description_ka: "სამედიცინო და ბიზნეს პროგრამებით ცნობილი უნივერსიტეტი.",
    },
  })

  const gipa = await prisma.university.create({
    data: {
      name_ka: "GIPA - საქართველოს საზოგადოებრივ საქმეთა ინსტიტუტი",
      name_en: "Georgian Institute of Public Affairs",
      website: "https://gipa.ge",
      type: "private",
      city: "თბილისი",
      description_ka: "ჟურნალისტიკის, სამართლისა და საჯარო ადმინისტრირების ექსპერტი.",
    },
  })

  const eeu = await prisma.university.create({
    data: {
      name_ka: "აღმოსავლეთ ევროპის უნივერსიტეტი",
      name_en: "East European University",
      website: "https://eeu.edu.ge",
      type: "private",
      city: "თბილისი",
      description_ka: "ხელმისაწვდომი განათლება ფართო სპეციალობების ჩამონათვალით.",
    },
  })

  const programs = [
    // TSU programs
    { universityId: tsu.id, name_ka: "კომპიუტერული მეცნიერება", name_en: "Computer Science", faculty_ka: "ზუსტ და საბუნებისმეტყველო მეცნიერებათა ფაკულტეტი", degree: "bachelor", duration_years: 4, tuition_fee: 2250, is_state_funded: true, grant_score_2025: 52, grant_score_2024: 50, grant_score_2023: 48, field: "tech", description_ka: "პროგრამირება, ალგორითმები, ხელოვნური ინტელექტი და სისტემების ადმინისტრირება." },
    { universityId: tsu.id, name_ka: "სამართალი", name_en: "Law", faculty_ka: "იურიდიული ფაკულტეტი", degree: "bachelor", duration_years: 4, tuition_fee: 2250, is_state_funded: true, grant_score_2025: 57, grant_score_2024: 55, grant_score_2023: 54, field: "law", description_ka: "საქართველოს სამართლის სისტემა, სამოქალაქო და სისხლის სამართალი." },
    { universityId: tsu.id, name_ka: "მედიცინა", name_en: "Medicine", faculty_ka: "მედიცინის ფაკულტეტი", degree: "bachelor", duration_years: 6, tuition_fee: 7500, is_state_funded: true, grant_score_2025: 63, grant_score_2024: 61, grant_score_2023: 60, field: "medicine", description_ka: "ზოგადი მედიცინა, კლინიკური პრაქტიკა და სამედიცინო კვლევა." },
    { universityId: tsu.id, name_ka: "ბიზნესის ადმინისტრირება", name_en: "Business Administration", faculty_ka: "ეკონომიკისა და ბიზნესის ფაკულტეტი", degree: "bachelor", duration_years: 4, tuition_fee: 2250, is_state_funded: true, grant_score_2025: 47, grant_score_2024: 45, grant_score_2023: 44, field: "business", description_ka: "მენეჯმენტი, მარკეტინგი, ფინანსები და ბიზნეს სტრატეგია." },
    { universityId: tsu.id, name_ka: "ფსიქოლოგია", name_en: "Psychology", faculty_ka: "სოციალურ და პოლიტიკურ მეცნიერებათა ფაკულტეტი", degree: "bachelor", duration_years: 4, tuition_fee: 2250, is_state_funded: true, grant_score_2025: 45, grant_score_2024: 43, grant_score_2023: 42, field: "social", description_ka: "შემეცნებითი ფსიქოლოგია, კლინიკური მეთოდები და ნეიროფსიქოლოგია." },
    { universityId: tsu.id, name_ka: "ისტორია", name_en: "History", faculty_ka: "ჰუმანიტარულ მეცნიერებათა ფაკულტეტი", degree: "bachelor", duration_years: 4, tuition_fee: 2250, is_state_funded: true, grant_score_2025: 40, grant_score_2024: 39, grant_score_2023: 38, field: "humanities" },
    // GTU programs
    { universityId: gtu.id, name_ka: "ინფორმატიკა და მართვის სისტემები", name_en: "Informatics and Control Systems", faculty_ka: "ინფორმატიკისა და მართვის სისტემების ფაკულტეტი", degree: "bachelor", duration_years: 4, tuition_fee: 2250, is_state_funded: true, grant_score_2025: 50, grant_score_2024: 48, grant_score_2023: 46, field: "tech", description_ka: "ინჟინერია, ავტომატიზაცია და IT სისტემები." },
    { universityId: gtu.id, name_ka: "სამშენებლო ინჟინერია", name_en: "Civil Engineering", faculty_ka: "სამშენებლო ფაკულტეტი", degree: "bachelor", duration_years: 4, tuition_fee: 2250, is_state_funded: true, grant_score_2025: 42, grant_score_2024: 41, grant_score_2023: 40, field: "tech" },
    { universityId: gtu.id, name_ka: "ქიმიური ტექნოლოგია", name_en: "Chemical Technology", faculty_ka: "ქიმიური ტექნოლოგიისა და მეტალურგიის ფაკულტეტი", degree: "bachelor", duration_years: 4, tuition_fee: 2250, is_state_funded: true, grant_score_2025: 38, grant_score_2024: 37, grant_score_2023: 36, field: "natural_science" },
    { universityId: gtu.id, name_ka: "ენერგეტიკა და ელექტრომომარაგება", name_en: "Energy and Power Supply", faculty_ka: "ენერგეტიკის ფაკულტეტი", degree: "bachelor", duration_years: 4, tuition_fee: 2250, is_state_funded: true, grant_score_2025: 40, grant_score_2024: 39, grant_score_2023: 38, field: "tech" },
    { universityId: gtu.id, name_ka: "ბიოსამედიცინო ინჟინერია", name_en: "Biomedical Engineering", faculty_ka: "ბიოსამედიცინო ინჟინერიის ფაკულტეტი", degree: "bachelor", duration_years: 4, tuition_fee: 2250, is_state_funded: true, grant_score_2025: 46, grant_score_2024: 44, grant_score_2023: 42, field: "medicine" },
    // Ilia State programs
    { universityId: iliauni.id, name_ka: "კომპიუტინგი", name_en: "Computing", faculty_ka: "ბიზნესის ტექნოლოგიების სკოლა", degree: "bachelor", duration_years: 4, tuition_fee: 2500, is_state_funded: true, grant_score_2025: 51, grant_score_2024: 49, grant_score_2023: 47, field: "tech" },
    { universityId: iliauni.id, name_ka: "ბიოლოგია", name_en: "Biology", faculty_ka: "საბუნებისმეტყველო მეცნიერებებისა და მედიცინის სკოლა", degree: "bachelor", duration_years: 4, tuition_fee: 2250, is_state_funded: true, grant_score_2025: 43, grant_score_2024: 42, grant_score_2023: 41, field: "natural_science" },
    { universityId: iliauni.id, name_ka: "ხელოვნებათმცოდნეობა", name_en: "Art History", faculty_ka: "ხელოვნებათა სკოლა", degree: "bachelor", duration_years: 4, tuition_fee: 2250, is_state_funded: true, grant_score_2025: 38, grant_score_2024: 37, grant_score_2023: 36, field: "arts" },
    { universityId: iliauni.id, name_ka: "ჟურნალისტიკა", name_en: "Journalism", faculty_ka: "სოციალური მეცნიერებების სკოლა", degree: "bachelor", duration_years: 4, tuition_fee: 2500, is_state_funded: true, grant_score_2025: 44, grant_score_2024: 42, grant_score_2023: 41, field: "social" },
    // Free University programs
    { universityId: freeuni.id, name_ka: "ბიზნესი და ადმინისტრაცია", name_en: "Business and Administration", faculty_ka: "ბიზნესსა და ტექნოლოგიათა სკოლა", degree: "bachelor", duration_years: 4, tuition_fee: 5500, is_state_funded: false, grant_score_2025: 48, grant_score_2024: 46, grant_score_2023: 44, field: "business", description_ka: "თანამედროვე ბიზნეს პრაქტიკები და მეწარმეობა." },
    { universityId: freeuni.id, name_ka: "სამართალი", name_en: "Law", faculty_ka: "სამართლის სკოლა", degree: "bachelor", duration_years: 4, tuition_fee: 5500, is_state_funded: false, grant_score_2025: 58, grant_score_2024: 56, grant_score_2023: 55, field: "law", description_ka: "ევროპული სამართლის სტანდარტები." },
    { universityId: freeuni.id, name_ka: "კომპიუტერული მეცნიერება", name_en: "Computer Science", faculty_ka: "ბიზნესსა და ტექნოლოგიათა სკოლა", degree: "bachelor", duration_years: 4, tuition_fee: 5500, is_state_funded: false, grant_score_2025: 53, grant_score_2024: 51, grant_score_2023: 50, field: "tech" },
    // Caucasus University programs
    { universityId: caucasus.id, name_ka: "ბიზნესის ადმინისტრირება", name_en: "Business Administration", faculty_ka: "ბიზნეს სკოლა", degree: "bachelor", duration_years: 4, tuition_fee: 5000, is_state_funded: false, grant_score_2025: 46, grant_score_2024: 44, grant_score_2023: 43, field: "business" },
    { universityId: caucasus.id, name_ka: "ეკონომიკა", name_en: "Economics", faculty_ka: "ეკონომიკის სკოლა", degree: "bachelor", duration_years: 4, tuition_fee: 5000, is_state_funded: false, grant_score_2025: 44, grant_score_2024: 42, grant_score_2023: 41, field: "business" },
    { universityId: caucasus.id, name_ka: "სამართალი", name_en: "Law", faculty_ka: "სამართლის სკოლა", degree: "bachelor", duration_years: 4, tuition_fee: 5000, is_state_funded: false, grant_score_2025: 55, grant_score_2024: 53, grant_score_2023: 52, field: "law" },
    { universityId: caucasus.id, name_ka: "ტურიზმის მართვა", name_en: "Tourism Management", faculty_ka: "ტურიზმის სკოლა", degree: "bachelor", duration_years: 4, tuition_fee: 4500, is_state_funded: false, grant_score_2025: 40, grant_score_2024: 39, grant_score_2023: 38, field: "business" },
    // European University programs
    { universityId: europa.id, name_ka: "სამედიცინო", name_en: "Medicine", faculty_ka: "სამედიცინო სკოლა", degree: "bachelor", duration_years: 6, tuition_fee: 8000, is_state_funded: false, grant_score_2025: 61, grant_score_2024: 60, grant_score_2023: 59, field: "medicine", description_ka: "კლინიკური მედიცინა ევროპული სტანდარტებით." },
    { universityId: europa.id, name_ka: "ფარმაცია", name_en: "Pharmacy", faculty_ka: "ფარმაციის სკოლა", degree: "bachelor", duration_years: 5, tuition_fee: 7000, is_state_funded: false, grant_score_2025: 58, grant_score_2024: 56, grant_score_2023: 55, field: "medicine" },
    { universityId: europa.id, name_ka: "სტომატოლოგია", name_en: "Dentistry", faculty_ka: "სტომატოლოგიის სკოლა", degree: "bachelor", duration_years: 5, tuition_fee: 7500, is_state_funded: false, grant_score_2025: 60, grant_score_2024: 58, grant_score_2023: 57, field: "medicine" },
    { universityId: europa.id, name_ka: "ბიზნეს ადმინისტრირება", name_en: "Business Administration", faculty_ka: "ბიზნესსა და ეკონომიკის სკოლა", degree: "bachelor", duration_years: 4, tuition_fee: 4500, is_state_funded: false, grant_score_2025: 42, grant_score_2024: 41, grant_score_2023: 40, field: "business" },
    // University of Georgia programs
    { universityId: unigeorgia.id, name_ka: "კომპიუტერული მეცნიერება", name_en: "Computer Science", faculty_ka: "კომპიუტინგისა და ინჟინერიის სკოლა", degree: "bachelor", duration_years: 4, tuition_fee: 5500, is_state_funded: false, grant_score_2025: 50, grant_score_2024: 48, grant_score_2023: 47, field: "tech" },
    { universityId: unigeorgia.id, name_ka: "სამართალი", name_en: "Law", faculty_ka: "სამართლის სკოლა", degree: "bachelor", duration_years: 4, tuition_fee: 5000, is_state_funded: false, grant_score_2025: 54, grant_score_2024: 52, grant_score_2023: 51, field: "law" },
    { universityId: unigeorgia.id, name_ka: "ფსიქოლოგია", name_en: "Psychology", faculty_ka: "სოციალურ მეცნიერებათა სკოლა", degree: "bachelor", duration_years: 4, tuition_fee: 4500, is_state_funded: false, grant_score_2025: 43, grant_score_2024: 42, grant_score_2023: 41, field: "social" },
    { universityId: unigeorgia.id, name_ka: "ჟურნალისტიკა და მასობრივი კომუნიკაცია", name_en: "Journalism and Mass Communication", faculty_ka: "ჟურნალისტიკისა და კომუნიკაციის სკოლა", degree: "bachelor", duration_years: 4, tuition_fee: 4500, is_state_funded: false, grant_score_2025: 42, grant_score_2024: 41, grant_score_2023: 40, field: "social" },
    // CIU programs
    { universityId: ciu.id, name_ka: "მედიცინა", name_en: "Medicine", faculty_ka: "სამედიცინო ფაკულტეტი", degree: "bachelor", duration_years: 6, tuition_fee: 7000, is_state_funded: false, grant_score_2025: 60, grant_score_2024: 59, grant_score_2023: 58, field: "medicine" },
    { universityId: ciu.id, name_ka: "ბიზნეს ადმინისტრირება", name_en: "Business Administration", faculty_ka: "ბიზნეს ფაკულტეტი", degree: "bachelor", duration_years: 4, tuition_fee: 4000, is_state_funded: false, grant_score_2025: 40, grant_score_2024: 39, grant_score_2023: 38, field: "business" },
    { universityId: ciu.id, name_ka: "სამართალი", name_en: "Law", faculty_ka: "სამართლის ფაკულტეტი", degree: "bachelor", duration_years: 4, tuition_fee: 4000, is_state_funded: false, grant_score_2025: 53, grant_score_2024: 51, grant_score_2023: 50, field: "law" },
    // GIPA programs
    { universityId: gipa.id, name_ka: "ჟურნალისტიკა", name_en: "Journalism", faculty_ka: "ჟურნალისტიკის სკოლა", degree: "bachelor", duration_years: 4, tuition_fee: 4500, is_state_funded: false, grant_score_2025: 45, grant_score_2024: 43, grant_score_2023: 42, field: "social" },
    { universityId: gipa.id, name_ka: "საჯარო ადმინისტრირება", name_en: "Public Administration", faculty_ka: "საჯარო ადმინისტრაციის სკოლა", degree: "bachelor", duration_years: 4, tuition_fee: 4500, is_state_funded: false, grant_score_2025: 43, grant_score_2024: 42, grant_score_2023: 41, field: "social" },
    { universityId: gipa.id, name_ka: "სამართალი", name_en: "Law", faculty_ka: "სამართლის სკოლა", degree: "bachelor", duration_years: 4, tuition_fee: 5000, is_state_funded: false, grant_score_2025: 56, grant_score_2024: 54, grant_score_2023: 53, field: "law" },
    // EEU programs
    { universityId: eeu.id, name_ka: "ბიზნეს ადმინისტრირება", name_en: "Business Administration", faculty_ka: "ბიზნეს ფაკულტეტი", degree: "bachelor", duration_years: 4, tuition_fee: 3500, is_state_funded: false, grant_score_2025: 38, grant_score_2024: 37, grant_score_2023: 36, field: "business" },
    { universityId: eeu.id, name_ka: "სამართალი", name_en: "Law", faculty_ka: "სამართლის ფაკულტეტი", degree: "bachelor", duration_years: 4, tuition_fee: 3500, is_state_funded: false, grant_score_2025: 50, grant_score_2024: 49, grant_score_2023: 48, field: "law" },
    { universityId: eeu.id, name_ka: "ინფორმატიკა", name_en: "Informatics", faculty_ka: "ინფორმატიკის ფაკულტეტი", degree: "bachelor", duration_years: 4, tuition_fee: 3500, is_state_funded: false, grant_score_2025: 44, grant_score_2024: 43, grant_score_2023: 42, field: "tech" },
    { universityId: eeu.id, name_ka: "განათლება (ინგლისური ენა)", name_en: "Education (English Language)", faculty_ka: "განათლების ფაკულტეტი", degree: "bachelor", duration_years: 4, tuition_fee: 3000, is_state_funded: false, grant_score_2025: 36, grant_score_2024: 35, grant_score_2023: 34, field: "education" },
    // Masters programs
    { universityId: tsu.id, name_ka: "კომპიუტერული მეცნიერება (მაგისტრი)", name_en: "Computer Science (Master)", faculty_ka: "ზუსტ და საბუნებისმეტყველო მეცნიერებათა ფაკულტეტი", degree: "master", duration_years: 2, tuition_fee: 2250, is_state_funded: true, grant_score_2025: 50, grant_score_2024: 48, grant_score_2023: 46, field: "tech" },
    { universityId: tsu.id, name_ka: "სამართალი (მაგისტრი)", name_en: "Law (Master)", faculty_ka: "იურიდიული ფაკულტეტი", degree: "master", duration_years: 2, tuition_fee: 2250, is_state_funded: true, grant_score_2025: 55, grant_score_2024: 53, grant_score_2023: 52, field: "law" },
    { universityId: freeuni.id, name_ka: "MBA", name_en: "Master of Business Administration", faculty_ka: "ბიზნეს სკოლა", degree: "master", duration_years: 2, tuition_fee: 7500, is_state_funded: false, grant_score_2025: 45, grant_score_2024: 44, grant_score_2023: 43, field: "business", description_ka: "ბიზნეს ლიდერობის პროგრამა." },
    { universityId: caucasus.id, name_ka: "ბიზნეს ადმინისტრირება (მაგისტრი)", name_en: "Business Administration (Master)", faculty_ka: "ბიზნეს სკოლა", degree: "master", duration_years: 2, tuition_fee: 5500, is_state_funded: false, grant_score_2025: 43, grant_score_2024: 41, grant_score_2023: 40, field: "business" },
    { universityId: gtu.id, name_ka: "ინფორმაციული ტექნოლოგია (მაგისტრი)", name_en: "Information Technology (Master)", faculty_ka: "ინფორმატიკის ფაკულტეტი", degree: "master", duration_years: 2, tuition_fee: 2250, is_state_funded: true, grant_score_2025: 48, grant_score_2024: 46, grant_score_2023: 45, field: "tech" },
    { universityId: iliauni.id, name_ka: "ბიზნეს ადმინისტრირება (მაგისტრი)", name_en: "Business Administration (Master)", faculty_ka: "ბიზნეს ტექნოლოგიების სკოლა", degree: "master", duration_years: 2, tuition_fee: 3500, is_state_funded: false, grant_score_2025: 44, grant_score_2024: 43, grant_score_2023: 42, field: "business" },
    // Additional programs
    { universityId: tsu.id, name_ka: "მათემატიკა", name_en: "Mathematics", faculty_ka: "ზუსტ და საბუნებისმეტყველო მეცნიერებათა ფაკულტეტი", degree: "bachelor", duration_years: 4, tuition_fee: 2250, is_state_funded: true, grant_score_2025: 42, grant_score_2024: 40, grant_score_2023: 39, field: "natural_science" },
    { universityId: tsu.id, name_ka: "პედაგოგიკა", name_en: "Pedagogy", faculty_ka: "განათლების ფაკულტეტი", degree: "bachelor", duration_years: 4, tuition_fee: 2250, is_state_funded: true, grant_score_2025: 36, grant_score_2024: 35, grant_score_2023: 34, field: "education" },
    { universityId: gtu.id, name_ka: "არქიტექტურა", name_en: "Architecture", faculty_ka: "არქიტექტურის ფაკულტეტი", degree: "bachelor", duration_years: 5, tuition_fee: 2250, is_state_funded: true, grant_score_2025: 44, grant_score_2024: 43, grant_score_2023: 42, field: "arts" },
    { universityId: iliauni.id, name_ka: "ლიბერალური განათლება", name_en: "Liberal Arts", faculty_ka: "ლიბერალური მეცნიერებებისა და ხელოვნების სკოლა", degree: "bachelor", duration_years: 4, tuition_fee: 2500, is_state_funded: true, grant_score_2025: 40, grant_score_2024: 39, grant_score_2023: 38, field: "humanities" },
    { universityId: freeuni.id, name_ka: "საერთაშორისო ურთიერთობები", name_en: "International Relations", faculty_ka: "სოციალურ მეცნიერებათა სკოლა", degree: "bachelor", duration_years: 4, tuition_fee: 5500, is_state_funded: false, grant_score_2025: 48, grant_score_2024: 46, grant_score_2023: 45, field: "social" },
    { universityId: caucasus.id, name_ka: "მასობრივი კომუნიკაცია", name_en: "Mass Communication", faculty_ka: "სოციალური მეცნიერებებისა და ჰუმანიტარული დეპარტამენტი", degree: "bachelor", duration_years: 4, tuition_fee: 4500, is_state_funded: false, grant_score_2025: 41, grant_score_2024: 40, grant_score_2023: 39, field: "social" },
    { universityId: unigeorgia.id, name_ka: "საერთაშორისო ურთიერთობები", name_en: "International Relations", faculty_ka: "სოციალურ მეცნიერებათა სკოლა", degree: "bachelor", duration_years: 4, tuition_fee: 4500, is_state_funded: false, grant_score_2025: 45, grant_score_2024: 44, grant_score_2023: 43, field: "social" },
    { universityId: gipa.id, name_ka: "კომუნიკაციები (მაგისტრი)", name_en: "Communications (Master)", faculty_ka: "კომუნიკაციის სკოლა", degree: "master", duration_years: 2, tuition_fee: 5000, is_state_funded: false, grant_score_2025: 42, grant_score_2024: 41, grant_score_2023: 40, field: "social" },
    { universityId: eeu.id, name_ka: "ეკონომიკა", name_en: "Economics", faculty_ka: "ბიზნეს ფაკულტეტი", degree: "bachelor", duration_years: 4, tuition_fee: 3500, is_state_funded: false, grant_score_2025: 37, grant_score_2024: 36, grant_score_2023: 35, field: "business" },
  ]

  for (const program of programs) {
    await prisma.program.create({ data: program })
  }

  console.log(`Seeded: ${marketData.length} market data entries, 10 universities, ${programs.length} programs`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
