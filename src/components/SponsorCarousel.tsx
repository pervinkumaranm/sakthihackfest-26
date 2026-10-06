import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Sparkles } from 'lucide-react'

// Sponsor logos in exact sequential order: Logo-1 to Logo-5 with extra bold prominence
const SPONSOR_LOGOS = [
  {
    id: 1,
    name: 'Amypo',
    src: '/logos/Logo-1.png',
    sizeClass: 'h-36 sm:h-48 md:h-60 lg:h-64 max-w-[320px] sm:max-w-[420px] md:max-w-[500px]',
  },
  {
    id: 2,
    name: 'QuantumNique Solutions',
    src: '/logos/Logo-2.png',
    sizeClass: 'h-16 sm:h-22 md:h-28 lg:h-32 max-w-[260px] sm:max-w-[360px] md:max-w-[440px]',
  },
  {
    id: 3,
    name: 'Industrial Partner',
    src: '/logos/Logo-3.png',
    // Logo-3 updated with extra size compensation for wide aspect ratio and canvas padding
    sizeClass: 'h-48 sm:h-64 md:h-80 lg:h-[350px] max-w-[380px] sm:max-w-[520px] md:max-w-[620px]',
  },
  {
    id: 4,
    name: 'healthytainment',
    src: '/logos/Logo-4.png',
    sizeClass: 'h-32 sm:h-44 md:h-56 lg:h-60 max-w-[320px] sm:max-w-[440px] md:max-w-[520px]',
  },
  {
    id: 5,
    name: 'SKY-ONE INSTITUTE',
    src: '/logos/Logo-5.png',
    sizeClass: 'h-24 sm:h-32 md:h-40 lg:h-44 max-w-[220px] sm:max-w-[300px] md:max-w-[360px]',
  },
]

export default function SponsorCarousel() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  // Duplicate items 4 times to ensure seamless infinite looping on all screen sizes
  const marqueeItems = [
    ...SPONSOR_LOGOS,
    ...SPONSOR_LOGOS,
    ...SPONSOR_LOGOS,
    ...SPONSOR_LOGOS,
  ]

  return (
    <section
      id="sponsors"
      ref={ref}
      className="relative py-12 sm:py-14 px-4 sm:px-6 lg:px-8 bg-brand-bg overflow-hidden border-t border-brand-border/40"
    >
      <div className="max-w-5xl mx-auto text-center mb-6 sm:mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-mono tracking-widest uppercase">
            <Sparkles size={13} />
            <span>Event Sponsors & Partners</span>
          </div>
          <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight">
            IN ASSOCIATION <span className="text-brand-primary">WITH</span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-brand-muted max-w-xl mx-auto">
            Empowering innovation, talent, and real-world technology solutions at Sakthi HackFest'26.
          </p>
        </motion.div>
      </div>

      {/* Marquee Track Container with subtle fade edges */}
      <div className="relative w-full overflow-hidden py-4 sm:py-6">
        {/* Left & Right Edge Gradients for smooth fading into dark theme */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-20 sm:w-36 bg-gradient-to-r from-brand-bg to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-20 sm:w-36 bg-gradient-to-l from-brand-bg to-transparent z-10" />

        <div className="animate-marquee flex items-center gap-16 sm:gap-24 md:gap-32">
          {marqueeItems.map((logo, index) => (
            <div
              key={`${logo.id}-${index}`}
              className="flex-shrink-0 flex items-center justify-center transition-all duration-300 hover:scale-105 group"
            >
              <img
                src={logo.src}
                alt={logo.name}
                loading="lazy"
                className={`${logo.sizeClass} w-auto object-contain drop-shadow-[0_2px_12px_rgba(255,255,255,0.06)] opacity-90 group-hover:opacity-100 transition-all duration-300 select-none`}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
