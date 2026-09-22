import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { EVENT_CONFIG } from '../../config/event'

export default function FinalCTA() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} className="relative py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(255,59,48,0.1) 0%, transparent 70%)' }} />
      <div className="bg-cyber-grid-dense absolute inset-0 opacity-70" />

      <div className="max-w-4xl mx-auto relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <div className="inline-flex items-center gap-3 mb-8">
            <div className="w-8 h-px bg-brand-primary" />
            <span className="font-mono text-xs tracking-widest text-brand-primary">LAST CALL</span>
            <div className="w-8 h-px bg-brand-primary" />
          </div>

          <h2 className="font-display font-black text-5xl sm:text-6xl lg:text-8xl leading-none text-white tracking-tight mb-4">
            READY TO BUILD<br />
            <span className="text-gradient-fire">WHAT COMES NEXT?</span>
          </h2>

          <div className="mt-6 mb-12 font-display font-bold text-xl tracking-widest text-brand-muted">
            SAKTHI HACKFEST'26
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Link
              to="/register"
              className="group inline-flex items-center gap-4 bg-brand-primary text-white font-display font-black text-xl tracking-widest px-12 py-6 cyber-cut-corner hover:shadow-glow-red transition-all duration-300"
            >
              REGISTER NOW
              <ArrowRight size={22} className="group-hover:translate-x-2 transition-transform" />
            </Link>
          </motion.div>

          <p className="mt-6 font-mono text-sm text-brand-muted">
            Registration closes {EVENT_CONFIG.dates.registrationDeadline} · {' '}
            <span className="text-white">2 to 4 members · ₹1,000 per team</span>
          </p>
        </motion.div>
      </div>
    </section>
  )
}
