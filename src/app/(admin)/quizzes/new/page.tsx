'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { QuizForm } from '@/components/admin/QuizForm'
import { QuestionEditor } from '@/components/admin/QuestionEditor'

export default function NewQuizPage() {
  const router = useRouter()
  const [quizId, setQuizId] = useState<string | null>(null)
  const [questions, setQuestions] = useState<{ id: string; content: string }[]>([])
  const [loading, setLoading] = useState(false)

  async function createQuiz(data: { title: string; description: string; category: string }) {
    setLoading(true)
    const res = await fetch('/api/quizzes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const err = await res.json()
      alert(err.error || 'Gagal membuat quiz')
      setLoading(false)
      return
    }
    const quiz = await res.json()
    setQuizId(quiz.id)
    setLoading(false)
  }

  async function addQuestion(question: {
    content: string; type: string; durationSecs: number;
    explanation: string; options: { content: string; isCorrect: boolean }[]; orderIndex: number
  }) {
    if (!quizId) return
    const res = await fetch(`/api/quizzes/${quizId}/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(question),
    })
    if (!res.ok) {
      const err = await res.json()
      alert(err.error || 'Gagal menambahkan soal')
      return
    }
    const q = await res.json()
    setQuestions(prev => [...prev, { id: q.id, content: q.content }])
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Buat Quiz Baru</h1>
        <p className="text-[#71717A] text-sm mt-1">Langkah 1: Isi info quiz, lalu tambahkan soal</p>
      </div>

      {!quizId ? (
        <div className="bg-[#17171C] border border-[#2E2E33] rounded-xl p-6">
          <QuizForm onSubmit={createQuiz} loading={loading} />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
            <p className="text-green-400 text-sm">✓ Quiz dibuat. Tambahkan soal di bawah.</p>
          </div>

          {questions.map((q, i) => (
            <div key={q.id} className="bg-[#17171C] border border-[#2E2E33] rounded-xl p-4">
              <p className="text-[#71717A] text-sm">Soal {i + 1} ✓</p>
              <p className="text-white">{q.content}</p>
            </div>
          ))}

          <QuestionEditor orderIndex={questions.length} onSave={addQuestion} />

          <button
            onClick={() => router.push('/quizzes')}
            className="text-[#FAD200] text-sm hover:underline"
          >
            ← Selesai, kembali ke daftar quiz
          </button>
        </div>
      )}
    </div>
  )
}
