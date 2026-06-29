import type { TextareaHTMLAttributes } from 'react'

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string
  hint?: string
  error?: string
}

export function Textarea({ label, hint, error, id, className = '', ...props }: TextareaProps) {
  const textareaId = id ?? label.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="space-y-1.5">
      <label htmlFor={textareaId} className="block text-sm font-medium text-surface-700 dark:text-surface-300">
        {label}
      </label>
      <textarea
        id={textareaId}
        aria-invalid={Boolean(error)}
        className={`block min-h-32 w-full resize-y rounded-lg border bg-white px-3.5 py-2.5 text-sm text-surface-900 shadow-sm placeholder:text-surface-400 focus:outline-none focus:ring-2 dark:bg-surface-900 dark:text-surface-100 dark:placeholder:text-surface-500 ${
          error
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20 dark:border-red-800'
            : 'border-surface-200 focus:border-brand-500 focus:ring-brand-500/20 dark:border-surface-700 dark:focus:border-brand-400 dark:focus:ring-brand-400/20'
        } ${className}`}
        {...props}
      />
      {error ? <p className="text-xs text-red-600 dark:text-red-300">{error}</p> : null}
      {!error && hint ? <p className="text-xs text-surface-500 dark:text-surface-400">{hint}</p> : null}
    </div>
  )
}
