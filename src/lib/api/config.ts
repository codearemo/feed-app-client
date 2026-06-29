function normalizePath(path: string) {
  return path.startsWith('/') ? path : `/${path}`
}

function resolveApiBaseUrl() {
  const configured = import.meta.env.VITE_API_BASE_URL || '/api/v1'

  if (configured.startsWith('http')) {
    return configured.replace(/\/$/, '')
  }

  // Relative URL — Vite dev proxy forwards /api to the backend.
  if (import.meta.env.DEV) {
    return configured
  }

  // Production static hosting (e.g. Vercel): relative /api/v1 would hit the frontend domain.
  const origin = import.meta.env.VITE_API_ORIGIN?.replace(/\/$/, '')
  if (origin) {
    return `${origin}${normalizePath(configured)}`
  }

  if (typeof window !== 'undefined') {
    console.warn(
      '[feed-app] Set VITE_API_ORIGIN or an absolute VITE_API_BASE_URL in production. ' +
        'API calls are currently targeting the frontend host.',
    )
  }

  return configured
}

const baseUrl = resolveApiBaseUrl()

export function isProxiedDevApi() {
  const configured = import.meta.env.VITE_API_BASE_URL || '/api/v1'
  return import.meta.env.DEV && !configured.startsWith('http')
}

/** Backend origin for Socket.IO */
export function getApiOrigin() {
  const explicit = import.meta.env.VITE_API_ORIGIN
  if (explicit) {
    return explicit.replace(/\/$/, '')
  }

  if (baseUrl.startsWith('http')) {
    return baseUrl.replace(/\/api\/v1\/?$/, '')
  }

  if (import.meta.env.DEV && typeof window !== 'undefined') {
    return window.location.origin
  }

  if (import.meta.env.DEV) {
    return import.meta.env.VITE_API_PROXY_TARGET || 'http://localhost:3000'
  }

  return typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
}

export function getHealthUrl() {
  if (isProxiedDevApi()) {
    return '/health'
  }

  return `${getApiOrigin().replace(/\/$/, '')}/health`
}

export const apiConfig = {
  baseUrl,
  socketPath: '/socket.io',
  timeoutMs: 10_000,
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '',
  appleClientId: import.meta.env.VITE_APPLE_CLIENT_ID ?? '',
} as const
