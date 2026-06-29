import { useState, type FormEvent } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { AppLink } from '../../components/ui/AppLink'
import { Button } from '../../components/ui/Button'
import { FormAlert } from '../../components/ui/FormAlert'
import { Input } from '../../components/ui/Input'
import { getFieldErrors, getErrorMessage } from '../../lib/forms/getFieldErrors'
import { authSession } from '../../lib/storage/session-storage'

export function VerifyEmailPage() {
  const { verifyEmail, resendVerification } = useAuth()
  const toast = useToast()
  const [email, setEmail] = useState(authSession.getPendingVerifyEmail() ?? '')
  const [otp, setOtp] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isResending, setIsResending] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(undefined)
    setFieldErrors({})
    setIsSubmitting(true)

    try {
      await verifyEmail(email, otp)
    } catch (error) {
      const message = getErrorMessage(error, 'Unable to verify email')
      setFieldErrors(getFieldErrors(error))
      setFormError(message)
      toast.error(message, 'Verification failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleResend() {
    if (!email) {
      toast.warning('Enter your email address first.')
      return
    }

    setIsResending(true)

    try {
      await resendVerification(email)
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to resend code'))
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-semibold text-surface-900 dark:text-surface-50">
          Verify your email
        </h2>
        <p className="text-sm text-surface-500 dark:text-surface-400">
          Enter the 6-digit code sent to your inbox.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <FormAlert message={formError} />
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={fieldErrors.email}
          required
        />
        <Input
          label="Verification code"
          inputMode="numeric"
          placeholder="123456"
          value={otp}
          onChange={(event) => setOtp(event.target.value)}
          error={fieldErrors.otp}
          maxLength={6}
          required
        />
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Verifying...' : 'Verify email'}
        </Button>
      </form>

      <div className="flex flex-col gap-2 text-center text-sm">
        <button
          type="button"
          onClick={handleResend}
          disabled={isResending}
          className="font-medium text-brand-600 dark:text-brand-300"
        >
          {isResending ? 'Sending...' : 'Resend verification code'}
        </button>
        <AppLink to="/login" className="text-sm">
          Back to sign in
        </AppLink>
      </div>
    </div>
  )
}
