/**
 * SAKTHI HACKFEST 2K26 — Student Volunteer Attendance API
 * Endpoint: /api/attendance
 *
 * Provides dedicated attendance management operations:
 * - Volunteer Authentication & Session Token Issuance
 * - Team Lookup by Team Code / Registration ID (Strict PII Sanitization)
 * - Attendance Status Retrieval (Existing Record Verification)
 * - Attendance Submission & Editing (Preventing Duplicates)
 * - Dual Persistence: Google Spreadsheet (GID 1959900323) + Local Config Cache
 */

import { google } from 'googleapis';
import crypto from 'node:crypto';
import fs from 'fs';
import path from 'path';
import process from 'node:process';

export const config = {
  maxDuration: 60,
};

const DEFAULT_SPREADSHEET_ID = '1F_XlNsLdUXx31w92caKs5jidCeI0jcZIMY_TPPBJefE';
const TARGET_ATTENDANCE_GID = 1959900323;
const ATTENDANCE_FILE = path.resolve(process.cwd(), 'config/attendance.json');

const DEFAULT_GAS_URL =
  'https://script.google.com/macros/s/AKfycbx4-f4ywC14JGtbwV7Q2RAt5Yf7Jo6PdsMN6yseufqa3_I1CmTVEYBO74caibjSc_w9/exec';

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
  } catch {}
}

function getActiveGasUrl(): string {
  loadLocalEnvIfNeeded();
  const envUrl = process.env.GAS_WEB_APP_URL || process.env.VITE_GOOGLE_SCRIPT_URL;
  if (!envUrl || envUrl.includes('AKfycby1wwXdxr6hgymC-Xa8rVvJv0vsEe4UeLMG2O6A5bklfVCXpjHkAm3_5AjCDEckZF5e1g')) {
    return DEFAULT_GAS_URL;
  }
  return envUrl;
}

function getSecretKey(): string {
  loadLocalEnvIfNeeded();
  return (
    process.env.ADMIN_JWT_SECRET ||
    process.env.GOOGLE_PRIVATE_KEY?.slice(0, 32) ||
    'sakthi-hackfest-2026-attendance-volunteer-secret-9182'
  );
}

function generateToken(username: string, role = 'VOLUNTEER'): { token: string; expiresAt: number } {
  const secret = getSecretKey();
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
  const payload = JSON.stringify({
    u: username,
    role,
    exp: expiresAt,
    salt: crypto.randomBytes(8).toString('hex'),
  });
  const encodedPayload = Buffer.from(payload).toString('base64url');
  const signature = crypto
    .createHmac('sha256', secret)
    .update(encodedPayload)
    .digest('base64url');
  return { token: `${encodedPayload}.${signature}`, expiresAt };
}

function verifyToken(token?: string): { valid: boolean; username?: string; role?: string } {
  if (!token) return { valid: false };
  const parts = token.split('.');
  if (parts.length !== 2) return { valid: false };

  const [encodedPayload, signature] = parts;
  const secret = getSecretKey();
  const expectedSig = crypto
    .createHmac('sha256', secret)
    .update(encodedPayload)
    .digest('base64url');

  if (signature !== expectedSig) return { valid: false };

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
    if (!payload.exp || Date.now() > payload.exp) return { valid: false };
    return { valid: true, username: payload.u, role: payload.role || 'VOLUNTEER' };
  } catch {
    return { valid: false };
  }
}

function extractToken(req: any): string | undefined {
  const authHeader = req.headers?.authorization || req.headers?.Authorization;
  if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }
  if (req.body?.token) return req.body.token;
  return undefined;
}

function formatISTTimestamp(date = new Date()): string {
  try {
    return new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(date);
  } catch {
    return date.toISOString();
  }
}

// ── Local Storage Cache Helpers ──────────────────────────────────────────────
interface AttendanceRecord {
  teamCode: string;
  teamName: string;
  members: Array<{
    name: string;
    college: string;
    status: 'Present' | 'Absent';
  }>;
  totalPresent: number;
  totalMembers: number;
  timestamp: string;
  markedBy: string;
}

function readLocalAttendance(): AttendanceRecord[] {
  try {
    if (fs.existsSync(ATTENDANCE_FILE)) {
      const data = JSON.parse(fs.readFileSync(ATTENDANCE_FILE, 'utf8'));
      return Array.isArray(data.records) ? data.records : [];
    }
  } catch (e) {
    console.warn('Failed reading local attendance cache:', e);
  }
  return [];
}

