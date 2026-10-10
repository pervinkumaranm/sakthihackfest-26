/**
 * SAKTHI HACKFEST 2K26 — Participant Feedback Backend API
 * Endpoint: /api/feedback
 *
 * Single Source of Truth: Supabase PostgreSQL (public.participant_feedback)
 *
 * Features:
 * - Public submission of mandatory 18-question feedback form + participant details
 * - Strict server-side validation for all 18 questions, allowed options, and character constraints
 * - Insert-only permissions for public participants
 * - Row Level Security protection to prevent public inspection of others' feedback
 * - Admin-authenticated retrieval and cleanup for verification
 */

import crypto from 'node:crypto';
import fs from 'fs';
import path from 'path';
import process from 'node:process';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const config = {
  maxDuration: 15,
};

let cachedSupabase: SupabaseClient | null = null;

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

function getSupabase(): SupabaseClient | null {
  if (cachedSupabase) return cachedSupabase;
  loadLocalEnvIfNeeded();

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return null;
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

function getAdminSecret(): string {
  loadLocalEnvIfNeeded();
  return (
    process.env.ADMIN_JWT_SECRET ||
    process.env.GOOGLE_PRIVATE_KEY?.slice(0, 32) ||
    'sakthi-hackfest-2026-secure-jwt-secret-key-9921'
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

// ── ALLOWED OPTIONS FOR SINGLE-CHOICE QUESTIONS ─────────────────────────────
export const ALLOWED_OPTIONS = {
  q1_registration_experience: ['Excellent', 'Good', 'Average', 'Poor', 'Very Poor'],
  q3_problem_statement_clarity: ['Very clear', 'Clear', 'Moderately clear', 'Confusing', 'Very confusing'],
  q4_scenarios_usefulness: ['Extremely useful', 'Useful', 'Neutral', 'Not very useful', 'Not applicable'],
  q5_hints_helpfulness: ['Very helpful', 'Helpful', 'Somewhat helpful', 'Not helpful', 'We did not use the hints'],
  q6_constraints_timing_clarity: [
    'Yes, both timing and clarity were good',
    'Clear, but released too early',
    'Clear, but released too late',
    'Timing was good, but instructions were unclear',
    'Both timing and clarity need improvement',
  ],
  q7_adaptability_fairness: ['Very fairly', 'Fairly', 'Neutral', 'Somewhat unfairly', 'Very unfairly'],
  q8_first_evaluation_fairness: ['Very fair', 'Fair', 'Neutral', 'Unfair', 'Very unfair'],
  q9_final_evaluation_fairness: [
    'Very fair',
    'Fair',
    'Neutral',
    'Unfair',
    'Not applicable \u2014 our team did not reach the final',
    'Not applicable - our team did not reach the final',
  ],
  q10_judges_technical_knowledge: ['Excellent', 'Good', 'Average', 'Poor', 'Very Poor'],
  q11_judges_fair_opportunity: ['Yes, completely', 'Mostly', 'Partially', 'No'],
  q12_evaluation_criteria_consistency: ['Strongly agree', 'Agree', 'Neutral', 'Disagree', 'Strongly disagree'],
  q13_portal_experience: ['Excellent', 'Good', 'Average', 'Poor', 'Very Poor'],
  q15_organizer_communication: ['Excellent', 'Good', 'Average', 'Poor', 'Very Poor'],
  q16_food_and_refreshments: ['Excellent', 'Good', 'Average', 'Poor', 'Very Poor'],
  q17_venue_and_facilities: ['Excellent', 'Good', 'Average', 'Poor', 'Very Poor'],
} as const;

export interface FeedbackValidationResult {
  valid: boolean;
  errors: Record<string, string>;
  sanitized?: Record<string, string>;
}

export function validateFeedbackPayload(raw: Record<string, any>): FeedbackValidationResult {
  const errors: Record<string, string> = {};
  const sanitized: Record<string, string> = {};

  // 1. Participant Name
  const participantName = typeof raw.participantName === 'string'
    ? raw.participantName.trim()
    : typeof raw.participant_name === 'string'
    ? raw.participant_name.trim()
    : '';

  if (!participantName) {
    errors.participantName = 'Participant Name is required.';
  } else if (participantName.length < 2) {
    errors.participantName = 'Participant Name must be at least 2 characters.';
  } else if (participantName.length > 100) {
    errors.participantName = 'Participant Name must not exceed 100 characters.';
  }
  sanitized.participant_name = participantName;

  // 2. Team Name
  const teamName = typeof raw.teamName === 'string'
    ? raw.teamName.trim()
    : typeof raw.team_name === 'string'
    ? raw.team_name.trim()
    : '';

  if (!teamName) {
    errors.teamName = 'Team Name is required.';
  } else if (teamName.length < 2) {
    errors.teamName = 'Team Name must be at least 2 characters.';
  } else if (teamName.length > 100) {
    errors.teamName = 'Team Name must not exceed 100 characters.';
  }
  sanitized.team_name = teamName;

  // Helper for single choice
  const checkSingleChoice = (key: keyof typeof ALLOWED_OPTIONS, label: string) => {
    const val = typeof raw[key] === 'string' ? raw[key].trim() : '';
    if (!val) {
      errors[key] = `${label} is required.`;
    } else {
      const allowed = ALLOWED_OPTIONS[key] as readonly string[];
      // Normalize dash for Q9
      const matched = allowed.find(opt => opt === val || (key === 'q9_final_evaluation_fairness' && opt.replace('\u2014', '-') === val.replace('\u2014', '-')));
      if (!matched) {
        errors[key] = `Invalid selection for ${label}.`;
      } else {
        // Use normalized standard string
        sanitized[key] = key === 'q9_final_evaluation_fairness' && val.includes('-') && !val.includes('\u2014')
          ? 'Not applicable \u2014 our team did not reach the final'
          : matched;
      }
    }
  };

  // Helper for text inputs
  const checkTextInput = (key: string, label: string, min: number, max: number) => {
    const val = typeof raw[key] === 'string' ? raw[key].trim() : '';
    if (!val) {
      errors[key] = `${label} is required.`;
    } else if (val.length < min) {
      errors[key] = `${label} must contain at least ${min} characters.`;
    } else if (val.length > max) {
      errors[key] = `${label} cannot exceed ${max} characters.`;
    } else {
      sanitized[key] = val;
    }
  };

  // Section 1
  checkSingleChoice('q1_registration_experience', 'Question 1 (Registration Experience)');
  checkTextInput('q2_registration_issues', 'Question 2 (Registration Issues)', 2, 100);

  // Section 2
  checkSingleChoice('q3_problem_statement_clarity', 'Question 3 (Problem Statement Clarity)');
  checkSingleChoice('q4_scenarios_usefulness', 'Question 4 (Scenarios Usefulness)');
  checkSingleChoice('q5_hints_helpfulness', 'Question 5 (Hints Helpfulness)');
  checkSingleChoice('q6_constraints_timing_clarity', 'Question 6 (Constraints Timing & Clarity)');
  checkSingleChoice('q7_adaptability_fairness', 'Question 7 (Adaptability Fairness)');

  // Section 3
  checkSingleChoice('q8_first_evaluation_fairness', 'Question 8 (First Evaluation Fairness)');
  checkSingleChoice('q9_final_evaluation_fairness', 'Question 9 (Final Evaluation Fairness)');
  checkSingleChoice('q10_judges_technical_knowledge', 'Question 10 (Judges Technical Knowledge)');
  checkSingleChoice('q11_judges_fair_opportunity', 'Question 11 (Judges Opportunity)');
  checkSingleChoice('q12_evaluation_criteria_consistency', 'Question 12 (Evaluation Criteria Consistency)');

  // Section 4
  checkSingleChoice('q13_portal_experience', 'Question 13 (Portal Experience)');
  checkTextInput('q14_portal_issues', 'Question 14 (Portal Issues)', 2, 100);

  // Section 5
  checkSingleChoice('q15_organizer_communication', 'Question 15 (Organizer Communication)');
  checkSingleChoice('q16_food_and_refreshments', 'Question 16 (Food and Refreshments)');
  checkSingleChoice('q17_venue_and_facilities', 'Question 17 (Venue and Facilities)');

  // Section 6
  checkTextInput('q18_overall_feedback', 'Question 18 (Overall Experience & Improvement)', 2, 500);

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    sanitized: Object.keys(errors).length === 0 ? sanitized : undefined,
  };
}

export default async function handler(req: any, res?: any) {
  const isEdge = req instanceof Request || (!res && typeof req.json === 'function');
  const urlObj = isEdge ? new URL(req.url, 'http://localhost') : null;
  const method = req.method;

  const send = (status: number, data: any) => {
    if (isEdge) {
      return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return res.status(status).json(data);
  };

  // ── GET REQUESTS (Admin Only) ─────────────────────────────────────────────
  if (method === 'GET') {
    const token = extractToken(req);
    if (!verifyAdminToken(token)) {
      return send(401, {
        success: false,
        message: 'Unauthorized. Public reading of feedback submissions is restricted.',
      });
    }

    try {
      const supabase = getSupabase();
      if (!supabase) {
        const localFallbackFile = path.resolve(process.cwd(), '.feedback_submissions.local.json');
        let list: any[] = [];
        try {
          if (fs.existsSync(localFallbackFile)) {
            list = JSON.parse(fs.readFileSync(localFallbackFile, 'utf8'));
          }
        } catch {}
        return send(200, { success: true, count: list.length, data: list });
      }

      const { data, error } = await supabase
        .from('participant_feedback')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return send(500, { success: false, message: error.message });
      }

      return send(200, { success: true, count: data?.length || 0, data });
    } catch (err: any) {
      return send(500, { success: false, message: err.message });
    }
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

  const action = String(body.action || '').toUpperCase();

  // Admin delete test feedback record
  if (action === 'DELETE_TEST_FEEDBACK') {
    const token = extractToken(req) || body.token;
    if (!verifyAdminToken(token)) {
      return send(401, { success: false, message: 'Unauthorized. Admin credentials required for record removal.' });
    }

    const testId = String(body.id || body.feedbackId || '').trim();
    if (!testId) {
      return send(400, { success: false, message: 'Feedback record ID is required for cleanup.' });
    }

    try {
      const supabase = getSupabase();
      if (!supabase) {
        const localFallbackFile = path.resolve(process.cwd(), '.feedback_submissions.local.json');
        let list: any[] = [];
        try {
          if (fs.existsSync(localFallbackFile)) {
            list = JSON.parse(fs.readFileSync(localFallbackFile, 'utf8'));
          }
        } catch {}
        const before = list.length;
        list = list.filter(item => item.id !== testId);
        fs.writeFileSync(localFallbackFile, JSON.stringify(list, null, 2), 'utf8');
        return send(200, {
          success: true,
          message: `Test feedback record ${testId} removed successfully.`,
          deletedCount: before - list.length,
        });
      }

      const { error, count } = await supabase
        .from('participant_feedback')
        .delete({ count: 'exact' })
        .eq('id', testId);

      if (error) {
        return send(500, { success: false, message: error.message });
      }

      return send(200, {
        success: true,
        message: `Test feedback record ${testId} removed successfully.`,
        deletedCount: count,
      });
    } catch (err: any) {
      return send(500, { success: false, message: err.message });
    }
  }

  // Regular Participant Feedback Submission
  const validation = validateFeedbackPayload(body);
  if (!validation.valid || !validation.sanitized) {
    return send(400, {
      success: false,
      message: 'Validation failed. Please review your answers and ensure all required fields are filled.',
      errors: validation.errors,
    });
  }

  const payload = validation.sanitized;

  try {
    const supabase = getSupabase();

    if (!supabase) {
      // Local development fallback file only if Supabase credentials are not configured at all
      console.warn('Supabase credentials not configured in environment. Using local dev fallback storage.');
      const localFallbackFile = path.resolve(process.cwd(), '.feedback_submissions.local.json');
      let list: any[] = [];
      try {
        if (fs.existsSync(localFallbackFile)) {
          list = JSON.parse(fs.readFileSync(localFallbackFile, 'utf8'));
        }
      } catch {}

      const newId = crypto.randomUUID();
      const newRecord = {
        id: newId,
        ...payload,
        created_at: new Date().toISOString(),
      };
      list.push(newRecord);
      fs.writeFileSync(localFallbackFile, JSON.stringify(list, null, 2), 'utf8');

      return send(200, {
        success: true,
        id: newId,
        message: 'Thank you for sharing your feedback! Your response has been recorded successfully.',
      });
    }

    // Insert record into Supabase PostgreSQL participant_feedback
    const { data, error } = await supabase
      .from('participant_feedback')
      .insert({
        participant_name: payload.participant_name,
        team_name: payload.team_name,
        q1_registration_experience: payload.q1_registration_experience,
        q2_registration_issues: payload.q2_registration_issues,
        q3_problem_statement_clarity: payload.q3_problem_statement_clarity,
        q4_scenarios_usefulness: payload.q4_scenarios_usefulness,
        q5_hints_helpfulness: payload.q5_hints_helpfulness,
        q6_constraints_timing_clarity: payload.q6_constraints_timing_clarity,
        q7_adaptability_fairness: payload.q7_adaptability_fairness,
        q8_first_evaluation_fairness: payload.q8_first_evaluation_fairness,
        q9_final_evaluation_fairness: payload.q9_final_evaluation_fairness,
        q10_judges_technical_knowledge: payload.q10_judges_technical_knowledge,
        q11_judges_fair_opportunity: payload.q11_judges_fair_opportunity,
        q12_evaluation_criteria_consistency: payload.q12_evaluation_criteria_consistency,
        q13_portal_experience: payload.q13_portal_experience,
        q14_portal_issues: payload.q14_portal_issues,
        q15_organizer_communication: payload.q15_organizer_communication,
        q16_food_and_refreshments: payload.q16_food_and_refreshments,
        q17_venue_and_facilities: payload.q17_venue_and_facilities,
        q18_overall_feedback: payload.q18_overall_feedback,
      })
      .select('id, created_at')
      .single();

    if (error || !data) {
      console.error('Supabase feedback insert error:', error);
      return send(500, {
        success: false,
        message: 'Could not save feedback to database. ' + (error?.message || ''),
      });
    }

    return send(200, {
      success: true,
      id: data.id,
      message: 'Thank you for sharing your feedback! Your response has been recorded successfully.',
      createdAt: data.created_at,
    });
  } catch (err: any) {
    console.error('Unhandled feedback submission error:', err);
    return send(500, {
      success: false,
      message: err.message || 'An unexpected server error occurred while saving your feedback.',
    });
  }
}
