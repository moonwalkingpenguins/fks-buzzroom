import { prisma } from './prisma'

const ACTIVE_STATUSES = ['created', 'lobby', 'in_progress', 'between_questions'] as const

/**
 * Generate a unique 6-digit PIN not currently in use by active sessions.
 */
export async function generateUniquePin(): Promise<string> {
  let pin: string
  let exists = true
  do {
    pin = String(Math.floor(100000 + Math.random() * 900000))
    const session = await prisma.gameSession.findFirst({
      where: { pin, status: { in: ACTIVE_STATUSES } },
      select: { id: true },
    })
    exists = !!session
  } while (exists)
  return pin
}
