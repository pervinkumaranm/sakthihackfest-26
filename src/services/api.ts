/**
 * SAKTHI HACKFEST'26 - Central API & Backend Service Layer
 *
 * Manages 3-Step Registration submission, Google APIs (Sheets, Drive, Gmail),
 * email status tracking, and admin verification actions.
 */

import type { StoredRegistration, AdminStats, ApiResponse, EmailStatus, StoredAccommodation, AppSettings, AccommodationStatus } from '../types'
import * as XLSX from 'xlsx'
import { IS_REGISTRATION_CLOSED } from '../../config/event'

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
  try {
    // Strip large base64 screenshot data from localStorage to prevent 5MB browser quota errors
    const sanitizedList = list.map(item => {
      const copy = { ...item }
      if (copy.paymentScreenshotData && copy.paymentScreenshotData.length > 500) {
        copy.paymentScreenshotData = ''
      }
      return copy
    })
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitizedList))
  } catch (e) {
    console.warn('LocalStorage save failed, attempting cleanup:', e)
    try {
      // Gracefully store only recent 5 registrations without images
      const trimmed = list.slice(0, 5).map(item => ({ ...item, paymentScreenshotData: '' }))
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
    } catch {
      // Ignore if browser storage is totally full
    }
  }
}

const DEFAULT_GAS_URL =
  'https://script.google.com/macros/s/AKfycbwWpkK52_Rls-mkeYIwad3hVbUDDTBP6PSWonTlF0r_xHMvjhbCxwXFXgRFp-AN-1-U/exec'

export function normalizeGasRegistration(raw: Record<string, any>): StoredRegistration {
  const norm = (s: string) => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '')
  const getVal = (...keys: string[]) => {
    for (const key of keys) {
      if (raw[key] !== undefined && raw[key] !== null && String(raw[key]).trim() !== '') {
        return String(raw[key]).trim()
      }
      const target = norm(key)
      for (const k of Object.keys(raw)) {
        if (norm(k) === target && raw[k] !== undefined && raw[k] !== null && String(raw[k]).trim() !== '') {
          return String(raw[k]).trim()
        }
      }
    }
    return ''
  }

  const teamSize = parseInt(getVal('Team Size', 'teamsize'), 10) || 2
  const members: any[] = []
  for (let m = 2; m <= 4; m++) {
    const mName = getVal(`Member ${m} Name`, `member${m}name`)
    if (mName) {
      members.push({
        name: mName,
        college: getVal(`Member ${m} College Name`, `Member ${m} College`, `member${m}college`, `member${m}collegename`),
        department: getVal(`Member ${m} Department`, `member${m}department`, `member${m}dept`),
        yearOfStudy: getVal(`Member ${m} Year`, `member${m}year`),
        whatsapp: getVal(`Member ${m} WhatsApp`, `member${m}whatsapp`),
        email: getVal(`Member ${m} Email`, `member${m}email`),
      })
    }
  }

  const rawPaymentStatus = getVal('Payment Status', 'paymentstatus').toUpperCase() || 'PENDING'
  const paymentStatus = ['VERIFIED', 'REJECTED', 'PENDING', 'SUBMITTED'].includes(rawPaymentStatus)
    ? (rawPaymentStatus as any)
    : 'PENDING'

  const rawRegStatus = getVal('Registration Status', 'registrationstatus').toUpperCase() || 'CONFIRMED'
  const registrationStatus = ['CONFIRMED', 'VERIFIED', 'REJECTED', 'PENDING'].includes(rawRegStatus)
    ? (rawRegStatus as any)
    : 'CONFIRMED'

  const rawEmailStatus = getVal('Email Status', 'emailstatus').toUpperCase() || 'PENDING'
  const emailStatus = ['SENT', 'FAILED', 'PENDING'].includes(rawEmailStatus)
    ? (rawEmailStatus as any)
    : 'PENDING'

  const regId = getVal('Registration ID', 'registrationid')

  return {
    registrationId: regId,
    timestamp: getVal('Timestamp', 'timestamp') || new Date().toISOString(),
    teamName: getVal('Team Name', 'teamname'),
    teamSize,
    selectedDomain: getVal('Selected Domain', 'selecteddomain') || 'Generative AI',
    selectedTheme: getVal('Selected Theme', 'selectedtheme') || 'General Track',
    selectedThemeName: getVal('Selected Theme', 'selectedtheme') || 'General Track',
    accommodationRequired: (getVal('Accommodation Required', 'accommodationrequired') === 'Yes' ? 'Yes' : 'No') as 'Yes' | 'No',
    leaderName: getVal('Team Leader Name', 'teamleadername', 'leadername'),
    leaderCollege: getVal('Team Leader College Name', 'Team Leader College', 'Leader College Name', 'leadercollege', 'teamleadercollege', 'collegename', 'college'),
    leaderDepartment: getVal('Team Leader Department', 'teamleaderdepartment', 'leaderdepartment', 'leaderdept'),
    leaderYear: getVal('Team Leader Year', 'teamleaderyear', 'leaderyear'),
    leaderWhatsapp: getVal('Team Leader WhatsApp', 'teamleaderwhatsapp', 'leaderwhatsapp', 'phone'),
    leaderEmail: getVal('Team Leader Email', 'teamleaderemail', 'leaderemail'),
    members,
    paymentAmount: parseInt(getVal('Payment Amount', 'paymentamount'), 10) || 1000,
    upiTransactionId: getVal('UPI Transaction ID', 'upitransactionid'),
    paymentScreenshotDriveUrl: getVal('Payment Screenshot URL', 'paymentscreenshoturl'),
    driveFileId: getVal('Google Drive File ID', 'googledrivefileid'),
    paymentStatus,
    registrationStatus,
    emailStatus,
    emailSentAt: getVal('Email Sent At', 'emailsentat'),
    lastUpdated: getVal('Last Updated', 'lastupdated') || getVal('Timestamp', 'timestamp'),
  }
}

