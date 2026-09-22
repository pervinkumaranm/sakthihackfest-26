import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Globe, ExternalLink } from 'lucide-react'
import { InstagramIcon, LinkedinIcon } from '../components/SocialIcons'
import { EVENT_CONFIG } from '../../config/event'

export default function Contact() {
  return (
    <main className="pt-24 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-brand-primary" />
            <span className="font-mono text-xs tracking-widest text-brand-primary">GET IN TOUCH</span>
          </div>
          <h1 className="font-display font-black text-5xl sm:text-6xl text-white tracking-tight">
            CONTACT<span className="text-brand-primary"> US</span>
          </h1>
          <p className="mt-4 text-brand-muted">Have questions? Our team is ready to help.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Primary Contact */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-5"
          >
            <div className="p-6 border border-brand-border bg-brand-card space-y-4">
              <h2 className="font-display font-bold text-lg text-white mb-4">PRIMARY CONTACT</h2>
              <a href={`mailto:${EVENT_CONFIG.contact.email}`}
                className="flex items-center gap-4 text-brand-muted hover:text-white transition-colors group">
                <div className="p-2 border border-brand-border group-hover:border-brand-primary transition-colors">
                  <Mail size={18} className="text-brand-primary" />
                </div>
                <div>
                  <div className="font-mono text-xs text-brand-muted mb-0.5">EMAIL</div>
                  <div className="text-sm">{EVENT_CONFIG.contact.email}</div>
                </div>
              </a>
              <a href={`tel:${EVENT_CONFIG.contact.phone}`}
                className="flex items-center gap-4 text-brand-muted hover:text-white transition-colors group">
                <div className="p-2 border border-brand-border group-hover:border-brand-primary transition-colors">
                  <Phone size={18} className="text-brand-primary" />
                </div>
                <div>
                  <div className="font-mono text-xs text-brand-muted mb-0.5">PHONE</div>
                  <div className="text-sm">{EVENT_CONFIG.contact.phone}</div>
                </div>
              </a>
              <div className="flex items-start gap-4">
                <div className="p-2 border border-brand-border">
                  <MapPin size={18} className="text-brand-primary" />
                </div>
                <div>
                  <div className="font-mono text-xs text-brand-muted mb-0.5">VENUE</div>
                  <div className="text-sm text-brand-muted leading-relaxed">{EVENT_CONFIG.college.address}</div>
                  <a href={EVENT_CONFIG.college.mapUrl} target="_blank" rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-brand-primary text-xs hover:underline">
                    Open in Maps <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="p-6 border border-brand-border bg-brand-card">
              <h2 className="font-display font-bold text-lg text-white mb-4">SOCIAL CHANNELS</h2>
              <div className="flex flex-wrap gap-3">
                {[
                  { label: 'Instagram', icon: InstagramIcon, href: EVENT_CONFIG.socialLinks.instagram },
                  { label: 'LinkedIn', icon: LinkedinIcon, href: EVENT_CONFIG.socialLinks.linkedin },
                  { label: 'Website', icon: Globe, href: EVENT_CONFIG.socialLinks.website },
                ].map(({ label, icon: Icon, href }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 border border-brand-border hover:border-brand-primary hover:text-brand-primary transition-all font-mono text-xs tracking-wider">
                    <Icon size={16} />
                    {label}
                  </a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Coordinators */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-5"
          >
            <div className="p-6 border border-brand-border bg-brand-card">
              <h2 className="font-display font-bold text-lg text-white mb-5">STUDENT COORDINATORS</h2>
              <div className="space-y-4">
                {EVENT_CONFIG.contact.studentCoordinators.map((coord, i) => (
                  <div key={i} className="flex items-start justify-between border-b border-brand-border pb-4 last:border-0 last:pb-0">
                    <div>
                      <div className="text-white text-sm font-medium">{coord.name}</div>
                      <div className="font-mono text-xs text-brand-muted mt-0.5">{coord.role}</div>
                    </div>
                    <a href={`tel:${coord.phone}`} className="text-brand-primary text-sm hover:underline font-mono">{coord.phone}</a>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 border border-brand-border bg-brand-card">
              <h2 className="font-display font-bold text-lg text-white mb-5">FACULTY COORDINATORS</h2>
              <div className="space-y-4">
                {EVENT_CONFIG.contact.facultyCoordinators.map((coord, i) => (
                  <div key={i} className="flex items-start justify-between border-b border-brand-border pb-4 last:border-0 last:pb-0">
                    <div>
                      <div className="text-white text-sm font-medium">{coord.name}</div>
                      <div className="font-mono text-xs text-brand-muted mt-0.5">{coord.department}</div>
                    </div>
                    <a href={`tel:${coord.phone}`} className="text-brand-primary text-sm hover:underline font-mono">{coord.phone}</a>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 border border-brand-primary/30 bg-brand-primary/5">
              <p className="font-mono text-xs text-brand-muted leading-relaxed">
                For urgent event queries, WhatsApp or call the student coordinators directly.
                Email responses may take 24–48 hours.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  )
}
