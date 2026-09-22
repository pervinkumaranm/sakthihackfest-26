/**
 * SAKTHI HACKFEST 2K26 - Central TypeScript Definitions
 */

export const TYPES_VERSION = '2.2.0'

export type PaymentStatus = 'PENDING' | 'VERIFIED' | 'REJECTED'
export type RegistrationStatus = 'CONFIRMED' | 'PENDING' | 'VERIFIED' | 'REJECTED'
export type EmailStatus = 'PENDING' | 'SENT' | 'FAILED'

export interface MemberInfo {
  name: string
  department: string
  yearOfStudy: string
  whatsapp: string
  email: string
  college?: string
}

export interface StoredRegistration {
  registrationId: string
  timestamp: string
  createdAt?: string

  // Team Info
  teamName: string
  teamSize: number

  // Leader
  leaderName: string
  leaderDepartment: string
  leaderYear: string
  leaderWhatsapp: string
  leaderEmail: string
  leaderCollege?: string
  college?: string
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
  emailSentCount: number
  emailFailedCount: number
  dailyTrends: { date: string; count: number }[]
}

export interface ApiResponse<T = unknown> {
  success: boolean
  message?: string
  registrationId?: string
  emailStatus?: EmailStatus
  paymentStatus?: string
  errorCode?: string
  isDuplicate?: boolean
  data?: T
  error?: string
}
