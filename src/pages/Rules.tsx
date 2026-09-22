import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { EVENT_CONFIG } from '../../config/event'

function RuleItem({ rule, index }: { rule: { id: string; category: string; question: string; answer: string }; index: number }) {
  const [open, setOpen] = useState(index === 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="border border-brand-border overflow-hidden"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 sm:p-6 text-left hover:bg-brand-card transition-colors group"
        aria-expanded={open}
      >
        <div className="flex items-center gap-4">
          <span className="font-mono text-xs text-brand-primary w-16 flex-shrink-0">
            {rule.category.toUpperCase()}
          </span>
          <span className="font-medium text-sm sm:text-base text-white">{rule.question}</span>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }}>
          <ChevronDown size={18} className="text-brand-primary flex-shrink-0 ml-4" />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="px-5 sm:px-6 pb-5 sm:pb-6 border-t border-brand-border bg-brand-card">
              <p className="pt-4 text-sm text-brand-muted leading-relaxed">{rule.answer}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

const generalRules = [
  { id: 'g1', category: 'Conduct', question: 'Code of Conduct', answer: 'All participants are expected to maintain respectful and professional conduct throughout the event. Any form of harassment, discrimination, or disruptive behavior will result in immediate disqualification and removal from the event.' },
  { id: 'g2', category: 'Integrity', question: 'Code integrity & IP', answer: 'All code must be written during the hackathon. Pre-existing projects are not permitted. Open-source libraries and APIs may be used but must be declared. Plagiarism or unauthorized use of others\' code will result in disqualification.' },
  { id: 'g3', category: 'Safety', question: 'Venue & Safety Guidelines', answer: 'Participants must follow all campus safety regulations. No open flames, hazardous chemicals, or prohibited materials are permitted. Organizers are not responsible for lost or damaged personal belongings.' },
]

export default function Rules() {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [])

  const categories = Array.from(new Set(EVENT_CONFIG.rules.map(r => r.category)))

  return (
    <main className="pt-24 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-brand-primary" />
            <span className="font-mono text-xs tracking-widest text-brand-primary">PARTICIPATION GUIDELINES</span>
          </div>
          <h1 className="font-display font-black text-5xl sm:text-6xl text-white tracking-tight">
            THE <span className="text-brand-primary">RULES</span>
          </h1>
          <p className="mt-4 text-brand-muted leading-relaxed">
            SAKTHI HACKFEST'26 is a structured competition. Read all rules carefully before registering.
            By submitting your registration, you agree to abide by all guidelines listed here.
          </p>
        </div>

        {/* Official Rules from Config */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-6 h-px bg-brand-primary" />
            <span className="font-mono text-xs tracking-widest text-brand-muted">OFFICIAL RULES</span>
          </div>
          <div className="space-y-2">
            {EVENT_CONFIG.rules.map((rule, i) => (
              <RuleItem key={rule.id} rule={rule} index={i} />
            ))}
          </div>
        </div>

        {/* General conduct rules */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-6 h-px bg-brand-orange" />
            <span className="font-mono text-xs tracking-widest text-brand-muted">GENERAL CONDUCT</span>
          </div>
          <div className="space-y-2">
            {generalRules.map((rule, i) => (
              <RuleItem key={rule.id} rule={rule} index={EVENT_CONFIG.rules.length + i} />
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
