import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default async function QuizzesPage() {
  const session = await auth()
  if (!session) redirect('/login')

  const quizzes = await prisma.quiz.findMany({
    where: { isArchived: false },
    include: { _count: { select: { questions: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Daftar Quiz</h1>
          <p className="text-[#71717A] text-sm mt-1">{quizzes.length} quiz tersedia</p>
        </div>
        <Link href="/quizzes/new">
          <Button className="bg-[#FAD200] text-[#09090B] font-bold hover:bg-[#E5B818]">
            + Buat Quiz
          </Button>
        </Link>
      </div>

      {quizzes.length === 0 ? (
        <div className="text-center py-16 text-[#52525B]">
          <p className="text-lg">Belum ada quiz.</p>
          <p className="text-sm mt-1">Klik &ldquo;Buat Quiz&rdquo; untuk memulai.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quizzes.map(quiz => (
            <div key={quiz.id} className="bg-[#17171C] border border-[#2E2E33] rounded-xl p-5 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-white font-semibold">{quiz.title}</h3>
                  {quiz.category && (
                    <Badge className="mt-1 bg-[#FAD200]/20 text-[#FAD200] border-[#FAD200]/30 text-xs">
                      {quiz.category}
                    </Badge>
                  )}
                </div>
                {quiz.isTemplate && (
                  <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                    Template
                  </Badge>
                )}
              </div>
              <p className="text-[#71717A] text-sm">{quiz._count.questions} soal</p>
              <div className="flex gap-2 pt-1">
                <Link href={`/quizzes/${quiz.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full border-[#2E2E33] text-[#A1A1AA] hover:text-white hover:border-white">
                    Edit
                  </Button>
                </Link>
                <Button size="sm" className="flex-1 bg-[#FAD200] text-[#09090B] font-bold hover:bg-[#E5B818]">
                  ▶ Mulai
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
