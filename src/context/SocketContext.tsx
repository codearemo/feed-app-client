import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { AUTH_EVENTS } from '../lib/auth/events'
import { tokenStore } from '../lib/api/token-store'
import { createSocket, updateSocketAuth, type AppSocket, type SocketConnectionStatus } from '../lib/socket'
import { bindSocketActivation } from '../lib/socket/bind-room'
import { useAuth } from './AuthContext'
import { SocketContext, type SocketContextValue } from './socket-context'

export function SocketProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  const socketRef = useRef<AppSocket | null>(null)
  const [socket, setSocket] = useState<AppSocket | null>(null)
  const [status, setStatus] = useState<SocketConnectionStatus>('idle')
  const [userId, setUserId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const closeSocketConnection = useCallback(() => {
    const current = socketRef.current

    if (current) {
      current.disconnect()
      socketRef.current = null
    }
  }, [])

  const resetSocketState = useCallback(() => {
    setSocket(null)
    setUserId(null)
    setError(null)
    setStatus('idle')
  }, [])

  const teardownSocket = useCallback(() => {
    closeSocketConnection()
    resetSocketState()
  }, [closeSocketConnection, resetSocketState])

  const attachSocketListeners = useCallback((instance: AppSocket) => {
    instance.on('connect', () => {
      setStatus('connected')
      setError(null)
    })

    instance.on('disconnect', () => {
      setStatus('disconnected')
      setUserId(null)
    })

    instance.on('connect_error', (connectError) => {
      setStatus('error')
      setError(connectError.message || 'Unable to connect to realtime service')
    })

    instance.io.on('reconnect_attempt', () => {
      setStatus('connecting')
    })

    instance.io.on('reconnect', () => {
      setStatus('connected')
      setError(null)
    })

    instance.io.on('reconnect_failed', () => {
      setStatus('error')
      setError('Lost connection to realtime service')
    })

    instance.on('connected', (payload) => {
      setUserId(payload.userId)
    })
  }, [])

  const connectSocket = useCallback(() => {
    const token = tokenStore.getAccessToken()

    if (!token) {
      return
    }

    teardownSocket()
    setStatus('connecting')

    const instance = createSocket(token)
    attachSocketListeners(instance)

    socketRef.current = instance
    setSocket(instance)
    instance.connect()
  }, [attachSocketListeners, teardownSocket])

  const reconnect = useCallback(() => {
    if (!isAuthenticated) {
      return
    }

    connectSocket()
  }, [connectSocket, isAuthenticated])

  useEffect(() => {
    if (!isAuthenticated) {
      closeSocketConnection()
      resetSocketState()
      return
    }

    const token = tokenStore.getAccessToken()

    if (!token) {
      return
    }

    closeSocketConnection()

    const instance = createSocket(token)
    attachSocketListeners(instance)
    socketRef.current = instance
    setSocket(instance)
    setStatus('connecting')
    instance.connect()

    return () => {
      closeSocketConnection()
      resetSocketState()
    }
  }, [isAuthenticated, attachSocketListeners, closeSocketConnection, resetSocketState])

  useEffect(() => {
    function handleTokenRefreshed() {
      const token = tokenStore.getAccessToken()
      const current = socketRef.current

      if (!token || !current) {
        return
      }

      updateSocketAuth(current, token)
      current.disconnect().connect()
    }

    function handleSessionExpired() {
      teardownSocket()
    }

    window.addEventListener(AUTH_EVENTS.tokenRefreshed, handleTokenRefreshed)
    window.addEventListener(AUTH_EVENTS.sessionExpired, handleSessionExpired)

    return () => {
      window.removeEventListener(AUTH_EVENTS.tokenRefreshed, handleTokenRefreshed)
      window.removeEventListener(AUTH_EVENTS.sessionExpired, handleSessionExpired)
    }
  }, [teardownSocket])

  const value = useMemo<SocketContextValue>(() => {
    if (!isAuthenticated) {
      return {
        socket: null,
        status: 'idle',
        isConnected: false,
        userId: null,
        error: null,
        reconnect,
      }
    }

    return {
      socket,
      status,
      isConnected: status === 'connected',
      userId,
      error,
      reconnect,
    }
  }, [isAuthenticated, socket, status, userId, error, reconnect])

  useEffect(() => {
    if (!socket || status !== 'connected') {
      return
    }

    const joinFeed = () => {
      socket.emit('feed:join')
    }

    const leaveFeed = () => {
      socket.emit('feed:leave')
    }

    const unbind = bindSocketActivation(socket, joinFeed)

    return () => {
      unbind()
      leaveFeed()
    }
  }, [socket, status])

  useEffect(() => {
    if (!socket || status !== 'connected') {
      return
    }

    socket.emit('presence:heartbeat')

    const interval = window.setInterval(() => {
      socket.emit('presence:heartbeat')
    }, 30_000)

    return () => {
      window.clearInterval(interval)
    }
  }, [socket, status])

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}
