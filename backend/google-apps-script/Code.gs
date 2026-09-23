/**
 * SAKTHI HACKFEST 2K26 — Google Apps Script Enterprise Backend
 *
 * Connected strictly to:
 * SPREADSHEET_ID: 1OYdxruhylGwutte02g4SkShEAmmbF91lqNCgF1DxQUk
 * SHEET_NAME: Registrations
 *
 * Workflow:
 * 1. Validate incoming JSON payload
 * 2. Generate unique Registration ID (SHF26-XXXXXX)
 * 3. Upload payment screenshot to Google Drive
 * 4. Save to "Registrations" Google Sheet by matching Header Names dynamically
 * 5. Send automated confirmation email ONLY to Team Leader Email
 * 6. Return JSON response
 */

// ── Central Configuration ──────────────────────────────────────────────────
const CONFIG = {
  // Target Spreadsheet ID: leave empty or use your spreadsheet ID
  // If the script is bound to the sheet (Extensions > Apps Script), it auto-detects!
  SPREADSHEET_ID: "1OYdxruhylGwutte02g4SkShEAmmbF91lqNCgF1DxQUk",
  SHEET_NAME: "Registrations",

  // Drive folder hierarchy: SAKTHI HACKFEST 2K26 -> Payment Proofs -> <REGISTRATION_ID>
  DRIVE_PARENT_FOLDER_NAME: "SAKTHI HACKFEST 2K26",
  PROOFS_FOLDER_NAME: "Payment Proofs",

  EVENT_NAME: "Sakthi HackFest'26",
  EVENT_DATE: "10-11 October 2026",
  COLLEGE_NAME: "Sree Sakthi Engineering College",
  COLLEGE_CAMPUS: "Karamadai, Coimbatore",
  REGISTRATION_FEE: 1000,
  EMAIL_SENDER_NAME: "Team Sakthi HackFest'26",
  OFFICIAL_EMAIL: "sakthihackfest@gmail.com",
  TIMEZONE: "Asia/Kolkata"
};

// ── Helpers ────────────────────────────────────────────────────────────────
function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function buildJsonResponse(obj, statusCode) {
  return jsonResponse(obj);
}

// ── HTTP POST Handler ──────────────────────────────────────────────────────
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);

    console.log("POST REQUEST RECEIVED");
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({
        success: false,
        stage: "request",
        errorCode: "INVALID_DATA",
        message: "Request body is empty."
      });
    }

    console.log("RAW REQUEST RECEIVED");
    let body;
    try {
      body = JSON.parse(e.postData.contents);
    } catch (parseErr) {
      console.error("JSON parse error:", parseErr);
      return jsonResponse({
        success: false,
        stage: "request",
        errorCode: "INVALID_DATA",
        message: "Malformed JSON payload: " + parseErr
      });
    }

    console.log("REQUEST PARSED SUCCESSFULLY");
    const action = body.action || "SUBMIT_REGISTRATION";

    if (action === "RETRY_EMAIL") {
      return handleRetryEmail(body.registrationId);
    }

    if (action === "UPDATE_STATUS") {
      return handleStatusUpdate(body);
    }

    return handleRegistrationSubmission(body.data || body);

  } catch (error) {
    console.error("doPost exception:", error);
    return jsonResponse({
      success: false,
      stage: "server",
      errorCode: "REGISTRATION_FAILED",
      message: (error && error.message) || "Registration server error"
    });
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

// ── HTTP GET Handler ───────────────────────────────────────────────────────
function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) || "PING";

    if (action === "GET_REGISTRATIONS") {
      const sheet = getOrCreateRegistrationSheet();
      const rows = sheet.getDataRange().getValues();
      if (rows.length <= 1) {
        return buildJsonResponse({ success: true, data: [] });
      }

      const headers = rows[0];
      const data = [];
      for (let i = 1; i < rows.length; i++) {
        const item = {};
        for (let j = 0; j < headers.length; j++) {
          item[headers[j]] = rows[i][j];
        }
        data.push(item);
      }
      return buildJsonResponse({ success: true, data: data });
    }

    if (action === "TEST_WRITE") {
      testSheetWrite();
      return buildJsonResponse({ success: true, message: "testSheetWrite executed successfully." });
    }

    return buildJsonResponse({
      success: true,
      message: "SAKTHI HACKFEST 2K26 Registration API Active",
      spreadsheetId: CONFIG.SPREADSHEET_ID,
      sheetName: CONFIG.SHEET_NAME,
      timestamp: formatTimestamp(new Date())
    });

  } catch (err) {
    return buildJsonResponse({ success: false, error: err.toString() }, 500);
  }
}

