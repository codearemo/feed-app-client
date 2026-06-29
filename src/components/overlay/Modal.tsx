import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import type { OverlaySize } from '../../context/overlay-context'

type ModalProps = {
  title?: string
  children: ReactNode
  size?: OverlaySize
  onClose: () => void
}

const sizeStyles: Record<OverlaySize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
}

export function Modal({ title, children, size = 'md', onClose }: ModalProps) {
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

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-surface-950/50 backdrop-blur-[1px]"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        className={`relative z-10 flex max-h-[min(90svh,720px)] w-full flex-col overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-[var(--shadow-elevated)] dark:border-surface-700 dark:bg-surface-900 ${sizeStyles[size]}`}
      >
        {title ? (
          <div className="flex items-center justify-between border-b border-surface-200 px-5 py-4 dark:border-surface-800">
            <h2 id="modal-title" className="text-lg font-semibold text-surface-900 dark:text-surface-50">
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
        <div className="overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </div>,
    document.body,
  )
}
