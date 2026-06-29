import { useState, type FormEvent } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { AppLink } from '../../components/ui/AppLink'
import { Button } from '../../components/ui/Button'
import { FormAlert } from '../../components/ui/FormAlert'
import { Input } from '../../components/ui/Input'
import { getFieldErrors, getErrorMessage } from '../../lib/forms/getFieldErrors'

export function ForgotPasswordPage() {
  const { forgotPassword } = useAuth()
  const toast = useToast()
  const [email, setEmail] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string>()
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(undefined)
    setFieldErrors({})
    setIsSubmitting(true)

    try {
      await forgotPassword(email)
    } catch (error) {
      const message = getErrorMessage(error, 'Unable to send reset code')
      setFieldErrors(getFieldErrors(error))
      setFormError(message)
      toast.error(message, 'Request failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-semibold text-surface-900 dark:text-surface-50">Forgot password</h2>
        <p className="text-sm text-surface-500 dark:text-surface-400">
          We&apos;ll email you a 6-digit code if the account exists.
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
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Sending...' : 'Send reset code'}
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
