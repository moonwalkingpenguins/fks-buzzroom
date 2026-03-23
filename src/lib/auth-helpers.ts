import { auth } from './auth'
import { NextResponse } from 'next/server'

type Role = 'super_admin' | 'admin' | 'player'

/**
 * Get authenticated session. Returns 401 response if not authenticated.
 * Returns 403 response if role requirement not met.
 */
export async function requireAuth(requiredRole?: Role) {
  const session = await auth()
  if (!session) {
    return { session: null, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
  if (requiredRole) {
    const userRole = (session.user as { role?: string }).role
    const roleHierarchy: Record<string, number> = { player: 0, admin: 1, super_admin: 2 }
    const required = roleHierarchy[requiredRole] ?? 0
    const actual = roleHierarchy[userRole ?? 'player'] ?? 0
    if (actual < required) {
      return { session: null, error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
    }
  }
  return { session, error: null }
}
