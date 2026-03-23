'use client'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

interface User {
  id: string
  name: string
  employeeCode: string | null
  role: string
  creditsBalance: number
  isActive: boolean
}

interface UserTableProps {
  users: User[]
  onBonus: (userId: string, amount: number, reason: string) => Promise<void>
  onToggleActive: (userId: string, isActive: boolean) => Promise<void>
}

export function UserTable({ users, onBonus, onToggleActive }: UserTableProps) {
  const [bonusDialog, setBonusDialog] = useState<User | null>(null)
  const [bonusAmount, setBonusAmount] = useState('')
  const [bonusReason, setBonusReason] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleBonus() {
    if (!bonusDialog) return
    const amount = parseInt(bonusAmount, 10)
    if (isNaN(amount) || amount <= 0) return
    setLoading(true)
    await onBonus(bonusDialog.id, amount, bonusReason)
    setBonusDialog(null)
    setBonusAmount('')
    setBonusReason('')
    setLoading(false)
  }

  const ROLE_COLORS: Record<string, string> = {
    super_admin: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    admin: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    player: 'bg-[#FAD200]/20 text-[#FAD200] border-[#FAD200]/30',
  }

  return (
    <>
      <div className="bg-[#17171C] border border-[#2E2E33] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#2E2E33] text-[#71717A]">
              <th className="text-left px-4 py-3">Nama</th>
              <th className="text-left px-4 py-3">Kode</th>
              <th className="text-left px-4 py-3">Role</th>
              <th className="text-right px-4 py-3">Kredit</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-right px-4 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="border-b border-[#2E2E33]/50 hover:bg-[#1C1C22]">
                <td className="px-4 py-3 text-white font-medium">{user.name}</td>
                <td className="px-4 py-3 text-[#71717A] font-mono text-xs">{user.employeeCode}</td>
                <td className="px-4 py-3">
                  <Badge className={ROLE_COLORS[user.role] || ROLE_COLORS.player}>
                    {user.role}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right text-[#FAD200] font-mono">{user.creditsBalance}</td>
                <td className="px-4 py-3">
                  <Badge className={user.isActive ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}>
                    {user.isActive ? 'Aktif' : 'Nonaktif'}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2 justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setBonusDialog(user)}
                      className="border-[#2E2E33] text-[#A1A1AA] hover:text-[#FAD200] hover:border-[#FAD200] text-xs"
                    >
                      + Kredit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onToggleActive(user.id, !user.isActive)}
                      className={`border-[#2E2E33] text-xs ${user.isActive ? 'text-red-400 hover:border-red-400' : 'text-green-400 hover:border-green-400'}`}
                    >
                      {user.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={!!bonusDialog} onOpenChange={() => setBonusDialog(null)}>
        <DialogContent className="bg-[#17171C] border-[#2E2E33] text-white">
          <DialogHeader>
            <DialogTitle>Bonus Kredit — {bonusDialog?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Jumlah Kredit</Label>
              <Input
                type="number"
                value={bonusAmount}
                onChange={e => setBonusAmount(e.target.value)}
                placeholder="Contoh: 50"
                className="bg-[#1C1C22] border-[#2E2E33] text-white"
                min={1}
              />
            </div>
            <div className="space-y-2">
              <Label>Alasan *</Label>
              <Input
                value={bonusReason}
                onChange={e => setBonusReason(e.target.value)}
                placeholder="Contoh: Juara pelatihan K3 Q1 2026"
                className="bg-[#1C1C22] border-[#2E2E33] text-white"
              />
            </div>
            <Button
              onClick={handleBonus}
              disabled={loading || !bonusAmount || !bonusReason.trim()}
              className="w-full bg-[#FAD200] text-[#09090B] font-bold hover:bg-[#E5B818] disabled:opacity-50"
            >
              {loading ? 'Memproses...' : 'Berikan Bonus'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
