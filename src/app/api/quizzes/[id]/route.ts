import { requireAuth } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAuth()
  if (error) return error

  const { id } = await params
  const quiz = await prisma.quiz.findUnique({
    where: { id },
    include: {
      questions: {
        include: { options: { orderBy: { orderIndex: 'asc' } } },
        orderBy: { orderIndex: 'asc' },
      },
    },
  })
  if (!quiz) return NextResponse.json({ error: 'Quiz tidak ditemukan' }, { status: 404 })
  return NextResponse.json(quiz)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAuth('admin')
  if (error) return error

  const { id } = await params
  const body = await req.json()

  // Allowlist only safe patchable fields
  const allowed = ['title', 'description', 'category', 'isTemplate', 'isArchived'] as const
  const data: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) data[key] = body[key]
  }

  const quiz = await prisma.quiz.update({ where: { id }, data })
  return NextResponse.json(quiz)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAuth('admin')
  if (error) return error

  const { id } = await params
  await prisma.quiz.update({ where: { id }, data: { isArchived: true } })
  return NextResponse.json({ ok: true })
}
