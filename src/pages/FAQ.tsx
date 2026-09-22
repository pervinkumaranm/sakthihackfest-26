import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

const faqData = [
  {
    q: 'Is participation free?',
    a: "No, SAKTHI HACKFEST'26 is paid to participate. The registration fees is 1000 per team. Meals and accommodation for outstation participants are provided."
  },
  {
    q: 'Can teams be from different colleges?',
    a: 'Absolutely. Cross-college and inter-disciplinary teams are not just allowed — they are actively encouraged. We believe diversity of thought drives better innovation.'
  },
  {
    q: 'Do I need to have a project idea before registering?',
    a: 'No. You can register with a broad area of interest and finalize your specific project idea during the event. However, having initial thoughts on a problem statement will give you a head start.'
  },
  {
    q: 'What happens after registration?',
    a: 'You will receive a Registration ID and a digital participant pass. Our team will verify your registration within 48 hours. Closer to the event, we will share detailed entry instructions and day-of-event schedule.'
  },
  {
    q: 'Is accommodation available for outstation teams?',
    a: 'Yes. We provide basic overnight accommodation facilities within the campus for outstation participants. Please mark your accommodation requirement clearly during registration.'
  },
  {
    q: 'Can I participate solo?',
    a: 'Teams must have a minimum of 2 members. Solo registrations are not accepted.'
  },

]

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="border border-brand-border overflow-hidden"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 sm:p-6 text-left hover:bg-brand-card transition-colors"
        aria-expanded={open}
      >
        <span className="font-medium text-sm sm:text-base text-white pr-4">{q}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }}>
          <ChevronDown size={18} className="text-brand-primary flex-shrink-0" />
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
              <p className="pt-4 text-sm text-brand-muted leading-relaxed">{a}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function FAQ() {
  return (
    <main className="pt-24 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-brand-primary" />
            <span className="font-mono text-xs tracking-widest text-brand-primary">FREQUENTLY ASKED</span>
          </div>
          <h1 className="font-display font-black text-5xl sm:text-6xl text-white tracking-tight">
            FAQ<span className="text-brand-primary">S</span>
          </h1>
          <p className="mt-4 text-brand-muted">Everything you need to know before building on the grid.</p>
        </div>

        <div className="space-y-2">
          {faqData.map((item, i) => (
            <FAQItem key={i} q={item.q} a={item.a} index={i} />
          ))}
        </div>
      </div>
    </main>
  )
}
