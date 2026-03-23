import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/login')
  if (!['admin', 'super_admin'].includes((session.user as any).role)) redirect('/login')

  return (
    <div className="min-h-screen bg-[#09090B]">
      <nav className="border-b border-[#2E2E33] bg-[#17171C] px-6 py-3 flex items-center gap-6">
        <span className="text-[#FAD200] font-bold text-sm tracking-widest">⚡ FKS BUZZROOM</span>
        <div className="flex gap-4 text-sm">
          <a href="/dashboard" className="text-[#A1A1AA] hover:text-white transition-colors">Dashboard</a>
          <a href="/quizzes" className="text-[#A1A1AA] hover:text-white transition-colors">Quiz</a>
          <a href="/users" className="text-[#A1A1AA] hover:text-white transition-colors">Karyawan</a>
          <a href="/rewards" className="text-[#A1A1AA] hover:text-white transition-colors">Reward</a>
        </div>
        <div className="ml-auto text-[#71717A] text-sm">{session.user.name}</div>
      </nav>
      <main className="p-6">{children}</main>
    </div>
  )
}
