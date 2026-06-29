import { Link, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useChatInbox } from '../../context/ChatInboxContext'
import { UserMenu } from './UserMenu'
import { SocketPulseDot, SocketStatus } from '../socket/SocketPulseDot'
import { Avatar } from '../ui/Avatar'
import { Button } from '../ui/Button'
import { ThemeToggle } from '../ui/ThemeToggle'
import { getUserDisplayName } from '../../lib/user/display'

export function AppLayout() {
  const { user, isAuthenticated, logout } = useAuth()
  const { totalUnread } = useChatInbox()

  return (
    <div className="min-h-svh bg-surface-50 [--app-header-height:4.5rem] dark:bg-surface-950">
      <header className="sticky top-0 z-20 border-b border-surface-200 bg-white/90 backdrop-blur dark:border-surface-800 dark:bg-surface-950/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link to="/posts" className="flex items-center gap-2.5">
            <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-sm font-bold text-white">
              F
              {isAuthenticated ? (
                <span className="absolute -right-1 -top-1">
                  <SocketPulseDot iconOnly />
                </span>
              ) : null}
            </span>
            <span className="text-lg font-semibold text-surface-900 dark:text-surface-50">Feed App</span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            {isAuthenticated ? <SocketStatus /> : null}
            {isAuthenticated ? (
              <Link
                to="/messages"
                className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-surface-600 transition-colors hover:bg-surface-100 hover:text-surface-900 dark:text-surface-400 dark:hover:bg-surface-800 dark:hover:text-surface-100"
                aria-label={totalUnread > 0 ? `Messages, ${totalUnread} unread` : 'Messages'}
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h8M8 14h5M21 12c0 3.866-3.582 7-8 7-.847 0-1.66-.117-2.418-.336L5 20l.336-2.582A6.953 6.953 0 0 1 4 12c0-3.866 3.582-7 8-7s8 3.134 8 7Z" />
                </svg>
                {totalUnread > 0 ? (
                  <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-semibold text-white">
                    {totalUnread > 99 ? '99+' : totalUnread}
                  </span>
                ) : null}
              </Link>
            ) : null}
            <ThemeToggle />
            {isAuthenticated && user ? (
              <>
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-medium text-surface-900 dark:text-surface-100">
                    {getUserDisplayName(user)}
                  </p>
                  <p className="text-xs text-surface-500 dark:text-surface-400">{user.email}</p>
                </div>
                <Avatar user={user} size="sm" />
                <UserMenu onSignOut={() => logout()} />
              </>
            ) : (
              <Link to="/login">
                <Button variant="secondary" size="sm">
                  Sign in
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Outlet />
      </main>
    </div>
  )
}
