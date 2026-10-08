/**
 * SAKTHI HACKFEST 2K26 — Server-Side Supabase Client & Database Helpers
 * Module: api/_supabase.ts
 *
 * Provides typed, secure access to Supabase PostgreSQL using the service-role key
 * for all Vercel Serverless Functions and local dev server API endpoints.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import process from 'node:process';

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

let cachedClient: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (cachedClient) return cachedClient;

  loadLocalEnvIfNeeded();

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Missing Supabase configuration. Please ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in environment variables.'
    );
  }

  cachedClient = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return cachedClient;
}

export function isSupabaseConfigured(): boolean {
  loadLocalEnvIfNeeded();
  return Boolean(
    (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL) &&
    (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY)
  );
}

// ----------------------------------------------------------------------------
// Database Helper Methods
// ----------------------------------------------------------------------------

export interface AppToggleSettings {
  registrationOpen: boolean;
  accommodationOpen: boolean;
  lastUpdated: string;
  updatedBy: string;
}

/**
 * Fetch authoritative form toggles from Supabase app_settings
 */
export async function getTogglesFromDb(): Promise<AppToggleSettings> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('app_settings')
    .select('key, value, updated_at, updated_by')
    .in('key', ['registration_open', 'accommodation_open', 'last_updated']);

  if (error || !data) {
    console.warn('Failed to fetch app_settings from Supabase, falling back to false:', error?.message);
    return {
      registrationOpen: false,
      accommodationOpen: false,
      lastUpdated: new Date().toISOString(),
      updatedBy: 'system',
    };
  }

  let registrationOpen = false;
  let accommodationOpen = false;
  let lastUpdated = new Date().toISOString();
  let updatedBy = 'admin';

  for (const row of data) {
    if (row.key === 'registration_open') {
      registrationOpen = Boolean(row.value);
      if (row.updated_at) lastUpdated = row.updated_at;
      if (row.updated_by) updatedBy = row.updated_by;
    } else if (row.key === 'accommodation_open') {
      accommodationOpen = Boolean(row.value);
    }
  }

  return { registrationOpen, accommodationOpen, lastUpdated, updatedBy };
}

/**
 * Update form toggles in Supabase app_settings
 */
export async function setTogglesInDb(
  updates: { registrationOpen?: boolean; accommodationOpen?: boolean },
  updatedBy: string
): Promise<AppToggleSettings> {
  const supabase = getSupabase();
  const now = new Date().toISOString();

  if (typeof updates.registrationOpen === 'boolean') {
    await supabase.from('app_settings').upsert({
      key: 'registration_open',
      value: updates.registrationOpen,
      updated_at: now,
      updated_by: updatedBy,
    });
  }

  if (typeof updates.accommodationOpen === 'boolean') {
    await supabase.from('app_settings').upsert({
      key: 'accommodation_open',
      value: updates.accommodationOpen,
      updated_at: now,
      updated_by: updatedBy,
    });
  }

  await supabase.from('app_settings').upsert({
    key: 'last_updated',
    value: now,
    updated_at: now,
    updated_by: updatedBy,
  });

  return getTogglesFromDb();
}
