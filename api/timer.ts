/**
 * SAKTHI HACKFEST 2K26 — Live Stage Timer Authoritative API
 * Endpoint: /api/timer
 *
 * Single Source of Truth: Supabase PostgreSQL (public.app_settings, key: 'hackathon_timer')
 * with robust local persistence fallback for offline development.
 *
 * Enforces:
 * - Admin authorization for mutating actions
 * - Monotonic timestamp and deadline calculations (no interval drift)
 * - Persisted configured duration across refreshes and restarts
 * - Authoritative lifecycle states: STOPPED, RUNNING, PAUSED, ENDED
 */

import path from 'path';
import fs from 'fs';
import crypto from 'node:crypto';
import process from 'node:process';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const config = {
  maxDuration: 15,
};

export type TimerStatus = 'STOPPED' | 'RUNNING' | 'PAUSED' | 'ENDED';

export interface PersistedTimerState {
  status: TimerStatus;
  configuredDurationSeconds: number; // e.g. 86400 (24h)
  totalDurationSeconds: number; // for backward compatibility
  remainingSeconds: number; // accurately calculated if running, frozen if paused/stopped
  targetEndTime: number | null; // UTC timestamp (ms) when countdown reaches 0
  startedAt: number | null; // UTC timestamp (ms)
  pausedAt: number | null; // UTC timestamp (ms)
  stoppedAt: number | null; // UTC timestamp (ms)
  announcement: string;
  version: number;
  lastUpdated: number;
  updatedBy: string;
}

const DEFAULT_DURATION_SECONDS = 24 * 60 * 60; // 24 Hours default

function getDefaultState(): PersistedTimerState {
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
    lastUpdated: 1775836800000,
    updatedBy: 'system',
  };
}

// ── In-Memory Fast Cache ───────────────────────────────────────────────────
let cachedTimerState: PersistedTimerState = getDefaultState();
let cacheTimestamp = 0;
const CACHE_TTL_MS = 1000; // 1 second fast cache

// ── Local Fallback File Persistence (for offline / dev server) ─────────────
const LOCAL_STORAGE_FILE = path.resolve(process.cwd(), '.timer_state.local.json');

function readLocalFallback(): PersistedTimerState | null {
  try {
    if (fs.existsSync(LOCAL_STORAGE_FILE)) {
      const raw = fs.readFileSync(LOCAL_STORAGE_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.configuredDurationSeconds === 'number') {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('[TimerAPI] Failed to read local fallback file:', e);
  }
  return null;
}

function writeLocalFallback(state: PersistedTimerState) {
  try {
    fs.writeFileSync(LOCAL_STORAGE_FILE, JSON.stringify(state, null, 2), 'utf8');
  } catch (e) {
    console.warn('[TimerAPI] Failed to write local fallback file:', e);
  }
}

// ── Supabase Integration ───────────────────────────────────────────────────
let cachedSupabase: SupabaseClient | null = null;

function loadLocalEnvIfNeeded() {
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      content.split('\n').forEach((line: string) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx !== -1) {
          const key = trimmed.slice(0, eqIdx).trim();
          let val = trimmed.slice(eqIdx + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          if (val && !process.env[key]) {
            process.env[key] = val;
          }
        }
      });
    }
  } catch (_) {}
}

function getSupabase(): SupabaseClient {
  if (cachedSupabase) return cachedSupabase;
  loadLocalEnvIfNeeded();

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase configuration.');
  }

  cachedSupabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cachedSupabase;
}

function isSupabaseConfigured(): boolean {
  loadLocalEnvIfNeeded();
  return Boolean(
    (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL) &&
    (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY)
  );
}

// ── Admin Authentication Verification ──────────────────────────────────────
function getAdminSecret(): string {
  loadLocalEnvIfNeeded();
  return (
    process.env.ADMIN_JWT_SECRET ||
    process.env.GOOGLE_PRIVATE_KEY?.slice(0, 32) ||
    'sakthi-hackfest-2026-admin-secret-seed-982341'
  );
}

function verifyAdminToken(token?: string): { valid: boolean; username?: string } {
  if (!token) return { valid: false };
  const parts = token.split('.');
  if (parts.length !== 2) return { valid: false };

  const [encodedPayload, signature] = parts;
  const secret = getAdminSecret();
  const expectedSig = crypto
    .createHmac('sha256', secret)
    .update(encodedPayload)
    .digest('base64url');

  if (signature !== expectedSig) return { valid: false };

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
    if (!payload.exp || Date.now() > payload.exp) {
      return { valid: false };
    }
    return { valid: true, username: payload.username || payload.u || 'admin' };
  } catch {
    return { valid: false };
  }
}

