import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useSocket } from '../hooks/useSocket'

type PresenceContextValue = {
  isUserOnline: (userId: string | undefined) => boolean
}

const PresenceContext = createContext<PresenceContextValue | null>(null)

function addUserId(set: Set<string>, userId: string) {
  const next = new Set(set)
  next.add(userId)
  return next
}

function removeUserId(set: Set<string>, userId: string) {
  const next = new Set(set)
  next.delete(userId)
  return next
}

export function PresenceProvider({ children }: { children: ReactNode }) {
  const { socket, isConnected, userId } = useSocket()
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(() => new Set())

  useEffect(() => {
    if (!socket) {
      return
    }

    function handleOnline({ userId: onlineUserId }: { userId: string }) {
      setOnlineUserIds((current) => addUserId(current, onlineUserId))
    }

    function handleOffline({ userId: offlineUserId }: { userId: string }) {
      setOnlineUserIds((current) => removeUserId(current, offlineUserId))
    }

    socket.on('presence:online', handleOnline)
    socket.on('presence:offline', handleOffline)

    return () => {
      socket.off('presence:online', handleOnline)
      socket.off('presence:offline', handleOffline)
    }
  }, [socket])

  useEffect(() => {
    if (!userId) {
      return
    }

    if (isConnected) {
      setOnlineUserIds((current) => addUserId(current, userId))
      return
    }

    setOnlineUserIds((current) => removeUserId(current, userId))
  }, [isConnected, userId])

  const isUserOnline = useCallback(
    (id: string | undefined) => {
      if (!id) {
        return false
      }

      return onlineUserIds.has(id)
    },
    [onlineUserIds],
  )

  const value = useMemo(() => ({ isUserOnline }), [isUserOnline])

  return <PresenceContext.Provider value={value}>{children}</PresenceContext.Provider>
}

export function usePresence() {
  const context = useContext(PresenceContext)

  if (!context) {
    throw new Error('usePresence must be used within PresenceProvider')
  }

  return context
}
