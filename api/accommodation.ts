/**
 * SAKTHI HACKFEST 2K26 — Supabase Accommodation Backend API
 * Endpoint: /api/accommodation
 *
 * Single Source of Truth: Supabase PostgreSQL
 * - public.accommodation_requests
 * - public.accommodation_members
 * - public.teams & public.team_members
 * - public.app_settings
 *
 * Actions handled:
 * - Public: GET_TEAMS (Retrieves registered teams for accommodation selection)
 * - Public: GET_TEAM_MEMBERS (Retrieves members for selected team code)
 * - Public: SUBMIT_ACCOMMODATION (Stores request & members atomically)
 * - Admin: GET_ACCOMMODATIONS (Retrieves all accommodation submissions & stats)
 * - Admin: UPDATE_STATUS (Verifies or rejects accommodation requests)
 */

import crypto from 'node:crypto';
import fs from 'fs';
import path from 'path';
import process from 'node:process';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const config = {
  maxDuration: 30,
};

let cachedSupabase: SupabaseClient | null = null;

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
  } catch {}
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

function extractToken(req: any): string | undefined {
  const authHeader = req.headers?.authorization || req.headers?.get?.('authorization');
  if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }
  return undefined;
}

function generateAccommodationIdCandidate(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 7; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `SHF26-ACC-${code}`;
}