// ── Authoritative State Read & Write ───────────────────────────────────────

async function getTimerFromDb(): Promise<PersistedTimerState | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('app_settings')
    .select('value, updated_at, updated_by')
    .eq('key', 'hackathon_timer')
    .single();

  if (error || !data || !data.value) {
    return null;
  }

  let val = data.value as any;
  if (typeof val === 'string') {
    try {
      val = JSON.parse(val);
    } catch (_) {}
  }

  // Normalize fields
  const status: TimerStatus =
    val.status === 'RUNNING' ? 'RUNNING' :
    val.status === 'PAUSED' ? 'PAUSED' :
    val.status === 'ENDED' ? 'ENDED' : 'STOPPED';

  const configured = Number(val.configuredDurationSeconds || val.totalDurationSeconds || DEFAULT_DURATION_SECONDS);

  let remaining = configured;
  if (status === 'RUNNING' && typeof val.targetEndTime === 'number') {
    const diff = Math.max(0, Math.round((val.targetEndTime - Date.now()) / 1000));
    remaining = diff;
  } else if (status === 'PAUSED' && typeof val.remainingSeconds === 'number' && val.remainingSeconds > 0) {
    remaining = val.remainingSeconds;
  } else if (status === 'ENDED') {
    remaining = 0;
  } else {
    // When STOPPED, countdown always starts cleanly from the configured duration!
    remaining = configured;
  }

  return {
    status,
    configuredDurationSeconds: configured,
    totalDurationSeconds: configured,
    remainingSeconds: remaining,
    targetEndTime: status === 'RUNNING' && typeof val.targetEndTime === 'number' ? val.targetEndTime : null,
    startedAt: typeof val.startedAt === 'number' ? val.startedAt : null,
    pausedAt: typeof val.pausedAt === 'number' ? val.pausedAt : null,
    stoppedAt: typeof val.stoppedAt === 'number' ? val.stoppedAt : null,
    announcement: val.announcement || 'WELCOME TO SAKTHI HACKFEST 2K26 · BUILD. BREAK. INNOVATE.',
    version: typeof val.version === 'number' ? val.version : 1,
    lastUpdated: typeof val.lastUpdated === 'number' ? val.lastUpdated : Date.now(),
    updatedBy: data.updated_by || val.updatedBy || 'admin',
  };
}

async function setTimerInDb(state: PersistedTimerState, updatedBy: string): Promise<PersistedTimerState> {
  const supabase = getSupabase();
  const nowIso = new Date().toISOString();

  const record = {
    key: 'hackathon_timer',
    value: state,
    updated_at: nowIso,
    updated_by: updatedBy,
  };

  // Try standard upsert first
  const { error } = await supabase.from('app_settings').upsert(record);
  if (error) {
    // Try update if row already exists
    const updateRes = await supabase
      .from('app_settings')
      .update({ value: state, updated_at: nowIso, updated_by: updatedBy })
      .eq('key', 'hackathon_timer');
    if (updateRes.error) {
      console.warn('[TimerAPI] Both upsert and update failed on app_settings:', error.message, updateRes.error.message);
      // Try insert if row did not exist
      const insertRes = await supabase.from('app_settings').insert(record);
      if (insertRes.error) {
        console.error('[TimerAPI] Insert failed as well:', insertRes.error.message);
        throw new Error(`Failed to save timer in Supabase app_settings: ${error.message}`);
      }
    }
  }

  return state;
}

export async function fetchAuthoritativeTimer(forceRefresh = false): Promise<PersistedTimerState> {
  const now = Date.now();
  if (!forceRefresh && now - cacheTimestamp < CACHE_TTL_MS && cachedTimerState) {
    return calculateLiveRemaining(cachedTimerState);
  }

  if (isSupabaseConfigured()) {
    try {
      const dbState = await getTimerFromDb();
      if (dbState) {
        cachedTimerState = dbState;
        cacheTimestamp = now;
        return calculateLiveRemaining(cachedTimerState);
      } else {
        // First-time initialization in DB
        const initial = getDefaultState();
        await setTimerInDb(initial, 'system');
        cachedTimerState = initial;
        cacheTimestamp = now;
        return calculateLiveRemaining(cachedTimerState);
      }
    } catch (err) {
      console.warn('[TimerAPI] Error reading from Supabase app_settings:', err);
    }
  }

  // Local fallback persistence
  const local = readLocalFallback();
  if (local) {
    cachedTimerState = local;
  }
  cacheTimestamp = now;
  return calculateLiveRemaining(cachedTimerState);
}

