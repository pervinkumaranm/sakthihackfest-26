-- ============================================================================
-- SAKTHI HACKFEST 2K26 — Participant Feedback Migration
-- Table: public.participant_feedback
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.participant_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Participant Identification (Mandatory)
  participant_name TEXT NOT NULL CHECK (char_length(trim(participant_name)) >= 2 AND char_length(participant_name) <= 100),
  team_name TEXT NOT NULL CHECK (char_length(trim(team_name)) >= 2 AND char_length(team_name) <= 100),
  
  -- SECTION 1: REGISTRATION & ONBOARDING
  q1_registration_experience TEXT NOT NULL CHECK (q1_registration_experience IN (
    'Excellent', 'Good', 'Average', 'Poor', 'Very Poor'
  )),
  q2_registration_issues TEXT NOT NULL CHECK (char_length(trim(q2_registration_issues)) >= 2 AND char_length(q2_registration_issues) <= 100),
  
  -- SECTION 2: PROBLEM STATEMENT, SCENARIOS, HINTS & CONSTRAINTS
  q3_problem_statement_clarity TEXT NOT NULL CHECK (q3_problem_statement_clarity IN (
    'Very clear', 'Clear', 'Moderately clear', 'Confusing', 'Very confusing'
  )),
  q4_scenarios_usefulness TEXT NOT NULL CHECK (q4_scenarios_usefulness IN (
    'Extremely useful', 'Useful', 'Neutral', 'Not very useful', 'Not applicable'
  )),
  q5_hints_helpfulness TEXT NOT NULL CHECK (q5_hints_helpfulness IN (
    'Very helpful', 'Helpful', 'Somewhat helpful', 'Not helpful', 'We did not use the hints'
  )),
  q6_constraints_timing_clarity TEXT NOT NULL CHECK (q6_constraints_timing_clarity IN (
    'Yes, both timing and clarity were good',
    'Clear, but released too early',
    'Clear, but released too late',
    'Timing was good, but instructions were unclear',
    'Both timing and clarity need improvement'
  )),
  q7_adaptability_fairness TEXT NOT NULL CHECK (q7_adaptability_fairness IN (
    'Very fairly', 'Fairly', 'Neutral', 'Somewhat unfairly', 'Very unfairly'
  )),
  
  -- SECTION 3: EVALUATION & JUDGES
  q8_first_evaluation_fairness TEXT NOT NULL CHECK (q8_first_evaluation_fairness IN (
    'Very fair', 'Fair', 'Neutral', 'Unfair', 'Very unfair'
  )),
  q9_final_evaluation_fairness TEXT NOT NULL CHECK (q9_final_evaluation_fairness IN (
    'Very fair', 'Fair', 'Neutral', 'Unfair', 'Not applicable — our team did not reach the final',
    'Not applicable - our team did not reach the final'
  )),
  q10_judges_technical_knowledge TEXT NOT NULL CHECK (q10_judges_technical_knowledge IN (
    'Excellent', 'Good', 'Average', 'Poor', 'Very Poor'
  )),
  q11_judges_fair_opportunity TEXT NOT NULL CHECK (q11_judges_fair_opportunity IN (
    'Yes, completely', 'Mostly', 'Partially', 'No'
  )),
  q12_evaluation_criteria_consistency TEXT NOT NULL CHECK (q12_evaluation_criteria_consistency IN (
    'Strongly agree', 'Agree', 'Neutral', 'Disagree', 'Strongly disagree'
  )),
  
  -- SECTION 4: EVALUATION PORTAL & TECHNICAL EXPERIENCE
  q13_portal_experience TEXT NOT NULL CHECK (q13_portal_experience IN (
    'Excellent', 'Good', 'Average', 'Poor', 'Very Poor'
  )),
  q14_portal_issues TEXT NOT NULL CHECK (char_length(trim(q14_portal_issues)) >= 2 AND char_length(q14_portal_issues) <= 100),
  
  -- SECTION 5: EVENT ORGANIZATION & FACILITIES
  q15_organizer_communication TEXT NOT NULL CHECK (q15_organizer_communication IN (
    'Excellent', 'Good', 'Average', 'Poor', 'Very Poor'
  )),
  q16_food_and_refreshments TEXT NOT NULL CHECK (q16_food_and_refreshments IN (
    'Excellent', 'Good', 'Average', 'Poor', 'Very Poor'
  )),
  q17_venue_and_facilities TEXT NOT NULL CHECK (q17_venue_and_facilities IN (
    'Excellent', 'Good', 'Average', 'Poor', 'Very Poor'
  )),
  
  -- SECTION 6: OVERALL EXPERIENCE & IMPROVEMENT
  q18_overall_feedback TEXT NOT NULL CHECK (char_length(trim(q18_overall_feedback)) >= 2 AND char_length(q18_overall_feedback) <= 500),
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

COMMENT ON TABLE public.participant_feedback IS 'Sakthi HackFest 2K26 participant feedback submissions';

-- Indexes for performance & reporting
CREATE INDEX IF NOT EXISTS idx_participant_feedback_created_at ON public.participant_feedback(created_at);
CREATE INDEX IF NOT EXISTS idx_participant_feedback_team_name ON public.participant_feedback(team_name);

-- Row Level Security (RLS)
ALTER TABLE public.participant_feedback ENABLE ROW LEVEL SECURITY;

-- 1. Full access for service_role
DROP POLICY IF EXISTS "service_role_all_participant_feedback" ON public.participant_feedback;
CREATE POLICY "service_role_all_participant_feedback" ON public.participant_feedback 
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 2. Public / Anon users can ONLY insert. They cannot select (read), update, or delete!
DROP POLICY IF EXISTS "anon_insert_participant_feedback" ON public.participant_feedback;
CREATE POLICY "anon_insert_participant_feedback" ON public.participant_feedback 
  FOR INSERT TO anon WITH CHECK (true);