export default async function handler(req: any, res?: any) {
  const isEdge = req instanceof Request || (!res && typeof req.json === 'function');
  const urlObj = isEdge ? new URL(req.url, 'http://localhost') : null;
  const method = req.method;

  const queryAction = isEdge
    ? (urlObj?.searchParams.get('action') || '').toUpperCase()
    : String(req.query?.action || '').toUpperCase();

  const send = (status: number, data: any) => {
    if (isEdge) {
      return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return res.status(status).json(data);
  };

  // ── GET REQUESTS ──────────────────────────────────────────────────────────
  if (method === 'GET') {
    // 1. GET_TEAMS
    if (queryAction === 'GET_TEAMS') {
      try {
        const supabase = getSupabase();
        const { data: teams, error } = await supabase
          .from('teams')
          .select('team_code, team_name, leader_name, leader_college, leader_email')
          .order('team_name', { ascending: true });

        if (error) {
          console.error('Error fetching teams for accommodation:', error);
          return send(500, { success: false, message: 'Could not fetch registered teams.' });
        }

        const formatted = (teams || []).map((t: any) => ({
          teamCode: t.team_code,
          registrationId: t.team_code,
          teamName: t.team_name,
          leaderName: t.leader_name,
          college: t.leader_college,
          email: t.leader_email,
        }));

        return send(200, { success: true, teams: formatted });
      } catch (err: any) {
        return send(500, { success: false, message: err.message });
      }
    }

    // 2. GET_TEAM_MEMBERS
    if (queryAction === 'GET_TEAM_MEMBERS') {
      const teamCode = isEdge
        ? urlObj?.searchParams.get('teamCode') || urlObj?.searchParams.get('id')
        : req.query?.teamCode || req.query?.id;
      const cleanCode = String(teamCode || '').trim().toUpperCase();

      if (!cleanCode) {
        return send(400, { success: false, message: 'Team Code is required.' });
      }

      try {
        const supabase = getSupabase();
        const { data: team, error: teamErr } = await supabase
          .from('teams')
          .select(`
            id,
            team_code,
            team_name,
            leader_name,
            leader_college,
            team_members (
              id,
              member_order,
              name,
              college,
              is_leader
            )
          `)
          .eq('team_code', cleanCode)
          .maybeSingle();

        if (teamErr || !team) {
          return send(404, { success: false, message: `Team "${cleanCode}" not found.` });
        }

        const sortedMembers = (team.team_members || []).sort(
          (a: any, b: any) => (a.member_order || 0) - (b.member_order || 0)
        );

        const memberList = sortedMembers.map((m: any) => ({
          id: m.id,
          name: m.name,
          college: m.college || team.leader_college,
          isLeader: Boolean(m.is_leader),
        }));

        return send(200, {
          success: true,
          team: {
            teamCode: team.team_code,
            teamName: team.team_name,
            leaderName: team.leader_name,
            college: team.leader_college,
          },
          members: memberList,
        });
      } catch (err: any) {
        return send(500, { success: false, message: err.message });
      }
    }

    // 3. GET_ACCOMMODATIONS (GET endpoint version)
    if (queryAction === 'GET_ACCOMMODATIONS') {
      const token = extractToken(req) || (isEdge ? urlObj?.searchParams.get('token') : req.query?.token);
      if (!verifyAdminToken(token)) {
        return send(401, { success: false, message: 'Unauthorized. Admin credentials required.' });
      }

      try {
        const supabase = getSupabase();
        const { data: requests, error } = await supabase
          .from('accommodation_requests')
          .select(`
            id,
            accommodation_id,
            team_code,
            team_name,
            college_name,
            member_count,
            rate_per_member,
            total_amount,
            upi_transaction_id,
            payment_screenshot_url,
            payment_status,
            team_leader_name,
            team_leader_email,
            request_timestamp,
            created_at,
            accommodation_members (
              id,
              member_name
            )
          `)
          .order('created_at', { ascending: false });

        if (error) {
          return send(500, { success: false, message: error.message });
        }

        const list = (requests || []).map((r: any) => {
          const memberNames = (r.accommodation_members || []).map((m: any) => m.member_name);
          return {
            accommodationId: r.accommodation_id,
            teamCode: r.team_code,
            teamName: r.team_name,
            college: r.college_name,
            memberCount: r.member_count,
            numberOfMembers: r.member_count,
            registeredTeamSize: 4,
            ratePerMember: Number(r.rate_per_member || 100),
            totalAmount: Number(r.total_amount),
            upiTransactionId: r.upi_transaction_id || '',
            paymentScreenshotDriveUrl: r.payment_screenshot_url || '',
            screenshotUrl: r.payment_screenshot_url || '',
            paymentStatus: r.payment_status,
            accommodationStatus: r.payment_status,
            leaderName: r.team_leader_name || '',
            teamLeaderName: r.team_leader_name || '',
            leaderEmail: r.team_leader_email || '',
            teamLeaderEmail: r.team_leader_email || '',
            emailStatus: 'SENT',
            timestamp: r.request_timestamp || r.created_at,
            members: memberNames,
            selectedMembers: memberNames,
          };
        });

        const stats = {
          totalRequests: list.length,
          totalMembers: list.reduce((sum, r) => sum + (r.memberCount || 0), 0),
          totalAmount: list.reduce((sum, r) => sum + (r.totalAmount || 0), 0),
          verifiedCount: list.filter(r => r.paymentStatus === 'VERIFIED').length,
          pendingCount: list.filter(r => r.paymentStatus === 'PENDING').length,
          rejectedCount: list.filter(r => r.paymentStatus === 'REJECTED').length,
        };

        return send(200, { success: true, data: list, stats });
      } catch (err: any) {
        return send(500, { success: false, message: err.message });
      }
    }

    return send(400, { success: false, message: `Unknown action: ${queryAction}` });
  }

  // ── POST REQUESTS ─────────────────────────────────────────────────────────
  if (method !== 'POST') {
    return send(405, { success: false, message: 'Method Not Allowed' });
  }

  let body: any;
  try {
    body = isEdge ? await req.json() : (typeof req.body === 'string' ? JSON.parse(req.body) : req.body);
  } catch {
    return send(400, { success: false, message: 'Invalid JSON payload' });
  }

  const action = String(body.action || queryAction || 'SUBMIT_ACCOMMODATION').toUpperCase();

  // 1. Admin GET_ACCOMMODATIONS (POST version)
  if (action === 'GET_ACCOMMODATIONS') {
    const token = extractToken(req) || body.token;
    if (!verifyAdminToken(token)) {
      return send(401, { success: false, message: 'Unauthorized. Admin credentials required.' });
    }

    try {
      const supabase = getSupabase();
      const { data: requests, error } = await supabase
        .from('accommodation_requests')
        .select(`
          id,
          accommodation_id,
          team_code,
          team_name,
          college_name,
          member_count,
          rate_per_member,
          total_amount,
          upi_transaction_id,
          payment_screenshot_url,
          payment_status,
          team_leader_name,
          team_leader_email,
          request_timestamp,
          created_at,
          accommodation_members (
            id,
            member_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        return send(500, { success: false, message: error.message });
      }

      const list = (requests || []).map((r: any) => {
        const memberNames = (r.accommodation_members || []).map((m: any) => m.member_name);
        return {
          accommodationId: r.accommodation_id,
          teamCode: r.team_code,
          teamName: r.team_name,
          college: r.college_name,
          memberCount: r.member_count,
          numberOfMembers: r.member_count,
          registeredTeamSize: 4,
          ratePerMember: Number(r.rate_per_member || 100),
          totalAmount: Number(r.total_amount),
          upiTransactionId: r.upi_transaction_id || '',
          paymentScreenshotDriveUrl: r.payment_screenshot_url || '',
          screenshotUrl: r.payment_screenshot_url || '',
          paymentStatus: r.payment_status,
          accommodationStatus: r.payment_status,
          leaderName: r.team_leader_name || '',
          teamLeaderName: r.team_leader_name || '',
          leaderEmail: r.team_leader_email || '',
          teamLeaderEmail: r.team_leader_email || '',
          emailStatus: 'SENT',
          timestamp: r.request_timestamp || r.created_at,
          members: memberNames,
          selectedMembers: memberNames,
        };
      });

      const stats = {
        totalRequests: list.length,
        totalMembers: list.reduce((sum, r) => sum + (r.memberCount || 0), 0),
        totalAmount: list.reduce((sum, r) => sum + (r.totalAmount || 0), 0),
        verifiedCount: list.filter(r => r.paymentStatus === 'VERIFIED').length,
        pendingCount: list.filter(r => r.paymentStatus === 'PENDING').length,
        rejectedCount: list.filter(r => r.paymentStatus === 'REJECTED').length,
      };

      return send(200, { success: true, data: list, stats });
    } catch (err: any) {
      return send(500, { success: false, message: err.message });
    }
  }

  // 2. Admin UPDATE_STATUS
  if (action === 'UPDATE_STATUS') {
    const token = extractToken(req) || body.token;
    if (!verifyAdminToken(token)) {
      return send(401, { success: false, message: 'Unauthorized. Admin credentials required.' });
    }

    const accId = String(body.accommodationId || body.id || '').trim();
    const newStatus = String(body.accommodationStatus || body.status || '').toUpperCase();

    if (!accId || !['VERIFIED', 'PENDING', 'REJECTED'].includes(newStatus)) {
      return send(400, { success: false, message: 'Invalid accommodation ID or status.' });
    }

    try {
      const supabase = getSupabase();
      const now = new Date().toISOString();
      const { data: updated, error } = await supabase
        .from('accommodation_requests')
        .update({
          payment_status: newStatus,
          updated_at: now,
        })
        .eq('accommodation_id', accId)
        .select('id, accommodation_id, payment_status')
        .maybeSingle();

      if (error || !updated) {
        return send(404, { success: false, message: `Accommodation record "${accId}" not found.` });
      }

      // Log to audit log
      await supabase.from('audit_logs').insert({
        action: `ACCOMMODATION_STATUS_${newStatus}`,
        performed_by: 'admin',
        target_id: accId,
        details: { newStatus, updatedAt: now },
        created_at: now,
      });

      return send(200, {
        success: true,
        message: `Accommodation request ${accId} status updated to ${newStatus}.`,
        record: updated,
      });
    } catch (err: any) {
      return send(500, { success: false, message: err.message });
    }
  }

  // 3. Public SUBMIT_ACCOMMODATION
  if (action === 'SUBMIT_ACCOMMODATION') {
    // Live Toggle Guard
    const toggles = await getTogglesFromDb();
    if (!toggles.accommodationOpen) {
      return send(403, {
        success: false,
        stage: 'accommodation_toggle',
        errorCode: 'ACCOMMODATION_CLOSED',
        message: 'Accommodation Booking Closed — Accommodation bookings are currently closed by the organizers.',
      });
    }

    const payload = body.data || body;
    const teamCode = String(payload.teamCode || payload.registrationId || '').trim().toUpperCase();
    const teamName = String(payload.teamName || '').trim();
    const rawMembers = Array.isArray(payload.selectedMembers) ? payload.selectedMembers : [];
    const upiTransactionId = String(payload.upiTransactionId || '').trim();
    const screenshotUrl =
      String(payload.paymentScreenshotUrl || payload.screenshotUrl || payload.paymentScreenshotDriveUrl || '').trim() ||
      (payload.paymentScreenshotData ? 'UPLOADED_OFFLINE' : 'PENDING');

    if (!teamCode) {
      return send(400, { success: false, message: 'Team Code is required.' });
    }

    if (rawMembers.length === 0) {
      return send(400, { success: false, message: 'Please select at least one member for accommodation.' });
    }

    // 12-digit numeric UPI Transaction ID validation
    const upiDigits = upiTransactionId.replace(/[^0-9]/g, '');
    if (upiDigits.length !== 12) {
      return send(400, {
        success: false,
        stage: 'validation',
        message: 'UPI Transaction ID must be a 12-digit numeric UTR reference number.',
      });
    }

    try {
      const supabase = getSupabase();

      // Look up team
      const { data: team } = await supabase
        .from('teams')
        .select('id, team_code, team_name, leader_name, leader_college, leader_email')
        .eq('team_code', teamCode)
        .maybeSingle();

      // Duplicate Check
      const { data: existingDupes } = await supabase
        .from('accommodation_requests')
        .select('accommodation_id, payment_status')
        .eq('team_code', teamCode)
        .eq('upi_transaction_id', upiDigits);

      if (existingDupes && existingDupes.length > 0) {
        const activeDupe = existingDupes.find(d => d.payment_status !== 'REJECTED');
        if (activeDupe) {
          return send(409, {
            success: false,
            message: `Accommodation request already recorded for this transaction (${activeDupe.accommodation_id}).`,
          });
        }
      }

      // Generate Unique Accommodation ID
      let candidateAccId = generateAccommodationIdCandidate();
      let attempts = 0;
      while (attempts < 5) {
        const { data: col } = await supabase
          .from('accommodation_requests')
          .select('id')
          .eq('accommodation_id', candidateAccId)
          .maybeSingle();
        if (!col) break;
        candidateAccId = generateAccommodationIdCandidate();
        attempts++;
      }

      const totalAmount = rawMembers.length * 100.0;
      const now = new Date().toISOString();

      // Insert Accommodation Request
      const { data: newReq, error: reqErr } = await supabase
        .from('accommodation_requests')
        .insert({
          accommodation_id: candidateAccId,
          team_id: team?.id || null,
          team_code: teamCode,
          team_name: teamName || team?.team_name || 'Registered Team',
          college_name: team?.leader_college || 'Sakthi College of Engineering and Technology',
          member_count: rawMembers.length,
          rate_per_member: 100.0,
          total_amount: totalAmount,
          upi_transaction_id: upiDigits,
          payment_screenshot_url: screenshotUrl,
          payment_status: 'PENDING',
          team_leader_name: team?.leader_name || '',
          team_leader_email: team?.leader_email || '',
          request_timestamp: now,
          created_at: now,
          updated_at: now,
        })
        .select('id')
        .single();

      if (reqErr || !newReq) {
        console.error('Error inserting accommodation request:', reqErr);
        return send(500, { success: false, message: 'Could not record accommodation request in database.' });
      }

      // Insert Accommodation Members
      const memberRows = rawMembers.map((m: any) => ({
        accommodation_request_id: newReq.id,
        member_name: typeof m === 'string' ? m : (m.name || String(m)),
        created_at: now,
      }));

      const { error: memErr } = await supabase
        .from('accommodation_members')
        .insert(memberRows);

      if (memErr) {
        console.error('Error inserting accommodation members, rolling back request:', memErr);
        await supabase.from('accommodation_requests').delete().eq('id', newReq.id);
        return send(500, { success: false, message: 'Could not record member details for accommodation.' });
      }

      return send(200, {
        success: true,
        accommodationId: candidateAccId,
        message: 'Accommodation request submitted successfully. Payment verification is pending.',
        data: {
          accommodationId: candidateAccId,
          teamCode,
          teamName: teamName || team?.team_name,
          memberCount: rawMembers.length,
          totalAmount,
          upiTransactionId: upiDigits,
          paymentStatus: 'PENDING',
          timestamp: now,
        },
      });
    } catch (err: any) {
      console.error('Unhandled accommodation submit error:', err);
      return send(500, { success: false, message: err.message });
    }
  }

  return send(400, { success: false, message: `Unknown action: ${action}` });
}
