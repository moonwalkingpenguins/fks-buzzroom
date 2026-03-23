'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface QuizFormProps {
  onSubmit: (data: { title: string; description: string; category: string }) => Promise<void>
  loading?: boolean
}

export function QuizForm({ onSubmit, loading }: QuizFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await onSubmit({ title, description, category })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label className="text-white">Judul Quiz *</Label>
        <Input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Contoh: K3 Dasar — Keselamatan Kerja"
          className="bg-[#1C1C22] border-[#2E2E33] text-white"
          required
        />
      </div>
      <div className="space-y-2">
        <Label className="text-white">Deskripsi</Label>
        <Input
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Opsional"
          className="bg-[#1C1C22] border-[#2E2E33] text-white"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-white">Kategori</Label>
        <Input
          value={category}
          onChange={e => setCategory(e.target.value)}
          placeholder="Contoh: Safety, Compliance, HR"
          className="bg-[#1C1C22] border-[#2E2E33] text-white"
        />
      </div>
      <Button
        type="submit"
        disabled={loading || !title.trim()}
        className="bg-[#FAD200] text-[#09090B] font-bold hover:bg-[#E5B818] disabled:opacity-50"
      >
        {loading ? 'Menyimpan...' : 'Buat Quiz'}
      </Button>
    </form>
  )
}
