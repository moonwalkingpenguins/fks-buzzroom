import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const quizzes = await prisma.quiz.findMany({
    where: { isArchived: false },
    include: { _count: { select: { questions: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(quizzes)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { title, description, category } = body

  if (!title?.trim()) {
    return NextResponse.json({ error: 'Judul quiz wajib diisi' }, { status: 400 })
  }

  const quiz = await prisma.quiz.create({
    data: {
      title: title.trim(),
      description: description?.trim() || null,
      category: category?.trim() || null,
      createdById: session.user.id,
    },
  })
  return NextResponse.json(quiz, { status: 201 })
}
