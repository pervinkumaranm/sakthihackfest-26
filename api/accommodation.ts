/**
 * SAKTHI HACKFEST 2K26 — Accommodation Backend API
 * Endpoint: /api/accommodation
 *
 * Handles:
 * - Public: GET_TEAMS (Retrieves registered teams for accommodation selection)
 * - Public: SUBMIT_ACCOMMODATION (Validates & saves accommodation requests)
 * - Admin: GET_ACCOMMODATIONS (Retrieves all accommodation submissions)
 * - Admin: UPDATE_STATUS (Verifies or rejects accommodation requests)
 */

import fs from 'fs';
import path from 'path';
import crypto from 'node:crypto';

export const config = {
  maxDuration: 60,
};

const DEFAULT_GAS_REG_URL =
  'https://script.google.com/macros/s/AKfycbx4-f4ywC14JGtbwV7Q2RAt5Yf7Jo6PdsMN6yseufqa3_I1CmTVEYBO74caibjSc_w9/exec';

const ACCOMMODATIONS_FILE = path.resolve(process.cwd(), 'config/accommodations.json');
const TOGGLES_FILE = path.resolve(process.cwd(), 'config/toggles.json');

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

function getAccommodationGasUrl(): string {
  loadLocalEnvIfNeeded();
  const envUrl =
    process.env.ACCOMMODATION_GAS_URL ||
    process.env.VITE_ACCOMMODATION_GAS_URL ||
    process.env.GAS_WEB_APP_URL ||
    process.env.VITE_GOOGLE_SCRIPT_URL;

  if (!envUrl || envUrl.includes('AKfycby1wwXdxr6hgymC-Xa8rVvJv0vsEe4UeLMG2O6A5bklfVCXpjHkAm3_5AjCDEckZF5e1g')) {
    return DEFAULT_GAS_REG_URL;
  }
  return envUrl;
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

let cachedAccommodationOpen: { value: boolean; timestamp: number } | null = null;

async function isAccommodationOpen(): Promise<boolean> {
  const now = Date.now();
  if (cachedAccommodationOpen && now - cachedAccommodationOpen.timestamp < 15000) {
    return cachedAccommodationOpen.value;
  }

  // 1. Check Google Apps Script (central persistent source of truth)
  try {
    const gasUrl = getAccommodationGasUrl();
    if (gasUrl) {
      const res = await fetch(`${gasUrl}?action=GET_TOGGLES`, {
        signal: AbortSignal.timeout(2500),
      });
      if (res.ok) {
        const json = await res.json();
        if (typeof json.accommodationOpen === 'boolean') {
          cachedAccommodationOpen = { value: json.accommodationOpen, timestamp: now };
          return json.accommodationOpen;
        }
      }
    }
  } catch (_) {}

  // 2. Check /tmp/toggles.json if present
  try {
    const tmpFile = '/tmp/toggles.json';
    if (fs.existsSync(tmpFile)) {
      const parsed = JSON.parse(fs.readFileSync(tmpFile, 'utf8'));
      if (typeof parsed.accommodationOpen === 'boolean') {
        cachedAccommodationOpen = { value: parsed.accommodationOpen, timestamp: now };
        return parsed.accommodationOpen;
      }
    }
  } catch (_) {}

  // 3. Check TOGGLES_FILE in repository bundle
  try {
    if (fs.existsSync(TOGGLES_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(TOGGLES_FILE, 'utf8'));
      if (typeof parsed.accommodationOpen === 'boolean') {
        cachedAccommodationOpen = { value: parsed.accommodationOpen, timestamp: now };
        return parsed.accommodationOpen;
      }
    }
  } catch (_) {}

  return true;
}

function readLocalAccommodations(): any[] {
  try {
    if (fs.existsSync(ACCOMMODATIONS_FILE)) {
      const raw = fs.readFileSync(ACCOMMODATIONS_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (_) {}
  return [];
}

function writeLocalAccommodations(list: any[]) {
  try {
    const dir = path.dirname(ACCOMMODATIONS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(ACCOMMODATIONS_FILE, JSON.stringify(list, null, 2), 'utf8');
  } catch (err) {
    console.warn('Could not write accommodations file:', err);
  }
}

// ── Registered Teams Fetching (Internal Server-Side) ─────────────────────────
async function fetchAllRegisteredTeams() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);
    const gasUrl = getAccommodationGasUrl();
    const res = await fetch(`${gasUrl}?action=GET_REGISTRATIONS`, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const json = await res.json();
      if (json && json.success && Array.isArray(json.data)) {
        const teams = json.data
          .map((item: any) => {
            const norm = (s: string) => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
            const getVal = (...keys: string[]) => {
              for (const k of keys) {
                if (item[k] !== undefined && item[k] !== null && String(item[k]).trim() !== '') {
                  return String(item[k]).trim();
                }
                const target = norm(k);
                for (const prop of Object.keys(item)) {
                  if (norm(prop) === target && item[prop] !== undefined && item[prop] !== null && String(item[prop]).trim() !== '') {
                    return String(item[prop]).trim();
                  }
                }
              }
              return '';
            };

            const regId = getVal('Registration ID', 'registrationid');
            const teamName = getVal('Team Name', 'teamname');
            if (!regId || !teamName) return null;

            const leaderName = getVal('Team Leader Name', 'teamleadername', 'leadername');
            const leaderEmail = getVal('Team Leader Email', 'teamleaderemail', 'leaderemail');
            const college = getVal('Team Leader College', 'college', 'institution', 'collegename');
            const teamSize = parseInt(getVal('Team Size', 'teamsize'), 10) || 2;

            const members: string[] = [];
            if (leaderName) members.push(leaderName);

            for (let m = 2; m <= 4; m++) {
              const mName = getVal(`Member ${m} Name`, `member${m}name`);
              if (mName && !members.includes(mName)) {
                members.push(mName);
              }
            }

            return {
              registrationId: regId,
              teamCode: regId,
              teamName,
              college,
              teamSize,
              leaderName,
              leaderEmail,
              members,
            };
          })
          .filter(Boolean);

        return teams;
      }
    }
  } catch (err) {
    console.warn('Failed to fetch teams from Apps Script:', err);
  }

  return [];
}

// ── Main Handler ────────────────────────────────────────────────────────────
export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const queryAction = (req.query?.action || '').toUpperCase();
  const urlObj = req.url ? new URL(req.url, 'http://localhost') : null;
  const pathAction = (urlObj?.searchParams.get('action') || '').toUpperCase();
  const effectiveAction = queryAction || pathAction;

  // 1. GET Requests
  if (req.method === 'GET') {
    // PUBLIC: Only returns Team Name and Team Code (Principle of Least Privilege)
    if (effectiveAction === 'GET_TEAMS') {
      const allTeams = await fetchAllRegisteredTeams();
      const publicTeams = allTeams.map((t: any) => ({
        teamCode: t.teamCode || t.registrationId,
        teamName: t.teamName,
      }));
      return res.status(200).json({ success: true, data: publicTeams });
    }

    // PUBLIC: Returns only registered member names for a selected team code
    if (effectiveAction === 'GET_TEAM_MEMBERS') {
      const teamCodeParam = String(req.query?.teamCode || urlObj?.searchParams.get('teamCode') || '').trim().toUpperCase();
      if (!teamCodeParam) {
        return res.status(400).json({ success: false, error: 'teamCode parameter is required.' });
      }

      const allTeams = await fetchAllRegisteredTeams();
      const matched = allTeams.find(
        (t: any) => (t.teamCode || t.registrationId || '').toUpperCase() === teamCodeParam
      );

      if (!matched) {
        return res.status(404).json({ success: false, error: `Team ${teamCodeParam} not found in registrations.` });
      }

      // Strictly member names ONLY (no emails, no phone, no college)
      return res.status(200).json({
        success: true,
        teamCode: matched.teamCode || matched.registrationId,
        teamName: matched.teamName,
        members: matched.members || [],
      });
    }

    if (effectiveAction === 'GET_ACCOMMODATIONS') {
      const authHeader = req.headers.authorization || req.headers.Authorization;
      const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
      if (!verifyAdminToken(token)) {
        return res.status(401).json({ success: false, error: 'Unauthorized.' });
      }

      const accGasUrl = getAccommodationGasUrl();
      if (accGasUrl) {
        try {
          const gasRes = await fetch(`${accGasUrl}?action=GET_ACCOMMODATIONS`);
          if (gasRes.ok) {
            const gasJson = await gasRes.json();
            const items = Array.isArray(gasJson?.accommodations)
              ? gasJson.accommodations
              : Array.isArray(gasJson?.data)
              ? gasJson.data
              : null;
            if (gasJson && gasJson.success && items !== null) {
              writeLocalAccommodations(items);
              return res.status(200).json({ success: true, data: items });
            }
          }
        } catch (_) {}
      }

      const localList = readLocalAccommodations();
      return res.status(200).json({ success: true, data: localList });
    }

    return res.status(200).json({
      success: true,
      message: 'Sakthi HackFest 2026 Accommodation API',
      ratePerMember: 100,
    });
  }

  // 2. POST Requests
  if (req.method === 'POST') {
    const body = req.body || {};
    const action = String(body.action || effectiveAction || 'SUBMIT_ACCOMMODATION').toUpperCase();

    // ── ADMIN: GET_ACCOMMODATIONS ───────────────────────────────────────────
    if (action === 'GET_ACCOMMODATIONS') {
      const authHeader = req.headers.authorization || req.headers.Authorization;
      const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
      const isTokenValid = verifyAdminToken(token);
      const isMasterAuth = (body.username === 'shf@26' && body.password === 'SSEC@SHF26');

      if (!isTokenValid && !isMasterAuth) {
        return res.status(401).json({ success: false, error: 'Unauthorized.' });
      }

      const accGasUrl = getAccommodationGasUrl();
      if (accGasUrl) {
        try {
          const gasRes = await fetch(`${accGasUrl}?action=GET_ACCOMMODATIONS`);
          if (gasRes.ok) {
            const gasJson = await gasRes.json();
            const items = Array.isArray(gasJson?.accommodations)
              ? gasJson.accommodations
              : Array.isArray(gasJson?.data)
              ? gasJson.data
              : null;
            if (gasJson && gasJson.success && items !== null) {
              writeLocalAccommodations(items);
              return res.status(200).json({ success: true, data: items });
            }
          }
        } catch (_) {}
      }

      const localList = readLocalAccommodations();
      return res.status(200).json({ success: true, data: localList });
    }

    // ── ADMIN: UPDATE_STATUS ────────────────────────────────────────────────
    if (action === 'UPDATE_STATUS') {
      const authHeader = req.headers.authorization || req.headers.Authorization;
      const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
      const isTokenValid = verifyAdminToken(token);
      const isMasterAuth = (body.username === 'shf@26' && body.password === 'SSEC@SHF26');

      if (!isTokenValid && !isMasterAuth) {
        return res.status(401).json({ success: false, error: 'Unauthorized.' });
      }

      const accId = String(body.accommodationId || '').trim().toUpperCase();
      const status = String(body.accommodationStatus || body.status || '').trim().toUpperCase();

      if (!accId || !['VERIFIED', 'REJECTED', 'PENDING'].includes(status)) {
        return res.status(400).json({ success: false, error: 'Invalid accommodation ID or status.' });
      }

      const accGasUrl = getAccommodationGasUrl();
      if (accGasUrl) {
        try {
          const gasRes = await fetch(accGasUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ action: 'UPDATE_STATUS', accommodationId: accId, accommodationStatus: status }),
          });
          if (gasRes.ok) {
            const gasJson = await gasRes.json();
            if (gasJson && gasJson.success) {
              return res.status(200).json(gasJson);
            }
          }
        } catch (_) {}
      }

      const list = readLocalAccommodations();
      const item = list.find((a: any) => a.accommodationId === accId);
      if (item) {
        item.accommodationStatus = status;
        item.lastUpdated = new Date().toISOString();
        writeLocalAccommodations(list);
        return res.status(200).json({
          success: true,
          message: `Accommodation status updated to ${status}`,
          accommodationId: accId,
          accommodationStatus: status,
        });
      }

      return res.status(404).json({ success: false, error: 'Accommodation request not found.' });
    }

    // ── PUBLIC: SUBMIT_ACCOMMODATION ────────────────────────────────────────
    if (action === 'SUBMIT_ACCOMMODATION') {
      // 1. Check accommodation toggle
      const isOpen = await isAccommodationOpen();
      if (!isOpen) {
        return res.status(403).json({
          success: false,
          stage: 'validation',
          errorCode: 'ACCOMMODATION_CLOSED',
          message: 'Accommodation registration is currently closed.',
        });
      }

      const payload = body.data || body;
      const teamCode = String(payload.teamCode || payload.registrationId || '').trim().toUpperCase();
      const teamName = String(payload.teamName || '').trim();
      const upiTransactionId = String(payload.upiTransactionId || '').trim();
      const screenshotBase64 = payload.paymentScreenshotData || payload.paymentScreenshotBase64 || payload.screenshotBase64 || '';
      const selectedMembers = Array.isArray(payload.selectedMembers)
        ? payload.selectedMembers.filter((m: any) => Boolean(String(m).trim()))
        : [];

      // Validation
      if (!teamCode || !teamName) {
        return res.status(400).json({ success: false, message: 'Team code and team name are required.' });
      }
      if (selectedMembers.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'At least one team member must be selected for accommodation.',
        });
      }

      // 12-digit numeric UPI Transaction ID validation
      const upiDigits = upiTransactionId.replace(/[^0-9]/g, '');
      if (upiDigits.length !== 12) {
        return res.status(400).json({
          success: false,
          stage: 'validation',
          errorCode: 'INVALID_UPI_ID',
          message: 'UPI Transaction ID must be a 12-digit numeric UTR reference number.',
        });
      }

      if (!screenshotBase64 || screenshotBase64.length < 100) {
        return res.status(400).json({
          success: false,
          stage: 'validation',
          errorCode: 'MISSING_SCREENSHOT',
          message: 'Payment screenshot is mandatory. Please upload your payment screenshot.',
        });
      }

      // Verify team exists and retrieve verified leader details securely from registration database
      let matchTeam: any = null;
      try {
        const registeredTeams = await fetchAllRegisteredTeams();
        if (registeredTeams && registeredTeams.length > 0) {
          matchTeam = registeredTeams.find(
            (t: any) =>
              (t.registrationId || '').toUpperCase() === teamCode.toUpperCase() ||
              (t.teamCode || '').toUpperCase() === teamCode.toUpperCase() ||
              (t.teamName || '').toLowerCase().trim() === teamName.toLowerCase().trim()
          );

          if (!matchTeam) {
            return res.status(400).json({
              success: false,
              stage: 'validation',
              errorCode: 'TEAM_NOT_REGISTERED',
              message: `Team "${teamName}" (${teamCode}) was not found in the registered teams database.`,
            });
          }

          const validMembersNorm = matchTeam.members.map((m: string) => m.toLowerCase().trim());
          const invalidMembers = selectedMembers.filter(
            (m: string) => !validMembersNorm.includes(m.toLowerCase().trim())
          );

          if (invalidMembers.length > 0) {
            return res.status(400).json({
              success: false,
              stage: 'validation',
              errorCode: 'INVALID_MEMBERS',
              message: `The following selected members are not registered members of team ${teamName}: ${invalidMembers.join(', ')}`,
            });
          }
        }
      } catch (err) {
        console.warn('Could not verify registered team list:', err);
      }

      const verifiedLeaderEmail = matchTeam?.leaderEmail || payload.teamLeaderEmail || '';
      const verifiedLeaderName = matchTeam?.leaderName || payload.teamLeaderName || 'Team Leader';
      const verifiedCollege = matchTeam?.college || '';

      // Authoritative backend calculation
      const memberCount = selectedMembers.length;
      const ratePerMember = 100;
      const totalAmount = memberCount * ratePerMember;

      // Check duplicate in local store
      const localList = readLocalAccommodations();
      const existing = localList.find(
        (a: any) => (a.teamCode === teamCode || a.registrationId === teamCode) && a.upiTransactionId === upiDigits && a.accommodationStatus !== 'REJECTED'
      );
      if (existing) {
        return res.status(200).json({
          success: true,
          isDuplicate: true,
          accommodationId: existing.accommodationId,
          message: 'Accommodation request already recorded for this transaction.',
          totalAmount,
        });
      }

      // Forward to Accommodation Apps Script
      const accGasUrl = getAccommodationGasUrl();
      if (!accGasUrl) {
        return res.status(500).json({
          success: false,
          stage: 'configuration',
          errorCode: 'MISSING_GAS_URL',
          message: 'Google Apps Script deployment URL is not configured.',
        });
      }

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 35000);
        const gasRes = await fetch(accGasUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'SUBMIT_ACCOMMODATION',
            data: {
              teamCode,
              teamName,
              collegeName: verifiedCollege,
              teamLeaderEmail: verifiedLeaderEmail,
              teamLeaderName: verifiedLeaderName,
              registeredTeamSize: matchTeam?.teamSize || memberCount,
              selectedMembers,
              memberCount,
              totalAmount,
              upiTransactionId: upiDigits,
              paymentScreenshotBase64: screenshotBase64,
              paymentScreenshotData: screenshotBase64,
            },
          }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (gasRes.ok) {
          const gasJson = await gasRes.json();
          if (gasJson && gasJson.success) {
            // Persist verified submission locally for Admin Dashboard caching
            const newRecord = {
              accommodationId: gasJson.accommodationId,
              timestamp: new Date().toISOString(),
              teamName,
              teamCode,
              registeredTeamSize: matchTeam?.teamSize || memberCount,
              selectedMembers,
              memberCount,
              ratePerMember,
              totalAmount,
              upiTransactionId: upiDigits,
              paymentScreenshotUrl: gasJson.screenshotUrl || '',
              teamLeaderName: verifiedLeaderName,
              teamLeaderEmail: verifiedLeaderEmail,
              accommodationStatus: 'PENDING',
              emailNotificationStatus: gasJson.emailStatus || 'SENT',
            };
            localList.push(newRecord);
            writeLocalAccommodations(localList);
            return res.status(200).json(gasJson);
          } else {
            console.error('[Apps Script accommodation submission rejected]:', gasJson);
            return res.status(400).json({
              success: false,
              stage: gasJson?.stage || 'apps_script',
              errorCode: gasJson?.errorCode || 'ACCOMMODATION_FAILED',
              message: gasJson?.message || 'Accommodation submission was rejected by Google Apps Script.',
            });
          }
        } else {
          const errText = await gasRes.text();
          console.error('[Apps Script accommodation HTTP error]:', gasRes.status, errText);
          return res.status(gasRes.status || 502).json({
            success: false,
            stage: 'apps_script_http',
            errorCode: 'GAS_HTTP_ERROR',
            message: `Google Apps Script returned HTTP ${gasRes.status}: ${errText.slice(0, 300)}`,
          });
        }
      } catch (gasErr: any) {
        console.error('[Apps Script accommodation forward network exception]:', gasErr);
        return res.status(502).json({
          success: false,
          stage: 'connection',
          errorCode: 'NETWORK_ERROR',
          message: `Failed to connect to Google Apps Script: ${gasErr.message || gasErr}`,
        });
      }
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
