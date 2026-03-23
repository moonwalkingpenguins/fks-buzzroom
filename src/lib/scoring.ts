const BASE_POIN = 1000
const MIN_POIN = 100

/**
 * Calculate score based on time remaining.
 * @param timeRemainingMs - null means wrong/no answer = 0 points
 * @param totalDurationMs - total question duration in ms
 */
export function calculateScore(timeRemainingMs: number | null, totalDurationMs: number): number {
  if (timeRemainingMs === null) return 0
  const ratio = Math.max(MIN_POIN / BASE_POIN, timeRemainingMs / totalDurationMs)
  return Math.round(BASE_POIN * ratio)
}

/**
 * Apply streak bonus: +100 per consecutive correct answer starting from streak 2.
 */
export function applyStreak(score: number, streak: number): number {
  if (streak < 2) return score
  return score + streak * 100
}
