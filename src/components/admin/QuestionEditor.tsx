'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

interface Option {
  content: string
  isCorrect: boolean
}

interface QuestionEditorProps {
  orderIndex: number
  onSave: (question: {
    content: string
    type: string
    durationSecs: number
    explanation: string
    options: Option[]
    orderIndex: number
  }) => Promise<void>
}

export function QuestionEditor({ orderIndex, onSave }: QuestionEditorProps) {
  const [content, setContent] = useState('')
  const [type] = useState<'multiple_choice'>('multiple_choice')
  const [durationSecs, setDurationSecs] = useState(20)
  const [explanation, setExplanation] = useState('')
  const [options, setOptions] = useState<Option[]>([
    { content: '', isCorrect: false },
    { content: '', isCorrect: false },
    { content: '', isCorrect: false },
    { content: '', isCorrect: false },
  ])
  const [loading, setLoading] = useState(false)

  function setOption(index: number, content: string) {
    setOptions(prev => prev.map((o, i) => i === index ? { ...o, content } : o))
  }

  function toggleCorrect(index: number) {
    setOptions(prev => prev.map((o, i) => ({ ...o, isCorrect: i === index })))
  }

  async function handleSave() {
    if (!content.trim()) return
    if (!options.some(o => o.isCorrect)) return
    setLoading(true)
    await onSave({ content, type, durationSecs, explanation, options, orderIndex })
    setLoading(false)
    setContent('')
    setExplanation('')
    setOptions([
      { content: '', isCorrect: false },
      { content: '', isCorrect: false },
      { content: '', isCorrect: false },
      { content: '', isCorrect: false },
    ])
  }

  const COLORS = ['bg-red-500', 'bg-blue-500', 'bg-yellow-500', 'bg-green-500']

  return (
    <div className="bg-[#17171C] border border-[#2E2E33] rounded-xl p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Badge className="bg-[#FAD200]/20 text-[#FAD200] border-[#FAD200]/30">
          Soal {orderIndex + 1}
        </Badge>
        <span className="text-[#71717A] text-sm">Pilihan Ganda</span>
      </div>

      <div className="space-y-2">
        <Label className="text-white">Pertanyaan *</Label>
        <Input
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Tulis pertanyaan di sini..."
          className="bg-[#1C1C22] border-[#2E2E33] text-white"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-white">Durasi (detik)</Label>
        <Input
          type="number"
          value={durationSecs}
          onChange={e => setDurationSecs(Number(e.target.value))}
          min={5}
          max={120}
          className="bg-[#1C1C22] border-[#2E2E33] text-white w-32"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-white">Pilihan Jawaban <span className="text-[#71717A] text-xs">(klik untuk tandai benar)</span></Label>
        <div className="grid grid-cols-2 gap-2">
          {options.map((opt, i) => (
            <div key={i} className={`flex items-center gap-2 p-2 rounded-lg border ${opt.isCorrect ? 'border-green-500 bg-green-500/10' : 'border-[#2E2E33] bg-[#1C1C22]'}`}>
              <div className={`w-3 h-3 rounded-sm flex-shrink-0 ${COLORS[i]}`} />
              <Input
                value={opt.content}
                onChange={e => setOption(i, e.target.value)}
                placeholder={`Pilihan ${String.fromCharCode(65 + i)}`}
                className="bg-transparent border-0 text-white p-0 h-auto focus-visible:ring-0"
              />
              <button
                type="button"
                onClick={() => toggleCorrect(i)}
                className={`text-xs px-2 py-0.5 rounded ${opt.isCorrect ? 'bg-green-500 text-white' : 'bg-[#2E2E33] text-[#71717A]'}`}
              >
                {opt.isCorrect ? '✓ Benar' : 'Benar?'}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-white">Penjelasan (opsional)</Label>
        <Input
          value={explanation}
          onChange={e => setExplanation(e.target.value)}
          placeholder="Ditampilkan setelah peserta menjawab"
          className="bg-[#1C1C22] border-[#2E2E33] text-white"
        />
      </div>

      <Button
        onClick={handleSave}
        disabled={loading || !content.trim() || !options.some(o => o.isCorrect)}
        className="bg-[#FAD200] text-[#09090B] font-bold hover:bg-[#E5B818] disabled:opacity-50"
      >
        {loading ? 'Menyimpan...' : '+ Simpan Soal'}
      </Button>
    </div>
  )
}
