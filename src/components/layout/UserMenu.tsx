import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

type UserMenuProps = {
  onSignOut: () => void
}

export function UserMenu({ onSignOut }: UserMenuProps) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) {
      return
    }

    function handlePointerDown(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    window.addEventListener('mousedown', handlePointerDown)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('mousedown', handlePointerDown)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="More options"
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-surface-600 transition-colors hover:bg-surface-100 hover:text-surface-900 dark:text-surface-400 dark:hover:bg-surface-800 dark:hover:text-surface-100"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
          <circle cx="12" cy="5" r="1.75" />
          <circle cx="12" cy="12" r="1.75" />
          <circle cx="12" cy="19" r="1.75" />
        </svg>
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-30 mt-1 min-w-44 overflow-hidden rounded-xl border border-surface-200 bg-white py-1 shadow-[var(--shadow-elevated)] dark:border-surface-700 dark:bg-surface-900"
        >
          <Link
            to="/settings"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="block px-4 py-2.5 text-sm text-surface-700 transition-colors hover:bg-surface-100 dark:text-surface-200 dark:hover:bg-surface-800"
          >
            Settings
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false)
              onSignOut()
            }}
            className="block w-full px-4 py-2.5 text-left text-sm text-surface-700 transition-colors hover:bg-surface-100 dark:text-surface-200 dark:hover:bg-surface-800"
          >
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  )
}
