import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { UsersClient } from '@/components/admin/UsersClient'

export default async function UsersPage() {
  const session = await auth()
  if (!session) redirect('/login')

  const users = await prisma.user.findMany({
    select: {
      id: true, name: true, employeeCode: true, role: true,
      creditsBalance: true, isActive: true, createdAt: true,
    },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Manajemen Karyawan</h1>
          <p className="text-[#71717A] text-sm mt-1">{users.length} karyawan terdaftar</p>
        </div>
      </div>
      <UsersClient initialUsers={users} />
    </div>
  )
}
