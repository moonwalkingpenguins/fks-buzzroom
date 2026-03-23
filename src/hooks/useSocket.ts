'use client'
import { useEffect, useRef, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'

let globalSocket: Socket | null = null

export function useSocket() {
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (!globalSocket) {
      globalSocket = io({
        path: '/api/socket',
        transports: ['websocket', 'polling'],
      })
    }
    socketRef.current = globalSocket

    return () => {
      // Don't disconnect on component unmount — connection is shared
    }
  }, [])

  const on = useCallback(<T>(event: string, handler: (data: T) => void) => {
    socketRef.current?.on(event, handler)
    return () => {
      socketRef.current?.off(event, handler)
    }
  }, [])

  const emit = useCallback((event: string, data?: unknown) => {
    socketRef.current?.emit(event, data)
  }, [])

  return { socket: socketRef.current, on, emit }
}
