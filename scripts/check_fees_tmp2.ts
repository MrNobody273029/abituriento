import "dotenv/config"
import { prisma } from "../lib/prisma"
async function main() {
  // College fee distribution
  const colleges = await prisma.program.findMany({
    where: { university: { category: "college" } },
    select: { tuition_fee: true, is_state_funded: true, university: { select: { name_ka: true } } },
  })
  const collegeFeeZero = colleges.filter(p => p.tuition_fee === 0).length
  const collegeFeeReal = colleges.filter(p => p.tuition_fee > 0).length
  console.log(`Colleges total programs: ${colleges.length}`)
  console.log(`College fee=0: ${collegeFeeZero}`)
  console.log(`College fee>0: ${collegeFeeReal}`)
  
  // State-funded at universities
  const uniStateFunded = await prisma.program.findMany({
    where: { university: { category: "university" }, is_state_funded: true, tuition_fee: 0 },
    select: { id: true, name_ka: true, university: { select: { name_ka: true } } },
    take: 5,
  })
  console.log("\nSample state-funded uni programs with fee=0:")
  uniStateFunded.forEach(p => console.log(`  ${p.university.name_ka} — ${p.name_ka}`))
  await prisma.$disconnect()
}
main().catch(e => { console.error(e); process.exit(1) })
