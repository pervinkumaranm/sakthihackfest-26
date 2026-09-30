import { Navigate } from 'react-router-dom'
import { apiService } from '../services/api'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuth = apiService.isAdminAuthenticated()
  return isAuth ? <>{children}</> : <Navigate to="/manage-registrations" replace />
}
