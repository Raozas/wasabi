import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export function SuperadminRoute() {
  const { firebaseReady, isSuperadmin, loading, user } = useAuth()
  const location = useLocation()

  if (loading) {
    return <div style={{ padding: '2rem' }}>Checking superadmin access...</div>
  }

  if (!firebaseReady) {
    return <Navigate to="/login" replace state={{ from: location.pathname, reason: 'firebase' }} />
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname, reason: 'signin' }} />
  }

  if (!isSuperadmin) {
    return <Navigate to="/admin" replace />
  }

  return <Outlet />
}
