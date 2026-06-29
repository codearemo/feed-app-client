import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { authSession } from '../../lib/storage/session-storage'

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-surface-500 dark:text-surface-400">Loading...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    authSession.setReturnTo(location.pathname + location.search)
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}
