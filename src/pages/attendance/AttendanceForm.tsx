import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Users,
  Building,
  Clock,
  ArrowLeft,
  Loader2,
  Edit3,
  Check,
  ShieldAlert,
} from 'lucide-react'
import type { AttendanceTeam, AttendanceRecord, AttendanceMember } from '../../services/attendanceApi'

interface Props {
  team: AttendanceTeam
  existingRecord?: AttendanceRecord | null
  onSubmit: (members: AttendanceMember[], isEdit: boolean) => Promise<{ success: boolean; error?: string }>
  onCancel: () => void
  onScanNext: () => void
}

export default function AttendanceForm({
  team,
  existingRecord,
  onSubmit,
  onCancel,
  onScanNext,
}: Props) {
  // Pre-populate with existing attendance if already recorded, otherwise default all to Present
  const [memberStatuses, setMemberStatuses] = useState<Record<number, 'Present' | 'Absent'>>(() => {
    const initial: Record<number, 'Present' | 'Absent'> = {}
    team.members.forEach((m, idx) => {
      if (existingRecord?.members && existingRecord.members.length > 0) {
        // Try matching by name
        const match = existingRecord.members.find(
          em => em.name.trim().toLowerCase() === m.name.trim().toLowerCase()
        )
        if (match) {
          initial[idx] = match.status === 'Absent' ? 'Absent' : 'Present'
        } else if (existingRecord.members[idx]) {
          initial[idx] = existingRecord.members[idx].status === 'Absent' ? 'Absent' : 'Present'
        } else {
          initial[idx] = 'Present'
        }
      } else {
        initial[idx] = 'Present'
      }
    })
    return initial
  })

  const [isEditing, setIsEditing] = useState<boolean>(!existingRecord)
  const [showWarningModal, setShowWarningModal] = useState<boolean>(false)
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const toggleStatus = (idx: number) => {
    if (!isEditing) return
    setMemberStatuses(prev => ({
      ...prev,
      [idx]: prev[idx] === 'Present' ? 'Absent' : 'Present',
    }))
  }

  const handleStartEdit = () => {
    setShowWarningModal(true)
  }

  const confirmEdit = () => {
    setShowWarningModal(false)
    setIsEditing(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setErrorMessage(null)

    const payloadMembers: AttendanceMember[] = team.members.map((m, idx) => ({
      name: m.name,
      college: m.college || 'N/A',
      status: memberStatuses[idx] || 'Present',
    }))

    const res = await onSubmit(payloadMembers, Boolean(existingRecord))
    setSubmitting(false)

    if (res.success) {
      setSubmitSuccess(true)
    } else {
      setErrorMessage(res.error || 'Failed to submit attendance.')
    }
  }

  const presentCount = Object.values(memberStatuses).filter(s => s === 'Present').length
  const totalCount = team.members.length

  // SUCCESS STATE VIEW
  if (submitSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg mx-auto bg-brand-surface border border-emerald-500/40 rounded-3xl p-6 sm:p-8 text-center shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500" />

        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4 text-emerald-400 shadow-lg shadow-emerald-500/10">
          <CheckCircle2 size={36} />
        </div>

        <h2 className="font-display font-black text-2xl text-white tracking-tight">
          ATTENDANCE <span className="text-emerald-400">RECORDED!</span>
        </h2>

        <p className="text-sm text-brand-muted mt-1">
          Attendance has been saved to the event database.
        </p>

        {/* Team Summary Card */}
        <div className="mt-5 p-4 rounded-2xl bg-brand-bg/80 border border-brand-border/60 text-left space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-brand-muted font-mono uppercase">Team Code:</span>
            <span className="font-mono font-bold text-white bg-zinc-800 px-2 py-0.5 rounded">
              {team.teamCode}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-brand-muted font-mono uppercase">Team Name:</span>
            <span className="font-sans font-bold text-white">{team.teamName}</span>
          </div>
          <div className="flex justify-between items-center text-xs pt-1 border-t border-brand-border/40">
            <span className="text-brand-muted font-mono uppercase">Registered Members:</span>
            <span className="font-mono font-bold text-white">{totalCount}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-brand-muted font-mono uppercase">Present:</span>
            <span className="font-mono font-bold text-emerald-400">{presentCount}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-brand-muted font-mono uppercase">Absent:</span>
            <span className="font-mono font-bold text-rose-400">{totalCount - presentCount}</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            onClick={onScanNext}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-brand-primary to-brand-orange text-white font-display font-bold text-sm tracking-wide shadow-lg shadow-brand-primary/20 hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
          >
            <span>SELECT NEXT TEAM →</span>
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Existing Attendance Warning Modal */}
      <AnimatePresence>
        {showWarningModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-md bg-brand-surface border border-amber-500/40 rounded-3xl p-6 shadow-2xl relative"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
                <ShieldAlert size={28} />
              </div>

              <h3 className="font-display font-bold text-xl text-white tracking-tight">
                Modify Existing Attendance?
              </h3>

              <p className="text-xs sm:text-sm text-zinc-300 mt-2 font-sans leading-relaxed">
                Attendance for <strong className="text-white">{team.teamName}</strong> (
                <span className="font-mono text-brand-primary">{team.teamCode}</span>) has already been
                recorded on{' '}
                <span className="font-mono text-zinc-200">
                  {existingRecord?.timestamp || 'earlier today'}
                </span>
                .
              </p>

              <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 font-sans">
                Are you sure you want to update this team's attendance status? This will update the
                event database record.
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowWarningModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-mono font-bold uppercase transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmEdit}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-mono font-bold uppercase transition-colors"
                >
                  Yes, Edit Status
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="bg-brand-surface border border-brand-border/70 rounded-3xl overflow-hidden shadow-2xl">
        {/* Top Header */}
        <div className="px-5 py-4 bg-brand-bg/80 border-b border-brand-border/60 flex items-center justify-between">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 text-xs font-mono text-brand-muted hover:text-white transition-colors"
          >
            <ArrowLeft size={14} />
            <span>BACK TO TEAM SELECTION</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">
              Total: {totalCount}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              Present: {presentCount}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-rose-500/10 border border-rose-500/30 text-rose-400">
              Absent: {totalCount - presentCount}
            </span>
          </div>
        </div>

        {/* Existing Record Notice Banner */}
        {existingRecord && !isEditing && (
          <div className="mx-5 mt-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <AlertTriangle size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-amber-300 uppercase tracking-wider font-mono">
                  Attendance Already Marked
                </p>
                <p className="text-[11px] text-zinc-400 mt-0.5 font-sans">
                  Recorded on <span className="font-mono text-zinc-300">{existingRecord.timestamp}</span>{' '}
                  by <span className="font-mono text-zinc-300">{existingRecord.markedBy}</span>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleStartEdit}
              className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors flex-shrink-0"
            >
              <Edit3 size={13} />
              <span>Edit</span>
            </button>
          </div>
        )}

        {/* Team Banner Card */}
        <div className="p-5 border-b border-brand-border/40">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-display font-black text-2xl text-white tracking-tight">
              {team.teamName}
            </h2>
            <span className="px-3 py-1 rounded-lg bg-zinc-800 border border-zinc-700 text-brand-primary font-mono font-bold text-xs tracking-wider">
              {team.teamCode}
            </span>
          </div>
        </div>

        {/* Members List */}
        <form onSubmit={handleSubmit}>
          <div className="p-5 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-brand-muted uppercase tracking-wider mb-2">
              <span className="flex items-center gap-1.5">
                <Users size={14} />
                <span>Registered Members ({totalCount})</span>
              </span>
              <span>Tap to Toggle Status</span>
            </div>

            {team.members.map((member, idx) => {
              const isPresent = memberStatuses[idx] === 'Present'
              const isLeader = idx === 0

              return (
                <div
                  key={idx}
                  onClick={() => toggleStatus(idx)}
                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all select-none ${
                    isEditing ? 'cursor-pointer hover:border-brand-primary/50' : 'cursor-default'
                  } ${
                    isPresent
                      ? 'bg-emerald-500/5 border-emerald-500/30 shadow-sm shadow-emerald-500/5'
                      : 'bg-zinc-900/60 border-zinc-800 opacity-70'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    {/* Left Member Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-sans font-bold text-sm sm:text-base text-white truncate">
                          {member.name}
                        </span>
                        {isLeader && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-brand-primary/20 text-brand-primary border border-brand-primary/30">
                            Leader
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 mt-1 text-xs text-brand-muted truncate">
                        <Building size={12} className="flex-shrink-0" />
                        <span className="truncate">{member.college || 'College details registered'}</span>
                      </div>
                    </div>

                    {/* Right Attendance Status Toggle */}
                    <div className="flex-shrink-0">
                      <div
                        className={`px-3 py-1.5 rounded-xl font-mono font-bold text-xs flex items-center gap-1.5 transition-all ${
                          isPresent
                            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                            : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                        }`}
                      >
                        {isPresent ? (
                          <>
                            <Check size={14} strokeWidth={3} />
                            <span>PRESENT</span>
                          </>
                        ) : (
                          <>
                            <XCircle size={14} />
                            <span>ABSENT</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {errorMessage && (
            <div className="mx-5 mb-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs sm:text-sm">
              {errorMessage}
            </div>
          )}

          {/* Action Footer */}
          <div className="p-5 bg-brand-bg/60 border-t border-brand-border/60 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="py-3 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-mono font-bold uppercase tracking-wider transition-colors order-2 sm:order-1"
            >
              Cancel
            </button>

            {isEditing ? (
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-brand-primary to-brand-orange text-white text-xs sm:text-sm font-display font-bold uppercase tracking-wider shadow-lg shadow-brand-primary/20 hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 order-1 sm:order-2"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>SAVING ATTENDANCE...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    <span>
                      {existingRecord ? 'CONFIRM & UPDATE ATTENDANCE' : 'SUBMIT ATTENDANCE'} (
                      {presentCount}/{totalCount})
                    </span>
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={onScanNext}
                className="flex-1 py-3 px-4 rounded-xl bg-zinc-700 hover:bg-zinc-600 text-white text-xs sm:text-sm font-mono font-bold uppercase tracking-wider transition-colors order-1 sm:order-2"
              >
                Select Next Team →
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
