import { io } from 'socket.io-client'
import { apiConfig, getApiOrigin } from '../api/config'
import type { AppSocket } from './types'

export function createSocket(token: string): AppSocket {
  return io(getApiOrigin(), {
    path: apiConfig.socketPath,
    auth: { token },
    extraHeaders: {
      Authorization: `Bearer ${token}`,
    },
    transports: ['websocket', 'polling'],
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1_000,
    reconnectionDelayMax: 5_000,
    timeout: 10_000,
  })
}

export function updateSocketAuth(socket: AppSocket, token: string) {
  socket.auth = { token }
  ;(socket.io.opts as { extraHeaders?: Record<string, string> }).extraHeaders = {
    Authorization: `Bearer ${token}`,
  }
}
