import { useId, type InputHTMLAttributes } from 'react'
import { normalizeTotpCode } from '../../lib/auth/two-factor'

type TwoFactorCodeInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange' | 'inputMode' | 'maxLength' | 'autoComplete'
> & {
  label?: string
  value: string
  onChange: (value: string) => void
  error?: string
  hint?: string
}

export function TwoFactorCodeInput({
  label = 'Authenticator code',
  value,
  onChange,
  error,
  hint,
  id,
  className = '',
  required,
  ...props
}: TwoFactorCodeInputProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId

  return (
    <div className={`space-y-1.5 ${className}`}>
      <label htmlFor={inputId} className="block text-sm font-medium text-surface-700 dark:text-surface-300">
        {label}
        {required ? <span className="text-danger-500"> *</span> : null}
      </label>
      <input
        {...props}
        id={inputId}
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        pattern="\d{6}"
        placeholder="123456"
        value={value}
        onChange={(event) => onChange(normalizeTotpCode(event.target.value))}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        className={`block w-full rounded-lg border bg-white px-3 py-2.5 text-center font-mono text-lg tracking-[0.35em] text-surface-900 shadow-sm transition-colors placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-surface-900 dark:text-surface-100 dark:focus:ring-offset-surface-950 ${
          error
            ? 'border-danger-500 focus:ring-danger-500'
            : 'border-surface-200 dark:border-surface-700'
        }`}
      />
      {hint ? (
        <p id={`${inputId}-hint`} className="text-xs text-surface-500 dark:text-surface-400">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${inputId}-error`} className="text-xs text-danger-600 dark:text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  )
}
