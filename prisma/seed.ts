import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const adminPassword = process.env.SEED_ADMIN_PASSWORD
  if (!adminPassword) {
    console.error('Error: SEED_ADMIN_PASSWORD environment variable is required')
    process.exit(1)
  }
  const passwordHash = await bcrypt.hash(adminPassword, 12)
  const admin = await prisma.user.upsert({
    where: { employeeCode: 'ADMIN-001' },
    update: {},
    create: {
      name: 'Super Admin',
      employeeCode: 'ADMIN-001',
      passwordHash,
      role: 'super_admin',
    },
  })

  await prisma.quiz.upsert({
    where: { id: 'template-k3' },
    update: {},
    create: {
      id: 'template-k3',
      title: 'K3 Dasar — Keselamatan Kerja',
      category: 'Safety',
      isTemplate: true,
      createdById: admin.id,
      questions: {
        create: [
          {
            content: 'APD apa yang wajib dipakai saat bekerja di ketinggian?',
            type: 'multiple_choice',
            durationSecs: 20,
            orderIndex: 0,
            explanation: 'Full body harness melindungi seluruh tubuh saat jatuh dari ketinggian.',
            options: {
              create: [
                { content: 'Helm saja', isCorrect: false, orderIndex: 0 },
                { content: 'Full body harness', isCorrect: true, orderIndex: 1 },
                { content: 'Sepatu safety', isCorrect: false, orderIndex: 2 },
                { content: 'Sarung tangan', isCorrect: false, orderIndex: 3 },
              ],
            },
          },
          {
            content: 'APAR harus diperiksa secara berkala setiap...',
            type: 'multiple_choice',
            durationSecs: 20,
            orderIndex: 1,
            explanation: 'Pemeriksaan bulanan memastikan APAR selalu siap digunakan.',
            options: {
              create: [
                { content: '1 tahun sekali', isCorrect: false, orderIndex: 0 },
                { content: '6 bulan sekali', isCorrect: false, orderIndex: 1 },
                { content: '1 bulan sekali', isCorrect: true, orderIndex: 2 },
                { content: '2 tahun sekali', isCorrect: false, orderIndex: 3 },
              ],
            },
          },
        ],
      },
    },
  })

  console.log('Seed siap ✅')
}

main().catch(console.error).finally(() => prisma.$disconnect())
