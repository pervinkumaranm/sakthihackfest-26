import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Cpu, Users, Code2, Trophy } from 'lucide-react'
import { EVENT_CONFIG } from '../../config/event'

const iconMap: Record<string, React.ElementType> = { Cpu, Users, Code2, Trophy }

export default function WhyParticipate() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} className="relative py-28 px-4 sm:px-6 lg:px-8 bg-brand-surface">
      <div className="bg-cyber-grid-dense absolute inset-0 opacity-60" />
      <div className="max-w-7xl mx-auto relative z-10">

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-brand-primary" />
            <span className="font-mono text-xs tracking-widest text-brand-primary">WHAT YOU GAIN</span>
            <div className="w-8 h-px bg-brand-primary" />
          </div>
          <h2 className="font-display font-black text-5xl sm:text-6xl lg:text-7xl text-white tracking-tight">
            WHY<br /><span className="text-brand-orange">PARTICIPATE</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {EVENT_CONFIG.pillars.map((pillar, i) => {
            const Icon = iconMap[pillar.icon] || Cpu
            return (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 40 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.12 }}
                className="group relative bg-brand-bg border border-brand-border p-8 overflow-hidden hover:border-brand-primary/40 transition-all duration-300"
              >
                <div className="absolute top-0 left-0 w-0.5 h-0 bg-gradient-to-b from-brand-primary to-brand-orange group-hover:h-full transition-all duration-500" />

                <div className="flex items-start gap-5">
                  <div className="p-3 border border-brand-border bg-brand-surface group-hover:border-brand-primary/50 group-hover:bg-brand-primary/5 transition-all duration-300 flex-shrink-0">
                    <Icon size={24} className="text-brand-primary" />
                  </div>
                  <div>
                    <div className="font-mono text-xs tracking-widest text-brand-primary mb-1">{pillar.subtitle}</div>
                    <h3 className="font-display font-bold text-xl text-white mb-3 tracking-tight">{pillar.title}</h3>
                    <p className="text-brand-muted text-sm leading-relaxed">{pillar.description}</p>
                  </div>
                </div>

                <div className="absolute bottom-0 right-0 font-display font-black text-8xl text-white/[0.03] leading-none select-none">
                  {String(i + 1).padStart(2, '0')}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
