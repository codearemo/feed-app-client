import { useState, type FormEvent } from 'react'
import { Button } from '../ui/Button'
import { FormAlert } from '../ui/FormAlert'
import { Input } from '../ui/Input'
import { TwoFactorCodeInput } from '../auth/TwoFactorCodeInput'
import { useTwoFactor, type TwoFactorError } from '../../hooks/useTwoFactor'

type TwoFactorDisableFormProps = {
  onDisabled?: () => void
  onCancel?: () => void
}

export function TwoFactorDisableForm({ onDisabled, onCancel }: TwoFactorDisableFormProps) {
  const { disableTwoFactor, closeDisableDrawer, isBusy } = useTwoFactor()
  const [disableCode, setDisableCode] = useState('')
  const [disablePassword, setDisablePassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string>()

  async function handleDisable(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(undefined)
    setFieldErrors({})

    try {
      await disableTwoFactor({
        code: disableCode,
        password: disablePassword || undefined,
      })
      onDisabled?.()
    } catch (error) {
      if (error && typeof error === 'object' && 'fieldErrors' in error && 'message' in error) {
        const formatted = error as TwoFactorError
        setFieldErrors(formatted.fieldErrors)
        setFormError(formatted.message)
      }
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleDisable}>
      <p className="text-sm text-surface-600 dark:text-surface-400">
        Enter your authenticator code to turn off two-factor authentication.
      </p>
      <FormAlert message={formError} />
      <TwoFactorCodeInput
        value={disableCode}
        onChange={setDisableCode}
        error={fieldErrors.code}
        required
      />
      <Input
        label="Password"
        type="password"
        value={disablePassword}
        onChange={(event) => setDisablePassword(event.target.value)}
        error={fieldErrors.password}
        hint="Required if your account has a password."
      />
      <div className="flex gap-2 border-t border-surface-200 pt-4 dark:border-surface-800">
        <Button type="submit" variant="danger" size="sm" disabled={isBusy || disableCode.length !== 6}>
          {isBusy ? 'Disabling...' : 'Disable 2FA'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => {
            closeDisableDrawer()
            onCancel?.()
          }}
          disabled={isBusy}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
