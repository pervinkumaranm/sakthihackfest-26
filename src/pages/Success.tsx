import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Download, Home, CheckCircle, CheckCircle2, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react'
import type { StoredRegistration } from '../types'
import { EVENT_CONFIG } from '../../config/eventConfig'
import { apiService } from '../services/api'
import ParticipantPass, { downloadPass } from '../components/ParticipantPass'

export default function Success() {
  const location = useLocation()
  const params = useParams<{ id: string }>()
  const [reg, setReg] = useState<StoredRegistration | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [confettiFired, setConfettiFired] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  useEffect(() => {
    let isCancelled = false

    async function resolveRegistration() {
      setLoading(true)
      setError(null)

      // 1. Try location.state
      const stateReg = location.state?.registration as StoredRegistration | undefined
      let targetReg: StoredRegistration | null = stateReg || null

      // 2. Try sessionStorage
      if (!targetReg) {
        try {
          const stored = sessionStorage.getItem('shf26_registration')
          if (stored) {
            targetReg = JSON.parse(stored)
          }
        } catch (_) {}
      }

      // 3. Try localStorage by registration ID
      const targetId = (params.id || targetReg?.registrationId || '').trim().toUpperCase()
      if (!targetReg && targetId) {
        try {
          const local = localStorage.getItem('shf26_registrations_v3')
          if (local) {
            const list: StoredRegistration[] = JSON.parse(local)
            const found = list.find(r => (r.registrationId || '').toUpperCase() === targetId)
            if (found) targetReg = found
          }
        } catch (_) {}
      }

      // 4. If still not found, fetch live from backend / Google Sheet by ID
      if (!targetReg && targetId) {
        try {
          const remoteReg = await apiService.getRegistrationById(targetId)
          if (remoteReg) {
            targetReg = remoteReg
          }
        } catch (fetchErr) {
          console.warn('Could not fetch registration from backend:', fetchErr)
        }
      }

      if (isCancelled) return

      if (targetReg && targetReg.registrationId) {
        setReg(targetReg)
        setError(null)

        // Cache safely in sessionStorage without heavy base64 to prevent QuotaExceededError
        try {
          const safeCopy = { ...targetReg }
          if (safeCopy.paymentScreenshotData && safeCopy.paymentScreenshotData.length > 500) {
            safeCopy.paymentScreenshotData = ''
          }
          sessionStorage.setItem('shf26_registration', JSON.stringify(safeCopy))
        } catch (_) {}

        // Trigger celebratory confetti once
        if (!confettiFired) {
          setConfettiFired(true)
          import('canvas-confetti').then(({ default: confetti }) => {
            confetti({
              particleCount: 130,
              spread: 85,
              origin: { y: 0.5 },
              colors: ['#FF3B30', '#FF7A00', '#ffffff', '#10B981'],
            })
          }).catch(() => {})
        }
      } else {
        setError(
          targetId
            ? `We could not find a confirmed registration for ID "${targetId}". Please verify your Registration ID or contact the organizers.`
            : 'No registration was found. Please complete the registration form to obtain your official pass.'
        )
      }

      setLoading(false)
    }

    resolveRegistration()

    return () => {
      isCancelled = true
    }
  }, [location, params.id, confettiFired])

  const handleDownload = async () => {
    if (!reg) return
    setIsDownloading(true)
    try {
      await downloadPass(reg)
    } finally {
      setTimeout(() => setIsDownloading(false), 500)
    }
  }

  return (
    <main className="pt-24 pb-28 px-4 sm:px-6 lg:px-8 min-h-screen flex items-start justify-center relative overflow-hidden bg-brand-bg">
      {/* Glow background */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-brand-primary/10 blur-[180px] pointer-events-none rounded-full" />
      <div className="bg-cyber-grid-dense absolute inset-0 opacity-40 pointer-events-none" />

      <div className="w-full max-w-2xl relative z-10">
        {/* Loading State */}
        {loading && (
          <div className="bg-brand-card/90 border border-brand-border p-12 rounded-2xl text-center shadow-2xl backdrop-blur-xl">
            <RefreshCw size={36} className="text-brand-primary animate-spin mx-auto mb-4" />
            <h2 className="font-display font-bold text-xl text-white mb-2">LOADING PARTICIPANT PASS...</h2>
            <p className="font-mono text-xs text-brand-muted">
              Retrieving confirmed registration details from {EVENT_CONFIG.eventName} database...
            </p>
          </div>
        )}

        {/* Error / Not Found State */}
        {!loading && error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-brand-card/90 border border-amber-500/40 p-8 sm:p-10 rounded-2xl text-center shadow-2xl backdrop-blur-xl"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-full mb-4">
              <AlertCircle size={32} className="text-amber-400" />
            </div>
            <h2 className="font-display font-black text-2xl text-white mb-2">REGISTRATION RECORD NOT FOUND</h2>
            <p className="font-mono text-xs text-brand-muted max-w-md mx-auto mb-6 leading-relaxed">
              {error}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/register"
                className="py-3 px-6 bg-brand-primary hover:bg-brand-primary/90 text-white font-mono text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
              >
                GO TO REGISTRATION
              </Link>
              <Link
                to="/"
                className="py-3 px-6 bg-brand-surface hover:bg-brand-card border border-brand-border text-brand-muted hover:text-white font-mono text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
              >
                <Home size={16} /> BACK TO HOME
              </Link>
            </div>
          </motion.div>
        )}

        {/* Confirmed Registration & Official Pass View */}
        {!loading && reg && (
          <>
            {/* Header Confirmation Message */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.15 }}
                className="inline-flex items-center justify-center w-20 h-20 bg-emerald-500/10 border border-emerald-500/40 rounded-full mb-5 shadow-[0_0_30px_rgba(16,185,129,0.2)]"
              >
                <CheckCircle2 size={42} className="text-emerald-400" />
              </motion.div>
              <h1 className="font-display font-black text-4xl sm:text-5xl text-white tracking-tight leading-tight mb-2">
                REGISTRATION<br />
                <span className="text-brand-primary">CONFIRMED</span>
              </h1>
              <p className="font-display text-lg sm:text-xl text-brand-orange tracking-widest uppercase">
                WELCOME TO {EVENT_CONFIG.eventName}
              </p>

              {/* Prominent Registration ID Box */}
              <div className="my-6 max-w-xs sm:max-w-sm mx-auto p-4 bg-brand-surface/90 border border-brand-primary/60 rounded-xl shadow-[0_0_30px_rgba(255,59,48,0.2)]">
                <div className="font-mono text-[10px] text-brand-muted tracking-widest uppercase mb-1">
                  YOUR REGISTRATION ID
                </div>
                <div className="font-mono text-2xl sm:text-3xl font-black text-brand-primary tracking-widest">
                  {reg.registrationId}
                </div>
              </div>

              {/* Submission Status Indicators */}
              <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 font-mono text-xs text-emerald-400 rounded-full">
                  <CheckCircle size={13} /> Registration Saved
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 font-mono text-xs text-emerald-400 rounded-full">
                  <ShieldCheck size={13} /> Payment Screenshot Uploaded
                </span>
                {reg.emailStatus === 'SENT' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 font-mono text-xs text-emerald-400 rounded-full">
                    <CheckCircle size={13} /> Confirmation Email Sent
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 font-mono text-xs text-amber-400 rounded-full">
                    <AlertCircle size={13} /> Confirmation Email Pending
                  </span>
                )}
              </div>

              {reg.emailStatus === 'FAILED' && (
                <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-300 font-mono text-xs max-w-md mx-auto">
                  Confirmation email could not be sent at this time. Please save your Registration ID.
                </div>
              )}
            </motion.div>

            {/* Canonical Reusable Participant Pass */}
            <ParticipantPass registration={reg} showDownloadButton={false} />

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6"
            >
              <button
                type="button"
                onClick={handleDownload}
                disabled={isDownloading}
                className="w-full py-4 px-6 bg-brand-primary hover:bg-brand-primary/90 text-white font-mono text-xs sm:text-sm font-bold tracking-wider rounded-xl flex items-center justify-center gap-2.5 transition-all shadow-[0_0_20px_rgba(255,59,48,0.25)] hover:scale-[1.01] cursor-pointer disabled:opacity-50"
              >
                <Download size={18} /> {isDownloading ? 'PREPARING PASS...' : 'DOWNLOAD PASS'}
              </button>

              <Link
                to="/"
                className="w-full py-4 px-6 bg-brand-card hover:bg-brand-surface border border-brand-border hover:border-brand-primary/40 text-brand-muted hover:text-white font-mono text-xs sm:text-sm font-bold tracking-wider rounded-xl flex items-center justify-center gap-2.5 transition-all hover:scale-[1.01]"
              >
                <Home size={18} /> BACK TO HOME
              </Link>
            </motion.div>
          </>
        )}
      </div>
    </main>
  )
}