function getFriendlyErrorMessage(errorCode?: string, rawMessage?: string): string {
  if (
    errorCode === 'REGISTRATION_CLOSED' ||
    rawMessage?.includes('limit of 60') ||
    rawMessage?.includes('Registration Closed')
  ) {
    return 'Registration Closed — The maximum registration limit of 60 teams has been reached.'
  }
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
  if (rawMessage && !rawMessage.includes('Exception') && !rawMessage.includes('at ') && !rawMessage.includes('Error:')) {
    return rawMessage
  }
  return 'Registration could not be completed. Please verify your details and try again.'
}

export const apiService = {
  /**
   * Submit Registration to Vercel Serverless Function (/api/register)
   * Connects server-side to Google Sheets API, Google Drive API, and Gmail API.
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

    console.log("Submitting registration to /api/register");

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
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
        const isClosed =
          result.errorCode === 'REGISTRATION_CLOSED' ||
          result.message?.includes('60') ||
          result.message?.includes('Registration Closed')
        return {
          success: false,
          errorCode: (isClosed && IS_REGISTRATION_CLOSED) ? 'REGISTRATION_CLOSED' : (result.errorCode || 'REGISTRATION_FAILED'),
          error: (isClosed && IS_REGISTRATION_CLOSED)
            ? 'Registration Closed — The maximum registration limit of 60 teams has been reached.'
            : getFriendlyErrorMessage(result.errorCode, result.message),
        }
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
      const isClosed =
        err?.message?.includes('60') ||
        err?.message?.includes('Registration Closed');
      return {
        success: false,
        errorCode: isClosed ? 'REGISTRATION_CLOSED' : 'REGISTRATION_FAILED',
        error: isClosed
          ? 'Registration Closed — The maximum registration limit of 60 teams has been reached.'
          : err.message || 'Registration could not be completed. Please try again.',
      };
    }
  },

  /**
   * Check Live Registration Status & Limit
   */
  async getRegistrationStatus(): Promise<{
    success: boolean
    count: number
    limit: number
    isRegistrationClosed: boolean
    message?: string
  }> {
    try {
      const res = await fetch('/api/register?action=GET_COUNT')
      if (res.ok) {
        const data = await res.json()
        if (data && typeof data.count === 'number') {
          return {
            success: true,
            count: data.count,
            limit: data.limit || 60,
            isRegistrationClosed: IS_REGISTRATION_CLOSED,
            message: data.message,
          }
        }
      }
    } catch (err) {
      console.warn('Could not query /api/register count:', err)
    }

    // Direct Apps Script query fallback
    try {
      const gasUrl = `${DEFAULT_GAS_URL}?action=GET_COUNT`
      const res = await fetch(gasUrl)
      if (res.ok) {
        const data = await res.json()
        if (data && typeof data.count === 'number') {
          return {
            success: true,
            count: data.count,
            limit: data.limit || 60,
            isRegistrationClosed: IS_REGISTRATION_CLOSED,
            message: data.message,
          }
        }
      }
    } catch (_) {}

    return {
      success: false,
      count: 0,
      limit: 60,
      isRegistrationClosed: IS_REGISTRATION_CLOSED,
    }
  },

  // ── Admin Authentication & Session Management ──────────────────────────────

  async adminLogin(username: string, password: string): Promise<ApiResponse<{ token: string; user: any }>> {
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', username, password }),
      })
      const data = await res.json()
      if (res.ok && data.success && data.token) {
        sessionStorage.setItem('shf26_admin_token', data.token)
        sessionStorage.setItem('shf26_admin_user', data.user?.username || username)
        return { success: true, data: { token: data.token, user: data.user } }
      }
      return { success: false, error: data.error || 'Invalid administrator credentials.' }
    } catch (err: any) {
      console.error('Admin login error:', err)
      return { success: false, error: 'Authentication failed. Please check network connection.' }
    }
  },

  adminLogout() {
    sessionStorage.removeItem('shf26_admin_token')
    sessionStorage.removeItem('shf26_admin_user')
  },

  isAdminAuthenticated(): boolean {
    return Boolean(sessionStorage.getItem('shf26_admin_token'))
  },

  getAdminUser(): string | null {
    return sessionStorage.getItem('shf26_admin_user')
  },

  getAdminToken(): string | null {
    return sessionStorage.getItem('shf26_admin_token')
  },

  /**
   * Resend Confirmation Email (Admin)
   */
  async resendConfirmationEmail(registrationId: string): Promise<ApiResponse> {
    const token = this.getAdminToken()
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`,
        },
        body: JSON.stringify({ action: 'resend_email', registrationId }),
      })
      const data = await res.json()
      return data
    } catch {
      return { success: false, error: 'Network error occurred while resending email.' }
    }
  },

  /**
   * Fetch all registrations from real Google Sheet (Admin)
   */
  async getRegistrations(): Promise<{ registrations: StoredRegistration[]; stats?: AdminStats; error?: string }> {
    const token = this.getAdminToken()
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`,
        },
        body: JSON.stringify({ action: 'get_registrations' }),
      })
      const result = await res.json()
      if (res.ok && result.success && Array.isArray(result.data)) {
        return {
          registrations: result.data || [],
          stats: result.stats,
        }
      }
    } catch (err) {
      console.warn('Failed to fetch registrations from /api/admin, falling back to Apps Script Web App:', err)
    }

    // Direct Google Apps Script fallback
    try {
      const gasRes = await fetch(`${DEFAULT_GAS_URL}?action=GET_REGISTRATIONS`)
      if (gasRes.ok) {
        const gasJson = await gasRes.json()
        if (gasJson && gasJson.success && Array.isArray(gasJson.data)) {
          const registrations = gasJson.data
            .map((item: any) => normalizeGasRegistration(item))
            .filter((r: any) => Boolean(r.registrationId))

          return {
            registrations,
          }
        }
      }
    } catch (gasErr) {
      console.error('Direct Google Apps Script fallback error:', gasErr)
    }

    return {
      registrations: [],
      error: 'Unable to load registration data. Please try again.',
    }
  },

  /**
   * Fetch a single confirmed registration by its Registration ID
   * Checks local cache -> queries /api/register -> falls back to Apps Script Web App
   */
  async getRegistrationById(id: string): Promise<StoredRegistration | null> {
    const cleanId = String(id || '').trim().toUpperCase()
    if (!cleanId) return null

    // 1. Check local cache
    const local = getLocalRegistrations()
    const foundLocal = local.find(r => r.registrationId === cleanId)
    if (foundLocal && foundLocal.teamName) {
      return foundLocal
    }

    // 2. Query /api/register?action=GET_REGISTRATION
    try {
      const res = await fetch(`/api/register?action=GET_REGISTRATION&id=${encodeURIComponent(cleanId)}`)
      if (res.ok) {
        const data = await res.json()
        if (data && data.success && data.data) {
          const record = data.data as StoredRegistration
          const updatedList = getLocalRegistrations().filter(r => r.registrationId !== cleanId)
          updatedList.unshift(record)
          saveLocalRegistrations(updatedList)
          return record
        }
      }
    } catch (e) {
      console.warn('Failed to fetch registration by ID from /api/register:', e)
    }

    // 3. Fallback direct to Google Apps Script Web App
    try {
      const res = await fetch(`${DEFAULT_GAS_URL}?action=GET_REGISTRATIONS`)
      if (res.ok) {
        const json = await res.json()
        if (json && json.success && Array.isArray(json.data)) {
          const match = json.data.find((item: any) => {
            const rawId = String(item['Registration ID'] || item.registrationId || item.registrationid || '').trim().toUpperCase()
            return rawId === cleanId
          })
          if (match) {
            const record = normalizeGasRegistration(match)
            const updatedList = getLocalRegistrations().filter(r => r.registrationId !== cleanId)
            updatedList.unshift(record)
            saveLocalRegistrations(updatedList)
            return record
          }
        }
      }
    } catch (e) {
      console.warn('Failed direct Apps Script lookup for registration ID:', e)
    }

    return null
  },

  /**
   * Update Existing Registration Details (Admin)
   */
  async updateRegistration(
    registrationId: string,
    updates: Partial<StoredRegistration>
  ): Promise<ApiResponse<StoredRegistration>> {
    const token = this.getAdminToken()
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`,
        },
        body: JSON.stringify({
          action: 'update_registration',
          registrationId,
          updates,
        }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        return { success: true, data: data.data, message: data.message }
      }
      return { success: false, error: data.error || 'Unable to update this registration. Please try again.' }
    } catch (err) {
      console.error('Update registration error:', err)
      return { success: false, error: 'Unable to update this registration. Please try again.' }
    }
  },

  /**
   * Update Payment Verification & Status (Admin)
   */
  async updatePaymentStatus(
    registrationId: string,
    paymentStatus: 'VERIFIED' | 'PENDING' | 'REJECTED',
    notes?: string
  ): Promise<ApiResponse<StoredRegistration>> {
    const token = this.getAdminToken()
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`,
        },
        body: JSON.stringify({
          action: 'verify_payment',
          registrationId,
          paymentStatus,
          rejectionReason: notes,
        }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        return { success: true, data: data.data, message: data.message }
      }
      return { success: false, error: data.error || 'Unable to update payment status. Please try again.' }
    } catch (err) {
      console.error('Payment status error:', err)
      return { success: false, error: 'Unable to update payment status. Please try again.' }
    }
  },

  /**
   * Delete Registration from real Google Sheet (Admin)
   */
  async deleteRegistration(registrationId: string): Promise<ApiResponse> {
    const token = this.getAdminToken()
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`,
        },
        body: JSON.stringify({
          action: 'delete_registration',
          registrationId,
        }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        return { success: true, message: data.message }
      }
      return { success: false, error: data.error || 'Unable to delete this registration. Please try again.' }
    } catch (err) {
      console.error('Delete registration error:', err)
      return { success: false, error: 'Unable to delete this registration. Please try again.' }
    }
  },

  /**
   * Calculate Admin Dashboard Statistics
   */
  async getAdminStats(): Promise<AdminStats> {
    const res = await this.getRegistrations()
    if (res.stats) {
      return res.stats
    }
    const list = res.registrations

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
   * Export Registrations to Excel or CSV Spreadsheet
   */
  exportToSpreadsheet(registrations: StoredRegistration[], format: 'xlsx' | 'csv' = 'xlsx') {
    const flatData = registrations.map(r => ({
      'Registration ID': r.registrationId,
      'Timestamp': r.timestamp,
      'Team Name': r.teamName,
      'Team Size': r.teamSize,
      'Accommodation Required': r.accommodationRequired || 'No',
      'Selected Domain': r.selectedDomain || '',
      'Selected Theme': r.selectedThemeName || r.selectedTheme || 'Open Innovation',
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

    const dateStr = new Date().toISOString().split('T')[0]
    const filename = `SAKTHI_HACKFEST_2K26_REGISTRATIONS_${dateStr}.${format}`

    if (format === 'csv') {
      const csvOutput = XLSX.utils.sheet_to_csv(worksheet)
      const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else {
      XLSX.writeFile(workbook, filename)
    }
  },

  // ── Accommodation System ──────────────────────────────────────────────────
  async getRegisteredTeamsForAccommodation(): Promise<Array<{
    teamCode: string
    teamName: string
  }>> {
    try {
      const res = await fetch('/api/accommodation?action=GET_TEAMS')
      if (res.ok) {
        const json = await res.json()
        if (json.success && Array.isArray(json.data)) {
          return json.data.map((t: any) => ({
            teamCode: t.teamCode || t.registrationId,
            teamName: t.teamName,
          }))
        }
      }
    } catch (e) {
      console.warn('Failed to fetch teams from /api/accommodation:', e)
    }

    // Direct Apps Script query fallback
    try {
      const res = await fetch(`${DEFAULT_GAS_URL}?action=GET_REGISTRATIONS`)
      if (res.ok) {
        const json = await res.json()
        if (json.success && Array.isArray(json.data)) {
          return json.data.map((item: any) => {
            const reg = normalizeGasRegistration(item)
            return {
              teamCode: reg.registrationId,
              teamName: reg.teamName,
            }
          }).filter((t: any) => Boolean(t.teamCode && t.teamName))
        }
      }
    } catch (_) {}

    return []
  },

  async getTeamMembersForAccommodation(teamCode: string): Promise<{ teamCode: string; teamName: string; members: string[] } | null> {
    try {
      const res = await fetch(`/api/accommodation?action=GET_TEAM_MEMBERS&teamCode=${encodeURIComponent(teamCode)}`)
      if (res.ok) {
        const json = await res.json()
        if (json.success && Array.isArray(json.members)) {
          return {
            teamCode: json.teamCode,
            teamName: json.teamName,
            members: json.members,
          }
        }
      }
    } catch (e) {
      console.warn('Failed to fetch team members from /api/accommodation:', e)
    }

    // Direct Apps Script fallback
    try {
      const res = await fetch(`${DEFAULT_GAS_URL}?action=GET_REGISTRATIONS`)
      if (res.ok) {
        const json = await res.json()
        if (json.success && Array.isArray(json.data)) {
          const item = json.data.find((raw: any) => {
            const reg = normalizeGasRegistration(raw)
            return (reg.registrationId || '').toUpperCase() === teamCode.toUpperCase()
          })
          if (item) {
            const reg = normalizeGasRegistration(item)
            const members: string[] = []
            if (reg.leaderName) members.push(reg.leaderName)
            if (reg.members) {
              reg.members.forEach(m => {
                if (m.name && !members.includes(m.name)) members.push(m.name)
              })
            }
            return {
              teamCode: reg.registrationId,
              teamName: reg.teamName,
              members,
            }
          }
        }
      }
    } catch (_) {}

    return null
  },

  async submitAccommodation(data: {
    teamCode: string
    teamName: string
    selectedMembers: string[]
    upiTransactionId: string
    paymentScreenshotData: string
    paymentScreenshotName?: string
  }): Promise<ApiResponse> {
    try {
      const res = await fetch('/api/accommodation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SUBMIT_ACCOMMODATION',
          data: {
            ...data,
            paymentScreenshotBase64: data.paymentScreenshotData,
          },
        }),
      })
      const result = await res.json()
      return result
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Failed to submit accommodation request.',
      }
    }
  },

  async getAccommodations(): Promise<StoredAccommodation[]> {
    const token = localStorage.getItem('shf26_admin_token') || sessionStorage.getItem('shf26_admin_token')
    try {
      const res = await fetch('/api/accommodation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'GET_ACCOMMODATIONS' }),
      })
      if (res.ok) {
        const json = await res.json()
        if (json.success && Array.isArray(json.data)) {
          return json.data
        }
      }
    } catch (e) {
      console.warn('Failed to fetch accommodations:', e)
    }
    return []
  },

  async updateAccommodationStatus(accommodationId: string, status: AccommodationStatus, reason?: string): Promise<ApiResponse> {
    const token = localStorage.getItem('shf26_admin_token') || sessionStorage.getItem('shf26_admin_token')
    try {
      const res = await fetch('/api/accommodation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'UPDATE_STATUS',
          accommodationId,
          accommodationStatus: status,
          rejectionReason: reason,
        }),
      })
      return await res.json()
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to update accommodation status.' }
    }
  },

  // ── Form Toggles Management ───────────────────────────────────────────────
  async getFormSettings(): Promise<AppSettings> {
    try {
      const res = await fetch('/api/settings')
      if (res.ok) {
        const json = await res.json()
        if (json.success) {
          return {
            registrationOpen: json.registrationOpen,
            accommodationOpen: json.accommodationOpen,
            lastUpdated: json.lastUpdated,
          }
        }
      }
    } catch (_) {}

    return {
      registrationOpen: !IS_REGISTRATION_CLOSED,
      accommodationOpen: true,
    }
  },

  async updateFormSettings(settings: { registrationOpen?: boolean; accommodationOpen?: boolean }): Promise<ApiResponse & { settings?: AppSettings }> {
    const token = localStorage.getItem('shf26_admin_token') || sessionStorage.getItem('shf26_admin_token')
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      })
      const json = await res.json()
      if (json && json.success) {
        window.dispatchEvent(new CustomEvent('shf_settings_updated', { detail: json }))
      }
      return json
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to update form settings.' }
    }
  },
}

