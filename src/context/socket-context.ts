import { createContext } from 'react'
import type { AppSocket, SocketConnectionStatus } from '../lib/socket'

export type SocketContextValue = {
  socket: AppSocket | null
  status: SocketConnectionStatus
  isConnected: boolean
  userId: string | null
  error: string | null
  reconnect: () => void
}

export const SocketContext = createContext<SocketContextValue | null>(null)
