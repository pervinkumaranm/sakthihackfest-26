/**
 * SAKTHI HACKFEST 2K26 — Registration Serverless Backend
 * Endpoint: /api/register
 *
 * Single Source of Truth: Supabase PostgreSQL
 * - public.teams (Team details & registration metadata)
 * - public.team_members (Participant profiles linked via team_id)
 * - public.app_settings (Registration toggle state)
 *
 * Independent of Google Sheets, Google Apps Script, and Gmail.
 */

import process from 'node:process';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const config = {
  maxDuration: 30,
};

let cachedSupabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (cachedSupabase) return cachedSupabase;

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
  return Boolean(
    (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL) &&
    (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY)
  );
}

async function getTogglesFromDb(): Promise<{ registrationOpen: boolean; accommodationOpen: boolean }> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('app_settings')
    .select('key, value')
    .in('key', ['registration_open', 'accommodation_open']);

  if (error || !data) {
    return { registrationOpen: false, accommodationOpen: false };
  }

  let registrationOpen = false;
  let accommodationOpen = false;
  for (const row of data) {
    if (row.key === 'registration_open') registrationOpen = Boolean(row.value);
    if (row.key === 'accommodation_open') accommodationOpen = Boolean(row.value);
  }
  return { registrationOpen, accommodationOpen };
}

const MAX_REGISTRATION_LIMIT = 76;
const REGISTRATION_CLOSED_MESSAGE =
  'Registration Closed — The maximum registration limit has been reached.';

function generateRegistrationIdCandidate(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // Exclude ambiguous chars (0, O, 1, I)
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `SHF26-${code}`;
}

async function getLiveRegistrationCount(): Promise<number> {
  if (!isSupabaseConfigured()) return 0;
  try {
    const supabase = getSupabase();
    const { count, error } = await supabase
      .from('teams')
      .select('id', { count: 'exact', head: true });
    if (error) {
      console.warn('Error counting teams in Supabase:', error.message);
      return 0;
    }
    return count ?? 0;
  } catch {
    return 0;
  }
}

async function getRegistrationByIdFromDb(regId: string) {
  if (!isSupabaseConfigured()) return null;
  const cleanId = String(regId).trim().toUpperCase();
  const supabase = getSupabase();

  const { data: team, error } = await supabase
    .from('teams')
    .select(`
      id,
      team_code,
      team_name,
      team_size,
      selected_domain,
      selected_theme,
      accommodation_required,
      leader_name,
      leader_college,
      leader_department,
      leader_year,
      leader_whatsapp,
      leader_email,
      payment_amount,
      upi_transaction_id,
      payment_screenshot_url,
      payment_status,
      registration_status,
      email_status,
      email_sent_at,
      registration_timestamp,
      created_at,
      team_members (
        id,
        member_order,
        name,
        college,
        department,
        year_of_study,
        whatsapp,
        email,
        is_leader
      )
    `)
    .eq('team_code', cleanId)
    .maybeSingle();

  if (error || !team) return null;

  const sortedMembers = (team.team_members || []).sort(
    (a: any, b: any) => (a.member_order || 0) - (b.member_order || 0)
  );

  const nonLeaderMembers = sortedMembers
    .filter((m: any) => !m.is_leader)
    .map((m: any) => ({
      name: m.name,
      college: m.college,
      department: m.department || '',
      yearOfStudy: m.year_of_study || '',
      whatsapp: m.whatsapp || '',
      email: m.email || '',
    }));

  return {
    registrationId: team.team_code,
    timestamp: team.registration_timestamp || team.created_at,
    teamName: team.team_name,
    teamSize: team.team_size,
    selectedDomain: team.selected_domain || '',
    selectedTheme: team.selected_theme || 'General Track',
    selectedThemeName: team.selected_theme || 'General Track',
    accommodationRequired: team.accommodation_required ? 'Yes' : 'No',
    leaderName: team.leader_name,
    leaderCollege: team.leader_college,
    leaderDepartment: team.leader_department || '',
    leaderYear: team.leader_year || '',
    leaderWhatsapp: team.leader_whatsapp || '',
    leaderEmail: team.leader_email,
    members: nonLeaderMembers,
    paymentAmount: Number(team.payment_amount) || 1000,
    upiTransactionId: team.upi_transaction_id || '',
    paymentScreenshotDriveUrl: team.payment_screenshot_url || '',
    paymentStatus: team.payment_status,
    registrationStatus: team.registration_status,
    emailStatus: team.email_status || 'NOT_REQUIRED',
    emailSentAt: team.email_sent_at || '',
    lastUpdated: team.registration_timestamp || team.created_at,
  };
}

