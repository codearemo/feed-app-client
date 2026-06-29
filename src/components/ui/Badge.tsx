import type { ReactNode } from 'react'

type BadgeVariant = 'default' | 'brand' | 'success' | 'warning' | 'danger'

type BadgeProps = {
  children: ReactNode
  variant?: BadgeVariant
}

const variantStyles: Record<BadgeVariant, string> = {
  default:
    'bg-surface-100 text-surface-700 ring-1 ring-inset ring-surface-200 dark:bg-surface-800 dark:text-surface-200 dark:ring-surface-600',
  brand:
    'bg-brand-100 text-brand-800 ring-1 ring-inset ring-brand-200 dark:bg-brand-500/15 dark:text-brand-200 dark:ring-brand-400/35',
  success:
    'bg-success-500/10 text-success-600 ring-1 ring-inset ring-success-500/25 dark:bg-success-500/15 dark:text-emerald-300 dark:ring-success-500/35',
  warning:
    'bg-warning-500/10 text-warning-600 ring-1 ring-inset ring-warning-500/25 dark:bg-warning-500/15 dark:text-amber-300 dark:ring-warning-500/35',
  danger:
    'bg-danger-500/10 text-danger-600 ring-1 ring-inset ring-danger-500/25 dark:bg-danger-500/15 dark:text-red-300 dark:ring-danger-500/35',
}

export function Badge({ children, variant = 'default' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variantStyles[variant]}`}
    >
      {children}
    </span>
  )
}
