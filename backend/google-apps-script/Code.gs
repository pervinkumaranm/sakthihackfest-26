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
  // Target Spreadsheet ID: 1OYdxruhylGwutte02g4SkShEAmmbF91lqNCgF1DxQUk
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
  TIMEZONE: "Asia/Kolkata"
};

// ── HTTP POST Handler ──────────────────────────────────────────────────────
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);

    console.log("Incoming request");
    if (e && e.postData && e.postData.contents) {
      console.log(e.postData.contents);
    } else {
      return buildJsonResponse({
        success: false,
        errorCode: "INVALID_DATA",
        message: "No request body provided."
      }, 400);
    }

    let body;
    try {
      body = JSON.parse(e.postData.contents);
    } catch (parseErr) {
      return buildJsonResponse({
        success: false,
        errorCode: "INVALID_DATA",
        message: "Malformed JSON payload."
      }, 400);
    }

    const action = body.action || "SUBMIT_REGISTRATION";

    if (action === "RETRY_EMAIL") {
      return handleRetryEmail(body.registrationId);
    }

    if (action === "UPDATE_STATUS") {
      return handleStatusUpdate(body);
    }

    return handleRegistrationSubmission(body.data || body);

  } catch (err) {
    console.error("doPost exception: " + err);
    return buildJsonResponse({
      success: false,
      errorCode: "REGISTRATION_FAILED",
      message: "An internal server error occurred while processing registration: " + err.toString()
    }, 500);
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

  console.log("Spreadsheet ID:");
  console.log(CONFIG.SPREADSHEET_ID);
  console.log("Sheet:");
  console.log(sheet.getName());

  // Extract clean fields
  const teamName = String(payload.teamName || "").trim();
  const teamSize = parseInt(payload.teamSize, 10) || 3;
  const theme = String(payload.theme || payload.selectedThemeName || payload.selectedThemeId || "General Track").trim();

  // Leader fields - support both teamLeader and leader structures
  const leader = payload.teamLeader || payload.leader || {};
  const leaderName = String(payload.leaderName || leader.name || "").trim();
  const leaderDept = String(payload.leaderDepartment || leader.department || "").trim();
  const leaderYear = String(payload.leaderYear || leader.year || leader.yearOfStudy || "").trim();
  const leaderWhatsapp = String(payload.leaderWhatsapp || leader.whatsapp || "").trim();
  const leaderEmail = String(payload.leaderEmail || leader.email || "").trim();

  // Payment fields
  const payment = payload.payment || {};
  const upiTxnId = String(payload.upiTransactionId || payment.transactionId || "").trim();
  const screenshotBase64 = payload.paymentScreenshotData || payment.screenshotBase64 || "";
  const screenshotName = payload.paymentScreenshotName || payment.screenshotName || "payment_screenshot.png";

  // 3. Duplicate detection
  const duplicate = checkDuplicateSubmission(sheet, teamName, leaderEmail, upiTxnId);
  if (duplicate) {
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
  console.log("Registration ID:");
  console.log(registrationId);

  const now = new Date();
  const timestampStr = formatTimestamp(now);

  // 5. Upload Payment Screenshot to Google Drive
  let driveFileUrl = "";
  let driveFileId = "";

  if (screenshotBase64) {
    try {
      const uploadResult = savePaymentScreenshotToDrive(registrationId, screenshotBase64, screenshotName);
      driveFileUrl = uploadResult.fileUrl;
      driveFileId = uploadResult.fileId;
    } catch (driveErr) {
      console.error("Drive upload failure: " + driveErr);
      const errMsg = driveErr.toString();
      if (errMsg.includes("PAYMENT_SCREENSHOT_TOO_LARGE")) {
        return buildJsonResponse({
          success: false,
          errorCode: "PAYMENT_SCREENSHOT_TOO_LARGE",
          message: "Payment screenshot exceeds the 5 MB file size limit."
        }, 400);
      }
      if (errMsg.includes("INVALID_PAYMENT_SCREENSHOT")) {
        return buildJsonResponse({
          success: false,
          errorCode: "INVALID_PAYMENT_SCREENSHOT",
          message: "Invalid image format. Only PNG, JPG, JPEG, and WEBP are accepted."
        }, 400);
      }
      return buildJsonResponse({
        success: false,
        errorCode: "DRIVE_UPLOAD_ERROR",
        message: "Failed to upload payment screenshot to Google Drive. Please retry."
      }, 500);
    }
  } else {
    return buildJsonResponse({
      success: false,
      errorCode: "INVALID_PAYMENT_SCREENSHOT",
      message: "Payment screenshot is required."
    }, 400);
  }

  // 6. Structure Member details according to Team Size
  const members = payload.members || [];
  const m2 = members[0] || {};
  const m3 = members[1] || {};
  const m4 = members[2] || {};

  const m2Name = teamSize >= 2 ? String(m2.name || "").trim() : "";
  const m2Dept = teamSize >= 2 ? String(m2.department || "").trim() : "";
  const m2Year = teamSize >= 2 ? String(m2.yearOfStudy || m2.year || "").trim() : "";
  const m2Phone = teamSize >= 2 ? String(m2.whatsapp || "").trim() : "";
  const m2Email = teamSize >= 2 ? String(m2.email || "").trim() : "";

  const m3Name = teamSize >= 3 ? String(m3.name || "").trim() : "";
  const m3Dept = teamSize >= 3 ? String(m3.department || "").trim() : "";
  const m3Year = teamSize >= 3 ? String(m3.yearOfStudy || m3.year || "").trim() : "";
  const m3Phone = teamSize >= 3 ? String(m3.whatsapp || "").trim() : "";
  const m3Email = teamSize >= 3 ? String(m3.email || "").trim() : "";

  const m4Name = teamSize >= 4 ? String(m4.name || "").trim() : "";
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
    lastupdated: timestampStr
  };

  const appendResult = appendRegistrationRowByHeaders(sheet, dataMap);
  const rowIndex = appendResult.rowIndex;
  const headerCols = appendResult.headerCols;

  // 8. Send Automated Confirmation Email ONLY to Team Leader
  let emailStatus = "PENDING";
  let emailSentAt = "";

  const emailData = {
    registrationId: registrationId,
    teamName: teamName,
    teamSize: teamSize,
    teamMemberNames: teamMemberNames,
    theme: theme,
    leaderName: leaderName,
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

  // Return clean JSON success response
  return buildJsonResponse({
    success: true,
    registrationId: registrationId,
    emailStatus: emailStatus,
    paymentStatus: "SUBMITTED",
    data: {
      registrationId: registrationId,
      teamName: teamName,
      teamSize: teamSize,
      leaderName: leaderName,
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
      paymentStatus: "PENDING",
      registrationStatus: "CONFIRMED",
      timestamp: timestampStr
    }
  });
}

// ── Dynamic Header Mapper ──────────────────────────────────────────────────
function appendRegistrationRowByHeaders(sheet, dataMap) {
  const lastCol = sheet.getLastColumn();
  if (lastCol === 0) {
    throw new Error("No header columns found in Registrations sheet");
  }

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
  const leaderDept = String(payload.leaderDepartment || leader.department || "").trim();
  const leaderYear = String(payload.leaderYear || leader.year || leader.yearOfStudy || "").trim();
  const leaderWhatsapp = String(payload.leaderWhatsapp || leader.whatsapp || "").trim();
  const leaderEmail = String(payload.leaderEmail || leader.email || "").trim();

  if (!leaderName) return { success: false, errorCode: "INVALID_DATA", message: "Leader name is required." };
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
    const mDept = String(m.department || "").trim();
    const mPhone = String(m.whatsapp || "").trim();
    const mEmail = String(m.email || "").trim();

    if (!mName) return { success: false, errorCode: "INVALID_DATA", message: "Member " + (i + 2) + " name is required." };
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
  const rawBase64 = parts.length > 1 ? parts[1] : parts[0];
  const approxSize = Math.ceil((rawBase64.length * 3) / 4);

  // Maximum 5 MB = 5242880 bytes
  if (approxSize > 5242880) {
    throw new Error("PAYMENT_SCREENSHOT_TOO_LARGE");
  }

  let mimeType = "image/png";
  if (parts.length > 1 && parts[0].includes(":") && parts[0].includes(";")) {
    mimeType = parts[0].split(":")[1].split(";")[0].toLowerCase();
  }

  const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
  if (!allowedTypes.includes(mimeType)) {
    throw new Error("INVALID_PAYMENT_SCREENSHOT");
  }

  let ext = "png";
  if (mimeType.includes("jpeg") || mimeType.includes("jpg")) ext = "jpg";
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
  const decodedBlob = Utilities.newBlob(Utilities.base64Decode(rawBase64), mimeType, targetFileName);
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

  // Send ONLY to Team Leader Email - No CC, no BCC, no team members, no admin
  MailApp.sendEmail({
    to: data.leaderEmail,
    name: "Team Sakthi HackFest'26",
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

// ── Sheet Locator ──────────────────────────────────────────────────────────
function getOrCreateRegistrationSheet() {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  if (!ss) {
    throw new Error("Spreadsheet not found with ID: " + CONFIG.SPREADSHEET_ID);
  }

  // Open strictly the "Registrations" sheet tab
  const sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) {
    throw new Error("Registrations sheet not found in spreadsheet " + CONFIG.SPREADSHEET_ID);
  }

  return sheet;
}

// ── Test Function ──────────────────────────────────────────────────────────
function testSheetWrite() {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet = ss.getSheetByName("Registrations");

  if (!sheet) {
    throw new Error("Registrations sheet not found");
  }

  sheet.appendRow([
    "TEST-SHF26",
    new Date(),
    "TEST TEAM",
    2,
    "Test Theme",
    "Test Leader",
    "CSE",
    "2nd Year",
    "9999999999",
    "test@example.com"
  ]);

  Logger.log("Test row inserted successfully into Registrations sheet");
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
