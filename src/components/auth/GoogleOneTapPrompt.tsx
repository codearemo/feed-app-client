import { useGoogleOneTapLogin } from '@react-oauth/google'
import { useGoogleCredentialLogin } from '../../hooks/useGoogleCredentialLogin'

type GoogleOneTapPromptProps = {
  disabled?: boolean
}

/** Floating top-right Google One Tap prompt ("Sign in as …"). */
export function GoogleOneTapPrompt({ disabled = false }: GoogleOneTapPromptProps) {
  const handleSuccess = useGoogleCredentialLogin()

  useGoogleOneTapLogin({
    disabled,
    cancel_on_tap_outside: true,
    onSuccess: (response) => void handleSuccess(response),
    onError: () => {
      // User dismissed or One Tap unavailable — form button remains as fallback.
    },
  })

  return null
}
