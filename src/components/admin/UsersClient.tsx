'use client'
import { useState } from 'react'
import { UserTable } from './UserTable'

interface User {
  id: string
  name: string
  employeeCode: string | null
  role: string
  creditsBalance: number
  isActive: boolean
}

interface UsersClientProps {
  initialUsers: User[]
}

export function UsersClient({ initialUsers }: UsersClientProps) {
  const [users, setUsers] = useState<User[]>(initialUsers)

  async function reload() {
    const res = await fetch('/api/users')
    if (res.ok) setUsers(await res.json())
  }

  async function handleBonus(userId: string, amount: number, reason: string) {
    const res = await fetch(`/api/users/${userId}/credits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, reason }),
    })
    if (!res.ok) {
      const err = await res.json()
      alert(err.error || 'Gagal memberikan bonus')
      return
    }
    await reload()
  }

  async function handleToggleActive(userId: string, isActive: boolean) {
    const res = await fetch(`/api/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive }),
    })
    if (res.ok) await reload()
  }

  return <UserTable users={users} onBonus={handleBonus} onToggleActive={handleToggleActive} />
}
