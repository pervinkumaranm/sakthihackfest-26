import { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, Lock, User, ArrowRight, AlertCircle, Loader2, QrCode } from 'lucide-react'
import { attendanceService } from '../../services/attendanceApi'

interface Props {
  onLoginSuccess: () => void
}

export default function AttendanceLogin({ onLoginSuccess }: Props) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.')
      return
    }

    setLoading(true)
    setError(null)

    const res = await attendanceService.authenticate(username.trim(), password.trim())
    setLoading(false)

    if (res.success) {
      onLoginSuccess()
    } else {
      setError(res.error || 'Authentication failed. Please verify your credentials.')
    }
  }

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Cyber Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="bg-cyber-grid absolute inset-0 opacity-20 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md bg-brand-surface/90 backdrop-blur-xl border border-brand-border/60 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10"
      >
        {/* Header Icon */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-primary/20 to-brand-orange/20 border border-brand-primary/30 flex items-center justify-center mb-3 shadow-lg shadow-brand-primary/10">
            <QrCode className="text-brand-primary w-8 h-8" />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-mono tracking-wider mb-2">
            <Shield size={12} />
            <span>STAFF DESK ACCESS</span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight">
            TEAM <span className="text-brand-primary">ATTENDANCE</span>
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted mt-1">
            Student Volunteer & Event Desk Authentication
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-red-400 text-xs sm:text-sm"
          >
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-brand-muted mb-1.5">
              Volunteer Username
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted w-4 h-4" />
              <input
                type="text"
                autoComplete="username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="volunteer"
                className="w-full bg-brand-bg/80 border border-brand-border rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all placeholder:text-zinc-600 font-sans"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-brand-muted mb-1.5">
              Access Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted w-4 h-4" />
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-brand-bg/80 border border-brand-border rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all placeholder:text-zinc-600 font-sans"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-brand-primary to-brand-orange text-white font-display font-bold text-sm tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/20 hover:opacity-95 active:scale-[0.99] transition-all disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>VERIFYING ACCESS...</span>
              </>
            ) : (
              <>
                <span>OPEN QR SCANNER</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-brand-border/40 text-center">
          <p className="text-[11px] text-zinc-500 font-mono">
            Authorized volunteers only • Sakthi HackFest'26
          </p>
        </div>
      </motion.div>
    </div>
  )
}