// ── Core Submission Workflow ───────────────────────────────────────────────
function handleRegistrationSubmission(payload) {
  // 1. Server-side validation
  const validationError = validatePayload(payload);
  if (validationError) {
    return buildJsonResponse(validationError, 400);
  }

  // 2. Open the exact "Registrations" sheet strictly
  const sheet = getOrCreateRegistrationSheet();

  console.log("Spreadsheet ID: " + CONFIG.SPREADSHEET_ID);
  console.log("Sheet: " + sheet.getName());

  // Extract clean fields
  const teamName = String(payload.teamName || "").trim();
  const teamSize = parseInt(payload.teamSize, 10) || 3;
  const theme = String(payload.theme || payload.selectedThemeName || payload.selectedThemeId || "General Track").trim();
  const accommodationRequired = String(payload.accommodationRequired || "No").trim() === "Yes" ? "Yes" : "No";
  const selectedDomain = String(payload.selectedDomain || payload.domain || "").trim();

  // Leader fields - support both teamLeader and leader structures
  const leader = payload.teamLeader || payload.leader || {};
  const leaderName = String(payload.leaderName || leader.name || "").trim();
  const leaderCollege = String(payload.leaderCollege || leader.college || "").trim();
  const leaderDept = String(payload.leaderDepartment || leader.department || "").trim();
  const leaderYear = String(payload.leaderYear || leader.year || leader.yearOfStudy || "").trim();
  const leaderWhatsapp = String(payload.leaderWhatsapp || leader.whatsapp || "").trim();
  const leaderEmail = String(payload.leaderEmail || leader.email || "").trim();

  console.log("TEAM NAME: " + teamName);
  console.log("LEADER EMAIL: " + leaderEmail);
  console.log("Team name: " + teamName);
  console.log("Team leader email: " + leaderEmail);

  // Payment fields
  const payment = payload.payment || {};
  const upiTxnId = String(payload.upiTransactionId || payment.transactionId || "").trim();
  const screenshotBase64 = payload.paymentScreenshotData || payment.screenshotBase64 || "";
  const screenshotName = payload.paymentScreenshotName || payment.screenshotName || "payment_screenshot.png";

  if (screenshotBase64) {
    console.log("Payment screenshot received (length: " + screenshotBase64.length + ")");
  }

  // 3. Duplicate detection
  const duplicate = checkDuplicateSubmission(sheet, teamName, leaderEmail, upiTxnId);
  if (duplicate) {
    console.log("Duplicate registration detected for ID: " + duplicate.registrationId);
    return buildJsonResponse({
      success: true,
      isDuplicate: true,
      registrationId: duplicate.registrationId,
      emailStatus: duplicate.emailStatus || "SENT",
      paymentStatus: duplicate.paymentStatus || "PENDING",
      message: "An existing registration was found with this Team Name, Leader Email, or UPI ID."
    }, 200);
  }

  // 4. Generate Unique Random Registration ID: SHF26-XXXXXX
  const registrationId = generateUniqueRegistrationId(sheet);
  console.log("GENERATED ID: " + registrationId);
  console.log("STEP 3: Registration ID: " + registrationId);

  const now = new Date();
  const timestampStr = formatTimestamp(now);

  // 5. Upload Payment Screenshot to Google Drive
  let driveFileUrl = "";
  let driveFileId = "";

  console.log("DRIVE UPLOAD START");
  console.log("REGISTRATION ID:", registrationId);

  if (screenshotBase64) {
    try {
      const uploadResult = savePaymentScreenshotToDrive(registrationId, screenshotBase64, screenshotName);
      driveFileUrl = uploadResult.fileUrl;
      driveFileId = uploadResult.fileId;
      console.log("DRIVE UPLOAD COMPLETE");
      console.log("STEP 4: Payment upload complete. Drive File ID: " + driveFileId);
    } catch (driveErr) {
      console.error("Drive upload failure: " + driveErr);
      const errMsg = driveErr.toString();
      if (errMsg.includes("PAYMENT_SCREENSHOT_TOO_LARGE")) {
        return jsonResponse({
          success: false,
          stage: "payment_upload",
          errorCode: "PAYMENT_SCREENSHOT_TOO_LARGE",
          message: "Payment screenshot exceeds the 5 MB file size limit."
        });
      }
      if (errMsg.includes("INVALID_PAYMENT_SCREENSHOT")) {
        return jsonResponse({
          success: false,
          stage: "payment_upload",
          errorCode: "INVALID_PAYMENT_SCREENSHOT",
          message: "Invalid image format. Only PNG, JPG, JPEG, and WEBP are accepted."
        });
      }
      return jsonResponse({
        success: false,
        stage: "payment_upload",
        errorCode: "DRIVE_UPLOAD_ERROR",
        message: "Payment screenshot upload failed: " + errMsg
      });
    }
  } else {
    return jsonResponse({
      success: false,
      stage: "payment_upload",
      errorCode: "INVALID_PAYMENT_SCREENSHOT",
      message: "Payment screenshot is missing. Please upload the screenshot again."
    });
  }

  // 6. Structure Member details according to Team Size
  const members = payload.members || [];
  const m2 = members[0] || {};
  const m3 = members[1] || {};
  const m4 = members[2] || {};

  const m2Name = teamSize >= 2 ? String(m2.name || "").trim() : "";
  const m2College = teamSize >= 2 ? String(m2.college || "").trim() : "";
  const m2Dept = teamSize >= 2 ? String(m2.department || "").trim() : "";
  const m2Year = teamSize >= 2 ? String(m2.yearOfStudy || m2.year || "").trim() : "";
  const m2Phone = teamSize >= 2 ? String(m2.whatsapp || "").trim() : "";
  const m2Email = teamSize >= 2 ? String(m2.email || "").trim() : "";

  const m3Name = teamSize >= 3 ? String(m3.name || "").trim() : "";
  const m3College = teamSize >= 3 ? String(m3.college || "").trim() : "";
  const m3Dept = teamSize >= 3 ? String(m3.department || "").trim() : "";
  const m3Year = teamSize >= 3 ? String(m3.yearOfStudy || m3.year || "").trim() : "";
  const m3Phone = teamSize >= 3 ? String(m3.whatsapp || "").trim() : "";
  const m3Email = teamSize >= 3 ? String(m3.email || "").trim() : "";

  const m4Name = teamSize >= 4 ? String(m4.name || "").trim() : "";
  const m4College = teamSize >= 4 ? String(m4.college || "").trim() : "";
  const m4Dept = teamSize >= 4 ? String(m4.department || "").trim() : "";
  const m4Year = teamSize >= 4 ? String(m4.yearOfStudy || m4.year || "").trim() : "";
  const m4Phone = teamSize >= 4 ? String(m4.whatsapp || "").trim() : "";
  const m4Email = teamSize >= 4 ? String(m4.email || "").trim() : "";

  // Dynamic team member names: Leader first, followed by Member 2, Member 3, Member 4
  const memberNamesList = [leaderName];
  if (teamSize >= 2 && m2Name && m2Name !== leaderName) memberNamesList.push(m2Name);
  if (teamSize >= 3 && m3Name && m3Name !== leaderName) memberNamesList.push(m3Name);
  if (teamSize >= 4 && m4Name && m4Name !== leaderName) memberNamesList.push(m4Name);

  const teamMemberNames = memberNamesList
    .filter(function(n) {
      return n && typeof n === "string" && n.trim() !== "" && n !== "undefined" && n !== "null";
    })
    .join(", ");

  // 7. Map Data by Header Name Dynamically into the "Registrations" Sheet
  const dataMap = {
    registrationid: registrationId,
    timestamp: timestampStr,
    teamname: teamName,
    teamsize: teamSize,
    selecteddomain: selectedDomain,
    selectedtheme: theme,
    teamleadername: leaderName,
    teamleaderdepartment: leaderDept,
    teamleaderyear: leaderYear,
    teamleaderwhatsapp: leaderWhatsapp,
    teamleaderemail: leaderEmail,
    member2name: m2Name,
    member2department: m2Dept,
    member2year: m2Year,
    member2whatsapp: m2Phone,
    member2email: m2Email,
    member3name: m3Name,
    member3department: m3Dept,
    member3year: m3Year,
    member3whatsapp: m3Phone,
    member3email: m3Email,
    member4name: m4Name,
    member4department: m4Dept,
    member4year: m4Year,
    member4whatsapp: m4Phone,
    member4email: m4Email,
    paymentamount: CONFIG.REGISTRATION_FEE,
    upitransactionid: upiTxnId,
    paymentscreenshoturl: driveFileUrl,
    googledrivefileid: driveFileId,
    paymentstatus: "PENDING",
    registrationstatus: "CONFIRMED",
    emailstatus: "PENDING",
    emailsentat: "",
    lastupdated: timestampStr,
    accommodationrequired: accommodationRequired,
    leadercollegename: leaderCollege,
    member2collegename: m2College,
    member3collegename: m3College,
    member4collegename: m4College
  };

  console.log("SHEET WRITE START");
  const appendResult = appendRegistrationRowByHeaders(sheet, dataMap);
  const rowIndex = appendResult.rowIndex;
  const headerCols = appendResult.headerCols;
  console.log("SHEET WRITE COMPLETE");
  console.log("STEP 5: Sheet write complete. Row: " + rowIndex);

  // 8. Send Automated Confirmation Email ONLY to Team Leader
  let emailStatus = "PENDING";
  let emailSentAt = "";

  const emailData = {
    registrationId: registrationId,
    teamName: teamName,
    teamSize: teamSize,
    teamMemberNames: teamMemberNames,
    selectedDomain: selectedDomain,
    accommodationRequired: accommodationRequired,
    theme: theme,
    leaderName: leaderName,
    leaderCollege: leaderCollege,
    leaderDept: leaderDept,
    leaderYear: leaderYear,
    leaderWhatsapp: leaderWhatsapp,
    leaderEmail: leaderEmail,
    m2Name: m2Name,
    m3Name: m3Name,
    m4Name: m4Name,
    upiTxnId: upiTxnId,
    amount: CONFIG.REGISTRATION_FEE
  };

  try {
    sendConfirmationEmail(emailData);
    emailStatus = "SENT";
    emailSentAt = formatTimestamp(new Date());

    if (headerCols["emailstatus"]) sheet.getRange(rowIndex, headerCols["emailstatus"]).setValue("SENT");
    if (headerCols["emailsentat"]) sheet.getRange(rowIndex, headerCols["emailsentat"]).setValue(emailSentAt);
    if (headerCols["lastupdated"]) sheet.getRange(rowIndex, headerCols["lastupdated"]).setValue(emailSentAt);
  } catch (emailErr) {
    console.error("Confirmation email delivery failed: " + emailErr);
    emailStatus = "FAILED";
    if (headerCols["emailstatus"]) sheet.getRange(rowIndex, headerCols["emailstatus"]).setValue("FAILED");
    if (headerCols["lastupdated"]) sheet.getRange(rowIndex, headerCols["lastupdated"]).setValue(formatTimestamp(new Date()));
  }
  console.log("EMAIL STATUS: " + emailStatus);
  console.log("STEP 6: Email status: " + emailStatus);

  const responseObj = {
    success: true,
    registrationId: registrationId,
    emailStatus: emailStatus,
    paymentStatus: "RECEIVED",
    message: emailStatus === "SENT"
      ? "Registration completed successfully"
      : "Registration saved. Confirmation email is pending.",
    data: {
      registrationId: registrationId,
      teamName: teamName,
      teamSize: teamSize,
      selectedDomain: selectedDomain,
      accommodationRequired: accommodationRequired,
      leaderName: leaderName,
      leaderCollege: leaderCollege,
      leaderDepartment: leaderDept,
      leaderYear: leaderYear,
      leaderWhatsapp: leaderWhatsapp,
      leaderEmail: leaderEmail,
      members: members.slice(0, teamSize - 1),
      paymentAmount: CONFIG.REGISTRATION_FEE,
      upiTransactionId: upiTxnId,
      paymentScreenshotDriveUrl: driveFileUrl,
      driveFileId: driveFileId,
      emailStatus: emailStatus,
      paymentStatus: "RECEIVED",
      registrationStatus: "CONFIRMED",
      timestamp: timestampStr
    }
  };

  console.log("REGISTRATION COMPLETE");
  console.log("Final response: Registration " + registrationId + " success, email " + emailStatus);
  return jsonResponse(responseObj);
}

