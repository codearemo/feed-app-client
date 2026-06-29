import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type ToastVariant = 'success' | 'error' | 'info' | 'warning'

export type Toast = {
  id: string
  title?: string
  message: string
  variant: ToastVariant
}

type ToastInput = {
  title?: string
  message: string
  variant?: ToastVariant
  durationMs?: number
}

type ToastContextValue = {
  toasts: Toast[]
  notify: (input: ToastInput) => void
  success: (message: string, title?: string) => void
  error: (message: string, title?: string) => void
  info: (message: string, title?: string) => void
  warning: (message: string, title?: string) => void
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const variantStyles: Record<ToastVariant, string> = {
  success: 'border-green-200 bg-green-50 text-green-900 dark:border-green-900/40 dark:bg-green-950/40 dark:text-green-100',
  error: 'border-red-200 bg-red-50 text-red-900 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-100',
  info: 'border-brand-200 bg-brand-50 text-brand-900 dark:border-brand-900/40 dark:bg-brand-950/40 dark:text-brand-100',
  warning: 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-100',
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const notify = useCallback(
    ({ title, message, variant = 'info', durationMs = 4500 }: ToastInput) => {
      const id = crypto.randomUUID()

      setToasts((current) => [...current, { id, title, message, variant }])

      window.setTimeout(() => dismiss(id), durationMs)
    },
    [dismiss],
  )

  const value = useMemo<ToastContextValue>(
    () => ({
      toasts,
      notify,
      dismiss,
      success: (message, title) => notify({ message, title, variant: 'success' }),
      error: (message, title) => notify({ message, title, variant: 'error' }),
      info: (message, title) => notify({ message, title, variant: 'info' }),
      warning: (message, title) => notify({ message, title, variant: 'warning' }),
    }),
    [dismiss, notify, toasts],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed right-4 top-4 z-[100] flex w-full max-w-sm flex-col gap-2"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-xl border px-4 py-3 shadow-[var(--shadow-elevated)] ${variantStyles[toast.variant]}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                {toast.title ? <p className="text-sm font-semibold">{toast.title}</p> : null}
                <p className="text-sm">{toast.message}</p>
              </div>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                className="rounded-md px-1 text-xs opacity-70 transition-opacity hover:opacity-100"
                aria-label="Dismiss notification"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)

  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }

  return context
}
