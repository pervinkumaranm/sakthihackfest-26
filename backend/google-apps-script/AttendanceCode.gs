/**
 * SAKTHI HACKFEST 2K26 — Attendance Google Apps Script Module
 * File: AttendanceCode.gs
 *
 * Dedicated attendance management:
 * - Direct mapping to Sheet GID: 1959900323
 * - Strict duplicate prevention via Team Code / Registration ID matching
 * - Updating existing rows on edit without duplicating data
 * - Clean structure: Team Code, Team Name, Member 1..4 (with status), Totals, Timestamp, Marked By
 * - Strict PII sanitization (Zero participant email/phone exposure)
 */

if (typeof ATTENDANCE_CONFIG === "undefined") {
  var ATTENDANCE_CONFIG = {
    SPREADSHEET_ID: "1F_XlNsLdUXx31w92caKs5jidCeI0jcZIMY_TPPBJefE",
    ATTENDANCE_TAB_GID: 1959900323,
    ATTENDANCE_TAB_NAME: "Attendance",
    REGISTRATION_TAB_NAME: "Registrations"
  };
}

function getAttendanceHeaders() {
  return [
    "Team Code",
    "Team Name",
    "Member 1",
    "Member 2",
    "Member 3",
    "Member 4",
    "Total Present",
    "Total Members",
    "Timestamp",
    "Marked By"
  ];
}

function attendanceJsonResponse(data, statusCode) {
  if (typeof buildJsonResponse === "function") return buildJsonResponse(data, statusCode);
  if (typeof accomJsonResponse === "function") return accomJsonResponse(data, statusCode);
  const out = ContentService.createTextOutput(JSON.stringify(data));
  out.setMimeType(ContentService.MimeType.JSON);
  return out;
}

// ── Retrieve Attendance Sheet (Matches GID 1959900323 first) ─────────────────
function getAttendanceSheet() {
  const ss = SpreadsheetApp.openById(ATTENDANCE_CONFIG.SPREADSHEET_ID);
  const sheets = ss.getSheets();

  // 1. Search by exact GID 1959900323
  for (let i = 0; i < sheets.length; i++) {
    if (sheets[i].getSheetId() === ATTENDANCE_CONFIG.ATTENDANCE_TAB_GID) {
      ensureAttendanceHeaders(sheets[i]);
      return sheets[i];
    }
  }

  // 2. Search by tab name if GID differs
  let sheet = ss.getSheetByName(ATTENDANCE_CONFIG.ATTENDANCE_TAB_NAME) || 
              ss.getSheetByName("attendance") || 
              ss.getSheetByName("ATTENDANCE");
  if (!sheet) {
    sheet = ss.insertSheet(ATTENDANCE_CONFIG.ATTENDANCE_TAB_NAME);
  }
  ensureAttendanceHeaders(sheet);
  return sheet;
}

function ensureAttendanceHeaders(sheet) {
  if (sheet.getLastRow() === 0) {
    const headers = getAttendanceHeaders();
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground("#0f172a");
    headerRange.setFontColor("#f8fafc");
    headerRange.setFontWeight("bold");
    headerRange.setFontSize(10);
    headerRange.setHorizontalAlignment("center");
    sheet.setRowHeight(1, 36);
    sheet.setFrozenRows(1);
  }
}

// ── Check Attendance Status for a Team Code ──────────────────────────────────
function handleCheckAttendance(teamCode) {
  try {
    if (!teamCode) {
      return attendanceJsonResponse({ success: false, message: "Team code is required." }, 400);
    }
    const cleanCode = String(teamCode).trim().toUpperCase();
    const sheet = getAttendanceSheet();
    const data = sheet.getDataRange().getValues();

    if (data.length <= 1) {
      return attendanceJsonResponse({ success: true, exists: false });
    }

    const headers = data[0].map(h => String(h || "").trim().toLowerCase());
    const colCode = headers.indexOf("team code");
    const colTeam = headers.indexOf("team name");
    const colTimestamp = headers.indexOf("timestamp");
    const colMarkedBy = headers.indexOf("marked by");

    for (let r = 1; r < data.length; r++) {
      const rowCode = String(data[r][colCode !== -1 ? colCode : 0] || "").trim().toUpperCase();
      if (rowCode === cleanCode) {
        const membersList = [];
        for (let m = 1; m <= 4; m++) {
          const colM = headers.indexOf("member " + m);
          if (colM !== -1 && data[r][colM]) {
            const rawVal = String(data[r][colM]).trim();
            const parts = rawVal.split(/[:\-]/);
            if (parts.length >= 2) {
              const name = parts[0].trim();
              const status = parts[1].trim();
              membersList.push({ name: name, status: status });
            } else {
              membersList.push({ name: rawVal, status: "Present" });
            }
          }
        }

        return attendanceJsonResponse({
          success: true,
          exists: true,
          record: {
            teamCode: cleanCode,
            teamName: colTeam !== -1 ? String(data[r][colTeam]) : "",
            members: membersList,
            timestamp: colTimestamp !== -1 ? String(data[r][colTimestamp]) : "",
            markedBy: colMarkedBy !== -1 ? String(data[r][colMarkedBy]) : ""
          }
        });
      }
    }

    return attendanceJsonResponse({ success: true, exists: false });
  } catch (err) {
    return attendanceJsonResponse({ success: false, error: err.toString() }, 500);
  }
}

