import { Link, type LinkProps } from 'react-router-dom'

export type AppLinkVariant = 'primary' | 'secondary' | 'subtle'

export const appLinkStyles: Record<AppLinkVariant, string> = {
  primary:
    'font-medium text-brand-600 transition-colors hover:text-brand-700 dark:text-brand-300 dark:hover:text-brand-200',
  secondary:
    'font-medium text-surface-700 transition-colors hover:text-surface-900 dark:text-surface-300 dark:hover:text-surface-50',
  subtle:
    'text-sm font-medium text-surface-600 transition-colors hover:text-surface-800 dark:text-surface-400 dark:hover:text-surface-200',
}

type AppLinkProps = LinkProps & {
  variant?: AppLinkVariant
}

export function AppLink({ variant = 'primary', className = '', ...props }: AppLinkProps) {
  return <Link className={`${appLinkStyles[variant]} ${className}`} {...props} />
}
