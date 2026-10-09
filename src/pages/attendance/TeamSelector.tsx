import { useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Users,
  ChevronDown,
  Loader2,
  AlertCircle,
  RefreshCw,
  Building2,
  Check,
  X,
} from 'lucide-react'
import {
  attendanceService,
  type AttendanceTeamItem,
} from '../../services/attendanceApi'

interface Props {
  onSelectTeam: (teamCode: string, teamName?: string) => void
  selectedTeamCode?: string
}

export default function TeamSelector({ onSelectTeam, selectedTeamCode }: Props) {
  const [teams, setTeams] = useState<AttendanceTeamItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [isOpen, setIsOpen] = useState<boolean>(false)

  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const fetchTeams = async () => {
    setLoading(true)
    setError(null)
    const res = await attendanceService.getTeams()
    setLoading(false)

    if (res.success && res.teams) {
      // Deduplicate teams by teamCode to prevent duplicate entries
      const uniqueMap = new Map<string, AttendanceTeamItem>()
      res.teams.forEach(t => {
        if (t.teamCode && !uniqueMap.has(t.teamCode.toUpperCase())) {
          uniqueMap.set(t.teamCode.toUpperCase(), t)
        }
      })
      setTeams(Array.from(uniqueMap.values()))
    } else {
      setError(res.error || 'Failed to load registered teams from server.')
    }
  }

  useEffect(() => {
    fetchTeams()
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Filter teams as volunteer types:
  // Primary filter based on Team Name; also matches Team Code for convenience
  const filteredTeams = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return teams
    return teams.filter(
      t =>
        t.teamName.toLowerCase().includes(q) ||
        t.teamCode.toLowerCase().includes(q)
    )
  }, [teams, searchQuery])

  const handleSelect = (team: AttendanceTeamItem) => {
    setSearchQuery(team.teamName)
    setIsOpen(false)
    onSelectTeam(team.teamCode, team.teamName)
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    inputRef.current?.focus()
  }

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center" ref={dropdownRef}>
      {/* Main Container Card */}
      <div className="w-full bg-brand-surface border border-brand-border/70 rounded-3xl overflow-hidden shadow-2xl relative">
        {/* Top Header */}
        <div className="px-5 py-4 bg-brand-bg/80 border-b border-brand-border/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-primary animate-pulse" />
            <span className="text-xs font-mono font-medium text-white tracking-wider">
              SELECT REGISTERED TEAM
            </span>
          </div>

          <span className="text-[11px] font-mono text-brand-muted">
            {loading ? (
              <span className="flex items-center gap-1.5 text-zinc-400">
                <Loader2 size={12} className="animate-spin text-brand-primary" />
                Loading teams...
              </span>
            ) : (
              <span>{teams.length} teams registered</span>
            )}
          </span>
        </div>

        {/* Content Body */}
        <div className="p-6">
          <label className="block text-xs font-mono uppercase tracking-wider text-brand-muted mb-2">
            Search Team by Name
          </label>

          {/* Search Input Box */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted w-4 h-4" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onFocus={() => setIsOpen(true)}
              onChange={e => {
                setSearchQuery(e.target.value)
                setIsOpen(true)
              }}
              placeholder="Start typing team name (e.g. Synovate, ByteForce)..."
              disabled={loading || Boolean(error)}
              className="w-full bg-brand-bg/90 border border-brand-border rounded-2xl pl-10 pr-20 py-3.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all disabled:opacity-50"
            />

            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                  title="Clear search"
                >
                  <X size={14} />
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(prev => !prev)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
              </button>
            </div>
          </div>

          {/* Error Message with Retry */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-start gap-2.5">
                <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold font-mono uppercase text-xs text-red-300">
                    Failed to Load Teams
                  </p>
                  <p className="text-zinc-300 text-xs mt-0.5">{error}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={fetchTeams}
                className="px-3.5 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors self-end sm:self-auto flex-shrink-0"
              >
                <RefreshCw size={13} />
                <span>Retry</span>
              </button>
            </motion.div>
          )}

          {/* Loading Indicator */}
          {loading && !error && (
            <div className="py-10 text-center flex flex-col items-center justify-center">
              <Loader2 size={28} className="animate-spin text-brand-primary mb-3" />
              <p className="text-xs font-mono text-brand-muted">
                Loading official registered teams...
              </p>
            </div>
          )}

          {/* Searchable Dropdown Results List */}
          <AnimatePresence>
            {!loading && !error && isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mt-3 max-h-72 overflow-y-auto rounded-2xl border border-brand-border/80 bg-brand-bg/95 backdrop-blur-md shadow-2xl divide-y divide-brand-border/40 scrollbar-thin scrollbar-thumb-zinc-700"
              >
                {filteredTeams.length === 0 ? (
                  <div className="p-6 text-center">
                    <p className="text-xs font-mono text-zinc-400">
                      No registered teams found matching &ldquo;{searchQuery}&rdquo;
                    </p>
                    <p className="text-[11px] text-zinc-500 mt-1">
                      Check spelling or try searching by Team ID.
                    </p>
                  </div>
                ) : (
                  filteredTeams.map(t => {
                    const isSelected = selectedTeamCode === t.teamCode
                    return (
                      <button
                        key={t.teamCode}
                        type="button"
                        onClick={() => handleSelect(t)}
                        className={`w-full p-3.5 text-left flex items-center justify-between gap-3 hover:bg-zinc-800/60 active:bg-zinc-800 transition-colors ${
                          isSelected ? 'bg-brand-primary/10 border-l-2 border-brand-primary' : ''
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="font-sans font-bold text-sm text-white truncate">
                            {t.teamName}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-brand-primary">
                              {t.teamCode}
                            </span>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-brand-primary/20 flex items-center justify-center text-brand-primary flex-shrink-0">
                            <Check size={14} />
                          </div>
                        )}
                      </button>
                    )
                  })
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Helper Tips */}
          {!loading && !error && !isOpen && (
            <div className="mt-4 p-3.5 rounded-2xl bg-brand-bg/60 border border-brand-border/40 text-center">
              <p className="text-[11px] font-mono text-zinc-400 flex items-center justify-center gap-1.5">
                <Users size={13} className="text-brand-primary" />
                <span>Click the search bar to browse or search from all {teams.length} teams</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
