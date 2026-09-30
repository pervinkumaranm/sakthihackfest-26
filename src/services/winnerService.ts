/**
 * SAKTHI HACKFEST '26 - Live Synchronized Winner Announcement Service
 *
 * Synchronizes multi-stage winner reveals between Admin Controller and Public /leaderboard Screen
 * Uses BroadcastChannel + LocalStorage for 0ms instant tab synchronization,
 * with server API fallback (/api/winners) for multi-device network synchronization.
 */

export type WinnerAnnouncementStage =
  | 'NOT_STARTED'
  | 'THIRD_ANNOUNCED'
  | 'THIRD_DISTRIBUTION_COMPLETE'
  | 'SECOND_ANNOUNCED'
  | 'SECOND_DISTRIBUTION_COMPLETE'
  | 'COUNTDOWN_RUNNING'
  | 'FIRST_ANNOUNCED'
  | 'COMPLETED';

export interface WinnerTeamRecord {
  registrationId: string;
  teamName: string;
  teamLeader: string;
  college?: string;
  domain?: string;
  projectTitle?: string;
}

export interface WinnerAnnouncementState {
  stage: WinnerAnnouncementStage;
  firstPlace: WinnerTeamRecord | null;
  secondPlace: WinnerTeamRecord | null;
  thirdPlace: WinnerTeamRecord | null;
  countdownStartTime?: number;
  thirdAnnouncedAt?: number;
  secondAnnouncedAt?: number;
  firstAnnouncedAt?: number;
  completedAt?: number;
  lastUpdated: number;
}

const STORAGE_KEY = 'shf26_winner_announcement_state_v1';
const BROADCAST_CHANNEL_NAME = 'shf26_winner_broadcast';

function getDefaultState(): WinnerAnnouncementState {
  return {
    stage: 'NOT_STARTED',
    firstPlace: null,
    secondPlace: null,
    thirdPlace: null,
    lastUpdated: Date.now(),
  };
}

class WinnerService {
  private channel: BroadcastChannel | null = null;
  private subscribers: Set<(state: WinnerAnnouncementState) => void> = new Set();
  private currentState: WinnerAnnouncementState;

  constructor() {
    this.currentState = this.loadInitialState();

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        this.channel.onmessage = (event) => {
          if (event.data && typeof event.data === 'object' && event.data.stage) {
            this.currentState = event.data;
            this.notifySubscribers();
          }
        };
      } catch {
        this.channel = null;
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEY && e.newValue) {
          try {
            this.currentState = JSON.parse(e.newValue);
            this.notifySubscribers();
          } catch {
            // ignore
          }
        }
      });

      // Periodically poll server in case of cross-device synchronization
      this.fetchServerState();
      setInterval(() => {
        this.fetchServerState();
      }, 3000);
    }
  }

  private loadInitialState(): WinnerAnnouncementState {
    if (typeof window === 'undefined') return getDefaultState();
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          ...getDefaultState(),
          ...parsed,
        };
      }
    } catch {
      // ignore
    }
    return getDefaultState();
  }

  private saveState(state: WinnerAnnouncementState) {
    this.currentState = { ...state, lastUpdated: Date.now() };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.currentState));
    } catch {
      // ignore
    }

    if (this.channel) {
      try {
        this.channel.postMessage(this.currentState);
      } catch {
        // ignore
      }
    }

    this.syncToServer(this.currentState);
    this.notifySubscribers();
  }

  private async syncToServer(state: WinnerAnnouncementState) {
    try {
      await fetch('/api/winners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set_state', state }),
      });
    } catch {
      // Offline fallback
    }
  }

  public async fetchServerState(): Promise<WinnerAnnouncementState | null> {
    try {
      const res = await fetch('/api/winners', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.state) {
          if (!this.currentState || (data.state.lastUpdated && data.state.lastUpdated > this.currentState.lastUpdated)) {
            this.currentState = data.state;
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(this.currentState));
            } catch {
              // ignore
            }
            this.notifySubscribers();
          }
          return data.state;
        }
      }
    } catch {
      // ignore
    }
    return null;
  }

  private notifySubscribers() {
    this.subscribers.forEach((cb) => cb(this.currentState));
  }

  public getState(): WinnerAnnouncementState {
    return this.currentState;
  }

  public subscribe(callback: (state: WinnerAnnouncementState) => void): () => void {
    this.subscribers.add(callback);
    callback(this.getState());
    return () => {
      this.subscribers.delete(callback);
    };
  }

  // ── Admin Controller Action Triggers ──────────────────────────────────────

  public setWinners(
    first: WinnerTeamRecord | null,
    second: WinnerTeamRecord | null,
    third: WinnerTeamRecord | null
  ) {
    this.saveState({
      ...this.currentState,
      firstPlace: first,
      secondPlace: second,
      thirdPlace: third,
    });
  }

  public announceThird() {
    this.saveState({
      ...this.currentState,
      stage: 'THIRD_ANNOUNCED',
      thirdAnnouncedAt: Date.now(),
    });
  }

  public completeThirdDistribution() {
    this.saveState({
      ...this.currentState,
      stage: 'THIRD_DISTRIBUTION_COMPLETE',
    });
  }

  public announceSecond() {
    this.saveState({
      ...this.currentState,
      stage: 'SECOND_ANNOUNCED',
      secondAnnouncedAt: Date.now(),
    });
  }

  public completeSecondDistribution() {
    this.saveState({
      ...this.currentState,
      stage: 'SECOND_DISTRIBUTION_COMPLETE',
    });
  }

  public startCountdown() {
    this.saveState({
      ...this.currentState,
      stage: 'COUNTDOWN_RUNNING',
      countdownStartTime: Date.now(),
    });
  }

  public announceFirst() {
    this.saveState({
      ...this.currentState,
      stage: 'FIRST_ANNOUNCED',
      firstAnnouncedAt: Date.now(),
    });
  }

  public completeAnnouncement() {
    this.saveState({
      ...this.currentState,
      stage: 'COMPLETED',
      completedAt: Date.now(),
    });
  }

  public resetAnnouncement() {
    this.saveState({
      ...this.currentState,
      stage: 'NOT_STARTED',
      countdownStartTime: undefined,
      thirdAnnouncedAt: undefined,
      secondAnnouncedAt: undefined,
      firstAnnouncedAt: undefined,
      completedAt: undefined,
    });
  }
}

export const winnerService = new WinnerService();
