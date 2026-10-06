import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  QrCode,
  LogOut,
  Users,
  ShieldCheck,
  Loader2,
  AlertCircle,
  RefreshCw,
  BarChart2,
} from 'lucide-react'
import {
  attendanceService,
  type AttendanceTeam,
  type AttendanceRecord,
  type AttendanceMember,
} from '../../services/attendanceApi'
import AttendanceLogin from './AttendanceLogin'
import AttendanceScanner from './AttendanceScanner'
import AttendanceForm from './AttendanceForm'

type DeskState = 'SCANNING' | 'LOADING_TEAM' | 'MARKING' | 'ERROR'

export default function AttendancePage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return attendanceService.isAuthenticated()
  })

  const [deskState, setDeskState] = useState<DeskState>('SCANNING')
  const [currentTeam, setCurrentTeam] = useState<AttendanceTeam | null>(null)
  const [existingRecord, setExistingRecord] = useState<AttendanceRecord | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [totalMarkedCount, setTotalMarkedCount] = useState<number>(0)
  const [currentUser, setCurrentUser] = useState<string>(attendanceService.getUser())

  // Add noindex tag to protect volunteer route from search engines
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

  // Fetch summary stats on load
  const loadStats = useCallback(async () => {
    if (!attendanceService.isAuthenticated()) return
    const res = await attendanceService.getAllAttendance()
    if (res.success) {
      setTotalMarkedCount(res.records.length)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      loadStats()
    }
  }, [isAuthenticated, loadStats])

  const handleLoginSuccess = () => {
    setIsAuthenticated(true)
    setCurrentUser(attendanceService.getUser())
    setDeskState('SCANNING')
    loadStats()
  }

  const handleLogout = () => {
    attendanceService.logout()
    setIsAuthenticated(false)
    setCurrentTeam(null)
    setExistingRecord(null)
    setDeskState('SCANNING')
  }

  // Handle Team Lookup from QR scan or manual search
  const handleTeamLookup = async (teamCode: string, teamNameFallback?: string) => {
    setDeskState('LOADING_TEAM')
    setErrorMessage(null)

    // 1. Fetch team details (names + colleges, stripped of PII)
    const teamRes = await attendanceService.getTeam(teamCode)

    if (!teamRes.success || !teamRes.team) {
      // If direct team lookup didn't find the team, but we have fallback name from QR:
      if (teamNameFallback) {
        // Construct team object with fallback name
        const fallbackTeam: AttendanceTeam = {
          teamCode,
          teamName: teamNameFallback,
          members: [{ name: 'Participant 1', college: 'Sree Sakthi Engineering College' }],
        }
        setCurrentTeam(fallbackTeam)
      } else {
        setErrorMessage(teamRes.error || `No registered team found with Code "${teamCode}".`)
        setDeskState('ERROR')
        return
      }
    } else {
      setCurrentTeam(teamRes.team)
    }

    // 2. Check if attendance already recorded
    const attendRes = await attendanceService.checkAttendance(teamCode)
    if (attendRes.success && attendRes.exists && attendRes.record) {
      setExistingRecord(attendRes.record)
    } else {
      setExistingRecord(null)
    }

    setDeskState('MARKING')
  }

  // Handle Attendance Submission
  const handleSubmitAttendance = async (
    members: AttendanceMember[],
    isEdit: boolean
  ): Promise<{ success: boolean; error?: string }> => {
    if (!currentTeam) return { success: false, error: 'No active team selected.' }

    const res = await attendanceService.submitAttendance({
      teamCode: currentTeam.teamCode,
      teamName: currentTeam.teamName,
      members,
      isEdit,
    })

    if (res.success) {
      loadStats()
      return { success: true }
    } else {
      return { success: false, error: res.error || 'Failed to submit attendance.' }
    }
  }

  const resetToScanner = () => {
    setCurrentTeam(null)
    setExistingRecord(null)
    setErrorMessage(null)
    setDeskState('SCANNING')
  }

  if (!isAuthenticated) {
    return <AttendanceLogin onLoginSuccess={handleLoginSuccess} />
  }

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text flex flex-col relative selection:bg-brand-primary selection:text-white">
      {/* Background Cyber Grid */}
      <div className="bg-cyber-grid absolute inset-0 opacity-15 pointer-events-none" />

      {/* Desk Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-brand-surface/90 backdrop-blur-md border-b border-brand-border/60 px-4 sm:px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-primary/20 to-brand-orange/20 border border-brand-primary/40 flex items-center justify-center text-brand-primary shadow-sm shadow-brand-primary/20">
            <QrCode size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-black text-sm sm:text-base text-white tracking-tight">
                ATTENDANCE <span className="text-brand-primary">DESK</span>
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">
                SHF'26
              </span>
            </div>
            <p className="text-[11px] text-brand-muted font-mono">
              Staff: <span className="text-zinc-200 font-semibold">{currentUser}</span>
            </p>
          </div>
        </div>

        {/* Right Stats & Logout */}
        <div className="flex items-center gap-2.5">
          <div className="hidden xs:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-bg border border-brand-border text-xs font-mono">
            <BarChart2 size={13} className="text-brand-primary" />
            <span className="text-brand-muted">Teams Marked:</span>
            <span className="text-white font-bold">{totalMarkedCount}</span>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            title="Log Out Volunteer Desk"
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 active:scale-95 text-zinc-300 hover:text-white border border-zinc-700 text-xs font-mono flex items-center gap-1.5 transition-all"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 flex items-center justify-center relative z-10">
        <AnimatePresence mode="wait">
          {deskState === 'SCANNING' && (
            <motion.div
              key="scanner"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="w-full"
            >
              <AttendanceScanner
                onScan={(code, name) => handleTeamLookup(code, name)}
                onManualLookup={code => handleTeamLookup(code)}
              />
            </motion.div>
          )}

          {deskState === 'LOADING_TEAM' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-12 text-center flex flex-col items-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-brand-primary/10 border border-brand-primary/30 flex items-center justify-center text-brand-primary mb-4 shadow-lg shadow-brand-primary/10">
                <Loader2 size={32} className="animate-spin" />
              </div>
              <h3 className="font-display font-bold text-lg text-white">Retrieving Team Details</h3>
              <p className="text-xs text-brand-muted font-mono mt-1">
                Querying official Sakthi HackFest registration records...
              </p>
            </motion.div>
          )}

          {deskState === 'MARKING' && currentTeam && (
            <motion.div
              key="marking"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="w-full"
            >
              <AttendanceForm
                team={currentTeam}
                existingRecord={existingRecord}
                onSubmit={handleSubmitAttendance}
                onCancel={resetToScanner}
                onScanNext={resetToScanner}
              />
            </motion.div>
          )}

          {deskState === 'ERROR' && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-md mx-auto bg-brand-surface border border-red-500/40 rounded-3xl p-6 text-center shadow-2xl"
            >
              <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto mb-4">
                <AlertCircle size={32} />
              </div>
              <h3 className="font-display font-bold text-lg text-white">Team Lookup Failed</h3>
              <p className="text-xs sm:text-sm text-zinc-300 mt-2 font-sans">{errorMessage}</p>

              <button
                type="button"
                onClick={resetToScanner}
                className="mt-6 w-full py-3 px-4 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/20"
              >
                <RefreshCw size={14} />
                <span>Return to QR Scanner</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
