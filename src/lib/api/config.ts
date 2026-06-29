const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1'

export function isProxiedDevApi() {
  return !baseUrl.startsWith('http')
}

/** Backend origin for Socket.IO — same as the page when using the Vite proxy. */
export function getApiOrigin() {
  const explicit = import.meta.env.VITE_API_ORIGIN
  if (explicit) {
    return explicit
  }

  if (isProxiedDevApi()) {
    if (typeof window !== 'undefined') {
      return window.location.origin
    }

    return import.meta.env.VITE_API_PROXY_TARGET || 'http://localhost:3000'
  }

  return baseUrl.replace(/\/api\/v1\/?$/, '') || 'http://localhost:3000'
}

export function getHealthUrl() {
  return isProxiedDevApi() ? '/health' : `${getApiOrigin().replace(/\/$/, '')}/health`
}

export const apiConfig = {
  baseUrl,
  socketPath: '/socket.io',
  timeoutMs: 10_000,
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '',
  appleClientId: import.meta.env.VITE_APPLE_CLIENT_ID ?? '',
} as const
