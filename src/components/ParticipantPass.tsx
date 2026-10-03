import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Download, CheckCircle, QrCode } from 'lucide-react'
import QRCode from 'qrcode'
import type { StoredRegistration } from '../types'
import { EVENT_CONFIG } from '../../config/eventConfig'

/**
 * Generates the QR data URL containing canonical Registration ID & Team Name
 */
export async function generatePassQrDataUrl(reg: StoredRegistration): Promise<string> {
  const qrPayload = JSON.stringify({
    id: reg.registrationId,
    team: reg.teamName,
  })

  return QRCode.toDataURL(qrPayload, {
    width: 256,
    margin: 2,
    color: { dark: '#ffffff', light: '#0D0D0F' },
  })
}

/**
 * Downloads the official participant pass as a PNG canvas render.
 * Preserves the exact design, fonts, dimensions (800x600), colors, and filename convention.
 */
export async function downloadPass(reg: StoredRegistration, qrDataUrl?: string) {
  let activeQr = qrDataUrl
  if (!activeQr) {
    try {
      activeQr = await generatePassQrDataUrl(reg)
    } catch (e) {
      console.error('Failed to generate QR for pass download:', e)
    }
  }

  const canvas = document.createElement('canvas')
  canvas.width = 800
  canvas.height = 600
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // Background
  ctx.fillStyle = '#050505'
  ctx.fillRect(0, 0, 800, 600)

  // Red top bar
  ctx.fillStyle = '#FF3B30'
  ctx.fillRect(0, 0, 800, 8)

  // Border
  ctx.strokeStyle = '#2A2A32'
  ctx.lineWidth = 1.5
  ctx.strokeRect(20, 24, 760, 552)

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
  ctx.fillText((reg.teamName || 'TEAM PASS').toUpperCase(), 50, 145)

  // Details
  const fields = [
    { label: 'REGISTRATION ID', val: reg.registrationId },
    { label: 'TEAM NAME', val: reg.teamName },
    { label: 'TEAM LEADER', val: reg.leaderName },
    { label: 'TEAM LEADER COLLEGE', val: reg.leaderCollege || (reg as any).teamLeader?.college || (reg as any).teamLeaderCollege || reg.college || '—' },
    { label: 'TEAM SIZE', val: `${reg.teamSize || 2} Members` },
    { label: 'SELECTED DOMAIN', val: reg.selectedDomain || (reg as any).selectedDomain || 'Generative AI' },
    { label: 'DEPARTMENT', val: `${reg.leaderDepartment || '—'} (${reg.leaderYear || '—'})` },
    { label: 'SELECTED THEME', val: reg.selectedThemeName || reg.selectedThemeId || reg.selectedTheme || 'Open Innovation' },
    { label: 'ACCOMMODATION', val: reg.accommodationRequired || 'No' },
    { label: 'EVENT DATE', val: 'October 10–11, 2026' },
  ]

  let y = 172
  fields.forEach(({ label, val }) => {
    ctx.fillStyle = '#7A7A85'
    ctx.font = '10px "JetBrains Mono", monospace'
    ctx.fillText(label, 50, y)

    ctx.fillStyle = label === 'REGISTRATION ID' ? '#FF3B30' : '#FFFFFF'
    ctx.font = label === 'REGISTRATION ID' ? 'bold 14px "JetBrains Mono", monospace' : '12px "JetBrains Mono", monospace'
    ctx.fillText(String(val || '—').slice(0, 48), 50, y + 15)

    y += 33
  })

  const triggerDownload = (dataUrl: string) => {
    const link = document.createElement('a')
    link.download = `${reg.registrationId}_${(reg.teamName || 'TEAM').replace(/\s+/g, '_')}_PASS.png`
    link.href = dataUrl
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Draw QR
  if (activeQr) {
    const qrImg = new Image()
    qrImg.crossOrigin = 'anonymous'
    qrImg.onload = () => {
      ctx.drawImage(qrImg, 580, 130, 160, 160)
      ctx.fillStyle = '#9A9A9A'
      ctx.font = '10px "JetBrains Mono", monospace'
      ctx.textAlign = 'center'
      ctx.fillText(reg.registrationId, 660, 315)
      ctx.fillText('SCAN FOR VERIFICATION', 660, 332)

      triggerDownload(canvas.toDataURL('image/png'))
    }
    qrImg.onerror = () => {
      triggerDownload(canvas.toDataURL('image/png'))
    }
    qrImg.src = activeQr
  } else {
    triggerDownload(canvas.toDataURL('image/png'))
  }
}

export interface ParticipantPassProps {
  registration: StoredRegistration
  showDownloadButton?: boolean
  className?: string
}

/**
 * ParticipantPass component
 * Canonical single source of truth for participant pass visual card and download.
 * Shared across normal registration and Admin manual pass generation.
 */
export default function ParticipantPass({
  registration,
  showDownloadButton = true,
  className = '',
}: ParticipantPassProps) {
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [isDownloading, setIsDownloading] = useState(false)

  useEffect(() => {
    let isMounted = true
    generatePassQrDataUrl(registration)
      .then(url => {
        if (isMounted) setQrDataUrl(url)
      })
      .catch(err => {
        console.warn('QR code generation warning:', err)
      })
    return () => {
      isMounted = false
    }
  }, [registration.registrationId, registration.teamName])

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      await downloadPass(registration, qrDataUrl)
    } finally {
      setTimeout(() => setIsDownloading(false), 500)
    }
  }

  const leaderCollege =
    registration.leaderCollege ||
    (registration as any).teamLeader?.college ||
    (registration as any).teamLeaderCollege ||
    (registration as any).leaderCollegeName ||
    registration.college ||
    '—'

  return (
    <div className={`w-full ${className}`}>
      {/* Digital Holographic Participant Pass Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-brand-card/95 border border-brand-primary/50 p-6 sm:p-8 rounded-2xl shadow-2xl backdrop-blur-xl mb-6 relative overflow-hidden"
      >
        {/* Top Pass Header */}
        <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-5">
          <div>
            <div className="font-mono text-xs text-brand-primary tracking-widest mb-0.5">
              {EVENT_CONFIG.eventName}
            </div>
            <div className="font-mono text-xs text-brand-muted">
              OFFICIAL PARTICIPANT PASS · {EVENT_CONFIG.college?.shortName || 'SSEC'}
            </div>
          </div>
          <img
            src="/college-banner.jpg"
            alt="Sree Sakthi Engineering College"
            className="h-9 w-auto object-contain rounded"
            onError={(e) => {
              // Hide broken image placeholder gracefully if image not found
              ;(e.target as HTMLElement).style.display = 'none'
            }}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-6">
          {/* Squad & Pass Details */}
          <div className="flex-1 space-y-3.5">
            <div>
              <div className="font-mono text-[10px] text-brand-muted tracking-widest">TEAM NAME</div>
              <div className="font-display font-black text-2xl text-white tracking-wide">
                {registration.teamName}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <div className="font-mono text-[10px] text-brand-muted tracking-wider">REGISTRATION ID</div>
                <div className="font-mono text-base font-bold text-brand-primary">
                  {registration.registrationId}
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
                  {registration.leaderName}
                </div>
              </div>

              <div>
                <div className="font-mono text-[10px] text-brand-muted tracking-wider">TEAM LEADER COLLEGE</div>
                <div className="text-xs font-medium text-gray-200 truncate" title={leaderCollege}>
                  {leaderCollege}
                </div>
              </div>

              <div>
                <div className="font-mono text-[10px] text-brand-muted tracking-wider">TEAM SIZE</div>
                <div className="text-xs font-medium text-brand-orange font-mono">
                  {registration.teamSize || 2} Members
                </div>
              </div>

              <div>
                <div className="font-mono text-[10px] text-brand-muted tracking-wider">SELECTED DOMAIN</div>
                <div className="text-xs font-medium text-brand-orange font-mono">
                  {registration.selectedDomain || (registration as any).domain || 'Generative AI'}
                </div>
              </div>

              <div>
                <div className="font-mono text-[10px] text-brand-muted tracking-wider">DEPARTMENT</div>
                <div className="text-xs font-medium text-brand-orange font-mono">
                  {registration.leaderDepartment || '—'} ({registration.leaderYear || '—'})
                </div>
              </div>

              <div>
                <div className="font-mono text-[10px] text-brand-muted tracking-wider">SELECTED THEME</div>
                <div className="text-xs font-medium text-brand-orange font-mono">
                  {registration.selectedThemeName || registration.selectedThemeId || registration.selectedTheme || 'Open Innovation'}
                </div>
              </div>

              <div>
                <div className="font-mono text-[10px] text-brand-muted tracking-wider">ACCOMMODATION</div>
                <div className={`text-xs font-medium font-mono ${registration.accommodationRequired === 'Yes' ? 'text-amber-400' : 'text-zinc-400'}`}>
                  {registration.accommodationRequired || 'No'}
                </div>
              </div>
            </div>

            {/* Additional Registered Members Roster if present */}
            {Array.isArray(registration.members) && registration.members.length > 0 && (
              <div className="pt-2 border-t border-white/5 mt-2">
                <div className="font-mono text-[10px] text-brand-muted tracking-wider mb-1">TEAM MEMBERS ROSTER</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] font-mono text-zinc-300">
                  {registration.members.map((m, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <span className="text-brand-primary">#{idx + 2}</span>
                      <span className="font-medium text-white">{m.name}</span>
                      <span className="text-zinc-500">({m.department || m.yearOfStudy})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
              <div className="font-mono text-[10px] text-white font-bold">{registration.registrationId}</div>
              <div className="font-mono text-[9px] text-brand-muted">GATE PASS QR</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Optional Download Action Button */}
      {showDownloadButton && (
        <button
          type="button"
          onClick={handleDownload}
          disabled={isDownloading}
          className="w-full py-4 px-6 bg-brand-primary hover:bg-brand-primary/90 text-white font-mono text-xs sm:text-sm font-bold tracking-wider rounded-xl flex items-center justify-center gap-2.5 transition-all shadow-[0_0_20px_rgba(255,59,48,0.25)] hover:scale-[1.01] cursor-pointer disabled:opacity-50"
        >
          <Download size={18} /> {isDownloading ? 'PREPARING PASS...' : 'DOWNLOAD PASS'}
        </button>
      )}
    </div>
  )
}
