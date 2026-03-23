import { prisma } from './prisma'

const ACTIVE_STATUSES = ['created', 'lobby', 'in_progress', 'between_questions'] as const
const MAX_ATTEMPTS = 10

/**
 * Generate a unique 6-digit PIN not currently in use by active sessions.
 * @throws If unable to generate a unique PIN after MAX_ATTEMPTS tries.
 */
export async function generateUniquePin(): Promise<string> {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const pin = String(Math.floor(100000 + Math.random() * 900000))
    const existing = await prisma.gameSession.findFirst({
      where: { pin, status: { in: ACTIVE_STATUSES } },
      select: { id: true },
    })
    if (!existing) return pin
  }
  throw new Error(`Could not generate unique PIN after ${MAX_ATTEMPTS} attempts`)
}