export default async function handler(req: any, res?: any) {
  // Support both Edge/Fetch Request and Node.js req/res
  const isEdge = req instanceof Request || (!res && typeof req.json === 'function');
  const urlObj = isEdge ? new URL(req.url, 'http://localhost') : null;
  const method = isEdge ? req.method : req.method;
  const queryAction = isEdge
    ? (urlObj?.searchParams.get('action') || '').toUpperCase()
    : String(req.query?.action || '').toUpperCase();

  // Helper response builder
  const send = (status: number, data: any) => {
    if (isEdge) {
      return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return res.status(status).json(data);
  };

  // 1. Action: GET_REGISTRATION by ID
  if (method === 'GET' && queryAction === 'GET_REGISTRATION') {
    const id = isEdge ? urlObj?.searchParams.get('id') : req.query?.id;
    const cleanId = String(id || '').trim().toUpperCase();
    if (!cleanId) {
      return send(400, { success: false, message: 'Missing Registration ID' });
    }
    const reg = await getRegistrationByIdFromDb(cleanId);
    if (!reg) {
      return send(404, { success: false, message: 'Registration not found' });
    }
    return send(200, { success: true, data: reg });
  }

  // 2. Action: GET_COUNT / Public status check
  if (method === 'GET' || queryAction === 'GET_COUNT') {
    let registrationOpen = false;
    try {
      const toggles = await getTogglesFromDb();
      registrationOpen = toggles.registrationOpen;
    } catch {
      registrationOpen = false;
    }

    const currentCount = await getLiveRegistrationCount();
    const isClosed = !registrationOpen || currentCount >= MAX_REGISTRATION_LIMIT;

    return send(200, {
      success: true,
      count: currentCount,
      limit: MAX_REGISTRATION_LIMIT,
      isRegistrationClosed: isClosed,
      message: isClosed ? REGISTRATION_CLOSED_MESSAGE : 'Registration Open',
    });
  }

  // 3. Method check
  if (method !== 'POST') {
    return send(405, { success: false, message: 'Method Not Allowed' });
  }

  // 4. Registration Submission Guard: Check Live Toggle
  const toggles = await getTogglesFromDb();
  if (!toggles.registrationOpen) {
    return send(403, {
      success: false,
      stage: 'registration_toggle',
      errorCode: 'REGISTRATION_CLOSED',
      message: 'Registration Closed — Registration is currently closed by the organizers.',
    });
  }

  // Check 75 team limit
  const currentCount = await getLiveRegistrationCount();
  if (currentCount >= MAX_REGISTRATION_LIMIT) {
    return send(403, {
      success: false,
      stage: 'limit_reached',
      errorCode: 'REGISTRATION_LIMIT_REACHED',
      message: REGISTRATION_CLOSED_MESSAGE,
    });
  }

  // Parse Body
  let rawBody: any;
  try {
    rawBody = isEdge ? await req.json() : (typeof req.body === 'string' ? JSON.parse(req.body) : req.body);
  } catch {
    return send(400, { success: false, message: 'Malformed JSON payload' });
  }

  const data = rawBody.data || rawBody;
  const teamName = String(data.teamName || '').trim();
  const teamSize = parseInt(String(data.teamSize || '2'), 10) || 2;
  const selectedTheme = String(data.selectedTheme || 'Open Innovation').trim();
  const selectedDomain = String(data.selectedDomain || '').trim();
  const accommodationRequired = data.accommodationRequired === 'Yes';

  const teamLeader = data.teamLeader || {};
  const leaderName = String(teamLeader.name || '').trim();
  const leaderCollege = String(teamLeader.college || '').trim();
  const leaderDept = String(teamLeader.department || '').trim();
  const leaderYear = String(teamLeader.year || '').trim();
  const leaderWhatsapp = String(teamLeader.whatsapp || '').trim();
  const leaderEmail = String(teamLeader.email || '').trim().toLowerCase();

  const members = Array.isArray(data.members) ? data.members : [];

  const upiTxnId = String(data.upiTransactionId || '').trim();
  const screenshotUrl =
    String(data.paymentScreenshotUrl || data.paymentScreenshotDriveUrl || '').trim() ||
    (data.paymentScreenshotData ? 'UPLOADED_OFFLINE' : 'PENDING');

  // Input Validation
  if (!teamName || !leaderName || !leaderEmail || !leaderWhatsapp || !leaderCollege) {
    return send(400, {
      success: false,
      stage: 'validation',
      message: 'Required registration fields are missing (Team Name, Leader Name, College, Email, Phone).',
    });
  }

  if (teamSize < 2 || teamSize > 4) {
    return send(400, {
      success: false,
      stage: 'validation',
      message: 'Team size must be between 2 and 4 participants.',
    });
  }

  const supabase = getSupabase();

  // Duplicate Prevention Check
  const { data: existingDupes, error: dupeCheckErr } = await supabase
    .from('teams')
    .select('team_code, team_name, leader_email, upi_transaction_id')
    .or(
      `leader_email.ilike.${leaderEmail},team_name.ilike.${teamName}${
        upiTxnId && upiTxnId.length > 5 ? `,upi_transaction_id.eq.${upiTxnId}` : ''
      }`
    );

  if (!dupeCheckErr && existingDupes && existingDupes.length > 0) {
    const existing = existingDupes[0];
    let dupeReason = 'Registration already exists';
    if (existing.leader_email?.toLowerCase() === leaderEmail) {
      dupeReason = `A team with leader email "${leaderEmail}" is already registered (${existing.team_code}).`;
    } else if (existing.team_name?.toLowerCase() === teamName.toLowerCase()) {
      dupeReason = `A team with the name "${teamName}" is already registered.`;
    } else if (upiTxnId && existing.upi_transaction_id === upiTxnId) {
      dupeReason = 'This UPI Transaction ID has already been submitted by another team.';
    }

    return send(409, {
      success: false,
      stage: 'duplicate_check',
      message: dupeReason,
      existingTeamCode: existing.team_code,
    });
  }

  // Generate Unique Team Code
  let candidateId = generateRegistrationIdCandidate();
  let attempts = 0;
  while (attempts < 5) {
    const { data: col } = await supabase
      .from('teams')
      .select('id')
      .eq('team_code', candidateId)
      .maybeSingle();
    if (!col) break;
    candidateId = generateRegistrationIdCandidate();
    attempts++;
  }

  // Insert Team into Supabase
  const now = new Date().toISOString();
  const { data: newTeam, error: insertTeamErr } = await supabase
    .from('teams')
    .insert({
      team_code: candidateId,
      team_name: teamName,
      team_size: teamSize,
      selected_domain: selectedDomain,
      selected_theme: selectedTheme,
      accommodation_required: accommodationRequired,
      leader_name: leaderName,
      leader_college: leaderCollege,
      leader_department: leaderDept,
      leader_year: leaderYear,
      leader_whatsapp: leaderWhatsapp,
      leader_email: leaderEmail,
      payment_amount: 1000.0,
      upi_transaction_id: upiTxnId,
      payment_screenshot_url: screenshotUrl,
      payment_status: 'RECEIVED',
      registration_status: 'CONFIRMED',
      email_status: 'NOT_REQUIRED',
      registration_timestamp: now,
      created_at: now,
      updated_at: now,
    })
    .select('id')
    .single();

  if (insertTeamErr || !newTeam) {
    console.error('Failed to insert team in Supabase:', insertTeamErr);
    return send(500, {
      success: false,
      stage: 'database',
      message: insertTeamErr?.message || 'Database error occurred while recording team registration.',
    });
  }

  // Prepare and Insert Team Members
  const memberRows: any[] = [
    {
      team_id: newTeam.id,
      member_order: 1,
      name: leaderName,
      college: leaderCollege,
      department: leaderDept,
      year_of_study: leaderYear,
      whatsapp: leaderWhatsapp,
      email: leaderEmail,
      is_leader: true,
      created_at: now,
    },
  ];

  for (let i = 0; i < teamSize - 1; i++) {
    const m = members[i] || {};
    if (m.name) {
      memberRows.push({
        team_id: newTeam.id,
        member_order: i + 2,
        name: String(m.name).trim(),
        college: String(m.college || leaderCollege).trim(),
        department: String(m.department || '').trim(),
        year_of_study: String(m.year || m.yearOfStudy || '').trim(),
        whatsapp: String(m.whatsapp || '').trim(),
        email: String(m.email || '').trim().toLowerCase(),
        is_leader: false,
        created_at: now,
      });
    }
  }

  const { error: insertMembersErr } = await supabase
    .from('team_members')
    .insert(memberRows);

  if (insertMembersErr) {
    console.error('Failed to insert team members, rolling back team creation:', insertMembersErr);
    // Rollback team
    await supabase.from('teams').delete().eq('id', newTeam.id);
    return send(500, {
      success: false,
      stage: 'database_members',
      message: 'Failed to record team member details. Please try again.',
    });
  }

  // Return Successful Response
  return send(200, {
    success: true,
    registrationId: candidateId,
    paymentStatus: 'RECEIVED',
    emailStatus: 'NOT_REQUIRED',
    message: 'Registration completed successfully.',
    data: {
      registrationId: candidateId,
      teamName,
      teamSize,
      selectedDomain,
      selectedTheme,
      accommodationRequired: accommodationRequired ? 'Yes' : 'No',
      leaderName,
      leaderCollege,
      leaderDepartment: leaderDept,
      leaderYear,
      leaderWhatsapp,
      leaderEmail,
      members: members.slice(0, teamSize - 1),
      paymentAmount: 1000,
      upiTransactionId: upiTxnId,
      paymentScreenshotDriveUrl: screenshotUrl,
      paymentStatus: 'RECEIVED',
      registrationStatus: 'CONFIRMED',
      timestamp: now,
    },
  });
}
