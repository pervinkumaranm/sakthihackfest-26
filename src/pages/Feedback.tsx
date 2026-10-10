import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageSquareHeart,
  CheckCircle2,
  AlertCircle,
  Send,
  Loader2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  User,
  Users,
} from 'lucide-react'
import { apiService } from '../services/api'
import type { ParticipantFeedbackPayload } from '../types'

interface FeedbackFormData {
  participantName: string
  teamName: string
  q1_registration_experience: string
  q2_registration_issues: string
  q3_problem_statement_clarity: string
  q4_scenarios_usefulness: string
  q5_hints_helpfulness: string
  q6_constraints_timing_clarity: string
  q7_adaptability_fairness: string
  q8_first_evaluation_fairness: string
  q9_final_evaluation_fairness: string
  q10_judges_technical_knowledge: string
  q11_judges_fair_opportunity: string
  q12_evaluation_criteria_consistency: string
  q13_portal_experience: string
  q14_portal_issues: string
  q15_organizer_communication: string
  q16_food_and_refreshments: string
  q17_venue_and_facilities: string
  q18_overall_feedback: string
}

const INITIAL_FORM: FeedbackFormData = {
  participantName: '',
  teamName: '',
  q1_registration_experience: '',
  q2_registration_issues: '',
  q3_problem_statement_clarity: '',
  q4_scenarios_usefulness: '',
  q5_hints_helpfulness: '',
  q6_constraints_timing_clarity: '',
  q7_adaptability_fairness: '',
  q8_first_evaluation_fairness: '',
  q9_final_evaluation_fairness: '',
  q10_judges_technical_knowledge: '',
  q11_judges_fair_opportunity: '',
  q12_evaluation_criteria_consistency: '',
  q13_portal_experience: '',
  q14_portal_issues: '',
  q15_organizer_communication: '',
  q16_food_and_refreshments: '',
  q17_venue_and_facilities: '',
  q18_overall_feedback: '',
}

