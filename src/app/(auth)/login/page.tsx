'use client'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function LoginPage() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [pass, setPass] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await signIn('credentials', {
      employeeCode: code,
      password: pass,
      redirect: false,
    })
    if (res?.error) {
      setError('Kode karyawan atau password salah')
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-[#09090B] flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6 p-8 bg-[#17171C] border border-[#2E2E33] rounded-2xl">
        <div className="text-center space-y-1">
          <div className="text-[#FAD200] font-bold text-xs tracking-widest uppercase mb-3">
            ⚡ FKS BUZZROOM
          </div>
          <h1 className="text-white text-2xl font-bold">Masuk</h1>
          <p className="text-[#71717A] text-sm">Gunakan kode karyawan Anda</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Kode Karyawan (misal: FKS-0023)"
            value={code}
            onChange={e => { setCode(e.target.value); setError('') }}
            autoComplete="username"
            className="bg-[#1C1C22] border-[#2E2E33] text-white placeholder:text-[#52525B]"
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={pass}
            onChange={e => { setPass(e.target.value); setError('') }}
            autoComplete="current-password"
            className="bg-[#1C1C22] border-[#2E2E33] text-white placeholder:text-[#52525B]"
            required
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FAD200] text-[#09090B] font-bold hover:bg-[#E5B818] disabled:opacity-50"
          >
            {loading ? 'Memproses...' : 'Masuk →'}
          </Button>
        </form>
        <div className="text-center">
          <p className="text-[#52525B] text-xs">
            Belum punya akun? Hubungi administrator
          </p>
        </div>
      </div>
    </div>
  )
}
