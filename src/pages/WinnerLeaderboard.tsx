import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Medal, Award, Sparkles, Maximize2, Minimize2, Radio, Crown, Star, Flame } from 'lucide-react'
import { winnerService, type WinnerAnnouncementState, type WinnerAnnouncementStage } from '../services/winnerService'

export default function WinnerLeaderboard() {
  const [state, setState] = useState<WinnerAnnouncementState>(() => winnerService.getState())
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [countdownNumber, setCountdownNumber] = useState<number | null>(null)
  const [firstPrizeStep, setFirstPrizeStep] = useState<'intro' | 'spotlight' | 'reveal' | 'champions'>('intro')

  // Real-time synchronization
  useEffect(() => {
    const unsub = winnerService.subscribe((newState) => {
      setState(newState)
    })
    return unsub
  }, [])

  // Fullscreen toggle handler
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {})
      setIsFullscreen(true)
    } else {
      document.exitFullscreen().catch(() => {})
      setIsFullscreen(false)
    }
  }

  // ── Synchronized 5-Second Countdown Controller ────────────────────────────
  useEffect(() => {
    if (state.stage !== 'COUNTDOWN_RUNNING' || !state.countdownStartTime) {
      setCountdownNumber(null)
      return
    }

    const checkCountdown = () => {
      const now = Date.now()
      const elapsed = (now - (state.countdownStartTime || now)) / 1000
      const current = 5 - Math.floor(elapsed)

      if (current > 0) {
        setCountdownNumber(current)
      } else {
        // Countdown completed! Transition directly to 1st Prize
        setCountdownNumber(0)
        winnerService.announceFirst()
      }
    }

    checkCountdown()
    const timer = setInterval(checkCountdown, 250)
    return () => clearInterval(timer)
  }, [state.stage, state.countdownStartTime])

  // ── 1st Prize Cinematic Timing Progression ────────────────────────────────
  useEffect(() => {
    if (state.stage !== 'FIRST_ANNOUNCED') {
      setFirstPrizeStep('intro')
      return
    }

    // Step 1: "THE MOMENT HAS ARRIVED"
    setFirstPrizeStep('intro')

    // Step 2: Golden Spotlight & 1st Prize Emblem at 1.5s
    const t1 = setTimeout(() => {
      setFirstPrizeStep('spotlight')
    }, 1500)

    // Step 3: Reveal Champion Team Name with Particle/Light burst at 3.2s
    const t2 = setTimeout(() => {
      setFirstPrizeStep('reveal')
    }, 3200)

    // Step 4: Show "CHAMPIONS OF SAKTHI HACKFEST '26" at 5.5s
    const t3 = setTimeout(() => {
      setFirstPrizeStep('champions')
    }, 5500)

    // Step 5: Automatically transition to full podium after 14s if admin hasn't clicked
    const t4 = setTimeout(() => {
      winnerService.completeAnnouncement()
    }, 14000)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      clearTimeout(t4)
    }
  }, [state.stage, state.firstAnnouncedAt])

  return (
    <div className="min-h-screen bg-[#07090e] text-white font-sans selection:bg-brand-primary selection:text-white relative overflow-hidden flex flex-col justify-between">
      {/* ── AMBIENT CYBERPUNK STAGE BACKGROUND ──────────────────────────────── */}
      <div className="absolute inset-0 bg-cyber-grid-dense opacity-30 pointer-events-none" />

      {/* Dynamic Ambient Spotlights according to current stage */}
      {state.stage === 'THIRD_ANNOUNCED' || state.stage === 'THIRD_DISTRIBUTION_COMPLETE' ? (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-900/30 via-orange-950/10 to-transparent pointer-events-none" />
      ) : state.stage === 'SECOND_ANNOUNCED' || state.stage === 'SECOND_DISTRIBUTION_COMPLETE' ? (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-400/25 via-slate-800/10 to-transparent pointer-events-none" />
      ) : state.stage === 'COUNTDOWN_RUNNING' ? (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-600/25 via-red-950/15 to-transparent pointer-events-none animate-pulse" />
      ) : state.stage === 'FIRST_ANNOUNCED' || state.stage === 'COMPLETED' ? (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-500/25 via-amber-950/15 to-transparent pointer-events-none" />
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-primary/15 via-transparent to-transparent pointer-events-none" />
      )}

      {/* ── STAGE TOP BAR ─────────────────────────────────────────────────── */}
      <header className="relative z-30 px-4 sm:px-8 py-4 sm:py-6 flex items-center justify-between border-b border-white/10 backdrop-blur-md bg-black/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-surface border border-brand-primary/40 flex items-center justify-center text-brand-primary shadow-glow-red">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <div className="font-display font-black text-sm sm:text-base tracking-wider text-white">
              SAKTHI <span className="text-brand-primary">HACKFEST</span> '26
            </div>
            <div className="font-mono text-[10px] text-brand-muted tracking-widest uppercase flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-ping inline-block" />
              OFFICIAL GRAND FINALE STAGE
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Stage State Pill */}
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 font-mono text-[11px] text-brand-muted">
            <Radio size={12} className="text-brand-primary animate-pulse" />
            LIVE STAGE SYNC
          </span>

          <button
            onClick={toggleFullscreen}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white font-mono text-xs flex items-center gap-1.5 transition-all"
            title="Toggle Stage Fullscreen"
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            <span className="hidden sm:inline">{isFullscreen ? 'Exit' : 'Fullscreen'}</span>
          </button>
        </div>
      </header>

      {/* ── STAGE MAIN DISPLAY VIEWPORT ───────────────────────────────────── */}
      <main className="relative z-20 flex-1 flex flex-col items-center justify-center px-4 sm:px-8 py-8 sm:py-12 max-w-6xl mx-auto w-full text-center">
        <AnimatePresence mode="wait">
          {/* ─────────────────────────────────────────────────────────────────
              1. STAGE: NOT STARTED (STANDBY)
             ───────────────────────────────────────────────────────────────── */}
          {state.stage === 'NOT_STARTED' && (
            <motion.div
              key="not-started"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.6 }}
              className="space-y-6 max-w-2xl"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-primary/15 border border-brand-primary/40 font-mono text-xs text-brand-primary tracking-widest uppercase font-bold">
                <Sparkles size={14} /> GRAND FINALE RESULTS
              </div>

              <h1 className="font-display font-black text-4xl sm:text-6xl md:text-7xl text-white tracking-wide leading-tight">
                THE WINNERS <br />
                <span className="bg-gradient-to-r from-brand-primary via-brand-orange to-yellow-400 bg-clip-text text-transparent">
                  WILL BE REVEALED
                </span>
              </h1>

              <p className="text-sm sm:text-base text-brand-muted font-mono max-w-lg mx-auto leading-relaxed">
                Jury evaluation and code verification are complete. Standby for the live stage announcement of the 3rd, 2nd, and 1st prize champions.
              </p>

              <div className="pt-4 flex items-center justify-center gap-4 text-xs font-mono text-brand-mutedDark">
                <span>3RD PRIZE: ₹10,000</span>
                <span>•</span>
                <span>2ND PRIZE: ₹15,000</span>
                <span>•</span>
                <span className="text-brand-orange font-bold">1ST PRIZE: ₹25,000</span>
              </div>
            </motion.div>
          )}

          {/* ─────────────────────────────────────────────────────────────────
              2. STAGE: 3RD PRIZE REVEAL
             ───────────────────────────────────────────────────────────────── */}
          {state.stage === 'THIRD_ANNOUNCED' && (
            <motion.div
              key="third-announced"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8 w-full max-w-3xl"
            >
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-1"
              >
                <div className="font-mono text-xs sm:text-sm tracking-widest uppercase text-amber-500 font-bold">
                  SAKTHI HACKFEST '26 · OFFICIAL RESULTS
                </div>
                <div className="font-display font-bold text-lg sm:text-xl text-white/80">
                  THE FIRST WINNER HAS BEEN DECIDED...
                </div>
              </motion.div>

              {/* Bronze Spotlight Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.85, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.4 }}
                className="relative rounded-3xl border-2 border-amber-600/50 bg-gradient-to-b from-amber-950/40 via-[#18110b] to-[#0d0906] p-8 sm:p-12 shadow-[0_0_80px_rgba(217,119,6,0.25)] backdrop-blur-xl space-y-6 overflow-hidden"
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-600/20 rounded-full blur-3xl pointer-events-none" />

                {/* Bronze Medal */}
                <div className="relative z-10 flex flex-col items-center">
                  <span className="text-6xl sm:text-7xl mb-2 drop-shadow-[0_0_25px_rgba(217,119,6,0.6)]">
                    🥉
                  </span>
                  <div className="inline-block px-4 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 font-mono text-xs sm:text-sm font-bold tracking-widest text-amber-400 uppercase">
                    3RD PRIZE WINNER
                  </div>
                </div>

                {/* Team Name */}
                <div className="relative z-10 space-y-3">
                  <motion.h2
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    className="font-display font-black text-3xl sm:text-5xl md:text-6xl text-white tracking-wide"
                  >
                    {state.thirdPlace?.teamName || 'SELECTED TEAM'}
                  </motion.h2>

                  {state.thirdPlace?.college && (
                    <p className="text-xs sm:text-sm text-amber-200/80 font-mono tracking-wider max-w-xl mx-auto">
                      {state.thirdPlace.college}
                    </p>
                  )}

                  {state.thirdPlace?.teamLeader && (
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-black/40 border border-amber-500/30 text-xs font-mono text-amber-300">
                      <span>Team Leader:</span>
                      <strong className="text-white">{state.thirdPlace.teamLeader}</strong>
                    </div>
                  )}
                </div>

                <div className="relative z-10 pt-4 border-t border-amber-600/30 flex items-center justify-center gap-2 font-mono text-xs text-amber-400/80">
                  <Award size={15} />
                  <span>PRIZE AMOUNT: <strong>₹10,000 + SHF'26 CERTIFICATES</strong></span>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* ─────────────────────────────────────────────────────────────────
              3. STAGE: 3RD PRIZE DISTRIBUTION
             ───────────────────────────────────────────────────────────────── */}
          {state.stage === 'THIRD_DISTRIBUTION_COMPLETE' && (
            <motion.div
              key="third-distribution"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.6 }}
              className="space-y-6 w-full max-w-2xl"
            >
              <div className="text-6xl sm:text-7xl">🥉</div>
              <div className="space-y-2">
                <div className="font-mono text-xs sm:text-sm text-amber-400 font-bold uppercase tracking-widest">
                  3RD PRIZE WINNER
                </div>
                <h2 className="font-display font-black text-3xl sm:text-5xl text-white">
                  {state.thirdPlace?.teamName}
                </h2>
                <p className="text-xs sm:text-sm text-brand-muted font-mono">
                  {state.thirdPlace?.college}
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-2">
                <div className="inline-block px-4 py-1 rounded-full bg-amber-500/20 text-amber-300 font-mono text-xs font-bold uppercase tracking-wider animate-pulse">
                  PRIZE DISTRIBUTION
                </div>
                <p className="text-xs text-brand-muted font-mono leading-relaxed">
                  3rd prize felicitation and certificates are being physically distributed on stage.
                </p>
              </div>
            </motion.div>
          )}

          {/* ─────────────────────────────────────────────────────────────────
              4. STAGE: 2ND PRIZE REVEAL
             ───────────────────────────────────────────────────────────────── */}
          {state.stage === 'SECOND_ANNOUNCED' && (
            <motion.div
              key="second-announced"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8 w-full max-w-3xl"
            >
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-1"
              >
                <div className="font-mono text-xs sm:text-sm tracking-widest uppercase text-slate-300 font-bold">
                  SAKTHI HACKFEST '26 · OFFICIAL RESULTS
                </div>
                <div className="font-display font-bold text-lg sm:text-xl text-white/90">
                  THE NEXT WINNER...
                </div>
              </motion.div>

              {/* Silver Spotlight Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.85, filter: 'blur(10px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                className="relative rounded-3xl border-2 border-slate-300/50 bg-gradient-to-b from-slate-800/40 via-[#10141c] to-[#07090e] p-8 sm:p-12 shadow-[0_0_80px_rgba(203,213,225,0.25)] backdrop-blur-xl space-y-6 overflow-hidden"
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-slate-300/20 rounded-full blur-3xl pointer-events-none" />

                {/* Silver Medal */}
                <div className="relative z-10 flex flex-col items-center">
                  <span className="text-6xl sm:text-7xl mb-2 drop-shadow-[0_0_25px_rgba(203,213,225,0.6)]">
                    🥈
                  </span>
                  <div className="inline-block px-4 py-1 rounded-full bg-slate-400/20 border border-slate-400/40 font-mono text-xs sm:text-sm font-bold tracking-widest text-slate-200 uppercase">
                    2ND PRIZE WINNER
                  </div>
                </div>

                {/* Team Name */}
                <div className="relative z-10 space-y-3">
                  <motion.h2
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.7 }}
                    className="font-display font-black text-3xl sm:text-5xl md:text-6xl text-white tracking-wide"
                  >
                    {state.secondPlace?.teamName || 'SELECTED TEAM'}
                  </motion.h2>

                  {state.secondPlace?.college && (
                    <p className="text-xs sm:text-sm text-slate-300/80 font-mono tracking-wider max-w-xl mx-auto">
                      {state.secondPlace.college}
                    </p>
                  )}

                  {state.secondPlace?.teamLeader && (
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-black/40 border border-slate-400/30 text-xs font-mono text-slate-200">
                      <span>Team Leader:</span>
                      <strong className="text-white">{state.secondPlace.teamLeader}</strong>
                    </div>
                  )}
                </div>

                <div className="relative z-10 pt-4 border-t border-slate-400/30 flex items-center justify-center gap-2 font-mono text-xs text-slate-300">
                  <Award size={15} />
                  <span>PRIZE AMOUNT: <strong>₹15,000 + SHF'26 CERTIFICATES</strong></span>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* ─────────────────────────────────────────────────────────────────
              5. STAGE: 2ND PRIZE DISTRIBUTION
             ───────────────────────────────────────────────────────────────── */}
          {state.stage === 'SECOND_DISTRIBUTION_COMPLETE' && (
            <motion.div
              key="second-distribution"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.6 }}
              className="space-y-6 w-full max-w-2xl"
            >
              <div className="text-6xl sm:text-7xl">🥈</div>
              <div className="space-y-2">
                <div className="font-mono text-xs sm:text-sm text-slate-300 font-bold uppercase tracking-widest">
                  2ND PRIZE WINNER
                </div>
                <h2 className="font-display font-black text-3xl sm:text-5xl text-white">
                  {state.secondPlace?.teamName}
                </h2>
                <p className="text-xs sm:text-sm text-brand-muted font-mono">
                  {state.secondPlace?.college}
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-800/20 border border-slate-400/30 space-y-2">
                <div className="inline-block px-4 py-1 rounded-full bg-slate-400/20 text-slate-200 font-mono text-xs font-bold uppercase tracking-wider animate-pulse">
                  PRIZE DISTRIBUTION
                </div>
                <p className="text-xs text-brand-muted font-mono leading-relaxed">
                  2nd prize felicitation in progress. Prepare for the Grand Finale 1st Prize countdown!
                </p>
              </div>
            </motion.div>
          )}

          {/* ─────────────────────────────────────────────────────────────────
              6. STAGE: DRAMATIC 5-SECOND COUNTDOWN
             ───────────────────────────────────────────────────────────────── */}
          {state.stage === 'COUNTDOWN_RUNNING' && (
            <motion.div
              key="countdown-running"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6 w-full flex flex-col items-center justify-center min-h-[60vh]"
            >
              <div className="font-mono text-sm sm:text-base text-red-400 font-bold uppercase tracking-widest">
                THE FINAL MOMENT
              </div>

              <div className="relative flex items-center justify-center w-64 h-64 sm:w-80 sm:h-80">
                <div className="absolute inset-0 bg-red-600/20 rounded-full blur-3xl animate-ping" />

                <AnimatePresence mode="wait">
                  <motion.div
                    key={countdownNumber ?? 'count'}
                    initial={{ opacity: 0, scale: 0.5, y: 20 }}
                    animate={{ opacity: 1, scale: [0.6, 1.15, 1], y: 0 }}
                    exit={{ opacity: 0, scale: 1.3, filter: 'blur(8px)' }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="font-display font-black text-8xl sm:text-9xl md:text-[14rem] text-transparent bg-gradient-to-b from-white via-red-200 to-red-500 bg-clip-text drop-shadow-[0_0_50px_rgba(239,68,68,0.8)]"
                  >
                    {countdownNumber && countdownNumber > 0 ? countdownNumber : 1}
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="font-mono text-xs sm:text-sm text-brand-muted uppercase tracking-widest">
                REVEALING 1ST PLACE NATIONAL CHAMPIONS...
              </div>
            </motion.div>
          )}

          {/* ─────────────────────────────────────────────────────────────────
              7. STAGE: 1ST PRIZE GRAND FINALE REVEAL
             ───────────────────────────────────────────────────────────────── */}
          {state.stage === 'FIRST_ANNOUNCED' && (
            <motion.div
              key="first-announced"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8 w-full max-w-4xl"
            >
              {/* Step 1: "THE MOMENT HAS ARRIVED" */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="font-mono text-xs sm:text-sm tracking-widest uppercase text-yellow-400 font-bold"
              >
                THE MOMENT HAS ARRIVED.
              </motion.div>

              {/* Grand Finale Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                className="relative rounded-3xl border-2 border-yellow-500/60 bg-gradient-to-b from-yellow-950/40 via-[#18140a] to-[#0a0804] p-8 sm:p-14 shadow-[0_0_120px_rgba(234,179,8,0.35)] backdrop-blur-2xl space-y-6 overflow-hidden"
              >
                {/* Radial Golden Expand Light */}
                <motion.div
                  initial={{ width: 0, height: 0, opacity: 0 }}
                  animate={{ width: 450, height: 450, opacity: 0.3 }}
                  transition={{ duration: 2, ease: 'easeOut' }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-yellow-400 rounded-full blur-3xl pointer-events-none"
                />

                {/* Golden Trophy & Title */}
                <div className="relative z-10 flex flex-col items-center">
                  <motion.span
                    initial={{ scale: 0.3, rotate: -15 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', damping: 10, stiffness: 100 }}
                    className="text-7xl sm:text-8xl mb-3 drop-shadow-[0_0_35px_rgba(234,179,8,0.8)]"
                  >
                    🥇
                  </motion.span>

                  <div className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full bg-yellow-400/20 border border-yellow-400/50 font-display font-black text-sm sm:text-base tracking-widest text-yellow-300 uppercase shadow-glow-red">
                    <Crown size={16} /> 1ST PRIZE CHAMPIONS
                  </div>
                </div>

                {/* Team Name with High-End Reveal */}
                <div className="relative z-10 space-y-4">
                  {firstPrizeStep !== 'intro' && (
                    <motion.h1
                      initial={{ opacity: 0, filter: 'blur(12px)', scale: 0.8 }}
                      animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="font-display font-black text-4xl sm:text-6xl md:text-7xl text-transparent bg-gradient-to-r from-yellow-200 via-amber-100 to-yellow-400 bg-clip-text drop-shadow-[0_0_40px_rgba(234,179,8,0.7)]"
                    >
                      {state.firstPlace?.teamName || 'SELECTED CHAMPION'}
                    </motion.h1>
                  )}

                  {state.firstPlace?.college && firstPrizeStep !== 'intro' && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="text-sm sm:text-base text-yellow-100/90 font-mono tracking-wider max-w-2xl mx-auto"
                    >
                      {state.firstPlace.college}
                    </motion.p>
                  )}

                  {state.firstPlace?.teamLeader && firstPrizeStep !== 'intro' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.7 }}
                      className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-black/60 border border-yellow-400/40 text-xs sm:text-sm font-mono text-yellow-300"
                    >
                      <Star size={14} className="fill-current" />
                      <span>Team Leader:</span>
                      <strong className="text-white">{state.firstPlace.teamLeader}</strong>
                    </motion.div>
                  )}
                </div>

                {/* Bottom Callout: CHAMPIONS OF SAKTHI HACKFEST '26 */}
                {firstPrizeStep === 'champions' && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="relative z-10 pt-6 border-t border-yellow-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-xs text-yellow-300"
                  >
                    <span className="font-display font-black text-sm tracking-wider uppercase text-white">
                      CHAMPIONS OF SAKTHI HACKFEST '26
                    </span>
                    <span className="px-3 py-1 rounded bg-yellow-400/20 text-yellow-300 font-bold">
                      PRIZE: ₹25,000 + WINNER TROPHY
                    </span>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          )}

          {/* ─────────────────────────────────────────────────────────────────
              8. STAGE: COMPLETED / FINAL 3-PODIUM WINNER LAYOUT
             ───────────────────────────────────────────────────────────────── */}
          {state.stage === 'COMPLETED' && (
            <motion.div
              key="completed-podium"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-10 w-full"
            >
              {/* Header Title */}
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-yellow-400/15 border border-yellow-400/30 text-yellow-400 font-mono text-xs font-bold tracking-widest uppercase">
                  <Crown size={14} /> OFFICIAL WINNERS
                </div>
                <h1 className="font-display font-black text-3xl sm:text-5xl text-white tracking-wide">
                  SAKTHI HACKFEST '26
                </h1>
                <p className="font-mono text-xs sm:text-sm text-brand-orange uppercase tracking-widest font-semibold">
                  THE GRID HAS SPOKEN.
                </p>
              </div>

              {/* ── 3-PODIUM LAYOUT (1st in center top, 2nd left, 3rd right) ── */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end max-w-5xl mx-auto">
                {/* 🥈 2ND PRIZE (Left) */}
                <div className="order-2 md:order-1 rounded-3xl border border-slate-300/40 bg-gradient-to-b from-slate-800/30 via-slate-900/50 to-black p-6 space-y-4 shadow-xl backdrop-blur-md">
                  <div className="text-5xl">🥈</div>
                  <div className="inline-block px-3 py-0.5 rounded-full bg-slate-400/20 text-slate-200 font-mono text-[11px] font-bold uppercase tracking-wider">
                    2ND PRIZE
                  </div>
                  <h3 className="font-display font-black text-xl sm:text-2xl text-white line-clamp-2">
                    {state.secondPlace?.teamName || 'Team 2'}
                  </h3>
                  <p className="text-xs text-slate-300/80 font-mono line-clamp-2">
                    {state.secondPlace?.college}
                  </p>
                  <div className="pt-2 border-t border-white/10 text-xs font-mono text-slate-300">
                    Leader: <strong className="text-white">{state.secondPlace?.teamLeader}</strong>
                  </div>
                  <div className="font-mono text-xs text-slate-400 font-bold">
                    ₹15,000 Cash Prize
                  </div>
                </div>

                {/* 🥇 1ST PRIZE (Center Top - Prominent) */}
                <div className="order-1 md:order-2 rounded-3xl border-2 border-yellow-400/60 bg-gradient-to-b from-yellow-950/40 via-amber-950/30 to-black p-8 sm:p-10 space-y-5 shadow-[0_0_60px_rgba(234,179,8,0.3)] backdrop-blur-md md:-translate-y-6">
                  <div className="text-6xl sm:text-7xl">🥇</div>
                  <div className="inline-block px-4 py-1 rounded-full bg-yellow-400/20 border border-yellow-400/50 text-yellow-300 font-display font-black text-xs sm:text-sm uppercase tracking-widest shadow-glow-red">
                    1ST PRIZE CHAMPIONS
                  </div>
                  <h2 className="font-display font-black text-2xl sm:text-4xl text-white line-clamp-2">
                    {state.firstPlace?.teamName || 'Champion Team'}
                  </h2>
                  <p className="text-xs sm:text-sm text-yellow-100/90 font-mono line-clamp-2">
                    {state.firstPlace?.college}
                  </p>
                  <div className="pt-3 border-t border-yellow-500/30 text-xs font-mono text-yellow-300">
                    Leader: <strong className="text-white">{state.firstPlace?.teamLeader}</strong>
                  </div>
                  <div className="font-mono text-sm text-yellow-400 font-bold">
                    ₹25,000 + Winner Trophy
                  </div>
                </div>

                {/* 🥉 3RD PRIZE (Right) */}
                <div className="order-3 md:order-3 rounded-3xl border border-amber-600/40 bg-gradient-to-b from-amber-950/30 via-orange-950/50 to-black p-6 space-y-4 shadow-xl backdrop-blur-md">
                  <div className="text-5xl">🥉</div>
                  <div className="inline-block px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[11px] font-bold uppercase tracking-wider">
                    3RD PRIZE
                  </div>
                  <h3 className="font-display font-black text-xl sm:text-2xl text-white line-clamp-2">
                    {state.thirdPlace?.teamName || 'Team 3'}
                  </h3>
                  <p className="text-xs text-amber-200/80 font-mono line-clamp-2">
                    {state.thirdPlace?.college}
                  </p>
                  <div className="pt-2 border-t border-white/10 text-xs font-mono text-amber-300">
                    Leader: <strong className="text-white">{state.thirdPlace?.teamLeader}</strong>
                  </div>
                  <div className="font-mono text-xs text-amber-400 font-bold">
                    ₹10,000 Cash Prize
                  </div>
                </div>
              </div>

              {/* Bottom Tagline */}
              <div className="pt-4 text-xs font-mono text-brand-muted">
                Hearty Congratulations to all Winners and Participants of Sakthi Hackfest '26!
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ── STAGE FOOTER ──────────────────────────────────────────────────── */}
      <footer className="relative z-30 px-4 sm:px-8 py-4 sm:py-5 border-t border-white/10 backdrop-blur-md bg-black/40 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
        <div className="font-mono text-xs text-brand-muted uppercase tracking-wider">
          BUILD. BREAK. INNOVATE.
        </div>
        <div className="font-mono text-[11px] text-brand-mutedDark">
          SREE SAKTHI ENGINEERING COLLEGE · COIMBATORE
        </div>
      </footer>
    </div>
  )
}
