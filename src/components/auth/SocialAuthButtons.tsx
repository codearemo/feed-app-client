import { useEffect, useRef, useState } from 'react'
import { GoogleLogin } from '@react-oauth/google'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { useGoogleCredentialLogin } from '../../hooks/useGoogleCredentialLogin'
import { signInWithApple } from '../../lib/auth/apple-sign-in'
import {
  isAppleAuthEnabled,
  isGoogleAuthEnabled,
  isSocialAuthEnabled,
} from '../../lib/auth/social-providers'
import { apiConfig } from '../../lib/api/config'
import { getErrorMessage } from '../../lib/forms/getFieldErrors'
import { Button } from '../ui/Button'

type SocialAuthButtonsProps = {
  disabled?: boolean
  mode?: 'signin' | 'signup'
}

function SocialAuthDivider() {
  return (
    <div className="relative py-1">
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="w-full border-t border-surface-200 dark:border-surface-700" />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-white px-3 text-xs font-medium uppercase tracking-wide text-surface-500 dark:bg-surface-900 dark:text-surface-400">
          Or continue with
        </span>
      </div>
    </div>
  )
}

function GoogleSignInButton({
  disabled,
  mode = 'signin',
  onBusyChange,
}: {
  disabled?: boolean
  mode?: 'signin' | 'signup'
  onBusyChange: (busy: boolean) => void
}) {
  const handleSuccess = useGoogleCredentialLogin(onBusyChange)
  const containerRef = useRef<HTMLDivElement>(null)
  const [buttonWidth, setButtonWidth] = useState(320)

  useEffect(() => {
    const element = containerRef.current

    if (!element) {
      return
    }

    function updateWidth() {
      if (containerRef.current) {
        setButtonWidth(containerRef.current.offsetWidth)
      }
    }

    updateWidth()

    const observer = new ResizeObserver(updateWidth)
    observer.observe(element)

    return () => observer.disconnect()
  }, [])

  function handleError() {
    // Cancelled or failed — no toast; One Tap or retry is available.
  }

  return (
    <div
      ref={containerRef}
      className={`flex w-full justify-center ${disabled ? 'pointer-events-none opacity-50' : ''}`}
    >
      <GoogleLogin
        onSuccess={(response) => void handleSuccess(response)}
        onError={handleError}
        theme="outline"
        size="large"
        shape="rectangular"
        text={mode === 'signup' ? 'signup_with' : 'signin_with'}
        width={buttonWidth}
      />
    </div>
  )
}

function AppleSignInButton({
  disabled,
  onBusyChange,
}: {
  disabled?: boolean
  onBusyChange: (busy: boolean) => void
}) {
  const { socialLogin } = useAuth()
  const toast = useToast()
  const [isBusy, setIsBusy] = useState(false)

  async function handleAppleSignIn() {
    onBusyChange(true)
    setIsBusy(true)

    try {
      const idToken = await signInWithApple(apiConfig.appleClientId)
      await socialLogin('apple', idToken)
    } catch (error) {
      toast.error(getErrorMessage(error, 'Apple sign in failed'))
    } finally {
      setIsBusy(false)
      onBusyChange(false)
    }
  }

  return (
    <Button
      type="button"
      variant="secondary"
      className="w-full"
      disabled={disabled || isBusy}
      onClick={() => void handleAppleSignIn()}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="currentColor">
        <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
      </svg>
      {isBusy ? 'Signing in with Apple...' : 'Continue with Apple'}
    </Button>
  )
}

export function SocialAuthButtons({ disabled = false, mode = 'signin' }: SocialAuthButtonsProps) {
  const [isBusy, setIsBusy] = useState(false)

  if (!isSocialAuthEnabled()) {
    return null
  }

  const isDisabled = disabled || isBusy

  return (
    <div className="space-y-4">
      <SocialAuthDivider />

      <div className="space-y-3">
        {isGoogleAuthEnabled() ? (
          <GoogleSignInButton disabled={isDisabled} mode={mode} onBusyChange={setIsBusy} />
        ) : null}
        {isAppleAuthEnabled() ? (
          <AppleSignInButton disabled={isDisabled} onBusyChange={setIsBusy} />
        ) : null}
      </div>
    </div>
  )
}
