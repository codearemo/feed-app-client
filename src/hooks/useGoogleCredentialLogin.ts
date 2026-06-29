import { useCallback } from 'react'
import type { CredentialResponse } from '@react-oauth/google'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { getErrorMessage } from '../lib/forms/getFieldErrors'

export function useGoogleCredentialLogin(onBusyChange?: (busy: boolean) => void) {
  const { socialLogin } = useAuth()
  const toast = useToast()

  return useCallback(
    async (response: CredentialResponse) => {
      if (!response.credential) {
        toast.error('Google did not return a sign-in token')
        return
      }

      onBusyChange?.(true)

      try {
        await socialLogin('google', response.credential)
      } catch (error) {
        toast.error(getErrorMessage(error, 'Google sign in failed'))
      } finally {
        onBusyChange?.(false)
      }
    },
    [onBusyChange, socialLogin, toast],
  )
}
