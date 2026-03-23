'use client'
import { useEffect, useRef, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'

// Module-level singleton for connection sharing within one browser tab.
// Each browser tab has its own JS module scope, so tabs are isolated.
// For test isolation: call resetSocket() in test teardown.
let globalSocket: Socket | null = null

export function resetSocket(): void {
  if (globalSocket) {
    globalSocket.disconnect()
    globalSocket = null
  }
}

function getOrCreateSocket(): Socket {
  if (!globalSocket) {
    globalSocket = io({
      path: '/api/socket',
      transports: ['websocket', 'polling'],
    })
  }
  return globalSocket
}

export function useSocket() {
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    socketRef.current = getOrCreateSocket()
    // Don't disconnect on unmount — socket is shared across components
    return () => {}
  }, [])

  /**
   * Subscribe to a socket event. Returns a cleanup function — MUST be called
   * in useEffect cleanup to prevent listener accumulation.
   *
   * Usage:
   * ```ts
   * useEffect(() => {
   *   return on('event', handler)
   * }, [on])
   * ```
   */
  const on = useCallback(<T>(event: string, handler: (data: T) => void): (() => void) => {
    const socket = socketRef.current
    if (!socket) return () => {}
    socket.on(event, handler)
    return () => socket.off(event, handler)
  }, [])

  const emit = useCallback((event: string, data?: unknown) => {
    socketRef.current?.emit(event, data)
  }, [])

  return { socket: socketRef.current, on, emit }
}
