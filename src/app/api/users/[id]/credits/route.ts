import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { amount, reason } = await req.json()

  if (!amount || amount <= 0) {
    return NextResponse.json({ error: 'Jumlah kredit harus positif' }, { status: 400 })
  }
  if (!reason?.trim()) {
    return NextResponse.json({ error: 'Alasan bonus wajib diisi' }, { status: 400 })
  }

  const [user] = await prisma.$transaction([
    prisma.user.update({
      where: { id },
      data: { creditsBalance: { increment: amount } },
      select: { creditsBalance: true },
    }),
    prisma.creditTransaction.create({
      data: {
        userId: id,
        amount,
        type: 'admin_bonus',
        reason: reason.trim(),
        adminId: session.user.id,
      },
    }),
  ])

  return NextResponse.json({ creditsBalance: user.creditsBalance })
}
