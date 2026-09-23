/**
 * SAKTHI HACKFEST 2K26 — Registration Serverless Backend
 * Endpoint: POST /api/register
 *
 * Architecture:
 * React -> Vercel Server API (/api/register)
 *   -> Google Sheets API v4 (Store registration)
 *   -> Google Drive API v3 (Upload payment screenshot in hierarchy)
 *   -> Gmail API v1 (Send confirmation email to Team Leader)
 *
 * ABSOLUTELY NO GOOGLE APPS SCRIPT.
 */

import { google } from 'googleapis';
import { Readable } from 'stream';
import fs from 'fs';
import path from 'path';
import process from 'node:process';
import { Buffer } from 'node:buffer';

export const config = {
  maxDuration: 60,
};

// ── Default Constants ──────────────────────────────────────────────────────
const DEFAULT_SPREADSHEET_ID = '1F_XlNsLdUXx31w92caKs5jidCeI0jcZIMY_TPPBJefE';
const DEFAULT_DRIVE_ROOT_FOLDER_ID = '10CljhVy7pYl5VTcjh6y8WK8yA0KF58Ov';
const SHEET_TAB_NAME = 'Registrations';

const ROOT_FOLDER_NAME = 'SAKTHI HACKFEST 2K26';
const PROOFS_FOLDER_NAME = 'Payment Proofs';

const SENDER_EMAIL = 'sakthihackfest@gmail.com';
const SENDER_NAME = "Team Sakthi HackFest'26";

// 40 Required Columns
const SHEET_COLUMNS = [
  'Registration ID',
  'Timestamp',
  'Team Name',
  'Team Size',
  'Selected Domain',
  'Selected Theme',
  'Accommodation Required',
  'Team Leader Name',
  'Team Leader College',
  'Team Leader Department',
  'Team Leader Year',
  'Team Leader WhatsApp',
  'Team Leader Email',
  'Member 2 Name',
  'Member 2 College',
  'Member 2 Department',
  'Member 2 Year',
  'Member 2 WhatsApp',
  'Member 2 Email',
  'Member 3 Name',
  'Member 3 College',
  'Member 3 Department',
  'Member 3 Year',
  'Member 3 WhatsApp',
  'Member 3 Email',
  'Member 4 Name',
  'Member 4 College',
  'Member 4 Department',
  'Member 4 Year',
  'Member 4 WhatsApp',
  'Member 4 Email',
  'Payment Amount',
  'UPI Transaction ID',
  'Payment Screenshot URL',
  'Google Drive File ID',
  'Payment Status',
  'Registration Status',
  'Email Status',
  'Email Sent At',
  'Last Updated',
];

// ── Google Cloud Authentication Helpers ─────────────────────────────────────

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
          if (val) {
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
      'Google Cloud Service Account credentials missing. Please set GOOGLE_CLIENT_EMAIL and GOOGLE_PRIVATE_KEY in your environment.'
    );
  }

  // Handle newline escapes in private key (e.g. from Vercel env or .env file)
  if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
    privateKey = privateKey.slice(1, -1);
  }
  privateKey = privateKey.replace(/\\n/g, '\n');

  return new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive',
    ],
  });
}

