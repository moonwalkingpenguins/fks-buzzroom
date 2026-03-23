import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        employeeCode: { label: 'Kode Karyawan' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const employeeCode = credentials?.employeeCode
        const password = credentials?.password
        if (typeof employeeCode !== 'string' || employeeCode.length > 50) return null
        if (typeof password !== 'string' || password.length > 128) return null

        const user = await prisma.user.findUnique({
          where: { employeeCode },
        })
        if (!user || !user.passwordHash || !user.isActive) return null
        const ok = await bcrypt.compare(password, user.passwordHash)
        if (!ok) return null
        return { id: user.id, name: user.name, email: user.email ?? undefined, role: user.role }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.role = (user as { role: string }).role
      return token
    },
    session({ session, token }) {
      session.user.id = token.sub ?? ''
      ;(session.user as { id: string; role?: string }).role = token.role as string
      return session
    },
  },
  pages: { signIn: '/login' },
  session: { strategy: 'jwt' },
})
