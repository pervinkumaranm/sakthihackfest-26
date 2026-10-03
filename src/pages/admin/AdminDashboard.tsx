import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LogOut, Search, Download, Check, X, Eye, RefreshCw,
  Users, CheckCircle, Clock, XCircle, Home,
  CreditCard, ExternalLink, AlertCircle, FileSpreadsheet,
  Mail, Trash2, Edit3, Filter, ChevronDown, Image as ImageIcon,
  Building, Phone, Calendar, UserCheck, ShieldAlert, FileText, CheckSquare,
  Trophy, Medal, Award, Timer, Flame, GraduationCap, Star, Sparkles, TrendingUp, BarChart3,
  Play, Pause, Square, RotateCcw, Megaphone, MonitorPlay, Plus, Bell, Volume2, Tv, Radio, Crown,
  QrCode
} from 'lucide-react'
import { apiService } from '../../services/api'
import ParticipantPass from '../../components/ParticipantPass'
import { timerService, type HackathonTimerState } from '../../services/timerService'
import { winnerService, type WinnerAnnouncementState, type WinnerTeamRecord } from '../../services/winnerService'
import type { StoredRegistration, AdminStats, PaymentStatus, RegistrationStatus } from '../../types'
import { HACKATHON_DOMAINS } from '../../../config/registrationSchema'
import { eventConfig } from '../../../config/eventConfig'

interface AdminDashboardProps {
  onLogout?: () => void
}

type TabType = 'dashboard' | 'registrations' | 'payments' | 'accommodation' | 'leaderboard' | 'timer'
type LeaderboardView = 'announcement' | 'teams' | 'colleges' | 'domains'

interface TeamEvaluation {
  score: number
  round?: string
  badge?: string
  feedback?: string
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  // Enforce noindex metadata on Admin Dashboard
  useEffect(() => {
    let meta = document.querySelector('meta[name="robots"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute('name', 'robots')
      document.head.appendChild(meta)
    }
    meta.setAttribute('content', 'noindex, nofollow')

    return () => {
      meta?.remove()
    }
  }, [])