function getGmailAuth() {
  loadLocalEnvIfNeeded();
  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    return null;
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  return oauth2Client;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function formatTimestamp(date = new Date()): string {
  // Asia/Kolkata format: YYYY-MM-DD HH:mm:ss
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

function generateRegistrationIdCandidate(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // Exclude ambiguous chars (0, O, 1, I)
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `SHF26-${code}`;
}

function cleanGoogleId(val?: string): string {
  if (!val) return '';
  let str = String(val).trim();
  const matchSpreadsheet = str.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (matchSpreadsheet) return matchSpreadsheet[1];
  const matchFolder = str.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if (matchFolder) return matchFolder[1];
  str = str.split('?')[0].split('#')[0].trim();
  return str;
}

function escapeHtml(text: string): string {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ── Google Drive Folder & File Operations ──────────────────────────────────

async function getOrCreateFolder(
  drive: any,
  folderName: string,
  parentId?: string
): Promise<string> {
  let query = `name = '${folderName.replace(/'/g, "\\'")}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
  if (parentId) {
    query += ` and '${parentId}' in parents`;
  }

  const res = await drive.files.list({
    q: query,
    fields: 'files(id, name)',
    spaces: 'drive',
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  });

  if (res.data.files && res.data.files.length > 0) {
    return res.data.files[0].id;
  }

  // Create folder if not found
  const createRes = await drive.files.create({
    requestBody: {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: parentId ? [parentId] : undefined,
    },
    supportsAllDrives: true,
    fields: 'id',
  });

  return createRes.data.id;
}

async function uploadPaymentProofToDrive(
  drive: any,
  registrationId: string,
  base64Data: string,
  fileName: string
): Promise<{ fileId: string; viewUrl: string }> {
  loadLocalEnvIfNeeded();
  let rootFolderId =
    cleanGoogleId(process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID) ||
    DEFAULT_DRIVE_ROOT_FOLDER_ID;
  if (!rootFolderId) {
    rootFolderId = await getOrCreateFolder(drive, ROOT_FOLDER_NAME);
  }

  // 2. Find or create Payment Proofs inside root folder
  const proofsFolderId = await getOrCreateFolder(
    drive,
    PROOFS_FOLDER_NAME,
    rootFolderId
  );

  // 3. Create unique registration folder SHF26-XXXXXX inside Payment Proofs
  const regFolderId = await getOrCreateFolder(
    drive,
    registrationId,
    proofsFolderId
  );

  // 4. Parse Base64 buffer
  let mimeType = 'image/png';
  let pureBase64 = base64Data;

  const match = base64Data.match(/^data:([^;]+);base64,(.+)$/);
  if (match) {
    mimeType = match[1];
    pureBase64 = match[2];
  }

  const buffer = Buffer.from(pureBase64, 'base64');

  // Verify size <= 5MB
  if (buffer.length > 5 * 1024 * 1024) {
    throw new Error('Payment screenshot file exceeds maximum size of 5 MB.');
  }

  const fileExt = mimeType.split('/')[1] || 'png';
  const finalFileName = `${registrationId}_payment.${fileExt}`;

  // 5. Upload file into registration folder
  const stream = Readable.from(buffer);
  const uploadRes = await drive.files.create({
    requestBody: {
      name: finalFileName,
      parents: [regFolderId],
    },
    media: {
      mimeType,
      body: stream,
    },
    supportsAllDrives: true,
    fields: 'id, webViewLink, webContentLink',
  });

  const fileId = uploadRes.data.id;
  const viewUrl =
    uploadRes.data.webViewLink ||
    `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;

  // Try to make file readable to anyone with link (graceful fallback)
  try {
    await drive.permissions.create({
      fileId,
      supportsAllDrives: true,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });
  } catch (permErr) {
    console.warn('Could not set public permission on Drive file:', permErr);
  }

  return { fileId, viewUrl };
}

// ── Google Sheets Operations ────────────────────────────────────────────────

async function ensureSheetAndGetHeaders(
  sheets: any,
  spreadsheetId: string
): Promise<{ headers: string[]; existingRows: any[][]; tabName: string }> {
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const sheetList = meta.data.sheets || [];

  let targetTab = sheetList.find(
    (s: any) => s.properties?.title?.toLowerCase() === SHEET_TAB_NAME.toLowerCase()
  );

  let tabName = SHEET_TAB_NAME;

  if (!targetTab) {
    // Attempt to create 'Registrations' tab
    try {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: SHEET_TAB_NAME,
                  gridProperties: {
                    columnCount: 50,
                  },
                },
              },
            },
          ],
        },
      });
    } catch {
      // If addSheet fails, use the first existing sheet tab name
      tabName = sheetList[0]?.properties?.title || 'Sheet1';
    }
  }

  let values: any[][] = [];
  try {
    const getRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `'${tabName}'`,
    });
    values = getRes.data.values || [];
  } catch (err) {
    console.warn(`Reading tab ${tabName} returned empty`);
  }

  if (values.length === 0) {
    // Empty sheet: initialize headers
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `'${tabName}'!A1`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [SHEET_COLUMNS],
      },
    });
    return { headers: SHEET_COLUMNS, existingRows: [], tabName };
  }

  const headers = values[0].map((h: any) => String(h || '').trim());
  const existingRows = values.slice(1);
  return { headers, existingRows, tabName };
}

function checkDuplicateSubmission(
  existingRows: any[][],
  headers: string[],
  teamName: string,
  leaderEmail: string,
  upiTxnId: string
): { isDuplicate: boolean; reason?: string } {
  const norm = (s: string) =>
    String(s || '')
      .toLowerCase()
      .trim();

  const getColIdx = (name: string) => {
    const k = norm(name).replace(/[^a-z0-9]/g, '');
    return headers.findIndex(
      h => norm(h).replace(/[^a-z0-9]/g, '') === k
    );
  };

  const emailIdx = getColIdx('Team Leader Email');
  const teamIdx = getColIdx('Team Name');
  const upiIdx = getColIdx('UPI Transaction ID');

  const checkEmail = norm(leaderEmail);
  const checkTeam = norm(teamName);
  const checkUpi = norm(upiTxnId);

  for (const row of existingRows) {
    if (emailIdx !== -1 && norm(row[emailIdx]) === checkEmail) {
      return {
        isDuplicate: true,
        reason: `A registration with Team Leader Email "${leaderEmail}" has already been submitted.`,
      };
    }
    if (teamIdx !== -1 && norm(row[teamIdx]) === checkTeam) {
      return {
        isDuplicate: true,
        reason: `A registration with Team Name "${teamName}" already exists.`,
      };
    }
    if (checkUpi && upiIdx !== -1 && norm(row[upiIdx]) === checkUpi) {
      return {
        isDuplicate: true,
        reason: `A registration with UPI Transaction ID "${upiTxnId}" already exists.`,
      };
    }
  }

  return { isDuplicate: false };
}

