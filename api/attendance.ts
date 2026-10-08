/**
 * SAKTHI HACKFEST 2K26 — High-Performance Supabase Attendance Backend
 * Endpoint: /api/attendance
 *
 * Single Source of Truth: Supabase PostgreSQL
 * - attendance_records (Team attendance & aggregate turnout)
 * - attendance_members (Individual participant Present/Absent status)
 *
 * High-performance event-time operation:
 * - Indexed team lookups on teams.team_code (sub-50ms response)
 * - Atomic upserts with database unique constraint on team_id/team_code
 * - Strict duplicate prevention (409 Conflict unless edit confirmed)
 * - Zero PII leakage (No emails, phones, or payment records returned)
 * - Independent of Google Sheets / Google Apps Script
 */

import crypto from 'node:crypto';
import fs from 'fs';
import path from 'path';
import process from 'node:process';
import { getSupabase, isSupabaseConfigured } from './_supabase';

export const config = {
  maxDuration: 30,
};

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

export default async function handler(req: any, res: any) {
  if (typeof res?.setHeader === 'function') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }

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

    // Super Admin credentials also have permission to access attendance
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

  // 3. Fast Team Lookup by Team Code / Registration ID (STRICTLY NO PII)
  if (action === 'get_team') {
    const rawCode = String(body.teamCode || req.query?.teamCode || '').trim().toUpperCase();
    if (!rawCode) {
      return res.status(400).json({ success: false, error: 'Team Code is required.' });
    }

    if (!isSupabaseConfigured()) {
      return res.status(503).json({
        success: false,
        error: 'Database is currently not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.',
      });
    }

    try {
      const supabase = getSupabase();
      // Indexed single query on teams table with team_members relation
      const { data: teamData, error: teamErr } = await supabase
        .from('teams')
        .select(`
          id,
          team_code,
          team_name,
          leader_name,
          leader_college,
          team_members (
            id,
            name,
            college,
            is_leader,
            member_order
          )
        `)
        .eq('team_code', rawCode)
        .maybeSingle();

      if (teamErr) {
        console.error('Supabase team lookup error:', teamErr);
        return res.status(500).json({
          success: false,
          error: 'Error looking up team in database.',
        });
      }

      if (!teamData) {
        return res.status(404).json({
          success: false,
          error: `Team with Code "${rawCode}" was not found in the registration system.`,
        });
      }

      // Sort members by order (Leader first, then members 2..4)
      const sortedMembers = (teamData.team_members || []).sort(
        (a: any, b: any) => (a.member_order || 1) - (b.member_order || 1)
      );

      // Return strictly sanitized member list (name + college only)
      const sanitizedMembers = sortedMembers.map((m: any) => ({
        name: m.name,
        college: m.college || teamData.leader_college || 'N/A',
      }));

      return res.status(200).json({
        success: true,
        team: {
          teamCode: teamData.team_code,
          teamName: teamData.team_name,
          members: sanitizedMembers,
        },
      });
    } catch (err: any) {
      console.error('get_team unhandled error:', err);
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve team details from database.',
      });
    }
  }

  // 4. Check Existing Attendance for Team Code
  if (action === 'get_attendance') {
    const rawCode = String(body.teamCode || req.query?.teamCode || '').trim().toUpperCase();
    if (!rawCode) {
      return res.status(400).json({ success: false, error: 'Team Code is required.' });
    }

    if (!isSupabaseConfigured()) {
      return res.status(503).json({ success: false, error: 'Database not configured.' });
    }

    try {
      const supabase = getSupabase();
      const { data: record, error } = await supabase
        .from('attendance_records')
        .select(`
          id,
          team_code,
          team_name,
          marked_by,
          total_present,
          total_members,
          marked_at,
          updated_at,
          attendance_members (
            member_name,
            status,
            college_name
          )
        `)
        .eq('team_code', rawCode)
        .maybeSingle();

      if (error) {
        console.error('Supabase attendance check error:', error);
        return res.status(500).json({ success: false, error: 'Failed to check attendance records.' });
      }

      if (record) {
        const membersList = (record.attendance_members || []).map((m: any) => ({
          name: m.member_name,
          college: m.college_name || 'N/A',
          status: m.status as 'Present' | 'Absent',
        }));

        return res.status(200).json({
          success: true,
          exists: true,
          record: {
            teamCode: record.team_code,
            teamName: record.team_name,
            members: membersList,
            totalPresent: record.total_present,
            totalMembers: record.total_members,
            timestamp: formatISTTimestamp(new Date(record.updated_at || record.marked_at)),
            markedBy: record.marked_by,
          },
        });
      }

      return res.status(200).json({
        success: true,
        exists: false,
      });
    } catch (err: any) {
      console.error('get_attendance unhandled error:', err);
      return res.status(500).json({ success: false, error: 'Failed to check attendance status.' });
    }
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

    if (!isSupabaseConfigured()) {
      return res.status(503).json({ success: false, error: 'Database not configured.' });
    }

    try {
      const supabase = getSupabase();

      // Find the team's internal UUID
      const { data: teamRow } = await supabase
        .from('teams')
        .select('id, team_name')
        .eq('team_code', cleanCode)
        .maybeSingle();

      if (!teamRow) {
        return res.status(404).json({
          success: false,
          error: `Team "${cleanCode}" was not found in registration database.`,
        });
      }

      // Check existing attendance record
      const { data: existingRec } = await supabase
        .from('attendance_records')
        .select('id, total_present, total_members, marked_at')
        .eq('team_code', cleanCode)
        .maybeSingle();

      if (existingRec && !isEdit) {
        return res.status(409).json({
          success: false,
          alreadyMarked: true,
          message: 'Attendance for this team has already been recorded. Use edit mode to update.',
        });
      }

      const totalPresent = members.filter((m: any) => m.status === 'Present').length;
      const totalMembers = members.length;
      const nowIso = new Date().toISOString();

      // Upsert attendance record
      const { data: savedRecord, error: recErr } = await supabase
        .from('attendance_records')
        .upsert(
          {
            team_id: teamRow.id,
            team_code: cleanCode,
            team_name: cleanTeam || teamRow.team_name,
            marked_by: auth.username || 'volunteer',
            total_present: totalPresent,
            total_members: totalMembers,
            marked_at: existingRec ? existingRec.marked_at : nowIso,
            updated_at: nowIso,
          },
          { onConflict: 'team_code' }
        )
        .select('id')
        .single();

      if (recErr || !savedRecord) {
        console.error('Supabase save attendance_records error:', recErr);
        return res.status(500).json({
          success: false,
          error: 'Failed to save attendance record in database.',
        });
      }

      // Replace attendance members cleanly
      await supabase.from('attendance_members').delete().eq('attendance_record_id', savedRecord.id);

      const memberInserts = members.map((m: any) => ({
        attendance_record_id: savedRecord.id,
        member_name: String(m.name || '').trim(),
        college_name: String(m.college || 'N/A').trim(),
        status: m.status === 'Present' ? 'Present' : 'Absent',
      }));

      const { error: memErr } = await supabase.from('attendance_members').insert(memberInserts);
      if (memErr) {
        console.error('Supabase save attendance_members error:', memErr);
      }

      const formattedRecord = {
        teamCode: cleanCode,
        teamName: cleanTeam || teamRow.team_name,
        members: members.map((m: any) => ({
          name: String(m.name || '').trim(),
          college: String(m.college || 'N/A').trim(),
          status: m.status === 'Present' ? 'Present' : 'Absent',
        })),
        totalPresent,
        totalMembers,
        timestamp: formatISTTimestamp(new Date(nowIso)),
        markedBy: auth.username || 'volunteer',
      };

      return res.status(200).json({
        success: true,
        message: isEdit ? 'Attendance updated successfully.' : 'Attendance recorded successfully.',
        record: formattedRecord,
      });
    } catch (err: any) {
      console.error('mark_attendance unhandled error:', err);
      return res.status(500).json({ success: false, error: 'Database error saving attendance.' });
    }
  }

  // 6. Get All Attendance Records (Summary Statistics)
  if (action === 'get_all_attendance') {
    if (!isSupabaseConfigured()) {
      return res.status(200).json({
        success: true,
        records: [],
        stats: { totalMarkedTeams: 0, totalPresentParticipants: 0 },
      });
    }

    try {
      const supabase = getSupabase();
      const { data: records, error } = await supabase
        .from('attendance_records')
        .select(`
          team_code,
          team_name,
          marked_by,
          total_present,
          total_members,
          marked_at,
          updated_at,
          attendance_members (
            member_name,
            college_name,
            status
          )
        `)
        .order('updated_at', { ascending: false });

      if (error || !records) {
        return res.status(200).json({
          success: true,
          records: [],
          stats: { totalMarkedTeams: 0, totalPresentParticipants: 0 },
        });
      }

      const totalMarkedTeams = records.length;
      const totalPresentParticipants = records.reduce((sum, r) => sum + (r.total_present || 0), 0);

      const formattedList = records.map(r => ({
        teamCode: r.team_code,
        teamName: r.team_name,
        totalPresent: r.total_present,
        totalMembers: r.total_members,
        timestamp: formatISTTimestamp(new Date(r.updated_at || r.marked_at)),
        markedBy: r.marked_by,
        members: (r.attendance_members || []).map((m: any) => ({
          name: m.member_name,
          college: m.college_name || 'N/A',
          status: m.status,
        })),
      }));

      return res.status(200).json({
        success: true,
        records: formattedList,
        stats: {
          totalMarkedTeams,
          totalPresentParticipants,
        },
      });
    } catch (err) {
      console.error('get_all_attendance error:', err);
      return res.status(500).json({ success: false, error: 'Failed to retrieve attendance statistics.' });
    }
  }

  return res.status(400).json({ success: false, error: `Invalid action "${action}".` });
}
