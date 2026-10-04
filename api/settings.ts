/**
 * SAKTHI HACKFEST 2K26 — Form Toggles Management API
 * Endpoint: /api/settings
 *
 * Persistently controls:
 * - Registration Form [ON / OFF]
 * - Accommodation Form [ON / OFF]
 *
 * Accessible to public pages (GET) and Admin Console (POST with Auth).
 */

import fs from 'fs';
import path from 'path';
import crypto from 'node:crypto';

export const config = {
  maxDuration: 15,
};

interface TogglesState {
  registrationOpen: boolean;
  accommodationOpen: boolean;
  lastUpdated: string;
}

const TOGGLES_FILE = path.resolve(process.cwd(), 'config/toggles.json');
const TMP_TOGGLES_FILE = '/tmp/toggles.json';

// Memory cache
let inMemoryToggles: TogglesState = {
  registrationOpen: true,
  accommodationOpen: true,
  lastUpdated: new Date().toISOString(),
};

function readToggles(): TogglesState {
  try {
    // 1. Try reading from writable serverless /tmp if present
    if (fs.existsSync(TMP_TOGGLES_FILE)) {
      const raw = fs.readFileSync(TMP_TOGGLES_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      if (typeof parsed.registrationOpen === 'boolean') {
        inMemoryToggles = {
          registrationOpen: parsed.registrationOpen,
          accommodationOpen: typeof parsed.accommodationOpen === 'boolean' ? parsed.accommodationOpen : true,
          lastUpdated: parsed.lastUpdated || new Date().toISOString(),
        };
        return inMemoryToggles;
      }
    }

    // 2. Try reading from project bundle config/toggles.json
    if (fs.existsSync(TOGGLES_FILE)) {
      const raw = fs.readFileSync(TOGGLES_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      if (typeof parsed.registrationOpen === 'boolean') {
        inMemoryToggles = {
          registrationOpen: parsed.registrationOpen,
          accommodationOpen: typeof parsed.accommodationOpen === 'boolean' ? parsed.accommodationOpen : true,
          lastUpdated: parsed.lastUpdated || new Date().toISOString(),
        };
      }
    }
  } catch (err) {
    console.warn('Could not read toggles from disk, using in-memory state:', err);
  }
  return inMemoryToggles;
}

async function writeToggles(next: Partial<TogglesState>): Promise<TogglesState> {
  const current = readToggles();
  const updated: TogglesState = {
    registrationOpen: next.registrationOpen !== undefined ? Boolean(next.registrationOpen) : current.registrationOpen,
    accommodationOpen: next.accommodationOpen !== undefined ? Boolean(next.accommodationOpen) : current.accommodationOpen,
    lastUpdated: new Date().toISOString(),
  };

  inMemoryToggles = updated;
  const jsonStr = JSON.stringify(updated, null, 2);

  // Write to /tmp for persistent Vercel Lambda execution
  try {
    fs.writeFileSync(TMP_TOGGLES_FILE, jsonStr, 'utf8');
  } catch (_) {}

  // Write to local project config if filesystem is writable
  try {
    const dir = path.dirname(TOGGLES_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(TOGGLES_FILE, jsonStr, 'utf8');
  } catch (err) {
    // Read-only filesystem in Vercel lambda container is normal
  }

  // Also sync persistently to Google Apps Script PropertiesService
  const gasUrl =
    process.env.GAS_WEB_APP_URL ||
    process.env.VITE_GOOGLE_SCRIPT_URL ||
    'https://script.google.com/macros/s/AKfycbwWpkK52_Rls-mkeYIwad3hVbUDDTBP6PSWonTlF0r_xHMvjhbCxwXFXgRFp-AN-1-U/exec';
  if (gasUrl) {
    try {
      await fetch(gasUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'SET_TOGGLES',
          registrationOpen: updated.registrationOpen,
          accommodationOpen: updated.accommodationOpen,
        }),
        signal: AbortSignal.timeout(3500),
      });
    } catch (err) {
      console.warn('Could not sync toggles to Apps Script:', err);
    }
  }

  return updated;
}

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

function getAdminSecret(): string {
  loadLocalEnvIfNeeded();
  return (
    process.env.ADMIN_JWT_SECRET ||
    process.env.GOOGLE_PRIVATE_KEY?.slice(0, 32) ||
    'sakthi-hackfest-2026-admin-secret-seed-982341'
  );
}

function verifyAdminToken(token?: string): boolean {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [encodedPayload, signature] = parts;
  const secret = getAdminSecret();
  const expectedSig = crypto
    .createHmac('sha256', secret)
    .update(encodedPayload)
    .digest('base64url');

  if (signature !== expectedSig) return false;

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
    if (!payload.exp || Date.now() > payload.exp) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET: Public fetch of current form status
  if (req.method === 'GET') {
    const state = readToggles();
    return res.status(200).json({
      success: true,
      settings: state,
      registrationOpen: state.registrationOpen,
      accommodationOpen: state.accommodationOpen,
      lastUpdated: state.lastUpdated,
    });
  }

  // POST: Admin toggle update
  if (req.method === 'POST') {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    let token = '';
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7).trim();
    }

    const body = req.body || {};
    // Check auth via Bearer token or master credentials in body
    const isTokenValid = verifyAdminToken(token);
    const isMasterAuth = (body.username === 'shf@26' && body.password === 'SSEC@SHF26');

    if (!isTokenValid && !isMasterAuth) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized. Admin credentials required to modify form toggles.',
      });
    }

    const updated = await writeToggles({
      registrationOpen: body.registrationOpen,
      accommodationOpen: body.accommodationOpen,
    });

    return res.status(200).json({
      success: true,
      message: 'Form status updated successfully.',
      settings: updated,
      registrationOpen: updated.registrationOpen,
      accommodationOpen: updated.accommodationOpen,
      lastUpdated: updated.lastUpdated,
    });
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
