/**
 * SAKTHI HACKFEST 2K26 — Google Sheet Form Toggles Management API
 * Endpoint: /api/settings
 *
 * Single Source of Truth: Google Spreadsheet Tab (GID: 1835819612)
 *
 * Persistently controls:
 * - Registration Form [ON / OFF]
 * - Accommodation Form [ON / OFF]
 *
 * Accessible to public pages (GET) and Admin Console (POST with Auth).
 */

import path from 'path';
import fs from 'fs';
import crypto from 'node:crypto';

export const config = {
  maxDuration: 15,
};

interface TogglesState {
  registrationOpen: boolean;
  accommodationOpen: boolean;
  lastUpdated: string;
  updatedBy?: string;
}

const DEFAULT_GAS_URL =
  'https://script.google.com/macros/s/AKfycbx4-f4ywC14JGtbwV7Q2RAt5Yf7Jo6PdsMN6yseufqa3_I1CmTVEYBO74caibjSc_w9/exec';

// Fast short-lived in-memory cache to prevent spamming Google Sheets API while guaranteeing fresh data
let cachedToggles: TogglesState = {
  registrationOpen: false,
  accommodationOpen: false,
  lastUpdated: new Date().toISOString(),
  updatedBy: 'system',
};
let cacheTimestamp = 0;
const CACHE_TTL_MS = 2500; // 2.5 seconds cache TTL

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
          if (val.startsWith('"') && val.endsWith('"')) {
            val = val.slice(1, -1);
          } else if (val.startsWith("'") && val.endsWith("'")) {
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

function getGasUrl(): string {
  loadLocalEnvIfNeeded();
  return (
    process.env.GAS_WEB_APP_URL ||
    process.env.VITE_GOOGLE_SCRIPT_URL ||
    DEFAULT_GAS_URL
  );
}

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
    return { valid: true, username: payload.username || 'admin' };
  } catch {
    return { valid: false };
  }
}

/**
 * Fetch authoritative toggle values directly from Google Sheet via Apps Script
 */
async function fetchAuthoritativeToggles(forceRefresh = false): Promise<TogglesState> {
  const now = Date.now();
  if (!forceRefresh && now - cacheTimestamp < CACHE_TTL_MS) {
    return cachedToggles;
  }

  const gasUrl = getGasUrl();
  try {
    const res = await fetch(`${gasUrl}?action=GET_TOGGLES&_t=${now}`, {
      method: 'GET',
      headers: { 'Cache-Control': 'no-cache' },
      signal: AbortSignal.timeout(5000),
    });

    if (res.ok) {
      const json = await res.json();
      if (json && (typeof json.registrationOpen === 'boolean' || typeof json.accommodationOpen === 'boolean')) {
        cachedToggles = {
          registrationOpen: Boolean(json.registrationOpen),
          accommodationOpen: Boolean(json.accommodationOpen),
          lastUpdated: json.lastUpdated || new Date().toISOString(),
          updatedBy: json.updatedBy || 'admin',
        };
        cacheTimestamp = now;
        return cachedToggles;
      }
    }
  } catch (err) {
    console.warn('Error reading authoritative toggles from Google Sheet:', err);
  }

  // If cache exists and not expired long ago, reuse it; otherwise default safely to false
  if (cacheTimestamp > 0) {
    return cachedToggles;
  }

  return {
    registrationOpen: false,
    accommodationOpen: false,
    lastUpdated: new Date().toISOString(),
    updatedBy: 'system',
  };
}

/**
 * Persistently update toggle values into the Google Sheet via Apps Script
 */
async function updateAuthoritativeToggles(
  updates: { registrationOpen?: boolean; accommodationOpen?: boolean },
  updatedBy: string
): Promise<{ success: boolean; state?: TogglesState; error?: string }> {
  const gasUrl = getGasUrl();

  try {
    const res = await fetch(gasUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'SET_TOGGLES',
        registrationOpen: updates.registrationOpen,
        accommodationOpen: updates.accommodationOpen,
        updatedBy,
      }),
      signal: AbortSignal.timeout(6000),
    });

    if (!res.ok) {
      throw new Error(`Google Apps Script responded with HTTP ${res.status}`);
    }

    const json = await res.json();
    if (json && json.success) {
      const newState: TogglesState = {
        registrationOpen: typeof json.registrationOpen === 'boolean' ? json.registrationOpen : Boolean(updates.registrationOpen),
        accommodationOpen: typeof json.accommodationOpen === 'boolean' ? json.accommodationOpen : Boolean(updates.accommodationOpen),
        lastUpdated: json.lastUpdated || new Date().toISOString(),
        updatedBy: json.updatedBy || updatedBy,
      };

      // Invalidate cache immediately
      cachedToggles = newState;
      cacheTimestamp = Date.now();
      return { success: true, state: newState };
    } else {
      return { success: false, error: json?.error || 'Google Sheet update rejected.' };
    }
  } catch (err: any) {
    console.error('Failed to write toggles to Google Sheet:', err);
    return { success: false, error: err.message || 'Network error updating Google Sheet.' };
  }
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  // Prevent aggressive caching on browser and CDN proxies
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET: Public fetch of authoritative form status from Google Sheet
  if (req.method === 'GET') {
    const force = req.query?.force === 'true';
    const state = await fetchAuthoritativeToggles(force);
    return res.status(200).json({
      success: true,
      settings: state,
      registrationOpen: state.registrationOpen,
      accommodationOpen: state.accommodationOpen,
      lastUpdated: state.lastUpdated,
      updatedBy: state.updatedBy,
    });
  }

  // POST: Admin toggle update directly to Google Sheet
  if (req.method === 'POST') {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    let token = '';
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7).trim();
    }

    const body = req.body || {};
    const authResult = verifyAdminToken(token);
    const isMasterAuth = (body.username === 'shf@26' && body.password === 'SSEC@SHF26');

    if (!authResult.valid && !isMasterAuth) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized. Admin credentials required to modify form toggles.',
      });
    }

    const adminUser = authResult.username || body.username || 'admin';
    const result = await updateAuthoritativeToggles(
      {
        registrationOpen: body.registrationOpen,
        accommodationOpen: body.accommodationOpen,
      },
      adminUser
    );

    if (result.success && result.state) {
      return res.status(200).json({
        success: true,
        message: 'Toggle Google Sheet updated successfully.',
        settings: result.state,
        registrationOpen: result.state.registrationOpen,
        accommodationOpen: result.state.accommodationOpen,
        lastUpdated: result.state.lastUpdated,
        updatedBy: result.state.updatedBy,
      });
    }

    return res.status(500).json({
      success: false,
      error: result.error || 'Failed to update Google Sheet.',
    });
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
