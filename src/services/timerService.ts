/**
 * SAKTHI HACKFEST '26 - Live Synchronized Hackathon Stage Timer Service
 *
 * Synchronizes timer state between Admin Control Center and Public Stage Screen (/timer, /live-timer)
 * Uses BroadcastChannel + LocalStorage for 0ms instant tab synchronization,
 * with server API fallback (/api/timer) for multi-device network synchronization.
 */

export type TimerStatus = 'IDLE' | 'RUNNING' | 'PAUSED' | 'ENDED'

export interface HackathonTimerState {
  status: TimerStatus
  totalDurationSeconds: number // e.g. 24 * 3600 = 86400
  remainingSeconds: number
  targetEndTime?: number // Timestamp when current countdown will reach 0
  startedAt?: number
  pausedAt?: number
  announcement?: string
  lastUpdated: number
}

const STORAGE_KEY = 'shf26_live_timer_state_v1'
const BROADCAST_CHANNEL_NAME = 'shf26_timer_broadcast'

const DEFAULT_DURATION_SECONDS = 24 * 60 * 60 // 24 Hours default

function getDefaultState(): HackathonTimerState {
  return {
    status: 'IDLE',
    totalDurationSeconds: DEFAULT_DURATION_SECONDS,
    remainingSeconds: DEFAULT_DURATION_SECONDS,
    announcement: 'WELCOME TO SAKTHI HACKFEST 2K26 · BUILD. BREAK. INNOVATE.',
    lastUpdated: Date.now(),
  }
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
            this.currentState = event.data
            this.notifySubscribers()
          }
        }
      } catch {
        this.channel = null
      }
    }

    // Also listen to standard window storage events
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEY && e.newValue) {
          try {
            this.currentState = JSON.parse(e.newValue)
            this.notifySubscribers()
          } catch {
            // ignore
          }
        }
      })
    }
  }

  private loadInitialState(): HackathonTimerState {
    if (typeof window === 'undefined') return getDefaultState()
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed: HackathonTimerState = JSON.parse(raw)
        // If it was running, calculate actual remaining seconds based on targetEndTime
        if (parsed.status === 'RUNNING' && parsed.targetEndTime) {
          const now = Date.now()
          const diff = Math.max(0, Math.round((parsed.targetEndTime - now) / 1000))
          parsed.remainingSeconds = diff
          if (diff <= 0) {
            parsed.status = 'ENDED'
          }
        }
        return parsed
      }
    } catch {
      // ignore
    }
    return getDefaultState()
  }

  private saveState(state: HackathonTimerState) {
    this.currentState = { ...state, lastUpdated: Date.now() }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.currentState))
    } catch {
      // ignore
    }

    // Broadcast to other tabs immediately
    if (this.channel) {
      try {
        this.channel.postMessage(this.currentState)
      } catch {
        // ignore
      }
    }

    // Sync to backend API for multi-device network sync
    this.syncToServer(this.currentState)

    this.notifySubscribers()
  }

  private async syncToServer(state: HackathonTimerState) {
    try {
      await fetch('/api/timer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set_state', state }),
      })
    } catch {
      // Serverless edge fallback or offline mode
    }
  }

  public async fetchServerState(): Promise<HackathonTimerState | null> {
    try {
      const res = await fetch('/api/timer', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        if (data.success && data.state) {
          // If server state is newer, adopt it
          if (!this.currentState || (data.state.lastUpdated && data.state.lastUpdated > this.currentState.lastUpdated)) {
            this.currentState = data.state
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(this.currentState))
            } catch {
              // ignore
            }
            this.notifySubscribers()
          }
          return data.state
        }
      }
    } catch {
      // ignore
    }
    return null
  }

  private notifySubscribers() {
    this.subscribers.forEach((cb) => cb(this.currentState))
  }

  public getState(): HackathonTimerState {
    // Dynamically compute live remaining seconds if RUNNING
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

  // ── Actions ──────────────────────────────────────────────────────────────

  public startTimer(durationSeconds?: number, announcement?: string) {
    const total = durationSeconds ?? this.currentState.totalDurationSeconds
    const targetEndTime = Date.now() + total * 1000

    this.saveState({
      ...this.currentState,
      status: 'RUNNING',
      totalDurationSeconds: total,
      remainingSeconds: total,
      targetEndTime,
      startedAt: Date.now(),
      announcement: announcement !== undefined ? announcement : this.currentState.announcement,
    })
  }

  public resumeTimer() {
    const remaining = this.currentState.remainingSeconds || this.currentState.totalDurationSeconds
    const targetEndTime = Date.now() + remaining * 1000

    this.saveState({
      ...this.currentState,
      status: 'RUNNING',
      remainingSeconds: remaining,
      targetEndTime,
      startedAt: this.currentState.startedAt || Date.now(),
    })
  }

  public pauseTimer() {
    // Freeze current remaining
    let remaining = this.currentState.remainingSeconds
    if (this.currentState.targetEndTime) {
      remaining = Math.max(0, Math.round((this.currentState.targetEndTime - Date.now()) / 1000))
    }

    this.saveState({
      ...this.currentState,
      status: 'PAUSED',
      remainingSeconds: remaining,
      targetEndTime: undefined,
      pausedAt: Date.now(),
    })
  }

  public endTimer() {
    this.saveState({
      ...this.currentState,
      status: 'ENDED',
      remainingSeconds: 0,
      targetEndTime: undefined,
    })
  }

  public resetTimer(durationSeconds?: number) {
    const total = durationSeconds ?? this.currentState.totalDurationSeconds
    this.saveState({
      ...this.currentState,
      status: 'IDLE',
      totalDurationSeconds: total,
      remainingSeconds: total,
      targetEndTime: undefined,
      startedAt: undefined,
      pausedAt: undefined,
    })
  }

  public setAnnouncement(announcement: string) {
    this.saveState({
      ...this.currentState,
      announcement,
    })
  }

  public adjustTime(deltaSeconds: number) {
    if (this.currentState.status === 'RUNNING' && this.currentState.targetEndTime) {
      const newTarget = this.currentState.targetEndTime + deltaSeconds * 1000
      const now = Date.now()
      const newRemaining = Math.max(0, Math.round((newTarget - now) / 1000))
      this.saveState({
        ...this.currentState,
        targetEndTime: newTarget,
        remainingSeconds: newRemaining,
        totalDurationSeconds: Math.max(this.currentState.totalDurationSeconds + deltaSeconds, newRemaining),
      })
    } else {
      const newRemaining = Math.max(0, this.currentState.remainingSeconds + deltaSeconds)
      this.saveState({
        ...this.currentState,
        remainingSeconds: newRemaining,
        totalDurationSeconds: Math.max(this.currentState.totalDurationSeconds + deltaSeconds, newRemaining),
      })
    }
  }
}

export const timerService = new TimerService()
