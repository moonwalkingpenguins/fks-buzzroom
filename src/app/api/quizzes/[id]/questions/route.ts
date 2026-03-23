import { requireAuth } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAuth('admin')
  if (error) return error

  const { id: quizId } = await params
  const { content, type, durationSecs, explanation, options, orderIndex } = await req.json()

  if (!content?.trim()) {
    return NextResponse.json({ error: 'Konten soal wajib diisi' }, { status: 400 })
  }

  const question = await prisma.question.create({
    data: {
      quizId,
      content: content.trim(),
      type: type || 'multiple_choice',
      durationSecs: durationSecs || 20,
      explanation: explanation?.trim() || null,
      orderIndex: orderIndex ?? 0,
      options: {
        create: (options || []).map((o: { content: string; isCorrect: boolean }, i: number) => ({
          content: o.content,
          isCorrect: Boolean(o.isCorrect),
          orderIndex: i,
        })),
      },
    },
    include: { options: { orderBy: { orderIndex: 'asc' } } },
  })
  return NextResponse.json(question, { status: 201 })
}
