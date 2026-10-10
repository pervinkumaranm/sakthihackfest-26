/**
 * SAKTHI HACKFEST '26 - Live Synchronized Hackathon Stage Timer Service
 *
 * Synchronizes timer state between Admin Control Center and Public Stage Screen (/timer, /live-timer)
 * Single Source of Truth: /api/timer (Supabase app_settings)
 * Uses BroadcastChannel + LocalStorage for 0ms instant tab synchronization,
 * with periodic server API polling for robust multi-device network synchronization.
 */

import { apiService } from './api'

export type TimerStatus = 'STOPPED' | 'RUNNING' | 'PAUSED' | 'ENDED' | 'IDLE'

export interface HackathonTimerState {
  status: TimerStatus
  configuredDurationSeconds: number // e.g. 24 * 3600 = 86400
  totalDurationSeconds: number // for backwards compatibility
  remainingSeconds: number
  targetEndTime?: number | null // Timestamp ms when current countdown will reach 0
  startedAt?: number | null
  pausedAt?: number | null
  stoppedAt?: number | null
  announcement?: string
  version?: number
  lastUpdated: number
  updatedBy?: string
}

const STORAGE_KEY = 'shf26_live_timer_state_v2'
const BROADCAST_CHANNEL_NAME = 'shf26_timer_broadcast_v2'

const DEFAULT_DURATION_SECONDS = 24 * 60 * 60 // 24 Hours default

function getDefaultState(): HackathonTimerState {
  return {
    status: 'STOPPED',
    configuredDurationSeconds: DEFAULT_DURATION_SECONDS,
    totalDurationSeconds: DEFAULT_DURATION_SECONDS,
    remainingSeconds: DEFAULT_DURATION_SECONDS,
    targetEndTime: null,
    startedAt: null,
    pausedAt: null,
    stoppedAt: null,
    announcement: 'WELCOME TO SAKTHI HACKFEST 2K26 · BUILD. BREAK. INNOVATE.',
    version: 1,
    lastUpdated: Date.now(),
    updatedBy: 'system',
  };
}

class TimerService {
  private channel: BroadcastChannel | null = null
  private subscribers: Set<(state: HackathonTimerState) => void> = new Set()
  private currentState: HackathonTimerState

