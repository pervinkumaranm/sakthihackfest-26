/**
 * SAKTHI HACKFEST 2K26 — Programmatic Supabase Data Migration Runner
 * Reads `hackfest26.xlsx` and uploads directly to Supabase via `@supabase/supabase-js`.
 * 
 * Usage:
 *   node scripts/migrate.js
 */

import { createClient } from '@supabase/supabase-js';
import * as xlsx from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';

function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    });
  }
}

loadEnv();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('\n❌ ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env to run migration.');
  console.error('Please configure your Supabase credentials in .env:\n');
  console.error('SUPABASE_URL=https://your-project-ref.supabase.co');
  console.error('SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key\n');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});

function parseDate(val) {
  if (val instanceof Date) return val.toISOString();
  if (!val) return '2026-09-26T12:00:00Z';
  const s = String(val).trim();
  // Try common formats
  const match = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})[,\s]+(\d{1,2}):(\d{1,2}):(\d{1,2})$/);
  if (match) {
    const [, d, m, y, h, min, sec] = match;
    return new Date(`${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}T${h.padStart(2, '0')}:${min.padStart(2, '0')}:${sec.padStart(2, '0')}Z`).toISOString();
  }
  const parsed = new Date(s);
  return isNaN(parsed.getTime()) ? '2026-09-26T12:00:00Z' : parsed.toISOString();
}

