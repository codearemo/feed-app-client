import { useState } from 'react'
import { Card } from '../../components/ui/Card'
import { FormAlert } from '../../components/ui/FormAlert'
import { Switch } from '../../components/ui/Switch'
import { TwoFactorSetupPanel } from '../../components/settings/TwoFactorSetupPanel'
import { useTwoFactor, type TwoFactorError } from '../../hooks/useTwoFactor'

export function SettingsSecurityPage() {
  const { user, setup, isBusy, isEnabled, confirmSetup, cancelSetup, handleToggle } = useTwoFactor()
  const [confirmCode, setConfirmCode] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string>()

  if (!user) {
    return null
  }

  async function handleConfirm() {
    setFormError(undefined)
    setFieldErrors({})

    try {
      await confirmSetup(confirmCode)
      setConfirmCode('')
    } catch (error) {
      if (error && typeof error === 'object' && 'fieldErrors' in error && 'message' in error) {
        const formatted = error as TwoFactorError
        setFieldErrors(formatted.fieldErrors)
        setFormError(formatted.message)
      }
    }
  }

  return (
    <div className="space-y-4">
      <Card padding="lg" className="space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h2 className="font-semibold text-surface-900 dark:text-surface-100">
              Two-factor authentication
            </h2>
            <p className="text-sm text-surface-500 dark:text-surface-400">
              Require a code from your authenticator app when signing in.
            </p>
          </div>
          <Switch
            checked={isEnabled}
            onCheckedChange={(checked) => {
              void handleToggle(checked, () => setConfirmCode(''))
            }}
            disabled={isBusy || Boolean(setup)}
            aria-label="Toggle two-factor authentication"
          />
        </div>

        <FormAlert message={formError} />

        {!isEnabled && setup ? (
          <TwoFactorSetupPanel
            setup={setup}
            confirmCode={confirmCode}
            onConfirmCodeChange={setConfirmCode}
            fieldError={fieldErrors.code}
            isBusy={isBusy}
            onConfirm={() => void handleConfirm()}
            onCancel={() => {
              cancelSetup()
              setConfirmCode('')
              setFormError(undefined)
              setFieldErrors({})
            }}
          />
        ) : null}
      </Card>
    </div>
  )
}
