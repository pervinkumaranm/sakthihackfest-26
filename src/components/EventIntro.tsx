import { useRef, useEffect, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { EVENT_CONFIG } from '../../config/event'
import { apiService } from '../services/api'

export default function EventIntro() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })
  const [registeredTeamsCount, setRegisteredTeamsCount] = useState<number | null>(null)

  useEffect(() => {
    let active = true
    const fetchRegisteredCount = async () => {
      try {
        const res = await apiService.getRegistrationStatus()
        if (active && res && typeof res.count === 'number') {
          setRegisteredTeamsCount(res.count)
        }
      } catch (e) {
        console.warn('Failed to load registered teams count:', e)
      }
    }
    fetchRegisteredCount()
    const timer = setInterval(fetchRegisteredCount, 30000)
    return () => {
      active = false
      clearInterval(timer)
    }
  }, [])

  const stats = EVENT_CONFIG.stats

  const words = 'THIS IS NOT JUST ANOTHER HACKATHON.'.split(' ')

  return (
    <section id="event" ref={ref} className="relative py-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="bg-cyber-grid absolute inset-0 opacity-50" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Headline word-by-word reveal */}
        <div className="mb-16 max-w-4xl">
          <div className="font-display font-black text-4xl sm:text-5xl lg:text-7xl leading-tight tracking-tight">
            {words.map((word, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 40, clipPath: 'inset(100% 0 0 0)' }}
                animate={inView ? { opacity: 1, y: 0, clipPath: 'inset(0% 0 0 0)' } : {}}
                transition={{ duration: 0.6, delay: i * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
                className={`inline-block mr-4 ${
                  word === 'JUST' || word === 'ANOTHER' ? 'line-through text-brand-muted' :
                  word === 'NOT' ? 'text-brand-primary' : 'text-white'
                }`}
              >
                {word}
              </motion.span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Description */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-px bg-brand-primary" />
              <span className="font-mono text-xs tracking-widest text-brand-primary">ABOUT THE HACKFEST</span>
            </div>
            <p className="text-lg text-brand-muted leading-relaxed mb-6">
              SAKTHI HACKFEST'26 is a national-level, 24-hour engineering sprint hosted by{' '}
              <span className="text-white font-medium">Sree Sakthi Engineering College, Karamadai</span>{' '}
              — designed for those who refuse to build ordinary things.
            </p>
            <p className="text-brand-muted leading-relaxed mb-6">
              Unlike conventional hackathons that celebrate ideas over execution, SAKTHI HACKFEST demands{' '}
              <span className="text-white font-medium">functional, deployable prototypes</span>. Your code will be reviewed by experienced engineers, your architecture scrutinized, and your pitch
              judged by industry leaders.
            </p>
            <p className="text-brand-muted leading-relaxed">
              If you can build under pressure, defend your design decisions, and ship something the world can actually use — you belong on this grid.
            </p>

            <div className="mt-8 flex items-center gap-4">
              <div className="h-px flex-1 bg-brand-border" />
              <span className="font-display font-bold text-xl text-brand-primary tracking-widest">
                {EVENT_CONFIG.dates.displayDate}
              </span>
              <div className="h-px flex-1 bg-brand-border" />
            </div>
          </motion.div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat, i) => {
              const isTeamsCard = stat.label.toLowerCase().includes('team')

              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={inView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
                  className="bg-brand-card border border-brand-border p-6 relative overflow-hidden group hover:border-brand-primary/50 transition-all duration-300"
                >
                  <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-brand-primary to-brand-orange scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                  <div className="font-display font-black text-4xl text-gradient-fire mb-1">
                    {stat.value}
                  </div>
                  <div className="font-mono text-xs text-brand-muted tracking-widest">{stat.label}</div>
                  {stat.sublabel && (
                    <div className="font-mono text-[10px] text-brand-primary tracking-widest mt-1">{stat.sublabel}</div>
                  )}
                  {isTeamsCard && (
                    <div className="font-mono text-[11px] sm:text-xs text-brand-primary font-bold tracking-wider mt-2.5 pt-2 border-t border-brand-border/60 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse shrink-0" />
                      <span>
                        Registered Teams : {registeredTeamsCount !== null ? registeredTeamsCount : '...'}
                      </span>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Horizontal divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-20 h-px bg-gradient-to-r from-transparent via-brand-primary to-transparent origin-center"
        />
      </div>
    </section>
  )
}