  constructor() {
    this.currentState = this.loadInitialState()

    // Initialize BroadcastChannel for instant inter-tab sync
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME)
        this.channel.onmessage = (event) => {
          if (event.data && typeof event.data === 'object') {
            this.adoptState(event.data)
          }
        }
      } catch {
        this.channel = null
      }
    }

    // Listen to standard window storage events
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEY && e.newValue) {
          try {
            const parsed = JSON.parse(e.newValue)
            this.adoptState(parsed)
          } catch {
            // ignore
          }
        }
      })
    }

    // Immediately trigger server sync
    if (typeof window !== 'undefined') {
      this.fetchServerState().catch(() => {})
    }
  }

  private loadInitialState(): HackathonTimerState {
    if (typeof window === 'undefined') return getDefaultState()
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed: HackathonTimerState = JSON.parse(raw)
        // Normalize status
        if (parsed.status as string === 'IDLE') {
          parsed.status = 'STOPPED'
        }
        if (!parsed.configuredDurationSeconds) {
          parsed.configuredDurationSeconds = parsed.totalDurationSeconds || DEFAULT_DURATION_SECONDS
        }
        if (!parsed.totalDurationSeconds) {
          parsed.totalDurationSeconds = parsed.configuredDurationSeconds
        }
        return parsed
      }
    } catch {
      // ignore
    }
    return getDefaultState()
  }

  private adoptState(incoming: HackathonTimerState) {
    if (!incoming) return

    // Normalize
    const normalized: HackathonTimerState = {
      ...incoming,
      status: incoming.status as string === 'IDLE' ? 'STOPPED' : incoming.status,
      configuredDurationSeconds: incoming.configuredDurationSeconds || incoming.totalDurationSeconds || DEFAULT_DURATION_SECONDS,
      totalDurationSeconds: incoming.totalDurationSeconds || incoming.configuredDurationSeconds || DEFAULT_DURATION_SECONDS,
    }

    this.currentState = normalized
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.currentState))
    } catch {
      // ignore
    }
    this.notifySubscribers()
  }

  private notifySubscribers() {
    const live = this.getState()
    this.subscribers.forEach((cb) => cb(live))
  }

  public getState(): HackathonTimerState {
    // Dynamically compute live remaining seconds if RUNNING based on authoritative targetEndTime
    if (this.currentState.status === 'RUNNING' && this.currentState.targetEndTime) {
      const now = Date.now()
      const diff = Math.max(0, Math.round((this.currentState.targetEndTime - now) / 1000))
      return {
        ...this.currentState,
        remainingSeconds: diff,
        status: diff <= 0 ? 'ENDED' : 'RUNNING',
      }
    }
    return this.currentState
  }

  public subscribe(callback: (state: HackathonTimerState) => void): () => void {
    this.subscribers.add(callback)
    callback(this.getState())
    return () => {
      this.subscribers.delete(callback)
    }
  }

  // ── Network Fetch from Authoritative API ─────────────────────────────────

  public async fetchServerState(): Promise<HackathonTimerState | null> {
    try {
      const res = await fetch('/api/timer', {
        headers: { 'Cache-Control': 'no-cache' },
        cache: 'no-store',
      })

      if (res.ok) {
        const data = await res.json()
        if (data.success && data.state) {
          const serverState: HackathonTimerState = data.state

          // Check if server state has updates
          const isDifferent =
            !this.currentState ||
            serverState.version !== this.currentState.version ||
            serverState.status !== this.currentState.status ||
            serverState.targetEndTime !== this.currentState.targetEndTime ||
            serverState.configuredDurationSeconds !== this.currentState.configuredDurationSeconds ||
            serverState.announcement !== this.currentState.announcement ||
            (serverState.status !== 'RUNNING' && Math.abs(serverState.remainingSeconds - this.currentState.remainingSeconds) > 1)

          if (isDifferent) {
            this.adoptState(serverState)
          }
          return this.getState()
        }
      }
    } catch (err) {
      console.warn('[TimerService] Server fetch failed:', err)
    }
    return null
  }

  // ── Mutating API Dispatcher (Requires Admin Auth) ─────────────────────────

  private async dispatchAction(
    action: string,
    payload: Record<string, any> = {}
  ): Promise<{ success: boolean; state?: HackathonTimerState; error?: string }> {
    const token = apiService.getAdminToken()

    try {
      const res = await fetch('/api/timer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`,
        },
        body: JSON.stringify({ action, ...payload }),
      })

      const data = await res.json()
      if (res.ok && data.success && data.state) {
        this.adoptState(data.state)

        // Broadcast to other tabs on this origin
        if (this.channel) {
          try {
            this.channel.postMessage(this.currentState)
          } catch {
            // ignore
          }
        }

        return { success: true, state: this.currentState }
      }

      const errorMsg = data.error || `Failed to execute timer action '${action}' (HTTP ${res.status}).`
      console.error(`[TimerService] Action '${action}' failed:`, errorMsg)
      return { success: false, error: errorMsg }
    } catch (err: any) {
      const errorMsg = err.message || 'Network error occurred while updating stage timer.'
      console.error(`[TimerService] Network error during action '${action}':`, err)
      return { success: false, error: errorMsg }
    }
  }

  // ── High-Level Actions ───────────────────────────────────────────────────

  /**
   * Configure authoritative timer duration without starting the countdown.
   * Persists configured duration in the database.
   */
  public async configureDuration(durationSeconds: number) {
    return this.dispatchAction('configure', { durationSeconds })
  }

  /**
   * Explicitly starts the timer for the configured duration.
   */
  public async startTimer(durationSeconds?: number, announcement?: string) {
    return this.dispatchAction('start', { durationSeconds, announcement })
  }

  /**
   * Restarts the timer cleanly from the configured duration.
   */
  public async restartTimer(durationSeconds?: number, announcement?: string) {
    return this.dispatchAction('restart', { durationSeconds, announcement })
  }

  /**
   * Explicitly stops the timer and persists STOPPED status with current remaining time.
   */
  public async stopTimer() {
    return this.dispatchAction('stop')
  }

  /**
   * Temporarily pauses the timer.
   */
  public async pauseTimer() {
    return this.dispatchAction('pause')
  }

  /**
   * Resumes countdown from paused or stopped state.
   */
  public async resumeTimer() {
    return this.dispatchAction('resume')
  }

  /**
   * Resets timer back to full configured duration in ready/stopped state.
   */
  public async resetTimer(durationSeconds?: number) {
    return this.dispatchAction('reset', { durationSeconds })
  }

  /**
   * Triggers Code Freeze / Hackathon End.
   */
  public async endTimer() {
    return this.dispatchAction('end')
  }

  /**
   * Emergency time extension or deduction (+/- seconds).
   */
  public async adjustTime(deltaSeconds: number) {
    return this.dispatchAction('adjust_time', { deltaSeconds })
  }

  /**
   * Broadcasts ticker message to all projector screens.
   */
  public async setAnnouncement(announcement: string) {
    return this.dispatchAction('set_announcement', { announcement })
  }
}

export const timerService = new TimerService()
