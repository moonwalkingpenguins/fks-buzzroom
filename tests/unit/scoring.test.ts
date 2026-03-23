import { describe, it, expect } from 'vitest'
import { calculateScore, applyStreak } from '@/lib/scoring'

describe('calculateScore', () => {
  it('returns base * ratio, minimum 100', () => {
    expect(calculateScore(20000, 20000)).toBe(1000) // jawab langsung
    expect(calculateScore(0, 20000)).toBe(100)       // mepet waktu = minimum
    expect(calculateScore(10000, 20000)).toBe(500)   // setengah waktu
  })
  it('returns 0 for wrong answer (null time)', () => {
    expect(calculateScore(null, 20000)).toBe(0)
  })
})

describe('applyStreak', () => {
  it('adds 100 per streak after 1', () => {
    expect(applyStreak(500, 3)).toBe(800) // streak 3: +200 bonus
  })
  it('no bonus for streak 0 or 1', () => {
    expect(applyStreak(500, 0)).toBe(500)
    expect(applyStreak(500, 1)).toBe(500)
  })
})
