import type { HTMLAttributes, ReactNode } from 'react'

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}

export function Card({
  children,
  padding = 'md',
  className = '',
  ...props
}: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-surface-200 bg-white shadow-[var(--shadow-card)] dark:border-surface-800 dark:bg-surface-900 ${paddingStyles[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
