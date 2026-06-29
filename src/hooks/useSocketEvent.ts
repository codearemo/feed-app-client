import { useEffect } from 'react'
import { useSocket } from './useSocket'
import type { ServerToClientEvents } from '../lib/socket/types'

export function useSocketEvent<E extends keyof ServerToClientEvents>(
  event: E,
  handler: ServerToClientEvents[E],
  enabled = true,
) {
  const { socket } = useSocket()

  useEffect(() => {
    if (!socket || !enabled) {
      return
    }

    socket.on(event, handler as never)

    return () => {
      socket.off(event, handler as never)
    }
  }, [socket, event, handler, enabled])
}
