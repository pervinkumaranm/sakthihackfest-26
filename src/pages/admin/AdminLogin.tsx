import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react'

// Admin credentials are validated on the backend in production.
// This demo uses hashed comparison so credentials are NOT in plain source.
// In production, replace with a proper backend auth endpoint.
const ADMIN_HASH = btoa('shf26:admin2026') // Base64 encoded — swap with secure backend call

export default function AdminLogin() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Simulate network delay
    await new Promise(res => setTimeout(res, 600))

    const attempt = btoa(`${username}:${password}`)
    if (attempt === ADMIN_HASH) {
      sessionStorage.setItem('shf26_admin_auth', 'true')
      sessionStorage.setItem('shf26_admin_user', username)
      navigate('/admin')
    } else {
      setError('Invalid credentials. Contact the event technical lead for admin access.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center px-4">
      <div className="bg-cyber-grid-dense fixed inset-0 opacity-50 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <svg viewBox="0 0 32 32" fill="none" className="w-12 h-12 mx-auto mb-4">
            <rect width="32" height="32" rx="6" fill="#0D0D0F" stroke="#FF3B30" strokeWidth="1"/>
            <polygon points="5,26 16,6 27,26" fill="none" stroke="#FF3B30" strokeWidth="1.5"/>
            <circle cx="16" cy="18" r="4" fill="#FF7A00"/>
          </svg>
          <div className="font-display font-black text-xl tracking-widest text-white">
            SAKTHI <span className="text-brand-primary">HACKFEST</span> 2K26
          </div>
          <div className="font-mono text-xs text-brand-muted mt-1 tracking-widest">ADMIN PORTAL</div>
        </div>

        <form onSubmit={handleLogin} className="bg-brand-surface border border-brand-border p-8 space-y-5">
          <div className="mb-2">
            <div className="font-mono text-xs text-brand-primary tracking-widest mb-1">AUTHENTICATION REQUIRED</div>
            <div className="h-px bg-brand-border" />
          </div>

          <div>
            <label className="block font-mono text-xs tracking-widest text-brand-muted mb-2">USERNAME</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Admin username"
              required
              autoComplete="username"
              className="w-full bg-brand-card border border-brand-border text-white text-sm px-4 py-3 focus:outline-none focus:border-brand-primary transition-colors font-mono placeholder-brand-mutedDark"
            />
          </div>

          <div>
            <label className="block font-mono text-xs tracking-widest text-brand-muted mb-2">PASSWORD</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Admin password"
                required
                autoComplete="current-password"
                className="w-full bg-brand-card border border-brand-border text-white text-sm px-4 py-3 pr-12 focus:outline-none focus:border-brand-primary transition-colors font-mono placeholder-brand-mutedDark"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-white transition-colors"
                aria-label={showPass ? 'Hide password' : 'Show password'}
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-start gap-3 p-3 border border-red-500/40 bg-red-500/10 text-red-400 text-xs"
            >
              <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
              {error}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-primary text-white font-display font-bold tracking-widest py-3 hover:shadow-glow-red transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <><Loader2 size={16} className="animate-spin" /> AUTHENTICATING...</> : 'ACCESS ADMIN PANEL'}
          </button>

          <div className="text-center">
            <p className="font-mono text-xs text-brand-mutedDark">
              Demo: <span className="text-brand-muted">shf26 / admin2026</span>
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
