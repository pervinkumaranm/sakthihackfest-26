import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LogOut, Search, Download, Check, X, Eye, RefreshCw,
  Users, CheckCircle, Clock, XCircle, TrendingUp, Building2,
  ShieldCheck, CreditCard, ExternalLink, AlertCircle, FileSpreadsheet, Mail
} from 'lucide-react'
import { apiService } from '../../services/api'
import type { StoredRegistration, AdminStats, PaymentStatus, EmailStatus } from '../../types'

type Filter = 'ALL' | 'VERIFIED' | 'PENDING' | 'REJECTED'

function StatCard({ icon: Icon, label, value, sub, colorClass }: {
  icon: React.ElementType; label: string; value: number | string; sub?: string; colorClass?: string
}) {
  return (
    <div className="p-4 sm:p-5 border border-brand-border bg-brand-card/90 rounded-xl">
      <div className="flex items-start justify-between">
        <div>
          <div className="font-mono text-[10px] text-brand-muted tracking-widest uppercase mb-1">{label}</div>
          <div className={`font-display font-black text-2xl sm:text-3xl ${colorClass || 'text-white'}`}>{value}</div>
          {sub && <div className="font-mono text-[11px] text-brand-muted mt-1">{sub}</div>}
        </div>
        <div className={`p-2 rounded-lg bg-brand-surface border border-brand-border ${colorClass || 'text-brand-muted'}`}>
          <Icon size={18} />
        </div>
      </div>
    </div>
  )
}

