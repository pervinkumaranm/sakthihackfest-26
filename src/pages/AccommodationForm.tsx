import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Check, CheckCircle2, AlertCircle, Home, Upload,
  ExternalLink, ArrowLeft, ArrowRight, ShieldCheck, Moon, RefreshCw
} from 'lucide-react'
import { EVENT_CONFIG } from '../../config/eventConfig'
import { apiService } from '../services/api'
import { useAppSettings } from '../context/SettingsContext'
import type { ApiResponse } from '../types'

interface RegisteredTeam {
  teamCode: string
  teamName: string
  members?: string[]
}

export default function AccommodationForm() {
  const { accommodationOpen } = useAppSettings()
  // Step state: 1: Select Team, 2: Select Members, 3: Review, 4: Payment, 5: Success
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1)

  // Status / Toggle State (Single Source of Truth)
  const isFormClosed = !accommodationOpen

  // Teams list & selection state
  const [teams, setTeams] = useState<RegisteredTeam[]>([])
  const [loadingTeams, setLoadingTeams] = useState(true)
  const [loadingMembers, setLoadingMembers] = useState(false)
  const [teamsError, setTeamsError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTeam, setSelectedTeam] = useState<RegisteredTeam | null>(null)

  // Members selection
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [memberError, setMemberError] = useState('')

  // Payment state
  const [upiId, setUpiId] = useState('')
  const [screenshotData, setScreenshotData] = useState<string>('')
  const [screenshotName, setScreenshotName] = useState<string>('')
  const [screenshotPreview, setScreenshotPreview] = useState<string>('')
  const [screenshotError, setScreenshotError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [successResult, setSuccessResult] = useState<{
    accommodationId: string
    timestamp?: string
    totalAmount: number
  } | null>(null)

  // QR Modal
  const [showQrModal, setShowQrModal] = useState(false)

  // 1. Load Registered Teams from Google Sheets via API (Least Privilege: Team Name & Code only)
  useEffect(() => {
    let active = true
    async function loadTeams() {
      setLoadingTeams(true)
      setTeamsError(null)
      try {
        const list = await apiService.getRegisteredTeamsForAccommodation()
        if (active) {
          setTeams(list)
          if (list.length === 0) {
            setTeamsError('No registered teams found in the database.')
          }
        }
      } catch (err: any) {
        if (active) {
          setTeamsError(err.message || 'Failed to load registered teams. Please try again.')
        }
      } finally {
        if (active) setLoadingTeams(false)
      }
    }
    loadTeams()
    return () => {
      active = false
    }
  }, [])

  // Filtered teams based on search query (Privacy: filters only teamName or teamCode)
  const filteredTeams = teams.filter((t) => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return true
    return (
      t.teamName.toLowerCase().includes(q) ||
      t.teamCode.toLowerCase().includes(q)
    )
  })

  // Amount calculation
  const memberRate = 100
  const totalAmount = selectedMembers.length * memberRate

  // Select team handler (fetches member names securely on demand)
  const handleSelectTeam = async (team: RegisteredTeam) => {
    setMemberError('')
    setLoadingMembers(true)
    try {
      const details = await apiService.getTeamMembersForAccommodation(team.teamCode)
      if (details && Array.isArray(details.members) && details.members.length > 0) {
        setSelectedTeam({
          teamCode: team.teamCode,
          teamName: team.teamName,
          members: details.members,
        })
        setSelectedMembers([...details.members])
        setStep(2)
      } else {
        setTeamsError(`No registered members found for team ${team.teamName}.`)
      }
    } catch (err: any) {
      setTeamsError('Failed to retrieve registered team members. Please try again.')
    } finally {
      setLoadingMembers(false)
    }
  }

  // Toggle individual member
  const handleToggleMember = (name: string) => {
    setMemberError('')
    if (selectedMembers.includes(name)) {
      setSelectedMembers(prev => prev.filter(m => m !== name))
    } else {
      setSelectedMembers(prev => [...prev, name])
    }
  }

  // File upload handler
  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setScreenshotError('')
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
    if (!validTypes.includes(file.type.toLowerCase())) {
      setScreenshotError('Invalid format. Please upload a PNG, JPG, JPEG or WEBP image under 5 MB.')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setScreenshotError('File size exceeds 5 MB. Please upload a screenshot less than 5 MB.')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result as string
      setScreenshotData(base64)
      setScreenshotName(file.name)
      setScreenshotPreview(base64)
    }
    reader.onerror = () => {
      setScreenshotError('Failed to read image file. Please try again.')
    }
    reader.readAsDataURL(file)
  }

  // Step 2 -> 3 Review validation
  const handleProceedToReview = () => {
    if (selectedMembers.length === 0) {
      setMemberError('Please select at least 1 member requiring accommodation.')
      return
    }
    setMemberError('')
    setStep(3)
  }

  // Step 4: Submission
  const handleSubmitAccommodation = async () => {
    if (!selectedTeam) return

    if (selectedMembers.length === 0) {
      setSubmitError('At least 1 member must be selected.')
      return
    }

    const cleanUpi = upiId.replace(/[^0-9]/g, '')
    if (cleanUpi.length !== 12) {
      setSubmitError('Please enter a valid 12-digit numeric UPI Transaction ID (UTR).')
      return
    }

    if (!screenshotData) {
      setScreenshotError('Payment screenshot is mandatory. Please upload your payment screenshot.')
      setSubmitError('Please upload your payment screenshot before submitting.')
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const response: ApiResponse = await apiService.submitAccommodation({
        teamCode: selectedTeam.teamCode,
        teamName: selectedTeam.teamName,
        selectedMembers,
        upiTransactionId: cleanUpi,
        paymentScreenshotData: screenshotData,
        paymentScreenshotName: screenshotName,
      })

      if (response.success && response.accommodationId) {
        setSuccessResult({
          accommodationId: response.accommodationId,
          timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
          totalAmount,
        })
        setStep(5)
      } else {
        setSubmitError(response.message || response.error || 'Failed to submit accommodation request. Please try again.')
      }
    } catch (err: any) {
      setSubmitError(err.message || 'Network error occurred while submitting. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Closed Form View
  if (isFormClosed) {
    return (
      <main className="pt-28 pb-32 px-4 sm:px-6 lg:px-8 min-h-screen flex items-center justify-center bg-brand-bg relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-500/10 blur-[160px] pointer-events-none rounded-full" />
        <div className="w-full max-w-lg bg-brand-card/90 border border-red-500/40 p-8 sm:p-10 rounded-2xl text-center shadow-2xl relative z-10 backdrop-blur-xl">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/15 border border-red-500/40 rounded-full mb-5">
            <Moon size={32} className="text-red-400" />
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white mb-3 tracking-wide">
            ACCOMMODATION CLOSED
          </h1>
          <p className="font-mono text-xs text-brand-muted leading-relaxed mb-6">
            Accommodation registration is currently closed. If you have special accommodation requirements or emergency inquiries, please contact the organizing committee.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/contact"
              className="py-3 px-6 bg-brand-primary hover:bg-brand-primary/90 text-white font-mono text-xs font-bold rounded-xl transition-all"
            >
              CONTACT ORGANIZERS
            </Link>
            <Link
              to="/"
              className="py-3 px-6 bg-brand-surface hover:bg-brand-card border border-brand-border text-brand-muted hover:text-white font-mono text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
            >
              <Home size={15} /> BACK TO HOME
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="pt-24 pb-28 px-4 sm:px-6 lg:px-8 min-h-screen bg-brand-bg relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-primary/10 blur-[180px] pointer-events-none rounded-full" />
      <div className="bg-cyber-grid-dense absolute inset-0 opacity-30 pointer-events-none" />

      <div className="w-full max-w-3xl mx-auto relative z-10">
        {/* Header Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-primary/10 border border-brand-primary/30 rounded-full mb-3">
            <Moon size={13} className="text-brand-primary" />
            <span className="font-mono text-[11px] text-brand-primary font-bold tracking-widest uppercase">
              PRE-EVENT NIGHT · 9TH OCTOBER 2026
            </span>
          </div>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-white tracking-tight">
            ACCOMMODATION <span className="text-brand-primary">REGISTRATION</span>
          </h1>
          <p className="font-mono text-xs text-brand-muted mt-2 max-w-xl mx-auto">
            Reserve hostel accommodation at Sree Sakthi Engineering College for your registered team members.
          </p>
        </div>

        {/* Multi-Step Progress Tracker */}
        {step < 5 && (
          <div className="mb-8">
            <div className="grid grid-cols-4 gap-2 text-center">
              {[
                { s: 1, title: 'Team' },
                { s: 2, title: 'Members' },
                { s: 3, title: 'Review' },
                { s: 4, title: 'Payment' },
              ].map(st => {
                const isActive = step === st.s
                const isCompleted = step > st.s
                return (
                  <div key={st.s} className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all ${
                        isCompleted
                          ? 'bg-emerald-500 text-white'
                          : isActive
                          ? 'bg-brand-primary text-white ring-4 ring-brand-primary/20 shadow-glow-red'
                          : 'bg-brand-surface border border-brand-border text-brand-muted'
                      }`}
                    >
                      {isCompleted ? <Check size={14} /> : st.s}
                    </div>
                    <span
                      className={`mt-1.5 font-mono text-[10px] tracking-wider uppercase ${
                        isActive ? 'text-white font-bold' : isCompleted ? 'text-emerald-400' : 'text-brand-muted'
                      }`}
                    >
                      {st.title}
                    </span>
                  </div>
                )
              })}
            </div>
            <div className="w-full bg-brand-surface h-1 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-brand-primary to-emerald-400 h-full transition-all duration-300"
                style={{ width: `${((step - 1) / 3) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* ── STEP 1: SELECT REGISTERED TEAM ──────────────────────────────── */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-brand-card/95 border border-brand-border p-6 sm:p-8 rounded-2xl shadow-2xl backdrop-blur-xl"
          >
            <div className="mb-6">
              <h2 className="font-display font-black text-xl text-white tracking-wide">
                1. SELECT YOUR REGISTERED TEAM
              </h2>
              <p className="font-mono text-xs text-brand-muted mt-1">
                Select your team already registered for Sakthi HackFest '26. Member rosters will automatically populate.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative mb-6">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by team name or registration ID (e.g. SHF26-XXXXXX)..."
                className="w-full pl-10 pr-4 py-3 bg-brand-surface border border-brand-border focus:border-brand-primary rounded-xl text-white font-mono text-xs outline-none transition-all placeholder:text-brand-muted/70"
              />
            </div>

            {/* Loading State */}
            {loadingTeams && (
              <div className="py-12 text-center">
                <RefreshCw size={28} className="text-brand-primary animate-spin mx-auto mb-3" />
                <p className="font-mono text-xs text-brand-muted">Fetching registered teams from database...</p>
              </div>
            )}

            {/* Error State */}
            {!loadingTeams && teamsError && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-center text-red-400 font-mono text-xs mb-4">
                {teamsError}
              </div>
            )}

            {/* Team Dropdown / List */}
            {!loadingTeams && !teamsError && (
              <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                {filteredTeams.length === 0 ? (
                  <div className="py-8 text-center text-brand-muted font-mono text-xs">
                    No registered teams found matching "{searchQuery}".
                  </div>
                ) : (
                  filteredTeams.map(t => (
                    <div
                      key={t.teamCode}
                      onClick={() => !loadingMembers && handleSelectTeam(t)}
                      className="p-4 bg-brand-surface hover:bg-brand-card border border-brand-border hover:border-brand-primary/60 rounded-xl cursor-pointer transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-md bg-brand-primary/10 border border-brand-primary/20 text-brand-primary">
                          {t.teamCode}
                        </span>
                        <div className="font-display font-bold text-base text-white group-hover:text-brand-primary transition-colors">
                          {t.teamName}
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={loadingMembers}
                        className="px-3.5 py-1.5 bg-brand-primary/10 group-hover:bg-brand-primary text-brand-primary group-hover:text-white border border-brand-primary/30 rounded-lg font-mono text-xs font-bold transition-all flex items-center gap-1 shrink-0"
                      >
                        Select <ArrowRight size={13} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* ── STEP 2: SELECT MEMBERS REQUIRING ACCOMMODATION ─────────────── */}
        {step === 2 && selectedTeam && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-brand-card/95 border border-brand-border p-6 sm:p-8 rounded-2xl shadow-2xl backdrop-blur-xl"
          >
            {/* Selected Team Header */}
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-brand-border">
              <div>
                <span className="font-mono text-xs text-brand-primary font-bold">{selectedTeam.teamCode}</span>
                <h2 className="font-display font-black text-2xl text-white mt-0.5">{selectedTeam.teamName}</h2>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="font-mono text-xs text-brand-muted hover:text-white underline"
              >
                Change Team
              </button>
            </div>

            <div className="mb-4">
              <h3 className="font-display font-bold text-base text-white">
                2. SELECT MEMBERS REQUIRING ACCOMMODATION
              </h3>
              <p className="font-mono text-xs text-brand-muted mt-0.5">
                Check all members requiring hostel accommodation for 9th October night (₹100 per member).
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center justify-between mb-3 text-xs font-mono">
              <span className="text-brand-muted">
                Selected: <strong className="text-white">{selectedMembers.length}</strong> / {(selectedTeam.members || []).length} members
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedMembers([...(selectedTeam.members || [])])}
                  className="text-brand-primary hover:underline"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedMembers([])}
                  className="text-brand-muted hover:text-white"
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* Members Checkbox List */}
            <div className="space-y-2.5 mb-6">
              {(selectedTeam.members || []).map((name, idx) => {
                const isSelected = selectedMembers.includes(name)
                return (
                  <div
                    key={name}
                    onClick={() => handleToggleMember(name)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-brand-primary/10 border-brand-primary/50 text-white'
                        : 'bg-brand-surface border-brand-border text-brand-muted hover:border-brand-border/80'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                          isSelected
                            ? 'bg-brand-primary border-brand-primary text-white'
                            : 'border-brand-border bg-black/40'
                        }`}
                      >
                        {isSelected && <Check size={13} strokeWidth={3} />}
                      </div>
                      <div>
                        <div className="font-mono text-xs font-bold text-white">
                          {name}
                        </div>
                        <div className="font-mono text-[10px] text-brand-muted">Member #{idx + 1}</div>
                      </div>
                    </div>
                    <div className="font-mono text-xs font-bold">
                      {isSelected ? <span className="text-emerald-400">₹100</span> : <span className="text-brand-muted">₹0</span>}
                    </div>
                  </div>
                )
              })}
            </div>

            {memberError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 font-mono text-xs mb-6 flex items-center gap-2">
                <AlertCircle size={15} /> {memberError}
              </div>
            )}

            {/* Dynamic Total Cost Card */}
            <div className="p-4 bg-brand-surface border border-brand-border rounded-xl flex items-center justify-between mb-6">
              <div>
                <div className="font-mono text-[10px] text-brand-muted uppercase">ACCOMMODATION RATE</div>
                <div className="font-mono text-xs text-white">₹100 / member × {selectedMembers.length} members</div>
              </div>
              <div className="text-right">
                <div className="font-mono text-[10px] text-brand-muted uppercase">TOTAL AMOUNT</div>
                <div className="font-display font-black text-2xl text-brand-primary">₹{totalAmount}</div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-3 px-5 rounded-xl border border-brand-border bg-brand-surface hover:bg-brand-card text-brand-muted hover:text-white font-mono text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <ArrowLeft size={14} /> BACK
              </button>

              <button
                type="button"
                onClick={handleProceedToReview}
                className="py-3 px-6 bg-brand-primary hover:bg-brand-primary/90 text-white font-mono text-xs font-bold rounded-xl shadow-glow-red transition-all flex items-center gap-1.5 cursor-pointer"
              >
                CONTINUE TO REVIEW <ArrowRight size={14} />
              </button>
            </div>
          </motion.div>
        )}

        {/* ── STEP 3: REVIEW / OVERVIEW PAGE ──────────────────────────────── */}
        {step === 3 && selectedTeam && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-brand-card/95 border border-brand-border p-6 sm:p-8 rounded-2xl shadow-2xl backdrop-blur-xl"
          >
            <div className="mb-6">
              <h2 className="font-display font-black text-xl text-white tracking-wide">
                3. REVIEW ACCOMMODATION REQUEST
              </h2>
              <p className="font-mono text-xs text-brand-muted mt-0.5">
                Please verify the accommodation details below before proceeding to payment.
              </p>
            </div>

            {/* Overview Summary Box */}
            <div className="p-6 bg-brand-surface border border-brand-border rounded-xl space-y-4 font-mono text-xs mb-6">
              <div className="flex justify-between items-center pb-3 border-b border-brand-border">
                <span className="text-brand-muted">Team Name:</span>
                <span className="text-white font-bold text-sm">{selectedTeam.teamName}</span>
              </div>

              <div className="flex justify-between items-center pb-3 border-b border-brand-border">
                <span className="text-brand-muted">Team Code / Registration ID:</span>
                <span className="text-brand-primary font-bold">{selectedTeam.teamCode}</span>
              </div>

              <div className="flex justify-between items-center pb-3 border-b border-brand-border">
                <span className="text-brand-muted">Registered Team Size:</span>
                <span className="text-white">{(selectedTeam.members || []).length} Members</span>
              </div>

              <div className="pb-3 border-b border-brand-border">
                <div className="text-brand-muted mb-2">Members Requesting Accommodation (9th Oct Night):</div>
                <div className="space-y-1.5 pl-3">
                  {selectedMembers.map(m => (
                    <div key={m} className="flex items-center gap-2 text-white">
                      <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                      <span>{m}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pb-3 border-b border-brand-border">
                <span className="text-brand-muted">Number of Members:</span>
                <span className="text-white font-bold">{selectedMembers.length} Members</span>
              </div>

              <div className="flex justify-between items-center pb-3 border-b border-brand-border">
                <span className="text-brand-muted">Accommodation Rate:</span>
                <span className="text-white">₹100 / member</span>
              </div>

              <div className="flex justify-between items-center pt-1">
                <span className="text-brand-muted font-bold">TOTAL AMOUNT TO PAY:</span>
                <span className="font-display font-black text-2xl text-brand-primary">₹{totalAmount}</span>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="py-3 px-5 rounded-xl border border-brand-border bg-brand-surface hover:bg-brand-card text-brand-muted hover:text-white font-mono text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <ArrowLeft size={14} /> EDIT MEMBERS
              </button>

              <button
                type="button"
                onClick={() => setStep(4)}
                className="py-3.5 px-6 bg-brand-primary hover:bg-brand-primary/90 text-white font-mono text-xs font-bold rounded-xl shadow-glow-red transition-all flex items-center gap-1.5 cursor-pointer"
              >
                CONFIRM DETAILS & CONTINUE <ArrowRight size={14} />
              </button>
            </div>
          </motion.div>
        )}

        {/* ── STEP 4: PAYMENT PAGE & SCREENSHOT UPLOAD ───────────────────── */}
        {step === 4 && selectedTeam && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-brand-card/95 border border-brand-border p-6 sm:p-8 rounded-2xl shadow-2xl backdrop-blur-xl"
          >
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="font-display font-black text-xl text-white tracking-wide">
                  4. ACCOMMODATION PAYMENT
                </h2>
                <p className="font-mono text-xs text-brand-muted mt-0.5">
                  Scan the official QR below, pay via any UPI app, and upload payment proof.
                </p>
              </div>
              <div className="text-right">
                <div className="font-mono text-[10px] text-brand-muted uppercase">AMOUNT TO PAY</div>
                <div className="font-display font-black text-3xl text-brand-primary">₹{totalAmount}</div>
                <div className="font-mono text-[10px] text-brand-muted">({selectedMembers.length} MEMBERS)</div>
              </div>
            </div>

            {/* QR + Payment Instructions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start mb-6">
              {/* QR Container (Using crisp pixelated rendering and natural aspect ratio) */}
              <div className="md:col-span-5 flex flex-col items-center justify-center p-4 bg-black/60 border border-brand-border rounded-xl">
                <div className="p-3 bg-white rounded-lg shadow-lg">
                  <img
                    src={EVENT_CONFIG.publicPaymentQrUrl}
                    alt="Official Payment QR Code"
                    style={{ imageRendering: 'pixelated' }}
                    className="w-56 sm:w-60 max-w-[250px] h-auto aspect-[909/854] object-contain block mx-auto"
                  />
                </div>

                <div className="mt-3 text-center">
                  <div className="font-mono text-xs text-white font-bold tracking-wider">
                    SCAN VIA ANY UPI APP
                  </div>
                  <div className="font-mono text-[10px] text-brand-muted mt-0.5">
                    GPay · PhonePe · Paytm · BHIM
                  </div>
                  <div className="font-mono text-[11px] text-brand-orange mt-2 bg-brand-orange/10 border border-brand-orange/30 px-2.5 py-1 rounded font-bold tracking-wide">
                    QR Name: {EVENT_CONFIG.paymentQRName}
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowQrModal(true)}
                    className="mt-2 text-[11px] font-mono text-cyan-400 hover:text-cyan-300 underline flex items-center justify-center gap-1 mx-auto"
                  >
                    <ExternalLink size={12} /> View Full-Size QR
                  </button>
                </div>
              </div>

              {/* Instructions & Steps */}
              <div className="md:col-span-7 space-y-3 font-mono text-xs text-brand-muted">
                <div className="font-display font-bold text-sm text-white mb-1 tracking-wider">
                  PAYMENT INSTRUCTIONS:
                </div>
                <ol className="space-y-2 list-decimal list-inside leading-relaxed">
                  <li>Scan the QR code with your UPI App.</li>
                  <li>
                    Pay exactly <strong className="text-brand-primary font-bold">₹{totalAmount}</strong> for {selectedMembers.length} members.
                  </li>
                  <li>Save the payment confirmation screenshot on your phone.</li>
                  <li>Upload the screenshot below (PNG, JPG, or WEBP, max 5 MB).</li>
                  <li>Enter the 12-digit numeric UPI Transaction ID (UTR reference).</li>
                </ol>

                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-300 text-[11px] mt-3">
                  <ShieldCheck size={14} className="inline mr-1" />
                  Your payment screenshot will be verified by the admin team.
                </div>
              </div>
            </div>

            {/* UPI ID Input */}
            <div className="mb-6">
              <label className="block font-mono text-xs text-white font-bold mb-2">
                UPI TRANSACTION ID / UTR NUMBER (12 DIGITS) <span className="text-brand-primary">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  maxLength={12}
                  value={upiId}
                  onChange={e => {
                    const digits = e.target.value.replace(/[^0-9]/g, '')
                    setUpiId(digits)
                    setSubmitError(null)
                  }}
                  placeholder="e.g. 427819384920"
                  className="w-full px-4 py-3 bg-brand-surface border border-brand-border focus:border-brand-primary rounded-xl text-white font-mono text-sm tracking-widest outline-none transition-all"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-mono text-xs text-brand-muted">
                  {upiId.length}/12
                </span>
              </div>
              <p className="font-mono text-[10px] text-brand-muted mt-1.5">
                Locate the 12-digit UTR or Transaction ID in your UPI payment receipt.
              </p>
            </div>

            {/* Payment Screenshot Upload */}
            <div className="mb-6">
              <label className="block font-mono text-xs text-white font-bold mb-2">
                PAYMENT SCREENSHOT <span className="text-brand-primary">*</span>
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={handleScreenshotChange}
                className="hidden"
                id="acc-screenshot-file"
              />

              {!screenshotPreview ? (
                <label
                  htmlFor="acc-screenshot-file"
                  className="w-full border-2 border-dashed border-brand-border hover:border-brand-primary/60 bg-brand-surface/70 hover:bg-brand-surface p-6 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all"
                >
                  <Upload size={28} className="text-brand-primary mb-2" />
                  <span className="font-mono text-xs text-white font-bold">CLICK TO UPLOAD SCREENSHOT</span>
                  <span className="font-mono text-[10px] text-brand-muted mt-1">
                    PNG, JPG, or WEBP (Max 5 MB)
                  </span>
                </label>
              ) : (
                <div className="p-4 bg-brand-surface border border-brand-border rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={screenshotPreview}
                      alt="Payment Preview"
                      className="w-14 h-14 object-cover rounded-lg border border-brand-border"
                    />
                    <div>
                      <div className="font-mono text-xs text-white font-bold truncate max-w-xs">{screenshotName}</div>
                      <div className="font-mono text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
                        <CheckCircle2 size={11} /> Screenshot ready
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setScreenshotData('')
                      setScreenshotPreview('')
                      setScreenshotName('')
                      if (fileInputRef.current) fileInputRef.current.value = ''
                    }}
                    className="font-mono text-xs text-red-400 hover:text-red-300 underline"
                  >
                    Remove
                  </button>
                </div>
              )}

              {screenshotError && (
                <p className="mt-2 text-xs text-red-400 font-mono flex items-center gap-1">
                  <AlertCircle size={13} /> {screenshotError}
                </p>
              )}
            </div>

            {/* Submit Error Banner */}
            {submitError && (
              <div className="p-3.5 bg-red-500/15 border border-red-500/50 rounded-xl text-xs text-red-300 font-mono mb-6 flex items-start gap-2">
                <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setStep(3)}
                disabled={isSubmitting}
                className="py-3 px-5 rounded-xl border border-brand-border bg-brand-surface hover:bg-brand-card text-brand-muted hover:text-white font-mono text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                <ArrowLeft size={14} /> BACK
              </button>

              <button
                type="button"
                onClick={handleSubmitAccommodation}
                disabled={isSubmitting || upiId.length !== 12 || !screenshotData}
                className="py-3.5 px-7 bg-brand-primary hover:bg-brand-primary/90 text-white font-mono text-xs font-bold rounded-xl shadow-glow-red transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw size={15} className="animate-spin" /> SUBMITTING REQUEST...
                  </>
                ) : (
                  <>
                    SUBMIT ACCOMMODATION REQUEST <ArrowRight size={14} />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* ── STEP 5: SUCCESS STATE ───────────────────────────────────────── */}
        {step === 5 && successResult && selectedTeam && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-brand-card/95 border border-emerald-500/50 p-8 sm:p-10 rounded-2xl shadow-2xl text-center backdrop-blur-xl"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-500/15 border border-emerald-500/40 rounded-full mb-5 shadow-[0_0_30px_rgba(16,185,129,0.25)]">
              <CheckCircle2 size={44} className="text-emerald-400" />
            </div>

            <h1 className="font-display font-black text-3xl sm:text-4xl text-white tracking-tight mb-2">
              ACCOMMODATION REQUEST <span className="text-emerald-400">RECEIVED</span>
            </h1>
            <p className="font-mono text-xs text-brand-muted max-w-md mx-auto mb-6">
              Your accommodation request for Sakthi HackFest '26 has been successfully registered.
            </p>

            {/* Request ID Highlight */}
            <div className="my-6 max-w-md mx-auto p-5 bg-brand-surface border border-brand-primary/60 rounded-xl shadow-[0_0_25px_rgba(255,59,48,0.2)]">
              <div className="font-mono text-[10px] text-brand-muted tracking-widest uppercase mb-1">
                ACCOMMODATION REQUEST ID
              </div>
              <div className="font-mono text-2xl sm:text-3xl font-black text-brand-primary tracking-widest">
                {successResult.accommodationId}
              </div>
            </div>

            {/* Summary Details */}
            <div className="max-w-md mx-auto bg-black/40 border border-brand-border rounded-xl p-4 text-left font-mono text-xs space-y-2 mb-6">
              <div className="flex justify-between">
                <span className="text-brand-muted">Team:</span>
                <span className="text-white font-bold">{selectedTeam.teamName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-muted">Team Code:</span>
                <span className="text-white">{selectedTeam.teamCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-muted">Accommodated Members:</span>
                <span className="text-white font-bold">{selectedMembers.length} Members</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-muted">Total Paid:</span>
                <span className="text-emerald-400 font-bold">₹{successResult.totalAmount}</span>
              </div>
            </div>

            <div className="p-4 bg-brand-surface border border-brand-border rounded-xl max-w-md mx-auto text-xs font-mono text-brand-muted leading-relaxed mb-6">
              A confirmation email has been dispatched to your registered team leader's email.
              Our team will verify the payment screenshot and contact you after verification.
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/"
                className="py-3 px-6 bg-brand-primary hover:bg-brand-primary/90 text-white font-mono text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-glow-red"
              >
                <Home size={15} /> BACK TO HOME
              </Link>
            </div>
          </motion.div>
        )}
      </div>

      {/* ── MODAL: FULL SIZE QR VIEW ────────────────────────────────────── */}
      <AnimatePresence>
        {showQrModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-2xl relative"
            >
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-brand-border">
                <h3 className="font-display font-bold text-white text-base">OFFICIAL PAYMENT QR</h3>
                <button
                  type="button"
                  onClick={() => setShowQrModal(false)}
                  className="font-mono text-xs text-brand-muted hover:text-white"
                >
                  Close [×]
                </button>
              </div>

              <div className="p-4 bg-white rounded-xl shadow-lg flex justify-center mb-4">
                <img
                  src={EVENT_CONFIG.publicPaymentQrUrl}
                  alt="Full-size Payment QR Code"
                  style={{ imageRendering: 'pixelated' }}
                  className="w-72 h-auto aspect-[909/854] object-contain"
                />
              </div>

              <div className="text-center font-mono text-xs text-brand-muted">
                <div className="text-white font-bold">{EVENT_CONFIG.paymentQRName}</div>
                <div className="text-[11px] mt-1 text-emerald-400">Scan directly or download image to your phone</div>
              </div>

              <div className="mt-4 flex justify-center">
                <a
                  href={EVENT_CONFIG.publicPaymentQrUrl}
                  download="Sakthi_HackFest_Payment_QR.png"
                  className="py-2 px-5 bg-brand-primary text-white text-xs font-mono font-bold rounded-xl"
                >
                  Download QR Image
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  )
}
