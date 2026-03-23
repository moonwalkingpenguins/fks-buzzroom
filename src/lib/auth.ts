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
        const employeeCode = credentials?.employeeCode as string
        const password = credentials?.password as string
        if (!employeeCode || !password) return null
        const user = await prisma.user.findUnique({
          where: { employeeCode },
        })
        if (!user || !user.passwordHash) return null
        const ok = await bcrypt.compare(password, user.passwordHash)
        if (!ok) return null
        return { id: user.id, name: user.name, email: user.email ?? undefined, role: user.role }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.role = (user as any).role
      return token
    },
    session({ session, token }) {
      session.user.id = token.sub!
      ;(session.user as any).role = token.role as string
      return session
    },
  },
  pages: { signIn: '/login' },
  session: { strategy: 'jwt' },
})