export default function Feedback() {
  const [formData, setFormData] = useState<FeedbackFormData>(INITIAL_FORM)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submissionId, setSubmissionId] = useState<string | null>(null)

  const firstErrorRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    document.title = "Sakthi HackFest'26 \u2014 Participant Feedback Form"
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [])

  const handleChange = (field: keyof FeedbackFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
    if (submitError) {
      setSubmitError(null)
    }
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Participant Name
    const pName = formData.participantName.trim()
    if (!pName) {
      newErrors.participantName = 'Participant Name is required.'
    } else if (pName.length < 2) {
      newErrors.participantName = 'Participant Name must be at least 2 characters.'
    } else if (pName.length > 100) {
      newErrors.participantName = 'Participant Name cannot exceed 100 characters.'
    }

    // Team Name
    const tName = formData.teamName.trim()
    if (!tName) {
      newErrors.teamName = 'Team Name is required.'
    } else if (tName.length < 2) {
      newErrors.teamName = 'Team Name must be at least 2 characters.'
    } else if (tName.length > 100) {
      newErrors.teamName = 'Team Name cannot exceed 100 characters.'
    }

    // Q1
    if (!formData.q1_registration_experience) {
      newErrors.q1_registration_experience = 'Please rate your overall registration experience.'
    }

    // Q2 (2 - 100 chars)
    const q2 = formData.q2_registration_issues.trim()
    if (!q2) {
      newErrors.q2_registration_issues = 'Please answer this question (enter "No issues" if none).'
    } else if (q2.length < 2) {
      newErrors.q2_registration_issues = 'Response must be at least 2 characters.'
    } else if (q2.length > 100) {
      newErrors.q2_registration_issues = 'Response cannot exceed 100 characters.'
    }

    // Q3
    if (!formData.q3_problem_statement_clarity) {
      newErrors.q3_problem_statement_clarity = 'Please rate the problem statement clarity.'
    }

    // Q4
    if (!formData.q4_scenarios_usefulness) {
      newErrors.q4_scenarios_usefulness = 'Please rate the usefulness of scenarios.'
    }

    // Q5
    if (!formData.q5_hints_helpfulness) {
      newErrors.q5_hints_helpfulness = 'Please rate the helpfulness of hints.'
    }

    // Q6
    if (!formData.q6_constraints_timing_clarity) {
      newErrors.q6_constraints_timing_clarity = 'Please rate the constraints timing and clarity.'
    }

    // Q7
    if (!formData.q7_adaptability_fairness) {
      newErrors.q7_adaptability_fairness = 'Please rate the adaptability fairness.'
    }

    // Q8
    if (!formData.q8_first_evaluation_fairness) {
      newErrors.q8_first_evaluation_fairness = 'Please rate the First Evaluation fairness.'
    }

    // Q9
    if (!formData.q9_final_evaluation_fairness) {
      newErrors.q9_final_evaluation_fairness = 'Please rate the Final Evaluation process.'
    }

    // Q10
    if (!formData.q10_judges_technical_knowledge) {
      newErrors.q10_judges_technical_knowledge = "Please rate the judges' technical understanding."
    }

    // Q11
    if (!formData.q11_judges_fair_opportunity) {
      newErrors.q11_judges_fair_opportunity = 'Please answer this question.'
    }

    // Q12
    if (!formData.q12_evaluation_criteria_consistency) {
      newErrors.q12_evaluation_criteria_consistency = 'Please answer this question.'
    }

    // Q13
    if (!formData.q13_portal_experience) {
      newErrors.q13_portal_experience = "Please rate the portal's speed and reliability."
    }

    // Q14 (2 - 100 chars)
    const q14 = formData.q14_portal_issues.trim()
    if (!q14) {
      newErrors.q14_portal_issues = 'Please answer this question (e.g. "No issues encountered").'
    } else if (q14.length < 2) {
      newErrors.q14_portal_issues = 'Response must be at least 2 characters.'
    } else if (q14.length > 100) {
      newErrors.q14_portal_issues = 'Response cannot exceed 100 characters.'
    }

    // Q15
    if (!formData.q15_organizer_communication) {
      newErrors.q15_organizer_communication = "Please rate the organizers' communication."
    }

    // Q16
    if (!formData.q16_food_and_refreshments) {
      newErrors.q16_food_and_refreshments = 'Please rate the food and meal arrangements.'
    }

    // Q17
    if (!formData.q17_venue_and_facilities) {
      newErrors.q17_venue_and_facilities = 'Please rate the venue and facilities.'
    }

    // Q18 (2 - 500 chars)
    const q18 = formData.q18_overall_feedback.trim()
    if (!q18) {
      newErrors.q18_overall_feedback = 'Please provide your valuable feedback and recommendations.'
    } else if (q18.length < 2) {
      newErrors.q18_overall_feedback = 'Feedback must contain at least 2 characters.'
    } else if (q18.length > 500) {
      newErrors.q18_overall_feedback = 'Feedback cannot exceed 500 characters.'
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) {
      // Find first error and scroll to it smoothly
      const firstKey = Object.keys(newErrors)[0]
      const el = document.getElementById(`field-${firstKey}`)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return

    if (!validate()) {
      setSubmitError('Please complete all mandatory questions and correct highlighted fields before submitting.')
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    const payload: ParticipantFeedbackPayload = {
      participantName: formData.participantName.trim(),
      teamName: formData.teamName.trim(),
      q1_registration_experience: formData.q1_registration_experience,
      q2_registration_issues: formData.q2_registration_issues.trim(),
      q3_problem_statement_clarity: formData.q3_problem_statement_clarity,
      q4_scenarios_usefulness: formData.q4_scenarios_usefulness,
      q5_hints_helpfulness: formData.q5_hints_helpfulness,
      q6_constraints_timing_clarity: formData.q6_constraints_timing_clarity,
      q7_adaptability_fairness: formData.q7_adaptability_fairness,
      q8_first_evaluation_fairness: formData.q8_first_evaluation_fairness,
      q9_final_evaluation_fairness: formData.q9_final_evaluation_fairness,
      q10_judges_technical_knowledge: formData.q10_judges_technical_knowledge,
      q11_judges_fair_opportunity: formData.q11_judges_fair_opportunity,
      q12_evaluation_criteria_consistency: formData.q12_evaluation_criteria_consistency,
      q13_portal_experience: formData.q13_portal_experience,
      q14_portal_issues: formData.q14_portal_issues.trim(),
      q15_organizer_communication: formData.q15_organizer_communication,
      q16_food_and_refreshments: formData.q16_food_and_refreshments,
      q17_venue_and_facilities: formData.q17_venue_and_facilities,
      q18_overall_feedback: formData.q18_overall_feedback.trim(),
    }

    try {
      const response = await apiService.submitFeedback(payload)
      if (response && response.success) {
        setSubmissionId((response.data as any)?.id || response.registrationId || 'SUBMITTED')
        setIsSubmitted(true)
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
      } else {
        setSubmitError(response.message || response.error || 'Failed to submit feedback. Please check your answers and try again.')
      }
    } catch (err: any) {
      setSubmitError(err.message || 'An unexpected connection error occurred. Your answers have been preserved; please try submitting again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Render a Single Choice Option Group
  const renderRadioGroup = (
    field: keyof FeedbackFormData,
    label: string,
    options: string[],
    helpText?: string
  ) => {
    const error = errors[field]
    const currentValue = formData[field]

    return (
      <div id={`field-${field}`} className="space-y-3 pt-2">
        <label className="block text-sm font-semibold text-white tracking-wide">
          {label} <span className="text-brand-primary">*</span>
        </label>
        {helpText && <p className="font-mono text-xs text-brand-muted">{helpText}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {options.map(option => {
            const isSelected = currentValue === option
            return (
              <button
                key={option}
                type="button"
                onClick={() => handleChange(field, option)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all text-xs flex items-center justify-between group cursor-pointer ${isSelected
                    ? 'bg-brand-primary/15 border-brand-primary text-white shadow-glow-red ring-1 ring-brand-primary/50'
                    : 'bg-brand-surface border-brand-border text-brand-text hover:border-brand-primary/40 hover:bg-brand-card'
                  }`}
              >
                <span className="font-medium pr-2 group-hover:text-white transition-colors">
                  {option}
                </span>
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all shrink-0 ${isSelected
                      ? 'border-brand-primary bg-brand-primary text-white'
                      : 'border-brand-border bg-brand-bg group-hover:border-brand-primary/50'
                    }`}
                >
                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </button>
            )
          })}
        </div>

        {error && (
          <p className="font-mono text-xs text-red-400 flex items-center gap-1.5 mt-1">
            <AlertCircle size={13} className="shrink-0" />
            {error}
          </p>
        )}
      </div>
    )
  }

  // ── SUCCESS CONFIRMATION SCREEN ───────────────────────────────────────────
  if (isSubmitted) {
    return (
      <main className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-brand-card/95 border border-brand-border p-8 sm:p-10 rounded-2xl shadow-2xl backdrop-blur-xl text-center"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center mb-6 shadow-glow">
              <CheckCircle2 size={32} />
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-xs font-semibold tracking-wider uppercase mb-4">
              <ShieldCheck size={14} /> Response Recorded
            </div>

            <h1 className="font-display font-black text-2xl sm:text-3xl text-white tracking-wide mb-3">
              Thank you for sharing your feedback!
            </h1>

            <p className="text-brand-muted text-sm sm:text-base leading-relaxed mb-6">
              Your response has been recorded successfully in the Sakthi HackFest '26 database.
              Your evaluation and suggestions will help us continuously improve future editions.
            </p>

            {/* Submission Summary Card */}
            <div className="p-5 bg-brand-surface border border-brand-border rounded-xl text-left font-mono text-xs space-y-2 mb-8">
              <div className="flex justify-between items-center text-brand-muted pb-2 border-b border-brand-border/60">
                <span>Participant:</span>
                <span className="text-white font-semibold">{formData.participantName}</span>
              </div>
              <div className="flex justify-between items-center text-brand-muted pb-2 border-b border-brand-border/60">
                <span>Team:</span>
                <span className="text-white font-semibold">{formData.teamName}</span>
              </div>
              {submissionId && (
                <div className="flex justify-between items-center text-brand-muted pt-1">
                  <span>Reference ID:</span>
                  <span className="text-brand-primary font-semibold">{submissionId}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/"
                className="px-6 py-3 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white font-display font-bold text-sm tracking-wider uppercase transition-all shadow-glow-red flex items-center justify-center gap-2"
              >
                Return to Home
                <ArrowRight size={16} />
              </Link>
            </div>
          </motion.div>
        </div>
      </main>
    )
  }

  // ── MAIN FEEDBACK FORM ────────────────────────────────────────────────────
  return (
    <main className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Badge & Title */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary font-mono text-xs font-semibold tracking-wider uppercase mb-3">
            <MessageSquareHeart size={14} /> SAKTHI HACKFEST '26
          </div>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-white tracking-wide">
            Participant Feedback Form
          </h1>
          <p className="text-brand-muted text-sm sm:text-base mt-2 max-w-2xl mx-auto">
            Please share your honest feedback regarding your hackathon experience across the event stages.
            All 18 questions are mandatory to ensure comprehensive evaluation.
          </p>
        </div>

        {/* Global Error Banner */}
        <AnimatePresence>
          {submitError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 font-mono text-xs mb-8 flex items-start gap-3"
            >
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Submission Error</p>
                <p className="mt-0.5">{submitError}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} noValidate className="space-y-10">
          {/* ── PARTICIPANT IDENTIFICATION CARD ──────────────────────────── */}
          <section className="bg-brand-card/95 border border-brand-border p-6 sm:p-8 rounded-2xl shadow-xl backdrop-blur-xl space-y-6">
            <div className="border-b border-brand-border/60 pb-4">
              <div className="flex items-center gap-2 text-brand-primary font-mono text-xs font-bold tracking-widest uppercase">
                <Sparkles size={14} /> PARTICIPANT IDENTIFICATION
              </div>
              <h2 className="font-display font-black text-xl text-white mt-1">
                Tell Us Who You Are
              </h2>
              <p className="font-mono text-xs text-brand-muted mt-1">
                Both participant name and registered team name are required before submitting feedback.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* FIELD 1: PARTICIPANT NAME */}
              <div id="field-participantName" className="space-y-2">
                <label className="block text-sm font-semibold text-white tracking-wide">
                  Participant Name <span className="text-brand-primary">*</span>
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted" />
                  <input
                    type="text"
                    value={formData.participantName}
                    maxLength={100}
                    onChange={e => handleChange('participantName', e.target.value)}
                    placeholder="Enter your full name"
                    className={`w-full pl-10 pr-4 py-3 bg-brand-surface border rounded-xl text-white font-mono text-xs outline-none transition-all placeholder:text-brand-muted/60 ${errors.participantName
                        ? 'border-red-500 focus:border-red-400'
                        : 'border-brand-border focus:border-brand-primary'
                      }`}
                  />
                </div>
                {errors.participantName && (
                  <p className="font-mono text-xs text-red-400 flex items-center gap-1.5 mt-1">
                    <AlertCircle size={13} className="shrink-0" />
                    {errors.participantName}
                  </p>
                )}
              </div>

              {/* FIELD 2: TEAM NAME */}
              <div id="field-teamName" className="space-y-2">
                <label className="block text-sm font-semibold text-white tracking-wide">
                  Team Name <span className="text-brand-primary">*</span>
                </label>
                <div className="relative">
                  <Users size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted" />
                  <input
                    type="text"
                    value={formData.teamName}
                    maxLength={100}
                    onChange={e => handleChange('teamName', e.target.value)}
                    placeholder="Enter your team name"
                    className={`w-full pl-10 pr-4 py-3 bg-brand-surface border rounded-xl text-white font-mono text-xs outline-none transition-all placeholder:text-brand-muted/60 ${errors.teamName
                        ? 'border-red-500 focus:border-red-400'
                        : 'border-brand-border focus:border-brand-primary'
                      }`}
                  />
                </div>
                {errors.teamName && (
                  <p className="font-mono text-xs text-red-400 flex items-center gap-1.5 mt-1">
                    <AlertCircle size={13} className="shrink-0" />
                    {errors.teamName}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* ── SECTION 1: REGISTRATION & ONBOARDING ──────────────────────── */}
          <section className="bg-brand-card/95 border border-brand-border p-6 sm:p-8 rounded-2xl shadow-xl backdrop-blur-xl space-y-6">
            <div className="border-b border-brand-border/60 pb-3">
              <span className="font-mono text-xs font-bold text-brand-primary tracking-widest uppercase">
                SECTION 1 OF 6
              </span>
              <h2 className="font-display font-black text-xl text-white tracking-wide mt-1">
                REGISTRATION & ONBOARDING
              </h2>
            </div>

            {/* Question 1 */}
            {renderRadioGroup(
              'q1_registration_experience',
              '1. How was your overall registration experience?',
              ['Excellent', 'Good', 'Average', 'Poor', 'Very Poor']
            )}

            {/* Question 2 */}
            <div id="field-q2_registration_issues" className="space-y-2 pt-2">
              <label className="block text-sm font-semibold text-white tracking-wide">
                2. Did you face any issues during registration or while accessing event information?{' '}
                <span className="text-brand-primary">*</span>
              </label>
              <input
                type="text"
                value={formData.q2_registration_issues}
                maxLength={100}
                onChange={e => handleChange('q2_registration_issues', e.target.value)}
                placeholder="e.g. No issues faced / Smooth process"
                className={`w-full px-4 py-3 bg-brand-surface border rounded-xl text-white font-mono text-xs outline-none transition-all placeholder:text-brand-muted/60 ${errors.q2_registration_issues
                    ? 'border-red-500 focus:border-red-400'
                    : 'border-brand-border focus:border-brand-primary'
                  }`}
              />
              <div className="flex justify-between items-center font-mono text-[11px] text-brand-muted">
                <span>Min 2, max 100 characters</span>
                <span>{formData.q2_registration_issues.length} / 100</span>
              </div>
              {errors.q2_registration_issues && (
                <p className="font-mono text-xs text-red-400 flex items-center gap-1.5 mt-1">
                  <AlertCircle size={13} className="shrink-0" />
                  {errors.q2_registration_issues}
                </p>
              )}
            </div>
          </section>

          {/* ── SECTION 2: PROBLEM STATEMENT, SCENARIOS, HINTS & CONSTRAINTS ── */}
          <section className="bg-brand-card/95 border border-brand-border p-6 sm:p-8 rounded-2xl shadow-xl backdrop-blur-xl space-y-6">
            <div className="border-b border-brand-border/60 pb-3">
              <span className="font-mono text-xs font-bold text-brand-primary tracking-widest uppercase">
                SECTION 2 OF 6
              </span>
              <h2 className="font-display font-black text-xl text-white tracking-wide mt-1">
                PROBLEM STATEMENT, SCENARIOS, HINTS & CONSTRAINTS
              </h2>
            </div>

            {/* Question 3 */}
            {renderRadioGroup(
              'q3_problem_statement_clarity',
              '3. How clear and understandable was the initial problem statement?',
              ['Very clear', 'Clear', 'Moderately clear', 'Confusing', 'Very confusing']
            )}

            {/* Question 4 */}
            {renderRadioGroup(
              'q4_scenarios_usefulness',
              '4. How relevant and useful were the scenarios in helping your team understand the problem?',
              ['Extremely useful', 'Useful', 'Neutral', 'Not very useful', 'Not applicable']
            )}

            {/* Question 5 */}
            {renderRadioGroup(
              'q5_hints_helpfulness',
              '5. How helpful were the hints released during the hackathon?',
              ['Very helpful', 'Helpful', 'Somewhat helpful', 'Not helpful', 'We did not use the hints']
            )}

            {/* Question 6 */}
            {renderRadioGroup(
              'q6_constraints_timing_clarity',
              '6. Were the constraints released at the appropriate time, and were their requirements clear?',
              [
                'Yes, both timing and clarity were good',
                'Clear, but released too early',
                'Clear, but released too late',
                'Timing was good, but instructions were unclear',
                'Both timing and clarity need improvement',
              ]
            )}

            {/* Question 7 */}
            {renderRadioGroup(
              'q7_adaptability_fairness',
              "7. Did the problem statement, scenarios, hints and constraints evolve in a way that tested your team's adaptability fairly?",
              ['Very fairly', 'Fairly', 'Neutral', 'Somewhat unfairly', 'Very unfairly']
            )}
          </section>

          {/* ── SECTION 3: EVALUATION & JUDGES ────────────────────────────── */}
          <section className="bg-brand-card/95 border border-brand-border p-6 sm:p-8 rounded-2xl shadow-xl backdrop-blur-xl space-y-6">
            <div className="border-b border-brand-border/60 pb-3">
              <span className="font-mono text-xs font-bold text-brand-primary tracking-widest uppercase">
                SECTION 3 OF 6
              </span>
              <h2 className="font-display font-black text-xl text-white tracking-wide mt-1">
                EVALUATION & JUDGES
              </h2>
            </div>

            {/* Question 8 */}
            {renderRadioGroup(
              'q8_first_evaluation_fairness',
              '8. How fair and transparent was the First Evaluation (elimination round)?',
              ['Very fair', 'Fair', 'Neutral', 'Unfair', 'Very unfair']
            )}

            {/* Question 9 */}
            {renderRadioGroup(
              'q9_final_evaluation_fairness',
              '9. How fair and useful was the Final Evaluation process for the shortlisted teams?',
              [
                'Very fair',
                'Fair',
                'Neutral',
                'Unfair',
                'Not applicable \u2014 our team did not reach the final',
              ]
            )}

            {/* Question 10 */}
            {renderRadioGroup(
              'q10_judges_technical_knowledge',
              "10. How would you rate the judges' technical understanding and domain knowledge?",
              ['Excellent', 'Good', 'Average', 'Poor', 'Very Poor']
            )}

            {/* Question 11 */}
            {renderRadioGroup(
              'q11_judges_fair_opportunity',
              '11. Did the judges provide sufficient time, clear questions and a fair opportunity to demonstrate your work?',
              ['Yes, completely', 'Mostly', 'Partially', 'No']
            )}

            {/* Question 12 */}
            {renderRadioGroup(
              'q12_evaluation_criteria_consistency',
              '12. Did you feel that the evaluation criteria were clear and applied consistently across teams?',
              ['Strongly agree', 'Agree', 'Neutral', 'Disagree', 'Strongly disagree']
            )}
          </section>

          {/* ── SECTION 4: EVALUATION PORTAL & TECHNICAL EXPERIENCE ───────── */}
          <section className="bg-brand-card/95 border border-brand-border p-6 sm:p-8 rounded-2xl shadow-xl backdrop-blur-xl space-y-6">
            <div className="border-b border-brand-border/60 pb-3">
              <span className="font-mono text-xs font-bold text-brand-primary tracking-widest uppercase">
                SECTION 4 OF 6
              </span>
              <h2 className="font-display font-black text-xl text-white tracking-wide mt-1">
                EVALUATION PORTAL & TECHNICAL EXPERIENCE
              </h2>
            </div>

            {/* Question 13 */}
            {renderRadioGroup(
              'q13_portal_experience',
              "13. How would you rate the evaluation portal's speed, reliability and ease of use?",
              ['Excellent', 'Good', 'Average', 'Poor', 'Very Poor']
            )}

            {/* Question 14 */}
            <div id="field-q14_portal_issues" className="space-y-2 pt-2">
              <label className="block text-sm font-semibold text-white tracking-wide">
                14. Did you encounter any portal issues? <span className="text-brand-primary">*</span>
              </label>
              <input
                type="text"
                value={formData.q14_portal_issues}
                maxLength={100}
                onChange={e => handleChange('q14_portal_issues', e.target.value)}
                placeholder='e.g. "No issues encountered." or details of issue'
                className={`w-full px-4 py-3 bg-brand-surface border rounded-xl text-white font-mono text-xs outline-none transition-all placeholder:text-brand-muted/60 ${errors.q14_portal_issues
                    ? 'border-red-500 focus:border-red-400'
                    : 'border-brand-border focus:border-brand-primary'
                  }`}
              />
              <div className="flex justify-between items-center font-mono text-[11px] text-brand-muted">
                <span>Min 2, max 100 characters</span>
                <span>{formData.q14_portal_issues.length} / 100</span>
              </div>
              {errors.q14_portal_issues && (
                <p className="font-mono text-xs text-red-400 flex items-center gap-1.5 mt-1">
                  <AlertCircle size={13} className="shrink-0" />
                  {errors.q14_portal_issues}
                </p>
              )}
            </div>
          </section>

          {/* ── SECTION 5: EVENT ORGANIZATION & FACILITIES ─────────────────── */}
          <section className="bg-brand-card/95 border border-brand-border p-6 sm:p-8 rounded-2xl shadow-xl backdrop-blur-xl space-y-6">
            <div className="border-b border-brand-border/60 pb-3">
              <span className="font-mono text-xs font-bold text-brand-primary tracking-widest uppercase">
                SECTION 5 OF 6
              </span>
              <h2 className="font-display font-black text-xl text-white tracking-wide mt-1">
                EVENT ORGANIZATION & FACILITIES
              </h2>
            </div>

            {/* Question 15 */}
            {renderRadioGroup(
              'q15_organizer_communication',
              "15. How would you rate the organizers' communication, coordination and responsiveness?",
              ['Excellent', 'Good', 'Average', 'Poor', 'Very Poor']
            )}

            {/* Question 16 */}
            {renderRadioGroup(
              'q16_food_and_refreshments',
              '16. How would you rate the food, refreshments and meal arrangements?',
              ['Excellent', 'Good', 'Average', 'Poor', 'Very Poor']
            )}

            {/* Question 17 */}
            {renderRadioGroup(
              'q17_venue_and_facilities',
              '17. How would you rate the venue, workspace, power supply, internet connectivity and overnight accommodation?',
              ['Excellent', 'Good', 'Average', 'Poor', 'Very Poor']
            )}
          </section>

          {/* ── SECTION 6: OVERALL EXPERIENCE & IMPROVEMENT ───────────────── */}
          <section className="bg-brand-card/95 border border-brand-border p-6 sm:p-8 rounded-2xl shadow-xl backdrop-blur-xl space-y-6">
            <div className="border-b border-brand-border/60 pb-3">
              <span className="font-mono text-xs font-bold text-brand-primary tracking-widest uppercase">
                SECTION 6 OF 6
              </span>
              <h2 className="font-display font-black text-xl text-white tracking-wide mt-1">
                OVERALL EXPERIENCE & IMPROVEMENT
              </h2>
            </div>

            {/* Question 18 */}
            <div id="field-q18_overall_feedback" className="space-y-2 pt-2">
              <label className="block text-sm font-semibold text-white tracking-wide">
                18. What was the most valuable part of Sakthi HackFest'26, and what are the top improvements you would recommend for the next edition?{' '}
                <span className="text-brand-primary">*</span>
              </label>
              <textarea
                rows={4}
                value={formData.q18_overall_feedback}
                maxLength={500}
                onChange={e => handleChange('q18_overall_feedback', e.target.value)}
                placeholder="Share your experience, highlights, and suggestions for future editions..."
                className={`w-full p-4 bg-brand-surface border rounded-xl text-white font-mono text-xs outline-none transition-all resize-y placeholder:text-brand-muted/60 ${errors.q18_overall_feedback
                    ? 'border-red-500 focus:border-red-400'
                    : 'border-brand-border focus:border-brand-primary'
                  }`}
              />
              <div className="flex justify-between items-center font-mono text-[11px] text-brand-muted">
                <span>Min 2, max 500 characters</span>
                <span className={formData.q18_overall_feedback.length >= 480 ? 'text-amber-400 font-semibold' : ''}>
                  {formData.q18_overall_feedback.length} / 500
                </span>
              </div>
              {errors.q18_overall_feedback && (
                <p className="font-mono text-xs text-red-400 flex items-center gap-1.5 mt-1">
                  <AlertCircle size={13} className="shrink-0" />
                  {errors.q18_overall_feedback}
                </p>
              )}
            </div>
          </section>

          {/* ── SUBMIT BUTTON & CONTROLS ─────────────────────────────────── */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Reset all entered responses?')) {
                  setFormData(INITIAL_FORM)
                  setErrors({})
                  setSubmitError(null)
                  window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
                }
              }}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-brand-surface hover:bg-brand-card border border-brand-border text-brand-muted hover:text-white font-mono text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RotateCcw size={14} /> Clear Form
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-10 py-4 rounded-xl bg-brand-primary hover:bg-brand-primary-hover disabled:bg-brand-primary/50 text-white font-display font-black text-sm tracking-wider uppercase transition-all shadow-glow-red flex items-center justify-center gap-3 cursor-pointer disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Submitting Feedback...</span>
                </>
              ) : (
                <>
                  <Send size={16} />
                  <span>Submit Feedback</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
