import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { authSession } from '../../lib/storage/session-storage'

export function GuestRoute() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <p className="text-sm text-surface-500 dark:text-surface-400">Loading...</p>
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to={authSession.consumeReturnTo('/posts')} replace />
  }

  return <Outlet />
}