function generateUniqueId(existingRows: any[][], headers: string[]): string {
  const norm = (s: string) =>
    String(s || '')
      .toLowerCase()
      .trim();
  const idColIdx = headers.findIndex(
    h => norm(h).replace(/[^a-z0-9]/g, '') === 'registrationid'
  );

  const existingIds = new Set<string>();
  if (idColIdx !== -1) {
    for (const row of existingRows) {
      if (row[idColIdx]) {
        existingIds.add(String(row[idColIdx]).trim().toUpperCase());
      }
    }
  }

  for (let attempt = 0; attempt < 50; attempt++) {
    const candidate = generateRegistrationIdCandidate();
    if (!existingIds.has(candidate)) {
      return candidate;
    }
  }

  return `SHF26-${Date.now().toString(36).toUpperCase()}`;
}

// ── Email Automation via Gmail API ──────────────────────────────────────────

// ── College Logo (Base64 Data URI for 100% email client compatibility) ────
const SSEC_LOGO_BASE64 =
  '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PWP7f8F6JqLWGpaYbyxif7JqMHk3EPyj5ZEydre2ava/4f0zxXo13pHiWwtNV0u/j8u6s7uISxTJnO1lPBHA61eRFiRUjUKiABVA4AHQUAOooooAKKPrQKACj86KM0AFFGKKACiijFABRQKPpQAUUUdaAFHvRQPeigBDRQetHagAo+lFBoAKPrQKKACiijvQAUZ9KKO1ABiijvRQAUUZo+lABRR3o7UAFFFFABRRR1oAKAKKKACiiigAooooAKKKKACiiigAoo7CigAoxR1ooAMUfSiigAxRRRQAUUZooAKX60lHUUAFFFFABRRRQAUCiigAooooAKKO1FABRRRQAUUUUAFFFHegAo+lH06UCgAooooAU0lFFABmiiigAoooFABRSjmigAxmjGKKKAE/Oj8aKKADAooooAXANFFFABjikoooAWiiigBKKKKAFxmiiigA4HTNGOKKKAACkIoooAUjFHFFFAB0pKKKAF4pOKKKAFpPpRRQAuOeaPpmiigA4BoxRRQAUUUUAGOetBFFFABjigjFFFABRRRQAUn50UUAL0PegiiigAxg0daKKAE6Y60oGaKKAAijHNFFABjFBFFFABx2zRjvRRQAlKPrRRQAAZpOKKKAFwMUEUUUAGOKKKKADFBoooAAKTGaKKADApaKKAAD0ooooA//2Q==';

