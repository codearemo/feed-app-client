import { useState, type FormEvent } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { AppLink } from '../../components/ui/AppLink'
import { Button } from '../../components/ui/Button'
import { FormAlert } from '../../components/ui/FormAlert'
import { Input } from '../../components/ui/Input'
import { getFieldErrors, getErrorMessage } from '../../lib/forms/getFieldErrors'
import { authSession } from '../../lib/storage/session-storage'

export function ResetPasswordPage() {
  const { resetPassword } = useAuth()
  const toast = useToast()
  const [email, setEmail] = useState(authSession.getResetPasswordEmail() ?? '')
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string>()
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(undefined)
    setFieldErrors({})
    setIsSubmitting(true)

    try {
      await resetPassword(email, otp, password)
    } catch (error) {
      const message = getErrorMessage(error, 'Unable to reset password')
      setFieldErrors(getFieldErrors(error))
      setFormError(message)
      toast.error(message, 'Reset failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-semibold text-surface-900 dark:text-surface-50">Reset password</h2>
        <p className="text-sm text-surface-500 dark:text-surface-400">
          Enter the code from your email and choose a new password.
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
          value={otp}
          onChange={(event) => setOtp(event.target.value)}
          error={fieldErrors.otp}
          maxLength={6}
          required
        />
        <Input
          label="New password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={fieldErrors.password}
          hint="Min 8 chars with upper, lower, digit, and special (@$!%*?&)."
          required
        />
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Updating...' : 'Update password'}
        </Button>
      </form>

      <p className="text-center text-sm text-surface-500 dark:text-surface-400">
        <AppLink to="/login" className="text-sm">
          Back to sign in
        </AppLink>
      </p>
    </div>
  )
}
