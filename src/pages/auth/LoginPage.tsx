import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { SocialAuthButtons } from '../../components/auth/SocialAuthButtons'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { AppLink } from '../../components/ui/AppLink'
import { Button } from '../../components/ui/Button'
import { FormAlert } from '../../components/ui/FormAlert'
import { Input } from '../../components/ui/Input'
import { getFieldErrors, getErrorMessage } from '../../lib/forms/getFieldErrors'

export function LoginPage() {
  const { login } = useAuth()
  const toast = useToast()
  const [identifier, setIdentifier] = useState('')
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
      await login({ identifier, password })
    } catch (error) {
      const message = getErrorMessage(error, 'Unable to sign in')
      setFieldErrors(getFieldErrors(error))
      setFormError(message)
      toast.error(message, 'Sign in failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-semibold text-surface-900 dark:text-surface-50">Welcome back</h2>
        <p className="text-sm text-surface-500 dark:text-surface-400">Sign in to continue to your feed.</p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <FormAlert message={formError} />
        <Input
          label="Email or username"
          placeholder="you@example.com"
          value={identifier}
          onChange={(event) => setIdentifier(event.target.value)}
          error={fieldErrors.identifier || fieldErrors.body}
          autoComplete="username"
          required
        />
        <Input
          label="Password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={fieldErrors.password}
          autoComplete="current-password"
          required
        />
        <div className="flex items-center justify-end text-sm">
          <Link
            to="/forgot-password"
            className="font-medium text-brand-600 transition-colors hover:text-brand-700 dark:text-brand-300 dark:hover:text-brand-200"
          >
            Forgot password?
          </Link>
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>

      <SocialAuthButtons disabled={isSubmitting} />

      <p className="text-center text-sm text-surface-500 dark:text-surface-400">
        Don&apos;t have an account?{' '}
        <AppLink to="/register" className="text-sm">
          Create one
        </AppLink>
      </p>

      <p className="text-center text-sm text-surface-500 dark:text-surface-400">
        Need to verify your email?{' '}
        <AppLink to="/verify-email" className="text-sm">
          Enter verification code
        </AppLink>
      </p>
    </div>
  )
}
