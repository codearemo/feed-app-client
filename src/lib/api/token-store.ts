const ACCESS_TOKEN_KEY = 'feed-app-access-token'
const REFRESH_TOKEN_KEY = 'feed-app-refresh-token'

let accessToken: string | null = null

function readStoredAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

function readStoredRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export const tokenStore = {
  getAccessToken() {
    return accessToken ?? readStoredAccessToken()
  },

  getRefreshToken() {
    return readStoredRefreshToken()
  },

  setTokens(nextAccessToken: string, nextRefreshToken: string) {
    accessToken = nextAccessToken
    localStorage.setItem(ACCESS_TOKEN_KEY, nextAccessToken)
    localStorage.setItem(REFRESH_TOKEN_KEY, nextRefreshToken)
  },

  setAccessToken(nextAccessToken: string) {
    accessToken = nextAccessToken
    localStorage.setItem(ACCESS_TOKEN_KEY, nextAccessToken)
  },

  clear() {
    accessToken = null
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
  },

  hasSession() {
    return Boolean(this.getAccessToken() && this.getRefreshToken())
  },
}
