'use client'
import { useEffect, useState } from 'react'
import { UserTable } from '@/components/admin/UserTable'
import { Button } from '@/components/ui/button'

interface User {
  id: string
  name: string
  employeeCode: string | null
  role: string
  creditsBalance: number
  isActive: boolean
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    const res = await fetch('/api/users')
    const data = await res.json()
    setUsers(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleBonus(userId: string, amount: number, reason: string) {
    await fetch(`/api/users/${userId}/credits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, reason }),
    })
    await load()
  }

  async function handleToggleActive(userId: string, isActive: boolean) {
    await fetch(`/api/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive }),
    })
    await load()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Manajemen Karyawan</h1>
          <p className="text-[#71717A] text-sm mt-1">{users.length} karyawan terdaftar</p>
        </div>
        <Button className="bg-[#FAD200] text-[#09090B] font-bold hover:bg-[#E5B818]">
          + Tambah Karyawan
        </Button>
      </div>

      {loading ? (
        <p className="text-[#52525B]">Memuat...</p>
      ) : (
        <UserTable users={users} onBonus={handleBonus} onToggleActive={handleToggleActive} />
      )}
    </div>
  )
}
