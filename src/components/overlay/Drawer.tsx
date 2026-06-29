import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import type { DrawerSide } from '../../context/overlay-context'

type DrawerProps = {
  title?: string
  children: ReactNode
  side?: DrawerSide
  onClose: () => void
}

export function Drawer({ title, children, side = 'right', onClose }: DrawerProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  const positionClass = side === 'right' ? 'right-0 border-l' : 'left-0 border-r'

  return createPortal(
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        className="absolute inset-0 bg-surface-950/50 backdrop-blur-[1px]"
        aria-label="Close drawer"
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'drawer-title' : undefined}
        className={`absolute top-0 flex h-full w-full max-w-md flex-col border-surface-200 bg-white shadow-[var(--shadow-elevated)] dark:border-surface-700 dark:bg-surface-900 ${positionClass}`}
      >
        {title ? (
          <div className="flex items-center justify-between border-b border-surface-200 px-5 py-4 dark:border-surface-800">
            <h2 id="drawer-title" className="text-lg font-semibold text-surface-900 dark:text-surface-50">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-surface-500 transition-colors hover:bg-surface-100 hover:text-surface-800 dark:text-surface-400 dark:hover:bg-surface-800 dark:hover:text-surface-100"
              aria-label="Close"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        ) : null}
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
      </aside>
    </div>,
    document.body,
  )
}