export async function persistTimerState(
  state: PersistedTimerState,
  updatedBy: string
): Promise<PersistedTimerState> {
  state.version = (state.version || 0) + 1;
  state.lastUpdated = Date.now();
  state.updatedBy = updatedBy;

  if (isSupabaseConfigured()) {
    try {
      await setTimerInDb(state, updatedBy);
    } catch (err) {
      console.error('[TimerAPI] Error persisting to Supabase:', err);
      // Also write local fallback in case of transient DB error
      writeLocalFallback(state);
      throw err;
    }
  }

  // Always write local fallback so dev and edge instances stay updated
  writeLocalFallback(state);
  cachedTimerState = state;
  cacheTimestamp = Date.now();

  return calculateLiveRemaining(state);
}

/**
 * Accurately calculate live remaining time for a RUNNING timer based on targetEndTime.
 * Never mutates DB on simple reads, but detects expiration.
 */
function calculateLiveRemaining(state: PersistedTimerState): PersistedTimerState {
  if (state.status === 'RUNNING' && state.targetEndTime) {
    const now = Date.now();
    const remaining = Math.max(0, Math.round((state.targetEndTime - now) / 1000));
    if (remaining <= 0) {
      return {
        ...state,
        status: 'ENDED',
        remainingSeconds: 0,
        targetEndTime: null,
      };
    }
    return {
      ...state,
      remainingSeconds: remaining,
    };
  }
  if (state.status === 'STOPPED') {
    return {
      ...state,
      remainingSeconds: state.configuredDurationSeconds || DEFAULT_DURATION_SECONDS,
      targetEndTime: null,
    };
  }
  return state;
}

// ── HTTP Request Handler ───────────────────────────────────────────────────

