import { requireAuth } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAuth('admin')
  if (error) return error

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
