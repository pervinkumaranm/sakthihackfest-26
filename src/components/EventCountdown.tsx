import { useState, useEffect } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { eventConfig } from '../../config/eventConfig'

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
  isLive: boolean
  isConcluded: boolean
}

function calculateTimeLeft(): TimeLeft {
  const startTarget = new Date(eventConfig.eventStartDateTime).getTime()
  const endTarget = new Date(eventConfig.eventEndDateTime).getTime()
  const now = Date.now()

  if (now >= endTarget) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isLive: false, isConcluded: true }
  }

  const difference = startTarget - now

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isLive: true, isConcluded: false }
  }

  const days = Math.floor(difference / (1000 * 60 * 60 * 24))
  const hours = Math.floor((difference / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((difference / 1000 / 60) % 60)
  const seconds = Math.floor((difference / 1000) % 60)

  return { days, hours, minutes, seconds, isLive: false, isConcluded: false }
}

function TimeUnitCard({
  value,
  label,
  shouldReduceMotion
}: {
  value: number
  label: string
  shouldReduceMotion: boolean | null
}) {
  const formatted = String(value).padStart(2, '0')

  return (
    <div className="w-[78px] sm:w-[94px] h-[82px] sm:h-[96px] bg-[#0A0A0E]/90 border border-[#FF3B30] rounded-xl sm:rounded-2xl p-2 sm:p-3 flex flex-col items-center justify-center shadow-[0_0_20px_rgba(255,59,48,0.22)] hover:shadow-[0_0_28px_rgba(255,59,48,0.38)] transition-all duration-300">
      <div className="h-8 sm:h-10 flex items-center justify-center overflow-hidden">
        {shouldReduceMotion ? (
          <span className="font-display font-black text-2xl sm:text-4xl text-white tracking-tight">
            {formatted}
          </span>
        ) : (
          <motion.span
            key={formatted}
            initial={{ opacity: 0.5, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="font-display font-black text-2xl sm:text-4xl text-white tracking-tight"
          >
            {formatted}
          </motion.span>
        )}
      </div>
      <div className="font-mono text-[9px] sm:text-[10px] tracking-[0.2em] text-[#FF3B30] uppercase font-bold mt-1">
        {label}
      </div>
    </div>
  )
}

export default function EventCountdown() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft)
  const shouldReduceMotion = useReducedMotion()

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  if (timeLeft.isConcluded) {
    return (
      <div
        aria-live="polite"
        className="my-5 px-6 py-3.5 rounded-xl border border-brand-border bg-[#0A0A0E]/90 text-center inline-flex flex-col items-center shadow-[0_0_20px_rgba(255,59,48,0.15)]"
      >
        <span className="font-mono text-[10px] text-brand-muted tracking-widest uppercase">
          EVENT STATUS
        </span>
        <div className="font-display font-black text-base sm:text-xl text-white mt-0.5">
          SAKTHI HACKFEST'26 HAS CONCLUDED
        </div>
      </div>
    )
  }

  if (timeLeft.isLive) {
    return (
      <div
        aria-live="polite"
        className="my-5 px-6 py-3.5 rounded-xl border border-[#FF3B30] bg-[#FF3B30]/15 text-center inline-flex items-center gap-3 shadow-[0_0_30px_rgba(255,59,48,0.35)]"
      >
        <span className="w-2.5 h-2.5 rounded-full bg-[#FF3B30] animate-ping" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#FF3B30] -ml-5" />
        <span className="font-display font-black text-sm sm:text-lg text-white tracking-widest">
          ● THE HACKATHON IS LIVE
        </span>
      </div>
    )
  }

  return (
    <div
      aria-live="polite"
      className="w-full max-w-xl mx-auto flex flex-col items-center select-none my-6"
    >
      {/* Centered Title with Horizontal Accent Lines */}
      <div className="flex items-center justify-center gap-3 w-full max-w-md mb-4">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#FF3B30]/50 to-[#FF3B30]/80" />
        <span className="font-mono text-[11px] sm:text-xs text-[#FF7A00] tracking-[0.25em] uppercase font-bold whitespace-nowrap">
          COUNTDOWN TO THE GRID
        </span>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent via-[#FF3B30]/50 to-[#FF3B30]/80" />
      </div>

      {/* 4 Countdown Boxes: Desktop Row, Mobile 2x2 */}
      <div className="grid grid-cols-2 sm:flex items-center justify-center gap-3 sm:gap-4 w-auto">
        <TimeUnitCard value={timeLeft.days} label="DAYS" shouldReduceMotion={shouldReduceMotion} />
        <TimeUnitCard value={timeLeft.hours} label="HOURS" shouldReduceMotion={shouldReduceMotion} />
        <TimeUnitCard value={timeLeft.minutes} label="MINUTES" shouldReduceMotion={shouldReduceMotion} />
        <TimeUnitCard value={timeLeft.seconds} label="SECONDS" shouldReduceMotion={shouldReduceMotion} />
      </div>
    </div>
  )
}
