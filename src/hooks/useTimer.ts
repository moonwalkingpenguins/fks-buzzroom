'use client'
import { useState, useEffect, useRef } from 'react'

export function useTimer(durationSecs: number, onExpire?: () => void) {
  const [remaining, setRemaining] = useState(durationSecs)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const onExpireRef = useRef(onExpire)
  onExpireRef.current = onExpire

  useEffect(() => {
    setRemaining(durationSecs)
    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!)
          onExpireRef.current?.()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current!)
  }, [durationSecs])

  const progress = durationSecs > 0 ? remaining / durationSecs : 1

  return { remaining, progress }
}