function buildConfirmationEmailHtml(d: {
  registrationId: string;
  teamName: string;
  leaderName: string;
  teamMemberNames: string;
  selectedDomain: string;
  accommodationRequired: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sakthi HackFest'26 Registration Acknowledgement</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f7f7f7; font-family: Arial, Helvetica, sans-serif; -webkit-font-smoothing: antialiased; color: #111111;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f7f7f7; padding: 24px 12px;">
    <tr>
      <td align="center">
        <!-- Main Container Card -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 650px; background-color: #ffffff; border: 1px solid #dddddd; border-radius: 4px; overflow: hidden;">
          <tr>
            <td style="padding: 28px 32px 32px 32px; background-color: #ffffff;">
              
              <!-- 1. HEADER: College Official Banner Logo -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 16px;">
                <tr>
                  <td align="center" style="padding: 4px 0 10px 0;">
                    <img src="data:image/jpeg;base64,${SSEC_LOGO_BASE64}" alt="Sree Sakthi Engineering College" width="550" style="display: block; width: 100%; max-width: 550px; height: auto; border: 0; margin: 0 auto;" />
                  </td>
                </tr>
              </table>

              <!-- Divider below header -->
              <div style="border-top: 1px solid #dddddd; margin-bottom: 22px;"></div>

              <!-- 2. GREETING -->
              <p style="margin: 0 0 12px 0; font-size: 15px; line-height: 1.5; color: #111111;">
                Dear <strong>${escapeHtml(d.leaderName)}</strong>,
              </p>
              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.55; color: #333333;">
                Thank you for registering for <strong>Sakthi HackFest'26</strong>, a 24-hour hackathon at Sree Sakthi Engineering College. We're excited to have you on board and look forward to your participation.
              </p>

              <!-- 3. REGISTRATION DETAILS -->
              <div style="font-size: 13px; font-weight: 800; letter-spacing: 0.6px; color: #111111; text-transform: uppercase; margin-bottom: 8px;">
                REGISTRATION DETAILS
              </div>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border: 1px solid #dddddd; border-radius: 4px; background-color: #fafafa; margin-bottom: 20px; border-collapse: separate; border-spacing: 0;">
                <tr>
                  <td style="padding: 10px 14px; width: 140px; color: #555555; font-size: 13.5px; font-weight: 600; border-bottom: 1px solid #eeeeee;">Team Name</td>
                  <td style="padding: 10px 6px; width: 12px; color: #555555; font-weight: 600; border-bottom: 1px solid #eeeeee;">:</td>
                  <td style="padding: 10px 14px; color: #111111; font-size: 13.5px; font-weight: 700; border-bottom: 1px solid #eeeeee;">${escapeHtml(d.teamName)}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 14px; color: #555555; font-size: 13.5px; font-weight: 600; border-bottom: 1px solid #eeeeee;">Team ID</td>
                  <td style="padding: 10px 6px; color: #555555; font-weight: 600; border-bottom: 1px solid #eeeeee;">:</td>
                  <td style="padding: 10px 14px; border-bottom: 1px solid #eeeeee;">
                    <span style="display: inline-block; background-color: #e5e7eb; color: #111111; font-size: 13.5px; font-weight: 700; font-family: monospace, Arial, sans-serif; padding: 3px 10px; border-radius: 4px; border: 1px solid #d1d5db; letter-spacing: 0.8px;">
                      ${escapeHtml(d.registrationId)}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 14px; color: #555555; font-size: 13.5px; font-weight: 600; vertical-align: top; border-bottom: 1px solid #eeeeee;">Team Members</td>
                  <td style="padding: 10px 6px; color: #555555; font-weight: 600; vertical-align: top; border-bottom: 1px solid #eeeeee;">:</td>
                  <td style="padding: 10px 14px; color: #111111; font-size: 13.5px; font-weight: 700; line-height: 1.5; border-bottom: 1px solid #eeeeee;">${escapeHtml(d.teamMemberNames)}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 14px; color: #555555; font-size: 13.5px; font-weight: 600;">Accommodation</td>
                  <td style="padding: 10px 6px; color: #555555; font-weight: 600;">:</td>
                  <td style="padding: 10px 14px; color: #111111; font-size: 13.5px; font-weight: 700;">${escapeHtml(d.accommodationRequired || 'No')}</td>
                </tr>
              </table>

              <!-- 4. PAYMENT STATUS -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 4px; padding: 14px 16px; margin-bottom: 22px;">
                <tr>
                  <td width="36" valign="middle" style="padding-right: 12px; font-size: 24px; line-height: 1;">
                    💳
                  </td>
                  <td valign="middle">
                    <div style="font-size: 13.5px; font-weight: 700; color: #111111; margin-bottom: 3px;">
                      Payment status: Received, verification in progress.
                    </div>
                    <div style="font-size: 12.5px; color: #555555; line-height: 1.45;">
                      Your registration will be confirmed once your payment is verified. We will email you when it is.
                    </div>
                  </td>
                </tr>
              </table>

              <!-- 5. EVENT DETAILS -->
              <div style="font-size: 13px; font-weight: 800; letter-spacing: 0.6px; color: #111111; text-transform: uppercase; margin-bottom: 8px;">
                EVENT DETAILS
              </div>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size: 13.5px; line-height: 1.6; margin-bottom: 22px;">
                <tr>
                  <td style="padding: 4px 0; width: 140px; color: #555555; font-weight: 600;">Dates</td>
                  <td style="padding: 4px 6px; width: 12px; color: #555555; font-weight: 600;">:</td>
                  <td style="padding: 4px 0; color: #111111; font-weight: 500;">10–11 October 2026</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #555555; font-weight: 600; vertical-align: top;">Reporting</td>
                  <td style="padding: 4px 6px; color: #555555; font-weight: 600; vertical-align: top;">:</td>
                  <td style="padding: 4px 0; color: #111111; font-weight: 500;">9:00 AM, 10 October 2026, at Sree Sakthi Engineering College</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #555555; font-weight: 600; vertical-align: top;">Venue</td>
                  <td style="padding: 4px 6px; color: #555555; font-weight: 600; vertical-align: top;">:</td>
                  <td style="padding: 4px 0; color: #111111; font-weight: 500;">Sree Sakthi Engineering College, Karamadai.</td>
                </tr>
              </table>

              <!-- 6. HACKATHON DOMAINS -->
              <div style="font-size: 13px; font-weight: 800; letter-spacing: 0.6px; color: #111111; text-transform: uppercase; margin-bottom: 8px;">
                HACKATHON DOMAINS
              </div>
              <ul style="margin: 0 0 22px 0; padding-left: 20px; font-size: 13.5px; color: #222222; line-height: 1.8;">
                <li>Generative AI</li>
                <li>Cryptography and Cyber Security</li>
                <li>Sustainable Development Goals</li>
                <li>Digital Prototyping &amp; Design</li>
                <li>Web3 &amp; FinTech</li>
              </ul>

              <!-- 7. IMPORTANT NOTICE -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f7f7f7; border: 1px solid #dddddd; border-radius: 4px; padding: 14px 16px; margin-bottom: 22px;">
                <tr>
                  <td width="36" valign="top" style="padding-right: 12px; font-size: 22px; line-height: 1.2;">
                    ⚠️
                  </td>
                  <td valign="top">
                    <div style="font-size: 13.5px; font-weight: 700; color: #111111; margin-bottom: 3px;">
                      Important
                    </div>
                    <div style="font-size: 12.5px; color: #444444; line-height: 1.45;">
                      The problem statements will be revealed only at the start of the hackathon. All projects must be built during the 24 hours, and pre-built projects are not allowed.
                    </div>
                  </td>
                </tr>
              </table>

              <!-- 8. WHATSAPP SECTION (ONLY SECTION WITH COLOR ACCENT) -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 20px 24px; text-align: center; margin-bottom: 20px;">
                <tr>
                  <td align="center">
                    <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 auto 6px auto;">
                      <tr>
                        <td style="font-size: 28px; line-height: 1; padding-right: 8px; vertical-align: middle;">
                          💬
                        </td>
                        <td style="font-size: 16px; font-weight: 800; color: #166534; vertical-align: middle;">
                          Official WhatsApp Group
                        </td>
                      </tr>
                    </table>
                    <div style="font-size: 13px; color: #15803d; margin-bottom: 16px; line-height: 1.4;">
                      Join the official WhatsApp group now to receive all important announcements and updates.
                    </div>
                    <div>
                      <a href="https://chat.whatsapp.com/J4GVC6UgtX37ioBMVsRoYa" target="_blank" style="display: inline-block; background-color: #16a34a; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 13.5px; padding: 11px 22px; border-radius: 6px; letter-spacing: 0.3px;">
                        JOIN OFFICIAL WHATSAPP GROUP ↗
                      </a>
                    </div>
                    <div style="font-size: 12px; color: #166534; margin-top: 10px; font-weight: 500;">
                      All updates will be shared there.
                    </div>
                  </td>
                </tr>
              </table>

              <!-- 9. GUIDE MESSAGE -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f7f7f7; border: 1px solid #e5e7eb; border-radius: 4px; padding: 10px 14px; margin-bottom: 22px;">
                <tr>
                  <td width="28" valign="middle" style="font-size: 16px; line-height: 1; padding-right: 8px;">
                    📄
                  </td>
                  <td valign="middle" style="font-size: 12.5px; color: #444444; line-height: 1.4;">
                    A detailed guide with the schedule and rules will be sent to you before the event.
                  </td>
                </tr>
              </table>

              <!-- 10. NEED HELP? -->
              <div style="font-size: 13.5px; font-weight: 800; color: #111111; margin-bottom: 6px;">
                Need Help?
              </div>
              <div style="font-size: 13px; color: #333333; line-height: 1.6; margin-bottom: 18px;">
                For any queries, contact:<br />
                <strong>Jeevanandh</strong> &nbsp;|&nbsp; 📞 <a href="tel:+916381206466" style="color: #111111; text-decoration: underline; font-weight: 600;">+91 63812 06466</a> &nbsp;|&nbsp; ✉️ <a href="mailto:sakthihackfest@gmail.com" style="color: #111111; text-decoration: underline; font-weight: 600;">sakthihackfest@gmail.com</a>
              </div>

              <!-- 11. SIGN-OFF -->
              <div style="font-size: 13.5px; color: #333333; line-height: 1.5; margin-bottom: 22px;">
                Regards,<br />
                <strong style="color: #111111;">Team Sakthi HackFest'26</strong><br />
                Sree Sakthi Engineering College
              </div>

              <!-- 12. FOOTER -->
              <div style="border-top: 1px solid #dddddd; margin-bottom: 14px;"></div>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td valign="top" style="font-size: 11px; color: #555555; line-height: 1.4;">
                    <strong style="color: #222222; font-size: 11.5px; letter-spacing: 0.4px;">SAKTHI HACKFEST '26</strong><br />
                    Sree Sakthi Engineering College, Karamadai, Coimbatore – 641104
                  </td>
                  <td valign="top" align="right" style="font-size: 10px; color: #777777; line-height: 1.35;">
                    This automated registration acknowledgement<br />
                    was sent only to the registered Team Leader.
                  </td>
                </tr>
              </table>

            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

async function sendConfirmationEmailGmail(
  gmailAuth: any,
  emailData: {
    registrationId: string;
    teamName: string;
    leaderName: string;
    leaderEmail: string;
    teamMemberNames: string;
    selectedDomain: string;
    accommodationRequired: string;
  }
): Promise<void> {
  const gmail = google.gmail({ version: 'v1', auth: gmailAuth });

  const subject = `Registration Received | Sakthi HackFest'26 | ${emailData.registrationId}`;
  const htmlBody = buildConfirmationEmailHtml(emailData);

  const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
  const messageParts = [
    `From: "${SENDER_NAME}" <${SENDER_EMAIL}>`,
    `To: <${emailData.leaderEmail}>`,
    `Reply-To: <${SENDER_EMAIL}>`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=utf-8',
    `Subject: ${utf8Subject}`,
    '',
    htmlBody,
  ];

  const rawMessage = messageParts.join('\r\n');
  const encodedMessage = Buffer.from(rawMessage)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw: encodedMessage,
    },
  });
}

