/**
 * SAKTHI HACKFEST 2K26 — Attendance API Client Service
 * Handles volunteer authentication, team lookup, attendance submission, and status checking.
 */

export interface AttendanceMember {
  name: string;
  college: string;
  status: 'Present' | 'Absent';
}

export interface AttendanceTeam {
  teamCode: string;
  teamName: string;
  members: Array<{
    name: string;
    college: string;
  }>;
}

export interface AttendanceRecord {
  teamCode: string;
  teamName: string;
  members: AttendanceMember[];
  totalPresent: number;
  totalMembers: number;
  timestamp: string;
  markedBy: string;
}

const DEFAULT_GAS_URL =
  'https://script.google.com/macros/s/AKfycbx4-f4ywC14JGtbwV7Q2RAt5Yf7Jo6PdsMN6yseufqa3_I1CmTVEYBO74caibjSc_w9/exec';

class AttendanceService {
  private tokenKey = 'shf26_attendance_token';
  private userKey = 'shf26_attendance_user';

  login(token: string, username: string) {
    sessionStorage.setItem(this.tokenKey, token);
    sessionStorage.setItem(this.userKey, username);
  }

  logout() {
    sessionStorage.removeItem(this.tokenKey);
    sessionStorage.removeItem(this.userKey);
  }

  isAuthenticated(): boolean {
    return Boolean(sessionStorage.getItem(this.tokenKey));
  }

  getUser(): string {
    return sessionStorage.getItem(this.userKey) || 'Volunteer';
  }

  getToken(): string | null {
    return sessionStorage.getItem(this.tokenKey);
  }

  async authenticate(username: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', username, password }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.token) {
        this.login(data.token, data.user?.username || username);
        return { success: true };
      }
      return { success: false, error: data.error || 'Invalid credentials' };
    } catch (e: any) {
      console.error('Attendance auth error:', e);
      return { success: false, error: 'Network error occurred during authentication.' };
    }
  }

  async getTeam(teamCode: string): Promise<{ success: boolean; team?: AttendanceTeam; error?: string }> {
    const token = this.getToken();
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`,
        },
        body: JSON.stringify({ action: 'get_team', teamCode }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.team) {
        return { success: true, team: data.team };
      }
      return { success: false, error: data.error || 'Team not found.' };
    } catch (err: any) {
      console.warn('Backend get_team error, trying direct Apps Script fallback:', err);
    }

    // Direct Google Apps Script fallback
    try {
      const gasRes = await fetch(`${DEFAULT_GAS_URL}?action=GET_REGISTRATIONS`);
      if (gasRes.ok) {
        const gasJson = await gasRes.json();
        if (gasJson && gasJson.success && Array.isArray(gasJson.data)) {
          const match = gasJson.data.find((item: any) => {
            const rawId = String(item['Registration ID'] || item.registrationId || item.registrationid || '').trim().toUpperCase();
            return rawId === teamCode.trim().toUpperCase();
          });
          if (match) {
            const teamName = String(match['Team Name'] || match.teamName || match.teamname || '').trim();
            const leaderName = String(match['Team Leader Name'] || match.teamLeaderName || match.leaderName || '').trim();
            const leaderCollege = String(
              match['Leader College Name'] || match['Team Leader College Name'] || match.leaderCollege || 'N/A'
            ).trim();

            const membersList: Array<{ name: string; college: string }> = [];
            if (leaderName) {
              membersList.push({ name: leaderName, college: leaderCollege || 'N/A' });
            }

            for (let m = 2; m <= 4; m++) {
              const mName = String(match[`Member ${m} Name`] || match[`member${m}Name`] || match[`member${m}name`] || '').trim();
              const mCollege = String(
                match[`Member ${m} College Name`] || match[`Member ${m} College`] || match[`member${m}College`] || leaderCollege || 'N/A'
              ).trim();
              if (mName && mName.toLowerCase() !== 'none' && mName.toLowerCase() !== 'null') {
                membersList.push({ name: mName, college: mCollege || leaderCollege || 'N/A' });
              }
            }

            return {
              success: true,
              team: {
                teamCode: teamCode.trim().toUpperCase(),
                teamName: teamName || 'Registered Team',
                members: membersList,
              },
            };
          }
        }
      }
    } catch (gasErr) {
      console.error('Direct GAS team lookup failed:', gasErr);
    }

    return { success: false, error: `Team Code "${teamCode}" not found in registration database.` };
  }

  async checkAttendance(teamCode: string): Promise<{ success: boolean; exists: boolean; record?: AttendanceRecord }> {
    const token = this.getToken();
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`,
        },
        body: JSON.stringify({ action: 'get_attendance', teamCode }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        return { success: true, exists: Boolean(data.exists), record: data.record };
      }
    } catch (e) {
      console.warn('Check attendance API error:', e);
    }

    // Direct Apps Script fallback
    try {
      const gasRes = await fetch(`${DEFAULT_GAS_URL}?action=CHECK_ATTENDANCE&teamCode=${encodeURIComponent(teamCode)}`);
      if (gasRes.ok) {
        const gasJson = await gasRes.json();
        if (gasJson && gasJson.success) {
          return { success: true, exists: Boolean(gasJson.exists), record: gasJson.record };
        }
      }
    } catch (_) {}

    return { success: true, exists: false };
  }

  async submitAttendance(params: {
    teamCode: string;
    teamName: string;
    members: AttendanceMember[];
    isEdit?: boolean;
  }): Promise<{ success: boolean; message?: string; error?: string; record?: AttendanceRecord; alreadyMarked?: boolean }> {
    const token = this.getToken();
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`,
        },
        body: JSON.stringify({
          action: 'mark_attendance',
          teamCode: params.teamCode,
          teamName: params.teamName,
          members: params.members,
          isEdit: Boolean(params.isEdit),
        }),
      });

      const data = await res.json();
      if (res.status === 409 && data.alreadyMarked) {
        return {
          success: false,
          alreadyMarked: true,
          message: data.message || 'Attendance already recorded.',
          record: data.existingRecord,
        };
      }

      if (res.ok && data.success) {
        return {
          success: true,
          message: data.message,
          record: data.record,
        };
      }

      return {
        success: false,
        error: data.error || 'Failed to submit attendance.',
      };
    } catch (err: any) {
      console.error('Submit attendance error:', err);
      return {
        success: false,
        error: 'Network connection failed. Please ensure you are connected to the internet.',
      };
    }
  }

  async getAllAttendance(): Promise<{ success: boolean; records: AttendanceRecord[]; stats?: any }> {
    const token = this.getToken();
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`,
        },
        body: JSON.stringify({ action: 'get_all_attendance' }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        return { success: true, records: data.records || [], stats: data.stats };
      }
    } catch (e) {
      console.warn('getAllAttendance error:', e);
    }
    return { success: false, records: [] };
  }
}

export const attendanceService = new AttendanceService();
