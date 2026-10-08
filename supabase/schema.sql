-- ============================================================================
-- SAKTHI HACKFEST 2K26 — Complete Supabase PostgreSQL Schema
-- Single Source of Truth for: Registration, Accommodation, Attendance, Toggles
-- ============================================================================

-- Enable pgcrypto for UUID generation if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. App Settings (Form Toggles & Global Configuration)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_by TEXT DEFAULT 'system'
);

COMMENT ON TABLE public.app_settings IS 'Single source of truth for runtime application toggles and configuration';

-- Default Toggles: Registration OFF, Accommodation OFF (both periods over)
INSERT INTO public.app_settings (key, value, updated_at, updated_by)
VALUES 
  ('registration_open', 'false'::jsonb, timezone('utc'::text, now()), 'system'),
  ('accommodation_open', 'false'::jsonb, timezone('utc'::text, now()), 'system')
ON CONFLICT (key) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 2. Teams (Normalized Team Registrations)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_code TEXT NOT NULL UNIQUE, -- Primary identifier e.g. 'SHF26-M7PYJZ'
  team_name TEXT NOT NULL,
  team_size INTEGER NOT NULL DEFAULT 2,
  selected_domain TEXT,
  selected_theme TEXT,
  accommodation_required BOOLEAN DEFAULT FALSE,
  
  -- Leader Contact Details
  leader_name TEXT NOT NULL,
  leader_college TEXT NOT NULL,
  leader_department TEXT,
  leader_year TEXT,
  leader_whatsapp TEXT,
  leader_email TEXT NOT NULL,
  
  -- Payment & Verification Information
  payment_amount NUMERIC(10, 2) NOT NULL DEFAULT 1000.00,
  upi_transaction_id TEXT,
  payment_screenshot_url TEXT,
  payment_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'VERIFIED', 'REJECTED')),
  registration_status TEXT NOT NULL DEFAULT 'CONFIRMED' CHECK (registration_status IN ('CONFIRMED', 'REJECTED', 'PENDING')),
  
  -- Historical tracking
  email_status TEXT DEFAULT 'SENT',
  email_sent_at TIMESTAMPTZ,
  
  registration_timestamp TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

COMMENT ON TABLE public.teams IS 'Core hackathon team registration records';

CREATE INDEX IF NOT EXISTS idx_teams_team_code ON public.teams(team_code);
CREATE INDEX IF NOT EXISTS idx_teams_leader_email ON public.teams(leader_email);
CREATE INDEX IF NOT EXISTS idx_teams_created_at ON public.teams(created_at);

-- ----------------------------------------------------------------------------
-- 3. Team Members (Normalized Participants associated with Teams)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  member_order INTEGER NOT NULL DEFAULT 1, -- 1 = Leader, 2 = Member 2, 3 = Member 3, 4 = Member 4
  name TEXT NOT NULL,
  college TEXT NOT NULL,
  department TEXT,
  year_of_study TEXT,
  whatsapp TEXT,
  email TEXT,
  is_leader BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

COMMENT ON TABLE public.team_members IS 'Individual team participants including leaders and members';

CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_name ON public.team_members(name);

-- ----------------------------------------------------------------------------
-- 4. Accommodation Requests
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.accommodation_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  accommodation_id TEXT NOT NULL UNIQUE, -- e.g. 'SHF26-ACC-001HGKN'
  team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  team_code TEXT NOT NULL,
  team_name TEXT NOT NULL,
  college_name TEXT,
  member_count INTEGER NOT NULL DEFAULT 1,
  rate_per_member NUMERIC(10, 2) NOT NULL DEFAULT 100.00,
  total_amount NUMERIC(10, 2) NOT NULL,
  upi_transaction_id TEXT,
  payment_screenshot_url TEXT,
  payment_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'VERIFIED', 'REJECTED')),
  team_leader_name TEXT,
  team_leader_email TEXT,
  request_timestamp TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

COMMENT ON TABLE public.accommodation_requests IS 'Accommodation reservations and payment verifications';

CREATE INDEX IF NOT EXISTS idx_accommodation_team_code ON public.accommodation_requests(team_code);
CREATE INDEX IF NOT EXISTS idx_accommodation_id ON public.accommodation_requests(accommodation_id);

