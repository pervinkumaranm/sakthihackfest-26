import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Shield } from 'lucide-react'

const navLinks = [
  { label: 'EVENT', href: '/#event' },
  { label: 'CHALLENGE', href: '/#challenge' },
  { label: 'TIMELINE', href: '/#timeline' },
  { label: 'RULES', href: '/rules' },
  { label: 'FAQ', href: '/faq' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const handleHashLink = (href: string) => {
    setMobileOpen(false)
    if (href.startsWith('/#')) {
      const hash = href.slice(1)
      if (location.pathname === '/') {
        document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' })
      } else {
        navigate('/')
        setTimeout(() => {
          document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' })
        }, 400)
      }
    } else {
      navigate(href)
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
    }
  }

  return (
    <>
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'bg-brand-bg/85 backdrop-blur-xl border-b border-brand-border'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo & Brand Title */}
            <Link to="/" className="flex items-center gap-3.5 group py-1">
              <img
                src="/college-banner.jpg"
                alt="Sree Sakthi Engineering College"
                className="h-9 sm:h-11 w-auto object-contain rounded transition-transform duration-200 group-hover:scale-105"
              />
              <div className="hidden sm:block border-l border-brand-border/80 pl-3.5">
                <span className="font-display font-black text-sm sm:text-base md:text-lg tracking-wider text-[#FF9500] group-hover:text-brand-primary transition-colors block leading-tight">
                  SAKTHI HACKFEST'26
                </span>
                <span className="font-mono text-[9px] sm:text-[10px] text-brand-muted tracking-[0.2em] block mt-0.5">
                  BUILD. BREAK. INNOVATE.
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-7">
              {navLinks.map(link =>
                link.href.startsWith('/#') ? (
                  <button
                    key={link.label}
                    onClick={() => handleHashLink(link.href)}
                    className="font-mono text-xs tracking-widest transition-colors duration-200 relative group text-brand-muted hover:text-white"
                  >
                    {link.label}
                    <span className="absolute -bottom-1 left-0 w-0 h-px bg-[#FF3B30] group-hover:w-full transition-all duration-300" />
                  </button>
                ) : (
                  <Link
                    key={link.label}
                    to={link.href}
                    onClick={() => {
                      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
                      document.documentElement.scrollTop = 0
                      document.body.scrollTop = 0
                    }}
                    className="font-mono text-xs tracking-widest transition-colors duration-200 relative group text-brand-muted hover:text-white"
                  >
                    {link.label}
                    <span className="absolute -bottom-1 left-0 w-0 h-px bg-[#FF3B30] group-hover:w-full transition-all duration-300" />
                  </Link>
                )
              )}
            </div>

            {/* CTA + Hamburger */}
            <div className="flex items-center gap-2.5">
              <Link
                to="/register"
                className="hidden sm:flex items-center gap-2 bg-[#FF3B30] hover:bg-[#ff4f44] text-white font-display font-extrabold text-xs tracking-[0.15em] px-5 py-2.5 rounded-lg shadow-[0_0_20px_rgba(255,59,48,0.4)] transition-all duration-200 uppercase"
              >
                REGISTER NOW
              </Link>

              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 text-brand-muted hover:text-white transition-colors"
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileOpen}
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed inset-0 z-30 bg-brand-bg/95 backdrop-blur-xl flex flex-col pt-20 px-8"
          >
            <div className="flex flex-col gap-2 mt-4">
              {navLinks.map((link, i) =>
                link.href.startsWith('/#') ? (
                  <motion.button
                    key={link.label}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}
                    onClick={() => handleHashLink(link.href)}
                    className="text-left py-4 border-b border-brand-border font-display text-2xl font-bold text-brand-muted hover:text-white transition-colors"
                  >
                    {link.label}
                  </motion.button>
                ) : (
                  <motion.div
                    key={link.label}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}
                  >
                    <Link
                      to={link.href}
                      onClick={() => {
                        setMobileOpen(false)
                        window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
                        document.documentElement.scrollTop = 0
                        document.body.scrollTop = 0
                      }}
                      className="block text-left py-4 border-b border-brand-border font-display text-2xl font-bold text-brand-muted hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                )
              )}
            </div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="mt-8"
            >
              <Link
                to="/register"
                onClick={() => setMobileOpen(false)}
                className="block w-full text-center bg-brand-primary text-white font-display font-bold text-lg tracking-widest py-4 cyber-cut-corner"
              >
                REGISTER NOW →
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
