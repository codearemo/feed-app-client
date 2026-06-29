import type { ReactNode } from 'react'
import { AppLink } from '../ui/AppLink'

type FeedHeaderProps = {
  title: string
  backTo?: string
  backLabel?: string
  actions?: ReactNode
}

export function FeedHeader({ title, backTo, backLabel = 'Back', actions }: FeedHeaderProps) {
  return (
    <header className="sticky top-[calc(var(--app-header-height)-3px)] z-10 border-b border-surface-200 bg-white/90 px-4 py-3 backdrop-blur dark:border-surface-800 dark:bg-surface-950/90">
      {backTo ? (
        <div className="mb-2">
          <AppLink to={backTo} variant="subtle" className="text-sm">
            ← {backLabel}
          </AppLink>
        </div>
      ) : null}
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-surface-900 dark:text-surface-50">{title}</h1>
        {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
      </div>
    </header>
  )
}