-- ----------------------------------------------------------------------------
-- 5. Accommodation Members (Specific Members in Accommodation Request)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.accommodation_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  accommodation_request_id UUID NOT NULL REFERENCES public.accommodation_requests(id) ON DELETE CASCADE,
  team_member_id UUID REFERENCES public.team_members(id) ON DELETE SET NULL,
  member_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

COMMENT ON TABLE public.accommodation_members IS 'Members included in each accommodation request';

CREATE INDEX IF NOT EXISTS idx_accommodation_members_request_id ON public.accommodation_members(accommodation_request_id);

-- ----------------------------------------------------------------------------
-- 6. Attendance Records (Rapid Scanner Event Attendance)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  team_code TEXT NOT NULL,
  team_name TEXT NOT NULL,
  marked_by TEXT NOT NULL DEFAULT 'volunteer',
  total_present INTEGER NOT NULL DEFAULT 0,
  total_members INTEGER NOT NULL DEFAULT 0,
  marked_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT uq_attendance_records_team_id UNIQUE (team_id),
  CONSTRAINT uq_attendance_records_team_code UNIQUE (team_code)
);

COMMENT ON TABLE public.attendance_records IS 'Recorded attendance per team with uniqueness constraint';

CREATE INDEX IF NOT EXISTS idx_attendance_records_team_code ON public.attendance_records(team_code);
CREATE INDEX IF NOT EXISTS idx_attendance_records_team_id ON public.attendance_records(team_id);

-- ----------------------------------------------------------------------------
-- 7. Attendance Members (Present/Absent Status per Member)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.attendance_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attendance_record_id UUID NOT NULL REFERENCES public.attendance_records(id) ON DELETE CASCADE,
  team_member_id UUID REFERENCES public.team_members(id) ON DELETE SET NULL,
  member_name TEXT NOT NULL,
  college_name TEXT,
  status TEXT NOT NULL CHECK (status IN ('Present', 'Absent')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

COMMENT ON TABLE public.attendance_members IS 'Present/Absent status for each participant under a team';

CREATE INDEX IF NOT EXISTS idx_attendance_members_record_id ON public.attendance_members(attendance_record_id);

-- ----------------------------------------------------------------------------
-- 8. Audit Logs (Administrative Activity Logging)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  performed_by TEXT NOT NULL,
  target_id TEXT,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

COMMENT ON TABLE public.audit_logs IS 'Audit trail for admin actions and status updates';

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);

-- ----------------------------------------------------------------------------
-- Security: Row Level Security (RLS)
-- ----------------------------------------------------------------------------
-- Enable RLS on all tables
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accommodation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accommodation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow service_role key full unrestricted access (Serverless backend API uses service_role key)
DROP POLICY IF EXISTS "service_role_all_app_settings" ON public.app_settings;
CREATE POLICY "service_role_all_app_settings" ON public.app_settings FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_all_teams" ON public.teams;
CREATE POLICY "service_role_all_teams" ON public.teams FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_all_team_members" ON public.team_members;
CREATE POLICY "service_role_all_team_members" ON public.team_members FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_all_accommodation_requests" ON public.accommodation_requests;
CREATE POLICY "service_role_all_accommodation_requests" ON public.accommodation_requests FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_all_accommodation_members" ON public.accommodation_members;
CREATE POLICY "service_role_all_accommodation_members" ON public.accommodation_members FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_all_attendance_records" ON public.attendance_records;
CREATE POLICY "service_role_all_attendance_records" ON public.attendance_records FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_all_attendance_members" ON public.attendance_members;
CREATE POLICY "service_role_all_attendance_members" ON public.attendance_members FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_all_audit_logs" ON public.audit_logs;
CREATE POLICY "service_role_all_audit_logs" ON public.audit_logs FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Allow public (anon) read-only access to app_settings so client can inspect form toggles if needed
DROP POLICY IF EXISTS "anon_read_app_settings" ON public.app_settings;
CREATE POLICY "anon_read_app_settings" ON public.app_settings FOR SELECT TO anon USING (true);
