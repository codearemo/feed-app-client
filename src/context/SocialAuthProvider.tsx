import type { ReactNode } from 'react'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { apiConfig } from '../lib/api/config'
import { isGoogleAuthEnabled } from '../lib/auth/social-providers'

type SocialAuthProviderProps = {
  children: ReactNode
}

export function SocialAuthProvider({ children }: SocialAuthProviderProps) {
  if (!isGoogleAuthEnabled()) {
    return children
  }

  return <GoogleOAuthProvider clientId={apiConfig.googleClientId}>{children}</GoogleOAuthProvider>
}
