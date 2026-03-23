import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const data = await req.json()
  const quiz = await prisma.quiz.update({ where: { id }, data })
  return NextResponse.json(quiz)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  await prisma.quiz.update({ where: { id }, data: { isArchived: true } })
  return NextResponse.json({ ok: true })
}
