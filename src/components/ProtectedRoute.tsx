import { Navigate } from 'react-router-dom'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuth = sessionStorage.getItem('shf26_admin_auth') === 'true'
  return isAuth ? <>{children}</> : <Navigate to="/admin/login" replace />
}
