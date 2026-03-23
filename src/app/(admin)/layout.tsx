import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/login')
  const role = (session.user as { role?: string }).role
  if (!['admin', 'super_admin'].includes(role ?? '')) redirect('/login')

  return (
    <div className="min-h-screen bg-[#09090B]">
      <nav className="border-b border-[#2E2E33] bg-[#17171C] px-6 py-3 flex items-center gap-6">
        <span className="text-[#FAD200] font-bold text-sm tracking-widest">⚡ FKS BUZZROOM</span>
        <div className="flex gap-4 text-sm">
          <Link href="/dashboard" className="text-[#A1A1AA] hover:text-white transition-colors">Dashboard</Link>
          <Link href="/quizzes" className="text-[#A1A1AA] hover:text-white transition-colors">Quiz</Link>
          <Link href="/users" className="text-[#A1A1AA] hover:text-white transition-colors">Karyawan</Link>
          <Link href="/rewards" className="text-[#A1A1AA] hover:text-white transition-colors">Reward</Link>
        </div>
        <div className="ml-auto text-[#71717A] text-sm">{session.user.name}</div>
      </nav>
      <main className="p-6">{children}</main>
    </div>
  )
}
