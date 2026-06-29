import type { SocketConnectionStatus } from '../../lib/socket'
import { useSocket } from '../../hooks/useSocket'
import { Button } from '../ui/Button'

const dotColors: Record<SocketConnectionStatus, string> = {
  connected: 'bg-green-500',
  connecting: 'bg-amber-500',
  disconnected: 'bg-surface-400 dark:bg-surface-500',
  error: 'bg-red-500',
  idle: 'bg-surface-300',
}

const statusLabels: Record<SocketConnectionStatus, string> = {
  connected: 'Realtime connected',
  connecting: 'Connecting to realtime…',
  disconnected: 'Realtime disconnected',
  error: 'Realtime connection failed',
  idle: 'Realtime offline',
}

type SocketPulseDotProps = {
  showLabel?: boolean
  iconOnly?: boolean
  size?: 'sm' | 'md'
}

export function SocketPulseDot({
  showLabel = false,
  iconOnly = false,
  size = 'sm',
}: SocketPulseDotProps) {
  const { status, error } = useSocket()

  if (status === 'idle') {
    return null
  }

  const shouldPulse = status === 'connected' || status === 'connecting'
  const dotSize = size === 'md' ? 'h-3 w-3' : 'h-2.5 w-2.5'
  const title = error ?? statusLabels[status]

  const dot = (
    <span className={`relative inline-flex ${dotSize}`} aria-hidden="true">
      {shouldPulse ? (
        <span
          className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${dotColors[status]}`}
        />
      ) : null}
      <span className={`relative inline-flex rounded-full ${dotSize} ${dotColors[status]}`} />
    </span>
  )

  if (iconOnly) {
    return (
      <span title={title} className="inline-flex">
        {dot}
        <span className="sr-only">{title}</span>
      </span>
    )
  }

  return (
    <div className="flex items-center gap-2" title={title}>
      {dot}
      {showLabel ? (
        <span className="text-xs font-medium text-surface-500 dark:text-surface-400">
          {status === 'connected' ? 'Live' : status === 'connecting' ? 'Connecting' : 'Offline'}
        </span>
      ) : null}
      <span className="sr-only">{title}</span>
    </div>
  )
}

export function SocketStatus() {
  const { status, error, reconnect } = useSocket()

  if (status === 'idle') {
    return null
  }

  return (
    <div className="flex items-center gap-2">
      <SocketPulseDot showLabel />
      {status === 'error' ? (
        <Button variant="ghost" size="sm" onClick={reconnect} title={error ?? undefined}>
          Retry
        </Button>
      ) : null}
    </div>
  )
}
