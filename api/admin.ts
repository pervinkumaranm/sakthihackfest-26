/**
 * SAKTHI HACKFEST 2K26 — Secure Serverless Admin Backend
 * Endpoint: POST /api/admin
 *
 * Provides protected operations:
 * - Admin Authentication & Session Token Issuance
 * - Real-time Google Sheets Registration Fetching
 * - Real-time Registration Editing & Persistence
 * - Real-time Payment Status Verification & Rejection
 * - Real-time Registration Deletion with Confirmation
 * - Audit Trail Logging
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
const SHEET_TAB_NAME = 'Registrations';
const AUDIT_TAB_NAME = 'Audit_Log';

// ── Environment & Authentication Helpers ─────────────────────────────────────

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
  } catch {
    // Edge/Production serverless environment
  }
}

function getServiceAccountAuth() {
  loadLocalEnvIfNeeded();
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  let privateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!clientEmail || !privateKey) {
    throw new Error(
      'Google Cloud Service Account credentials missing in environment.'
    );
  }

  if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
    privateKey = privateKey.slice(1, -1);
  }
  privateKey = privateKey.replace(/\\n/g, '\n');

  return new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

function formatTimestamp(date = new Date()): string {
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

// ── Secure Session Token Management ─────────────────────────────────────────

function getAdminSecret(): string {
  loadLocalEnvIfNeeded();
  return (
    process.env.ADMIN_JWT_SECRET ||
    process.env.GOOGLE_PRIVATE_KEY?.slice(0, 32) ||
    'sakthi-hackfest-2026-admin-secret-seed-982341'
  );
}

function generateAdminToken(username: string): { token: string; expiresAt: number } {
  const secret = getAdminSecret();
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours validity
  const payload = JSON.stringify({
    u: username,
    exp: expiresAt,
    salt: crypto.randomBytes(8).toString('hex'),
  });
  const encodedPayload = Buffer.from(payload).toString('base64url');
  const signature = crypto
    .createHmac('sha256', secret)
    .update(encodedPayload)
    .digest('base64url');
  const token = `${encodedPayload}.${signature}`;
  return { token, expiresAt };
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

  if (signature !== expectedSig) {
    return { valid: false };
  }

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
    if (!payload.exp || Date.now() > payload.exp) {
      return { valid: false }; // Expired
    }
    return { valid: true, username: payload.u };
  } catch {
    return { valid: false };
  }
}

function extractToken(req: any): string | undefined {
  const authHeader = req.headers?.authorization || req.headers?.Authorization;
  if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }
  if (req.body?.token) {
    return req.body.token;
  }
  return undefined;
}

// ── Google Sheets Operations ────────────────────────────────────────────────

async function getSheetMeta(sheets: any, spreadsheetId: string) {
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const sheetList = meta.data.sheets || [];
  let targetTab = sheetList.find(
    (s: any) => s.properties?.title?.toLowerCase() === SHEET_TAB_NAME.toLowerCase()
  );
  const tabName = targetTab ? targetTab.properties.title : (sheetList[0]?.properties?.title || 'Sheet1');
  const tabSheetId = targetTab?.properties?.sheetId || sheetList[0]?.properties?.sheetId || 0;

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${tabName}'`,
  });
  const values: any[][] = res.data.values || [];
  const headers: string[] = values.length > 0 ? values[0].map((h: any) => String(h || '').trim()) : [];
  const rows: any[][] = values.slice(1);

  return { tabName, tabSheetId, headers, rows };
}

function parseRowToRegistration(row: any[], headers: string[]): any {
  const norm = (s: string) =>
    String(s || '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');

  const getVal = (name: string, fallback = '') => {
    const k = norm(name);
    const idx = headers.findIndex(h => norm(h) === k);
    if (idx !== -1 && row[idx] !== undefined && row[idx] !== null) {
      return String(row[idx]).trim();
    }
    return fallback;
  };

  const regId = getVal('Registration ID');
  const teamSize = parseInt(getVal('Team Size', '2'), 10) || 2;

  // Build members list
  const members: any[] = [];
  for (let m = 2; m <= 4; m++) {
    const mName = getVal(`Member ${m} Name`);
    if (mName) {
      members.push({
        name: mName,
        college: getVal(`Member ${m} College`) || getVal(`Member ${m} College Name`),
        department: getVal(`Member ${m} Department`),
        yearOfStudy: getVal(`Member ${m} Year`),
        whatsapp: getVal(`Member ${m} WhatsApp`),
        email: getVal(`Member ${m} Email`),
      });
    }
  }

  const rawPaymentStatus = getVal('Payment Status', 'PENDING').toUpperCase();
  const paymentStatus = ['VERIFIED', 'REJECTED', 'PENDING', 'SUBMITTED'].includes(rawPaymentStatus)
    ? rawPaymentStatus
    : 'PENDING';

  const rawRegStatus = getVal('Registration Status', 'CONFIRMED').toUpperCase();
  const registrationStatus = ['CONFIRMED', 'VERIFIED', 'REJECTED', 'PENDING'].includes(rawRegStatus)
    ? rawRegStatus
    : 'CONFIRMED';

  const rawEmailStatus = getVal('Email Status', 'PENDING').toUpperCase();
  const emailStatus = ['SENT', 'FAILED', 'PENDING'].includes(rawEmailStatus) ? rawEmailStatus : 'PENDING';

  return {
    registrationId: regId,
    timestamp: getVal('Timestamp'),
    teamName: getVal('Team Name'),
    teamSize,
    selectedDomain: getVal('Selected Domain'),
    selectedTheme: getVal('Selected Theme') || 'Open Innovation',
    selectedThemeName: getVal('Selected Theme') || 'Open Innovation',
    accommodationRequired: getVal('Accommodation Required', 'No') as 'Yes' | 'No',
    leaderName: getVal('Team Leader Name'),
    leaderCollege: getVal('Team Leader College') || getVal('Leader College Name'),
    leaderDepartment: getVal('Team Leader Department'),
    leaderYear: getVal('Team Leader Year'),
    leaderWhatsapp: getVal('Team Leader WhatsApp'),
    leaderEmail: getVal('Team Leader Email'),
    members,
    paymentAmount: parseInt(getVal('Payment Amount', '1000'), 10) || 1000,
    upiTransactionId: getVal('UPI Transaction ID'),
    paymentScreenshotDriveUrl: getVal('Payment Screenshot URL'),
    driveFileId: getVal('Google Drive File ID'),
    paymentStatus,
    registrationStatus,
    emailStatus,
    emailSentAt: getVal('Email Sent At'),
    lastUpdated: getVal('Last Updated') || getVal('Timestamp'),
  };
}

// Write Audit Log
async function recordAudit(
  sheets: any,
  spreadsheetId: string,
  user: string,
  action: string,
  regId: string,
  details = ''
) {
  try {
    const timestamp = formatTimestamp(new Date());
    // Try appending to Audit_Log
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `'${AUDIT_TAB_NAME}'`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [[timestamp, user, action, regId, details]],
      },
    });
  } catch {
    console.log(`[AUDIT] ${action} on ${regId} by ${user} at ${new Date().toISOString()}: ${details}`);
  }
}

// ── Main Request Handler ─────────────────────────────────────────────────────

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  loadLocalEnvIfNeeded();
  const body = req.body || {};
  const action = body.action;

  // 1. Admin Login Action
  if (action === 'login') {
    const { username, password } = body;
    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Username and password are required.' });
    }

    const envUser = process.env.ADMIN_USERNAME?.trim();
    const envPass = process.env.ADMIN_PASSWORD?.trim();

    const cleanUser = String(username).trim();
    const cleanPass = String(password).trim();

    let authenticated = false;

    // Check against environment credentials if set
    if (envUser && envPass && cleanUser.toLowerCase() === envUser.toLowerCase() && cleanPass === envPass) {
      authenticated = true;
    }
    // Also accept authorized standard organizers login credentials
    if (
      (cleanUser.toLowerCase() === 'shf@26' && cleanPass === 'SSEC@SHF26') ||
      (cleanUser.toLowerCase() === 'admin' && cleanPass === 'SSEC@SHF26') ||
      (cleanUser.toLowerCase() === 'admin@sakthihackfest.in' && cleanPass === 'SSEC@SHF26')
    ) {
      authenticated = true;
    }

    if (!authenticated) {
      return res.status(401).json({
        success: false,
        error: 'Invalid administrator credentials.',
      });
    }

    const { token, expiresAt } = generateAdminToken(cleanUser);
    return res.status(200).json({
      success: true,
      token,
      expiresAt,
      user: {
        username: cleanUser,
        role: 'SUPER_ADMIN',
      },
    });
  }

  // Verify Session Token for all other actions
  const token = extractToken(req);
  const auth = verifyAdminToken(token);
  if (!auth.valid || !auth.username) {
    return res.status(401).json({
      success: false,
      error: 'Session expired or unauthorized. Please log in again.',
    });
  }

  const currentAdmin = auth.username;

  // 2. Verify Session
  if (action === 'verify_session') {
    return res.status(200).json({
      success: true,
      valid: true,
      user: { username: currentAdmin },
    });
  }

  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID || DEFAULT_SPREADSHEET_ID;

  let sheets: any;
  try {
    const jwt = getServiceAccountAuth();
    sheets = google.sheets({ version: 'v4', auth: jwt });
  } catch (authErr: any) {
    console.error('Service account auth error:', authErr);
    return res.status(500).json({
      success: false,
      error: 'Unable to connect to Google Sheets backend. Check service account configuration.',
    });
  }

  // 3. Get All Registrations & Live Statistics
  if (action === 'get_registrations') {
    try {
      const { headers, rows } = await getSheetMeta(sheets, spreadsheetId);
      const registrations = rows
        .map(row => parseRowToRegistration(row, headers))
        .filter(r => Boolean(r.registrationId));

      const totalRegistrations = registrations.length;
      const totalTeams = registrations.length;
      const totalParticipants = registrations.reduce(
        (sum, r) => sum + (r.teamSize || 2),
        0
      );

      const paymentSubmitted = registrations.filter(r =>
        Boolean(r.upiTransactionId && r.upiTransactionId.length > 2)
      ).length;
      const paymentPending = registrations.filter(
        r => r.paymentStatus === 'PENDING'
      ).length;
      const verifiedCount = registrations.filter(
        r => r.paymentStatus === 'VERIFIED'
      ).length;
      const rejectedCount = registrations.filter(
        r => r.paymentStatus === 'REJECTED'
      ).length;

      const accommodationCount = registrations.filter(
        r => r.accommodationRequired === 'Yes'
      ).length;

      const emailSentCount = registrations.filter(
        r => r.emailStatus === 'SENT'
      ).length;
      const emailFailedCount = registrations.filter(
        r => r.emailStatus === 'FAILED'
      ).length;

      return res.status(200).json({
        success: true,
        data: registrations,
        stats: {
          totalRegistrations,
          totalTeams,
          totalParticipants,
          paymentSubmitted,
          paymentPending,
          verifiedCount,
          rejectedCount,
          accommodationCount,
          emailSentCount,
          emailFailedCount,
        },
      });
    } catch (err: any) {
      console.error('Failed to load registrations:', err);
      return res.status(500).json({
        success: false,
        error: 'Unable to load registration data. Please try again.',
      });
    }
  }

  // 4. Update Existing Registration Record
  if (action === 'update_registration') {
    const { registrationId, updates } = body;
    if (!registrationId || !updates) {
      return res.status(400).json({ success: false, error: 'Registration ID and updates are required.' });
    }

    try {
      const { tabName, headers, rows } = await getSheetMeta(sheets, spreadsheetId);
      const norm = (s: string) =>
        String(s || '')
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '');

      const idColIdx = headers.findIndex(h => norm(h) === 'registrationid');
      if (idColIdx === -1) {
        throw new Error('Registration ID column not found in Google Sheet.');
      }

      const cleanTargetId = String(registrationId).trim().toUpperCase();
      const rowIndexInRows = rows.findIndex(
        r => String(r[idColIdx] || '').trim().toUpperCase() === cleanTargetId
      );

      if (rowIndexInRows === -1) {
        return res.status(404).json({
          success: false,
          error: `Registration ${registrationId} not found in database.`,
        });
      }

      const existingRow = [...rows[rowIndexInRows]];
      const sheetRowNumber = rowIndexInRows + 2; // 1-based, Row 1 is header

      const currentRecord = parseRowToRegistration(existingRow, headers);
      const timestampStr = formatTimestamp(new Date());

      // Merge members
      const members = updates.members || currentRecord.members || [];
      const m2 = members[0] || {};
      const m3 = members[1] || {};
      const m4 = members[2] || {};

      const dataMap: Record<string, any> = {
        registrationid: currentRecord.registrationId, // preserve original
        timestamp: currentRecord.timestamp, // preserve original
        teamname: updates.teamName ?? currentRecord.teamName,
        teamsize: updates.teamSize ?? currentRecord.teamSize,
        selecteddomain: updates.selectedDomain ?? currentRecord.selectedDomain,
        selectedtheme: updates.selectedTheme ?? currentRecord.selectedTheme,
        accommodationrequired: updates.accommodationRequired ?? currentRecord.accommodationRequired,
        teamleadername: updates.leaderName ?? currentRecord.leaderName,
        teamleadercollege: updates.leaderCollege ?? currentRecord.leaderCollege,
        leadercollegename: updates.leaderCollege ?? currentRecord.leaderCollege,
        teamleaderdepartment: updates.leaderDepartment ?? currentRecord.leaderDepartment,
        teamleaderyear: updates.leaderYear ?? currentRecord.leaderYear,
        teamleaderwhatsapp: updates.leaderWhatsapp ?? currentRecord.leaderWhatsapp,
        teamleaderemail: updates.leaderEmail ?? currentRecord.leaderEmail,

        member2name: m2.name ?? '',
        member2college: m2.college ?? '',
        member2collegename: m2.college ?? '',
        member2department: m2.department ?? '',
        member2year: m2.yearOfStudy ?? '',
        member2whatsapp: m2.whatsapp ?? '',
        member2email: m2.email ?? '',

        member3name: m3.name ?? '',
        member3college: m3.college ?? '',
        member3collegename: m3.college ?? '',
        member3department: m3.department ?? '',
        member3year: m3.yearOfStudy ?? '',
        member3whatsapp: m3.whatsapp ?? '',
        member3email: m3.email ?? '',

        member4name: m4.name ?? '',
        member4college: m4.college ?? '',
        member4collegename: m4.college ?? '',
        member4department: m4.department ?? '',
        member4year: m4.yearOfStudy ?? '',
        member4whatsapp: m4.whatsapp ?? '',
        member4email: m4.email ?? '',

        paymentamount: updates.paymentAmount ?? currentRecord.paymentAmount,
        upitransactionid: updates.upiTransactionId ?? currentRecord.upiTransactionId,
        paymentscreenshoturl: currentRecord.paymentScreenshotDriveUrl, // preserve original
        googledrivefileid: currentRecord.driveFileId, // preserve original
        paymentstatus: updates.paymentStatus ?? currentRecord.paymentStatus,
        registrationstatus: updates.registrationStatus ?? currentRecord.registrationStatus,
        emailstatus: currentRecord.emailStatus, // preserve original
        emailsentat: currentRecord.emailSentAt, // preserve original
        lastupdated: timestampStr,
      };

      const updatedRowValues = headers.map((header, idx) => {
        const k = norm(header);
        return dataMap[k] !== undefined ? dataMap[k] : (existingRow[idx] ?? '');
      });

      // Update exact row in Google Sheet
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `'${tabName}'!A${sheetRowNumber}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [updatedRowValues],
        },
      });

      await recordAudit(sheets, spreadsheetId, currentAdmin, 'ADMIN_UPDATED', cleanTargetId, 'Details modified');

      const updatedRecord = parseRowToRegistration(updatedRowValues, headers);
      return res.status(200).json({
        success: true,
        message: 'Registration updated successfully.',
        data: updatedRecord,
      });
    } catch (err: any) {
      console.error('Update registration error:', err);
      return res.status(500).json({
        success: false,
        error: 'Unable to update this registration. Please try again.',
      });
    }
  }

  // 5. Verify / Reject Payment
  if (action === 'verify_payment') {
    const { registrationId, paymentStatus, rejectionReason } = body;
    if (!registrationId || !paymentStatus) {
      return res.status(400).json({ success: false, error: 'Registration ID and payment status required.' });
    }

    const cleanStatus = String(paymentStatus).toUpperCase();
    if (!['VERIFIED', 'REJECTED', 'PENDING'].includes(cleanStatus)) {
      return res.status(400).json({ success: false, error: 'Invalid payment status value.' });
    }

    try {
      const { tabName, headers, rows } = await getSheetMeta(sheets, spreadsheetId);
      const norm = (s: string) =>
        String(s || '')
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '');

      const idColIdx = headers.findIndex(h => norm(h) === 'registrationid');
      const cleanTargetId = String(registrationId).trim().toUpperCase();
      const rowIndexInRows = rows.findIndex(
        r => String(r[idColIdx] || '').trim().toUpperCase() === cleanTargetId
      );

      if (rowIndexInRows === -1) {
        return res.status(404).json({ success: false, error: `Registration ${registrationId} not found.` });
      }

      const existingRow = [...rows[rowIndexInRows]];
      const sheetRowNumber = rowIndexInRows + 2;

      const payStatusColIdx = headers.findIndex(h => norm(h) === 'paymentstatus');
      const regStatusColIdx = headers.findIndex(h => norm(h) === 'registrationstatus');
      const lastUpdatedColIdx = headers.findIndex(h => norm(h) === 'lastupdated');

      if (payStatusColIdx !== -1) {
        existingRow[payStatusColIdx] = cleanStatus;
      }
      if (regStatusColIdx !== -1) {
        existingRow[regStatusColIdx] = cleanStatus === 'VERIFIED' ? 'CONFIRMED' : cleanStatus === 'REJECTED' ? 'REJECTED' : 'PENDING';
      }
      if (lastUpdatedColIdx !== -1) {
        existingRow[lastUpdatedColIdx] = formatTimestamp(new Date());
      }

      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `'${tabName}'!A${sheetRowNumber}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [existingRow],
        },
      });

      const auditAction = cleanStatus === 'VERIFIED' ? 'PAYMENT_VERIFIED' : 'PAYMENT_REJECTED';
      await recordAudit(
        sheets,
        spreadsheetId,
        currentAdmin,
        auditAction,
        cleanTargetId,
        rejectionReason ? `Reason: ${rejectionReason}` : 'Status updated'
      );

      const updatedRecord = parseRowToRegistration(existingRow, headers);
      return res.status(200).json({
        success: true,
        message: `Payment status updated to ${cleanStatus}.`,
        data: updatedRecord,
      });
    } catch (err: any) {
      console.error('Payment verification error:', err);
      return res.status(500).json({
        success: false,
        error: 'Unable to update payment status. Please try again.',
      });
    }
  }

  // 6. Delete Registration
  if (action === 'delete_registration') {
    const { registrationId } = body;
    if (!registrationId) {
      return res.status(400).json({ success: false, error: 'Registration ID required for deletion.' });
    }

    try {
      const { tabName, tabSheetId, headers, rows } = await getSheetMeta(sheets, spreadsheetId);
      const norm = (s: string) =>
        String(s || '')
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '');

      const idColIdx = headers.findIndex(h => norm(h) === 'registrationid');
      const cleanTargetId = String(registrationId).trim().toUpperCase();
      const rowIndexInRows = rows.findIndex(
        r => String(r[idColIdx] || '').trim().toUpperCase() === cleanTargetId
      );

      if (rowIndexInRows === -1) {
        return res.status(404).json({ success: false, error: `Registration ${registrationId} not found.` });
      }

      // 0-based row index for Google Sheets deleteDimension API:
      // Row 1 (header) is index 0.
      // rowIndexInRows = 0 corresponds to Row 2, which is index 1.
      const sheetRowIndex = rowIndexInRows + 1;

      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              deleteDimension: {
                range: {
                  sheetId: tabSheetId,
                  dimension: 'ROWS',
                  startIndex: sheetRowIndex,
                  endIndex: sheetRowIndex + 1,
                },
              },
            },
          ],
        },
      });

      await recordAudit(sheets, spreadsheetId, currentAdmin, 'ADMIN_DELETED', cleanTargetId, 'Record removed from sheet');

      return res.status(200).json({
        success: true,
        message: `Registration ${registrationId} deleted successfully.`,
      });
    } catch (err: any) {
      console.error('Delete registration error:', err);
      return res.status(500).json({
        success: false,
        error: 'Unable to delete this registration. Please try again.',
      });
    }
  }

  return res.status(400).json({ success: false, error: `Unknown action: ${action}` });
}
