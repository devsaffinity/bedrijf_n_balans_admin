import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { LoadingState } from '../../components/ui/States'

export function ProtectedRoute() {
  const { user, initializing } = useAuth()
  const location = useLocation()
  if (initializing) return <LoadingState label="Checking administrator access…" />
  return user ? <Outlet /> : <Navigate to="/login" replace state={{ from: location }} />
}
