import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export function AdminRoute() {
  const { firebaseReady, hasAdminAccess, loading, user } = useAuth()
  const location = useLocation()

  if (loading) {
    return <div style={{ padding: '2rem' }}>Checking admin access...</div>
  }

  if (!firebaseReady) {
    return <Navigate to="/login" replace state={{ from: location.pathname, reason: 'firebase' }} />
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname, reason: 'signin' }} />
  }

  if (!hasAdminAccess) {
    return <Navigate to="/login" replace state={{ from: location.pathname, reason: 'forbidden' }} />
  }

  return <Outlet />
}
