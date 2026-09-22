import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, ChevronDown, Shield } from 'lucide-react'
import EventCountdown from './EventCountdown'

export default function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', e => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    })

    // Ambient floating particles & red dots
    const particles: { x: number; y: number; vx: number; vy: number; radius: number; alpha: number; pulse: number }[] = []
    for (let i = 0; i < 45; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        radius: Math.random() * 2.2 + 1.2,
        alpha: Math.random() * 0.45 + 0.15,
        pulse: Math.random() * Math.PI,
      })
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Cyber Grid
      ctx.strokeStyle = 'rgba(255, 59, 48, 0.045)'
      ctx.lineWidth = 1
      const step = 64
      for (let x = 0; x < canvas.width; x += step) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke()
      }
      for (let y = 0; y < canvas.height; y += step) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke()
      }

      // Red particles
      particles.forEach(p => {
        p.x += p.vx
        p.y += p.vy
        p.pulse += 0.02
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0

        const currentAlpha = p.alpha + Math.sin(p.pulse) * 0.12
        ctx.fillStyle = `rgba(255, 59, 48, ${Math.max(0.08, currentAlpha)})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fill()
      })

      animId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <section id="hero" className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-16 pb-16">
      {/* Background canvas for grid and ambient particle dots */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* Radial center glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 55% at 50% 45%, rgba(255,59,48,0.08) 0%, rgba(5,5,5,0) 75%)'
        }}
      />

      {/* ========================================================================= */}
      {/* AMBIENT HUD / CYBER GRAPHICS (Exact match to user reference image) */}
      {/* ========================================================================= */}
      {/* Left side: 0101 & BUILD */}
      <div className="hidden md:block absolute left-8 lg:left-14 top-1/3 font-mono text-[11px] text-[#FF3B30]/40 tracking-[0.3em] select-none pointer-events-none">
        0101
      </div>
      <div className="hidden md:block absolute left-10 lg:left-16 top-1/2 font-mono text-xs text-[#FF3B30]/35 tracking-[0.25em] select-none pointer-events-none">
        BUILD
      </div>

      {/* Bottom Left HUD box: IDEAS / PEOPLE / IMPACT */}
      <div className="hidden lg:block absolute left-10 bottom-10 p-3 border-l-2 border-b-2 border-[#FF3B30]/40 font-mono text-[10px] text-brand-muted/70 leading-relaxed tracking-wider select-none pointer-events-none">
        <div>IDEAS</div>
        <div>PEOPLE</div>
        <div>IMPACT</div>
      </div>

      {/* Right side: </>, INNOVATE, { } */}
      <div className="hidden md:block absolute right-8 lg:right-16 top-1/4 font-mono text-sm text-[#FF3B30]/45 tracking-widest select-none pointer-events-none">
        &lt;/&gt;
      </div>
      <div className="hidden md:block absolute right-10 lg:right-16 top-1/2 font-mono text-xs text-[#FF3B30]/35 tracking-[0.25em] select-none pointer-events-none">
        INNOVATE
      </div>
      <div className="hidden md:block absolute right-10 lg:right-20 top-2/3 font-mono text-sm text-[#FF3B30]/40 select-none pointer-events-none">
        &#123; &#125;
      </div>

      {/* Bottom Right HUD box: OCT 10-11, 2026 */}
      <div className="hidden lg:block absolute right-10 bottom-10 p-3 border-r-2 border-b-2 border-[#FF3B30]/40 font-mono text-[10px] text-brand-muted/70 tracking-wider text-right select-none pointer-events-none">
        <div>OCT 10–11,</div>
        <div className="flex items-center justify-end gap-1.5 mt-0.5">
          <span>2026</span>
          <span className="text-[#FF3B30]">—</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MAIN HERO CONTENT */}
      {/* ========================================================================= */}
      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full flex flex-col items-center">
        
        {/* SAKTHI HACKFEST 2K26 TITLE WITH RED HUD CORNER BRACKETS */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          className="relative px-6 sm:px-14 py-4 sm:py-6 my-2 inline-block select-none"
        >
          {/* Corner Crosshair HUD Brackets */}
          <div className="absolute top-0 left-0 w-5 h-5 sm:w-7 sm:h-7 border-t-2 border-l-2 border-[#FF3B30]" />
          <div className="absolute top-0 right-0 w-5 h-5 sm:w-7 sm:h-7 border-t-2 border-r-2 border-[#FF3B30]" />
          <div className="absolute bottom-0 left-0 w-5 h-5 sm:w-7 sm:h-7 border-b-2 border-l-2 border-[#FF3B30]" />
          <div className="absolute bottom-0 right-0 w-5 h-5 sm:w-7 sm:h-7 border-b-2 border-r-2 border-[#FF3B30]" />

          {/* Three Stacked Heavy Futuristic Lines */}
          <h1 className="font-display font-black leading-[0.94] tracking-tight text-center">
            {/* SAKTHI (Crisp White) */}
            <span className="block text-4xl sm:text-6xl md:text-7xl lg:text-[5.5rem] xl:text-[6.6rem] text-white tracking-[0.02em] drop-shadow-[0_2px_14px_rgba(255,255,255,0.15)]">
              SAKTHI
            </span>
            {/* HACKFEST (Neon Red) */}
            <span className="block text-4xl sm:text-6xl md:text-7xl lg:text-[5.5rem] xl:text-[6.6rem] text-[#FF3B30] tracking-[0.01em] drop-shadow-[0_0_28px_rgba(255,59,48,0.5)] mt-0.5 sm:mt-1">
              HACKFEST
            </span>
            {/* '26 (Vibrant Orange/Amber) */}
            <span className="block text-4xl sm:text-6xl md:text-7xl lg:text-[5.5rem] xl:text-[6.6rem] text-[#FF9500] tracking-[0.04em] drop-shadow-[0_0_28px_rgba(255,149,0,0.45)] mt-0.5 sm:mt-1">
              '26
            </span>
          </h1>
        </motion.div>

        {/* LIVE COUNTDOWN TIMER (Centered below 2K26 with red glowing border cards) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full flex justify-center"
        >
          <EventCountdown />
        </motion.div>

        {/* TAGLINE: BUILD. BREAK. INNOVATE. */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="font-display text-sm sm:text-lg font-bold tracking-[0.25em] text-center my-4 select-none"
        >
          <span className="text-white">BUILD. </span>
          <span className="text-white">BREAK. </span>
          <span className="text-[#FF3B30]">INNOVATE.</span>
        </motion.div>

        {/* CTA BUTTONS: REGISTER NOW & EXPLORE HACKFEST */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-col items-center gap-3 mt-2 mb-8 w-full max-w-xs sm:max-w-sm"
        >
          {/* Primary Button: Red cyber-cut pill */}
          <Link
            to="/register"
            className="w-full group flex items-center justify-center gap-2.5 bg-[#FF3B30] hover:bg-[#ff4f44] text-white font-display font-extrabold text-xs sm:text-sm tracking-[0.2em] py-4 px-8 rounded-lg shadow-[0_0_28px_rgba(255,59,48,0.45)] hover:shadow-[0_0_36px_rgba(255,59,48,0.65)] transition-all duration-200 uppercase hover:scale-[1.02]"
          >
            REGISTER NOW <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
          </Link>

          {/* Secondary Button: Outlined box */}
          <button
            onClick={() => document.getElementById('event')?.scrollIntoView({ behavior: 'smooth' })}
            className="w-full flex items-center justify-center gap-2 border border-brand-border/90 bg-[#0A0A0E]/80 hover:bg-[#14141A] hover:border-brand-border text-brand-muted hover:text-white font-mono text-[11px] sm:text-xs tracking-[0.2em] py-3 px-6 rounded-lg transition-all duration-200 uppercase"
          >
            EXPLORE HACKFEST <ChevronDown size={14} className="text-[#FF3B30]" />
          </button>

        </motion.div>

        {/* BOTTOM SCROLL INDICATOR */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="flex flex-col items-center gap-1.5 pt-2 select-none cursor-pointer"
          onClick={() => document.getElementById('event')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <span className="font-mono text-[9px] tracking-[0.25em] text-brand-muted uppercase">
            SCROLL TO EXPLORE
          </span>
          {/* Mouse Icon with animated wheel */}
          <div className="w-5 h-8 rounded-full border-2 border-brand-muted/50 flex items-start justify-center p-1">
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
              className="w-1 h-1.5 bg-[#FF3B30] rounded-full"
            />
          </div>
          <ChevronDown size={14} className="text-brand-muted/70 -mt-0.5 animate-bounce" />
        </motion.div>

      </div>
    </section>
  )
}
