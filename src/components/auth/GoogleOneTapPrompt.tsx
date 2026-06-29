import { useGoogleOneTapPrompt } from '../../hooks/useGoogleOneTapPrompt'
import { useGoogleCredentialLogin } from '../../hooks/useGoogleCredentialLogin'

type GoogleOneTapPromptProps = {
  disabled?: boolean
}

/** Floating top-right Google One Tap prompt ("Sign in as …"). */
export function GoogleOneTapPrompt({ disabled = false }: GoogleOneTapPromptProps) {
  const handleSuccess = useGoogleCredentialLogin()

  useGoogleOneTapPrompt({
    disabled,
    onSuccess: (response) => void handleSuccess(response),
    onError: () => {
      // User dismissed or One Tap unavailable — form button remains as fallback.
    },
  })

  return null
}
