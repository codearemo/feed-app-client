import { apiClient } from './client'
import { AUTH_EVENTS, dispatchAuthEvent } from '../auth/events'
import { unwrapData, unwrapMessage, unwrapSuccess } from './request'
import { tokenStore } from './token-store'
import type {
  AuthSuccess,
  ConfirmTwoFactorBody,
  DisableTwoFactorBody,
  ForgotPasswordBody,
  LoginBody,
  LoginResult,
  RegisterBody,
  ResetPasswordBody,
  ResendVerificationBody,
  SocialLoginBody,
  TokenPair,
  TwoFactorSetup,
  User,
  VerifyEmailBody,
  VerifyTwoFactorBody,
} from './types'

function persistAuthTokens(result: LoginResult) {
  if (result.requiresTwoFactor === false) {
    tokenStore.setTokens(result.token, result.refreshToken)
  }
}

export const authApi = {
  register(body: RegisterBody) {
    return apiClient.post('/auth/register', body).then((response) => unwrapData<User>(response))
  },

  verifyEmail(body: VerifyEmailBody) {
    return apiClient.post('/auth/verify-email', body).then((response) => unwrapData<User>(response))
  },

  resendVerification(body: ResendVerificationBody) {
    return apiClient
      .post('/auth/resend-verification', body)
      .then((response) => unwrapMessage(response))
  },

  async login(body: LoginBody) {
    const result = await apiClient
      .post('/auth/login', body)
      .then((response) => unwrapData<LoginResult>(response))

    persistAuthTokens(result)
    return result
  },

  async socialLogin(body: SocialLoginBody) {
    const result = await apiClient
      .post('/auth/social', body)
      .then((response) => unwrapData<LoginResult>(response))

    persistAuthTokens(result)
    return result
  },

  async verifyTwoFactor(body: VerifyTwoFactorBody) {
    const result = await apiClient
      .post('/auth/2fa/verify', body)
      .then((response) => unwrapData<AuthSuccess>(response))

    tokenStore.setTokens(result.token, result.refreshToken)
    return result
  },

  async refresh(refreshToken = tokenStore.getRefreshToken()) {
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    const tokens = await apiClient
      .post('/auth/refresh', { refreshToken })
      .then((response) => unwrapData<TokenPair>(response))

    tokenStore.setTokens(tokens.token, tokens.refreshToken)
    dispatchAuthEvent(AUTH_EVENTS.tokenRefreshed, { token: tokens.token })
    return tokens
  },

  async logout(refreshToken = tokenStore.getRefreshToken()) {
    if (refreshToken) {
      await apiClient.post('/auth/logout', { refreshToken }).then((response) => unwrapMessage(response))
    }

    tokenStore.clear()
  },

  forgotPassword(body: ForgotPasswordBody) {
    return apiClient.post('/auth/forgot-password', body).then((response) => unwrapMessage(response))
  },

  resetPassword(body: ResetPasswordBody) {
    return apiClient.post('/auth/reset-password', body).then((response) => unwrapMessage(response))
  },

  setupTwoFactor() {
    return apiClient.post('/auth/2fa/setup').then((response) => unwrapData<TwoFactorSetup>(response))
  },

  confirmTwoFactor(body: ConfirmTwoFactorBody) {
    return apiClient
      .post('/auth/2fa/confirm', body)
      .then((response) => unwrapSuccess<{ twoFactorEnabled: boolean }>(response))
  },

  disableTwoFactor(body: DisableTwoFactorBody) {
    return apiClient
      .post('/auth/2fa/disable', body)
      .then((response) => unwrapSuccess<{ twoFactorEnabled: boolean }>(response))
  },
}
