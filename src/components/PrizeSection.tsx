import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Trophy, Star, Award } from 'lucide-react'
import { EVENT_CONFIG } from '../../config/event'

const rankIcons = [Trophy, Star, Award]
const rankColors = [
  { border: 'border-yellow-500/40', bg: 'bg-yellow-500/5', text: 'text-yellow-400', glow: 'shadow-[0_0_25px_-5px_rgba(234,179,8,0.3)]' },
  { border: 'border-slate-400/40', bg: 'bg-slate-400/5', text: 'text-slate-300', glow: '' },
  { border: 'border-amber-700/40', bg: 'bg-amber-700/5', text: 'text-amber-600', glow: '' },
]

export default function PrizeSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="prizes" ref={ref} className="relative py-28 px-4 sm:px-6 lg:px-8 bg-brand-surface overflow-hidden">
      <div className="bg-cyber-grid absolute inset-0 opacity-40" />
      {/* Center glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(255,122,0,0.06) 0%, transparent 70%)' }} />

      <div className="max-w-[1200px] mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="mb-16 text-center"
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-brand-orange" />
            <span className="font-mono text-xs tracking-widest text-brand-orange">WHAT YOU COMPETE FOR</span>
            <div className="w-8 h-px bg-brand-orange" />
          </div>
          <h2 className="font-display font-black text-5xl sm:text-6xl lg:text-7xl text-white tracking-tight mb-4">
            PRIZE <span className="text-brand-orange">POOL</span>
          </h2>
          <div className="font-display text-2xl font-bold text-gradient-fire">
            {EVENT_CONFIG.prizePool.totalDisplay}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch justify-center max-w-[1200px] mx-auto">
          {EVENT_CONFIG.prizePool.prizes.map((prize, i) => {
            const IconEl = rankIcons[i] || Trophy
            const color = rankColors[i] || rankColors[0]
            return (
              <motion.div
                key={prize.rank}
                initial={{ opacity: 0, y: 50 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.12 }}
                className={`relative border ${color.border} ${color.bg} p-7 flex flex-col justify-between gap-5 h-full ${prize.highlight ? color.glow : ''}`}
              >
                {prize.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 font-mono text-[10px] px-3 py-1 bg-yellow-500 text-black tracking-widest font-bold">
                    TOP PRIZE
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <IconEl size={28} className={color.text} />
                  <span className="font-mono text-xs text-brand-muted">{prize.rank}</span>
                </div>

                <div>
                  <div className={`font-display font-black text-3xl sm:text-4xl mb-1 ${color.text}`}>
                    {prize.amount}
                  </div>
                  <div className="font-mono text-xs tracking-widest text-brand-muted">{prize.title}</div>
                </div>

                <ul className="space-y-2 border-t border-white/5 pt-4 mt-auto">
                  {prize.perks.map(perk => (
                    <li key={perk} className="flex items-start gap-2">
                      <div className={`w-1 h-1 rounded-full mt-2 flex-shrink-0 ${color.text}`} />
                      <span className="text-xs text-brand-muted leading-relaxed">{perk}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
