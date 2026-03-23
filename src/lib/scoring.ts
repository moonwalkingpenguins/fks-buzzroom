const BASE_POIN = 1000
const MIN_POIN = 100

/**
 * Calculate score based on time remaining.
 * Formula: BASE_POIN * max(MIN_RATIO, timeRemaining / totalDuration)
 * Minimum score is 100 (10% of base) for any correct answer.
 * @param timeRemainingMs - null means wrong/no answer = 0 points. Negative values treated as 0.
 * @param totalDurationMs - total question duration in ms
 */
export function calculateScore(timeRemainingMs: number | null, totalDurationMs: number): number {
  if (timeRemainingMs === null) return 0
  const safetime = Math.max(0, timeRemainingMs)
  const ratio = Math.max(MIN_POIN / BASE_POIN, safetime / totalDurationMs)
  return Math.round(BASE_POIN * ratio)
}

/**
 * Apply streak bonus: +100 × streak for consecutive correct answers (starting at streak 2).
 * streak=0,1 → no bonus; streak=2 → +200; streak=3 → +300; etc.
 */
export function applyStreak(score: number, streak: number): number {
  if (streak < 2) return score
  return score + streak * 100
}
