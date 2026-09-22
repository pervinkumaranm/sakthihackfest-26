import { Link } from 'react-router-dom'
import { Globe, Mail, Phone, MapPin } from 'lucide-react'
import { InstagramIcon } from './SocialIcons'
import { EVENT_CONFIG } from '../../config/event'

export default function Footer() {
  const year = 2026

  return (
    <footer className="bg-brand-surface border-t border-brand-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        {/* 3-Column Desktop Grid / Vertically Stacked Mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 mb-12">
          {/* COLUMN 1: College + Hackfest Branding, Description & Socials */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <div className="mb-4">
                <img
                  src="/college-banner.jpg"
                  alt="Sree Sakthi Engineering College"
                  className="h-10 sm:h-12 w-auto object-contain rounded mb-3"
                />
                <div>
                  <div className="font-mono text-[10px] text-brand-muted tracking-widest uppercase mb-1">
                    SREE SAKTHI ENGINEERING COLLEGE
                  </div>
                  <div className="font-display font-black text-xl tracking-widest text-white">
                    SAKTHI<span className="text-brand-primary"> HACKFEST</span>
                    <span className="text-brand-orange"> '26</span>
                  </div>
                  <div className="font-mono text-xs text-brand-muted tracking-widest mt-0.5">
                    BUILD. BREAK. INNOVATE.
                  </div>
                </div>
              </div>

              <p className="text-brand-muted text-sm leading-relaxed max-w-sm">
                National-level 24-hour hackathon empowering engineering innovators to build real-world solutions, break conventions, and architect the next era of technology.
              </p>
            </div>

            {/* Social Media: Only Instagram and Website */}
            <div className="flex items-center gap-3 mt-6">
              <a
                href={EVENT_CONFIG.socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 border border-brand-border hover:border-brand-primary text-brand-muted hover:text-brand-primary transition-all rounded bg-brand-bg/50"
                aria-label="Instagram"
              >
                <InstagramIcon size={18} />
              </a>
              <a
                href={EVENT_CONFIG.socialLinks.website}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 border border-brand-border hover:border-brand-primary text-brand-muted hover:text-brand-primary transition-all rounded bg-brand-bg/50"
                aria-label="Website"
              >
                <Globe size={18} />
              </a>
            </div>
          </div>

          {/* COLUMN 2: NAVIGATE */}
          <div className="lg:col-span-3">
            <h3 className="font-mono text-xs tracking-widest text-brand-muted mb-4 uppercase">
              NAVIGATE
            </h3>
            <ul className="space-y-3">
              {[
                { label: 'Home', href: '/' },
                { label: 'Register', href: '/register' },
                { label: 'Rules', href: '/rules' },
                { label: 'FAQ', href: '/faq' },
                { label: 'Contact', href: '/contact' },
              ].map(link => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-brand-muted hover:text-white transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span className="w-3 h-px bg-brand-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 3: REACH US & STUDENT COORDINATORS */}
          <div className="lg:col-span-4">
            <h3 className="font-mono text-xs tracking-widest text-brand-muted mb-4 uppercase">
              REACH US
            </h3>

            <div className="space-y-3 text-sm text-brand-muted">
              {/* Address */}
              <div className="flex gap-3">
                <MapPin size={16} className="text-brand-primary flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed text-xs sm:text-sm">
                  {EVENT_CONFIG.college.address}
                </span>
              </div>

              {/* Email */}
              <div className="pt-1">
                <a
                  href="mailto:sakthihackfest@gmail.com"
                  aria-label="Email SAKTHI HACKFEST"
                  className="flex items-center gap-3 text-xs sm:text-sm hover:text-white transition-colors group"
                >
                  <Mail size={16} className="text-brand-primary flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="break-all sm:break-normal">sakthihackfest@gmail.com</span>
                </a>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-brand-border/60 my-5" />

            {/* Student Coordinators */}
            <div>
              <h4 className="font-mono text-[11px] tracking-widest text-brand-muted uppercase mb-3">
                STUDENT COORDINATORS
              </h4>
              <div className="space-y-3 font-mono">
                <div>
                  <div className="text-white text-xs font-semibold tracking-wide">
                    Jeevanandh
                  </div>
                  <a
                    href="tel:6381206466"
                    aria-label="Call Jeevanandh"
                    className="inline-flex items-center gap-2 text-brand-muted hover:text-brand-primary transition-colors text-xs mt-1 group"
                  >
                    <Phone size={13} className="text-brand-primary flex-shrink-0 group-hover:rotate-12 transition-transform" />
                    <span>63812 06466</span>
                  </a>
                </div>

                <div>
                  <div className="text-white text-xs font-semibold tracking-wide">
                    Harini
                  </div>
                  <a
                    href="tel:7418112402"
                    aria-label="Call Harini"
                    className="inline-flex items-center gap-2 text-brand-muted hover:text-brand-primary transition-colors text-xs mt-1 group"
                  >
                    <Phone size={13} className="text-brand-primary flex-shrink-0 group-hover:rotate-12 transition-transform" />
                    <span>74181 12402</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-brand-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-brand-mutedDark font-mono text-center sm:text-left">
          <span>© {year} SAKTHI HACKFEST '26 · Sree Sakthi Engineering College</span>
          <span className="text-brand-primary tracking-widest font-bold">BUILD. BREAK. INNOVATE.</span>
        </div>
      </div>
    </footer>
  )
}
