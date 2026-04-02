import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { PageLoader } from '@/components/ui'

// Redirect to login if not authenticated
export const PrivateRoute = () => {
  const { user, loading } = useAuth()
  if (loading) return <PageLoader />
  return user ? <Outlet /> : <Navigate to="/login" replace />
}

// Redirect if already logged in
export const PublicRoute = () => {
  const { user, loading, isAdmin, isApproved } = useAuth()
  if (loading) return <PageLoader />
  if (!user) return <Outlet />
  if (isAdmin) return <Navigate to="/admin" replace />
  return <Navigate to="/student" replace />
}

// Admin only
export const AdminRoute = () => {
  const { user, isAdmin, loading } = useAuth()
  if (loading) return <PageLoader />
  if (!user) return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/student" replace />
  return <Outlet />
}

// Student only — also checks approval
export const StudentRoute = () => {
  const { user, isStudent, isApproved, loading } = useAuth()
  if (loading) return <PageLoader />
  if (!user) return <Navigate to="/login" replace />
  if (!isStudent) return <Navigate to="/admin" replace />
  if (!isApproved) return <Navigate to="/pending" replace />
  return <Outlet />
}