  // Data & State
  const [registrations, setRegistrations] = useState<StoredRegistration[]>([])
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('dashboard')
  const [leaderboardSubView, setLeaderboardSubView] = useState<LeaderboardView>('teams')

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPayment, setFilterPayment] = useState<string>('ALL')
  const [filterRegStatus, setFilterRegStatus] = useState<string>('ALL')
  const [filterAccommodation, setFilterAccommodation] = useState<string>('ALL')
  const [filterTheme, setFilterTheme] = useState<string>('ALL')

  // Modals State
  const [selectedReg, setSelectedReg] = useState<StoredRegistration | null>(null)
  const [editingReg, setEditingReg] = useState<StoredRegistration | null>(null)
  const [deletingReg, setDeletingReg] = useState<StoredRegistration | null>(null)
  const [verifyingReg, setVerifyingReg] = useState<StoredRegistration | null>(null)
  const [passReg, setPassReg] = useState<StoredRegistration | null>(null)

  // Evaluation & Scoring State (stored locally per team)
  const [evaluations, setEvaluations] = useState<Record<string, TeamEvaluation>>(() => {
    try {
      const saved = localStorage.getItem('shf26_team_evaluations')
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })
  const [scoringReg, setScoringReg] = useState<StoredRegistration | null>(null)
  const [scoreInput, setScoreInput] = useState<number>(0)
  const [badgeInput, setBadgeInput] = useState<string>('Participating')
  const [roundInput, setRoundInput] = useState<string>('Round 1')

  // Action Loading States
  const [actionLoading, setActionLoading] = useState(false)
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Rejection Reason State
  const [rejectionReason, setRejectionReason] = useState('')

  // ── LIVE TIMER & COUNTDOWN STATE ──────────────────────────────────────────
  const [countdown, setCountdown] = useState(() => calculateCountdown())

  function calculateCountdown() {
    const startTarget = new Date(eventConfig.eventStartDateTime).getTime()
    const endTarget = new Date(eventConfig.eventEndDateTime).getTime()
    const now = Date.now()

    const isConcluded = now >= endTarget
    const isLive = now >= startTarget && !isConcluded
    const diff = Math.max(0, startTarget - now)

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
    const minutes = Math.floor((diff / 1000 / 60) % 60)
    const seconds = Math.floor((diff / 1000) % 60)

    const istString = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }).format(new Date())

    return { days, hours, minutes, seconds, isLive, isConcluded, istString }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(calculateCountdown())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // ── LIVE STAGE TIMER CONTROLLER STATE ────────────────────────────────────
  const [timerState, setTimerState] = useState<HackathonTimerState>(() => timerService.getState())
  const [timerPresetHours, setTimerPresetHours] = useState<number>(24)
  const [timerCustomMins, setTimerCustomMins] = useState<number>(0)
  const [announcementInput, setAnnouncementInput] = useState<string>('')
  const [confirmEndOpen, setConfirmEndOpen] = useState(false)

  // Subscribe to real-time timer sync
  useEffect(() => {
    const unsub = timerService.subscribe((state) => {
      setTimerState(state)
    })
    return unsub
  }, [])

  // Live timer tick for accurate UI display
  const [timerDisplay, setTimerDisplay] = useState({
    hours: 24,
    minutes: 0,
    seconds: 0,
    totalSeconds: 24 * 3600,
    percent: 100,
  })

  useEffect(() => {
    const update = () => {
      const state = timerService.getState()
      setTimerState(state)
      const now = Date.now()
      let remSec = 0

      if (state.status === 'RUNNING' && state.targetEndTime) {
        remSec = Math.max(0, Math.round((state.targetEndTime - now) / 1000))
      } else if (state.status === 'PAUSED') {
        remSec = Math.max(0, Math.round(state.remainingSeconds))
      } else if (state.status === 'ENDED') {
        remSec = 0
      } else {
        remSec = Math.max(0, Math.round(state.totalDurationSeconds))
      }

      const hours = Math.floor(remSec / 3600)
      const minutes = Math.floor((remSec % 3600) / 60)
      const seconds = remSec % 60
      const totalDur = state.totalDurationSeconds || 1
      const percent = Math.min(100, Math.max(0, (remSec / totalDur) * 100))

      setTimerDisplay({ hours, minutes, seconds, totalSeconds: remSec, percent })
    }

    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [timerState.status, timerState.targetEndTime, timerState.remainingSeconds])

  // Timer Controller Actions
  const handleStartTimer = (hours?: number, mins?: number) => {
    const totalSec = ((hours ?? timerPresetHours) * 3600) + ((mins ?? timerCustomMins) * 60)
    if (timerState.status === 'PAUSED') {
      timerService.resumeTimer()
      setActionFeedback({ type: 'success', message: 'Stage timer resumed.' })
    } else {
      timerService.startTimer(totalSec)
      setActionFeedback({ type: 'success', message: `Stage timer started for ${Math.round(totalSec / 3600)} hours.` })
    }
  }

  const handlePauseTimer = () => {
    timerService.pauseTimer()
    setActionFeedback({ type: 'success', message: 'Stage timer paused across all screens.' })
  }

  const handleResumeTimer = () => {
    timerService.resumeTimer()
    setActionFeedback({ type: 'success', message: 'Stage timer resumed.' })
  }

  const handleConfirmEndTimer = () => {
    timerService.endTimer()
    setConfirmEndOpen(false)
    setActionFeedback({ type: 'success', message: 'CODE FREEZE triggered! Stage timer ended.' })
  }

  const handleResetTimer = (hours = timerPresetHours) => {
    const totalSec = (hours * 3600) + (timerCustomMins * 60)
    timerService.resetTimer(totalSec)
    setActionFeedback({ type: 'success', message: 'Stage timer reset to ready state.' })
  }

  const handleAdjustTimer = (deltaSec: number, label: string) => {
    timerService.adjustTime(deltaSec)
    setActionFeedback({ type: 'success', message: `Timer adjusted: ${label}.` })
  }

  const handleBroadcastAnnouncement = () => {
    if (!announcementInput.trim()) return
    timerService.setAnnouncement(announcementInput.trim())
    setActionFeedback({ type: 'success', message: 'Stage announcement broadcasted to all projector screens.' })
  }

  const handleClearAnnouncement = () => {
    timerService.setAnnouncement('')
    setAnnouncementInput('')
    setActionFeedback({ type: 'success', message: 'Stage announcement cleared.' })
  }

  // ── WINNER ANNOUNCEMENT CONTROLLER STATE ─────────────────────────────────
  const [winnerState, setWinnerState] = useState<WinnerAnnouncementState>(() => winnerService.getState())
  const [confirmResetWinnerModal, setConfirmResetWinnerModal] = useState(false)

  // Synchronize winnerService
  useEffect(() => {
    const unsub = winnerService.subscribe((s) => {
      setWinnerState(s)
    })
    return unsub
  }, [])

  // Helper to convert registration to WinnerTeamRecord
  const regToWinner = (reg: StoredRegistration): WinnerTeamRecord => ({
    registrationId: reg.registrationId,
    teamName: reg.teamName,
    teamLeader: reg.leaderName,
    college: reg.leaderCollege || reg.college || 'Sree Sakthi Engineering College',
    domain: reg.selectedDomain || reg.selectedThemeName || 'General Track',
  })

  // Select Winner handlers
  const handleSelectFirstWinner = (regId: string) => {
    const target = registrations.find(r => r.registrationId === regId)
    const winner = target ? regToWinner(target) : null
    winnerService.setWinners(winner, winnerState.secondPlace, winnerState.thirdPlace)
    setActionFeedback({ type: 'success', message: `1st Prize Champion assigned to ${winner?.teamName || 'None'}.` })
  }

  const handleSelectSecondWinner = (regId: string) => {
    const target = registrations.find(r => r.registrationId === regId)
    const winner = target ? regToWinner(target) : null
    winnerService.setWinners(winnerState.firstPlace, winner, winnerState.thirdPlace)
    setActionFeedback({ type: 'success', message: `2nd Prize Winner assigned to ${winner?.teamName || 'None'}.` })
  }

  const handleSelectThirdWinner = (regId: string) => {
    const target = registrations.find(r => r.registrationId === regId)
    const winner = target ? regToWinner(target) : null
    winnerService.setWinners(winnerState.firstPlace, winnerState.secondPlace, winner)
    setActionFeedback({ type: 'success', message: `3rd Prize Winner assigned to ${winner?.teamName || 'None'}.` })
  }

  // Auto-fill top 3 winners from ranked list
  const handleAutoAssignTop3 = () => {
    if (rankedTeams.length === 0) {
      setActionFeedback({ type: 'error', message: 'No registered teams available to auto-assign.' })
      return
    }
    const first = rankedTeams[0] ? regToWinner(rankedTeams[0]) : null
    const second = rankedTeams[1] ? regToWinner(rankedTeams[1]) : null
    const third = rankedTeams[2] ? regToWinner(rankedTeams[2]) : null

    winnerService.setWinners(first, second, third)
    setActionFeedback({ type: 'success', message: 'Auto-assigned Top 3 ranked teams to 1st, 2nd, and 3rd Prizes.' })
  }

  // Step 1: Announce 3rd Prize
  const handleAnnounceThird = () => {
    if (!winnerState.thirdPlace) {
      setActionFeedback({ type: 'error', message: 'Please select a 3rd Prize Winner first.' })
      return
    }
    winnerService.announceThird()
    setActionFeedback({ type: 'success', message: `3rd Prize revealed on public screen: ${winnerState.thirdPlace.teamName}!` })
  }

  // Step 2: Complete 3rd Prize Distribution
  const handleCompleteThirdDistribution = () => {
    winnerService.completeThirdDistribution()
    setActionFeedback({ type: 'success', message: '3rd Prize distribution marked complete. Ready for 2nd Prize.' })
  }

  // Step 3: Announce 2nd Prize
  const handleAnnounceSecond = () => {
    if (!winnerState.secondPlace) {
      setActionFeedback({ type: 'error', message: 'Please select a 2nd Prize Winner first.' })
      return
    }
    winnerService.announceSecond()
    setActionFeedback({ type: 'success', message: `2nd Prize revealed on public screen: ${winnerState.secondPlace.teamName}!` })
  }

  // Step 4: Complete 2nd Prize Distribution
  const handleCompleteSecondDistribution = () => {
    winnerService.completeSecondDistribution()
    setActionFeedback({ type: 'success', message: '2nd Prize distribution marked complete. Ready for Grand Finale Countdown!' })
  }

  // Step 5: Start 5-Second Countdown
  const handleStartCountdown = () => {
    if (!winnerState.firstPlace) {
      setActionFeedback({ type: 'error', message: 'Please select a 1st Prize Champion before countdown.' })
      return
    }
    winnerService.startCountdown()
    setActionFeedback({ type: 'success', message: 'Dramatic 5-Second Countdown started on all screens!' })
  }

  // Step 6: Announce 1st Prize
  const handleAnnounceFirst = () => {
    if (!winnerState.firstPlace) {
      setActionFeedback({ type: 'error', message: 'Please select a 1st Prize Champion.' })
      return
    }
    winnerService.announceFirst()
    setActionFeedback({ type: 'success', message: `1st Prize revealed on public screen: ${winnerState.firstPlace.teamName}!` })
  }

  // Step 7: Complete Announcement & Show Full Podium
  const handleCompleteAnnouncement = () => {
    winnerService.completeAnnouncement()
    setActionFeedback({ type: 'success', message: 'Winner announcement completed. Full 3-podium layout active on public screen.' })
  }

  // Reset Announcement
  const handleResetAnnouncement = () => {
    winnerService.resetAnnouncement()
    setConfirmResetWinnerModal(false)
    setActionFeedback({ type: 'success', message: 'Winner announcement sequence reset to standby.' })
  }

  // Persist evaluations
  useEffect(() => {
    try {
      localStorage.setItem('shf26_team_evaluations', JSON.stringify(evaluations))
    } catch {
      // ignore
    }
  }, [evaluations])

  // Load Registrations from real backend
  const loadData = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true)
    else setLoading(true)
    setError(null)

    try {
      const res = await apiService.getRegistrations()
      if (res.error && res.registrations.length === 0) {
        setError(res.error)
      } else {
        setRegistrations(res.registrations)
        if (res.stats) {
          setStats(res.stats)
        } else {
          const list = res.registrations
          setStats({
            totalRegistrations: list.length,
            totalTeams: list.length,
            totalParticipants: list.reduce((sum, r) => sum + (r.teamSize || 2), 0),
            paymentSubmitted: list.filter(r => Boolean(r.upiTransactionId && r.upiTransactionId.length > 2)).length,
            paymentPending: list.filter(r => r.paymentStatus === 'PENDING').length,
            verifiedCount: list.filter(r => r.paymentStatus === 'VERIFIED').length,
            rejectedCount: list.filter(r => r.paymentStatus === 'REJECTED').length,
            accommodationCount: list.filter(r => r.accommodationRequired === 'Yes').length as any,
            emailSentCount: list.filter(r => r.emailStatus === 'SENT').length,
            emailFailedCount: list.filter(r => r.emailStatus === 'FAILED').length,
            dailyTrends: [],
          })
        }
      }
    } catch {
      setError('Unable to load registration data. Please try again.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Auto clear feedback message after 4s
  useEffect(() => {
    if (actionFeedback) {
      const t = setTimeout(() => setActionFeedback(null), 4000)
      return () => clearTimeout(t)
    }
  }, [actionFeedback])

  const handleLogout = () => {
    apiService.adminLogout()
    if (onLogout) {
      onLogout()
    } else {
      window.location.href = '/manage-registrations'
    }
  }

  // Filtered & Searched Registrations
  const filteredRegistrations = useMemo(() => {
    return registrations.filter(r => {
      if (activeTab === 'accommodation' && filterAccommodation === 'ALL') {
        if (r.accommodationRequired !== 'Yes') return false
      }

      // Search match
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim()
        const matchId = r.registrationId?.toLowerCase().includes(q)
        const matchTeam = r.teamName?.toLowerCase().includes(q)
        const matchLeader = r.leaderName?.toLowerCase().includes(q)
        const matchEmail = r.leaderEmail?.toLowerCase().includes(q)
        const matchCollege = r.leaderCollege?.toLowerCase().includes(q)
        const matchDept = r.leaderDepartment?.toLowerCase().includes(q)
        const matchPhone = r.leaderWhatsapp?.toLowerCase().includes(q)
        const matchUpi = r.upiTransactionId?.toLowerCase().includes(q)
        const matchMember = r.members?.some(
          m => m.name?.toLowerCase().includes(q) || m.college?.toLowerCase().includes(q) || m.email?.toLowerCase().includes(q)
        )

        if (!matchId && !matchTeam && !matchLeader && !matchEmail && !matchCollege && !matchDept && !matchPhone && !matchUpi && !matchMember) {
          return false
        }
      }

      // Filter by Payment Status
      if (filterPayment !== 'ALL') {
        if (filterPayment === 'SUBMITTED') {
          if (!r.upiTransactionId || r.upiTransactionId.length < 3) return false
        } else if (r.paymentStatus !== filterPayment) {
          return false
        }
      }

      // Filter by Registration Status
      if (filterRegStatus !== 'ALL') {
        if (filterRegStatus === 'REGISTERED') {
          if (r.registrationStatus !== 'CONFIRMED' && r.registrationStatus !== 'PENDING') return false
        } else if (r.registrationStatus !== filterRegStatus) {
          return false
        }
      }

      // Filter by Accommodation
      if (filterAccommodation !== 'ALL') {
        if (r.accommodationRequired !== filterAccommodation) return false
      }

      // Filter by Theme / Domain
      if (filterTheme !== 'ALL') {
        const domainMatch = r.selectedDomain === filterTheme
        const themeMatch = r.selectedTheme === filterTheme || r.selectedThemeName === filterTheme
        if (!domainMatch && !themeMatch) return false
      }

      return true
    })
  }, [registrations, searchTerm, filterPayment, filterRegStatus, filterAccommodation, filterTheme, activeTab])

  // Real Stats from current data
  const computedStats = useMemo(() => {
    const totalRegistrations = registrations.length
    const totalTeams = registrations.length
    const totalParticipants = registrations.reduce((sum, r) => sum + (r.teamSize || 2), 0)
    const paymentSubmitted = registrations.filter(r => Boolean(r.upiTransactionId && r.upiTransactionId.length > 2)).length
    const paymentPending = registrations.filter(r => r.paymentStatus === 'PENDING').length
    const verifiedCount = registrations.filter(r => r.paymentStatus === 'VERIFIED').length
    const rejectedCount = registrations.filter(r => r.paymentStatus === 'REJECTED').length
    const accommodationCount = registrations.filter(r => r.accommodationRequired === 'Yes').length

    return {
      totalRegistrations,
      totalTeams,
      totalParticipants,
      paymentSubmitted,
      paymentPending,
      verifiedCount,
      rejectedCount,
      accommodationCount,
    }
  }, [registrations])

  // ── LEADERBOARD CALCULATIONS ──────────────────────────────────────────────

  // 1. Ranked Teams Leaderboard
  const rankedTeams = useMemo(() => {
    const list = [...filteredRegistrations]
    return list.sort((a, b) => {
      const scoreA = evaluations[a.registrationId]?.score ?? -1
      const scoreB = evaluations[b.registrationId]?.score ?? -1

      if (scoreA !== scoreB) {
        return scoreB - scoreA // Higher score first
      }
      // Verified payment gets precedence
      if (a.paymentStatus === 'VERIFIED' && b.paymentStatus !== 'VERIFIED') return -1
      if (b.paymentStatus === 'VERIFIED' && a.paymentStatus !== 'VERIFIED') return 1

      // Otherwise chronological by registration ID / timestamp
      return (a.registrationId || '').localeCompare(b.registrationId || '')
    })
  }, [filteredRegistrations, evaluations])

  // 2. Ranked Colleges Leaderboard
  const collegeLeaderboard = useMemo(() => {
    const map: Record<string, { college: string; teams: number; participants: number; verified: number; domains: Record<string, number> }> = {}

    registrations.forEach(r => {
      const col = (r.leaderCollege || r.college || 'Independent / Other').trim()
      if (!map[col]) {
        map[col] = { college: col, teams: 0, participants: 0, verified: 0, domains: {} }
      }
      map[col].teams += 1
      map[col].participants += r.teamSize || 2
      if (r.paymentStatus === 'VERIFIED') {
        map[col].verified += 1
      }
      const dom = r.selectedDomain || r.selectedTheme || 'General'
      map[col].domains[dom] = (map[col].domains[dom] || 0) + 1
    })

    return Object.values(map).sort((a, b) => {
      if (b.teams !== a.teams) return b.teams - a.teams
      return b.participants - a.participants
    })
  }, [registrations])

  // 3. Ranked Domains Leaderboard
  const domainLeaderboard = useMemo(() => {
    const map: Record<string, number> = {}
    registrations.forEach(r => {
      const d = r.selectedDomain || r.selectedTheme || 'Open Innovation'
      map[d] = (map[d] || 0) + 1
    })
    const total = registrations.length || 1

    return Object.entries(map)
      .map(([domain, count]) => ({
        domain,
        count,
        percentage: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count)
  }, [registrations])

  // Payment Verification Handler
  const handleVerifyPayment = async (reg: StoredRegistration, status: PaymentStatus, reason = '') => {
    setActionLoading(true)
    const res = await apiService.updatePaymentStatus(reg.registrationId, status, reason)
    setActionLoading(false)

    if (res.success && res.data) {
      setRegistrations(prev =>
        prev.map(item => (item.registrationId === reg.registrationId ? { ...item, ...res.data } : item))
      )
      if (selectedReg?.registrationId === reg.registrationId) {
        setSelectedReg(prev => (prev ? { ...prev, ...res.data } : null))
      }
      setVerifyingReg(null)
      setRejectionReason('')
      setActionFeedback({
        type: 'success',
        message: `Payment status for ${reg.registrationId} set to ${status}.`,
      })
    } else {
      setActionFeedback({
        type: 'error',
        message: res.error || 'Unable to update payment status. Please try again.',
      })
    }
  }

  // Edit Registration Save Handler
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingReg) return

    setActionLoading(true)
    const res = await apiService.updateRegistration(editingReg.registrationId, editingReg)
    setActionLoading(false)

    if (res.success && res.data) {
      setRegistrations(prev =>
        prev.map(item => (item.registrationId === editingReg.registrationId ? { ...item, ...res.data } : item))
      )
      if (selectedReg?.registrationId === editingReg.registrationId) {
        setSelectedReg(res.data)
      }
      setEditingReg(null)
      setActionFeedback({
        type: 'success',
        message: `Registration ${editingReg.registrationId} updated successfully.`,
      })
    } else {
      setActionFeedback({
        type: 'error',
        message: res.error || 'Unable to update this registration. Please try again.',
      })
    }
  }

  // Delete Registration Handler
  const handleConfirmDelete = async () => {
    if (!deletingReg) return

    setActionLoading(true)
    const res = await apiService.deleteRegistration(deletingReg.registrationId)
    setActionLoading(false)

    if (res.success) {
      setRegistrations(prev => prev.filter(r => r.registrationId !== deletingReg.registrationId))
      if (selectedReg?.registrationId === deletingReg.registrationId) {
        setSelectedReg(null)
      }
      setDeletingReg(null)
      setActionFeedback({
        type: 'success',
        message: `Registration ${deletingReg.registrationId} permanently deleted.`,
      })
    } else {
      setActionFeedback({
        type: 'error',
        message: res.error || 'Unable to delete this registration. Please try again.',
      })
    }
  }

  // Resend Email Handler
  const handleResendEmail = async (regId: string) => {
    setActionLoading(true)
    const res = await apiService.resendConfirmationEmail(regId)
    setActionLoading(false)

    if (res.success) {
      setRegistrations(prev =>
        prev.map(r => (r.registrationId === regId ? { ...r, emailStatus: 'SENT', emailSentAt: new Date().toISOString() } : r))
      )
      if (selectedReg?.registrationId === regId) {
        setSelectedReg(prev => prev ? { ...prev, emailStatus: 'SENT', emailSentAt: new Date().toISOString() } : null)
      }
      setActionFeedback({ type: 'success', message: 'Confirmation email queued and delivered.' })
    } else {
      setActionFeedback({ type: 'error', message: res.error || 'Failed to resend confirmation email.' })
    }
  }

  // Save Team Score / Evaluation
  const handleSaveScore = (regId: string) => {
    setEvaluations(prev => ({
      ...prev,
      [regId]: {
        score: scoreInput,
        badge: badgeInput,
        round: roundInput,
      },
    }))
    setScoringReg(null)
    setActionFeedback({
      type: 'success',
      message: `Score of ${scoreInput} pts assigned to ${regId}. Leaderboard updated.`,
    })
  }

  const exportData = (format: 'xlsx' | 'csv') => {
    apiService.exportToSpreadsheet(filteredRegistrations, format)
  }

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text font-sans flex flex-col selection:bg-brand-primary selection:text-white">
      {/* ── HEADER ────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-brand-surface/95 border-b border-brand-border backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Branding */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-card border border-brand-border flex items-center justify-center text-brand-primary shadow-md">
                <CheckSquare className="w-5 h-5" />
              </div>
              <div>
                <div className="font-display font-black text-base sm:text-lg tracking-wider text-white">
                  SAKTHI <span className="text-brand-primary">HACKFEST</span> '26
                </div>
                <div className="font-mono text-[10px] sm:text-[11px] text-brand-muted tracking-widest uppercase">
                  ADMINISTRATION CONSOLE
                </div>
              </div>
            </div>

            {/* Navigation Tabs (Desktop) */}
            <nav className="hidden md:flex items-center gap-1 bg-brand-card/80 p-1.5 rounded-xl border border-brand-border">
              <button
                onClick={() => { setActiveTab('dashboard'); setFilterPayment('ALL'); setFilterAccommodation('ALL'); }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold tracking-wider transition-all flex items-center gap-1.5 ${
                  activeTab === 'dashboard' ? 'bg-brand-primary text-white shadow-glow-red' : 'text-brand-muted hover:text-white'
                }`}
              >
                DASHBOARD
              </button>
              <button
                onClick={() => { setActiveTab('registrations'); setFilterPayment('ALL'); setFilterAccommodation('ALL'); }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold tracking-wider transition-all flex items-center gap-1.5 ${
                  activeTab === 'registrations' ? 'bg-brand-primary text-white shadow-glow-red' : 'text-brand-muted hover:text-white'
                }`}
              >
                REGISTRATIONS
              </button>
              <button
                onClick={() => { setActiveTab('payments'); setFilterPayment('PENDING'); }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold tracking-wider transition-all flex items-center gap-1.5 ${
                  activeTab === 'payments' ? 'bg-brand-primary text-white shadow-glow-red' : 'text-brand-muted hover:text-white'
                }`}
              >
                PAYMENT STATUS
              </button>
              <button
                onClick={() => { setActiveTab('accommodation'); setFilterAccommodation('Yes'); }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold tracking-wider transition-all flex items-center gap-1.5 ${
                  activeTab === 'accommodation' ? 'bg-brand-primary text-white shadow-glow-red' : 'text-brand-muted hover:text-white'
                }`}
              >
                ACCOMMODATION
              </button>
              <button
                onClick={() => { setActiveTab('leaderboard'); }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold tracking-wider transition-all flex items-center gap-1.5 ${
                  activeTab === 'leaderboard' ? 'bg-brand-primary text-white shadow-glow-red' : 'text-brand-muted hover:text-white'
                }`}
              >
                <Trophy size={13} className="text-yellow-400" />
                LEADERBOARD
              </button>
              <button
                onClick={() => { setActiveTab('timer'); }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold tracking-wider transition-all flex items-center gap-1.5 ${
                  activeTab === 'timer' ? 'bg-brand-primary text-white shadow-glow-red' : 'text-brand-muted hover:text-white'
                }`}
              >
                <Timer size={13} className={timerState.status === 'RUNNING' ? 'text-green-400 animate-pulse' : 'text-brand-orange'} />
                STAGE TIMER
                {timerState.status === 'RUNNING' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping inline-block" />
                )}
              </button>
            </nav>

            {/* Top Actions: Refresh & Logout */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => loadData(true)}
                disabled={loading || refreshing}
                title="Refresh Real Google Sheet Data"
                className="p-2 sm:px-3 sm:py-2 rounded-xl border border-brand-border bg-brand-card hover:bg-brand-surface text-brand-muted hover:text-white transition-all text-xs font-mono flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw size={15} className={refreshing ? 'animate-spin text-brand-primary' : ''} />
                <span className="hidden sm:inline">SYNC</span>
              </button>

              <button
                onClick={handleLogout}
                title="Secure Sign Out"
                className="px-3 py-2 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all text-xs font-mono font-semibold flex items-center gap-1.5"
              >
                <LogOut size={15} />
                <span className="hidden sm:inline">LOGOUT</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs (Mobile) */}
          <div className="flex md:hidden overflow-x-auto py-2.5 gap-2 border-t border-brand-border/60 scrollbar-none">
            <button
              onClick={() => { setActiveTab('dashboard'); setFilterPayment('ALL'); setFilterAccommodation('ALL'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap font-medium ${
                activeTab === 'dashboard' ? 'bg-brand-primary text-white' : 'bg-brand-card text-brand-muted'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => { setActiveTab('registrations'); setFilterPayment('ALL'); setFilterAccommodation('ALL'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap font-medium ${
                activeTab === 'registrations' ? 'bg-brand-primary text-white' : 'bg-brand-card text-brand-muted'
              }`}
            >
              Registrations
            </button>
            <button
              onClick={() => { setActiveTab('payments'); setFilterPayment('PENDING'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap font-medium ${
                activeTab === 'payments' ? 'bg-brand-primary text-white' : 'bg-brand-card text-brand-muted'
              }`}
            >
              Payments
            </button>
            <button
              onClick={() => { setActiveTab('accommodation'); setFilterAccommodation('Yes'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap font-medium ${
                activeTab === 'accommodation' ? 'bg-brand-primary text-white' : 'bg-brand-card text-brand-muted'
              }`}
            >
              Accommodation
            </button>
            <button
              onClick={() => { setActiveTab('leaderboard'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap font-medium flex items-center gap-1 ${
                activeTab === 'leaderboard' ? 'bg-brand-primary text-white' : 'bg-brand-card text-brand-muted'
              }`}
            >
              <Trophy size={12} className="text-yellow-400" /> Leaderboard
            </button>
            <button
              onClick={() => { setActiveTab('timer'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap font-medium flex items-center gap-1 ${
                activeTab === 'timer' ? 'bg-brand-primary text-white' : 'bg-brand-card text-brand-muted'
              }`}
            >
              <Timer size={12} className={timerState.status === 'RUNNING' ? 'text-green-400 animate-pulse' : 'text-brand-orange'} />
              Stage Timer
              {timerState.status === 'RUNNING' && (
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping inline-block" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ── FEEDBACK TOAST ALERTS ────────────────────────────────────────── */}
      <AnimatePresence>
        {actionFeedback && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-20 right-4 z-50 p-4 rounded-xl shadow-2xl border text-xs sm:text-sm font-mono flex items-center gap-2 max-w-md ${
              actionFeedback.type === 'success'
                ? 'bg-green-950/95 border-green-500/40 text-green-300'
                : 'bg-red-950/95 border-red-500/40 text-red-300'
            }`}
          >
            {actionFeedback.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span>{actionFeedback.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MAIN CONTENT AREA ────────────────────────────────────────────── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Error Banner */}
        {error && (
          <div className="p-4 rounded-xl border border-red-500/40 bg-red-500/10 text-red-400 text-sm flex items-start gap-3">
            <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-bold font-mono">CONNECTION ALERT</div>
              <div>{error}</div>
            </div>
            <button
              onClick={() => loadData()}
              className="px-3 py-1 rounded bg-red-500/20 hover:bg-red-500/30 text-xs font-mono uppercase"
            >
              Retry
            </button>
          </div>
        )}

        {/* ── SECTION: LIVE HACKATHON COUNTDOWN TIMER (Requested Feature) ─────── */}
        <section className="relative overflow-hidden rounded-2xl border border-brand-border bg-gradient-to-r from-brand-surface via-brand-card to-brand-surface p-5 sm:p-6 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="relative z-10 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6">
            {/* Left: Event Status & Live Clock */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/15 text-red-400 border border-red-500/30 font-mono text-[11px] font-bold tracking-wider uppercase">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block" />
                  {countdown.isLive ? 'HACKATHON IS LIVE NOW' : countdown.isConcluded ? 'EVENT CONCLUDED' : 'HACKATHON COUNTDOWN'}
                </span>
                <span className="text-brand-muted text-xs font-mono">
                  LIVE CLOCK: <strong className="text-white">{countdown.istString} IST</strong>
                </span>
              </div>

              <h2 className="font-display font-black text-xl sm:text-2xl text-white tracking-wide">
                SAKTHI HACKFEST '26 <span className="text-brand-primary">24-HOUR NATIONAL HACKATHON</span>
              </h2>

              <p className="text-xs text-brand-muted font-mono flex items-center gap-2">
                <Calendar size={13} className="text-brand-orange" />
                <span>Event Date: <strong>October 10–11, 2026</strong></span>
                <span>·</span>
                <span>Registration Deadline: <strong>{eventConfig.registrationDeadline}</strong></span>
              </p>

              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <button
                  onClick={() => setActiveTab('timer')}
                  className="px-3 py-1.5 rounded-lg bg-brand-primary/20 hover:bg-brand-primary/30 text-brand-primary border border-brand-primary/40 font-mono text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <Timer size={14} className={timerState.status === 'RUNNING' ? 'text-green-400 animate-pulse' : ''} />
                  STAGE TIMER CONTROLLER
                </button>
                <a
                  href="/timer"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/30 font-mono text-xs font-bold flex items-center gap-1.5 transition-all"
                  title="Open live stage projector timer screen in a separate window"
                >
                  <MonitorPlay size={14} />
                  PROJECTOR SCREEN ↗
                </a>
              </div>
            </div>

            {/* Right: Live Countdown Cards */}
            <div className="flex items-center gap-2 sm:gap-3 self-center lg:self-auto">
              {/* Days */}
              <div className="flex flex-col items-center justify-center w-16 sm:w-20 h-16 sm:h-20 rounded-xl bg-brand-surface border border-brand-primary/40 shadow-glow-red">
                <span className="font-display font-black text-2xl sm:text-3xl text-white">
                  {String(countdown.days).padStart(2, '0')}
                </span>
                <span className="font-mono text-[9px] sm:text-[10px] text-brand-primary font-bold uppercase tracking-wider">
                  DAYS
                </span>
              </div>

              <span className="font-display font-bold text-xl text-brand-primary">:</span>

              {/* Hours */}
              <div className="flex flex-col items-center justify-center w-16 sm:w-20 h-16 sm:h-20 rounded-xl bg-brand-surface border border-brand-primary/40 shadow-glow-red">
                <span className="font-display font-black text-2xl sm:text-3xl text-white">
                  {String(countdown.hours).padStart(2, '0')}
                </span>
                <span className="font-mono text-[9px] sm:text-[10px] text-brand-primary font-bold uppercase tracking-wider">
                  HOURS
                </span>
              </div>

              <span className="font-display font-bold text-xl text-brand-primary">:</span>

              {/* Minutes */}
              <div className="flex flex-col items-center justify-center w-16 sm:w-20 h-16 sm:h-20 rounded-xl bg-brand-surface border border-brand-primary/40 shadow-glow-red">
                <span className="font-display font-black text-2xl sm:text-3xl text-white">
                  {String(countdown.minutes).padStart(2, '0')}
                </span>
                <span className="font-mono text-[9px] sm:text-[10px] text-brand-primary font-bold uppercase tracking-wider">
                  MINS
                </span>
              </div>

              <span className="font-display font-bold text-xl text-brand-primary">:</span>

              {/* Seconds */}
              <div className="flex flex-col items-center justify-center w-16 sm:w-20 h-16 sm:h-20 rounded-xl bg-brand-surface border border-brand-orange/40 shadow-lg">
                <span className="font-display font-black text-2xl sm:text-3xl text-brand-orange animate-pulse">
                  {String(countdown.seconds).padStart(2, '0')}
                </span>
                <span className="font-mono text-[9px] sm:text-[10px] text-brand-orange font-bold uppercase tracking-wider">
                  SECS
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── VIEW: DEDICATED LEADERBOARD TAB ──────────────────────────────── */}
        {activeTab === 'leaderboard' ? (
          <section className="space-y-6">
            {/* Leaderboard Top Header & Sub-Tabs */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-brand-surface border border-brand-border p-5 rounded-2xl">
              <div>
                <div className="flex items-center gap-2">
                  <Trophy className="text-yellow-400 w-6 h-6" />
                  <h2 className="font-display font-black text-xl text-white tracking-wide">
                    HACKATHON LEADERBOARD & EVALUATIONS
                  </h2>
                </div>
                <p className="text-xs text-brand-muted font-mono mt-1">
                  Rankings dynamically calculated from real registration data, payment verification, and evaluation marks.
                </p>
              </div>

              {/* Sub-view switcher */}
              <div className="flex items-center gap-1.5 bg-brand-card p-1 rounded-xl border border-brand-border flex-wrap">
                <button
                  onClick={() => setLeaderboardSubView('announcement')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-1.5 ${
                    leaderboardSubView === 'announcement' ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold shadow-lg' : 'text-yellow-400 hover:text-white'
                  }`}
                >
                  <Crown size={13} />
                  WINNER REVEAL
                </button>
                <button
                  onClick={() => setLeaderboardSubView('teams')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                    leaderboardSubView === 'teams' ? 'bg-brand-primary text-white' : 'text-brand-muted hover:text-white'
                  }`}
                >
                  Teams Rank
                </button>
                <button
                  onClick={() => setLeaderboardSubView('colleges')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                    leaderboardSubView === 'colleges' ? 'bg-brand-primary text-white' : 'text-brand-muted hover:text-white'
                  }`}
                >
                  Top Colleges
                </button>
                <button
                  onClick={() => setLeaderboardSubView('domains')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                    leaderboardSubView === 'domains' ? 'bg-brand-primary text-white' : 'text-brand-muted hover:text-white'
                  }`}
                >
                  Tracks
                </button>
              </div>
            </div>

            {/* SUB-VIEW 0: WINNER ANNOUNCEMENT CONTROLLER */}
            {leaderboardSubView === 'announcement' && (
              <div className="space-y-6">
                {/* Controller Header & Public Link */}
                <div className="bg-brand-surface border border-brand-border rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Crown className="w-5 h-5 text-yellow-400" />
                      <h3 className="font-display font-black text-lg sm:text-xl text-white tracking-wide">
                        WINNER ANNOUNCEMENT CONTROLLER
                      </h3>
                    </div>
                    <p className="text-xs text-brand-muted font-mono leading-relaxed">
                      Controls the live sequential reveal on the public screen (<code className="text-yellow-400">/leaderboard</code>). Sequence must happen in strict order: 3rd → Prize Distribution → 2nd → Prize Distribution → Countdown → 1st.
                    </p>
                  </div>

                  {/* Public Link & Current Stage Badge */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="px-3 py-1.5 rounded-xl bg-brand-card border border-brand-border font-mono text-xs flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        winnerState.stage === 'COMPLETED' ? 'bg-emerald-400' :
                        winnerState.stage.includes('FIRST') ? 'bg-yellow-400 animate-pulse' :
                        winnerState.stage.includes('COUNTDOWN') ? 'bg-red-500 animate-ping' :
                        winnerState.stage.includes('SECOND') ? 'bg-slate-300 animate-pulse' :
                        winnerState.stage.includes('THIRD') ? 'bg-amber-500 animate-pulse' :
                        'bg-brand-muted'
                      }`} />
                      <span className="text-brand-muted">STAGE:</span>
                      <strong className="text-white">
                        {winnerState.stage === 'NOT_STARTED' ? 'STANDBY (NOT STARTED)' :
                         winnerState.stage === 'THIRD_ANNOUNCED' ? '3RD PRIZE REVEALED' :
                         winnerState.stage === 'THIRD_DISTRIBUTION_COMPLETE' ? '3RD PRIZE DISTRIBUTION' :
                         winnerState.stage === 'SECOND_ANNOUNCED' ? '2ND PRIZE REVEALED' :
                         winnerState.stage === 'SECOND_DISTRIBUTION_COMPLETE' ? '2ND PRIZE DISTRIBUTION' :
                         winnerState.stage === 'COUNTDOWN_RUNNING' ? '5S COUNTDOWN RUNNING' :
                         winnerState.stage === 'FIRST_ANNOUNCED' ? '1ST PRIZE CHAMPIONS REVEALED' :
                         'ALL WINNERS COMPLETED'}
                      </strong>
                    </div>

                    <a
                      href="/leaderboard"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-mono text-xs font-bold flex items-center gap-2 shadow-lg transition-all"
                    >
                      <MonitorPlay size={15} />
                      OPEN PUBLIC STAGE SCREEN ↗
                    </a>
                  </div>
                </div>

                {/* Selected Winners Configuration (From Real Registration Data Only) */}
                <div className="bg-brand-surface border border-brand-border rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-brand-border/60 pb-3">
                    <div>
                      <div className="font-mono text-xs text-white font-bold uppercase tracking-wider flex items-center gap-2">
                        <Trophy size={15} className="text-brand-orange" />
                        SELECT OFFICIAL WINNERS (FROM ACTUAL REGISTRATION TEAMS)
                      </div>
                      <p className="text-[11px] text-brand-muted font-mono mt-0.5">
                        Winners are linked directly to live Google Sheet records. No fake names allowed.
                      </p>
                    </div>

                    <button
                      onClick={handleAutoAssignTop3}
                      className="px-3.5 py-1.5 rounded-xl border border-brand-primary/40 bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary font-mono text-xs font-semibold flex items-center gap-1.5 transition-all"
                    >
                      <Sparkles size={13} />
                      Auto-Assign from Top 3 Ranked
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                    {/* 🥉 3RD PRIZE SELECTION */}
                    <div className="p-4 rounded-xl bg-brand-card border border-amber-600/40 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-mono text-xs text-amber-400 font-bold uppercase">
                          <span>🥉 3RD PRIZE</span>
                          <span className="text-[10px] text-brand-muted">(₹10,000)</span>
                        </div>
                        {winnerState.thirdPlace && (
                          <span className="text-[10px] font-mono text-green-400 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">
                            Selected
                          </span>
                        )}
                      </div>

                      <select
                        value={winnerState.thirdPlace?.registrationId || ''}
                        onChange={e => handleSelectThirdWinner(e.target.value)}
                        className="w-full bg-brand-surface border border-brand-border rounded-lg text-white text-xs px-3 py-2.5 font-mono focus:outline-none focus:border-amber-500 truncate"
                      >
                        <option value="">-- Choose 3rd Prize Team --</option>
                        {registrations.map(r => (
                          <option key={r.registrationId} value={r.registrationId}>
                            {r.teamName} ({r.registrationId} - {r.leaderName})
                          </option>
                        ))}
                      </select>

                      {winnerState.thirdPlace ? (
                        <div className="p-3 rounded-lg bg-black/40 border border-amber-500/20 text-xs font-mono space-y-1">
                          <div className="font-bold text-white text-sm truncate">{winnerState.thirdPlace.teamName}</div>
                          <div className="text-[11px] text-brand-muted truncate">Leader: {winnerState.thirdPlace.teamLeader}</div>
                          <div className="text-[10px] text-amber-400 truncate">{winnerState.thirdPlace.college}</div>
                        </div>
                      ) : (
                        <div className="text-[11px] text-brand-muted font-mono italic">No team selected yet</div>
                      )}
                    </div>

                    {/* 🥈 2ND PRIZE SELECTION */}
                    <div className="p-4 rounded-xl bg-brand-card border border-slate-300/40 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-mono text-xs text-slate-300 font-bold uppercase">
                          <span>🥈 2ND PRIZE</span>
                          <span className="text-[10px] text-brand-muted">(₹15,000)</span>
                        </div>
                        {winnerState.secondPlace && (
                          <span className="text-[10px] font-mono text-green-400 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">
                            Selected
                          </span>
                        )}
                      </div>

                      <select
                        value={winnerState.secondPlace?.registrationId || ''}
                        onChange={e => handleSelectSecondWinner(e.target.value)}
                        className="w-full bg-brand-surface border border-brand-border rounded-lg text-white text-xs px-3 py-2.5 font-mono focus:outline-none focus:border-slate-400 truncate"
                      >
                        <option value="">-- Choose 2nd Prize Team --</option>
                        {registrations.map(r => (
                          <option key={r.registrationId} value={r.registrationId}>
                            {r.teamName} ({r.registrationId} - {r.leaderName})
                          </option>
                        ))}
                      </select>

                      {winnerState.secondPlace ? (
                        <div className="p-3 rounded-lg bg-black/40 border border-slate-400/20 text-xs font-mono space-y-1">
                          <div className="font-bold text-white text-sm truncate">{winnerState.secondPlace.teamName}</div>
                          <div className="text-[11px] text-brand-muted truncate">Leader: {winnerState.secondPlace.teamLeader}</div>
                          <div className="text-[10px] text-slate-300 truncate">{winnerState.secondPlace.college}</div>
                        </div>
                      ) : (
                        <div className="text-[11px] text-brand-muted font-mono italic">No team selected yet</div>
                      )}
                    </div>

                    {/* 🥇 1ST PRIZE SELECTION */}
                    <div className="p-4 rounded-xl bg-brand-card border border-yellow-400/50 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-mono text-xs text-yellow-300 font-bold uppercase">
                          <span>🥇 1ST PRIZE CHAMPIONS</span>
                          <span className="text-[10px] text-brand-muted">(₹25,000)</span>
                        </div>
                        {winnerState.firstPlace && (
                          <span className="text-[10px] font-mono text-green-400 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">
                            Selected
                          </span>
                        )}
                      </div>

                      <select
                        value={winnerState.firstPlace?.registrationId || ''}
                        onChange={e => handleSelectFirstWinner(e.target.value)}
                        className="w-full bg-brand-surface border border-brand-border rounded-lg text-white text-xs px-3 py-2.5 font-mono focus:outline-none focus:border-yellow-400 truncate"
                      >
                        <option value="">-- Choose 1st Prize Champion --</option>
                        {registrations.map(r => (
                          <option key={r.registrationId} value={r.registrationId}>
                            {r.teamName} ({r.registrationId} - {r.leaderName})
                          </option>
                        ))}
                      </select>

                      {winnerState.firstPlace ? (
                        <div className="p-3 rounded-lg bg-black/40 border border-yellow-400/20 text-xs font-mono space-y-1">
                          <div className="font-bold text-white text-sm truncate">{winnerState.firstPlace.teamName}</div>
                          <div className="text-[11px] text-brand-muted truncate">Leader: {winnerState.firstPlace.teamLeader}</div>
                          <div className="text-[10px] text-yellow-300 truncate">{winnerState.firstPlace.college}</div>
                        </div>
                      ) : (
                        <div className="text-[11px] text-brand-muted font-mono italic">No team selected yet</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sequential Stage Control Buttons */}
                <div className="bg-brand-surface border border-brand-border rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="font-mono text-xs text-brand-primary font-bold uppercase tracking-wider">
                      LIVE ANNOUNCEMENT STEP-BY-STEP CONTROLS
                    </div>
                    <div className="font-mono text-[11px] text-brand-muted">
                      Order: 3rd → Distribution → 2nd → Distribution → Countdown → 1st
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    {/* BUTTON 1: ANNOUNCE 3RD PRIZE */}
                    <button
                      onClick={handleAnnounceThird}
                      disabled={winnerState.stage !== 'NOT_STARTED' || !winnerState.thirdPlace}
                      className={`p-4 rounded-xl font-mono text-xs font-bold flex flex-col items-center justify-center gap-1.5 text-center transition-all ${
                        winnerState.stage === 'NOT_STARTED' && winnerState.thirdPlace
                          ? 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white shadow-lg active:scale-95'
                          : 'bg-brand-card/40 border border-brand-border text-brand-muted opacity-40 cursor-not-allowed'
                      }`}
                    >
                      <span className="text-2xl">🥉</span>
                      <span>1. ANNOUNCE 3RD PRIZE</span>
                      <span className="text-[10px] font-normal text-amber-200">Reveals 3rd Winner Only</span>
                    </button>

                    {/* BUTTON 2: 3RD PRIZE DISTRIBUTION COMPLETE */}
                    <button
                      onClick={handleCompleteThirdDistribution}
                      disabled={winnerState.stage !== 'THIRD_ANNOUNCED'}
                      className={`p-4 rounded-xl font-mono text-xs font-bold flex flex-col items-center justify-center gap-1.5 text-center transition-all ${
                        winnerState.stage === 'THIRD_ANNOUNCED'
                          ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg active:scale-95 animate-pulse'
                          : 'bg-brand-card/40 border border-brand-border text-brand-muted opacity-40 cursor-not-allowed'
                      }`}
                    >
                      <CheckCircle size={24} className="text-amber-300" />
                      <span>2. PRIZE DISTRIBUTION COMPLETE</span>
                      <span className="text-[10px] font-normal text-amber-200">Allows moving to 2nd</span>
                    </button>

                    {/* BUTTON 3: ANNOUNCE 2ND PRIZE */}
                    <button
                      onClick={handleAnnounceSecond}
                      disabled={winnerState.stage !== 'THIRD_DISTRIBUTION_COMPLETE' || !winnerState.secondPlace}
                      className={`p-4 rounded-xl font-mono text-xs font-bold flex flex-col items-center justify-center gap-1.5 text-center transition-all ${
                        winnerState.stage === 'THIRD_DISTRIBUTION_COMPLETE' && winnerState.secondPlace
                          ? 'bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-400 hover:to-slate-500 text-white shadow-lg active:scale-95'
                          : 'bg-brand-card/40 border border-brand-border text-brand-muted opacity-40 cursor-not-allowed'
                      }`}
                    >
                      <span className="text-2xl">🥈</span>
                      <span>3. ANNOUNCE 2ND PRIZE</span>
                      <span className="text-[10px] font-normal text-slate-200">Reveals 2nd Winner Only</span>
                    </button>

                    {/* BUTTON 4: 2ND PRIZE DISTRIBUTION COMPLETE */}
                    <button
                      onClick={handleCompleteSecondDistribution}
                      disabled={winnerState.stage !== 'SECOND_ANNOUNCED'}
                      className={`p-4 rounded-xl font-mono text-xs font-bold flex flex-col items-center justify-center gap-1.5 text-center transition-all ${
                        winnerState.stage === 'SECOND_ANNOUNCED'
                          ? 'bg-slate-600 hover:bg-slate-500 text-white shadow-lg active:scale-95 animate-pulse'
                          : 'bg-brand-card/40 border border-brand-border text-brand-muted opacity-40 cursor-not-allowed'
                      }`}
                    >
                      <CheckCircle size={24} className="text-slate-300" />
                      <span>4. PRIZE DISTRIBUTION COMPLETE</span>
                      <span className="text-[10px] font-normal text-slate-200">Enables 5s Countdown</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-2 border-t border-brand-border/60">
                    {/* BUTTON 5: START 5 SECOND COUNTDOWN */}
                    <button
                      onClick={handleStartCountdown}
                      disabled={winnerState.stage !== 'SECOND_DISTRIBUTION_COMPLETE' || !winnerState.firstPlace}
                      className={`p-4 rounded-xl font-mono text-xs font-bold flex flex-col items-center justify-center gap-1.5 text-center transition-all ${
                        winnerState.stage === 'SECOND_DISTRIBUTION_COMPLETE' && winnerState.firstPlace
                          ? 'bg-gradient-to-r from-red-600 to-brand-primary hover:from-red-500 hover:to-brand-primaryLight text-white shadow-glow-red active:scale-95 animate-pulse'
                          : 'bg-brand-card/40 border border-brand-border text-brand-muted opacity-40 cursor-not-allowed'
                      }`}
                    >
                      <Clock size={24} className="text-red-300" />
                      <span>5. START 5 SECOND COUNTDOWN</span>
                      <span className="text-[10px] font-normal text-red-200">Dramatic 5..4..3..2..1</span>
                    </button>

                    {/* BUTTON 6: 1ST PRIZE REVEAL (CHAMPIONS) */}
                    <button
                      onClick={handleAnnounceFirst}
                      disabled={winnerState.stage !== 'COUNTDOWN_RUNNING' && winnerState.stage !== 'SECOND_DISTRIBUTION_COMPLETE'}
                      className={`p-4 rounded-xl font-mono text-xs font-bold flex flex-col items-center justify-center gap-1.5 text-center transition-all ${
                        winnerState.stage === 'COUNTDOWN_RUNNING'
                          ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-black shadow-lg shadow-yellow-500/30'
                          : 'bg-brand-card/40 border border-brand-border text-brand-muted opacity-40 cursor-not-allowed'
                      }`}
                    >
                      <Crown size={24} className="text-yellow-400" />
                      <span>6. ANNOUNCE 1ST PRIZE</span>
                      <span className="text-[10px] font-normal text-yellow-900">Grand Finale Reveal</span>
                    </button>

                    {/* BUTTON 7: COMPLETE & SHOW PODIUM */}
                    <button
                      onClick={handleCompleteAnnouncement}
                      disabled={winnerState.stage !== 'FIRST_ANNOUNCED'}
                      className={`p-4 rounded-xl font-mono text-xs font-bold flex flex-col items-center justify-center gap-1.5 text-center transition-all ${
                        winnerState.stage === 'FIRST_ANNOUNCED'
                          ? 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white shadow-lg active:scale-95'
                          : 'bg-brand-card/40 border border-brand-border text-brand-muted opacity-40 cursor-not-allowed'
                      }`}
                    >
                      <Trophy size={24} className="text-yellow-300" />
                      <span>7. COMPLETE & SHOW PODIUM</span>
                      <span className="text-[10px] font-normal text-green-200">Official 3-Winner Stage</span>
                    </button>
                  </div>

                  {/* Safety Reset Button */}
                  <div className="pt-2 border-t border-brand-border/60 flex items-center justify-between flex-wrap gap-2">
                    <span className="text-[11px] font-mono text-brand-muted">
                      Rehearsal / Test Mode: You can reset the announcement sequence back to standby anytime.
                    </span>

                    <button
                      onClick={() => setConfirmResetWinnerModal(true)}
                      className="px-3.5 py-1.5 rounded-lg border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-mono text-xs font-semibold flex items-center gap-1.5 transition-all"
                    >
                      <RotateCcw size={13} />
                      Reset Announcement Sequence
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-VIEW 1: TEAMS LEADERBOARD */}
            {leaderboardSubView === 'teams' && (
              <div className="bg-brand-surface border border-brand-border rounded-2xl overflow-hidden shadow-xl">
                <div className="p-4 border-b border-brand-border flex items-center justify-between gap-3">
                  <div className="font-mono text-xs text-brand-muted">
                    Total Teams in Standings: <strong className="text-white">{rankedTeams.length}</strong>
                  </div>
                  <button
                    onClick={() => exportData('xlsx')}
                    className="px-3 py-1.5 rounded-lg border border-brand-border bg-brand-card text-xs font-mono text-white flex items-center gap-1.5"
                  >
                    <Download size={13} /> Export Standings
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-brand-border bg-brand-card/80 font-mono text-brand-muted text-[11px] uppercase">
                        <th className="py-3.5 px-4 font-semibold w-16 text-center">Rank</th>
                        <th className="py-3.5 px-4 font-semibold">Team & Track</th>
                        <th className="py-3.5 px-4 font-semibold">College / Leader</th>
                        <th className="py-3.5 px-4 font-semibold">Payment Status</th>
                        <th className="py-3.5 px-4 font-semibold text-center">Evaluation Score</th>
                        <th className="py-3.5 px-4 font-semibold text-center">Stage / Badge</th>
                        <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-border/60">
                      {rankedTeams.map((reg, idx) => {
                        const rankNum = idx + 1
                        const evalData = evaluations[reg.registrationId]
                        const score = evalData?.score ?? 0

                        return (
                          <tr key={reg.registrationId} className="hover:bg-brand-card/50 transition-colors">
                            {/* Rank Badge */}
                            <td className="py-3.5 px-4 text-center">
                              {rankNum === 1 ? (
                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 font-bold font-mono text-sm shadow-[0_0_15px_rgba(234,179,8,0.3)]">
                                  🥇
                                </span>
                              ) : rankNum === 2 ? (
                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-300/20 text-slate-200 border border-slate-300/40 font-bold font-mono text-sm">
                                  🥈
                                </span>
                              ) : rankNum === 3 ? (
                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-700/20 text-amber-500 border border-amber-700/40 font-bold font-mono text-sm">
                                  🥉
                                </span>
                              ) : (
                                <span className="font-mono text-xs font-bold text-brand-muted">
                                  #{rankNum}
                                </span>
                              )}
                            </td>

                            {/* Team & Track */}
                            <td className="py-3.5 px-4">
                              <div className="font-display font-bold text-white text-sm">{reg.teamName}</div>
                              <div className="font-mono text-[10px] text-brand-primary">{reg.registrationId}</div>
                              <div className="font-mono text-[10px] text-brand-orange mt-0.5">
                                {reg.selectedDomain || reg.selectedTheme || 'General'}
                              </div>
                            </td>

                            {/* College & Leader */}
                            <td className="py-3.5 px-4 max-w-[220px]">
                              <div className="font-medium text-white">{reg.leaderName} ({reg.teamSize} members)</div>
                              <div className="text-[11px] text-brand-muted truncate" title={reg.leaderCollege}>
                                {reg.leaderCollege || 'N/A'}
                              </div>
                            </td>

                            {/* Payment Status */}
                            <td className="py-3.5 px-4">
                              <span
                                className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider ${
                                  reg.paymentStatus === 'VERIFIED'
                                    ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                                    : reg.paymentStatus === 'REJECTED'
                                    ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                                    : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'
                                }`}
                              >
                                {reg.paymentStatus || 'PENDING'}
                              </span>
                            </td>

                            {/* Live Score */}
                            <td className="py-3.5 px-4 text-center">
                              <span className="font-display font-black text-base text-yellow-400">
                                {score > 0 ? `${score} pts` : '--'}
                              </span>
                            </td>

                            {/* Stage Badge */}
                            <td className="py-3.5 px-4 text-center">
                              <span className="inline-block px-2 py-0.5 rounded bg-brand-surface border border-brand-border text-[10px] font-mono text-cyan-400">
                                {evalData?.badge || (reg.paymentStatus === 'VERIFIED' ? 'Verified Team' : 'Registered')}
                              </span>
                            </td>

                            {/* Action to Score */}
                            <td className="py-3.5 px-4 text-right">
                              <button
                                onClick={() => {
                                  setScoringReg(reg)
                                  setScoreInput(evalData?.score || 80)
                                  setBadgeInput(evalData?.badge || 'Shortlisted')
                                  setRoundInput(evalData?.round || 'Round 1')
                                }}
                                className="px-3 py-1.5 rounded-lg border border-yellow-500/30 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 font-mono text-xs font-semibold"
                              >
                                Score Team
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SUB-VIEW 2: TOP COLLEGES LEADERBOARD */}
            {leaderboardSubView === 'colleges' && (
              <div className="bg-brand-surface border border-brand-border rounded-2xl overflow-hidden shadow-xl p-5 space-y-4">
                <div className="font-mono text-xs text-brand-primary font-bold tracking-wider uppercase">
                  INSTITUTIONAL RANKING (TOP COLLEGES BY PARTICIPATION)
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {collegeLeaderboard.map((item, idx) => (
                    <div
                      key={item.college}
                      className="p-4 rounded-xl bg-brand-card border border-brand-border space-y-3 relative overflow-hidden"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-brand-surface border border-brand-border text-brand-orange">
                            #{idx + 1}
                          </span>
                          {idx === 0 && <span className="text-lg">🥇</span>}
                          {idx === 1 && <span className="text-lg">🥈</span>}
                          {idx === 2 && <span className="text-lg">🥉</span>}
                        </div>
                        <span className="font-mono text-xs font-bold text-cyan-400">
                          {item.teams} {item.teams === 1 ? 'Team' : 'Teams'}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-display font-bold text-white text-sm line-clamp-2">
                          {item.college}
                        </h4>
                      </div>

                      <div className="pt-2 border-t border-brand-border/60 flex items-center justify-between text-xs font-mono text-brand-muted">
                        <span>Participants: <strong className="text-white">{item.participants}</strong></span>
                        <span>Verified: <strong className="text-green-400">{item.verified}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SUB-VIEW 3: TRACKS & DOMAINS LEADERBOARD */}
            {leaderboardSubView === 'domains' && (
              <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-xl space-y-5">
                <div className="font-mono text-xs text-brand-primary font-bold tracking-wider uppercase">
                  INNOVATION TRACKS & DOMAIN PARTICIPATION
                </div>

                <div className="space-y-4">
                  {domainLeaderboard.map((d, idx) => (
                    <div key={d.domain} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="font-bold text-white flex items-center gap-2">
                          <span className="text-brand-orange">#{idx + 1}</span> {d.domain}
                        </span>
                        <span className="text-brand-muted">
                          <strong className="text-white">{d.count}</strong> teams ({d.percentage}%)
                        </span>
                      </div>
                      <div className="w-full h-3 bg-brand-card rounded-full overflow-hidden border border-brand-border">
                        <div
                          className="h-full bg-gradient-to-r from-brand-primary to-brand-orange rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(d.percentage, 5)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        ) : activeTab === 'timer' ? (
          /* ── VIEW: DEDICATED STAGE TIMER CONTROLLER & BROADCAST TAB ────────── */
          <section className="space-y-6">
            {/* Top Info Header */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-brand-surface border border-brand-border p-5 rounded-2xl shadow-xl">
              <div>
                <div className="flex items-center gap-2">
                  <Timer className="text-brand-primary w-6 h-6 animate-pulse" />
                  <h2 className="font-display font-black text-xl sm:text-2xl text-white tracking-wide">
                    STAGE TIMER & BROADCAST CONSOLE
                  </h2>
                </div>
                <p className="text-xs text-brand-muted font-mono mt-1">
                  Synchronous zero-lag stage projector controller. Commands execute instantly across auditoriums, projector screens (<code className="text-brand-primary">/timer</code>), and participant browsers.
                </p>
              </div>

              {/* Top Launch Button */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-card border border-brand-border text-xs font-mono">
                  <span className={`w-2 h-2 rounded-full ${
                    timerState.status === 'RUNNING' ? 'bg-green-400 animate-ping' :
                    timerState.status === 'PAUSED' ? 'bg-amber-400' :
                    timerState.status === 'ENDED' ? 'bg-red-500' : 'bg-brand-muted'
                  }`} />
                  <span className="text-brand-muted">STATUS:</span>
                  <strong className={
                    timerState.status === 'RUNNING' ? 'text-green-400' :
                    timerState.status === 'PAUSED' ? 'text-amber-400' :
                    timerState.status === 'ENDED' ? 'text-red-400' : 'text-cyan-400'
                  }>
                    {timerState.status === 'RUNNING' ? 'RUNNING' :
                     timerState.status === 'PAUSED' ? 'PAUSED' :
                     timerState.status === 'ENDED' ? 'CODE FREEZE' : 'READY'}
                  </strong>
                </span>

                <a
                  href="/timer"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-brand-primary hover:from-red-500 hover:to-brand-primaryLight text-white font-mono text-xs font-bold flex items-center gap-2 shadow-glow-red transition-all"
                >
                  <MonitorPlay size={16} />
                  OPEN STAGE PROJECTOR SCREEN ↗
                </a>
              </div>
            </div>

            {/* Main Stage Display Preview (Large Animated Cards) */}
            <div className="relative overflow-hidden rounded-3xl border-2 border-brand-primary/40 bg-gradient-to-b from-brand-surface via-brand-card/90 to-brand-surface p-6 sm:p-10 shadow-2xl space-y-8">
              <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-brand-orange/10 rounded-full blur-3xl pointer-events-none" />

              {/* Preview Header */}
              <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left border-b border-brand-border/60 pb-4">
                <div>
                  <div className="font-mono text-[10px] tracking-widest text-brand-orange uppercase font-bold">
                    LIVE STAGE PROJECTION PREVIEW
                  </div>
                  <div className="font-display font-black text-base sm:text-lg text-white">
                    SAKTHI HACKFEST '26 · 24-HOUR NATIONAL HACKATHON
                  </div>
                </div>

                <div className="flex items-center gap-2 font-mono text-xs text-brand-muted">
                  <span>TOTAL SET: <strong className="text-white">{Math.round(timerState.totalDurationSeconds / 3600)} Hours</strong></span>
                  <span>·</span>
                  <span>SYNC: <strong className="text-green-400">0ms Broadcast</strong></span>
                </div>
              </div>

              {/* Giant Digits Display */}
              <div className="relative z-10 flex flex-col items-center justify-center py-4">
                <div className="flex items-center justify-center gap-2 sm:gap-4 md:gap-6">
                  {/* Hours */}
                  <div className="flex flex-col items-center">
                    <div className="w-24 sm:w-36 md:w-44 h-24 sm:h-36 md:h-44 rounded-2xl sm:rounded-3xl bg-black/60 border border-brand-primary/40 shadow-glow-red flex items-center justify-center backdrop-blur-md">
                      <span className="font-display font-black text-4xl sm:text-6xl md:text-7xl text-white tracking-wider">
                        {String(timerDisplay.hours).padStart(2, '0')}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] sm:text-xs text-brand-primary font-bold uppercase tracking-widest mt-2">
                      HOURS
                    </span>
                  </div>

                  <span className="font-display font-black text-3xl sm:text-5xl md:text-6xl text-brand-primary animate-pulse">
                    :
                  </span>

                  {/* Minutes */}
                  <div className="flex flex-col items-center">
                    <div className="w-24 sm:w-36 md:w-44 h-24 sm:h-36 md:h-44 rounded-2xl sm:rounded-3xl bg-black/60 border border-brand-primary/40 shadow-glow-red flex items-center justify-center backdrop-blur-md">
                      <span className="font-display font-black text-4xl sm:text-6xl md:text-7xl text-white tracking-wider">
                        {String(timerDisplay.minutes).padStart(2, '0')}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] sm:text-xs text-brand-primary font-bold uppercase tracking-widest mt-2">
                      MINUTES
                    </span>
                  </div>

                  <span className="font-display font-black text-3xl sm:text-5xl md:text-6xl text-brand-primary animate-pulse">
                    :
                  </span>

                  {/* Seconds */}
                  <div className="flex flex-col items-center">
                    <div className="w-24 sm:w-36 md:w-44 h-24 sm:h-36 md:h-44 rounded-2xl sm:rounded-3xl bg-black/60 border border-brand-orange/40 shadow-lg flex items-center justify-center backdrop-blur-md">
                      <span className="font-display font-black text-4xl sm:text-6xl md:text-7xl text-brand-orange tracking-wider">
                        {String(timerDisplay.seconds).padStart(2, '0')}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] sm:text-xs text-brand-orange font-bold uppercase tracking-widest mt-2">
                      SECONDS
                    </span>
                  </div>
                </div>

                {/* Status Callout Banner */}
                {timerState.status === 'ENDED' && (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="mt-6 px-6 py-2 rounded-full bg-red-600/30 border-2 border-red-500 text-red-300 font-display font-black text-base sm:text-lg tracking-widest uppercase animate-pulse shadow-glow-red"
                  >
                    🛑 CODE FREEZE — HACKATHON CONCLUDED
                  </motion.div>
                )}

                {timerState.status === 'PAUSED' && (
                  <div className="mt-6 px-5 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 font-mono text-xs tracking-wider uppercase">
                    ❚❚ STAGE COUNTDOWN CURRENTLY PAUSED BY ADMIN
                  </div>
                )}
              </div>

              {/* Animated Progress Bar */}
              <div className="relative z-10 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-brand-muted">
                    Session Progress: <strong className="text-white">{Math.max(0, 100 - Math.round(timerDisplay.percent))}% Elapsed</strong>
                  </span>
                  <span className="text-brand-muted">
                    Remaining: <strong className="text-brand-primary">{Math.round(timerDisplay.percent)}%</strong>
                  </span>
                </div>
                <div className="w-full h-3.5 bg-black/60 rounded-full overflow-hidden border border-brand-border/80 p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-brand-primary via-brand-orange to-green-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(timerDisplay.percent, 1)}%` }}
                  />
                </div>
              </div>

              {/* Primary Large Controls (Start / Pause / End / Reset) */}
              <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-2 border-t border-brand-border/60">
                {/* 1. START / RESUME */}
                {timerState.status === 'RUNNING' ? (
                  <button
                    disabled
                    className="py-4 px-3 rounded-2xl bg-green-950/40 border border-green-500/40 text-green-400 font-mono font-bold text-xs sm:text-sm flex flex-col items-center justify-center gap-1.5 opacity-80 cursor-default"
                  >
                    <span className="w-3 h-3 rounded-full bg-green-500 animate-ping inline-block" />
                    <span>TIMER RUNNING</span>
                  </button>
                ) : timerState.status === 'PAUSED' ? (
                  <button
                    onClick={handleResumeTimer}
                    className="py-4 px-3 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-mono font-bold text-xs sm:text-sm flex flex-col items-center justify-center gap-1.5 shadow-lg shadow-green-900/40 transition-all active:scale-95"
                  >
                    <Play size={20} className="fill-current" />
                    <span>RESUME TIMER</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleStartTimer()}
                    className="py-4 px-3 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-mono font-bold text-xs sm:text-sm flex flex-col items-center justify-center gap-1.5 shadow-lg shadow-green-900/40 transition-all active:scale-95"
                  >
                    <Play size={20} className="fill-current" />
                    <span>START TIMER</span>
                  </button>
                )}

                {/* 2. PAUSE */}
                <button
                  onClick={handlePauseTimer}
                  disabled={timerState.status !== 'RUNNING'}
                  className="py-4 px-3 rounded-2xl bg-amber-600/90 hover:bg-amber-500 text-white font-mono font-bold text-xs sm:text-sm flex flex-col items-center justify-center gap-1.5 shadow-lg shadow-amber-900/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
                >
                  <Pause size={20} className="fill-current" />
                  <span>PAUSE TIMER</span>
                </button>

                {/* 3. END / CODE FREEZE */}
                <button
                  onClick={() => setConfirmEndOpen(true)}
                  disabled={timerState.status === 'ENDED'}
                  className="py-4 px-3 rounded-2xl bg-red-600/90 hover:bg-red-500 text-white font-mono font-bold text-xs sm:text-sm flex flex-col items-center justify-center gap-1.5 shadow-glow-red transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
                >
                  <Square size={20} className="fill-current" />
                  <span>END / FREEZE</span>
                </button>

                {/* 4. RESET */}
                <button
                  onClick={() => handleResetTimer()}
                  className="py-4 px-3 rounded-2xl bg-brand-surface hover:bg-brand-card border border-brand-border text-brand-muted hover:text-white font-mono font-bold text-xs sm:text-sm flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95"
                >
                  <RotateCcw size={20} />
                  <span>RESET TIMER</span>
                </button>
              </div>

              {/* Quick Time Extension Adjustments */}
              <div className="relative z-10 pt-2 border-t border-brand-border/60">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-mono text-[10px] text-brand-muted uppercase tracking-wider">
                    QUICK TIME ADJUSTMENTS (EMERGENCY EXTENSION / DEDUCTION)
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => handleAdjustTimer(15 * 60, '+15 Minutes')}
                    className="px-3 py-1.5 rounded-lg bg-brand-card hover:bg-brand-surface border border-brand-border text-xs font-mono text-green-400 font-semibold flex items-center gap-1 transition-all"
                  >
                    <Plus size={13} /> +15 Mins
                  </button>
                  <button
                    onClick={() => handleAdjustTimer(30 * 60, '+30 Minutes')}
                    className="px-3 py-1.5 rounded-lg bg-brand-card hover:bg-brand-surface border border-brand-border text-xs font-mono text-green-400 font-semibold flex items-center gap-1 transition-all"
                  >
                    <Plus size={13} /> +30 Mins
                  </button>
                  <button
                    onClick={() => handleAdjustTimer(60 * 60, '+1 Hour')}
                    className="px-3 py-1.5 rounded-lg bg-brand-card hover:bg-brand-surface border border-brand-border text-xs font-mono text-green-400 font-semibold flex items-center gap-1 transition-all"
                  >
                    <Plus size={13} /> +1 Hour
                  </button>
                  <button
                    onClick={() => handleAdjustTimer(5 * 60, '+5 Minutes')}
                    className="px-3 py-1.5 rounded-lg bg-brand-card hover:bg-brand-surface border border-brand-border text-xs font-mono text-brand-orange font-semibold flex items-center gap-1 transition-all"
                  >
                    <Plus size={13} /> +5 Mins
                  </button>
                  <button
                    onClick={() => handleAdjustTimer(-5 * 60, '-5 Minutes')}
                    className="px-3 py-1.5 rounded-lg bg-brand-card hover:bg-brand-surface border border-brand-border text-xs font-mono text-red-400 font-semibold flex items-center gap-1 transition-all"
                  >
                    -5 Mins
                  </button>
                </div>
              </div>
            </div>

            {/* Duration Presets & Session Configurations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Card 1: Presets & Custom Duration */}
              <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex items-center gap-2 font-mono text-xs text-brand-primary font-bold uppercase">
                  <Clock size={16} /> DURATION PRESETS & SCHEDULE
                </div>
                <p className="text-xs text-brand-muted font-mono">
                  Select a duration preset or configure custom hours for specific hackathon stages.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { label: '24 Hours', hours: 24, tag: 'Full Hackathon' },
                    { label: '12 Hours', hours: 12, tag: 'Checkpoint 1' },
                    { label: '8 Hours', hours: 8, tag: 'Night Sprint' },
                    { label: '4 Hours', hours: 4, tag: 'Final Lap' },
                    { label: '2 Hours', hours: 2, tag: 'Pitch Prep' },
                    { label: '1 Hour', hours: 1, tag: 'Last Hour' },
                    { label: '30 Mins', hours: 0.5, tag: 'Freeze Alert' },
                    { label: '15 Mins', hours: 0.25, tag: 'Demo Round' },
                  ].map(p => (
                    <button
                      key={p.label}
                      onClick={() => {
                        setTimerPresetHours(p.hours)
                        handleResetTimer(p.hours)
                      }}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        timerPresetHours === p.hours
                          ? 'border-brand-primary bg-brand-primary/15 text-white'
                          : 'border-brand-border bg-brand-card hover:bg-brand-surface text-brand-muted hover:text-white'
                      }`}
                    >
                      <div className="font-mono text-xs font-bold">{p.label}</div>
                      <div className="font-mono text-[9px] text-brand-orange mt-0.5">{p.tag}</div>
                    </button>
                  ))}
                </div>

                <div className="pt-2 border-t border-brand-border/60">
                  <div className="font-mono text-[10px] text-brand-muted uppercase mb-2">CUSTOM DURATION</div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <label className="block font-mono text-[10px] text-brand-muted mb-1">Hours</label>
                      <input
                        type="number"
                        min={0}
                        max={72}
                        value={timerPresetHours}
                        onChange={e => setTimerPresetHours(Math.max(0, parseInt(e.target.value, 10) || 0))}
                        className="w-full bg-brand-card border border-brand-border rounded-xl text-white text-xs p-2.5 font-mono focus:outline-none focus:border-brand-primary"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block font-mono text-[10px] text-brand-muted mb-1">Minutes</label>
                      <input
                        type="number"
                        min={0}
                        max={59}
                        value={timerCustomMins}
                        onChange={e => setTimerCustomMins(Math.min(59, Math.max(0, parseInt(e.target.value, 10) || 0)))}
                        className="w-full bg-brand-card border border-brand-border rounded-xl text-white text-xs p-2.5 font-mono focus:outline-none focus:border-brand-primary"
                      />
                    </div>
                    <button
                      onClick={() => handleResetTimer(timerPresetHours)}
                      className="mt-4 px-4 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primaryLight text-white font-mono text-xs font-bold transition-all"
                    >
                      APPLY
                    </button>
                  </div>
                </div>
              </div>

              {/* Card 2: Live Stage Announcement Broadcast */}
              <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 font-mono text-xs text-brand-orange font-bold uppercase">
                    <Megaphone size={16} /> LIVE STAGE ANNOUNCEMENT BROADCAST
                  </div>
                  <p className="text-xs text-brand-muted font-mono mt-1">
                    Send real-time ticker messages to all auditorium screens, projectors, and participant timer displays.
                  </p>

                  <div className="mt-3 space-y-2">
                    <textarea
                      rows={3}
                      value={announcementInput}
                      onChange={e => setAnnouncementInput(e.target.value)}
                      placeholder="Type announcement here... (e.g. 'Mentoring round 1 begins at 2:00 PM', 'Dinner served in Hall B', 'Final 30 mins to Code Freeze!')"
                      className="w-full bg-brand-card border border-brand-border rounded-xl text-white text-xs p-3 font-mono focus:outline-none focus:border-brand-primary placeholder-brand-mutedDark resize-none"
                    />

                    {/* Quick Announcement Chips */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {[
                        '🚀 Hackathon officially underway! Happy coding!',
                        '🍕 Refreshments & Snacks available now!',
                        '⚠️ Mentoring Round 1 in progress!',
                        '🚨 15 MINUTE WARNING: Push all code to GitHub!',
                        '🛑 CODE FREEZE! Stop coding and submit presentation slides.',
                      ].map(msg => (
                        <button
                          key={msg}
                          onClick={() => setAnnouncementInput(msg)}
                          className="px-2 py-1 rounded bg-brand-card hover:bg-brand-surface border border-brand-border text-[10px] font-mono text-brand-muted hover:text-white truncate max-w-[200px]"
                          title={msg}
                        >
                          {msg}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-brand-border/60 flex items-center gap-3">
                  <button
                    onClick={handleBroadcastAnnouncement}
                    disabled={!announcementInput.trim()}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-brand-orange to-red-600 hover:from-brand-orange hover:to-red-500 text-white font-mono text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-40"
                  >
                    <Megaphone size={14} />
                    BROADCAST TO STAGE
                  </button>

                  <button
                    onClick={handleClearAnnouncement}
                    className="px-4 py-2.5 rounded-xl border border-brand-border bg-brand-card hover:bg-brand-surface text-brand-muted hover:text-white font-mono text-xs font-semibold transition-all"
                  >
                    CLEAR
                  </button>
                </div>
              </div>
            </div>

            {/* Card 3: Projector & Dual-Screen Setup Guide */}
            <div className="bg-brand-card/60 border border-brand-border rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-mono text-xs text-white font-bold uppercase">
                  <MonitorPlay size={16} className="text-brand-primary" /> HOW TO PROJECT ON THE AUDITORIUM STAGE SCREEN
                </div>
                <p className="text-xs text-brand-muted font-mono leading-relaxed">
                  Connect your laptop to the stage projector or auditorium LED wall via HDMI/AirPlay, click the button to open <code className="text-brand-primary">/timer</code> in a new window, drag it to the second display, and press <strong className="text-white">F11</strong> for Fullscreen mode.
                </p>
              </div>

              <a
                href="/timer"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 rounded-xl bg-brand-surface hover:bg-brand-card border border-brand-primary text-brand-primary hover:text-white font-mono text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all shadow-glow-red flex-shrink-0"
              >
                <MonitorPlay size={16} />
                LAUNCH STAGE PROJECTOR ↗
              </a>
            </div>
          </section>
        ) : (
          <>
            {/* ── SECTION: 6 STATISTICS TILES ───────────────────────────────── */}
            <section className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
              {/* 1. TOTAL REGISTRATIONS */}
              <div className="p-4 rounded-2xl bg-brand-surface border border-brand-border shadow-lg">
                <div className="font-mono text-[10px] text-brand-muted uppercase tracking-wider mb-1">TOTAL REGISTRATIONS</div>
                <div className="font-display font-black text-2xl sm:text-3xl text-white">
                  {loading ? '...' : computedStats.totalRegistrations}
                </div>
                <div className="font-mono text-[10px] text-brand-muted mt-1">Live Google Sheet</div>
              </div>

              {/* 2. TOTAL TEAMS */}
              <div className="p-4 rounded-2xl bg-brand-surface border border-brand-border shadow-lg">
                <div className="font-mono text-[10px] text-brand-muted uppercase tracking-wider mb-1">TOTAL TEAMS</div>
                <div className="font-display font-black text-2xl sm:text-3xl text-cyan-400">
                  {loading ? '...' : computedStats.totalTeams}
                </div>
                <div className="font-mono text-[10px] text-brand-muted mt-1">Confirmed Teams</div>
              </div>

              {/* 3. TOTAL PARTICIPANTS */}
              <div className="p-4 rounded-2xl bg-brand-surface border border-brand-border shadow-lg">
                <div className="font-mono text-[10px] text-brand-muted uppercase tracking-wider mb-1">PARTICIPANTS</div>
                <div className="font-display font-black text-2xl sm:text-3xl text-brand-orange">
                  {loading ? '...' : computedStats.totalParticipants}
                </div>
                <div className="font-mono text-[10px] text-brand-muted mt-1">Leaders + Members</div>
              </div>

              {/* 4. PAYMENT SUBMITTED */}
              <div className="p-4 rounded-2xl bg-brand-surface border border-brand-border shadow-lg">
                <div className="font-mono text-[10px] text-brand-muted uppercase tracking-wider mb-1">PAYMENT SUBMITTED</div>
                <div className="font-display font-black text-2xl sm:text-3xl text-green-400">
                  {loading ? '...' : computedStats.paymentSubmitted}
                </div>
                <div className="font-mono text-[10px] text-brand-muted mt-1">With UPI Reference</div>
              </div>

              {/* 5. PAYMENT PENDING */}
              <div className="p-4 rounded-2xl bg-brand-surface border border-brand-border shadow-lg">
                <div className="font-mono text-[10px] text-brand-muted uppercase tracking-wider mb-1">PAYMENT PENDING</div>
                <div className="font-display font-black text-2xl sm:text-3xl text-yellow-400">
                  {loading ? '...' : computedStats.paymentPending}
                </div>
                <div className="font-mono text-[10px] text-brand-muted mt-1">Awaiting Review</div>
              </div>

              {/* 6. ACCOMMODATION REQUIRED */}
              <div className="p-4 rounded-2xl bg-brand-surface border border-brand-border shadow-lg">
                <div className="font-mono text-[10px] text-brand-muted uppercase tracking-wider mb-1">ACCOMMODATION</div>
                <div className="font-display font-black text-2xl sm:text-3xl text-purple-400">
                  {loading ? '...' : computedStats.accommodationCount}
                </div>
                <div className="font-mono text-[10px] text-brand-muted mt-1">Requested Hostel</div>
              </div>
            </section>

            {/* ── SECTION: LEADERBOARDS QUICK OVERVIEW (On Dashboard) ──────── */}
            {activeTab === 'dashboard' && (
              <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Quick Top Colleges */}
                <div className="bg-brand-surface border border-brand-border rounded-2xl p-5 shadow-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-mono text-xs text-brand-primary font-bold uppercase">
                      <GraduationCap size={16} /> Top Institutions Leaderboard
                    </div>
                    <button
                      onClick={() => { setActiveTab('leaderboard'); setLeaderboardSubView('colleges'); }}
                      className="text-[11px] font-mono text-brand-orange hover:underline"
                    >
                      View All
                    </button>
                  </div>

                  <div className="space-y-2">
                    {collegeLeaderboard.slice(0, 3).map((item, idx) => (
                      <div key={item.college} className="p-2.5 rounded-xl bg-brand-card border border-brand-border/60 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-brand-muted">#{idx + 1}</span>
                          <span className="font-medium text-white truncate max-w-[240px] sm:max-w-sm">{item.college}</span>
                        </div>
                        <span className="font-mono font-bold text-cyan-400">{item.teams} {item.teams === 1 ? 'Team' : 'Teams'}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Track Breakdown */}
                <div className="bg-brand-surface border border-brand-border rounded-2xl p-5 shadow-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-mono text-xs text-brand-orange font-bold uppercase">
                      <Flame size={16} /> Popular Hackathon Domains
                    </div>
                    <button
                      onClick={() => { setActiveTab('leaderboard'); setLeaderboardSubView('domains'); }}
                      className="text-[11px] font-mono text-brand-primary hover:underline"
                    >
                      View All
                    </button>
                  </div>

                  <div className="space-y-2">
                    {domainLeaderboard.slice(0, 3).map((d) => (
                      <div key={d.domain} className="space-y-1 text-xs">
                        <div className="flex justify-between font-mono text-[11px]">
                          <span className="text-white">{d.domain}</span>
                          <span className="text-brand-muted">{d.count} teams ({d.percentage}%)</span>
                        </div>
                        <div className="w-full h-1.5 bg-brand-card rounded-full overflow-hidden">
                          <div className="h-full bg-brand-primary rounded-full" style={{ width: `${Math.max(d.percentage, 8)}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* ── SECTION: SEARCH, FILTERS & EXPORT TOOLBAR ──────────────────── */}
            <section className="bg-brand-surface border border-brand-border rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
                {/* Search Input */}
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted" size={17} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Search by ID, Team, Leader, Email, College, Phone, UPI..."
                    className="w-full bg-brand-card border border-brand-border rounded-xl text-white text-xs sm:text-sm pl-10 pr-4 py-2.5 focus:outline-none focus:border-brand-primary transition-all font-mono placeholder-brand-mutedDark"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-white"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>

                {/* Export Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => exportData('csv')}
                    disabled={filteredRegistrations.length === 0}
                    className="flex-1 sm:flex-none px-3.5 py-2.5 rounded-xl border border-brand-border bg-brand-card hover:bg-brand-surface text-brand-muted hover:text-white font-mono text-xs font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    <Download size={14} />
                    EXPORT CSV
                  </button>

                  <button
                    onClick={() => exportData('xlsx')}
                    disabled={filteredRegistrations.length === 0}
                    className="flex-1 sm:flex-none px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-mono text-xs font-semibold flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-50"
                  >
                    <FileSpreadsheet size={15} />
                    EXPORT EXCEL
                  </button>
                </div>
              </div>

              {/* Dynamic Filters Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-brand-border/60">
                {/* Payment Status Filter */}
                <div>
                  <label className="block font-mono text-[10px] text-brand-muted uppercase mb-1">Payment Status</label>
                  <select
                    value={filterPayment}
                    onChange={e => setFilterPayment(e.target.value)}
                    className="w-full bg-brand-card border border-brand-border rounded-lg text-white text-xs px-2.5 py-2 font-mono focus:outline-none focus:border-brand-primary"
                  >
                    <option value="ALL">All Payments</option>
                    <option value="SUBMITTED">Submitted (With UPI)</option>
                    <option value="PENDING">Pending</option>
                    <option value="VERIFIED">Verified</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>

                {/* Registration Status Filter */}
                <div>
                  <label className="block font-mono text-[10px] text-brand-muted uppercase mb-1">Registration Status</label>
                  <select
                    value={filterRegStatus}
                    onChange={e => setFilterRegStatus(e.target.value)}
                    className="w-full bg-brand-card border border-brand-border rounded-lg text-white text-xs px-2.5 py-2 font-mono focus:outline-none focus:border-brand-primary"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="VERIFIED">Verified</option>
                    <option value="PENDING">Pending</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>

                {/* Accommodation Filter */}
                <div>
                  <label className="block font-mono text-[10px] text-brand-muted uppercase mb-1">Accommodation</label>
                  <select
                    value={filterAccommodation}
                    onChange={e => setFilterAccommodation(e.target.value)}
                    className="w-full bg-brand-card border border-brand-border rounded-lg text-white text-xs px-2.5 py-2 font-mono focus:outline-none focus:border-brand-primary"
                  >
                    <option value="ALL">All</option>
                    <option value="Yes">Required (Yes)</option>
                    <option value="No">Not Required (No)</option>
                  </select>
                </div>

                {/* Theme / Domain Filter */}
                <div>
                  <label className="block font-mono text-[10px] text-brand-muted uppercase mb-1">Domain / Track</label>
                  <select
                    value={filterTheme}
                    onChange={e => setFilterTheme(e.target.value)}
                    className="w-full bg-brand-card border border-brand-border rounded-lg text-white text-xs px-2.5 py-2 font-mono focus:outline-none focus:border-brand-primary"
                  >
                    <option value="ALL">All Tracks</option>
                    {HACKATHON_DOMAINS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                    <option value="Open Innovation">Open Innovation</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs font-mono text-brand-muted pt-1">
                <div>
                  Showing <span className="text-white font-bold">{filteredRegistrations.length}</span> of {registrations.length} registrations
                </div>
                {(searchTerm || filterPayment !== 'ALL' || filterRegStatus !== 'ALL' || filterAccommodation !== 'ALL' || filterTheme !== 'ALL') && (
                  <button
                    onClick={() => {
                      setSearchTerm('')
                      setFilterPayment('ALL')
                      setFilterRegStatus('ALL')
                      setFilterAccommodation('ALL')
                      setFilterTheme('ALL')
                    }}
                    className="text-brand-primary hover:underline"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            </section>

            {/* ── SECTION: REGISTRATIONS LIST / TABLE ───────────────────────── */}
            <section className="bg-brand-surface border border-brand-border rounded-2xl shadow-xl overflow-hidden">
              {loading ? (
                <div className="p-16 text-center">
                  <RefreshCw size={32} className="animate-spin text-brand-primary mx-auto mb-3" />
                  <div className="font-mono text-sm text-brand-muted tracking-wider">
                    FETCHING REAL RECORDS FROM GOOGLE SHEETS...
                  </div>
                </div>
              ) : filteredRegistrations.length === 0 ? (
                <div className="p-16 text-center">
                  <AlertCircle size={36} className="text-brand-muted mx-auto mb-3 opacity-60" />
                  <div className="font-display font-bold text-lg text-white mb-1">No Registrations Found</div>
                  <p className="text-xs text-brand-muted max-w-sm mx-auto">
                    No registration records match your current search and filter criteria.
                  </p>
                </div>
              ) : (
                <>
                  {/* DESKTOP DATA TABLE */}
                  <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-brand-border bg-brand-card/90 font-mono text-brand-muted tracking-wider text-[11px] uppercase">
                          <th className="py-3.5 px-4 font-semibold">Reg ID</th>
                          <th className="py-3.5 px-4 font-semibold">Team & Domain</th>
                          <th className="py-3.5 px-4 font-semibold">Leader Details</th>
                          <th className="py-3.5 px-4 font-semibold">Members</th>
                          <th className="py-3.5 px-4 font-semibold">Accomm.</th>
                          <th className="py-3.5 px-4 font-semibold">Payment / UPI</th>
                          <th className="py-3.5 px-4 font-semibold">Status</th>
                          <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-border/60">
                        {filteredRegistrations.map((reg) => (
                          <tr
                            key={reg.registrationId}
                            className="hover:bg-brand-card/60 transition-colors group cursor-pointer"
                            onClick={() => setSelectedReg(reg)}
                          >
                            {/* Registration ID & Timestamp */}
                            <td className="py-3.5 px-4">
                              <span className="font-mono font-bold text-brand-primary block">
                                {reg.registrationId}
                              </span>
                              <span className="font-mono text-[10px] text-brand-muted">
                                {reg.timestamp || 'N/A'}
                              </span>
                            </td>

                            {/* Team Name & Track */}
                            <td className="py-3.5 px-4">
                              <div className="font-bold text-white text-sm">{reg.teamName}</div>
                              <div className="font-mono text-[10px] text-brand-orange mt-0.5">
                                {reg.selectedDomain || reg.selectedTheme || 'General'}
                              </div>
                            </td>

                            {/* Leader Name, College & WhatsApp */}
                            <td className="py-3.5 px-4 max-w-[200px]">
                              <div className="font-medium text-white">{reg.leaderName}</div>
                              <div className="text-[11px] text-brand-muted truncate" title={reg.leaderCollege}>
                                {reg.leaderCollege || 'N/A'}
                              </div>
                              <div className="font-mono text-[10px] text-cyan-400 mt-0.5">
                                {reg.leaderWhatsapp}
                              </div>
                            </td>

                            {/* Team Size & Members */}
                            <td className="py-3.5 px-4">
                              <span className="inline-flex items-center gap-1 font-mono text-xs px-2 py-0.5 rounded bg-brand-surface border border-brand-border">
                                <Users size={12} className="text-brand-muted" />
                                {reg.teamSize} members
                              </span>
                            </td>

                            {/* Accommodation */}
                            <td className="py-3.5 px-4 font-mono">
                              {reg.accommodationRequired === 'Yes' ? (
                                <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30 font-semibold text-[10px]">
                                  YES
                                </span>
                              ) : (
                                <span className="text-brand-muted text-[11px]">No</span>
                              )}
                            </td>

                            {/* Payment & UPI */}
                            <td className="py-3.5 px-4">
                              <div className="font-mono font-semibold text-white">₹{reg.paymentAmount || 1000}</div>
                              <div className="font-mono text-[10px] text-brand-muted truncate max-w-[120px]" title={reg.upiTransactionId}>
                                {reg.upiTransactionId || 'No UPI ID'}
                              </div>
                              {reg.paymentScreenshotDriveUrl && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    window.open(reg.paymentScreenshotDriveUrl, '_blank')
                                  }}
                                  className="inline-flex items-center gap-1 text-[10px] text-cyan-400 hover:underline mt-0.5"
                                >
                                  <ExternalLink size={10} /> Screenshot
                                </button>
                              )}
                            </td>

                            {/* Payment & Email Status Badges */}
                            <td className="py-3.5 px-4">
                              <span
                                className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider ${
                                  reg.paymentStatus === 'VERIFIED'
                                    ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                                    : reg.paymentStatus === 'REJECTED'
                                    ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                                    : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'
                                }`}
                              >
                                {reg.paymentStatus || 'PENDING'}
                              </span>
                              <span className="block font-mono text-[9px] text-brand-muted mt-1">
                                Email: {reg.emailStatus || 'PENDING'}
                              </span>
                            </td>

                            {/* Actions */}
                            <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => setPassReg(reg)}
                                  title="Generate / View Pass"
                                  className="p-1.5 rounded-lg border border-brand-primary/40 bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary transition-colors"
                                >
                                  <QrCode size={14} />
                                </button>
                                <button
                                  onClick={() => setSelectedReg(reg)}
                                  title="View Registration Details"
                                  className="p-1.5 rounded-lg border border-brand-border bg-brand-surface hover:bg-brand-card text-brand-muted hover:text-white"
                                >
                                  <Eye size={14} />
                                </button>
                                <button
                                  onClick={() => setEditingReg({ ...reg })}
                                  title="Edit Registration"
                                  className="p-1.5 rounded-lg border border-brand-border bg-brand-surface hover:bg-brand-card text-brand-muted hover:text-white"
                                >
                                  <Edit3 size={14} />
                                </button>
                                <button
                                  onClick={() => setVerifyingReg(reg)}
                                  title="Verify / Reject Payment"
                                  className="p-1.5 rounded-lg border border-brand-border bg-brand-surface hover:bg-brand-card text-green-400 hover:bg-green-500/10"
                                >
                                  <CheckCircle size={14} />
                                </button>
                                <button
                                  onClick={() => setDeletingReg(reg)}
                                  title="Delete Registration"
                                  className="p-1.5 rounded-lg border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* MOBILE CARDS VIEW */}
                  <div className="lg:hidden divide-y divide-brand-border/60">
                    {filteredRegistrations.map((reg) => (
                      <div
                        key={reg.registrationId}
                        className="p-4 space-y-3 hover:bg-brand-card/40 transition-colors"
                        onClick={() => setSelectedReg(reg)}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="font-mono text-xs font-bold text-brand-primary">
                              {reg.registrationId}
                            </span>
                            <h3 className="font-display font-bold text-white text-base mt-0.5">
                              {reg.teamName}
                            </h3>
                            <p className="font-mono text-[10px] text-brand-orange">
                              {reg.selectedDomain || reg.selectedTheme || 'General'}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider ${
                              reg.paymentStatus === 'VERIFIED'
                                ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                                : reg.paymentStatus === 'REJECTED'
                                ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                                : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'
                            }`}
                          >
                            {reg.paymentStatus || 'PENDING'}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs bg-brand-card/60 p-2.5 rounded-xl border border-brand-border/50">
                          <div>
                            <div className="font-mono text-[10px] text-brand-muted">LEADER</div>
                            <div className="font-medium text-white truncate">{reg.leaderName}</div>
                            <div className="font-mono text-[10px] text-cyan-400">{reg.leaderWhatsapp}</div>
                          </div>
                          <div>
                            <div className="font-mono text-[10px] text-brand-muted">MEMBERS & ACCOMM.</div>
                            <div className="text-white">{reg.teamSize} members</div>
                            <div className="font-mono text-[10px] text-purple-400">
                              {reg.accommodationRequired === 'Yes' ? 'Accomm: YES' : 'Accomm: NO'}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <div className="font-mono text-xs">
                            <span className="text-brand-muted">UPI: </span>
                            <span className="text-white font-medium">{reg.upiTransactionId || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                            <button
                              onClick={() => setPassReg(reg)}
                              className="px-2.5 py-1 rounded-lg bg-brand-primary/10 border border-brand-primary/30 text-xs font-mono text-brand-primary flex items-center gap-1"
                              title="Generate Pass"
                            >
                              <QrCode size={12} /> Pass
                            </button>
                            <button
                              onClick={() => setSelectedReg(reg)}
                              className="px-2.5 py-1 rounded-lg bg-brand-surface border border-brand-border text-xs font-mono text-white"
                            >
                              View
                            </button>
                            <button
                              onClick={() => setEditingReg({ ...reg })}
                              className="px-2.5 py-1 rounded-lg bg-brand-surface border border-brand-border text-xs font-mono text-white"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setVerifyingReg(reg)}
                              className="px-2 py-1 rounded-lg bg-green-500/10 border border-green-500/30 text-xs font-mono text-green-400"
                            >
                              Verify
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </section>
          </>
        )}
      </main>

      {/* ── MODAL 1: VIEW REGISTRATION DETAILS ────────────────────────────── */}
      <AnimatePresence>
        {selectedReg && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-3xl bg-brand-surface border border-brand-border rounded-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-brand-border sticky top-0 bg-brand-surface z-10">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-brand-primary font-bold">{selectedReg.registrationId}</span>
                    <span className="text-brand-muted text-xs">·</span>
                    <span className="font-mono text-xs text-brand-muted">{selectedReg.timestamp}</span>
                  </div>
                  <h2 className="font-display font-black text-xl text-white mt-1">{selectedReg.teamName}</h2>
                </div>
                <button
                  onClick={() => setSelectedReg(null)}
                  className="p-2 rounded-xl text-brand-muted hover:text-white bg-brand-card hover:bg-brand-surface border border-brand-border transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">
                {/* 1. Registration & Track */}
                <div className="bg-brand-card border border-brand-border p-4 rounded-xl space-y-3">
                  <div className="font-mono text-xs text-brand-primary font-bold tracking-wider uppercase">
                    REGISTRATION & TRACK
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <div className="text-brand-muted font-mono text-[10px]">REGISTRATION ID</div>
                      <div className="text-white font-mono font-bold">{selectedReg.registrationId}</div>
                    </div>
                    <div>
                      <div className="text-brand-muted font-mono text-[10px]">SUBMISSION TIME</div>
                      <div className="text-white font-mono">{selectedReg.timestamp}</div>
                    </div>
                    <div>
                      <div className="text-brand-muted font-mono text-[10px]">REGISTRATION STATUS</div>
                      <div className="text-cyan-400 font-mono font-semibold">{selectedReg.registrationStatus || 'CONFIRMED'}</div>
                    </div>
                    <div>
                      <div className="text-brand-muted font-mono text-[10px]">LAST UPDATED</div>
                      <div className="text-white font-mono">{selectedReg.lastUpdated || selectedReg.timestamp}</div>
                    </div>
                  </div>
                </div>

                {/* 2. Team & Accommodation */}
                <div className="bg-brand-card border border-brand-border p-4 rounded-xl space-y-3">
                  <div className="font-mono text-xs text-brand-orange font-bold tracking-wider uppercase">
                    TEAM & ACCOMMODATION
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <div className="text-brand-muted font-mono text-[10px]">TEAM NAME</div>
                      <div className="text-white font-bold">{selectedReg.teamName}</div>
                    </div>
                    <div>
                      <div className="text-brand-muted font-mono text-[10px]">TEAM SIZE</div>
                      <div className="text-white font-mono">{selectedReg.teamSize} Members</div>
                    </div>
                    <div>
                      <div className="text-brand-muted font-mono text-[10px]">TRACK / DOMAIN</div>
                      <div className="text-white">{selectedReg.selectedDomain || selectedReg.selectedTheme || 'General'}</div>
                    </div>
                    <div>
                      <div className="text-brand-muted font-mono text-[10px]">ACCOMMODATION</div>
                      <div className={selectedReg.accommodationRequired === 'Yes' ? 'text-purple-400 font-bold' : 'text-brand-muted'}>
                        {selectedReg.accommodationRequired === 'Yes' ? 'REQUIRED (YES)' : 'NOT REQUIRED (NO)'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Team Leader Details */}
                <div className="bg-brand-card border border-brand-border p-4 rounded-xl space-y-3">
                  <div className="font-mono text-xs text-brand-primary font-bold tracking-wider uppercase">
                    TEAM LEADER
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <div className="text-brand-muted font-mono text-[10px]">FULL NAME</div>
                      <div className="text-white font-bold">{selectedReg.leaderName}</div>
                    </div>
                    <div>
                      <div className="text-brand-muted font-mono text-[10px]">COLLEGE</div>
                      <div className="text-white">{selectedReg.leaderCollege || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-brand-muted font-mono text-[10px]">DEPARTMENT & YEAR</div>
                      <div className="text-white">{selectedReg.leaderDepartment} ({selectedReg.leaderYear})</div>
                    </div>
                    <div>
                      <div className="text-brand-muted font-mono text-[10px]">WHATSAPP</div>
                      <div className="text-cyan-400 font-mono">{selectedReg.leaderWhatsapp}</div>
                    </div>
                    <div className="sm:col-span-2">
                      <div className="text-brand-muted font-mono text-[10px]">EMAIL ADDRESS</div>
                      <div className="text-white font-mono">{selectedReg.leaderEmail}</div>
                    </div>
                  </div>
                </div>

                {/* 4. Team Members */}
                <div className="bg-brand-card border border-brand-border p-4 rounded-xl space-y-3">
                  <div className="font-mono text-xs text-brand-muted font-bold tracking-wider uppercase">
                    TEAM MEMBERS ({selectedReg.members?.length || 0})
                  </div>
                  {(!selectedReg.members || selectedReg.members.length === 0) ? (
                    <div className="text-xs text-brand-muted italic">No additional team members registered.</div>
                  ) : (
                    <div className="space-y-3">
                      {selectedReg.members.map((m, idx) => (
                        <div key={idx} className="p-3 bg-brand-surface rounded-lg border border-brand-border text-xs grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <div>
                            <span className="font-mono text-[10px] text-brand-orange block">MEMBER {idx + 2}</span>
                            <span className="font-bold text-white">{m.name}</span>
                          </div>
                          <div>
                            <span className="font-mono text-[10px] text-brand-muted block">COLLEGE / DEPT</span>
                            <span className="text-white">{m.college || 'Same'} · {m.department} ({m.yearOfStudy})</span>
                          </div>
                          <div>
                            <span className="font-mono text-[10px] text-brand-muted block">CONTACT</span>
                            <span className="text-cyan-400 font-mono block">{m.whatsapp}</span>
                            <span className="text-brand-muted font-mono text-[10px] block">{m.email}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 5. Payment & Verification */}
                <div className="bg-brand-card border border-brand-border p-4 rounded-xl space-y-3">
                  <div className="font-mono text-xs text-green-400 font-bold tracking-wider uppercase">
                    PAYMENT & PROOF
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-3">
                    <div>
                      <div className="text-brand-muted font-mono text-[10px]">AMOUNT</div>
                      <div className="text-white font-mono font-bold text-sm">₹{selectedReg.paymentAmount || 1000}</div>
                    </div>
                    <div>
                      <div className="text-brand-muted font-mono text-[10px]">UPI TXN ID</div>
                      <div className="text-white font-mono font-bold">{selectedReg.upiTransactionId || 'NONE'}</div>
                    </div>
                    <div>
                      <div className="text-brand-muted font-mono text-[10px]">PAYMENT STATUS</div>
                      <div className={`font-mono font-bold ${
                        selectedReg.paymentStatus === 'VERIFIED' ? 'text-green-400' : selectedReg.paymentStatus === 'REJECTED' ? 'text-red-400' : 'text-yellow-400'
                      }`}>
                        {selectedReg.paymentStatus || 'PENDING'}
                      </div>
                    </div>
                    <div>
                      <div className="text-brand-muted font-mono text-[10px]">EMAIL STATUS</div>
                      <div className="text-white font-mono">{selectedReg.emailStatus || 'PENDING'}</div>
                    </div>
                  </div>

                  {/* Payment Screenshot Actions */}
                  {selectedReg.paymentScreenshotDriveUrl && (
                    <div className="pt-3 border-t border-brand-border flex flex-wrap items-center gap-3">
                      <button
                        onClick={() => window.open(selectedReg.paymentScreenshotDriveUrl, '_blank')}
                        className="px-3.5 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-mono font-semibold flex items-center gap-1.5 transition-all"
                      >
                        <ExternalLink size={14} />
                        OPEN DRIVE FILE
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="p-6 border-t border-brand-border bg-brand-surface sticky bottom-0 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const r = selectedReg
                      setPassReg(r)
                    }}
                    className="px-3.5 py-2 rounded-xl border border-brand-primary/40 bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <QrCode size={14} /> GENERATE PASS
                  </button>

                  <button
                    onClick={() => {
                      const r = selectedReg
                      setSelectedReg(null)
                      setEditingReg({ ...r })
                    }}
                    className="px-3.5 py-2 rounded-xl border border-brand-border bg-brand-card hover:bg-brand-surface text-white text-xs font-mono font-semibold flex items-center gap-1.5"
                  >
                    <Edit3 size={14} /> EDIT RECORD
                  </button>

                  <button
                    onClick={() => handleResendEmail(selectedReg.registrationId)}
                    disabled={actionLoading}
                    className="px-3.5 py-2 rounded-xl border border-brand-border bg-brand-card hover:bg-brand-surface text-white text-xs font-mono font-semibold flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Mail size={14} /> RESEND EMAIL
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const r = selectedReg
                      setSelectedReg(null)
                      setVerifyingReg(r)
                    }}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white text-xs font-mono font-bold shadow-lg"
                  >
                    VERIFY / REJECT PAYMENT
                  </button>

                  <button
                    onClick={() => {
                      const r = selectedReg
                      setSelectedReg(null)
                      setDeletingReg(r)
                    }}
                    className="px-3.5 py-2 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-mono font-semibold flex items-center gap-1.5"
                  >
                    <Trash2 size={14} /> DELETE
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL: GENERATE / VIEW PASS ──────────────────────────────────── */}
      <AnimatePresence>
        {passReg && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-4xl bg-brand-surface border border-brand-border rounded-2xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col p-6 my-auto"
            >
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-brand-border">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-brand-primary font-bold">ADMIN PASS GENERATOR</span>
                    <span className="text-brand-muted text-xs">·</span>
                    <span className="font-mono text-xs text-brand-muted">{passReg.registrationId}</span>
                  </div>
                  <h2 className="font-display font-black text-xl text-white mt-1">
                    Pass for {passReg.teamName}
                  </h2>
                </div>
                <button
                  onClick={() => setPassReg(null)}
                  className="p-2 rounded-xl text-brand-muted hover:text-white bg-brand-card hover:bg-brand-surface border border-brand-border transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Canonical ParticipantPass component */}
              <div className="flex justify-center w-full">
                <ParticipantPass registration={passReg} showDownloadButton={true} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL 2: EDIT REGISTRATION ───────────────────────────────────── */}
      <AnimatePresence>
        {editingReg && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-brand-surface border border-brand-border rounded-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col"
            >
              <form onSubmit={handleSaveEdit} className="flex flex-col flex-1">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-brand-border sticky top-0 bg-brand-surface z-10">
                  <div>
                    <span className="font-mono text-xs text-brand-primary font-bold">EDIT REGISTRATION</span>
                    <h2 className="font-display font-black text-xl text-white">{editingReg.registrationId}</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingReg(null)}
                    className="p-2 rounded-xl text-brand-muted hover:text-white bg-brand-card border border-brand-border"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Form Fields */}
                <div className="p-6 space-y-5 flex-1">
                  {/* Team & Track */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-mono text-xs text-brand-muted mb-1">TEAM NAME</label>
                      <input
                        type="text"
                        value={editingReg.teamName}
                        onChange={e => setEditingReg({ ...editingReg, teamName: e.target.value })}
                        required
                        className="w-full bg-brand-card border border-brand-border rounded-xl text-white text-xs px-3.5 py-2.5 font-mono focus:outline-none focus:border-brand-primary"
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-xs text-brand-muted mb-1">TEAM SIZE</label>
                      <select
                        value={editingReg.teamSize}
                        onChange={e => setEditingReg({ ...editingReg, teamSize: parseInt(e.target.value, 10) || 2 })}
                        className="w-full bg-brand-card border border-brand-border rounded-xl text-white text-xs px-3.5 py-2.5 font-mono focus:outline-none focus:border-brand-primary"
                      >
                        <option value={2}>2 Members</option>
                        <option value={3}>3 Members</option>
                        <option value={4}>4 Members</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-mono text-xs text-brand-muted mb-1">DOMAIN / TRACK</label>
                      <select
                        value={editingReg.selectedDomain || ''}
                        onChange={e => setEditingReg({ ...editingReg, selectedDomain: e.target.value })}
                        className="w-full bg-brand-card border border-brand-border rounded-xl text-white text-xs px-3.5 py-2.5 font-mono focus:outline-none focus:border-brand-primary"
                      >
                        {HACKATHON_DOMAINS.map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block font-mono text-xs text-brand-muted mb-1">ACCOMMODATION REQUIRED</label>
                      <select
                        value={editingReg.accommodationRequired || 'No'}
                        onChange={e => setEditingReg({ ...editingReg, accommodationRequired: e.target.value as 'Yes' | 'No' })}
                        className="w-full bg-brand-card border border-brand-border rounded-xl text-white text-xs px-3.5 py-2.5 font-mono focus:outline-none focus:border-brand-primary"
                      >
                        <option value="Yes">Yes (Accommodation Required)</option>
                        <option value="No">No (Not Required)</option>
                      </select>
                    </div>
                  </div>

                  {/* Leader Info */}
                  <div className="pt-3 border-t border-brand-border space-y-4">
                    <div className="font-mono text-xs text-brand-primary font-bold">TEAM LEADER DETAILS</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-mono text-xs text-brand-muted mb-1">LEADER FULL NAME</label>
                        <input
                          type="text"
                          value={editingReg.leaderName}
                          onChange={e => setEditingReg({ ...editingReg, leaderName: e.target.value })}
                          required
                          className="w-full bg-brand-card border border-brand-border rounded-xl text-white text-xs px-3.5 py-2.5 font-mono focus:outline-none focus:border-brand-primary"
                        />
                      </div>
                      <div>
                        <label className="block font-mono text-xs text-brand-muted mb-1">COLLEGE NAME</label>
                        <input
                          type="text"
                          value={editingReg.leaderCollege || ''}
                          onChange={e => setEditingReg({ ...editingReg, leaderCollege: e.target.value })}
                          className="w-full bg-brand-card border border-brand-border rounded-xl text-white text-xs px-3.5 py-2.5 font-mono focus:outline-none focus:border-brand-primary"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block font-mono text-xs text-brand-muted mb-1">DEPARTMENT</label>
                        <input
                          type="text"
                          value={editingReg.leaderDepartment}
                          onChange={e => setEditingReg({ ...editingReg, leaderDepartment: e.target.value })}
                          required
                          className="w-full bg-brand-card border border-brand-border rounded-xl text-white text-xs px-3.5 py-2.5 font-mono focus:outline-none focus:border-brand-primary"
                        />
                      </div>
                      <div>
                        <label className="block font-mono text-xs text-brand-muted mb-1">YEAR</label>
                        <input
                          type="text"
                          value={editingReg.leaderYear}
                          onChange={e => setEditingReg({ ...editingReg, leaderYear: e.target.value })}
                          required
                          className="w-full bg-brand-card border border-brand-border rounded-xl text-white text-xs px-3.5 py-2.5 font-mono focus:outline-none focus:border-brand-primary"
                        />
                      </div>
                      <div>
                        <label className="block font-mono text-xs text-brand-muted mb-1">WHATSAPP</label>
                        <input
                          type="text"
                          value={editingReg.leaderWhatsapp}
                          onChange={e => setEditingReg({ ...editingReg, leaderWhatsapp: e.target.value })}
                          required
                          className="w-full bg-brand-card border border-brand-border rounded-xl text-white text-xs px-3.5 py-2.5 font-mono focus:outline-none focus:border-brand-primary"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-mono text-xs text-brand-muted mb-1">EMAIL ADDRESS</label>
                      <input
                        type="email"
                        value={editingReg.leaderEmail}
                        onChange={e => setEditingReg({ ...editingReg, leaderEmail: e.target.value })}
                        required
                        className="w-full bg-brand-card border border-brand-border rounded-xl text-white text-xs px-3.5 py-2.5 font-mono focus:outline-none focus:border-brand-primary"
                      />
                    </div>
                  </div>

                  {/* Payment Details */}
                  <div className="pt-3 border-t border-brand-border space-y-4">
                    <div className="font-mono text-xs text-green-400 font-bold">PAYMENT DETAILS</div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block font-mono text-xs text-brand-muted mb-1">UPI TXN ID</label>
                        <input
                          type="text"
                          value={editingReg.upiTransactionId || ''}
                          onChange={e => setEditingReg({ ...editingReg, upiTransactionId: e.target.value })}
                          className="w-full bg-brand-card border border-brand-border rounded-xl text-white text-xs px-3.5 py-2.5 font-mono focus:outline-none focus:border-brand-primary"
                        />
                      </div>
                      <div>
                        <label className="block font-mono text-xs text-brand-muted mb-1">PAYMENT STATUS</label>
                        <select
                          value={editingReg.paymentStatus}
                          onChange={e => setEditingReg({ ...editingReg, paymentStatus: e.target.value as PaymentStatus })}
                          className="w-full bg-brand-card border border-brand-border rounded-xl text-white text-xs px-3.5 py-2.5 font-mono focus:outline-none focus:border-brand-primary"
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="VERIFIED">VERIFIED</option>
                          <option value="REJECTED">REJECTED</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-mono text-xs text-brand-muted mb-1">REGISTRATION STATUS</label>
                        <select
                          value={editingReg.registrationStatus}
                          onChange={e => setEditingReg({ ...editingReg, registrationStatus: e.target.value as RegistrationStatus })}
                          className="w-full bg-brand-card border border-brand-border rounded-xl text-white text-xs px-3.5 py-2.5 font-mono focus:outline-none focus:border-brand-primary"
                        >
                          <option value="CONFIRMED">CONFIRMED</option>
                          <option value="VERIFIED">VERIFIED</option>
                          <option value="PENDING">PENDING</option>
                          <option value="REJECTED">REJECTED</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="p-6 border-t border-brand-border bg-brand-surface sticky bottom-0 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingReg(null)}
                    disabled={actionLoading}
                    className="px-4 py-2.5 rounded-xl border border-brand-border bg-brand-card hover:bg-brand-surface text-brand-muted hover:text-white text-xs font-mono font-semibold"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-red-600 text-white text-xs font-mono font-bold shadow-glow-red flex items-center gap-2 disabled:opacity-50"
                  >
                    {actionLoading ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
                    SAVE TO DATABASE
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL 3: PAYMENT VERIFICATION & REJECTION ────────────────────── */}
      <AnimatePresence>
        {verifyingReg && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-brand-surface border border-brand-border rounded-2xl shadow-2xl p-6 space-y-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-mono text-xs text-brand-primary font-bold">PAYMENT VERIFICATION</div>
                  <h3 className="font-display font-black text-xl text-white mt-0.5">{verifyingReg.teamName}</h3>
                  <div className="font-mono text-xs text-brand-muted mt-1">ID: {verifyingReg.registrationId}</div>
                </div>
                <button
                  onClick={() => setVerifyingReg(null)}
                  className="p-2 rounded-xl text-brand-muted hover:text-white bg-brand-card border border-brand-border"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Payment Info Box */}
              <div className="bg-brand-card border border-brand-border p-4 rounded-xl space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-brand-muted">Amount:</span>
                  <span className="text-white font-bold">₹{verifyingReg.paymentAmount || 1000}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-muted">UPI Txn ID:</span>
                  <span className="text-cyan-400 font-bold">{verifyingReg.upiTransactionId || 'NONE'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-muted">Current Status:</span>
                  <span className={
                    verifyingReg.paymentStatus === 'VERIFIED' ? 'text-green-400' : verifyingReg.paymentStatus === 'REJECTED' ? 'text-red-400' : 'text-yellow-400'
                  }>
                    {verifyingReg.paymentStatus || 'PENDING'}
                  </span>
                </div>
              </div>

              {/* Screenshot Preview Link */}
              {verifyingReg.paymentScreenshotDriveUrl && (
                <div className="p-3 bg-brand-card/50 rounded-xl border border-brand-border flex items-center justify-between">
                  <span className="text-xs text-brand-muted">Google Drive Proof:</span>
                  <button
                    onClick={() => window.open(verifyingReg.paymentScreenshotDriveUrl, '_blank')}
                    className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:underline font-mono"
                  >
                    <ExternalLink size={13} /> View Screenshot
                  </button>
                </div>
              )}

              {/* Rejection Note Input */}
              <div>
                <label className="block font-mono text-xs text-brand-muted mb-1.5">
                  REJECTION NOTE / REASON (Optional if rejecting)
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={e => setRejectionReason(e.target.value)}
                  placeholder="e.g. Invalid UPI reference, incorrect amount, screenshot unreadable..."
                  rows={2}
                  className="w-full bg-brand-card border border-brand-border rounded-xl text-white text-xs p-3 font-mono focus:outline-none focus:border-brand-primary placeholder-brand-mutedDark"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => handleVerifyPayment(verifyingReg, 'REJECTED', rejectionReason)}
                  disabled={actionLoading}
                  className="flex-1 py-3 rounded-xl border border-red-500/40 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-mono text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <XCircle size={15} /> REJECT PAYMENT
                </button>

                <button
                  onClick={() => handleVerifyPayment(verifyingReg, 'VERIFIED')}
                  disabled={actionLoading}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-mono text-xs font-bold shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <CheckCircle size={15} /> VERIFY PAYMENT
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL 4: DELETE CONFIRMATION ─────────────────────────────────── */}
      <AnimatePresence>
        {deletingReg && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-brand-surface border border-red-500/40 rounded-2xl shadow-2xl p-6 space-y-4"
            >
              <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto">
                <ShieldAlert size={26} />
              </div>

              <div className="text-center space-y-1">
                <h3 className="font-display font-black text-lg text-white">CONFIRM DELETION</h3>
                <p className="text-xs text-brand-muted leading-relaxed">
                  Are you sure you want to delete registration <span className="text-brand-primary font-mono font-bold">{deletingReg.registrationId}</span> for team <strong className="text-white">"{deletingReg.teamName}"</strong>?
                </p>
                <p className="text-[11px] text-red-400/80 pt-1 font-mono">
                  This will remove the row from the live Google Sheet database.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setDeletingReg(null)}
                  disabled={actionLoading}
                  className="flex-1 py-2.5 rounded-xl border border-brand-border bg-brand-card hover:bg-brand-surface text-brand-muted hover:text-white font-mono text-xs font-semibold"
                >
                  CANCEL
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={actionLoading}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold shadow-lg disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {actionLoading ? <RefreshCw size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  DELETE RECORD
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL 5: SCORE / EVALUATE TEAM FOR LEADERBOARD ────────────────── */}
      <AnimatePresence>
        {scoringReg && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-brand-surface border border-yellow-500/40 rounded-2xl shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5 font-mono text-xs text-yellow-400 font-bold">
                    <Trophy size={14} /> EVALUATE TEAM
                  </div>
                  <h3 className="font-display font-black text-xl text-white mt-0.5">{scoringReg.teamName}</h3>
                  <div className="font-mono text-xs text-brand-muted">{scoringReg.registrationId}</div>
                </div>
                <button
                  onClick={() => setScoringReg(null)}
                  className="p-2 rounded-xl text-brand-muted hover:text-white bg-brand-card border border-brand-border"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block font-mono text-xs text-brand-muted mb-1">
                    EVALUATION SCORE (0 - 100 PTS)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={scoreInput}
                    onChange={e => setScoreInput(Math.min(100, Math.max(0, parseInt(e.target.value, 10) || 0)))}
                    className="w-full bg-brand-card border border-brand-border rounded-xl text-white text-lg font-bold p-3 font-mono focus:outline-none focus:border-brand-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-mono text-xs text-brand-muted mb-1">ROUND</label>
                    <select
                      value={roundInput}
                      onChange={e => setRoundInput(e.target.value)}
                      className="w-full bg-brand-card border border-brand-border rounded-xl text-white text-xs p-2.5 font-mono focus:outline-none focus:border-brand-primary"
                    >
                      <option value="Round 1">Round 1</option>
                      <option value="Round 2">Round 2</option>
                      <option value="Finals">Finals</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-mono text-xs text-brand-muted mb-1">BADGE / RECOGNITION</label>
                    <select
                      value={badgeInput}
                      onChange={e => setBadgeInput(e.target.value)}
                      className="w-full bg-brand-card border border-brand-border rounded-xl text-white text-xs p-2.5 font-mono focus:outline-none focus:border-brand-primary"
                    >
                      <option value="Participating">Participating</option>
                      <option value="Shortlisted">Shortlisted</option>
                      <option value="Finalist">Finalist</option>
                      <option value="Top Innovator">Top Innovator</option>
                      <option value="Winner">Winner 🏆</option>
                      <option value="Runner-Up">Runner-Up 🥈</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setScoringReg(null)}
                  className="flex-1 py-2.5 rounded-xl border border-brand-border bg-brand-card text-brand-muted text-xs font-mono font-semibold"
                >
                  CANCEL
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveScore(scoringReg.registrationId)}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black text-xs font-mono font-bold shadow-lg"
                >
                  SAVE SCORE
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL 6: CONFIRM CODE FREEZE / END TIMER ──────────────────────── */}
      <AnimatePresence>
        {confirmEndOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-brand-surface border-2 border-red-500/60 rounded-2xl shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-center gap-3 text-red-500">
                <div className="w-12 h-12 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center flex-shrink-0 shadow-glow-red">
                  <Square size={24} className="fill-current" />
                </div>
                <div>
                  <h3 className="font-display font-black text-xl text-white">TRIGGER CODE FREEZE?</h3>
                  <div className="font-mono text-xs text-red-400 font-bold uppercase tracking-wider">
                    STAGE TIMER IMMEDIATE TERMINATION
                  </div>
                </div>
              </div>

              <p className="text-xs text-brand-muted font-mono leading-relaxed">
                This will immediately set the live hackathon countdown to <strong className="text-white">00:00:00</strong> on all auditorium projectors, stage screens, and connected participant browsers, displaying the flashing <strong className="text-red-400">CODE FREEZE</strong> warning.
              </p>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmEndOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-brand-border bg-brand-card text-brand-muted text-xs font-mono font-semibold hover:text-white transition-all"
                >
                  CANCEL
                </button>
                <button
                  type="button"
                  onClick={handleConfirmEndTimer}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-mono font-bold shadow-glow-red transition-all"
                >
                  YES, CODE FREEZE NOW
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL 7: CONFIRM RESET WINNER ANNOUNCEMENT ─────────────────────── */}
      <AnimatePresence>
        {confirmResetWinnerModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-brand-surface border-2 border-amber-500/60 rounded-2xl shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-center gap-3 text-amber-400">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <RotateCcw size={24} />
                </div>
                <div>
                  <h3 className="font-display font-black text-xl text-white">RESET ANNOUNCEMENT?</h3>
                  <div className="font-mono text-xs text-amber-400 font-bold uppercase tracking-wider">
                    RETURN TO STANDBY MODE
                  </div>
                </div>
              </div>

              <p className="text-xs text-brand-muted font-mono leading-relaxed">
                This will reset the public winner reveal screen back to <strong className="text-white">STANDBY</strong>. Your selected winners will remain saved, but the step-by-step sequence will start from <strong className="text-amber-400">3rd Prize</strong> again.
              </p>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmResetWinnerModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-brand-border bg-brand-card text-brand-muted text-xs font-mono font-semibold hover:text-white transition-all"
                >
                  CANCEL
                </button>
                <button
                  type="button"
                  onClick={handleResetAnnouncement}
                  className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-mono font-bold shadow-lg transition-all"
                >
                  CONFIRM RESET
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