// ── Required New Headers Auto-Check ─────────────────────────────────────────
const REQUIRED_NEW_HEADERS = [
  "Accommodation Required",
  "Selected Domain",
  "Leader College Name",
  "Member 2 College Name",
  "Member 3 College Name",
  "Member 4 College Name"
];

function ensureRequiredHeaders(sheet) {
  let lastCol = sheet.getLastColumn();
  if (lastCol === 0) {
    initSheetHeaders(sheet);
    return;
  }

  const existingHeaders = sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(function(h) {
    return String(h || "").trim();
  });
  const existingHeadersNorm = existingHeaders.map(function(h) {
    return h.toLowerCase().replace(/[^a-z0-9]/g, "");
  });

  let hasMissing = false;
  for (let i = 0; i < REQUIRED_NEW_HEADERS.length; i++) {
    const norm = REQUIRED_NEW_HEADERS[i].toLowerCase().replace(/[^a-z0-9]/g, "");
    if (existingHeadersNorm.indexOf(norm) === -1) {
      hasMissing = true;
      break;
    }
  }

  if (hasMissing) {
    applyInlineLayoutToSheet();
  }
}

// ── Header Map Helper ──────────────────────────────────────────────────────
function getHeaderMap(sheet) {
  const lastCol = sheet.getLastColumn();
  if (lastCol === 0) return {};
  const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  const map = {};
  headers.forEach(function(header, index) {
    const raw = String(header || "").trim();
    if (raw) {
      map[raw] = index + 1;
      const norm = raw.toLowerCase().replace(/[^a-z0-9]/g, "");
      map[norm] = index + 1;
    }
  });
  return map;
}

// ── Dynamic Header Mapper ──────────────────────────────────────────────────
function appendRegistrationRowByHeaders(sheet, dataMap) {
  // 1. Verify headers safely without crashing registration
  try {
    ensureRequiredHeaders(sheet);
  } catch (headerErr) {
    Logger.log("ensureRequiredHeaders notice: " + headerErr.message);
  }

  ensureSheetColumnsCapacity(sheet, SHEET_HEADERS.length);

  const lastCol = sheet.getLastColumn();
  const headerRow = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  const row = [];
  const headerCols = {};

  for (let i = 0; i < headerRow.length; i++) {
    const rawHeader = String(headerRow[i] || "").trim();
    // Normalize header key: remove spaces and non-alphanumeric
    const normKey = rawHeader.toLowerCase().replace(/[^a-z0-9]/g, "");
    headerCols[normKey] = i + 1; // 1-indexed column number

    let val = "";
    if (normKey in dataMap) {
      val = dataMap[normKey];
    } else {
      // Fuzzy key matching fallback
      for (const k in dataMap) {
        if (normKey.indexOf(k) !== -1 || k.indexOf(normKey) !== -1) {
          val = dataMap[k];
          break;
        }
      }
    }
    row.push(val !== undefined && val !== null ? val : "");
  }

  sheet.appendRow(row);
  return {
    rowIndex: sheet.getLastRow(),
    headerCols: headerCols
  };
}

// ── Validation Helper ──────────────────────────────────────────────────────
function validatePayload(payload) {
  if (!payload || typeof payload !== "object") {
    return { success: false, errorCode: "INVALID_DATA", message: "Missing registration payload." };
  }

  const teamName = String(payload.teamName || "").trim();
  if (teamName.length < 2) {
    return { success: false, errorCode: "INVALID_DATA", message: "Team name must be at least 2 characters." };
  }

  const teamSize = parseInt(payload.teamSize, 10);
  if (isNaN(teamSize) || teamSize < 2 || teamSize > 4) {
    return { success: false, errorCode: "INVALID_DATA", message: "Team size must be 2, 3, or 4 members." };
  }

  const leader = payload.teamLeader || payload.leader || {};
  const leaderName = String(payload.leaderName || leader.name || "").trim();
  const leaderCollege = String(payload.leaderCollege || leader.college || "").trim();
  const leaderDept = String(payload.leaderDepartment || leader.department || "").trim();
  const leaderYear = String(payload.leaderYear || leader.year || leader.yearOfStudy || "").trim();
  const leaderWhatsapp = String(payload.leaderWhatsapp || leader.whatsapp || "").trim();
  const leaderEmail = String(payload.leaderEmail || leader.email || "").trim();

  // Validate Accommodation Required
  const accommodationRequired = String(payload.accommodationRequired || "").trim();
  if (accommodationRequired !== "Yes" && accommodationRequired !== "No") {
    return { success: false, errorCode: "INVALID_DATA", message: "Accommodation required must be 'Yes' or 'No'." };
  }

  if (!leaderName) return { success: false, errorCode: "INVALID_DATA", message: "Leader name is required." };
  if (leaderCollege.length < 2) return { success: false, errorCode: "INVALID_DATA", message: "Leader college name is required." };
  if (!leaderDept) return { success: false, errorCode: "INVALID_DATA", message: "Leader department is required." };
  if (!leaderYear) return { success: false, errorCode: "INVALID_DATA", message: "Leader year of study is required." };
  if (!/^[6-9]\d{9}$/.test(leaderWhatsapp)) {
    return { success: false, errorCode: "INVALID_DATA", message: "Leader WhatsApp must be a valid 10-digit Indian number." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(leaderEmail)) {
    return { success: false, errorCode: "INVALID_DATA", message: "Leader email is invalid." };
  }

  const members = payload.members || [];
  const requiredAdditionalMembers = teamSize - 1;
  if (members.length < requiredAdditionalMembers) {
    return { success: false, errorCode: "INVALID_DATA", message: "Details for all " + teamSize + " team members must be provided." };
  }

  for (let i = 0; i < requiredAdditionalMembers; i++) {
    const m = members[i] || {};
    const mName = String(m.name || "").trim();
    const mCollege = String(m.college || "").trim();
    const mDept = String(m.department || "").trim();
    const mPhone = String(m.whatsapp || "").trim();
    const mEmail = String(m.email || "").trim();

    if (!mName) return { success: false, errorCode: "INVALID_DATA", message: "Member " + (i + 2) + " name is required." };
    if (mCollege.length < 2) return { success: false, errorCode: "INVALID_DATA", message: "Member " + (i + 2) + " college name is required." };
    if (!mDept) return { success: false, errorCode: "INVALID_DATA", message: "Member " + (i + 2) + " department is required." };
    if (!/^[6-9]\d{9}$/.test(mPhone)) {
      return { success: false, errorCode: "INVALID_DATA", message: "Member " + (i + 2) + " WhatsApp must be a valid 10-digit number." };
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mEmail)) {
      return { success: false, errorCode: "INVALID_DATA", message: "Member " + (i + 2) + " email is invalid." };
    }
  }

  const payment = payload.payment || {};
  const upiTxnId = String(payload.upiTransactionId || payment.transactionId || "").trim();
  if (upiTxnId.length < 4) {
    return { success: false, errorCode: "INVALID_DATA", message: "Please provide a valid UPI transaction ID / UTR reference." };
  }

  const screenshot = payload.paymentScreenshotData || payment.screenshotBase64 || "";
  if (!screenshot) {
    return { success: false, errorCode: "INVALID_PAYMENT_SCREENSHOT", message: "Payment screenshot is required." };
  }

  return null;
}

