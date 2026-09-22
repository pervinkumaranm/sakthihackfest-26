import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { EVENT_CONFIG } from '../../config/event'

export default function ChallengeCards() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const [activeCard, setActiveCard] = useState<string | null>(null)

  const challenges = EVENT_CONFIG.challenges

  return (
    <section id="challenge" ref={ref} className="relative py-24 sm:py-28 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-14 sm:mb-16"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-brand-primary" />
            <span className="font-mono text-xs tracking-widest text-brand-primary">THE CHALLENGE GRID</span>
          </div>
          <h2 className="font-display font-black text-5xl sm:text-6xl lg:text-7xl text-white tracking-tight">
            THE<br /><span className="text-brand-primary">CHALLENGE</span>
          </h2>
        </motion.div>

        {/* Challenge Cards — Exactly 2 equal-height cards on desktop, stacked on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
          {challenges.map((challenge, i) => {
            const isActive = activeCard === challenge.id

            return (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, y: 40 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                onHoverStart={() => setActiveCard(challenge.id)}
                onHoverEnd={() => setActiveCard(null)}
                className={`relative bg-brand-card border border-brand-border p-6 sm:p-8 lg:p-10 cursor-default overflow-hidden group transition-all duration-300 flex flex-col justify-between h-full rounded-xl ${
                  isActive
                    ? 'border-brand-primary/60 shadow-glow-red -translate-y-1'
                    : 'hover:border-brand-primary/40 hover:-translate-y-1'
                }`}
              >
                {/* Animated gradient overlay on hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br from-brand-primary/5 to-brand-orange/5 transition-opacity duration-300 pointer-events-none ${
                    isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}
                />

                {/* Top accent line */}
                <div
                  className={`absolute top-0 left-0 h-0.5 w-full bg-gradient-to-r from-brand-primary to-brand-orange transition-transform duration-500 origin-left ${
                    isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                  }`}
                />

                {/* Main Card Content */}
                <div className="relative z-10 flex-1 flex flex-col">
                  {/* Card Number */}
                  <motion.div
                    animate={isActive ? { y: -4, scale: 1.05 } : { y: 0, scale: 1 }}
                    transition={{ duration: 0.25 }}
                    className="font-display font-black text-6xl sm:text-7xl text-brand-primary/15 leading-none mb-3 select-none"
                  >
                    {challenge.number}
                  </motion.div>

                  {/* Category / Stage Label */}
                  <div className="font-mono text-xs tracking-widest text-brand-primary font-bold mb-2 uppercase">
                    {challenge.label}
                  </div>

                  {/* Title */}
                  <h3 className="font-display font-black text-2xl sm:text-3xl text-white mb-4 tracking-tight leading-snug">
                    {challenge.title}
                  </h3>

                  {/* Primary Description */}
                  <p className="text-brand-muted text-sm sm:text-base leading-relaxed mb-3 font-sans">
                    {challenge.description}
                  </p>

                  {/* Optional Secondary Description */}
                  {challenge.secondaryDescription && (
                    <p className="text-brand-muted text-sm sm:text-base leading-relaxed mb-4 font-sans">
                      {challenge.secondaryDescription}
                    </p>
                  )}

                  {/* Bullet Points */}
                  <div className="space-y-2.5 my-5">
                    {challenge.bullets.map((bullet, idx) => (
                      <div key={idx} className="flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-orange mt-2 flex-shrink-0" />
                        <span className="text-xs sm:text-sm text-gray-300 font-mono leading-normal">
                          {bullet}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Bottom Highlight / Final Statement */}
                  <div className="mt-auto pt-6 border-t border-brand-border/40">
                    {challenge.number === '01' ? (
                      <span className="inline-flex items-center font-mono text-[11px] sm:text-xs font-bold tracking-widest px-3 py-1.5 bg-brand-primary/10 border border-brand-primary/30 text-brand-primary rounded">
                        {challenge.highlight}
                      </span>
                    ) : (
                      <div className="font-display font-black text-sm sm:text-base tracking-wider text-white uppercase leading-snug">
                        THE BEST BUILDERS DON'T JUST BUILD.
                        <span className="block text-brand-orange mt-0.5">THEY ADAPT.</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
