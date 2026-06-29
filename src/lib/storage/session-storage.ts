import { STORAGE_KEYS } from './keys'

function read(key: string) {
  return sessionStorage.getItem(key)
}

function write(key: string, value: string) {
  sessionStorage.setItem(key, value)
}

function remove(key: string) {
  sessionStorage.removeItem(key)
}

export const authSession = {
  getPendingVerifyEmail() {
    return read(STORAGE_KEYS.pendingVerifyEmail)
  },

  setPendingVerifyEmail(email: string) {
    write(STORAGE_KEYS.pendingVerifyEmail, email)
  },

  clearPendingVerifyEmail() {
    remove(STORAGE_KEYS.pendingVerifyEmail)
  },

  getTwoFactorToken() {
    return read(STORAGE_KEYS.twoFactorToken)
  },

  setTwoFactorToken(token: string) {
    write(STORAGE_KEYS.twoFactorToken, token)
  },

  clearTwoFactorToken() {
    remove(STORAGE_KEYS.twoFactorToken)
  },

  getResetPasswordEmail() {
    return read(STORAGE_KEYS.resetPasswordEmail)
  },

  setResetPasswordEmail(email: string) {
    write(STORAGE_KEYS.resetPasswordEmail, email)
  },

  clearResetPasswordEmail() {
    remove(STORAGE_KEYS.resetPasswordEmail)
  },

  getReturnTo() {
    return read(STORAGE_KEYS.authReturnTo)
  },

  setReturnTo(path: string) {
    write(STORAGE_KEYS.authReturnTo, path)
  },

  consumeReturnTo(fallback = '/posts') {
    const path = read(STORAGE_KEYS.authReturnTo) ?? fallback
    remove(STORAGE_KEYS.authReturnTo)
    return path
  },

  clearAuthFlow() {
    remove(STORAGE_KEYS.pendingVerifyEmail)
    remove(STORAGE_KEYS.twoFactorToken)
    remove(STORAGE_KEYS.resetPasswordEmail)
  },
}
