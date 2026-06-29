import type { ReactNode } from 'react'

type PageHeaderProps = {
  eyebrow?: string
  title: string
  description?: string
  actions?: ReactNode
}

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-surface-200 pb-6 sm:flex-row sm:items-end sm:justify-between dark:border-surface-800">
      <div className="space-y-2">
        {eyebrow ? (
          <p className="text-sm font-medium uppercase tracking-wide text-brand-600 dark:text-brand-300">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-3xl font-semibold tracking-tight text-surface-900 dark:text-surface-50">
          {title}
        </h1>
        {description ? (
          <p className="max-w-2xl text-base text-surface-500 dark:text-surface-400">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  )
}
