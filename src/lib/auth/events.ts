export const AUTH_EVENTS = {
  sessionExpired: 'auth:session-expired',
  emailNotVerified: 'auth:email-not-verified',
  tokenRefreshed: 'auth:token-refreshed',
} as const

export function dispatchAuthEvent(eventName: string, detail?: unknown) {
  window.dispatchEvent(new CustomEvent(eventName, { detail }))
}
