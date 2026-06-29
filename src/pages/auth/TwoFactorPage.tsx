import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { TwoFactorCodeInput } from '../../components/auth/TwoFactorCodeInput'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { AppLink } from '../../components/ui/AppLink'
import { Button } from '../../components/ui/Button'
import { FormAlert } from '../../components/ui/FormAlert'
import { isTwoFactorSessionExpired } from '../../hooks/useTwoFactor'
import { getFieldErrors, getErrorMessage } from '../../lib/forms/getFieldErrors'
import { authSession } from '../../lib/storage/session-storage'

export function TwoFactorPage() {
  const navigate = useNavigate()
  const { verifyTwoFactor } = useAuth()
  const toast = useToast()
  const [code, setCode] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string>()
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!authSession.getTwoFactorToken()) {
      navigate('/login', { replace: true })
    }
  }, [navigate])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(undefined)
    setFieldErrors({})
    setIsSubmitting(true)

    try {
      await verifyTwoFactor(code)
    } catch (error) {
      const message = getErrorMessage(error, 'Invalid authenticator code')
      setFieldErrors(getFieldErrors(error))
      setFormError(message)

      if (isTwoFactorSessionExpired(error)) {
        authSession.clearTwoFactorToken()
        toast.warning('Your two-factor session expired. Please sign in again.')
        navigate('/login', { replace: true })
        return
      }

      toast.error(message, 'Two-factor failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleBackToLogin() {
    authSession.clearTwoFactorToken()
    navigate('/login')
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-semibold text-surface-900 dark:text-surface-50">
          Two-factor authentication
        </h2>
        <p className="text-sm text-surface-500 dark:text-surface-400">
          Enter the 6-digit code from your authenticator app to finish signing in.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <FormAlert message={formError} />
        <TwoFactorCodeInput
          value={code}
          onChange={setCode}
          error={fieldErrors.code}
          autoFocus
          required
        />
        <Button type="submit" className="w-full" disabled={isSubmitting || code.length !== 6}>
          {isSubmitting ? 'Verifying...' : 'Continue'}
        </Button>
      </form>

      <p className="text-center text-sm text-surface-500 dark:text-surface-400">
        <button
          type="button"
          onClick={handleBackToLogin}
          className="font-medium text-brand-600 transition-colors hover:text-brand-700 dark:text-brand-300 dark:hover:text-brand-200"
        >
          Back to sign in
        </button>
        {' · '}
        <AppLink to="/login" className="text-sm" onClick={() => authSession.clearTwoFactorToken()}>
          Use a different account
        </AppLink>
      </p>
    </div>
  )
}
