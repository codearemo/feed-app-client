import { Link, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { SocketPulseDot } from '../socket/SocketPulseDot'
import { Card } from '../ui/Card'
import { ThemeToggle } from '../ui/ThemeToggle'

export function AuthLayout() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-surface-900 lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.35),_transparent_55%)]" />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <div>
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-lg font-bold">
              F
            </span>
            <h1 className="mt-8 max-w-md text-4xl font-semibold leading-tight">
              A calm place to share and discover posts.
            </h1>
            <p className="mt-4 max-w-md text-base text-surface-300">
              Feed App is a simple publishing surface for thoughtful updates. Sign in to
              manage your posts and explore the community feed.
            </p>
          </div>
          <p className="text-sm text-surface-400">Sign in to connect to your feed in realtime.</p>
        </div>
      </div>

      <div className="relative flex items-center justify-center bg-surface-50 px-4 py-12 sm:px-6 dark:bg-surface-950">
        <div className="absolute right-4 top-4 flex items-center gap-3 sm:right-6 sm:top-6">
          {isAuthenticated ? <SocketPulseDot showLabel /> : null}
          <ThemeToggle />
        </div>

        <div className="w-full max-w-md space-y-6">
          <div className="text-center lg:text-left">
            <Link to="/posts" className="inline-flex items-center gap-2 lg:hidden">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-sm font-bold text-white">
                F
              </span>
              <span className="text-lg font-semibold text-surface-900 dark:text-surface-50">
                Feed App
              </span>
            </Link>
          </div>
          <Card padding="lg">
            <Outlet />
          </Card>
        </div>
      </div>
    </div>
  )
}