function PaymentVerificationModal({ reg, onClose, onUpdateStatus }: {
  reg: StoredRegistration;
  onClose: () => void;
  onUpdateStatus: (id: string, status: PaymentStatus, notes?: string) => void;
}) {
  const [notes, setNotes] = useState(reg.verificationNotes || '')
  const [updating, setUpdating] = useState(false)
  const [resending, setResending] = useState(false)
  const [resendMessage, setResendMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleAction = async (status: PaymentStatus) => {
    setUpdating(true)
    await onUpdateStatus(reg.registrationId, status, notes)
    setUpdating(false)
    onClose()
  }

  const handleResendEmail = async () => {
    setResending(true)
    setResendMessage(null)
    try {
      const res = await apiService.resendConfirmationEmail(reg.registrationId)
      if (res.success) {
        setResendMessage({ type: 'success', text: 'Confirmation email sent successfully!' })
        reg.emailStatus = 'SENT'
        reg.emailSentAt = new Date().toISOString()
      } else {
        setResendMessage({ type: 'error', text: res.error || 'Failed to resend confirmation email.' })
      }
    } catch (err) {
      setResendMessage({ type: 'error', text: 'Network error occurred while resending email.' })
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-3xl bg-brand-surface border border-brand-border rounded-2xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-brand-border sticky top-0 bg-brand-surface z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-brand-primary font-bold">{reg.registrationId}</span>
              {(reg.selectedThemeName || reg.selectedThemeId) && (
                <>
                  <span className="text-brand-border">·</span>
                  <span className="font-mono text-xs text-brand-orange">{reg.selectedThemeName || reg.selectedThemeId}</span>
                </>
              )}
            </div>
            <h2 className="font-display font-black text-xl text-white mt-0.5">{reg.teamName}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-brand-muted hover:text-white rounded-lg hover:bg-brand-card transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Email Automation Status & Resend Control */}
          <div className="p-4 rounded-xl border border-brand-border bg-brand-card/70 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="font-mono text-[10px] text-brand-muted tracking-widest uppercase mb-1">
                  EMAIL AUTOMATION STATUS
                </div>
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className={`px-2.5 py-0.5 rounded font-bold ${
                    reg.emailStatus === 'SENT'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : reg.emailStatus === 'FAILED'
                      ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  }`}>
                    {reg.emailStatus === 'SENT' ? '✓ SENT' : reg.emailStatus === 'FAILED' ? '⚠ FAILED' : 'PENDING'}
                  </span>
                  <span className="text-gray-300">Recipient: {reg.leaderEmail}</span>
                </div>
                {reg.emailSentAt && (
                  <div className="font-mono text-[11px] text-brand-muted mt-1">
                    Sent At: {reg.emailSentAt}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleResendEmail}
                disabled={resending}
                className="px-4 py-2 rounded-lg bg-brand-primary/10 border border-brand-primary/40 text-brand-primary hover:bg-brand-primary hover:text-white font-mono text-xs font-bold transition-all flex items-center gap-1.5 self-start sm:self-auto disabled:opacity-50"
              >
                {resending ? <RefreshCw size={14} className="animate-spin" /> : <Mail size={14} />}
                RESEND CONFIRMATION EMAIL
              </button>
            </div>

            {resendMessage && (
              <div className={`p-2.5 rounded font-mono text-xs ${
                resendMessage.type === 'success'
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                  : 'bg-red-500/10 border border-red-500/30 text-red-400'
              }`}>
                {resendMessage.text}
              </div>
            )}
          </div>

          {/* Payment Verification Highlight Card */}
          <div className="p-5 rounded-xl border border-brand-primary/40 bg-brand-card/90 space-y-4">
            <div className="flex items-center justify-between border-b border-brand-border/60 pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="text-brand-primary" size={18} />
                <span className="font-display font-bold text-sm text-white tracking-wider">
                  PAYMENT DETAILS & VERIFICATION
                </span>
              </div>
              <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold ${
                reg.paymentStatus === 'VERIFIED'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : reg.paymentStatus === 'REJECTED'
                  ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
              }`}>
                {reg.paymentStatus}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
              <div>
                <span className="text-brand-muted block">REGISTRATION ID:</span>
                <span className="text-white font-bold text-sm">{reg.registrationId}</span>
              </div>
              <div>
                <span className="text-brand-muted block">AMOUNT:</span>
                <span className="text-emerald-400 font-bold text-sm">₹{reg.paymentAmount || 1000}</span>
              </div>
              <div>
                <span className="text-brand-muted block">UPI TRANSACTION ID:</span>
                <span className="text-white font-bold text-sm select-all">
                  {reg.upiTransactionId || 'Not provided'}
                </span>
              </div>
            </div>

            {/* Payment Screenshot Preview */}
            <div className="pt-3 border-t border-brand-border/60">
              <div className="font-mono text-xs text-brand-muted mb-2">PAYMENT SCREENSHOT:</div>
              {reg.paymentScreenshotData ? (
                <div className="p-2 bg-black/60 rounded-lg border border-brand-border max-w-md">
                  <img
                    src={reg.paymentScreenshotData}
                    alt="Payment Screenshot Proof"
                    className="w-full max-h-72 object-contain rounded"
                  />
                  <div className="text-[11px] font-mono text-brand-muted mt-2 text-center">
                    {reg.paymentScreenshotName || 'payment_proof.png'}
                  </div>
                </div>
              ) : reg.paymentScreenshotDriveUrl ? (
                <div className="space-y-1">
                  <a
                    href={reg.paymentScreenshotDriveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-primary/10 border border-brand-primary/30 text-brand-primary font-mono text-xs hover:bg-brand-primary/20 transition-colors"
                  >
                    <ExternalLink size={14} /> Open Screenshot in Google Drive
                  </a>
                  {reg.driveFileId && (
                    <div className="font-mono text-[10px] text-brand-muted">Drive ID: {reg.driveFileId}</div>
                  )}
                </div>
              ) : (
                <div className="text-xs font-mono text-amber-400 bg-amber-500/10 border border-amber-500/30 p-3 rounded-lg">
                  No payment screenshot image data found. Verify using the UPI Transaction ID above.
                </div>
              )}
            </div>
          </div>

          {/* Team & Member Roster */}
          <div className="space-y-4">
            <h3 className="font-display font-bold text-sm text-white tracking-wider">
              SQUAD ROSTER ({reg.teamSize} MEMBERS)
            </h3>

            {/* Leader */}
            <div className="p-4 rounded-xl border border-brand-border bg-brand-card/60 text-xs font-mono space-y-1.5">
              <div className="flex items-center justify-between text-brand-primary font-bold">
                <span>TEAM LEADER: {reg.leaderName}</span>
                <span className="text-[10px] bg-brand-primary/10 px-2 py-0.5 rounded">PRIMARY</span>
              </div>
              <div className="text-brand-muted">Dept & Year: {reg.leaderDepartment} · {reg.leaderYear}</div>
              <div className="text-brand-muted">Contact: {reg.leaderWhatsapp} · {reg.leaderEmail}</div>
            </div>

            {/* Co-engineers */}
            {reg.members?.map((m, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-brand-border bg-brand-card/40 text-xs font-mono space-y-1.5">
                <div className="flex items-center justify-between text-white font-bold">
                  <span>MEMBER 0{idx + 2}: {m.name}</span>
                  <span className="text-[10px] text-brand-orange">CO-ENGINEER</span>
                </div>
                <div className="text-brand-muted">Dept & Year: {m.department} · {m.yearOfStudy}</div>
                <div className="text-brand-muted">Contact: {m.whatsapp} · {m.email}</div>
              </div>
            ))}
          </div>

          {/* Admin Verification Notes */}
          <div>
            <label className="block font-mono text-xs text-brand-muted mb-2">VERIFICATION NOTES (OPTIONAL)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Verified against bank statement / transaction confirmed"
              className="w-full bg-brand-bg border border-brand-border rounded-lg text-white text-xs px-3.5 py-2.5 font-mono focus:outline-none focus:border-brand-primary"
            />
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="p-6 border-t border-brand-border bg-brand-surface flex flex-wrap items-center justify-end gap-3 sticky bottom-0">
          <button
            onClick={() => handleAction('REJECTED')}
            disabled={updating}
            className="px-4 py-2.5 rounded-lg border border-red-500/40 text-red-400 hover:bg-red-500/10 font-mono text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <XCircle size={15} /> REJECT PAYMENT
          </button>

          <button
            onClick={() => handleAction('PENDING')}
            disabled={updating}
            className="px-4 py-2.5 rounded-lg border border-amber-500/40 text-amber-400 hover:bg-amber-500/10 font-mono text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <Clock size={15} /> MARK PAYMENT PENDING
          </button>

          <button
            onClick={() => handleAction('VERIFIED')}
            disabled={updating}
            className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition-colors flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
          >
            <CheckCircle size={15} /> VERIFY PAYMENT
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default function AdminDashboard() {
  const [registrations, setRegistrations] = useState<StoredRegistration[]>([])
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Filter>('ALL')
  const [selectedReg, setSelectedReg] = useState<StoredRegistration | null>(null)
  const navigate = useNavigate()

  const loadData = async () => {
    setLoading(true)
    try {
      const [regs, st] = await Promise.all([
        apiService.getRegistrations(),
        apiService.getAdminStats(),
      ])
      setRegistrations(regs)
      setStats(st)
    } catch (err) {
      console.error('Failed to load admin data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleLogout = () => {
    sessionStorage.removeItem('shf26_admin')
    navigate('/admin/login')
  }

  const handleStatusUpdate = async (id: string, paymentStatus: PaymentStatus, notes?: string) => {
    await apiService.updatePaymentStatus(id, paymentStatus, notes)
    await loadData()
  }

  const filteredRegistrations = registrations.filter((r) => {
    const matchesFilter = filter === 'ALL' || r.paymentStatus === filter
    const q = search.toLowerCase().trim()
    const matchesSearch =
      !q ||
      r.registrationId.toLowerCase().includes(q) ||
      r.teamName.toLowerCase().includes(q) ||
      (r.leaderDepartment && r.leaderDepartment.toLowerCase().includes(q)) ||
      r.leaderName.toLowerCase().includes(q) ||
      (r.leaderEmail && r.leaderEmail.toLowerCase().includes(q)) ||
      (r.upiTransactionId && r.upiTransactionId.toLowerCase().includes(q))
    return matchesFilter && matchesSearch
  })

  return (
    <main className="min-h-screen bg-brand-bg pt-20 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border pb-6">
          <div className="flex items-center gap-3">
            <img
              src="/college-banner.jpg"
              alt="Sree Sakthi Engineering College"
              className="h-11 w-auto object-contain rounded"
            />
            <div>
              <div className="font-display font-black text-xl text-white tracking-widest">
                SAKTHI HACKFEST <span className="text-brand-primary">'26</span>
              </div>
              <div className="font-mono text-xs text-brand-muted">ADMINISTRATION CONSOLE · SSEC</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              disabled={loading}
              className="p-2 border border-brand-border text-brand-muted hover:text-white rounded-lg transition-colors"
              title="Refresh Data"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin text-brand-primary' : ''} />
            </button>

            <button
              onClick={() => apiService.exportToSpreadsheet(registrations, 'xlsx')}
              className="px-4 py-2 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 font-mono text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <FileSpreadsheet size={15} /> EXPORT EXCEL
            </button>

            <button
              onClick={handleLogout}
              className="px-4 py-2 border border-brand-border text-brand-muted hover:text-white font-mono text-xs rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <LogOut size={15} /> LOGOUT
            </button>
          </div>
        </div>

        {/* 7 Core Admin Stat Cards */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            <StatCard
              icon={Users}
              label="TOTAL REGS"
              value={stats.totalRegistrations}
              colorClass="text-white"
            />
            <StatCard
              icon={Users}
              label="TOTAL TEAMS"
              value={stats.totalTeams}
              colorClass="text-brand-orange"
            />
            <StatCard
              icon={Users}
              label="PARTICIPANTS"
              value={stats.totalParticipants}
              colorClass="text-white"
            />
            <StatCard
              icon={CreditCard}
              label="PAY SUBMITTED"
              value={stats.paymentSubmitted}
              colorClass="text-cyan-400"
            />
            <StatCard
              icon={Clock}
              label="PAY PENDING"
              value={stats.paymentPending}
              colorClass="text-amber-400"
            />
            <StatCard
              icon={CheckCircle}
              label="VERIFIED"
              value={stats.verifiedCount}
              colorClass="text-emerald-400"
            />
            <StatCard
              icon={XCircle}
              label="REJECTED"
              value={stats.rejectedCount}
              colorClass="text-red-400"
            />
          </div>
        )}

        {/* Search & Filter Controls */}
        <div className="bg-brand-card/80 border border-brand-border p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ID, Team, Leader, Dept, Email, or UPI ID..."
              className="w-full bg-brand-bg border border-brand-border rounded-lg pl-10 pr-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-brand-primary"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {(['ALL', 'VERIFIED', 'PENDING', 'REJECTED'] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 font-mono text-xs rounded-lg transition-colors ${
                  filter === f
                    ? 'bg-brand-primary text-white font-bold'
                    : 'border border-brand-border text-brand-muted hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Registrations Table */}
        <div className="bg-brand-card/90 border border-brand-border rounded-xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-brand-surface border-b border-brand-border text-brand-muted">
                <tr>
                  <th className="py-3.5 px-4">REG ID</th>
                  <th className="py-3.5 px-4">TEAM & LEADER</th>
                  <th className="py-3.5 px-4">THEME</th>
                  <th className="py-3.5 px-4">SIZE</th>
                  <th className="py-3.5 px-4">PAYMENT STATUS</th>
                  <th className="py-3.5 px-4">REG STATUS</th>
                  <th className="py-3.5 px-4">EMAIL STATUS</th>
                  <th className="py-3.5 px-4 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/60 text-gray-300">
                {filteredRegistrations.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-brand-muted">
                      No registrations match your search and filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredRegistrations.map((r) => (
                    <tr key={r.registrationId} className="hover:bg-brand-surface/60 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-white">{r.registrationId}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white">{r.teamName}</div>
                        <div className="text-[10px] text-brand-muted">{r.leaderName} ({r.leaderDepartment} · {r.leaderWhatsapp})</div>
                        <div className="text-[10px] text-brand-muted/70">{r.leaderEmail}</div>
                      </td>
                      <td className="py-3.5 px-4 text-brand-orange">
                        {r.selectedThemeName || r.selectedThemeId || 'Open Innovation'}
                      </td>
                      <td className="py-3.5 px-4">{r.teamSize}</td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          r.paymentStatus === 'VERIFIED'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : r.paymentStatus === 'REJECTED'
                            ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}>
                          {r.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] ${
                          r.registrationStatus === 'CONFIRMED'
                            ? 'text-emerald-400'
                            : r.registrationStatus === 'REJECTED'
                            ? 'text-red-400'
                            : 'text-amber-400'
                        }`}>
                          {r.registrationStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                          r.emailStatus === 'SENT'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : r.emailStatus === 'FAILED'
                            ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}>
                          {r.emailStatus === 'SENT' ? '✓ SENT' : r.emailStatus === 'FAILED' ? '⚠ FAILED' : 'PENDING'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedReg(r)}
                          className="px-3 py-1.5 rounded bg-brand-primary/10 border border-brand-primary/30 text-brand-primary hover:bg-brand-primary hover:text-white font-mono text-xs transition-colors inline-flex items-center gap-1"
                        >
                          <Eye size={12} /> View & Verify
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Payment Verification Modal */}
      <AnimatePresence>
        {selectedReg && (
          <PaymentVerificationModal
            reg={selectedReg}
            onClose={() => setSelectedReg(null)}
            onUpdateStatus={handleStatusUpdate}
          />
        )}
      </AnimatePresence>
    </main>
  )
}
