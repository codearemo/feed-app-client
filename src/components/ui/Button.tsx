import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  children: ReactNode
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-600 text-white hover:bg-brand-700 focus-visible:ring-brand-500 shadow-sm dark:focus-visible:ring-offset-surface-950',
  secondary:
    'bg-white text-surface-700 border border-surface-200 hover:bg-surface-50 focus-visible:ring-brand-500 shadow-sm dark:bg-surface-900 dark:text-surface-200 dark:border-surface-700 dark:hover:bg-surface-800 dark:focus-visible:ring-offset-surface-950',
  ghost:
    'bg-transparent text-surface-600 hover:bg-surface-100 hover:text-surface-800 focus-visible:ring-brand-500 dark:text-surface-400 dark:hover:bg-surface-800 dark:hover:text-surface-100 dark:focus-visible:ring-offset-surface-950',
  danger:
    'bg-danger-500 text-white hover:bg-danger-600 focus-visible:ring-danger-500 shadow-sm dark:focus-visible:ring-offset-surface-950',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-5 text-base',
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
