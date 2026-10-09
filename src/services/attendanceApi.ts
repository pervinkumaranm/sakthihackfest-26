/**
 * SAKTHI HACKFEST 2K26 — Attendance API Client Service
 * Handles volunteer authentication, team lookup, attendance submission, and status checking.
 * Directly interfaces with the Supabase-backed /api/attendance serverless endpoints.
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

export interface AttendanceTeamItem {
  teamCode: string;
  teamName: string;
}

export interface AttendanceStats {
  totalRegisteredTeams: number;
  teamsMarkedAttendance: number;
  studentsPresent: number;
  studentsAbsent: number;
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
      let data: any = {};
      try {
        data = await res.json();
      } catch {
        const text = await res.text().catch(() => '');
        return {
          success: false,
          error: res.status >= 500
            ? 'Server error occurred during authentication. Please try again later.'
            : (text || `Authentication failed with status ${res.status}.`),
        };
      }

      if (res.ok && data.success && data.token) {
        this.login(data.token, data.user?.username || username);
        return { success: true };
      }
      return { success: false, error: data.error || 'Invalid volunteer credentials.' };
    } catch (e: any) {
      console.error('Attendance auth error:', e);
      const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;
      return {
        success: false,
        error: isOffline
          ? 'Network offline. Please check your internet connection.'
          : (e.message || 'Authentication request failed. Please check network connection.'),
      };
    }
  }

  async getTeams(): Promise<{ success: boolean; teams?: AttendanceTeamItem[]; error?: string }> {
    const token = this.getToken();
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`,
        },
        body: JSON.stringify({ action: 'get_teams' }),
      });
      let data: any = {};
      try {
        data = await res.json();
      } catch {
        return { success: false, error: 'Server error parsing team list.' };
      }

      if (res.ok && data.success && Array.isArray(data.teams)) {
        return { success: true, teams: data.teams };
      }
      return { success: false, error: data.error || 'Failed to retrieve teams list.' };
    } catch (err: any) {
      console.error('getTeams error:', err);
      const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;
      return {
        success: false,
        error: isOffline
          ? 'Network offline. Please check your internet connection.'
          : (err.message || 'Failed to retrieve registered teams. Please try again.'),
      };
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
      return { success: false, error: data.error || `Team Code "${teamCode}" not found.` };
    } catch (err: any) {
      console.error('Backend get_team error:', err);
      return { success: false, error: 'Failed to look up team. Please check network connection.' };
    }
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

  async getAllAttendance(): Promise<{ success: boolean; records: AttendanceRecord[]; stats?: AttendanceStats; error?: string }> {
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
      let data: any = {};
      try {
        data = await res.json();
      } catch {
        return { success: false, records: [], error: 'Failed to parse attendance records.' };
      }

      if (res.ok && data.success) {
        return { success: true, records: data.records || [], stats: data.stats };
      }
      return { success: false, records: [], error: data.error || 'Failed to retrieve attendance.' };
    } catch (e: any) {
      console.warn('getAllAttendance error:', e);
      return { success: false, records: [], error: e.message || 'Network error retrieving attendance.' };
    }
  }
}

export const attendanceService = new AttendanceService();
