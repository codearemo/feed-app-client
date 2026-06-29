import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { AUTH_EVENTS, dispatchAuthEvent } from '../auth/events'
import { apiConfig } from './config'
import { ApiError, toApiError } from './errors'
import { tokenStore } from './token-store'
import type { ApiErrorBody, ApiSuccessBody, TokenPair } from './types'

type RetryConfig = InternalAxiosRequestConfig & {
  _retry?: boolean
}

const REFRESH_PATH = '/auth/refresh'

const apiClient = axios.create({
  baseURL: apiConfig.baseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: apiConfig.timeoutMs,
})

let refreshPromise: Promise<TokenPair> | null = null

function shouldSkipRefresh(url?: string) {
  if (!url) return true

  return (
    url.includes('/auth/login') ||
    url.includes('/auth/register') ||
    url.includes('/auth/social') ||
    url.includes('/auth/2fa/verify') ||
    url.includes('/auth/forgot-password') ||
    url.includes('/auth/reset-password') ||
    url.includes('/auth/verify-email') ||
    url.includes('/auth/resend-verification') ||
    url.includes(REFRESH_PATH)
  )
}

async function refreshAccessToken(): Promise<TokenPair> {
  const refreshToken = tokenStore.getRefreshToken()

  if (!refreshToken) {
    throw new ApiError('Authentication required', 401)
  }

  const response = await axios.post<ApiSuccessBody<TokenPair>>(
    `${apiConfig.baseUrl}${REFRESH_PATH}`,
    { refreshToken },
    {
      headers: { 'Content-Type': 'application/json' },
      timeout: apiConfig.timeoutMs,
    },
  )

  const tokens = response.data.data
  tokenStore.setTokens(tokens.token, tokens.refreshToken)
  dispatchAuthEvent(AUTH_EVENTS.tokenRefreshed, { token: tokens.token })

  return tokens
}

apiClient.interceptors.request.use((config) => {
  const token = tokenStore.getAccessToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorBody>) => {
    const originalRequest = error.config as RetryConfig | undefined

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !shouldSkipRefresh(originalRequest.url)
    ) {
      originalRequest._retry = true

      try {
        refreshPromise ??= refreshAccessToken()
        const tokens = await refreshPromise
        refreshPromise = null

        originalRequest.headers.Authorization = `Bearer ${tokens.token}`
        return apiClient(originalRequest)
      } catch (refreshError) {
        refreshPromise = null
        tokenStore.clear()
        dispatchAuthEvent(AUTH_EVENTS.sessionExpired)
        return Promise.reject(toApiError(refreshError))
      }
    }

    const apiError = toApiError(error)

    if (apiError.isEmailNotVerified) {
      dispatchAuthEvent(AUTH_EVENTS.emailNotVerified, { message: apiError.message })
    }

    return Promise.reject(apiError)
  },
)

export { apiClient }
