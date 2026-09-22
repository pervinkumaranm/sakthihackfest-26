import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Download, Calendar, Home, CheckCircle, CheckCircle2, ShieldCheck, QrCode, AlertCircle } from 'lucide-react'
import QRCode from 'qrcode'
import type { StoredRegistration } from '../types'
import { EVENT_CONFIG } from '../../config/eventConfig'

function generateIcs(reg: StoredRegistration): string {
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    "PRODID:-//SAKTHI HACKFEST'26//EN",
    'BEGIN:VEVENT',
    'DTSTART:20261010T090000',
    'DTEND:20261011T180000',
    "SUMMARY:SAKTHI HACKFEST'26",
    `DESCRIPTION:Team ${reg.teamName} · ID: ${reg.registrationId}${reg.selectedThemeName || reg.selectedThemeId ? ` · Theme: ${reg.selectedThemeName || reg.selectedThemeId}` : ''}`,
    'LOCATION:Sree Sakthi Engineering College\\, Karamadai\\, Coimbatore',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
}

function downloadPass(reg: StoredRegistration, qrDataUrl: string) {
  const canvas = document.createElement('canvas')
  canvas.width = 800
  canvas.height = 500
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // Background
  ctx.fillStyle = '#050505'
  ctx.fillRect(0, 0, 800, 500)

  // Red top bar
  ctx.fillStyle = '#FF3B30'
  ctx.fillRect(0, 0, 800, 8)

  // Border
  ctx.strokeStyle = '#2A2A32'
  ctx.lineWidth = 1.5
  ctx.strokeRect(20, 24, 760, 452)

  // Title & Header
  ctx.fillStyle = '#FF3B30'
  ctx.font = 'bold 13px "JetBrains Mono", monospace'
  ctx.fillText("SAKTHI HACKFEST'26", 50, 65)

  ctx.fillStyle = '#9A9A9A'
  ctx.font = '11px "JetBrains Mono", monospace'
  ctx.fillText('OFFICIAL PARTICIPANT PASS — OCTOBER 10–11, 2026', 50, 85)

  // Divider
  ctx.strokeStyle = '#2A2A32'
  ctx.beginPath()
  ctx.moveTo(50, 100)
  ctx.lineTo(550, 100)
  ctx.stroke()

  // Team Name
  ctx.fillStyle = '#FFFFFF'
  ctx.font = 'bold 32px "Orbitron", sans-serif'
  ctx.fillText(reg.teamName.toUpperCase(), 50, 150)

  // Details
  const fields = [
    { label: 'REGISTRATION ID', val: reg.registrationId },
    { label: 'TEAM NAME', val: reg.teamName },
    { label: 'TEAM LEADER', val: reg.leaderName },
    { label: 'TEAM SIZE', val: `${reg.teamSize} Members` },
    { label: 'THEME', val: reg.selectedThemeName || reg.selectedThemeId || 'Open Innovation' },
    { label: 'EVENT DATE', val: 'October 10–11, 2026' },
  ]

  let y = 190
  fields.forEach(({ label, val }) => {
    ctx.fillStyle = '#7A7A85'
    ctx.font = '10px "JetBrains Mono", monospace'
    ctx.fillText(label, 50, y)

    ctx.fillStyle = label === 'REGISTRATION ID' ? '#FF3B30' : '#FFFFFF'
    ctx.font = label === 'REGISTRATION ID' ? 'bold 15px "JetBrains Mono", monospace' : '13px "JetBrains Mono", monospace'
    ctx.fillText(String(val).slice(0, 48), 50, y + 18)

    y += 38
  })

  // Draw QR
  if (qrDataUrl) {
    const qrImg = new Image()
    qrImg.onload = () => {
      ctx.drawImage(qrImg, 580, 120, 160, 160)
      ctx.fillStyle = '#9A9A9A'
      ctx.font = '10px "JetBrains Mono", monospace'
      ctx.textAlign = 'center'
      ctx.fillText(reg.registrationId, 660, 305)
      ctx.fillText('SCAN FOR VERIFICATION', 660, 322)

      const link = document.createElement('a')
      link.download = `${reg.registrationId}_${reg.teamName.replace(/\s+/g, '_')}_PASS.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    }
    qrImg.src = qrDataUrl
  }
}

export default function Success() {
  const location = useLocation()
  const navigate = useNavigate()
  const [reg, setReg] = useState<StoredRegistration | null>(null)
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [confettiFired, setConfettiFired] = useState(false)

  useEffect(() => {
    const stateReg = location.state?.registration
    let targetReg: StoredRegistration | null = stateReg || null

    if (!targetReg) {
      const stored = sessionStorage.getItem('shf26_registration')
      if (stored) {
        try { targetReg = JSON.parse(stored) } catch (e) {}
      }
    }

    if (!targetReg) {
      // Look in localStorage fallback
      const local = localStorage.getItem('shf26_registrations_v3')
      if (local) {
        try {
          const list = JSON.parse(local)
          if (Array.isArray(list) && list.length > 0) {
            targetReg = list[0]
          }
        } catch (e) {}
      }
    }

    if (!targetReg) {
      navigate('/register')
      return
    }

    setReg(targetReg)
    sessionStorage.setItem('shf26_registration', JSON.stringify(targetReg))

    // QR contains exclusively Registration ID and Team Name
    const qrPayload = JSON.stringify({
      id: targetReg.registrationId,
      team: targetReg.teamName,
    })

    QRCode.toDataURL(qrPayload, {
      width: 256,
      margin: 2,
      color: { dark: '#ffffff', light: '#0D0D0F' },
    }).then(setQrDataUrl)

    // Trigger celebratory confetti
    if (!confettiFired) {
      setConfettiFired(true)
      import('canvas-confetti').then(({ default: confetti }) => {
        confetti({
          particleCount: 130,
          spread: 85,
          origin: { y: 0.5 },
          colors: ['#FF3B30', '#FF7A00', '#ffffff', '#10B981'],
        })
      }).catch(() => {})
    }
  }, [location, navigate, confettiFired])

  if (!reg) return null

  const addToCalendar = () => {
    const icsContent = generateIcs(reg)
    const blob = new Blob([icsContent], { type: 'text/calendar' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${reg.registrationId}_SAKTHI_HACKFEST_2K26.ics`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <main className="pt-24 pb-28 px-4 sm:px-6 lg:px-8 min-h-screen flex items-start justify-center relative overflow-hidden">
      {/* Glow background */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-brand-primary/10 blur-[180px] pointer-events-none rounded-full" />
      <div className="bg-cyber-grid-dense absolute inset-0 opacity-40 pointer-events-none" />

      <div className="w-full max-w-2xl relative z-10">
        {/* Header Confirmation Message */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.15 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-emerald-500/10 border border-emerald-500/40 rounded-full mb-5 shadow-[0_0_30px_rgba(16,185,129,0.2)]"
          >
            <CheckCircle2 size={42} className="text-emerald-400" />
          </motion.div>
          <h1 className="font-display font-black text-4xl sm:text-5xl text-white tracking-tight leading-tight mb-2">
            REGISTRATION<br />
            <span className="text-brand-primary">CONFIRMED</span>
          </h1>
          <p className="font-display text-lg sm:text-xl text-brand-orange tracking-widest uppercase">
            WELCOME TO {EVENT_CONFIG.eventName}
          </p>

          {/* Prominent Registration ID Box */}
          <div className="my-6 max-w-xs sm:max-w-sm mx-auto p-4 bg-brand-surface/90 border border-brand-primary/60 rounded-xl shadow-[0_0_30px_rgba(255,59,48,0.2)]">
            <div className="font-mono text-[10px] text-brand-muted tracking-widest uppercase mb-1">
              YOUR REGISTRATION ID
            </div>
            <div className="font-mono text-2xl sm:text-3xl font-black text-brand-primary tracking-widest">
              {reg.registrationId}
            </div>
          </div>

          {/* Submission Status Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 font-mono text-xs text-emerald-400 rounded-full">
              <CheckCircle size={13} /> Registration Saved
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 font-mono text-xs text-emerald-400 rounded-full">
              <ShieldCheck size={13} /> Payment Screenshot Uploaded
            </span>
            {reg.emailStatus === 'SENT' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 font-mono text-xs text-emerald-400 rounded-full">
                <CheckCircle size={13} /> Confirmation Email Sent
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 font-mono text-xs text-amber-400 rounded-full">
                <AlertCircle size={13} /> Confirmation Email Pending
              </span>
            )}
          </div>

          {reg.emailStatus === 'FAILED' && (
            <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-300 font-mono text-xs max-w-md mx-auto">
              Confirmation email could not be sent at this time. Please save your Registration ID.
            </div>
          )}
        </motion.div>

        {/* Digital Holographic Participant Pass Card */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="bg-brand-card/95 border border-brand-primary/50 p-6 sm:p-8 rounded-2xl shadow-2xl backdrop-blur-xl mb-6 relative overflow-hidden"
        >
          {/* Top Pass Header */}
          <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-5">
            <div>
              <div className="font-mono text-xs text-brand-primary tracking-widest mb-0.5">
                {EVENT_CONFIG.eventName}
              </div>
              <div className="font-mono text-xs text-brand-muted">
                OFFICIAL PARTICIPANT PASS · {EVENT_CONFIG.college.shortName}
              </div>
            </div>
            <img
              src="/college-banner.jpg"
              alt="Sree Sakthi Engineering College"
              className="h-9 w-auto object-contain rounded"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-6">
            {/* Squad & Pass Details */}
            <div className="flex-1 space-y-3.5">
              <div>
                <div className="font-mono text-[10px] text-brand-muted tracking-widest">TEAM NAME</div>
                <div className="font-display font-black text-2xl text-white tracking-wide">
                  {reg.teamName}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <div className="font-mono text-[10px] text-brand-muted tracking-wider">REGISTRATION ID</div>
                  <div className="font-mono text-base font-bold text-brand-primary">
                    {reg.registrationId}
                  </div>
                </div>

                <div>
                  <div className="font-mono text-[10px] text-brand-muted tracking-wider">EVENT DATE</div>
                  <div className="font-mono text-xs font-bold text-white">
                    {EVENT_CONFIG.eventDate}
                  </div>
                </div>

                <div>
                  <div className="font-mono text-[10px] text-brand-muted tracking-wider">TEAM LEADER</div>
                  <div className="text-xs font-medium text-gray-200">
                    {reg.leaderName}
                  </div>
                </div>

                <div>
                  <div className="font-mono text-[10px] text-brand-muted tracking-wider">TEAM SIZE</div>
                  <div className="text-xs font-medium text-brand-orange font-mono">
                    {reg.teamSize} Members
                  </div>
                </div>

                <div>
                  <div className="font-mono text-[10px] text-brand-muted tracking-wider">DEPARTMENT</div>
                  <div className="text-xs font-medium text-brand-orange font-mono">
                    {reg.leaderDepartment} ({reg.leaderYear})
                  </div>
                </div>

                <div>
                  <div className="font-mono text-[10px] text-brand-muted tracking-wider">SELECTED THEME</div>
                  <div className="text-xs font-medium text-brand-orange font-mono">
                    {reg.selectedThemeName || reg.selectedThemeId || 'Open Innovation'}
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 font-mono text-[11px] text-emerald-400 rounded">
                  <CheckCircle size={12} /> CONFIRMED PARTICIPANT ROSTER
                </span>
              </div>
            </div>

            {/* Verification QR Code */}
            <div className="flex-shrink-0 flex flex-col items-center justify-center p-3 bg-brand-bg/80 border border-brand-border rounded-xl">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Registration QR Pass"
                  className="w-32 h-32 object-contain rounded"
                />
              ) : (
                <div className="w-32 h-32 flex items-center justify-center">
                  <QrCode size={40} className="text-brand-muted animate-pulse" />
                </div>
              )}
              <div className="mt-2 text-center">
                <div className="font-mono text-[10px] text-white font-bold">{reg.registrationId}</div>
                <div className="font-mono text-[9px] text-brand-muted">GATE PASS QR</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3"
        >
          <button
            onClick={() => downloadPass(reg, qrDataUrl)}
            className="py-3.5 px-4 bg-brand-primary hover:bg-brand-primary/90 text-white font-mono text-xs font-bold tracking-wider rounded-lg flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(255,59,48,0.25)] hover:scale-[1.02]"
          >
            <Download size={16} /> DOWNLOAD PASS
          </button>

          <button
            onClick={addToCalendar}
            className="py-3.5 px-4 bg-brand-card hover:bg-brand-surface border border-brand-border text-white font-mono text-xs font-bold tracking-wider rounded-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
          >
            <Calendar size={16} /> ADD TO CALENDAR
          </button>

          <Link
            to="/"
            className="py-3.5 px-4 bg-brand-card hover:bg-brand-surface border border-brand-border text-brand-muted hover:text-white font-mono text-xs font-bold tracking-wider rounded-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
          >
            <Home size={16} /> BACK TO HOME
          </Link>
        </motion.div>
      </div>
    </main>
  )
}
