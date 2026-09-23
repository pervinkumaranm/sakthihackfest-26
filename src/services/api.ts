/**
 * SAKTHI HACKFEST'26 - Central API & Backend Service Layer
 *
 * Manages 3-Step Registration submission, Google Apps Script bridge,
 * Google Drive file uploads, email status tracking, and admin verification actions.
 */

import type { StoredRegistration, AdminStats, ApiResponse, EmailStatus } from '../types'
import * as XLSX from 'xlsx'

const GOOGLE_SCRIPT_URL =
  import.meta.env.VITE_GOOGLE_SCRIPT_URL ||
  import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL ||
  'https://script.google.com/macros/s/AKfycby1wwXdxr6hgymC-Xa8rVvJv0vsEe4UeLMG2O6A5bklfVCXpjHkAm3_5AjCDEckZF5e1g/exec'
const STORAGE_KEY = 'shf26_registrations_v3'

function getLocalRegistrations(): StoredRegistration[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) {
    console.error('Failed to parse registrations from localStorage:', e)
  }
  return []
}

function saveLocalRegistrations(list: StoredRegistration[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

function getFriendlyErrorMessage(errorCode?: string, rawMessage?: string): string {
  if (errorCode === 'NETWORK_ERROR') {
    return 'Unable to connect to the registration server. Please check your internet connection and try again.'
  }
  if (errorCode === 'PAYMENT_SCREENSHOT_TOO_LARGE' || errorCode === 'FILE_TOO_LARGE') {
    return 'The payment screenshot file size exceeds 5 MB. Please compress or crop the image and try again.'
  }
  if (errorCode === 'INVALID_PAYMENT_SCREENSHOT') {
    return 'Invalid screenshot image format. Only PNG, JPG, JPEG, and WEBP files are accepted.'
  }
  if (errorCode === 'DRIVE_UPLOAD_ERROR') {
    return 'Payment screenshot could not be saved to Google Drive. Please retry your submission.'
  }
  if (errorCode === 'SHEET_WRITE_ERROR') {
    return 'Failed to save registration details to the database. Please try again shortly.'
  }
  if (errorCode === 'DUPLICATE_REGISTRATION') {
    return 'A registration with this Team Name, Leader Email, or UPI Transaction ID already exists.'
  }
  if (errorCode === 'INVALID_DATA') {
    return 'Please check that all team, leader, member, and payment fields are filled in accurately.'
  }
  if (errorCode === 'EMAIL_FAILED') {
    return 'Registration was recorded, but confirmation email could not be delivered at this time.'
  }
  if (errorCode === 'GOOGLE_APPS_SCRIPT_ERROR') {
    return 'The registration server is temporarily busy. Please retry in a few moments.'
  }
  if (rawMessage && !rawMessage.includes('Exception') && !rawMessage.includes('at ') && !rawMessage.includes('Error:')) {
    return rawMessage
  }
  return 'Registration could not be completed. Please verify your details and try again.'
}

export const apiService = {
  /**
   * Submit Registration directly to Google Apps Script backend
   */
  async submitRegistration(
    payload: Omit<StoredRegistration, 'registrationId' | 'timestamp' | 'paymentStatus' | 'registrationStatus'>
  ): Promise<ApiResponse<StoredRegistration>> {
    const registrationPayload = {
      teamName: payload.teamName.trim(),
      teamSize: payload.teamSize,
      selectedTheme: payload.selectedThemeName || payload.selectedThemeId || 'Open Innovation',
      selectedDomain: payload.selectedDomain || '',
      accommodationRequired: payload.accommodationRequired === 'Yes' ? 'Yes' : 'No',
      teamLeader: {
        name: payload.leaderName.trim(),
        college: (payload.leaderCollege || '').trim(),
        department: payload.leaderDepartment.trim(),
        year: payload.leaderYear.trim(),
        whatsapp: payload.leaderWhatsapp.trim(),
        email: payload.leaderEmail.trim(),
      },
      members: payload.members.map(m => ({
        name: m.name.trim(),
        college: (m.college || '').trim(),
        department: m.department.trim(),
        year: m.yearOfStudy.trim(),
        whatsapp: m.whatsapp.trim(),
        email: m.email.trim(),
      })),
      upiTransactionId: payload.upiTransactionId.trim(),
      paymentScreenshotData: payload.paymentScreenshotData,
      paymentScreenshotName: payload.paymentScreenshotName || 'payment_screenshot.png',
    }

    if (!registrationPayload.paymentScreenshotData) {
      return {
        success: false,
        errorCode: 'INVALID_PAYMENT_SCREENSHOT',
        error: 'Payment screenshot is missing. Please upload the screenshot again.',
      }
    }

    if (!GOOGLE_SCRIPT_URL) {
      console.error('CRITICAL: GOOGLE_SCRIPT_URL is not configured.')
      return {
        success: false,
        errorCode: 'CONFIG_ERROR',
        error: 'Google Apps Script URL is not configured. Registration cannot proceed without a real backend.',
      }
    }

    console.log("Submitting registration to /api/register");

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "SUBMIT_REGISTRATION",
          data: registrationPayload,
        }),
      });

      const responseText = await response.text();

      console.log("API status:", response.status);
      console.log("API response:", responseText);

      let result: any;
      try {
        result = JSON.parse(responseText);
      } catch (error) {
        console.error("Invalid API response:", responseText);
        throw new Error(
          "Registration server returned an invalid response."
        );
      }

      if (!result.success) {
        throw new Error(
          result.message || "Registration could not be completed."
        );
      }

      // Backend returned success with Server-Generated Registration ID
      const serverId = result.registrationId || (result.data && result.data.registrationId);
      if (!serverId) {
        console.error("REGISTRATION ERROR: Backend returned success:true but missing registrationId:", result);
        throw new Error("Backend did not return a valid Registration ID. Please contact the organizers.");
      }

      const emailStatus: EmailStatus = result.emailStatus || 'PENDING';
      const driveUrl = result.data?.paymentScreenshotDriveUrl || result.driveFolderUrl || '';
      const driveId = result.data?.driveFileId || '';

      const verifiedRecord: StoredRegistration = {
        ...payload,
        registrationId: serverId,
        selectedDomain: result.data?.selectedDomain || payload.selectedDomain || '',
        leaderCollege: result.data?.leaderCollege || payload.leaderCollege || '',
        timestamp: result.data?.timestamp || new Date().toISOString(),
        paymentAmount: 1000,
        paymentScreenshotDriveUrl: driveUrl,
        driveFileId: driveId,
        paymentStatus: 'PENDING',
        registrationStatus: 'CONFIRMED',
        emailStatus: emailStatus,
        emailSentAt: emailStatus === 'SENT' ? new Date().toISOString() : undefined,
      };

      // Persist to local cache ONLY after real backend confirmed success
      const list = getLocalRegistrations().filter(r => r.registrationId !== serverId);
      list.unshift(verifiedRecord);
      saveLocalRegistrations(list);

      console.log("=== REGISTRATION SUCCESS ===", serverId);
      return {
        success: true,
        registrationId: serverId,
        emailStatus: emailStatus,
        paymentStatus: 'SUBMITTED',
        data: verifiedRecord,
      };
    } catch (err: any) {
      console.error("REGISTRATION ERROR:", err);
      return {
        success: false,
        errorCode: 'REGISTRATION_FAILED',
        error: err.message || 'Registration could not be completed. Please try again.',
      };
    }
  },

  /**
   * Resend Confirmation Email via Google Apps Script (Admin)
   */
  async resendConfirmationEmail(registrationId: string): Promise<ApiResponse> {
    if (!GOOGLE_SCRIPT_URL) {
      return { success: false, error: 'Google Script URL not configured.' }
    }

    try {
      const res = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'RETRY_EMAIL',
          registrationId,
        }),
      })

      const result = await res.json()

      if (result.success) {
        // Update local copy
        const list = getLocalRegistrations()
        const idx = list.findIndex(r => r.registrationId === registrationId)
        if (idx !== -1) {
          list[idx].emailStatus = 'SENT'
          list[idx].emailSentAt = new Date().toISOString()
          saveLocalRegistrations(list)
        }
      }

      return result
    } catch (err) {
      return {
        success: false,
        error: 'Network error resending email: ' + String(err),
      }
    }
  },

  /**
   * Fetch all registrations (Admin)
   */
  async getRegistrations(): Promise<StoredRegistration[]> {
    if (GOOGLE_SCRIPT_URL) {
      try {
        const res = await fetch(`${GOOGLE_SCRIPT_URL}?action=GET_REGISTRATIONS`)
        const result = await res.json()
        if (result.success && Array.isArray(result.data) && result.data.length > 0) {
          // Normalize row keys from 34-column sheet
          const normalized: StoredRegistration[] = result.data.map((row: Record<string, unknown>) => {
            const teamSize = parseInt(String(row['Team Size'] || '3'), 10) || 3
            const members = []

            const m2College = String(row['Member 2 College Name'] || '')
            const m3College = String(row['Member 3 College Name'] || '')
            const m4College = String(row['Member 4 College Name'] || '')

            if (row['Member 2 Name']) {
              members.push({
                name: String(row['Member 2 Name'] || ''),
                college: m2College,
                department: String(row['Member 2 Department'] || ''),
                yearOfStudy: String(row['Member 2 Year'] || ''),
                whatsapp: String(row['Member 2 WhatsApp'] || ''),
                email: String(row['Member 2 Email'] || ''),
              })
            }
            if (row['Member 3 Name'] && teamSize >= 3) {
              members.push({
                name: String(row['Member 3 Name'] || ''),
                college: m3College,
                department: String(row['Member 3 Department'] || ''),
                yearOfStudy: String(row['Member 3 Year'] || ''),
                whatsapp: String(row['Member 3 WhatsApp'] || ''),
                email: String(row['Member 3 Email'] || ''),
              })
            }
            if (row['Member 4 Name'] && teamSize >= 4) {
              members.push({
                name: String(row['Member 4 Name'] || ''),
                college: m4College,
                department: String(row['Member 4 Department'] || ''),
                yearOfStudy: String(row['Member 4 Year'] || ''),
                whatsapp: String(row['Member 4 WhatsApp'] || ''),
                email: String(row['Member 4 Email'] || ''),
              })
            }

            return {
              registrationId: String(row['Registration ID'] || ''),
              timestamp: String(row['Timestamp'] || new Date().toISOString()),
              teamName: String(row['Team Name'] || ''),
              teamSize: teamSize,
              accommodationRequired: (String(row['Accommodation Required'] || '') as any) || 'No',
              selectedDomain: String(row['Selected Domain'] || ''),
              selectedThemeName: String(row['Selected Theme'] || 'General Track'),
              leaderName: String(row['Team Leader Name'] || ''),
              leaderCollege: String(row['Leader College Name'] || ''),
              leaderDepartment: String(row['Team Leader Department'] || ''),
              leaderYear: String(row['Team Leader Year'] || ''),
              leaderWhatsapp: String(row['Team Leader WhatsApp'] || ''),
              leaderEmail: String(row['Team Leader Email'] || ''),
              members: members,
              paymentAmount: parseInt(String(row['Payment Amount'] || '1000'), 10) || 1000,
              upiTransactionId: String(row['UPI Transaction ID'] || ''),
              paymentScreenshotDriveUrl: String(row['Payment Screenshot URL'] || ''),
              driveFileId: String(row['Google Drive File ID'] || ''),
              paymentStatus: (String(row['Payment Status'] || 'PENDING') as any),
              registrationStatus: (String(row['Registration Status'] || 'CONFIRMED') as any),
              emailStatus: (String(row['Email Status'] || 'PENDING') as any),
              emailSentAt: row['Email Sent At'] ? String(row['Email Sent At']) : undefined,
              lastUpdated: row['Last Updated'] ? String(row['Last Updated']) : undefined,
            }
          })

          saveLocalRegistrations(normalized)
          return normalized
        }
      } catch (err) {
        console.warn('Google Script fetch failed, using local cache:', err)
      }
    }
    return getLocalRegistrations()
  },

  /**
   * Update Payment Verification & Status (Admin)
   */
  async updatePaymentStatus(
    registrationId: string,
    paymentStatus: 'VERIFIED' | 'PENDING' | 'REJECTED',
    notes?: string
  ): Promise<ApiResponse<StoredRegistration>> {
    const list = getLocalRegistrations()
    const idx = list.findIndex(r => r.registrationId === registrationId)
    if (idx === -1) return { success: false, error: 'Registration not found' }

    list[idx].paymentStatus = paymentStatus
    list[idx].registrationStatus =
      paymentStatus === 'VERIFIED' ? 'CONFIRMED' : paymentStatus === 'REJECTED' ? 'REJECTED' : 'PENDING'
    if (notes !== undefined) list[idx].verificationNotes = notes

    saveLocalRegistrations(list)

    if (GOOGLE_SCRIPT_URL) {
      try {
        await fetch(GOOGLE_SCRIPT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'UPDATE_STATUS',
            registrationId,
            paymentStatus,
            registrationStatus: list[idx].registrationStatus,
            notes,
          }),
        })
      } catch (err) {
        console.warn('Google Script update failed:', err)
      }
    }

    return { success: true, data: list[idx] }
  },

  /**
   * Calculate Admin Dashboard Statistics
   */
  async getAdminStats(): Promise<AdminStats> {
    const list = await this.getRegistrations()

    const totalRegistrations = list.length
    const totalTeams = list.length
    const totalParticipants = list.reduce((sum, r) => sum + (r.teamSize || 2), 0)

    const paymentSubmitted = list.filter(r => Boolean(r.upiTransactionId)).length
    const paymentPending = list.filter(r => r.paymentStatus === 'PENDING').length
    const verifiedCount = list.filter(r => r.paymentStatus === 'VERIFIED').length
    const rejectedCount = list.filter(r => r.paymentStatus === 'REJECTED').length

    const emailSentCount = list.filter(r => r.emailStatus === 'SENT').length
    const emailFailedCount = list.filter(r => r.emailStatus === 'FAILED').length

    // Daily trends
    const trendMap: Record<string, number> = {}
    list.forEach(r => {
      const date = r.timestamp?.split('T')[0] || r.timestamp?.split(' ')[0] || 'Unknown'
      trendMap[date] = (trendMap[date] || 0) + 1
    })

    const dailyTrends = Object.entries(trendMap).map(([date, count]) => ({
      date,
      count,
    }))

    return {
      totalRegistrations,
      totalTeams,
      totalParticipants,
      paymentSubmitted,
      paymentPending,
      verifiedCount,
      rejectedCount,
      emailSentCount,
      emailFailedCount,
      dailyTrends,
    }
  },

  /**
   * Export Registrations to Excel Spreadsheet
   */
  exportToSpreadsheet(registrations: StoredRegistration[], format: 'xlsx' | 'csv' = 'xlsx') {
    const flatData = registrations.map(r => ({
      'Registration ID': r.registrationId,
      'Timestamp': r.timestamp,
      'Team Name': r.teamName,
      'Team Size': r.teamSize,
      'Accommodation Required': r.accommodationRequired || 'No',
      'Selected Domain': r.selectedDomain || '',
      'Selected Theme': r.selectedThemeName || 'General Track',
      'Team Leader Name': r.leaderName,
      'Leader College Name': r.leaderCollege || '',
      'Team Leader Department': r.leaderDepartment,
      'Team Leader Year': r.leaderYear,
      'Team Leader WhatsApp': r.leaderWhatsapp,
      'Team Leader Email': r.leaderEmail,
      'Member 2 Name': r.members[0]?.name || '',
      'Member 2 College Name': r.members[0]?.college || '',
      'Member 2 Department': r.members[0]?.department || '',
      'Member 2 Year': r.members[0]?.yearOfStudy || '',
      'Member 2 WhatsApp': r.members[0]?.whatsapp || '',
      'Member 2 Email': r.members[0]?.email || '',
      'Member 3 Name': r.members[1]?.name || '',
      'Member 3 College Name': r.members[1]?.college || '',
      'Member 3 Department': r.members[1]?.department || '',
      'Member 3 Year': r.members[1]?.yearOfStudy || '',
      'Member 3 WhatsApp': r.members[1]?.whatsapp || '',
      'Member 3 Email': r.members[1]?.email || '',
      'Member 4 Name': r.members[2]?.name || '',
      'Member 4 College Name': r.members[2]?.college || '',
      'Member 4 Department': r.members[2]?.department || '',
      'Member 4 Year': r.members[2]?.yearOfStudy || '',
      'Member 4 WhatsApp': r.members[2]?.whatsapp || '',
      'Member 4 Email': r.members[2]?.email || '',
      'Payment Amount': r.paymentAmount,
      'UPI Transaction ID': r.upiTransactionId,
      'Payment Screenshot URL': r.paymentScreenshotDriveUrl || '',
      'Google Drive File ID': r.driveFileId || '',
      'Payment Status': r.paymentStatus,
      'Registration Status': r.registrationStatus,
      'Email Status': r.emailStatus || 'PENDING',
      'Email Sent At': r.emailSentAt || '',
      'Last Updated': r.lastUpdated || '',
    }))

    const worksheet = XLSX.utils.json_to_sheet(flatData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Registrations')

    const filename = `SAKTHI_HACKFEST_2K26_REGISTRATIONS_${new Date().toISOString().split('T')[0]}.${format}`
    XLSX.writeFile(workbook, filename)
  },
}