async function runMigration() {
  console.log('🚀 Starting Google Sheets -> Supabase Migration...');
  console.log(`Connecting to Supabase: ${supabaseUrl}`);

  const excelPath = path.resolve(process.cwd(), 'hackfest26.xlsx');
  if (!fs.existsSync(excelPath)) {
    console.error(`❌ File not found: ${excelPath}`);
    process.exit(1);
  }

  const workbook = xlsx.readFile(excelPath, { cellDates: true });

  // 1. App Settings
  console.log('\n--- 1. Migrating App Settings ---');
  const settingsRows = [
    { key: 'registration_open', value: false, updated_at: new Date().toISOString(), updated_by: 'system' },
    { key: 'accommodation_open', value: false, updated_at: new Date().toISOString(), updated_by: 'system' },
    { key: 'last_updated', value: new Date().toISOString(), updated_at: new Date().toISOString(), updated_by: 'system' },
  ];

  for (const item of settingsRows) {
    const { error } = await supabase.from('app_settings').upsert(item, { onConflict: 'key' });
    if (error) console.error(`Error saving setting ${item.key}:`, error.message);
  }
  console.log('✅ App settings migrated.');

  // 2. Teams and Members
  console.log('\n--- 2. Migrating Teams & Team Members ---');
  const wsReg = workbook.Sheets['Registrations'];
  const regData = xlsx.utils.sheet_to_json(wsReg, { header: 1 });
  const regHeaders = regData[0];
  const regRows = regData.slice(1).filter(r => r && r.length > 0 && r[0]);

  console.log(`Found ${regRows.length} registration rows in Excel.`);

  const teamIdMap = new Map(); // team_code -> uuid
  const memberIdMap = new Map(); // team_code:name_lower -> uuid

  let teamsInserted = 0;
  let membersInserted = 0;

  for (const r of regRows) {
    const teamCode = String(r[0]).trim().toUpperCase();
    const teamId = crypto.randomUUID();
    teamIdMap.set(teamCode, teamId);

    const teamRecord = {
      id: teamId,
      team_code: teamCode,
      team_name: String(r[2] || '').trim(),
      team_size: parseInt(r[3], 10) || 2,
      selected_domain: r[5] ? String(r[5]).trim() : null,
      selected_theme: r[6] ? String(r[6]).trim() : null,
      accommodation_required: String(r[4] || '').trim().toLowerCase() === 'yes',
      leader_name: String(r[7] || '').trim(),
      leader_college: String(r[8] || 'Sree Sakthi Engineering College').trim(),
      leader_department: r[9] ? String(r[9]).trim() : null,
      leader_year: r[10] ? String(r[10]).trim() : null,
      leader_whatsapp: r[11] ? String(r[11]).trim() : null,
      leader_email: String(r[12] || '').trim(),
      payment_amount: parseFloat(r[31]) || 1000,
      upi_transaction_id: r[32] ? String(r[32]).trim() : null,
      payment_screenshot_url: r[33] ? String(r[33]).trim() : null,
      payment_status: (String(r[35] || '').toUpperCase() === 'VERIFIED') ? 'VERIFIED' : 'PENDING',
      registration_status: (String(r[36] || '').toUpperCase() === 'REJECTED') ? 'REJECTED' : 'CONFIRMED',
      email_status: r[37] ? String(r[37]).trim() : 'SENT',
      email_sent_at: r[38] ? parseDate(r[38]) : null,
      registration_timestamp: parseDate(r[1]),
      created_at: parseDate(r[1]),
      updated_at: parseDate(r[39] || r[1]),
    };

    const { error: teamErr } = await supabase.from('teams').upsert(teamRecord, { onConflict: 'team_code' });
    if (teamErr) {
      console.error(`Error inserting team ${teamCode}:`, teamErr.message);
      continue;
    }
    teamsInserted++;

    // Insert Leader into team_members
    const leaderMemId = crypto.randomUUID();
    memberIdMap.set(`${teamCode}:${teamRecord.leader_name.toLowerCase()}`, leaderMemId);

    const leaderMember = {
      id: leaderMemId,
      team_id: teamId,
      member_order: 1,
      name: teamRecord.leader_name,
      college: teamRecord.leader_college,
      department: teamRecord.leader_department,
      year_of_study: teamRecord.leader_year,
      whatsapp: teamRecord.leader_whatsapp,
      email: teamRecord.leader_email,
      is_leader: true,
      created_at: teamRecord.registration_timestamp,
    };

    const { error: lErr } = await supabase.from('team_members').insert(leaderMember);
    if (!lErr) membersInserted++;

    // Insert Members 2..4
    const memberOffsets = [
      { name: 13, col: 14, dept: 15, yr: 16, wa: 17, em: 18, order: 2 },
      { name: 19, col: 20, dept: 21, yr: 22, wa: 23, em: 24, order: 3 },
      { name: 25, col: 26, dept: 27, yr: 28, wa: 29, em: 30, order: 4 },
    ];

    for (const off of memberOffsets) {
      const mName = r[off.name] ? String(r[off.name]).trim() : '';
      if (mName && mName.toLowerCase() !== 'none' && mName.toLowerCase() !== 'null') {
        const memId = crypto.randomUUID();
        memberIdMap.set(`${teamCode}:${mName.toLowerCase()}`, memId);

        const memberObj = {
          id: memId,
          team_id: teamId,
          member_order: off.order,
          name: mName,
          college: r[off.col] ? String(r[off.col]).trim() : teamRecord.leader_college,
          department: r[off.dept] ? String(r[off.dept]).trim() : null,
          year_of_study: r[off.yr] ? String(r[off.yr]).trim() : null,
          whatsapp: r[off.wa] ? String(r[off.wa]).trim() : null,
          email: r[off.em] ? String(r[off.em]).trim() : null,
          is_leader: false,
          created_at: teamRecord.registration_timestamp,
        };

        const { error: mErr } = await supabase.from('team_members').insert(memberObj);
        if (!mErr) membersInserted++;
      }
    }
  }

  console.log(`✅ Teams migrated: ${teamsInserted}/${regRows.length}`);
  console.log(`✅ Team Members migrated: ${membersInserted}`);

  // 3. Accommodation Requests
  console.log('\n--- 3. Migrating Accommodation Requests ---');
  const wsAcc = workbook.Sheets['Accomadation'];
  const accData = xlsx.utils.sheet_to_json(wsAcc, { header: 1 });
  const accRows = accData.slice(1).filter(r => r && r.length > 0 && r[0]);

  let accInserted = 0;
  let accMembersInserted = 0;

  for (const r of accRows) {
    const accId = String(r[0]).trim();
    const teamCode = String(r[3]).trim().toUpperCase();
    const teamId = teamIdMap.get(teamCode) || null;

    const accRecord = {
      accommodation_id: accId,
      team_id: teamId,
      team_code: teamCode,
      team_name: String(r[2] || '').trim(),
      college_name: r[4] ? String(r[4]).trim() : null,
      member_count: parseInt(r[6], 10) || 1,
      rate_per_member: parseFloat(r[7]) || 100,
      total_amount: parseFloat(r[8]) || 100,
      upi_transaction_id: r[9] ? String(r[9]).trim() : null,
      payment_screenshot_url: r[10] ? String(r[10]).trim() : null,
      payment_status: (String(r[15] || '').toUpperCase() === 'VERIFIED') ? 'VERIFIED' : 'PENDING',
      team_leader_name: r[12] ? String(r[12]).trim() : null,
      team_leader_email: r[13] ? String(r[13]).trim() : null,
      request_timestamp: parseDate(r[1]),
      created_at: parseDate(r[1]),
      updated_at: parseDate(r[16] || r[1]),
    };

    const { data: savedAcc, error: accErr } = await supabase
      .from('accommodation_requests')
      .upsert(accRecord, { onConflict: 'accommodation_id' })
      .select('id')
      .single();

    if (accErr) {
      console.error(`Error inserting accommodation ${accId}:`, accErr.message);
      continue;
    }
    accInserted++;

    // Insert accommodation members
    const membersRaw = String(r[5] || '');
    const memberNames = membersRaw.split(',').map(m => m.trim()).filter(Boolean);

    for (const mName of memberNames) {
      let matchedMemId = null;
      for (const [key, memId] of memberIdMap.entries()) {
        const [tc, nm] = key.split(':');
        if (tc === teamCode && (nm === mName.toLowerCase() || nm.includes(mName.toLowerCase()) || mName.toLowerCase().includes(nm))) {
          matchedMemId = memId;
          break;
        }
      }

      const { error: amErr } = await supabase.from('accommodation_members').insert({
        accommodation_request_id: savedAcc.id,
        team_member_id: matchedMemId,
        member_name: mName,
      });
      if (!amErr) accMembersInserted++;
    }
  }

  console.log(`✅ Accommodation requests migrated: ${accInserted}/${accRows.length}`);
  console.log(`✅ Accommodation members migrated: ${accMembersInserted}`);

  // 4. Attendance (Skipped: test data is excluded per instructions)
  console.log('\n--- 4. Attendance Records: Skipped (Test data excluded per instruction) ---');
  console.log('\n🎉 Migration complete!');
}

runMigration().catch(err => {
  console.error('\n❌ Unhandled migration error:', err);
  process.exit(1);
});