// ── Unique Registration ID Generator ──────────────────────────────────────
function generateUniqueRegistrationId(sheet) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // readable characters
  const existingIds = getExistingRegistrationIds(sheet);

  for (let attempt = 0; attempt < 50; attempt++) {
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const candidateId = "SHF26-" + code;
    if (!existingIds.has(candidateId)) {
      return candidateId;
    }
  }

  return "SHF26-" + Utilities.getUuid().substring(0, 6).toUpperCase();
}

function getExistingRegistrationIds(sheet) {
  const ids = new Set();
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    const values = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    for (let i = 0; i < values.length; i++) {
      if (values[i][0]) ids.add(String(values[i][0]).trim());
    }
  }
  return ids;
}

// ── Duplicate Detection ────────────────────────────────────────────────────
function checkDuplicateSubmission(sheet, teamName, leaderEmail, upiTxnId) {
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return null;

  const lastCol = sheet.getLastColumn();
  const headerRow = sheet.getRange(1, 1, 1, lastCol).getValues()[0];

  let regIdCol = 1;
  let teamNameCol = 3;
  let leaderEmailCol = 10;
  let upiCol = 27;

  for (let c = 0; c < headerRow.length; c++) {
    const k = String(headerRow[c] || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    if (k === "registrationid") regIdCol = c + 1;
    if (k === "teamname") teamNameCol = c + 1;
    if (k === "teamleaderemail" || k === "leaderemail") leaderEmailCol = c + 1;
    if (k === "upitransactionid" || k === "transactionid") upiCol = c + 1;
  }

  const data = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
  const normTeam = teamName.toLowerCase().replace(/[^a-z0-9]/g, "");
  const normEmail = leaderEmail.toLowerCase();
  const normUpi = upiTxnId.toLowerCase().replace(/[^a-z0-9]/g, "");

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const rowRegId = String(row[regIdCol - 1] || "").trim();
    const rowTeam = String(row[teamNameCol - 1] || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    const rowEmail = String(row[leaderEmailCol - 1] || "").toLowerCase();
    const rowUpi = String(row[upiCol - 1] || "").toLowerCase().replace(/[^a-z0-9]/g, "");

    if (rowRegId && (normTeam === rowTeam || normEmail === rowEmail || (normUpi && normUpi === rowUpi))) {
      return {
        registrationId: rowRegId,
        paymentStatus: "PENDING",
        emailStatus: "SENT"
      };
    }
  }
  return null;
}

// ── Google Drive Storage: Hierarchy & Upload ───────────────────────────────
function savePaymentScreenshotToDrive(regId, base64Data, filename) {
  const parts = base64Data.split(",");
  let rawBase64 = parts.length > 1 ? parts[1] : parts[0];
  // Sanitize base64 string: remove whitespace, linebreaks, spaces
  rawBase64 = rawBase64.replace(/\s+/g, "");

  const approxSize = Math.ceil((rawBase64.length * 3) / 4);

  // Maximum 5 MB = 5242880 bytes
  if (approxSize > 5242880) {
    throw new Error("PAYMENT_SCREENSHOT_TOO_LARGE");
  }

  let mimeType = "image/png";
  if (parts.length > 1 && parts[0].includes(":") && parts[0].includes(";")) {
    mimeType = parts[0].split(":")[1].split(";")[0].toLowerCase().trim();
  }

  // Normalize mime types
  if (mimeType === "image/jpg" || mimeType === "image/pjpeg") {
    mimeType = "image/jpeg";
  }

  const allowedTypes = ["image/png", "image/jpeg", "image/webp"];
  if (!allowedTypes.includes(mimeType)) {
    throw new Error("INVALID_PAYMENT_SCREENSHOT");
  }

  let ext = "png";
  if (mimeType.includes("jpeg")) ext = "jpg";
  else if (mimeType.includes("webp")) ext = "webp";

  // Parent folder: SAKTHI HACKFEST 2K26
  let parentFolder;
  const parentFolders = DriveApp.getFoldersByName(CONFIG.DRIVE_PARENT_FOLDER_NAME);
  if (parentFolders.hasNext()) {
    parentFolder = parentFolders.next();
  } else {
    parentFolder = DriveApp.createFolder(CONFIG.DRIVE_PARENT_FOLDER_NAME);
  }

  // Subfolder: Payment Proofs
  let proofsFolder;
  const proofsFolders = parentFolder.getFoldersByName(CONFIG.PROOFS_FOLDER_NAME);
  if (proofsFolders.hasNext()) {
    proofsFolder = proofsFolders.next();
  } else {
    proofsFolder = parentFolder.createFolder(CONFIG.PROOFS_FOLDER_NAME);
  }

  // Registration ID folder: SHF26-XXXXXX
  let regFolder;
  const regFolders = proofsFolder.getFoldersByName(regId);
  if (regFolders.hasNext()) {
    regFolder = regFolders.next();
  } else {
    regFolder = proofsFolder.createFolder(regId);
  }

  // Save screenshot file
  const targetFileName = "payment_screenshot." + ext;
  const decodedBytes = Utilities.base64Decode(rawBase64);
  const decodedBlob = Utilities.newBlob(decodedBytes, mimeType, targetFileName);
  const file = regFolder.createFile(decodedBlob);

  return {
    fileUrl: file.getUrl(),
    fileId: file.getId()
  };
}

// ── Email Automation ───────────────────────────────────────────────────────
function sendConfirmationEmail(data) {
  // Required format: Registration received Sakthi HackFest'26 | {{REGISTRATION_ID}}
  const subject = "Registration received Sakthi HackFest'26 | " + data.registrationId;
  const htmlBody = buildConfirmationEmailHtml(data);
  const plainTextBody = buildConfirmationEmailPlainText(data);

  // Send ONLY to Team Leader Email - from sakthihackfest@gmail.com
  MailApp.sendEmail({
    to: data.leaderEmail,
    name: CONFIG.EMAIL_SENDER_NAME,
    replyTo: CONFIG.OFFICIAL_EMAIL,
    subject: subject,
    body: plainTextBody,
    htmlBody: htmlBody
  });
}

function buildConfirmationEmailPlainText(d) {
  return [
    "Dear " + d.leaderName + ",",
    "",
    "Thank you for registering for Sakthi HackFest'26, a 24-hour hackathon at Sree Sakthi Engineering College!",
    "",
    "Your registration details",
    "",
    "Team name: " + d.teamName,
    "Team ID: " + d.registrationId,
    "Members: " + d.teamMemberNames,
    "Hackathon Domain: " + (d.selectedDomain || "Generative AI"),
    "Accommodation required: " + (d.accommodationRequired || "No"),
    "",
    "Payment status: Received, verification in progress. Your registration will be confirmed once your payment is verified. We will email you when it is.",
    "",
    "Event details",
    "",
    "Dates: 10-11 October 2026",
    "Reporting: 9:00 AM, 10 October, at the Sree Sakthi Engineering College",
    "Venue: Sree Sakthi Engineering College, Karamadai.",
    "",
    "Domains",
    "",
    "Generative AI",
    "Cryptography and Cyber Security",
    "Sustainable Development Goals",
    "Digital Prototyping & Design",
    "Web3 & FinTech",
    "",
    "The problem statements will be revealed only at the start of the hackathon. All projects must be built during the 24 hours, and pre-built projects are not allowed.",
    "",
    "Join the official WhatsApp group now:",
    "",
    "https://chat.whatsapp.com/J4GVC6UgtX37ioBMVsRoYa",
    "",
    "All updates will be shared there.",
    "",
    "A detailed guide with the schedule and rules will be sent to you before the event.",
    "",
    "For any queries, contact Jeevanandh at +91 63812 06466.",
    "",
    "Regards,",
    "Team Sakthi HackFest'26",
    "sakthihackfest@gmail.com"
  ].join("\n");
}

function buildConfirmationEmailHtml(d) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Registration received Sakthi HackFest'26 | ${escapeHtml(d.registrationId)}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #18181b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f7; padding: 30px 12px;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table role="presentation" width="100%" style="max-width: 620px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.07); border: 1px solid #e4e4e7;">
          
          <!-- Top Accent Bar: Red to Orange Gradient -->
          <tr>
            <td style="height: 6px; background: linear-gradient(90deg, #dc2626 0%, #ea580c 50%, #f97316 100%);"></td>
          </tr>

          <!-- Black / Dark Header -->
          <tr>
            <td style="background-color: #0b0c10; padding: 36px 32px 28px 32px; text-align: center;">
              <div style="font-family: monospace; font-size: 11px; font-weight: 700; letter-spacing: 3px; color: #ea580c; text-transform: uppercase; margin-bottom: 8px;">
                SREE SAKTHI ENGINEERING COLLEGE
              </div>
              <h1 style="margin: 0; font-size: 26px; font-weight: 900; letter-spacing: 1.5px; color: #ffffff;">
                SAKTHI <span style="color: #ef4444;">HACKFEST</span> '26
              </h1>
              <div style="display: inline-block; margin-top: 14px; padding: 6px 16px; background-color: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.45); border-radius: 9999px; font-family: monospace; font-size: 12px; font-weight: 700; color: #fca5a5; letter-spacing: 1.2px; text-transform: uppercase;">
                Registration Received
              </div>
            </td>
          </tr>

          <!-- White Content Area -->
          <tr>
            <td style="padding: 34px 32px 24px 32px; background-color: #ffffff;">
              <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: #18181b;">
                Dear <strong>${escapeHtml(d.leaderName)}</strong>,
              </p>
              <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.65; color: #3f3f46;">
                Thank you for registering for <strong>Sakthi HackFest'26</strong>, a 24-hour hackathon at Sree Sakthi Engineering College!
              </p>

              <!-- Your Registration Details Box -->
              <div style="margin-bottom: 26px; background-color: #fafafa; border: 1px solid #e4e4e7; border-radius: 10px; padding: 20px;">
                <div style="font-size: 12px; font-weight: 800; letter-spacing: 1.5px; color: #dc2626; text-transform: uppercase; margin-bottom: 14px; border-bottom: 1px solid #e4e4e7; padding-bottom: 8px;">
                  Your registration details
                </div>
                <table role="presentation" width="100%" style="border-collapse: collapse; font-size: 14px;">
                  <tr>
                    <td style="padding: 7px 0; color: #71717a; width: 35%; font-weight: 600;">Team name:</td>
                    <td style="padding: 7px 0; color: #09090b; font-weight: 700;">${escapeHtml(d.teamName)}</td>
                  </tr>
                  <tr>
                    <td style="padding: 9px 0; color: #71717a; font-weight: 600;">Team ID:</td>
                    <td style="padding: 9px 0;">
                      <span style="display: inline-block; background-color: #fef2f2; border: 1px solid #f87171; color: #b91c1c; font-weight: 800; font-family: monospace; font-size: 16px; padding: 5px 12px; border-radius: 6px; letter-spacing: 1.5px;">
                        ${escapeHtml(d.registrationId)}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 7px 0; color: #71717a; font-weight: 600; vertical-align: top;">Members:</td>
                    <td style="padding: 7px 0; color: #09090b; font-weight: 600; line-height: 1.6;">${escapeHtml(d.teamMemberNames)}</td>
                  </tr>
                  <tr>
                    <td style="padding: 7px 0; color: #71717a; font-weight: 600;">Hackathon Domain:</td>
                    <td style="padding: 7px 0; color: #09090b; font-weight: 700;">${escapeHtml(d.selectedDomain || "Generative AI")}</td>
                  </tr>
                  <tr>
                    <td style="padding: 7px 0; color: #71717a; font-weight: 600;">Accommodation:</td>
                    <td style="padding: 7px 0; color: #09090b; font-weight: 700;">${escapeHtml(d.accommodationRequired || "No")}</td>
                  </tr>
                </table>

                <!-- Payment Status Notice -->
                <div style="margin-top: 16px; padding: 14px 16px; background-color: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 6px;">
                  <div style="font-size: 13.5px; font-weight: 700; color: #92400e; margin-bottom: 4px;">
                    Payment status: Received, verification in progress.
                  </div>
                  <div style="font-size: 13px; color: #78350f; line-height: 1.55;">
                    Your registration will be confirmed once your payment is verified. We will email you when it is.
                  </div>
                </div>
              </div>

              <!-- Event Details Box -->
              <div style="margin-bottom: 26px; background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 10px; padding: 20px;">
                <div style="font-size: 12px; font-weight: 800; letter-spacing: 1.5px; color: #dc2626; text-transform: uppercase; margin-bottom: 12px; border-bottom: 1px solid #e4e4e7; padding-bottom: 8px;">
                  Event details
                </div>
                <table role="presentation" width="100%" style="border-collapse: collapse; font-size: 14px; line-height: 1.65;">
                  <tr>
                    <td style="padding: 6px 0; color: #71717a; width: 30%; font-weight: 600;">Dates:</td>
                    <td style="padding: 6px 0; color: #09090b; font-weight: 700;">10-11 October 2026</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #71717a; font-weight: 600; vertical-align: top;">Reporting:</td>
                    <td style="padding: 6px 0; color: #09090b;">9:00 AM, 10 October, at the Sree Sakthi Engineering College</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #71717a; font-weight: 600; vertical-align: top;">Venue:</td>
                    <td style="padding: 6px 0; color: #09090b;">Sree Sakthi Engineering College, Karamadai.</td>
                  </tr>
                </table>
              </div>

              <!-- Domains Box -->
              <div style="margin-bottom: 26px; background-color: #fafafa; border: 1px solid #e4e4e7; border-radius: 10px; padding: 20px;">
                <div style="font-size: 12px; font-weight: 800; letter-spacing: 1.5px; color: #dc2626; text-transform: uppercase; margin-bottom: 12px; border-bottom: 1px solid #e4e4e7; padding-bottom: 8px;">
                  Domains
                </div>
                <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #27272a; line-height: 1.85;">
                  <li><strong>Generative AI</strong></li>
                  <li><strong>Cryptography and Cyber Security</strong></li>
                  <li><strong>Sustainable Development Goals</strong></li>
                  <li><strong>Digital Prototyping &amp; Design</strong></li>
                  <li><strong>Web3 &amp; FinTech</strong></li>
                </ul>
              </div>

              <p style="margin: 0 0 26px 0; font-size: 14px; line-height: 1.65; color: #52525b;">
                The problem statements will be revealed only at the start of the hackathon. All projects must be built during the 24 hours, and pre-built projects are not allowed.
              </p>

              <!-- WhatsApp CTA Card -->
              <div style="text-align: center; margin: 32px 0 28px 0; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 24px 20px;">
                <p style="font-size: 15px; font-weight: 700; color: #14532d; margin: 0 0 16px 0;">
                  Join the official WhatsApp group now:
                </p>
                <div>
                  <a href="https://chat.whatsapp.com/J4GVC6UgtX37ioBMVsRoYa" target="_blank" style="display: inline-block; background-color: #25D366; color: #ffffff; text-decoration: none; font-weight: 800; font-size: 14.5px; letter-spacing: 0.5px; padding: 14px 28px; border-radius: 8px; box-shadow: 0 4px 14px rgba(37, 211, 102, 0.35);">
                    JOIN OFFICIAL WHATSAPP GROUP
                  </a>
                </div>
                <p style="font-size: 12px; color: #166534; margin: 12px 0 4px 0; word-break: break-all;">
                  <a href="https://chat.whatsapp.com/J4GVC6UgtX37ioBMVsRoYa" target="_blank" style="color: #166534; text-decoration: underline;">https://chat.whatsapp.com/J4GVC6UgtX37ioBMVsRoYa</a>
                </p>
                <p style="font-size: 13px; color: #15803d; font-weight: 600; margin: 6px 0 0 0;">
                  All updates will be shared there.
                </p>
              </div>

              <div style="margin: 22px 0; padding: 14px 16px; background-color: #f4f4f5; border-radius: 8px; font-size: 13.5px; color: #52525b; line-height: 1.55;">
                A detailed guide with the schedule and rules will be sent to you before the event.
              </div>

              <p style="margin: 0 0 20px 0; font-size: 14px; color: #3f3f46; line-height: 1.6;">
                For any queries, contact Jeevanandh at <strong>+91 63812 06466</strong>.
              </p>

              <p style="margin: 0; font-size: 14px; color: #18181b; line-height: 1.6;">
                Regards,<br/>
                <strong>Team Sakthi HackFest'26</strong><br/>
                <a href="mailto:sakthihackfest@gmail.com" style="color: #dc2626; text-decoration: none; font-weight: 600;">sakthihackfest@gmail.com</a>
              </p>
            </td>
          </tr>

          <!-- Footer Area -->
          <tr>
            <td style="background-color: #0b0c10; padding: 22px 32px; text-align: center; border-top: 1px solid #27272a;">
              <div style="font-size: 12px; font-weight: 700; color: #f4f4f5; letter-spacing: 1px;">
                SAKTHI HACKFEST '26
              </div>
              <div style="font-size: 11px; color: #a1a1aa; margin-top: 4px;">
                Sree Sakthi Engineering College, Karamadai, Coimbatore - 641104
              </div>
              <div style="font-size: 11px; color: #71717a; margin-top: 8px;">
                This automated registration acknowledgment was sent only to the registered Team Leader.
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

function escapeHtml(text) {
  if (!text) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ── Email Retry Mechanism ──────────────────────────────────────────────────
function handleRetryEmail(registrationId) {
  if (!registrationId) {
    return buildJsonResponse({ success: false, message: "Registration ID is required for email retry." }, 400);
  }

  const sheet = getOrCreateRegistrationSheet();
  const data = sheet.getDataRange().getValues();
  const headerRow = data[0];

  const headerCols = {};
  for (let c = 0; c < headerRow.length; c++) {
    const k = String(headerRow[c] || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    headerCols[k] = c + 1;
  }

  for (let i = 1; i < data.length; i++) {
    const regIdVal = headerCols["registrationid"] ? data[i][headerCols["registrationid"] - 1] : data[i][0];

    if (String(regIdVal).trim() === String(registrationId).trim()) {
      const teamSize = parseInt(headerCols["teamsize"] ? data[i][headerCols["teamsize"] - 1] : data[i][3], 10) || 2;
      const leaderName = String(headerCols["teamleadername"] ? data[i][headerCols["teamleadername"] - 1] : data[i][5] || "").trim();
      const m2Name = String(headerCols["member2name"] ? data[i][headerCols["member2name"] - 1] : data[i][10] || "").trim();
      const m3Name = String(headerCols["member3name"] ? data[i][headerCols["member3name"] - 1] : data[i][15] || "").trim();
      const m4Name = String(headerCols["member4name"] ? data[i][headerCols["member4name"] - 1] : data[i][20] || "").trim();

      const memberNamesList = [leaderName];
      if (teamSize >= 2 && m2Name && m2Name !== leaderName) memberNamesList.push(m2Name);
      if (teamSize >= 3 && m3Name && m3Name !== leaderName) memberNamesList.push(m3Name);
      if (teamSize >= 4 && m4Name && m4Name !== leaderName) memberNamesList.push(m4Name);

      const teamMemberNames = memberNamesList
        .filter(function(n) {
          return n && typeof n === "string" && n.trim() !== "" && n !== "undefined" && n !== "null";
        })
        .join(", ");

      const leaderEmail = String(headerCols["teamleaderemail"] ? data[i][headerCols["teamleaderemail"] - 1] : data[i][9] || "").trim();

      const emailData = {
        registrationId: regIdVal,
        teamName: headerCols["teamname"] ? data[i][headerCols["teamname"] - 1] : data[i][2],
        teamSize: teamSize,
        teamMemberNames: teamMemberNames,
        theme: headerCols["selectedtheme"] ? data[i][headerCols["selectedtheme"] - 1] : data[i][4],
        leaderName: leaderName,
        leaderDept: headerCols["teamleaderdepartment"] ? data[i][headerCols["teamleaderdepartment"] - 1] : data[i][6],
        leaderYear: headerCols["teamleaderyear"] ? data[i][headerCols["teamleaderyear"] - 1] : data[i][7],
        leaderWhatsapp: headerCols["teamleaderwhatsapp"] ? data[i][headerCols["teamleaderwhatsapp"] - 1] : data[i][8],
        leaderEmail: leaderEmail,
        m2Name: m2Name,
        m3Name: m3Name,
        m4Name: m4Name,
        upiTxnId: headerCols["upitransactionid"] ? data[i][headerCols["upitransactionid"] - 1] : data[i][26],
        amount: CONFIG.REGISTRATION_FEE
      };

      try {
        sendConfirmationEmail(emailData);
        const sentAt = formatTimestamp(new Date());

        if (headerCols["emailstatus"]) sheet.getRange(i + 1, headerCols["emailstatus"]).setValue("SENT");
        if (headerCols["emailsentat"]) sheet.getRange(i + 1, headerCols["emailsentat"]).setValue(sentAt);
        if (headerCols["lastupdated"]) sheet.getRange(i + 1, headerCols["lastupdated"]).setValue(sentAt);

        return buildJsonResponse({
          success: true,
          message: "Confirmation email successfully resent to " + emailData.leaderEmail,
          emailStatus: "SENT"
        });
      } catch (err) {
        if (headerCols["emailstatus"]) sheet.getRange(i + 1, headerCols["emailstatus"]).setValue("FAILED");
        if (headerCols["lastupdated"]) sheet.getRange(i + 1, headerCols["lastupdated"]).setValue(formatTimestamp(new Date()));

        return buildJsonResponse({
          success: false,
          message: "Failed to send email: " + err.toString(),
          emailStatus: "FAILED"
        }, 500);
      }
    }
  }

  return buildJsonResponse({ success: false, message: "Registration ID not found." }, 404);
}

// ── Admin Status Update ────────────────────────────────────────────────────
function handleStatusUpdate(body) {
  const sheet = getOrCreateRegistrationSheet();
  const data = sheet.getDataRange().getValues();
  const headerRow = data[0];

  const headerCols = {};
  for (let c = 0; c < headerRow.length; c++) {
    const k = String(headerRow[c] || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    headerCols[k] = c + 1;
  }

  for (let i = 1; i < data.length; i++) {
    const regIdVal = headerCols["registrationid"] ? data[i][headerCols["registrationid"] - 1] : data[i][0];
    if (String(regIdVal).trim() === String(body.registrationId).trim()) {
      const nowStr = formatTimestamp(new Date());
      if (body.paymentStatus && headerCols["paymentstatus"]) {
        sheet.getRange(i + 1, headerCols["paymentstatus"]).setValue(body.paymentStatus);
      }
      if (body.registrationStatus && headerCols["registrationstatus"]) {
        sheet.getRange(i + 1, headerCols["registrationstatus"]).setValue(body.registrationStatus);
      }
      if (headerCols["lastupdated"]) {
        sheet.getRange(i + 1, headerCols["lastupdated"]).setValue(nowStr);
      }

      return buildJsonResponse({ success: true, message: "Registration status updated successfully." });
    }
  }
  return buildJsonResponse({ success: false, message: "Registration not found." }, 404);
}

// ── Sheet & Drive Helpers ──────────────────────────────────────────────────
const SHEET_HEADERS = [
  "Registration ID",
  "Timestamp",
  "Team Name",
  "Team Size",
  "Accommodation Required",
  "Selected Domain",
  "Selected Theme",
  "Team Leader Name",
  "Leader College Name",
  "Team Leader Department",
  "Team Leader Year",
  "Team Leader WhatsApp",
  "Team Leader Email",
  "Member 2 Name",
  "Member 2 College Name",
  "Member 2 Department",
  "Member 2 Year",
  "Member 2 WhatsApp",
  "Member 2 Email",
  "Member 3 Name",
  "Member 3 College Name",
  "Member 3 Department",
  "Member 3 Year",
  "Member 3 WhatsApp",
  "Member 3 Email",
  "Member 4 Name",
  "Member 4 College Name",
  "Member 4 Department",
  "Member 4 Year",
  "Member 4 WhatsApp",
  "Member 4 Email",
  "Payment Amount",
  "UPI Transaction ID",
  "Payment Screenshot URL",
  "Google Drive File ID",
  "Payment Status",
  "Registration Status",
  "Email Status",
  "Email Sent At",
  "Last Updated"
];

// ── One-Click Inline Layout Organizer for Google Sheet ────────────────────
function applyInlineLayoutToSheet() {
  const sheet = getOrCreateRegistrationSheet();
  const lastCol = sheet.getLastColumn();
  const lastRow = sheet.getLastRow();

  if (lastCol === 0 || lastRow === 0) {
    initSheetHeaders(sheet);
    return;
  }

  // 1. Read existing headers and index them
  const existingHeaders = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  const oldHeaderMap = {};
  existingHeaders.forEach(function(h, idx) {
    const raw = String(h || "").trim();
    if (raw) {
      oldHeaderMap[raw.toLowerCase().replace(/[^a-z0-9]/g, "")] = idx;
    }
  });

  // 2. Read existing data rows (if any)
  const existingData = lastRow > 1 ? sheet.getRange(2, 1, lastRow - 1, lastCol).getValues() : [];

  // 3. Rebuild the entire sheet matrix according to SHEET_HEADERS
  const newMatrix = [];
  newMatrix.push(SHEET_HEADERS); // Row 1

  for (let r = 0; r < existingData.length; r++) {
    const oldRow = existingData[r];
    const newRow = [];
    for (let c = 0; c < SHEET_HEADERS.length; c++) {
      const targetHeader = SHEET_HEADERS[c];
      const targetNorm = targetHeader.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (targetNorm in oldHeaderMap) {
        const oldColIdx = oldHeaderMap[targetNorm];
        const val = oldRow[oldColIdx];
        newRow.push(val !== undefined && val !== null ? val : "");
      } else {
        // New column: leave blank for older registrations
        newRow.push("");
      }
    }
    newMatrix.push(newRow);
  }

  // 4. Ensure sheet grid has at least SHEET_HEADERS.length columns before writing
  ensureSheetColumnsCapacity(sheet, SHEET_HEADERS.length);

  // 5. Safely clear and write the newly aligned matrix
  sheet.clearContents();
  sheet.getRange(1, 1, newMatrix.length, SHEET_HEADERS.length).setValues(newMatrix);

  // 6. Apply dark header styling
  const headerRange = sheet.getRange(1, 1, 1, SHEET_HEADERS.length);
  headerRange.setBackground("#0f172a");
  headerRange.setFontColor("#f8fafc");
  headerRange.setFontWeight("bold");
  headerRange.setFontSize(10);
  headerRange.setHorizontalAlignment("center");
  sheet.setRowHeight(1, 38);
  sheet.setFrozenRows(1);

  Logger.log("=================================================================");
  Logger.log("✅ GOOGLE SHEET UPDATED TO INLINE LAYOUT SUCCESSFULLY!");
  Logger.log("Total Columns: " + SHEET_HEADERS.length);
  Logger.log("Migrated Existing Registrations: " + existingData.length);
  Logger.log("=================================================================");
}

function ensureSheetColumnsCapacity(sheet, requiredColumns) {
  try {
    const currentMax = sheet.getMaxColumns();
    if (currentMax < requiredColumns) {
      sheet.insertColumnsAfter(currentMax, requiredColumns - currentMax);
    }
  } catch (err) {
    Logger.log("Capacity check notice: " + err.message);
  }
}

function addMissingHeadersToSheet() {
  applyInlineLayoutToSheet();
}

function getSpreadsheet() {
  const targetId = CONFIG.SPREADSHEET_ID || "1OYdxruhylGwutte02g4SkShEAmmbF91lqNCgF1DxQUk";
  let ss = null;

  try {
    ss = SpreadsheetApp.openById(targetId);
  } catch (err) {
    console.warn("SpreadsheetApp.openById(" + targetId + ") notice: " + err);
    try {
      ss = SpreadsheetApp.getActiveSpreadsheet();
    } catch (_) {}
  }

  if (!ss) {
    throw new Error("Google Spreadsheet not found with ID: " + targetId);
  }

  return ss;
}

function initSheetHeaders(sheet) {
  ensureSheetColumnsCapacity(sheet, SHEET_HEADERS.length);
  sheet.getRange(1, 1, 1, SHEET_HEADERS.length).setValues([SHEET_HEADERS]);

  const headerRange = sheet.getRange(1, 1, 1, SHEET_HEADERS.length);
  headerRange.setBackground("#0f172a");
  headerRange.setFontColor("#f8fafc");
  headerRange.setFontWeight("bold");
  headerRange.setFontSize(10);
  headerRange.setHorizontalAlignment("center");
  sheet.setRowHeight(1, 38);
  sheet.setFrozenRows(1);
}

function getOrCreateRegistrationSheet() {
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEET_NAME);
  }

  if (sheet.getLastColumn() === 0) {
    initSheetHeaders(sheet);
  }

  return sheet;
}

function ensureDriveFolderHierarchy() {
  let parentFolder;
  const parentFolders = DriveApp.getFoldersByName(CONFIG.DRIVE_PARENT_FOLDER_NAME);
  if (parentFolders.hasNext()) {
    parentFolder = parentFolders.next();
  } else {
    parentFolder = DriveApp.createFolder(CONFIG.DRIVE_PARENT_FOLDER_NAME);
  }

  let proofsFolder;
  const proofsFolders = parentFolder.getFoldersByName(CONFIG.PROOFS_FOLDER_NAME);
  if (proofsFolders.hasNext()) {
    proofsFolder = proofsFolders.next();
  } else {
    proofsFolder = parentFolder.createFolder(CONFIG.PROOFS_FOLDER_NAME);
  }

  return proofsFolder;
}

// ── One-Click Initial Setup ────────────────────────────────────────────────
function setupRegistrationSheet() {
  Logger.log("Starting SAKTHI HACKFEST 2K26 One-Click Setup...");

  // 1. Setup Google Sheet & 34 Column Headers
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEET_NAME);
  }
  initSheetHeaders(sheet);

  // 2. Setup Google Drive Folders
  const driveFolder = ensureDriveFolderHierarchy();

  Logger.log("=================================================================");
  Logger.log("✅ SETUP COMPLETED SUCCESSFULLY!");
  Logger.log("Spreadsheet Name: " + ss.getName());
  Logger.log("Spreadsheet ID: " + ss.getId());
  Logger.log("Active Sheet Tab: " + sheet.getName() + " (34 Columns Initialized)");
  Logger.log("Drive Proofs Folder: " + CONFIG.DRIVE_PARENT_FOLDER_NAME + " / " + CONFIG.PROOFS_FOLDER_NAME);
  Logger.log("=================================================================");
}