// ── Main Registration Execution Flow ───────────────────────────────────────

async function processRegistration(rawPayload: any) {
  loadLocalEnvIfNeeded();
  // Extract data from payload
  const data = rawPayload.data || rawPayload;

  const teamName = String(data.teamName || '').trim();
  const teamSize = parseInt(String(data.teamSize || '2'), 10) || 2;
  const selectedTheme = String(data.selectedTheme || 'Open Innovation').trim();
  const selectedDomain = String(data.selectedDomain || '').trim();
  const accommodationRequired =
    data.accommodationRequired === 'Yes' ? 'Yes' : 'No';

  const teamLeader = data.teamLeader || {};
  const leaderName = String(teamLeader.name || '').trim();
  const leaderCollege = String(teamLeader.college || '').trim();
  const leaderDept = String(teamLeader.department || '').trim();
  const leaderYear = String(teamLeader.year || '').trim();
  const leaderWhatsapp = String(teamLeader.whatsapp || '').trim();
  const leaderEmail = String(teamLeader.email || '').trim();

  const members = data.members || [];
  const m2 = members[0] || {};
  const m3 = members[1] || {};
  const m4 = members[2] || {};

  const m2Name = teamSize >= 2 ? String(m2.name || '').trim() : '';
  const m2College = teamSize >= 2 ? String(m2.college || '').trim() : '';
  const m2Dept = teamSize >= 2 ? String(m2.department || '').trim() : '';
  const m2Year = teamSize >= 2 ? String(m2.year || m2.yearOfStudy || '').trim() : '';
  const m2Phone = teamSize >= 2 ? String(m2.whatsapp || '').trim() : '';
  const m2Email = teamSize >= 2 ? String(m2.email || '').trim() : '';

  const m3Name = teamSize >= 3 ? String(m3.name || '').trim() : '';
  const m3College = teamSize >= 3 ? String(m3.college || '').trim() : '';
  const m3Dept = teamSize >= 3 ? String(m3.department || '').trim() : '';
  const m3Year = teamSize >= 3 ? String(m3.year || m3.yearOfStudy || '').trim() : '';
  const m3Phone = teamSize >= 3 ? String(m3.whatsapp || '').trim() : '';
  const m3Email = teamSize >= 3 ? String(m3.email || '').trim() : '';

  const m4Name = teamSize >= 4 ? String(m4.name || '').trim() : '';
  const m4College = teamSize >= 4 ? String(m4.college || '').trim() : '';
  const m4Dept = teamSize >= 4 ? String(m4.department || '').trim() : '';
  const m4Year = teamSize >= 4 ? String(m4.year || m4.yearOfStudy || '').trim() : '';
  const m4Phone = teamSize >= 4 ? String(m4.whatsapp || '').trim() : '';
  const m4Email = teamSize >= 4 ? String(m4.email || '').trim() : '';

  const upiTxnId = String(data.upiTransactionId || '').trim();
  const screenshotData =
    data.paymentScreenshotData || data.paymentScreenshot;
  const screenshotName =
    data.paymentScreenshotName || 'payment_screenshot.png';

  // 1. Validation
  if (!teamName || !leaderName || !leaderEmail || !leaderWhatsapp) {
    return {
      status: 400,
      body: {
        success: false,
        stage: 'validation',
        message: 'Required registration fields are missing.',
      },
    };
  }

  if (!screenshotData) {
    return {
      status: 400,
      body: {
        success: false,
        stage: 'validation',
        message: 'Payment screenshot is required.',
      },
    };
  }

  // Check Google Cloud Credentials
  let saAuth: any;
  try {
    saAuth = getServiceAccountAuth();
  } catch (authErr: any) {
    console.error('Google Service Account auth error:', authErr);
    return {
      status: 500,
      body: {
        success: false,
        stage: 'auth',
        message:
          authErr.message ||
          'Server Google Cloud Service Account credentials are not configured.',
      },
    };
  }

  const gmailAuth = getGmailAuth();
  const sheets = google.sheets({ version: 'v4', auth: saAuth });
  const drive = google.drive({ version: 'v3', auth: gmailAuth || saAuth });
  const spreadsheetId =
    cleanGoogleId(process.env.GOOGLE_SPREADSHEET_ID) || DEFAULT_SPREADSHEET_ID;

  // 2. Fetch sheet headers & check duplicates
  let headers: string[];
  let existingRows: any[][];
  let tabName = SHEET_TAB_NAME;
  try {
    const sheetData = await ensureSheetAndGetHeaders(sheets, spreadsheetId);
    headers = sheetData.headers;
    existingRows = sheetData.existingRows;
    tabName = sheetData.tabName;
  } catch (sheetErr: any) {
    console.error('Google Sheet read error:', sheetErr);
    return {
      status: 502,
      body: {
        success: false,
        stage: 'sheet',
        message: `Failed to connect to Google Sheet: ${sheetErr.message || 'Check spreadsheet permissions and ID.'}`,
      },
    };
  }

  // Duplicate check
  const dupCheck = checkDuplicateSubmission(
    existingRows,
    headers,
    teamName,
    leaderEmail,
    upiTxnId
  );
  if (dupCheck.isDuplicate) {
    return {
      status: 409,
      body: {
        success: false,
        stage: 'duplicate',
        message: dupCheck.reason,
      },
    };
  }

  // 3. Generate unique Registration ID
  const registrationId = generateUniqueId(existingRows, headers);
  console.log(`Generated Registration ID: ${registrationId}`);

  // 4. Upload Payment Screenshot to Google Drive
  let driveFileId = '';
  let driveViewUrl = '';
  let driveUploaded = false;
  try {
    const uploadResult = await uploadPaymentProofToDrive(
      drive,
      registrationId,
      screenshotData,
      screenshotName
    );
    driveFileId = uploadResult.fileId;
    driveViewUrl = uploadResult.viewUrl;
    driveUploaded = true;
    console.log(`Uploaded payment screenshot to Drive: ${driveFileId}`);
  } catch (driveErr: any) {
    console.warn(
      'Google Drive upload warning (proceeding with Google Sheet and Email):',
      driveErr.message
    );
    driveViewUrl = 'PENDING';
    driveFileId = '';
  }

  // 5. Append Complete Registration Row to Google Sheet
  const timestampStr = formatTimestamp(new Date());

  // Dynamic team member names
  const memberNamesList = [leaderName];
  if (teamSize >= 2 && m2Name) memberNamesList.push(m2Name);
  if (teamSize >= 3 && m3Name) memberNamesList.push(m3Name);
  if (teamSize >= 4 && m4Name) memberNamesList.push(m4Name);
  const teamMemberNames = memberNamesList.join(', ');

  // Mapping dictionary (normalized lowercase alphanumeric keys)
  const dataMap: Record<string, any> = {
    registrationid: registrationId,
    timestamp: timestampStr,
    teamname: teamName,
    teamsize: teamSize,
    selecteddomain: selectedDomain,
    selectedtheme: selectedTheme,
    accommodationrequired: accommodationRequired,
    teamleadername: leaderName,
    teamleadercollege: leaderCollege,
    leadercollegename: leaderCollege,
    teamleaderdepartment: leaderDept,
    teamleaderyear: leaderYear,
    teamleaderwhatsapp: leaderWhatsapp,
    teamleaderemail: leaderEmail,
    member2name: m2Name,
    member2college: m2College,
    member2collegename: m2College,
    member2department: m2Dept,
    member2year: m2Year,
    member2whatsapp: m2Phone,
    member2email: m2Email,
    member3name: m3Name,
    member3college: m3College,
    member3collegename: m3College,
    member3department: m3Dept,
    member3year: m3Year,
    member3whatsapp: m3Phone,
    member3email: m3Email,
    member4name: m4Name,
    member4college: m4College,
    member4collegename: m4College,
    member4department: m4Dept,
    member4year: m4Year,
    member4whatsapp: m4Phone,
    member4email: m4Email,
    paymentamount: 1000,
    upitransactionid: upiTxnId,
    paymentscreenshoturl: driveViewUrl,
    googledrivefileid: driveFileId,
    paymentstatus: 'PENDING',
    registrationstatus: 'CONFIRMED',
    emailstatus: 'PENDING',
    emailsentat: '',
    lastupdated: timestampStr,
  };

  // Map into exact row array according to current sheet headers
  const rowValues: any[] = headers.map(header => {
    const key = String(header || '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');
    return dataMap[key] !== undefined ? dataMap[key] : '';
  });

  let insertedRowIndex = existingRows.length + 2; // 1-based, row 1 is header
  try {
    const appendRes = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `'${tabName}'`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [rowValues],
      },
    });

    const updatedRange = appendRes.data.updates?.updatedRange || '';
    const matchRow = updatedRange.match(/!A(\d+):/);
    if (matchRow) {
      insertedRowIndex = parseInt(matchRow[1], 10);
    }
    console.log(`Appended registration row to Google Sheet. Row: ${insertedRowIndex}`);
  } catch (sheetSaveErr: any) {
    console.error('Google Sheet append error:', sheetSaveErr);
    return {
      status: 500,
      body: {
        success: false,
        stage: 'sheet',
        message: 'Registration could not be saved to Google Sheet.',
      },
    };
  }

  // 6. Send Confirmation Email via Gmail API
  let emailStatus: 'SENT' | 'FAILED' = 'FAILED';
  let emailSentAt = '';

  if (gmailAuth) {
    try {
      await sendConfirmationEmailGmail(gmailAuth, {
        registrationId,
        teamName,
        leaderName,
        leaderEmail,
        teamMemberNames,
        selectedDomain,
        accommodationRequired,
      });
      emailStatus = 'SENT';
      emailSentAt = formatTimestamp(new Date());
      console.log(`Confirmation email sent successfully to ${leaderEmail}`);
    } catch (emailErr: any) {
      console.error('Gmail API send error:', emailErr);
      emailStatus = 'FAILED';
    }
  } else {
    console.warn(
      'Gmail OAuth credentials (GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN) not set. Email skipped.'
    );
    emailStatus = 'FAILED';
  }

  // 7. Update Email Status in Sheet
  try {
    const norm = (s: string) =>
      String(s || '')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');
    const emailStatusColIdx = headers.findIndex(
      h => norm(h) === 'emailstatus'
    );
    const emailSentAtColIdx = headers.findIndex(
      h => norm(h) === 'emailsentat'
    );
    const lastUpdatedColIdx = headers.findIndex(
      h => norm(h) === 'lastupdated'
    );

    const getColumnLetter = (colIndex: number): string => {
      let letter = '';
      let temp = colIndex + 1;
      while (temp > 0) {
        let rem = (temp - 1) % 26;
        letter = String.fromCharCode(65 + rem) + letter;
        temp = Math.floor((temp - 1) / 26);
      }
      return letter;
    };

    const updates: { range: string; values: any[][] }[] = [];
    if (emailStatusColIdx !== -1) {
      const colLetter = getColumnLetter(emailStatusColIdx);
      updates.push({
        range: `'${tabName}'!${colLetter}${insertedRowIndex}`,
        values: [[emailStatus]],
      });
    }
    if (emailSentAt && emailSentAtColIdx !== -1) {
      const colLetter = getColumnLetter(emailSentAtColIdx);
      updates.push({
        range: `'${tabName}'!${colLetter}${insertedRowIndex}`,
        values: [[emailSentAt]],
      });
    }
    if (lastUpdatedColIdx !== -1) {
      const colLetter = getColumnLetter(lastUpdatedColIdx);
      updates.push({
        range: `'${tabName}'!${colLetter}${insertedRowIndex}`,
        values: [[emailSentAt || timestampStr]],
      });
    }

    if (updates.length > 0) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId,
        requestBody: {
          valueInputOption: 'USER_ENTERED',
          data: updates,
        },
      });
    }
  } catch (updateErr) {
    console.warn('Could not update email status in Sheet:', updateErr);
  }

  // 8. Return response
  return {
    status: 200,
    body: {
      success: true,
      registrationId,
      sheetSaved: true,
      driveUploaded: true,
      emailStatus,
      paymentStatus: 'RECEIVED',
      message:
        emailStatus === 'SENT'
          ? 'Registration completed successfully.'
          : 'Registration saved. Confirmation email is pending.',
      data: {
        registrationId,
        teamName,
        teamSize,
        selectedDomain,
        selectedTheme,
        accommodationRequired,
        leaderName,
        leaderCollege,
        leaderDepartment: leaderDept,
        leaderYear,
        leaderWhatsapp,
        leaderEmail,
        members: members.slice(0, teamSize - 1),
        paymentAmount: 1000,
        upiTransactionId: upiTxnId,
        paymentScreenshotDriveUrl: driveViewUrl,
        driveFileId,
        emailStatus,
        paymentStatus: 'RECEIVED',
        registrationStatus: 'CONFIRMED',
        timestamp: timestampStr,
      },
    },
  };
}

// ── HTTP Handler for Vercel / Node ──────────────────────────────────────────

export default async function handler(req: any, res?: any) {
  // Edge / Fetch Request format
  if (req instanceof Request || (!res && typeof req.json === 'function')) {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ success: false, message: 'Method Not Allowed' }),
        { status: 405, headers: { 'Content-Type': 'application/json' } }
      );
    }

    let payload: any;
    try {
      payload = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ success: false, message: 'Malformed JSON payload' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const result = await processRegistration(payload);
    return new Response(JSON.stringify(result.body), {
      status: result.status,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Node.js Request format (Vercel Node Serverless Function)
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const payload =
      typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const result = await processRegistration(payload);
    return res.status(result.status).json(result.body);
  } catch (err: any) {
    console.error('Unhandled register error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Internal Server Error during registration',
    });
  }
}