export default async function handler(req: any, res?: any) {
  const isEdge = req instanceof Request || (!res && typeof req.json === 'function');
  const urlObj = isEdge ? new URL(req.url, 'http://localhost') : null;
  const method = isEdge ? req.method : req.method;

  const corsHeaders: Record<string, string> = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  };

  const send = (status: number, data: any) => {
    if (isEdge) {
      return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
    if (typeof res?.setHeader === 'function') {
      Object.entries(corsHeaders).forEach(([k, v]) => res.setHeader(k, v));
    }
    return res.status(status).json(data);
  };

  if (method === 'OPTIONS') {
    if (isEdge) {
      return new Response(null, { status: 200, headers: corsHeaders });
    }
    if (typeof res?.setHeader === 'function') {
      Object.entries(corsHeaders).forEach(([k, v]) => res.setHeader(k, v));
    }
    return res.status(200).end();
  }

  // ── GET: Public fetch of current authoritative timer state ───────────────
  if (method === 'GET') {
    try {
      const forceParam = isEdge
        ? urlObj?.searchParams.get('force') === 'true'
        : req.query?.force === 'true';
      const liveState = await fetchAuthoritativeTimer(forceParam);

      // If timer has naturally concluded, transition persisted state to ENDED
      if (liveState.status === 'ENDED' && cachedTimerState.status === 'RUNNING') {
        try {
          await persistTimerState(liveState, 'system');
        } catch (_) {}
      }

      return send(200, {
        success: true,
        state: liveState,
      });
    } catch (err: any) {
      console.error('[TimerAPI] Error handling GET:', err);
      return send(500, {
        success: false,
        error: 'Failed to retrieve authoritative timer state.',
      });
    }
  }

  // ── POST: Protected timer operations (Admin only) ────────────────────────
  if (method === 'POST') {
    let rawBody: any = {};
    try {
      rawBody = isEdge
        ? await req.json()
        : (typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {}));
    } catch {
      rawBody = {};
    }
    const body = rawBody || {};

    const authHeader = isEdge
      ? (req.headers.get('authorization') || req.headers.get('Authorization') || '')
      : (req.headers?.authorization || req.headers?.Authorization || (typeof req.headers?.get === 'function' ? req.headers.get('authorization') : '') || '');

    let token = '';
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7).trim();
    }
    if (!token && body.token) {
      token = String(body.token).trim();
    }

    const authResult = verifyAdminToken(token);
    const isMasterAuth =
      (body.username === 'shf@26' && body.password === 'SSEC@SHF26') ||
      (body.adminUser === 'shf@26' && body.adminPass === 'SSEC@SHF26');

    if (!authResult.valid && !isMasterAuth) {
      return send(401, {
        success: false,
        error: 'Unauthorized. Valid administrator session required for timer control.',
      });
    }

    const adminUser = authResult.username || body.username || 'admin';
    const action = String(body.action || '').trim().toLowerCase();

    try {
      // Always pull freshest authoritative state before applying transitions
      const current = await fetchAuthoritativeTimer(true);
      let nextState: PersistedTimerState = { ...current };
      const now = Date.now();

      switch (action) {
        // ── 1. CONFIGURE DURATION ───────────────────────────────────────────
        case 'configure': {
          const duration = Number(body.durationSeconds);
          if (!duration || duration <= 0) {
            return send(400, {
              success: false,
              error: 'Invalid duration. Duration must be a positive number of seconds.',
            });
          }

          nextState.configuredDurationSeconds = duration;
          nextState.totalDurationSeconds = duration;
          nextState.remainingSeconds = duration;
          nextState.targetEndTime = null;
          nextState.status = 'STOPPED';
          nextState.startedAt = null;
          nextState.pausedAt = null;
          nextState.stoppedAt = null;

          console.log(`[TimerAPI] Admin ${adminUser} configured duration to ${duration}s (${(duration / 3600).toFixed(1)}h) in Supabase.`);
          break;
        }

        // ── 2. START TIMER ──────────────────────────────────────────────────
        case 'start': {
          // Explicit duration passed from UI, or configured duration in DB
          const duration = Number(body.durationSeconds) || nextState.configuredDurationSeconds || DEFAULT_DURATION_SECONDS;
          const targetEndTime = now + duration * 1000;

          nextState.configuredDurationSeconds = duration;
          nextState.totalDurationSeconds = duration;
          nextState.remainingSeconds = duration;
          nextState.status = 'RUNNING';
          nextState.startedAt = now;
          nextState.targetEndTime = targetEndTime;
          nextState.pausedAt = null;
          nextState.stoppedAt = null;

          if (body.announcement !== undefined) {
            nextState.announcement = String(body.announcement);
          }

          console.log(`[TimerAPI] Admin ${adminUser} started timer for ${duration}s (${(duration / 3600).toFixed(1)}h). Deadline: ${new Date(targetEndTime).toISOString()}`);
          break;
        }

        // ── 2B. RESTART TIMER (Clean restart from configured duration) ───────
        case 'restart': {
          const duration = Number(body.durationSeconds) || nextState.configuredDurationSeconds || DEFAULT_DURATION_SECONDS;
          const targetEndTime = now + duration * 1000;

          nextState.configuredDurationSeconds = duration;
          nextState.totalDurationSeconds = duration;
          nextState.remainingSeconds = duration;
          nextState.status = 'RUNNING';
          nextState.startedAt = now;
          nextState.targetEndTime = targetEndTime;
          nextState.pausedAt = null;
          nextState.stoppedAt = null;

          if (body.announcement !== undefined) {
            nextState.announcement = String(body.announcement);
          }

          console.log(`[TimerAPI] Admin ${adminUser} RESTARTED timer cleanly for ${duration}s (${(duration / 3600).toFixed(1)}h).`);
          break;
        }

        // ── 3. STOP TIMER ───────────────────────────────────────────────────
        case 'stop': {
          nextState.status = 'STOPPED';
          nextState.targetEndTime = null;
          nextState.stoppedAt = now;
          // In stopped state, remaining time is reset to configured duration ready for start
          nextState.remainingSeconds = nextState.configuredDurationSeconds || DEFAULT_DURATION_SECONDS;

          console.log(`[TimerAPI] Admin ${adminUser} stopped timer. Reset to configured: ${nextState.remainingSeconds}s.`);
          break;
        }

        // ── 4. PAUSE TIMER ──────────────────────────────────────────────────
        case 'pause': {
          if (nextState.status === 'RUNNING' && nextState.targetEndTime) {
            nextState.remainingSeconds = Math.max(0, Math.round((nextState.targetEndTime - now) / 1000));
          }

          nextState.status = 'PAUSED';
          nextState.targetEndTime = null;
          nextState.pausedAt = now;

          console.log(`[TimerAPI] Admin ${adminUser} paused timer at ${nextState.remainingSeconds}s remaining.`);
          break;
        }

        // ── 5. RESUME TIMER ─────────────────────────────────────────────────
        case 'resume': {
          if (nextState.status !== 'PAUSED' && nextState.status !== 'STOPPED') {
            return send(400, {
              success: false,
              error: 'Timer is not currently paused or stopped.',
              state: nextState,
            });
          }

          const remaining = (nextState.remainingSeconds && nextState.remainingSeconds > 0)
            ? nextState.remainingSeconds
            : (nextState.configuredDurationSeconds || DEFAULT_DURATION_SECONDS);
          const targetEndTime = now + remaining * 1000;

          nextState.status = 'RUNNING';
          nextState.targetEndTime = targetEndTime;
          nextState.remainingSeconds = remaining;
          nextState.pausedAt = null;
          nextState.stoppedAt = null;

          console.log(`[TimerAPI] Admin ${adminUser} resumed timer with ${remaining}s remaining.`);
          break;
        }

        // ── 6. RESET TIMER ──────────────────────────────────────────────────
        case 'reset': {
          const duration = Number(body.durationSeconds) || nextState.configuredDurationSeconds || DEFAULT_DURATION_SECONDS;
          nextState.status = 'STOPPED';
          nextState.configuredDurationSeconds = duration;
          nextState.totalDurationSeconds = duration;
          nextState.remainingSeconds = duration;
          nextState.targetEndTime = null;
          nextState.startedAt = null;
          nextState.pausedAt = null;
          nextState.stoppedAt = null;

          console.log(`[TimerAPI] Admin ${adminUser} reset timer to ready state (${duration}s / ${(duration / 3600).toFixed(1)}h).`);
          break;
        }

        // ── 7. END / CODE FREEZE ─────────────────────────────────────────────
        case 'end': {
          nextState.status = 'ENDED';
          nextState.remainingSeconds = 0;
          nextState.targetEndTime = null;

          console.log(`[TimerAPI] Admin ${adminUser} triggered CODE FREEZE / ended stage timer.`);
          break;
        }

        // ── 8. ADJUST TIME (+/- Mins) ───────────────────────────────────────
        case 'adjust_time': {
          const delta = Number(body.deltaSeconds) || 0;
          if (nextState.status === 'RUNNING' && nextState.targetEndTime) {
            nextState.targetEndTime += delta * 1000;
            nextState.remainingSeconds = Math.max(0, Math.round((nextState.targetEndTime - now) / 1000));
            nextState.totalDurationSeconds = Math.max(nextState.totalDurationSeconds + delta, nextState.remainingSeconds);
          } else {
            nextState.remainingSeconds = Math.max(0, nextState.remainingSeconds + delta);
            nextState.totalDurationSeconds = Math.max(nextState.totalDurationSeconds + delta, nextState.remainingSeconds);
          }

          console.log(`[TimerAPI] Admin ${adminUser} adjusted timer by ${delta}s.`);
          break;
        }

        // ── 9. SET ANNOUNCEMENT TICKER ──────────────────────────────────────
        case 'set_announcement': {
          nextState.announcement = String(body.announcement || '').trim();
          console.log(`[TimerAPI] Admin ${adminUser} set stage announcement.`);
          break;
        }

        // ── 10. LEGACY SET STATE FALLBACK ───────────────────────────────────
        case 'set_state': {
          if (body.state && typeof body.state === 'object') {
            const incoming = body.state;
            const validStatus: TimerStatus =
              incoming.status === 'RUNNING' ? 'RUNNING' :
              incoming.status === 'PAUSED' ? 'PAUSED' :
              incoming.status === 'ENDED' ? 'ENDED' : 'STOPPED';

            nextState = {
              ...nextState,
              ...incoming,
              status: validStatus,
            };
          }
          break;
        }

        default:
          return send(400, {
            success: false,
            error: `Unknown action '${action}'. Supported actions: configure, start, restart, stop, pause, resume, reset, end, adjust_time, set_announcement.`,
          });
      }

      // Persist the updated authoritative state
      const savedState = await persistTimerState(nextState, adminUser);

      return send(200, {
        success: true,
        message: `Timer action '${action}' applied successfully.`,
        state: savedState,
      });
    } catch (err: any) {
      console.error(`[TimerAPI] Failed to execute action '${action}':`, err);
      return send(500, {
        success: false,
        error: err.message || 'Internal server error while updating timer.',
      });
    }
  }

  return send(405, { success: false, error: 'Method Not Allowed' });
}
