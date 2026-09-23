import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface LoadingScreenProps {
  onComplete: () => void
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [phase, setPhase] = useState<'boot' | 'reveal' | 'enter'>('boot')
  const [progress, setProgress] = useState(0)
  const [bootLines, setBootLines] = useState<string[]>([])
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const bootSequence = [
    'INITIALIZING HACKFEST GRID...',
    'LOADING INNOVATION MATRIX...',
    'SYNCING CHALLENGE MODULES...',
    'ESTABLISHING NEURAL LINK...',
    "SAKTHI HACKFEST'26 — ONLINE.",
  ]

  useEffect(() => {
    // Canvas scanline animation
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    let animId: number
    let scanY = 0

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Grid
      ctx.strokeStyle = 'rgba(255, 59, 48, 0.06)'
      ctx.lineWidth = 1
      const step = 40
      for (let x = 0; x < canvas.width; x += step) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke()
      }
      for (let y = 0; y < canvas.height; y += step) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke()
      }

      // Scanline
      const grad = ctx.createLinearGradient(0, scanY - 40, 0, scanY + 40)
      grad.addColorStop(0, 'rgba(255, 59, 48, 0)')
      grad.addColorStop(0.5, 'rgba(255, 59, 48, 0.12)')
      grad.addColorStop(1, 'rgba(255, 59, 48, 0)')
      ctx.fillStyle = grad
      ctx.fillRect(0, scanY - 40, canvas.width, 80)

      scanY = (scanY + 2) % canvas.height
      animId = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(animId)
  }, [])

  useEffect(() => {
    // Boot sequence text lines
    let lineIndex = 0
    let prog = 0

    const lineTimer = setInterval(() => {
      if (lineIndex < bootSequence.length) {
        setBootLines(prev => [...prev, bootSequence[lineIndex]])
        lineIndex++
      }
    }, 320)

    const progressTimer = setInterval(() => {
      prog += Math.random() * 8 + 3
      if (prog >= 100) {
        prog = 100
        clearInterval(progressTimer)
        clearInterval(lineTimer)
        setTimeout(() => setPhase('reveal'), 300)
        setTimeout(() => setPhase('enter'), 900)
        setTimeout(onComplete, 2600)
      }
      setProgress(Math.min(prog, 100))
    }, 100)

    return () => {
      clearInterval(lineTimer)
      clearInterval(progressTimer)
    }
  }, [])

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
        style={{ background: '#050505' }}
        exit={{ opacity: 0, scale: 1.04 }}
        transition={{ duration: 0.5 }}
      >
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

        <div className="relative z-10 w-full max-w-xl px-8 flex flex-col items-center gap-8">
          {/* Logo Mark */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="w-16 h-16 relative"
          >
            <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="64" height="64" rx="12" fill="#0D0D0F" stroke="#FF3B30" strokeWidth="1.5" />
              <polygon points="12,52 32,12 52,52" fill="none" stroke="#FF3B30" strokeWidth="2.5" />
              <circle cx="32" cy="34" r="7" fill="#FF7A00" />
              <circle cx="32" cy="34" r="3" fill="#FF3B30" />
            </svg>
          </motion.div>

          {/* Boot lines */}
          <div className="w-full font-mono text-xs text-brand-muted space-y-1 min-h-[100px]">
            {bootLines.map((line, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className={i === bootLines.length - 1 ? 'text-brand-primary' : ''}
              >
                <span className="text-brand-primary/50 mr-2">{'>'}</span>{line}
              </motion.div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="w-full">
            <div className="flex justify-between mb-2 font-mono text-xs text-brand-muted">
              <span>SYSTEM LOAD</span>
              <span className="text-brand-primary">{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-[2px] bg-brand-border relative overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-brand-orange to-brand-primary"
                style={{ width: `${progress}%` }}
                transition={{ ease: 'easeOut' }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
            </div>
          </div>

          {/* Reveal phase */}
          <AnimatePresence>
            {phase === 'reveal' || phase === 'enter' ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <div className="font-display font-black text-center tracking-tight">
                  <div className="text-3xl sm:text-5xl text-white tracking-widest drop-shadow-[0_2px_14px_rgba(255,255,255,0.15)]">
                    SAKTHI
                  </div>
                  <div className="text-3xl sm:text-5xl tracking-widest mt-1 whitespace-nowrap">
                    <span className="text-brand-primary drop-shadow-[0_0_20px_rgba(255,59,48,0.5)]">HACKFEST</span>
                    <span className="text-brand-orange drop-shadow-[0_0_20px_rgba(255,149,0,0.45)]">'26</span>
                  </div>
                </div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="mt-4 font-mono text-sm text-brand-muted tracking-widest"
                >
                  ENTER THE INNOVATION GRID →
                </motion.div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
