import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Maximize2, Minimize2, Volume2, VolumeX, Shield,
  Radio, Clock, AlertTriangle, Sparkles, Trophy, Calendar
} from 'lucide-react'
import { timerService, type HackathonTimerState } from '../services/timerService'

// Web Audio API Synthesizer for Cyber Beeps (no external audio files needed)
function playCyberBeep(frequency = 880, type: OscillatorType = 'sine', duration = 0.2) {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = type
    osc.frequency.setValueAtTime(frequency, ctx.currentTime)

    gain.gain.setValueAtTime(0.2, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start()
    osc.stop(ctx.currentTime + duration)
  } catch {
    // Audio context may require prior user interaction
  }
}

export default function LiveTimer() {
  const [timerState, setTimerState] = useState<HackathonTimerState>(() => timerService.getState())
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [clockString, setClockString] = useState('')
  const prevStatusRef = useRef(timerState.status)

  // Subscribe to live timer changes (0ms BroadcastChannel + storage)
  useEffect(() => {
    const unsubscribe = timerService.subscribe((state) => {
      setTimerState(state)

      // Audio notification on status change
      if (soundEnabled && prevStatusRef.current !== state.status) {
        if (state.status === 'RUNNING') {
          playCyberBeep(660, 'triangle', 0.25)
          setTimeout(() => playCyberBeep(880, 'triangle', 0.4), 150)
        } else if (state.status === 'PAUSED') {
          playCyberBeep(440, 'sine', 0.3)
        } else if (state.status === 'ENDED') {
          playCyberBeep(220, 'sawtooth', 0.8)
          setTimeout(() => playCyberBeep(180, 'sawtooth', 1.2), 300)
        }
        prevStatusRef.current = state.status
      }
    })

    // Fallback network sync with /api/timer every 2.5 seconds
    const pollInterval = setInterval(() => {
      timerService.fetchServerState()
    }, 2500)

    return () => {
      unsubscribe()
      clearInterval(pollInterval)
    }
  }, [soundEnabled])

  // Real-time second tick to calculate live remainingSeconds and local clock
  useEffect(() => {
    const tick = setInterval(() => {
      const now = new Date()
      setClockString(
        new Intl.DateTimeFormat('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        }).format(now)
      )

      if (timerState.status === 'RUNNING') {
        const current = timerService.getState()
        setTimerState(current)
      }
    }, 500)

    return () => clearInterval(tick)
  }, [timerState.status])

  // Fullscreen Handler
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {})
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {})
    }
  }

  // Format hours, minutes, seconds
  const totalSec = Math.max(0, timerState.remainingSeconds)
  const hours = Math.floor(totalSec / 3600)
  const minutes = Math.floor((totalSec % 3600) / 60)
  const seconds = totalSec % 60

  const formattedHours = String(hours).padStart(2, '0')
  const formattedMinutes = String(minutes).padStart(2, '0')
  const formattedSeconds = String(seconds).padStart(2, '0')

  // Progress percentage
  const totalDuration = timerState.totalDurationSeconds || 86400
  const elapsed = Math.max(0, totalDuration - totalSec)
  const progressPercent = Math.min(100, Math.round((elapsed / totalDuration) * 100))

  return (
    <div className="relative min-h-screen bg-[#070709] text-white flex flex-col justify-between overflow-hidden select-none font-sans">
      {/* ── AMBIENT CYBER BACKGROUND ──────────────────────────────────────── */}
      <div className="bg-cyber-grid-dense fixed inset-0 opacity-40 pointer-events-none" />

      {/* Radiant Glowing Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-brand-primary/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[500px] h-[500px] bg-brand-orange/10 rounded-full blur-[120px] pointer-events-none" />

      {/* ── TOP HEADER / STAGE BAR ────────────────────────────────────────── */}
      <header className="relative z-20 w-full px-6 sm:px-10 py-5 sm:py-6 flex items-center justify-between border-b border-brand-border/40 backdrop-blur-sm">
        {/* Event Logo & College */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-brand-surface border border-brand-border flex items-center justify-center p-2 shadow-glow-red">
            <img src="/favicon.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="font-display font-black text-lg sm:text-2xl tracking-wider text-white flex items-center gap-2">
              SAKTHI <span className="text-brand-primary">HACKFEST</span> '26
              <span className="hidden md:inline-block px-2 py-0.5 rounded bg-brand-primary/20 text-brand-primary border border-brand-primary/40 font-mono text-[10px] tracking-widest uppercase">
                NATIONAL HACKATHON
              </span>
            </div>
            <div className="font-mono text-xs text-brand-muted tracking-wider">
              Sree Sakthi Engineering College · Karamadai, Coimbatore
            </div>
          </div>
        </div>

        {/* Live Status Pill & Quick Controls */}
        <div className="flex items-center gap-3">
          {/* Status Indicator */}
          <div className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-brand-surface border border-brand-border shadow-lg">
            <span
              className={`w-2.5 h-2.5 rounded-full inline-block ${
                timerState.status === 'RUNNING'
                  ? 'bg-green-500 animate-ping'
                  : timerState.status === 'PAUSED'
                  ? 'bg-yellow-400'
                  : timerState.status === 'ENDED'
                  ? 'bg-red-500 animate-pulse'
                  : timerState.status === 'STOPPED'
                  ? 'bg-amber-400'
                  : 'bg-brand-muted'
              }`}
            />
            <span className="font-mono text-xs sm:text-sm font-bold tracking-wider uppercase text-white">
              {timerState.status === 'RUNNING'
                ? 'HACKING IN PROGRESS'
                : timerState.status === 'PAUSED'
                ? 'TIMER PAUSED'
                : timerState.status === 'ENDED'
                ? 'TIME EXPIRED · CODE FREEZE'
                : timerState.status === 'STOPPED'
                ? (timerState.remainingSeconds === (timerState.configuredDurationSeconds || 86400) ? 'STAGE READY' : 'TIMER STOPPED')
                : 'STAGE READY'}
            </span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 sm:p-2.5 rounded-xl border border-brand-border bg-brand-surface hover:bg-brand-card text-brand-muted hover:text-white transition-colors"
            title={soundEnabled ? 'Sound Enabled' : 'Sound Muted'}
          >
            {soundEnabled ? <Volume2 size={18} className="text-brand-primary" /> : <VolumeX size={18} />}
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-2 sm:p-2.5 rounded-xl border border-brand-border bg-brand-surface hover:bg-brand-card text-brand-muted hover:text-white transition-colors"
            title="Toggle Fullscreen Projector Mode"
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        </div>
      </header>

      {/* ── MAIN STAGE CENTER: GIANT BIG SIZE ANIMATED TIMER ──────────────── */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 my-auto text-center py-6 sm:py-10">
        {/* Event Mode Tagline */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 sm:mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-primary/40 bg-brand-primary/10 text-brand-primary font-mono text-xs sm:text-sm tracking-[0.25em] font-bold uppercase shadow-glow-red">
            <Radio size={14} className="animate-pulse" />
            {Math.round((timerState.configuredDurationSeconds || 86400) / 3600)}-HOUR SPRINT CLOCK
          </div>
        </motion.div>

        {/* ── GIANT TIMER DIGITS (HOURS : MINUTES : SECONDS) ─────────────── */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 md:gap-6 lg:gap-8 max-w-7xl mx-auto w-full">
          {/* HOURS CARD */}
          <div className="flex-1 max-w-[280px] sm:max-w-[340px] aspect-[4/3] rounded-2xl sm:rounded-3xl bg-[#0D0D12]/90 border-2 border-brand-border/80 p-3 sm:p-6 flex flex-col items-center justify-center shadow-2xl relative overflow-hidden group hover:border-brand-primary transition-all">
            <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
            <div className="h-px w-full bg-brand-border/40 absolute top-1/2 -translate-y-1/2" />

            <span className="font-display font-black text-6xl sm:text-8xl md:text-9xl lg:text-[11rem] leading-none tracking-tight text-white drop-shadow-[0_0_35px_rgba(255,255,255,0.2)]">
              {formattedHours}
            </span>
            <span className="font-mono text-xs sm:text-sm md:text-base font-bold text-brand-primary tracking-[0.3em] uppercase mt-2 sm:mt-4 z-10">
              HOURS
            </span>
          </div>

          {/* COLON SEPARATOR */}
          <div className="flex flex-col gap-4 sm:gap-8 text-brand-primary font-black text-4xl sm:text-7xl md:text-8xl select-none animate-pulse">
            <span>:</span>
          </div>

          {/* MINUTES CARD */}
          <div className="flex-1 max-w-[280px] sm:max-w-[340px] aspect-[4/3] rounded-2xl sm:rounded-3xl bg-[#0D0D12]/90 border-2 border-brand-border/80 p-3 sm:p-6 flex flex-col items-center justify-center shadow-2xl relative overflow-hidden group hover:border-brand-primary transition-all">
            <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
            <div className="h-px w-full bg-brand-border/40 absolute top-1/2 -translate-y-1/2" />

            <span className="font-display font-black text-6xl sm:text-8xl md:text-9xl lg:text-[11rem] leading-none tracking-tight text-white drop-shadow-[0_0_35px_rgba(255,59,48,0.3)]">
              {formattedMinutes}
            </span>
            <span className="font-mono text-xs sm:text-sm md:text-base font-bold text-brand-primary tracking-[0.3em] uppercase mt-2 sm:mt-4 z-10">
              MINUTES
            </span>
          </div>

          {/* COLON SEPARATOR */}
          <div className="flex flex-col gap-4 sm:gap-8 text-brand-primary font-black text-4xl sm:text-7xl md:text-8xl select-none animate-pulse">
            <span>:</span>
          </div>

          {/* SECONDS CARD */}
          <div className="flex-1 max-w-[280px] sm:max-w-[340px] aspect-[4/3] rounded-2xl sm:rounded-3xl bg-[#0D0D12]/90 border-2 border-brand-orange/60 p-3 sm:p-6 flex flex-col items-center justify-center shadow-2xl relative overflow-hidden group hover:border-brand-orange transition-all shadow-[0_0_40px_rgba(255,122,0,0.15)]">
            <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
            <div className="h-px w-full bg-brand-border/40 absolute top-1/2 -translate-y-1/2" />

            <motion.span
              key={formattedSeconds}
              initial={{ scale: 0.96, opacity: 0.8 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="font-display font-black text-6xl sm:text-8xl md:text-9xl lg:text-[11rem] leading-none tracking-tight text-brand-orange drop-shadow-[0_0_40px_rgba(255,122,0,0.45)]"
            >
              {formattedSeconds}
            </motion.span>
            <span className="font-mono text-xs sm:text-sm md:text-base font-bold text-brand-orange tracking-[0.3em] uppercase mt-2 sm:mt-4 z-10">
              SECONDS
            </span>
          </div>
        </div>

        {/* ── DYNAMIC HACKATHON PROGRESS BAR ──────────────────────────────── */}
        <div className="w-full max-w-4xl mx-auto mt-8 sm:mt-12 space-y-2 px-2">
          <div className="flex items-center justify-between text-xs sm:text-sm font-mono text-brand-muted">
            <span>Hackathon Progress</span>
            <span className="text-white font-bold">{progressPercent}% Elapsed</span>
          </div>
          <div className="w-full h-3 sm:h-4 bg-[#14141B] rounded-full overflow-hidden border border-brand-border/60 p-0.5 shadow-inner">
            <motion.div
              className="h-full bg-gradient-to-r from-brand-primary via-brand-orange to-yellow-400 rounded-full shadow-glow-red"
              style={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* ENDED OVERLAY ALERT */}
        <AnimatePresence>
          {timerState.status === 'ENDED' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="mt-6 p-6 rounded-2xl bg-red-950/90 border-2 border-red-500 shadow-[0_0_60px_rgba(255,59,48,0.6)] text-center max-w-xl mx-auto"
            >
              <div className="font-display font-black text-2xl sm:text-4xl text-white tracking-widest mb-1">
                PENS DOWN · CODE FREEZE
              </div>
              <p className="font-mono text-xs sm:text-sm text-red-200">
                The {Math.round((timerState.configuredDurationSeconds || 86400) / 3600)}-hour hacking duration has concluded. No more commits or code changes allowed.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── MOTIVATIONAL SECTION: QUOTE & TAMIL THIRUKKURAL ────────────── */}
        <div className="w-full max-w-2xl mx-auto mt-8 sm:mt-10 px-4">
          <div className="relative rounded-2xl bg-[#0D0D12]/75 border border-brand-border/60 backdrop-blur-md px-6 py-4 sm:px-8 sm:py-5 shadow-2xl text-center space-y-2.5">
            {/* Motivational Quote */}
            <p className="font-mono text-xs sm:text-sm md:text-[15px] text-brand-orange font-semibold tracking-wide">
              "Success begins where determination refuses to give up."
            </p>

            {/* Tamil Thirukkural */}
            <div
              className="text-sm sm:text-base md:text-lg text-white/95 font-medium leading-relaxed tracking-normal"
              style={{ fontFamily: "'Noto Sans Tamil', 'Mukta Malar', 'Latha', system-ui, sans-serif" }}
            >
              <div>தெய்வத்தான் ஆகா தெனினும் முயற்சிதன்</div>
              <div>மெய்வருத்தக் கூலி தரும்.</div>
            </div>

            {/* Subtle Attribution */}
            <div className="text-[10px] sm:text-xs font-mono text-brand-muted tracking-widest uppercase">
              — திருக்குறள் (குறள் 619)
            </div>
          </div>
        </div>
      </main>

      {/* ── STAGE TICKER / ANNOUNCEMENT BANNER ────────────────────────────── */}
      <footer className="relative z-20 w-full bg-[#0D0D12]/95 border-t border-brand-border/60 px-6 sm:px-10 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-brand-muted">
        <div className="flex items-center gap-2 max-w-3xl truncate">
          <span className="px-2 py-0.5 rounded bg-brand-primary/20 text-brand-primary border border-brand-primary/40 font-bold uppercase text-[10px] tracking-wider whitespace-nowrap">
            STAGE NOTICE
          </span>
          <span className="text-white font-medium truncate">
            {timerState.announcement || 'Hacking in session. Please follow mentor guidelines and evaluation timelines.'}
          </span>
        </div>

        <div className="flex items-center gap-4 whitespace-nowrap">
          <span>IST TIME: <strong className="text-white">{clockString}</strong></span>
          <span className="text-brand-border">·</span>
          <a
            href="/manage-registrations"
            className="text-brand-muted hover:text-white transition-colors underline text-[11px]"
          >
            Admin Panel
          </a>
        </div>
      </footer>
    </div>
  )
}
