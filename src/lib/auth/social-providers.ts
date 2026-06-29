import { apiConfig } from '../api/config'

export type SocialProvider = 'google' | 'apple'

export function isGoogleAuthEnabled() {
  return Boolean(apiConfig.googleClientId)
}

export function isAppleAuthEnabled() {
  return Boolean(apiConfig.appleClientId)
}

export function isSocialAuthEnabled() {
  return isGoogleAuthEnabled() || isAppleAuthEnabled()
}

export function getEnabledSocialProviders(): SocialProvider[] {
  const providers: SocialProvider[] = []

  if (isGoogleAuthEnabled()) {
    providers.push('google')
  }

  if (isAppleAuthEnabled()) {
    providers.push('apple')
  }

  return providers
}