// ── Save or Update Attendance (Strict Deduplication) ─────────────────────────
function handleSaveAttendance(payload) {
  try {
    const data = payload.data || payload;
    const isEdit = Boolean(payload.isEdit);
    const cleanCode = String(data.teamCode || "").trim().toUpperCase();
    const cleanTeam = String(data.teamName || "").trim();
    const members = Array.isArray(data.members) ? data.members : [];

    if (!cleanCode) {
      return attendanceJsonResponse({ success: false, message: "teamCode is required." }, 400);
    }

    const sheet = getAttendanceSheet();
    const allData = sheet.getDataRange().getValues();
    const headers = allData[0].map(h => String(h || "").trim().toLowerCase());
    const colCode = headers.indexOf("team code") !== -1 ? headers.indexOf("team code") : 0;

    let existingRowIndex = -1;
    for (let r = 1; r < allData.length; r++) {
      if (String(allData[r][colCode] || "").trim().toUpperCase() === cleanCode) {
        existingRowIndex = r + 1; // 1-based row index in Google Sheet
        break;
      }
    }

    if (existingRowIndex !== -1 && !isEdit) {
      return attendanceJsonResponse({
        success: false,
        alreadyMarked: true,
        message: "Attendance for this team has already been recorded."
      }, 409);
    }

    const nowStr = (typeof formatTimestamp === "function") 
      ? formatTimestamp(new Date()) 
      : Utilities.formatDate(new Date(), "Asia/Kolkata", "yyyy-MM-dd HH:mm:ss");
    const totalPresent = members.filter(m => m.status === "Present").length;
    const totalMembers = members.length;

    // Build row values
    const member1 = members[0] ? members[0].name + ": " + members[0].status : "";
    const member2 = members[1] ? members[1].name + ": " + members[1].status : "";
    const member3 = members[2] ? members[2].name + ": " + members[2].status : "";
    const member4 = members[3] ? members[3].name + ": " + members[3].status : "";

    const rowValues = [
      cleanCode,
      cleanTeam,
      member1,
      member2,
      member3,
      member4,
      totalPresent,
      totalMembers,
      nowStr,
      String(data.markedBy || "volunteer")
    ];

    if (existingRowIndex !== -1) {
      // Update existing row
      sheet.getRange(existingRowIndex, 1, 1, rowValues.length).setValues([rowValues]);
      SpreadsheetApp.flush();
      return attendanceJsonResponse({
        success: true,
        message: "Attendance updated successfully.",
        row: existingRowIndex
      });
    } else {
      // Append new row
      sheet.appendRow(rowValues);
      SpreadsheetApp.flush();
      return attendanceJsonResponse({
        success: true,
        message: "Attendance recorded successfully.",
        row: sheet.getLastRow()
      });
    }

  } catch (err) {
    return attendanceJsonResponse({ success: false, error: err.toString() }, 500);
  }
}

// ── Retrieve Team Members & Colleges for Attendance Desk ─────────────────────
function handleGetTeam(teamCode) {
  try {
    if (!teamCode) return attendanceJsonResponse({ success: false, message: "teamCode is required." }, 400);
    const cleanCode = String(teamCode).trim().toUpperCase();
    const ss = SpreadsheetApp.openById(ATTENDANCE_CONFIG.SPREADSHEET_ID);
    const regSheet = ss.getSheetByName(ATTENDANCE_CONFIG.REGISTRATION_TAB_NAME) || ss.getSheets()[0];
    const data = regSheet.getDataRange().getValues();
    if (data.length <= 1) return attendanceJsonResponse({ success: false, message: "No registrations found." }, 404);

    const headers = data[0].map(h => String(h || "").trim().toLowerCase());
    const findCol = (keys) => {
      for (let k of keys) {
        const idx = headers.findIndex(h => h.includes(k));
        if (idx !== -1) return idx;
      }
      return -1;
    };

    const colCode = findCol(["registration id", "reg id", "team code", "team id"]);
    const colTeam = findCol(["team name", "team_name"]);
    const colLeaderName = findCol(["team leader name", "leader name", "lead name"]);
    const colLeaderCollege = findCol(["team leader college", "leader college", "college name", "college"]);

    for (let r = 1; r < data.length; r++) {
      const row = data[r];
      const rCode = colCode !== -1 ? String(row[colCode] || "").trim().toUpperCase() : "";
      if (rCode === cleanCode) {
        const teamName = colTeam !== -1 ? String(row[colTeam] || "").trim() : "Registered Team";
        const leaderName = colLeaderName !== -1 ? String(row[colLeaderName] || "").trim() : "";
        const leaderCollege = colLeaderCollege !== -1 ? String(row[colLeaderCollege] || "N/A").trim() : "N/A";

        const members = [];
        if (leaderName) {
          members.push({ name: leaderName, college: leaderCollege });
        }

        for (let m = 2; m <= 4; m++) {
          const colMName = findCol([`member ${m} name`, `member${m} name`]);
          const colMCollege = findCol([`member ${m} college`, `member${m} college`]);
          const mName = colMName !== -1 ? String(row[colMName] || "").trim() : "";
          const mCollege = colMCollege !== -1 ? String(row[colMCollege] || leaderCollege).trim() : leaderCollege;
          if (mName && mName.toLowerCase() !== "none" && mName.toLowerCase() !== "null") {
            members.push({ name: mName, college: mCollege || leaderCollege });
          }
        }

        return attendanceJsonResponse({
          success: true,
          team: {
            teamCode: cleanCode,
            teamName: teamName,
            members: members
          }
        });
      }
    }
    return attendanceJsonResponse({ success: false, message: "Team not found." }, 404);
  } catch (err) {
    return attendanceJsonResponse({ success: false, error: err.toString() }, 500);
  }
}