// ── One-Click System Test (Sheet + Drive + Email) ───────────────────────────
function testSystemConnection() {
  Logger.log("=================================================================");
  Logger.log("RUNNING SYSTEM DIAGNOSTIC TEST (Sheet + Drive + Email)...");

  // 1. Test Sheet
  const sheet = getOrCreateRegistrationSheet();
  ensureRequiredHeaders(sheet);
  Logger.log("✅ 1. Google Sheet: Connected (" + sheet.getName() + ", Columns: " + sheet.getLastColumn() + ")");

  // 2. Test Drive
  const proofsFolder = ensureDriveFolderHierarchy();
  Logger.log("✅ 2. Google Drive: Connected (" + proofsFolder.getName() + ")");

  // 3. Test Email
  const targetEmail = Session.getActiveUser().getEmail() || CONFIG.OFFICIAL_EMAIL;
  Logger.log("📧 3. Sending test email to: " + targetEmail + " from " + CONFIG.OFFICIAL_EMAIL);

  MailApp.sendEmail({
    to: targetEmail,
    name: CONFIG.EMAIL_SENDER_NAME,
    replyTo: CONFIG.OFFICIAL_EMAIL,
    subject: "Sakthi HackFest'26 — System Test Verification",
    body: "Congratulations! Your Google Apps Script backend is successfully connected to Google Sheets, Google Drive, and Email Automation.\n\nAll registrations will be automatically stored and confirmation emails will be sent to the Team Leader.",
    htmlBody: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px; background: #ffffff;">
        <h2 style="color: #dc2626; margin-top: 0;">Sakthi HackFest'26 — System Test Passed ✅</h2>
        <p style="color: #334155; font-size: 14px; line-height: 1.6;">
          Your backend infrastructure is fully operational and verified:
        </p>
        <ul style="color: #0f172a; font-size: 14px; line-height: 1.8;">
          <li><strong>Google Sheet:</strong> Connected (34 Columns Ready)</li>
          <li><strong>Google Drive:</strong> Payment Proofs Folder Ready</li>
          <li><strong>Email Automation:</strong> Working via ${escapeHtml(CONFIG.OFFICIAL_EMAIL)}</li>
        </ul>
        <p style="color: #64748b; font-size: 12px; margin-top: 20px;">
          Sakthi HackFest'26 Enterprise Backend Engine
        </p>
      </div>
    `
  });

  Logger.log("✅ 3. Email sent successfully! Check inbox for: " + targetEmail);
  Logger.log("=================================================================");
}

function testSheetWrite() {
  const ss = SpreadsheetApp.openById(
    "1OYdxruhylGwutte02g4SkShEAmmbF91lqNCgF1DxQUk"
  );

  const sheet = ss.getSheetByName("Registrations");

  if (!sheet) {
    throw new Error("Registrations sheet not found");
  }

  sheet.appendRow([
    "TEST-SHF26",
    new Date(),
    "TEST TEAM",
    2
  ]);

  Logger.log("Sheet write successful");
}

function testEmail() {
  const targetEmail = Session.getActiveUser().getEmail() || CONFIG.OFFICIAL_EMAIL;
  MailApp.sendEmail({
    to: targetEmail,
    subject: "SAKTHI HACKFEST'26 - Test Email",
    htmlBody: `
      <h2>SAKTHI HACKFEST'26</h2>
      <p>This is a test email.</p>
    `
  });
  Logger.log("TEST EMAIL SENT TO: " + targetEmail);
}

function testDrive() {
  let parentFolder;
  const parentFolders = DriveApp.getFoldersByName("SAKTHI HACKFEST 2K26");
  if (parentFolders.hasNext()) {
    parentFolder = parentFolders.next();
  } else {
    parentFolder = DriveApp.createFolder("SAKTHI HACKFEST 2K26");
  }

  let proofsFolder;
  const proofsFolders = parentFolder.getFoldersByName("Payment Proofs");
  if (proofsFolders.hasNext()) {
    proofsFolder = proofsFolders.next();
  } else {
    proofsFolder = parentFolder.createFolder("Payment Proofs");
  }

  let testFolder;
  const testFolders = proofsFolder.getFoldersByName("SHF26-TEST");
  if (testFolders.hasNext()) {
    testFolder = testFolders.next();
  } else {
    testFolder = proofsFolder.createFolder("SHF26-TEST");
  }

  Logger.log("TEST DRIVE SUCCESS: " + testFolder.getName());
}

function testFullRegistrationWrite() {
  const sheet = getOrCreateRegistrationSheet();
  const testId = "TEST-" + Math.floor(100000 + Math.random() * 900000);
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);

  const testMap = {
    registrationid: testId,
    timestamp: formatTimestamp(new Date()),
    teamname: "Test Team " + randomSuffix,
    teamsize: 2,
    selectedtheme: "Generative AI",
    teamleadername: "Test Leader",
    teamleaderdepartment: "CSE",
    teamleaderyear: "3rd Year",
    teamleaderwhatsapp: "9876543210",
    teamleaderemail: CONFIG.OFFICIAL_EMAIL,
    member2name: "Test Member 2",
    member2department: "IT",
    member2year: "3rd Year",
    member2whatsapp: "9876543211",
    member2email: "member2@example.com",
    paymentamount: 1000,
    upitransactionid: "UPI_TEST_" + randomSuffix,
    paymentscreenshoturl: "https://drive.google.com",
    googledrivefileid: "test_file_id",
    paymentstatus: "PENDING",
    registrationstatus: "CONFIRMED",
    emailstatus: "TEST_MODE",
    emailsentat: formatTimestamp(new Date()),
    lastupdated: formatTimestamp(new Date()),
    accommodationrequired: "Yes",
    leadercollegename: "Sree Sakthi Engineering College",
    member2collegename: "ABC Engineering College",
    member3collegename: "",
    member4collegename: ""
  };

  appendRegistrationRowByHeaders(sheet, testMap);
  Logger.log("✅ Test row inserted successfully with ID: " + testId);
}

// ── One-Click Full Self-Heal & Test Function ───────────────────────────────
function diagnoseAndFixSheet() {
  Logger.log("=================================================================");
  Logger.log("DIAGNOSING GOOGLE SHEET & WRITING CAPABILITY...");
  const sheet = getOrCreateRegistrationSheet();
  Logger.log("Sheet Name: " + sheet.getName());
  Logger.log("Initial Max Grid Columns: " + sheet.getMaxColumns());
  Logger.log("Initial Last Column with Data: " + sheet.getLastColumn());
  Logger.log("Initial Rows: " + sheet.getLastRow());

  // 1. Ensure grid capacity for 39 columns
  ensureSheetColumnsCapacity(sheet, SHEET_HEADERS.length);
  Logger.log("1. Grid capacity expanded to: " + sheet.getMaxColumns() + " columns.");

  // 2. Re-align columns to new inline layout without losing any existing rows
  applyInlineLayoutToSheet();
  Logger.log("2. Inline layout applied successfully.");

  // 3. Write test registration row
  testSheetWrite();

  Logger.log("=================================================================");
  Logger.log("✅ ALL REPAIRS COMPLETED! Check Google Sheet now — new row and inline columns are visible!");
  Logger.log("=================================================================");
}

// ── Helpers ────────────────────────────────────────────────────────────────
function buildJsonResponse(obj, statusCode) {
  const output = ContentService.createTextOutput(JSON.stringify(obj));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

function formatTimestamp(date) {
  return Utilities.formatDate(date, CONFIG.TIMEZONE, "yyyy-MM-dd HH:mm:ss");
}