function saveLocalAttendance(records: AttendanceRecord[]) {
  try {
    const dir = path.dirname(ATTENDANCE_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(
      ATTENDANCE_FILE,
      JSON.stringify({ records, lastUpdated: new Date().toISOString() }, null, 2),
      'utf8'
    );
  } catch (e) {
    console.error('Failed saving local attendance cache:', e);
  }
}

// ── Google Sheets API (Direct Service Account fallback) ──────────────────────
function getServiceAccountAuth() {
  loadLocalEnvIfNeeded();
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  let privateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!clientEmail || !privateKey) return null;
  if (privateKey.startsWith('"') && privateKey.endsWith('"')) privateKey = privateKey.slice(1, -1);
  privateKey = privateKey.replace(/\\n/g, '\n');

  return new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

export default async function handler(req: any, res: any) {
  // CORS setup
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  loadLocalEnvIfNeeded();
  const body = req.body || {};
  const action = (body.action || req.query?.action || '').trim();

  // 1. Volunteer Authentication
  if (action === 'login') {
    const { username, password } = body;
    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Username and password are required.' });
    }

    const cleanUser = String(username).trim();
    const cleanPass = String(password).trim();

    let authenticated = false;
    let role = 'VOLUNTEER';

    const envVolUser = process.env.VOLUNTEER_USERNAME?.trim();
    const envVolPass = process.env.VOLUNTEER_PASSWORD?.trim();

    // Verify volunteer credentials strictly against environment variables
    if (envVolUser && envVolPass && cleanUser.toLowerCase() === envVolUser.toLowerCase() && cleanPass === envVolPass) {
      authenticated = true;
      role = 'VOLUNTEER';
    }

    // Super Admin credentials also have permission to access attendance (from environment variables)
    const envAdminUser = process.env.ADMIN_USERNAME?.trim();
    const envAdminPass = process.env.ADMIN_PASSWORD?.trim();
    if (envAdminUser && envAdminPass && cleanUser.toLowerCase() === envAdminUser.toLowerCase() && cleanPass === envAdminPass) {
      authenticated = true;
      role = 'SUPER_ADMIN';
    }

    if (!authenticated) {
      return res.status(401).json({
        success: false,
        error: 'Invalid volunteer credentials. Please check your username and password.',
      });
    }

    const { token, expiresAt } = generateToken(cleanUser, role);
    return res.status(200).json({
      success: true,
      token,
      expiresAt,
      user: {
        username: cleanUser,
        role,
      },
    });
  }

  // Verify Session Token for all protected attendance operations
  const token = extractToken(req);
  const auth = verifyToken(token);
  if (!auth.valid || !auth.username) {
    return res.status(401).json({
      success: false,
      error: 'Session expired or unauthorized. Please log in with volunteer credentials.',
    });
  }

  // 2. Verify Session
  if (action === 'verify_session') {
    return res.status(200).json({
      success: true,
      valid: true,
      user: {
        username: auth.username,
        role: auth.role,
      },
    });
  }

  // 3. Fetch Team Details by Team Code / Registration ID (STRICTLY NO PII)
  if (action === 'get_team') {
    const rawCode = String(body.teamCode || req.query?.teamCode || '').trim().toUpperCase();
    if (!rawCode) {
      return res.status(400).json({ success: false, error: 'Team Code is required.' });
    }

    try {
      const gasUrl = getActiveGasUrl();

      // 1. First attempt direct GET_TEAM endpoint (Faster, minimal bandwidth)
      try {
        const directRes = await fetch(`${gasUrl}?action=GET_TEAM&teamCode=${encodeURIComponent(rawCode)}`, {
          signal: AbortSignal.timeout(8000),
        });
        const directText = await directRes.text();

        // Check if Apps Script returned an HTML compilation or runtime error page
        if (directText.includes('SyntaxError') || directText.includes('Identifier') || directText.startsWith('<!DOCTYPE html>')) {
          const syntaxMatch = directText.match(/(SyntaxError:[^<]+)/i);
          const errDetail = syntaxMatch ? syntaxMatch[1].trim() : 'Google Apps Script project syntax/runtime error.';
          console.error('[Apps Script compilation error]:', errDetail);
          return res.status(502).json({
            success: false,
            error: `Apps Script deployment error: ${errDetail}. Please deploy the updated script in Apps Script editor.`,
          });
        }

        try {
          const directJson = JSON.parse(directText);
          if (directJson && directJson.success && directJson.team) {
            // Strictly sanitize members: only name and college
            const sanitizedMembers = (directJson.team.members || []).map((m: any) => ({
              name: String(m.name || m).trim(),
              college: String(m.college || 'N/A').trim(),
            }));

            return res.status(200).json({
              success: true,
              team: {
                teamCode: rawCode,
                teamName: String(directJson.team.teamName || 'Registered Team').trim(),
                members: sanitizedMembers,
              },
            });
          }
        } catch {
          // Fall through to GET_REGISTRATIONS fallback
        }
      } catch (directErr) {
        console.warn('Direct GET_TEAM request error, trying GET_REGISTRATIONS fallback:', directErr);
      }

      // 2. Fallback to GET_REGISTRATIONS
      const gasRes = await fetch(`${gasUrl}?action=GET_REGISTRATIONS`, {
        signal: AbortSignal.timeout(10000),
      });
      const gasText = await gasRes.text();

      if (gasText.includes('SyntaxError') || gasText.includes('Identifier') || gasText.startsWith('<!DOCTYPE html>')) {
        const syntaxMatch = gasText.match(/(SyntaxError:[^<]+)/i);
        const errDetail = syntaxMatch ? syntaxMatch[1].trim() : 'Google Apps Script project syntax/runtime error.';
        console.error('[Apps Script compilation error]:', errDetail);
        return res.status(502).json({
          success: false,
          error: `Apps Script deployment error: ${errDetail}. Please deploy the updated script in Apps Script editor.`,
        });
      }

      let gasJson: any = null;
      try {
        gasJson = JSON.parse(gasText);
      } catch (e) {
        console.error('Failed to parse GET_REGISTRATIONS JSON:', gasText.slice(0, 200));
      }

      if (gasJson && gasJson.success && Array.isArray(gasJson.data)) {
        const match = gasJson.data.find((item: any) => {
          const regId = String(item['Registration ID'] || item.registrationId || item.registrationid || '').trim().toUpperCase();
          return regId === rawCode;
        });

        if (match) {
          const teamName = String(match['Team Name'] || match.teamName || match.teamname || '').trim();
          const leaderName = String(match['Team Leader Name'] || match.teamLeaderName || match.leaderName || '').trim();
          const leaderCollege = String(
            match['Leader College Name'] || match['Team Leader College Name'] || match.leaderCollege || 'N/A'
          ).trim();

          const membersList: Array<{ name: string; college: string }> = [];
          if (leaderName) {
            membersList.push({ name: leaderName, college: leaderCollege || 'N/A' });
          }

          for (let m = 2; m <= 4; m++) {
            const mName = String(match[`Member ${m} Name`] || match[`member${m}Name`] || match[`member${m}name`] || '').trim();
            const mCollege = String(
              match[`Member ${m} College Name`] || match[`Member ${m} College`] || match[`member${m}College`] || leaderCollege || 'N/A'
            ).trim();
            if (mName && mName.toLowerCase() !== 'none' && mName.toLowerCase() !== 'null') {
              membersList.push({ name: mName, college: mCollege || leaderCollege || 'N/A' });
            }
          }

          return res.status(200).json({
            success: true,
            team: {
              teamCode: rawCode,
              teamName: teamName || 'Unknown Team',
              members: membersList,
            },
          });
        }
      }

      return res.status(404).json({
        success: false,
        error: `Team with Code "${rawCode}" was not found in the registration system.`,
      });
    } catch (err: any) {
      console.error('get_team error:', err);
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve team details from registration database.',
      });
    }
  }

  // 4. Check Existing Attendance for Team Code
  if (action === 'get_attendance') {
    const rawCode = String(body.teamCode || req.query?.teamCode || '').trim().toUpperCase();
    if (!rawCode) {
      return res.status(400).json({ success: false, error: 'Team Code is required.' });
    }

    // Check local cache first
    const localRecords = readLocalAttendance();
    const localMatch = localRecords.find(r => r.teamCode.toUpperCase() === rawCode);

    // Also query Google Apps Script if available
    try {
      const gasUrl = getActiveGasUrl();
      const gasRes = await fetch(`${gasUrl}?action=CHECK_ATTENDANCE&teamCode=${encodeURIComponent(rawCode)}`, {
        signal: AbortSignal.timeout(8000),
      });
      if (gasRes.ok) {
        const gasText = await gasRes.text();
        if (!gasText.startsWith('<!DOCTYPE html>')) {
          try {
            const gasJson = JSON.parse(gasText);
            if (gasJson && gasJson.success && gasJson.exists) {
              return res.status(200).json({
                success: true,
                exists: true,
                record: gasJson.record,
              });
            }
          } catch {}
        }
      }
    } catch (e) {
      console.warn('Apps Script attendance check notice:', e);
    }

    if (localMatch) {
      return res.status(200).json({
        success: true,
        exists: true,
        record: localMatch,
      });
    }

    return res.status(200).json({
      success: true,
      exists: false,
    });
  }

  // 5. Submit / Edit Attendance
  if (action === 'mark_attendance') {
    const { teamCode, teamName, members, isEdit } = body;
    const cleanCode = String(teamCode || '').trim().toUpperCase();
    const cleanTeam = String(teamName || '').trim();

    if (!cleanCode) {
      return res.status(400).json({ success: false, error: 'Team Code is required.' });
    }
    if (!Array.isArray(members) || members.length === 0) {
      return res.status(400).json({ success: false, error: 'Member attendance data is required.' });
    }

    // Check if duplicate and not editing
    const existing = readLocalAttendance();
    const existingIdx = existing.findIndex(r => r.teamCode.toUpperCase() === cleanCode);

    if (existingIdx !== -1 && !isEdit) {
      return res.status(409).json({
        success: false,
        alreadyMarked: true,
        message: 'Attendance for this team has already been recorded. Use edit mode to update.',
        existingRecord: existing[existingIdx],
      });
    }

    const timestamp = formatISTTimestamp();
    const sanitizedMembers = members.map((m: any) => ({
      name: String(m.name || '').trim(),
      college: String(m.college || 'N/A').trim(),
      status: (m.status === 'Present' ? 'Present' : 'Absent') as 'Present' | 'Absent',
    }));

    const totalPresent = sanitizedMembers.filter(m => m.status === 'Present').length;
    const totalMembers = sanitizedMembers.length;

    const newRecord: AttendanceRecord = {
      teamCode: cleanCode,
      teamName: cleanTeam || 'Sakthi HackFest Team',
      members: sanitizedMembers,
      totalPresent,
      totalMembers,
      timestamp,
      markedBy: auth.username || 'volunteer',
    };

    // 1. Update local cache
    if (existingIdx !== -1) {
      existing[existingIdx] = newRecord;
    } else {
      existing.unshift(newRecord);
    }
    saveLocalAttendance(existing);

    // 2. Forward to Google Apps Script Web App (Writes to Sheet GID 1959900323)
    let gasSuccess = false;
    let gasErrorMsg = '';

    try {
      const gasUrl = getActiveGasUrl();
      const payload = {
        action: 'SAVE_ATTENDANCE',
        data: newRecord,
        isEdit: Boolean(isEdit),
        targetGid: TARGET_ATTENDANCE_GID,
      };

      const gasRes = await fetch(gasUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10000),
      });

      if (gasRes.ok) {
        const gasText = await gasRes.text();
        if (!gasText.startsWith('<!DOCTYPE html>')) {
          try {
            const gasJson = JSON.parse(gasText);
            if (gasJson && gasJson.success) {
              gasSuccess = true;
            } else {
              gasErrorMsg = gasJson?.message || 'Apps script returned unsuccessful';
            }
          } catch {
            gasErrorMsg = 'Failed to parse Apps Script response';
          }
        } else {
          gasErrorMsg = 'Apps Script deployment/compilation error';
        }
      }
    } catch (e: any) {
      gasErrorMsg = e.message || 'Apps script network request error';
      console.warn('Apps Script save attendance error:', e);
    }

    return res.status(200).json({
      success: true,
      message: isEdit
        ? 'Attendance updated successfully.'
        : 'Attendance recorded successfully.',
      record: newRecord,
      gasSynced: gasSuccess,
      gasNotice: gasErrorMsg || undefined,
    });
  }

  // 6. Get All Attendance Records (Summary Statistics)
  if (action === 'get_all_attendance') {
    const records = readLocalAttendance();
    const totalMarked = records.length;
    const totalPresentParticipants = records.reduce((sum, r) => sum + (r.totalPresent || 0), 0);

    return res.status(200).json({
      success: true,
      records,
      stats: {
        totalMarkedTeams: totalMarked,
        totalPresentParticipants,
      },
    });
  }

  return res.status(400).json({ success: false, error: `Invalid action "${action}".` });
}
