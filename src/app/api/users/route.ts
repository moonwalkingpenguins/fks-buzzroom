import { requireAuth } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function GET() {
  const { error } = await requireAuth('admin')
  if (error) return error

  const users = await prisma.user.findMany({
    select: {
      id: true, name: true, employeeCode: true, role: true,
      creditsBalance: true, isActive: true, createdAt: true,
    },
    orderBy: { name: 'asc' },
  })
  return NextResponse.json(users)
}

export async function POST(req: NextRequest) {
  const { error } = await requireAuth('admin')
  if (error) return error

  const { name, employeeCode, role, tempPassword } = await req.json()
  if (!name?.trim() || !employeeCode?.trim()) {
    return NextResponse.json({ error: 'Nama dan kode karyawan wajib diisi' }, { status: 400 })
  }

  const password = tempPassword?.trim() || 'Buzzer@123'
  const passwordHash = await bcrypt.hash(password, 12)

  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      employeeCode: employeeCode.trim().toUpperCase(),
      role: role || 'player',
      passwordHash,
    },
    select: { id: true, name: true, employeeCode: true, role: true, creditsBalance: true, isActive: true, createdAt: true },
  })
  return NextResponse.json({ user, tempPassword: password }, { status: 201 })
}
