import type { AppSocket } from './types'

/** Re-run when the socket connects, reconnects, or the server sends `connected`. */
export function bindSocketActivation(socket: AppSocket, onActive: () => void) {
  const run = () => {
    if (socket.connected) {
      onActive()
    }
  }

  socket.on('connect', run)
  socket.on('connected', run)
  socket.io.on('reconnect', run)
  run()

  return () => {
    socket.off('connect', run)
    socket.off('connected', run)
    socket.io.off('reconnect', run)
  }
}
