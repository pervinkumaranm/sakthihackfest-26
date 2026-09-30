import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, AlertCircle, Loader2, ShieldCheck, Lock } from 'lucide-react'
import { apiService } from '../../services/api'

interface AdminLoginProps {
  onLoginSuccess?: () => void
}

export default function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const navigate = useNavigate()
  const location = useLocation()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Enforce noindex metadata on Admin Login page
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

  // Check if redirected due to expired session
  useEffect(() => {
    if (location.state && (location.state as any).sessionExpired) {
      setError('Your admin session has expired. Please sign in again.')
    }
  }, [location.state])

  // If already authenticated, redirect straight to dashboard
  useEffect(() => {
    if (apiService.isAdminAuthenticated()) {
      if (onLoginSuccess) {
        onLoginSuccess()
      } else {
        navigate('/manage-registrations', { replace: true })
      }
    }
  }, [navigate, onLoginSuccess])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await apiService.adminLogin(username.trim(), password.trim())

    if (result.success) {
      if (onLoginSuccess) {
        onLoginSuccess()
      } else {
        navigate('/manage-registrations', { replace: true })
      }
    } else {
      setError(result.error || 'Invalid administrator credentials.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center px-4 py-12 selection:bg-brand-primary selection:text-white">
      <div className="bg-cyber-grid-dense fixed inset-0 opacity-40 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-brand-card border border-brand-border flex items-center justify-center shadow-lg shadow-black/50">
            <Lock className="w-7 h-7 text-brand-primary" />
          </div>
          <div className="font-display font-black text-2xl tracking-wider text-white">
            SAKTHI <span className="text-brand-primary">HACKFEST</span> '26
          </div>
          <div className="inline-flex items-center gap-1.5 font-mono text-[11px] text-brand-muted mt-1.5 tracking-widest uppercase bg-brand-card/80 px-3 py-1 rounded-full border border-brand-border">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-orange" />
            ADMINISTRATION CONSOLE
          </div>
        </div>

        {/* Login Form Container */}
        <div className="bg-brand-surface/95 border border-brand-border rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <div className="font-mono text-[11px] text-brand-primary font-semibold tracking-widest uppercase mb-1">
                SECURE ACCESS REQUIRED
              </div>
              <p className="text-xs text-brand-muted">
                Authorized event coordinators and technical administrators only.
              </p>
              <div className="h-px bg-brand-border mt-3" />
            </div>

            {/* Username / Email */}
            <div>
              <label className="block font-mono text-xs tracking-wider text-brand-muted mb-2 font-medium">
                ADMIN USERNAME / EMAIL
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Enter admin username"
                required
                autoComplete="username"
                disabled={loading}
                className="w-full bg-brand-card border border-brand-border rounded-xl text-white text-sm px-4 py-3 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all font-mono placeholder-brand-mutedDark disabled:opacity-60"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block font-mono text-xs tracking-wider text-brand-muted mb-2 font-medium">
                SECURE PASSWORD
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter administrator password"
                  required
                  autoComplete="current-password"
                  disabled={loading}
                  className="w-full bg-brand-card border border-brand-border rounded-xl text-white text-sm px-4 py-3 pr-12 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all font-mono placeholder-brand-mutedDark disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  disabled={loading}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-muted hover:text-white transition-colors"
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-start gap-2.5 p-3.5 rounded-xl border border-red-500/40 bg-red-500/10 text-red-400 text-xs leading-relaxed"
              >
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-brand-primary to-brand-orange text-white font-display font-bold tracking-widest py-3.5 rounded-xl hover:shadow-glow-red transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  AUTHENTICATING...
                </>
              ) : (
                'ENTER ADMIN CONSOLE'
              )}
            </button>
          </form>
        </div>

        <div className="text-center mt-6">
          <p className="font-mono text-[11px] text-brand-mutedDark">
            Sree Sakthi Engineering College · Karamadai, Coimbatore
          </p>
        </div>
      </motion.div>
    </div>
  )
}
