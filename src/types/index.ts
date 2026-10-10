/**
 * SAKTHI HACKFEST 2K26 - Central TypeScript Definitions
 */

export const TYPES_VERSION = '2.2.0'

export type PaymentStatus = 'PENDING' | 'VERIFIED' | 'REJECTED'
export type RegistrationStatus = 'CONFIRMED' | 'PENDING' | 'VERIFIED' | 'REJECTED'
export type EmailStatus = 'PENDING' | 'SENT' | 'FAILED'

export interface MemberInfo {
  name: string
  college?: string
  department: string
  yearOfStudy: string
  whatsapp: string
  email: string
}

export interface StoredRegistration {
  registrationId: string
  timestamp: string
  createdAt?: string

  // Team Info
  teamName: string
  teamSize: number
  accommodationRequired?: 'Yes' | 'No'
  selectedDomain?: string

  // Leader
  leaderName: string
  leaderCollege?: string
  leaderDepartment: string
  leaderYear: string
  leaderWhatsapp: string
  leaderEmail: string
  college?: string
  selectedTheme?: string
  selectedThemeName?: string
  selectedThemeId?: string

  // Dynamic additional members (Member 2, 3, 4)
  members: MemberInfo[]

  // Payment & Verification
  paymentAmount: number
  paymentScreenshotName?: string
  paymentScreenshotData?: string
  paymentScreenshotDriveUrl?: string
  driveFileId?: string
  upiTransactionId: string
  paymentStatus: PaymentStatus
  registrationStatus: RegistrationStatus
  verificationNotes?: string

  // Email Automation Status
  emailStatus?: EmailStatus
  emailSentAt?: string
  lastUpdated?: string
}

export interface AdminStats {
  totalRegistrations: number
  totalTeams: number
  totalParticipants: number
  paymentSubmitted: number
  paymentPending: number
  verifiedCount: number
  rejectedCount: number
  accommodationCount?: number
  emailSentCount: number
  emailFailedCount: number
  dailyTrends: { date: string; count: number }[]
}

export interface ApiResponse<T = unknown> {
  success: boolean
  message?: string
  stage?: string
  registrationId?: string
  accommodationId?: string
  emailStatus?: EmailStatus
  paymentStatus?: string
  errorCode?: string
  isDuplicate?: boolean
  data?: T
  error?: string
}

export type AccommodationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED'

export interface StoredAccommodation {
  accommodationId: string
  timestamp: string
  teamName: string
  teamCode: string
  registeredTeamSize: number
  selectedMembers: string[]
  memberCount: number
  numberOfMembers?: number
  ratePerMember: number
  totalAmount: number
  upiTransactionId: string
  paymentScreenshotDriveUrl?: string
  driveFileId?: string
  paymentScreenshotData?: string
  paymentScreenshotName?: string
  teamLeaderName?: string
  teamLeaderEmail: string
  emailStatus: EmailStatus
  accommodationStatus: AccommodationStatus
  rejectionReason?: string
  lastUpdated?: string
}

export interface AppSettings {
  registrationOpen: boolean
  accommodationOpen: boolean
  lastUpdated?: string
  updatedBy?: string
}

export interface ParticipantFeedbackPayload {
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

export interface StoredParticipantFeedback extends ParticipantFeedbackPayload {
  id: string
  created_at: string
}

