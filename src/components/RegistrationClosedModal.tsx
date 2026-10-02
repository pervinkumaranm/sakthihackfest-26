import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, X, ArrowRight } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { EVENT_CONFIG } from '../../config/event'

export const OPEN_REGISTRATION_CLOSED_EVENT = 'open-registration-closed-modal'

export function openRegistrationClosedModal() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(OPEN_REGISTRATION_CLOSED_EVENT))
  }
}

interface RegistrationClosedModalProps {
  isOpen?: boolean
  onClose?: () => void
  initialOpen?: boolean
}

export default function RegistrationClosedModal({
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
  initialOpen = false,
}: RegistrationClosedModalProps) {
  const [internalOpen, setInternalOpen] = useState(initialOpen)
  const location = useLocation()

  useEffect(() => {
    const handleOpen = () => setInternalOpen(true)
    window.addEventListener(OPEN_REGISTRATION_CLOSED_EVENT, handleOpen)
    return () => window.removeEventListener(OPEN_REGISTRATION_CLOSED_EVENT, handleOpen)
  }, [])

  const isVisible = controlledIsOpen !== undefined ? controlledIsOpen : internalOpen

  const handleClose = () => {
    setInternalOpen(false)
    if (controlledOnClose) {
      controlledOnClose()
    }
  }

  const isHome = location.pathname === '/'

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-lg bg-brand-surface/95 border border-red-500/40 rounded-2xl p-6 sm:p-8 shadow-[0_0_50px_rgba(239,68,68,0.25)] backdrop-blur-xl text-center"
          >
            <button
              type="button"
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 rounded-lg text-brand-muted hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>

            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.3)]">
              <Lock size={32} />
            </div>

            <div className="inline-block px-3 py-1 mb-3 rounded-full bg-red-500/10 border border-red-500/20 font-mono text-[11px] font-bold text-red-400 uppercase tracking-widest">
              CAPACITY REACHED (60/60)
            </div>

            <h2 className="font-display font-black text-xl sm:text-2xl text-white tracking-tight mb-3">
              REGISTRATION CLOSED
            </h2>

            <p className="font-mono text-xs sm:text-sm text-red-300 font-semibold mb-3 leading-relaxed">
              Registration Closed — The maximum registration limit of 60 teams has been reached.
            </p>

            <p className="text-xs sm:text-sm text-brand-muted leading-relaxed font-sans mb-6">
              Thank you for the tremendous enthusiasm and overwhelming response for {EVENT_CONFIG.eventName}. All 60 team slots have been officially filled. No further registrations can be accepted.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {isHome ? (
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white font-display font-bold text-xs tracking-widest transition-all shadow-[0_0_20px_rgba(255,59,48,0.3)] hover:scale-105 flex items-center justify-center gap-2 cursor-pointer"
                >
                  EXPLORE EVENT <ArrowRight size={14} />
                </button>
              ) : (
                <Link
                  to="/"
                  onClick={handleClose}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white font-display font-bold text-xs tracking-widest transition-all shadow-[0_0_20px_rgba(255,59,48,0.3)] hover:scale-105 flex items-center justify-center gap-2"
                >
                  RETURN TO HOME <ArrowRight size={14} />
                </Link>
              )}
              <button
                type="button"
                onClick={handleClose}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-brand-card border border-brand-border hover:border-brand-muted text-brand-muted hover:text-white font-mono text-xs tracking-wider transition-colors cursor-pointer"
              >
                DISMISS
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
