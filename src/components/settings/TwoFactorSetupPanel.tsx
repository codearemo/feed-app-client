import { useState } from 'react'
import { buildTwoFactorQrUrl } from '../../lib/auth/two-factor'
import type { TwoFactorSetup } from '../../lib/api/types'
import { Button } from '../ui/Button'
import { TwoFactorCodeInput } from '../auth/TwoFactorCodeInput'

type TwoFactorSetupPanelProps = {
  setup: TwoFactorSetup
  confirmCode: string
  onConfirmCodeChange: (value: string) => void
  fieldError?: string
  isBusy: boolean
  onConfirm: () => void
  onCancel: () => void
}

async function copyText(value: string) {
  await navigator.clipboard.writeText(value)
}

export function TwoFactorSetupPanel({
  setup,
  confirmCode,
  onConfirmCodeChange,
  fieldError,
  isBusy,
  onConfirm,
  onCancel,
}: TwoFactorSetupPanelProps) {
  const [copiedField, setCopiedField] = useState<'secret' | 'url' | null>(null)
  const qrUrl = buildTwoFactorQrUrl(setup.otpauthUrl)

  async function handleCopy(field: 'secret' | 'url', value: string) {
    await copyText(value)
    setCopiedField(field)
    window.setTimeout(() => setCopiedField(null), 2000)
  }

  return (
    <div className="space-y-4 border-t border-surface-200 pt-5 dark:border-surface-800">
      <p className="text-sm text-surface-600 dark:text-surface-400">
        Scan the QR code with Google Authenticator, 1Password, Authy, or another TOTP app. Then enter
        the 6-digit code to finish setup.
      </p>

      <div className="flex flex-col items-center gap-4 rounded-xl border border-surface-200 bg-surface-50 p-4 dark:border-surface-700 dark:bg-surface-800/60 sm:flex-row sm:items-start">
        <img
          src={qrUrl}
          alt="QR code for authenticator app setup"
          width={200}
          height={200}
          className="rounded-lg border border-surface-200 bg-white p-2 dark:border-surface-700"
        />

        <div className="min-w-0 flex-1 space-y-3 text-sm">
          <div>
            <p className="font-medium text-surface-900 dark:text-surface-100">Manual entry key</p>
            <p className="mt-1 break-all font-mono text-xs text-surface-700 dark:text-surface-300">
              {setup.secret}
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mt-2"
              onClick={() => handleCopy('secret', setup.secret)}
            >
              {copiedField === 'secret' ? 'Copied' : 'Copy secret'}
            </Button>
          </div>

          <div>
            <p className="font-medium text-surface-900 dark:text-surface-100">OTPAuth URL</p>
            <p className="mt-1 break-all text-xs text-surface-600 dark:text-surface-400">
              {setup.otpauthUrl}
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mt-2"
              onClick={() => handleCopy('url', setup.otpauthUrl)}
            >
              {copiedField === 'url' ? 'Copied' : 'Copy URL'}
            </Button>
          </div>
        </div>
      </div>

      <TwoFactorCodeInput
        value={confirmCode}
        onChange={onConfirmCodeChange}
        error={fieldError}
        required
      />

      <div className="flex gap-2">
        <Button type="button" size="sm" disabled={isBusy || confirmCode.length !== 6} onClick={onConfirm}>
          {isBusy ? 'Confirming...' : 'Enable 2FA'}
        </Button>
        <Button type="button" variant="secondary" size="sm" onClick={onCancel} disabled={isBusy}>
          Cancel setup
        </Button>
      </div>
    </div>
  )
}
