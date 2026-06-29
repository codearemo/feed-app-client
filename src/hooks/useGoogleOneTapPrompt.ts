import { useEffect, useRef } from 'react'
import type { CredentialResponse } from '@react-oauth/google'
import { useGoogleOAuth } from '@react-oauth/google'
import { useTheme } from '../context/ThemeContext'
import { getGoogleColorScheme, getGoogleIdentity } from '../lib/auth/google-gis'

type UseGoogleOneTapPromptOptions = {
  disabled?: boolean
  onSuccess: (response: CredentialResponse) => void
  onError?: () => void
}

/** One Tap with `color_scheme` synced to the app theme (not supported by the library hook). */
export function useGoogleOneTapPrompt({
  disabled = false,
  onSuccess,
  onError,
}: UseGoogleOneTapPromptOptions) {
  const { clientId, scriptLoadedSuccessfully } = useGoogleOAuth()
  const { theme } = useTheme()
  const colorScheme = getGoogleColorScheme(theme)
  const onSuccessRef = useRef(onSuccess)
  const onErrorRef = useRef(onError)

  onSuccessRef.current = onSuccess
  onErrorRef.current = onError

  useEffect(() => {
    if (!scriptLoadedSuccessfully) {
      return
    }

    const googleId = getGoogleIdentity()

    if (!googleId) {
      return
    }

    if (disabled) {
      googleId.cancel()
      return
    }

    googleId.initialize({
      client_id: clientId,
      color_scheme: colorScheme,
      auto_select: false,
      cancel_on_tap_outside: true,
      use_fedcm_for_prompt: false,
      use_fedcm_for_button: false,
      callback: (credentialResponse: CredentialResponse) => {
        if (!credentialResponse?.credential) {
          onErrorRef.current?.()
          return
        }

        onSuccessRef.current({
          credential: credentialResponse.credential,
          clientId: credentialResponse.clientId,
          select_by: credentialResponse.select_by,
        })
      },
    })

    googleId.prompt()

    return () => {
      googleId.cancel()
    }
  }, [clientId, colorScheme, disabled, scriptLoadedSuccessfully])
}
