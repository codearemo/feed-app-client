import { useState, type FormEvent } from 'react'
import { SocialAuthButtons } from '../../components/auth/SocialAuthButtons'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { AppLink } from '../../components/ui/AppLink'
import { Button } from '../../components/ui/Button'
import { FormAlert } from '../../components/ui/FormAlert'
import { Input } from '../../components/ui/Input'
import { getFieldErrors, getErrorMessage } from '../../lib/forms/getFieldErrors'

export function RegisterPage() {
  const { register } = useAuth()
  const toast = useToast()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
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
      await register({ firstName, lastName, username, email, password })
    } catch (error) {
      const message = getErrorMessage(error, 'Unable to create account')
      setFieldErrors(getFieldErrors(error))
      setFormError(message)
      toast.error(message, 'Registration failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-semibold text-surface-900 dark:text-surface-50">
          Create your account
        </h2>
        <p className="text-sm text-surface-500 dark:text-surface-400">
          Join Feed App and start sharing your posts.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <FormAlert message={formError} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="First name"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            error={fieldErrors.firstName}
            required
          />
          <Input
            label="Last name"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            error={fieldErrors.lastName}
            required
          />
        </div>
        <Input
          label="Username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          error={fieldErrors.username}
          hint="3–30 characters."
          required
        />
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={fieldErrors.email}
          autoComplete="email"
          required
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={fieldErrors.password}
          hint="Min 8 chars with upper, lower, digit, and special (@$!%*?&)."
          autoComplete="new-password"
          required
        />
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Creating account...' : 'Create account'}
        </Button>
      </form>

      <SocialAuthButtons disabled={isSubmitting} mode="signup" />

      <p className="text-center text-sm text-surface-500 dark:text-surface-400">
        Already have an account?{' '}
        <AppLink to="/login" className="text-sm">
          Sign in
        </AppLink>
      </p>
    </div>
  )
}
