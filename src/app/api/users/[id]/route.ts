import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { name, role, isActive, resetPassword } = await req.json()

  const data: Record<string, unknown> = {}
  if (name !== undefined) data.name = name.trim()
  if (role !== undefined) data.role = role
  if (isActive !== undefined) data.isActive = isActive
  if (resetPassword) {
    data.passwordHash = await bcrypt.hash(resetPassword, 12)
  }

  const user = await prisma.user.update({
    where: { id },
    data,
    select: { id: true, name: true, employeeCode: true, role: true, creditsBalance: true, isActive: true, createdAt: true },
  })
  return NextResponse.json(user)
}
