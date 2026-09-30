import { useState, useEffect } from 'react'
import { apiService } from '../../services/api'
import AdminLogin from './AdminLogin'
import AdminDashboard from './AdminDashboard'

export default function ManageRegistrations() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return apiService.isAdminAuthenticated()
  })

  // Enforce noindex metadata on the entire private route
  useEffect(() => {
    let meta = document.querySelector('meta[name="robots"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute('name', 'robots')
      document.head.appendChild(meta)
    }
    meta.setAttribute('content', 'noindex, nofollow')

    return () => {
      meta?.remove()
    }
  }, [])

  // Listen to popstate (back/forward navigation) to prevent viewing cached dashboard after logout
  useEffect(() => {
    const handlePopState = () => {
      if (!apiService.isAdminAuthenticated()) {
        setIsAuthenticated(false)
      }
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const handleLogout = () => {
    apiService.adminLogout()
    setIsAuthenticated(false)
    // Replace history entry to prevent browser back navigation from restoring dashboard state
    window.history.replaceState(null, '', '/manage-registrations')
  }

  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={() => setIsAuthenticated(true)} />
  }

  return <AdminDashboard onLogout={handleLogout} />
}
