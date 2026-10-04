import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { CheckCircle2, Circle, Clock, MapPin, Lock } from 'lucide-react'
import { EVENT_CONFIG, IS_REGISTRATION_CLOSED } from '../../config/event'

export default function Timeline() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="timeline" ref={ref} className="relative py-28 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-brand-primary" />
            <span className="font-mono text-xs tracking-widest text-brand-primary">EVENT SCHEDULE</span>
          </div>
          <h2 className="font-display font-black text-5xl sm:text-6xl lg:text-7xl text-white tracking-tight">
            TIME<span className="text-brand-primary">LINE</span>
          </h2>
        </motion.div>

        {/* Vertical timeline */}
        <div className="relative">
          {/* Center line */}
          <motion.div
            initial={{ scaleY: 0 }}
            animate={inView ? { scaleY: 1 } : {}}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="absolute left-6 sm:left-8 top-0 bottom-0 w-px bg-gradient-to-b from-brand-primary via-brand-border to-transparent origin-top"
          />

          <div className="space-y-3">
            {EVENT_CONFIG.timeline.map((item, i) => {
              // Target STRICTLY the Registration Closes card (t2) only; leave Registration Opening (t1) completely untouched
              const isRegistrationCloseCard = item.id === 't2' || item.stage.toUpperCase().includes('REGISTRATION CLOSE')
              const isRegClosed = isRegistrationCloseCard && IS_REGISTRATION_CLOSED

              const isCompleted = item.status === 'completed' || isRegClosed
              const isActive = item.status === 'active' && !isRegClosed
              const isReporting = item.stage === 'REPORTING'
              const IconEl = isRegClosed ? Lock : isCompleted ? CheckCircle2 : isActive ? Clock : isReporting ? MapPin : Circle

              const displayStage = isRegClosed ? 'REGISTRATION CLOSED' : item.stage
              const displayDate = isRegClosed ? (
                <span className="text-red-400 font-bold">
                  REGISTRATION CLOSED <span className="text-brand-muted font-normal">· CAPACITY REACHED</span>
                </span>
              ) : (
                <>
                  {item.date} <span className="text-brand-muted">· {item.time}</span>
                </>
              )
              const displayDescription = isRegClosed
                ? 'Registrations are officially closed as all 75 team slots have been filled.'
                : item.description

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -30 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="relative pl-16 sm:pl-20"
                >
                  {/* Icon node */}
                  <div className={`absolute left-0 sm:left-0 top-4 flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-none border ${
                    isRegClosed
                      ? 'border-red-500/50 bg-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                      : isCompleted
                      ? 'border-green-500/50 bg-green-500/10'
                      : isActive
                      ? 'border-brand-primary bg-brand-primary/15 shadow-glow-red'
                      : isReporting
                      ? 'border-brand-primary/40 bg-brand-surface'
                      : 'border-brand-border bg-brand-surface'
                  }`}>
                    <IconEl
                      size={20}
                      className={isRegClosed ? 'text-red-400' : isCompleted ? 'text-green-500' : isActive ? 'text-brand-primary' : isReporting ? 'text-brand-primary' : 'text-brand-mutedDark'}
                    />
                  </div>

                  {/* Content */}
                  <div className={`p-5 border transition-all duration-300 ${
                    isRegClosed
                      ? 'border-red-500/40 bg-red-500/5'
                      : isActive
                      ? 'border-brand-primary/50 bg-brand-primary/5'
                      : isCompleted
                      ? 'border-brand-border bg-brand-surface/50 opacity-70'
                      : 'border-brand-border bg-brand-card'
                  }`}>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        {isRegClosed && (
                          <span className="font-mono text-[10px] px-2 py-0.5 bg-red-500/20 text-red-400 border border-red-500/40 tracking-widest font-bold">CLOSED</span>
                        )}
                        {!isRegClosed && isActive && (
                          <span className="font-mono text-[10px] px-2 py-0.5 bg-brand-primary text-white tracking-widest font-bold">ACTIVE</span>
                        )}
                        <h3 className="font-display font-bold text-sm sm:text-base text-white tracking-wide">
                          {displayStage}
                        </h3>
                      </div>
                      <div className="font-mono text-xs text-brand-primary">
                        {displayDate}
                      </div>
                    </div>
                    <p className="text-brand-muted text-sm leading-relaxed">{displayDescription}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
