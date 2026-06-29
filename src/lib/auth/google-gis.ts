import type { CredentialResponse } from '@react-oauth/google'

export type GoogleColorScheme = 'light' | 'dark'

export function getGoogleColorScheme(theme: 'light' | 'dark'): GoogleColorScheme {
  return theme === 'dark' ? 'dark' : 'light'
}

type GoogleIdConfiguration = {
  client_id: string
  color_scheme?: GoogleColorScheme
  auto_select?: boolean
  cancel_on_tap_outside?: boolean
  use_fedcm_for_prompt?: boolean
  use_fedcm_for_button?: boolean
  callback: (credentialResponse: CredentialResponse) => void
}

type GoogleIdentity = {
  initialize: (config: GoogleIdConfiguration) => void
  prompt: () => void
  cancel: () => void
}

export function getGoogleIdentity(): GoogleIdentity | undefined {
  return (window as Window & { google?: { accounts?: { id?: GoogleIdentity } } }).google?.accounts
    ?.id
}
