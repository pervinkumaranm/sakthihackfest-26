# 🚀 SAKTHI HACKFEST 2K26 — Google Sheet, Drive & Email Automation Guide

> **Official Sender Email:** `sakthihackfest@gmail.com`  
> **Google Sheet ID:** `1F_XlNsLdUXx31w92caKs5jidCeI0jcZIMY_TPPBJefE`  
> **Drive Payment Proofs Folder ID:** `1na3zZsEJDQhFGI8-rD01ZGhjHU-mIQJC`  
> **Active Backend Apps Script Project:** `SAKTHI HACKFEST 2K26 Backend` (Script ID: `1LZjRe9_aA7axqAYIAAtcO7oAMPmthrRyaYBruFaemll-BCK8s4DoYpdH`)  
> **Max Registration Limit:** Strictly **75 Teams**

---

## 🔍 Which of Your 2 Apps Script Projects is Used?

Looking at your Google Apps Script dashboard (Screenshot):
1. ❌ **`Untitled project`** (`1oCcH7jYlpWSJWL34EWEYNvfBzfYjjcavtDpkyt087j8Uroirct8nOL7`):  
   This contains `closeMyForm()` for closing a Google Form at 50 responses. **This is NOT the website backend.**
2. ✅ **`SAKTHI HACKFEST 2K26 Backend`** (`1LZjRe9_aA7axqAYIAAtcO7oAMPmthrRyaYBruFaemll-BCK8s4DoYpdH`):  
   **THIS IS THE OFFICIAL BACKEND SCRIPT.** It handles the 75-team atomic lock, Google Sheet writes, Google Drive payment proof uploads, and automated confirmation emails.

---

## ⚡ How to Update & Deploy in 2 Minutes

### 1. Open the Correct Apps Script Project
Direct URL:  
👉 **`https://script.google.com/u/0/home/projects/1LZjRe9_aA7axqAYIAAtcO7oAMPmthrRyaYBruFaemll-BCK8s4DoYpdH/edit`**  
*(Make sure you are logged in as `sakthihackfest@gmail.com`)*

### 2. Copy the Updated Code
1. Open the file [`backend/google-apps-script/Code.gs`](file:///home/z3r0_byt3/sakthihackfest-26/backend/google-apps-script/Code.gs) in this repository.
2. Select everything (`Ctrl + A`) and Copy (`Ctrl + C`).
3. In the Apps Script web editor, inside `Code.gs`, select everything (`Ctrl + A`) and Paste (`Ctrl + V`).
4. Save by pressing `Ctrl + S`.

### 3. Deploy New Version
1. Click the blue **Deploy** button at the top-right corner.
2. Select **Manage deployments**.
3. Click the **Pencil icon (Edit)** next to the active deployment.
4. Under **Version**, click the dropdown and choose **New version**.
5. Click **Deploy**.
6. Your Active Web App URL:  
   `https://script.google.com/macros/s/AKfycbwWpkK52_Rls-mkeYIwad3hVbUDDTBP6PSWonTlF0r_xHMvjhbCxwXFXgRFp-AN-1-U/exec`

---

## 📌 System Architecture Overview

```
Participant Submits Form (React Website)
                  │
                  ▼
      Vercel /api/register Proxy
                  │
                  ▼
   Google Apps Script Web App (sakthihackfest@gmail.com)
                  │
  ┌───────────────┼───────────────┐
  ▼               ▼               ▼
[Google Drive]  [Google Sheet]  [MailApp / Gmail]
Saves screenshot Appends row     Sends confirmation email
in Payment       into            strictly from
Proofs folder    Registrations   sakthihackfest@gmail.com
```

---

### STEP 4 — One-Click Setup (`setupRegistrationSheet`)

This automatically creates all **34 Columns** in your Google Sheet with formatting AND creates the required **Google Drive folders**.

1. In the Apps Script top toolbar, look at the dropdown next to *Debug* (it might say `doPost` or `myFunction`).
2. Click the dropdown and select **`setupRegistrationSheet`**.
3. Click the **Run** button (▶).
4. **Google Permission Authorization (First time only)**:
   - A dialog popup will appear: *"Authorization required"*.
   - Click **Review permissions**.
   - Choose your account: **`sakthihackfest@gmail.com`**.
   - You might see *"Google hasn't verified this app"*. Click **Advanced** (bottom-left of popup).
   - Click **Go to Sakthi Hackfest 2K26 Backend (unsafe)**.
   - Click **Allow**.
5. Look at the **Execution log** at the bottom. You will see:
   ```
   ✅ SETUP COMPLETED SUCCESSFULLY!
   Active Sheet Tab: Registrations (34 Columns Initialized)
   Drive Proofs Folder: SAKTHI HACKFEST 2K26 / Payment Proofs
   ```
6. Switch back to your Google Sheet tab — you will see the **Registrations** tab with all **34 dark-styled column headers (A to AH)** ready!
7. Open [https://drive.google.com](https://drive.google.com) — you will see the folder **`SAKTHI HACKFEST 2K26`** created automatically!

---

### STEP 5 — Run System Diagnostic Test (`testSystemConnection`)

Before deploying, verify that Sheet, Drive, and Email work:

1. In the Apps Script toolbar function dropdown, select **`testSystemConnection`**.
2. Click **Run** (▶).
3. Check the **Execution log**:
   ```
   RUNNING SYSTEM DIAGNOSTIC TEST (Sheet + Drive + Email)...
   ✅ 1. Google Sheet: Connected (Registrations, Columns: 34)
   ✅ 2. Google Drive: Connected (Payment Proofs)
   📧 3. Sending test email to: sakthihackfest@gmail.com from sakthihackfest@gmail.com
   ✅ 3. Email sent successfully! Check inbox for: sakthihackfest@gmail.com
   ```
4. Open your Gmail inbox (`sakthihackfest@gmail.com`). You will see a test email titled:  
   **`Sakthi HackFest'26 — System Test Verification`**!

---

### STEP 6 — Deploy as a Public Web App

1. In the top right corner of the Apps Script editor, click **Deploy** ➔ **New deployment**.
2. On the left side, click the **Gear icon ⚙️** next to *Select type* and choose **Web app**.
3. Fill in the exact settings:
   - **Description**: `Sakthi HackFest 2K26 Production v1`
   - **Execute as**: **`Me (sakthihackfest@gmail.com)`**  
     *(⚠️ CRITICAL: Must be "Me" so emails send from sakthihackfest@gmail.com)*
   - **Who has access**: **`Anyone`**  
     *(⚠️ CRITICAL: Must be "Anyone" so frontend registrations don't fail with CORS/401 errors)*
4. Click **Deploy**.
5. Copy the generated **Web app URL**. It looks like:  
   `https://script.google.com/macros/s/AKfycb.../exec`

---

### STEP 7 — Connect React Frontend to Google Apps Script

1. In your local project root (`d:\HACK`), open the **`.env`** file.
2. Replace the URL with your new Web App URL:
   ```env
   VITE_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/YOUR_NEW_DEPLOYED_ID/exec
   ```
3. Save the file (`Ctrl + S`).
4. In your terminal, restart the Vite dev server:
   ```bash
   npm run dev
   ```

---

### STEP 8 — Test End-to-End Registration

1. Open the website: `http://localhost:5173/register`
2. Fill in:
   - Team Name: `Test Warriors`
   - Team Size: `2`
   - Theme: `Generative AI`
   - Team Leader Name, Department, WhatsApp, and **Leader Email** (use an email you can check!).
   - Member 2 details.
   - Enter UPI Transaction ID (e.g. `UPI1234567890`) and upload any payment screenshot (PNG/JPG/WEBP, < 5MB).
3. Click **Submit Registration**.
4. **Expected Results**:
   1. **Frontend**: Receives confirmation pass with Registration ID (e.g. `SHF26-XXXXXX`).
   2. **Google Sheet**: A new row is automatically added to the `Registrations` tab.
   3. **Google Drive**: The screenshot is stored in `SAKTHI HACKFEST 2K26/Payment Proofs/SHF26-XXXXXX/payment_screenshot.png`.
   4. **Gmail**: The Team Leader immediately receives the official confirmation email from `sakthihackfest@gmail.com` with WhatsApp group link and event details!

---

## 🔁 How to Update the Code in the Future

Whenever you edit `Code.gs` in the Apps Script editor:
1. Click **Save (💾)**.
2. Click **Deploy** ➔ **Manage deployments**.
3. Click the **Pencil icon (Edit)** next to your active deployment.
4. Under **Version**, select **New version**.
5. Click **Deploy**.
*(If you do not create a New Version, Google will continue running the old code!)*

---

## 📊 Google Sheets 39-Column Inline Structure

| Column | Header Name | Description |
|:---:|---|---|
| **A** | `Registration ID` | Unique ID e.g. `SHF26-A12BJ4` |
| **B** | `Timestamp` | Submission time (Asia/Kolkata) |
| **C** | `Team Name` | Team name |
| **D** | `Team Size` | 2, 3, or 4 |
| **E** | `Accommodation Required` | `Yes` or `No` (Inline under Team Info) |
| **F** | `Selected Theme` | Chosen domain/theme |
| **G** | `Team Leader Name` | Leader full name |
| **H** | `Leader College Name` | Team Leader College Name (Inline under Leader) |
| **I** | `Team Leader Department` | Branch/Department |
| **J** | `Team Leader Year` | Academic year |
| **K** | `Team Leader WhatsApp` | 10-digit WhatsApp number |
| **L** | `Team Leader Email` | **Recipient of Confirmation Email** |
| **M** | `Member 2 Name` | Member 2 full name |
| **N** | `Member 2 College Name` | Member 2 College Name (Inline under Member 2) |
| **O** | `Member 2 Department` | Member 2 branch |
| **P** | `Member 2 Year` | Member 2 year |
| **Q** | `Member 2 WhatsApp` | Member 2 phone |
| **R** | `Member 2 Email` | Member 2 email |
| **S** | `Member 3 Name` | Member 3 full name |
| **T** | `Member 3 College Name` | Member 3 College Name (Inline under Member 3) |
| **U** | `Member 3 Department` | Member 3 branch |
| **V** | `Member 3 Year` | Member 3 year |
| **W** | `Member 3 WhatsApp` | Member 3 phone |
| **X** | `Member 3 Email` | Member 3 email |
| **Y** | `Member 4 Name` | Member 4 full name |
| **Z** | `Member 4 College Name` | Member 4 College Name (Inline under Member 4) |
| **AA** | `Member 4 Department` | Member 4 branch |
| **AB** | `Member 4 Year` | Member 4 year |
| **AC** | `Member 4 WhatsApp` | Member 4 phone |
| **AD** | `Member 4 Email` | Member 4 email |
| **AE** | `Payment Amount` | ₹1000 |
| **AF** | `UPI Transaction ID` | UTR / Reference ID |
| **AG** | `Payment Screenshot URL` | Google Drive link |
| **AH** | `Google Drive File ID` | Drive file ID |
| **AI** | `Payment Status` | `PENDING` / `VERIFIED` |
| **AJ** | `Registration Status` | `CONFIRMED` |
| **AK** | `Email Status` | `SENT` or `FAILED` |
| **AL** | `Email Sent At` | Delivery timestamp |
| **AM** | `Last Updated` | Modification timestamp |

> 🔒 **Preservation Guarantee**: `applyInlineLayoutToSheet()` safely migrates all existing registrations to their matching new columns without losing or overwriting any existing registration data.

---

## ❓ Frequently Asked Questions & Troubleshooting

### 1. Why didn't Google Sheet & Drive connect before?
- The Apps Script did not have the `setupRegistrationSheet` function to automatically initialize the sheet tabs and Drive folders.
- If the sheet had no headers, the script crashed with an internal error. We have updated `Code.gs` with **auto-healing headers** and an automated setup function.

### 2. Why is "Who has access: Anyone" strictly required?
If you select "Only myself" or "Anyone with a Google account", Google will require authentication cookies when the React frontend sends the request. The browser will block it with a CORS or 401 Unauthorized error. Setting it to **Anyone** allows the public registration form to submit data directly while the script securely executes as **Me (`sakthihackfest@gmail.com`)**.

### 3. How does email automation ensure only the Team Leader receives it?
In `Code.gs`, `sendConfirmationEmail(data)` specifically passes `to: data.leaderEmail` with `replyTo: "sakthihackfest@gmail.com"`. No CC, BCC, or other member emails are added.

### 4. What if email delivery fails for a participant?
The registration is **NEVER lost**. It is saved in Google Sheets with `Email Status = FAILED`. You can go to `/admin` in the web application and click **RESEND CONFIRMATION EMAIL** to retry delivery at any time.

---

## 🏨 Accommodation Apps Script Setup & Fix Guide

### ⚠️ Why did `SyntaxError: Identifier 'CONFIG' has already been declared` happen?
In Google Apps Script, **all `.gs` files in the same project share one single global execution scope**.
- If `Code.gs` already declares `const CONFIG = { ... }`, adding `AccommodationCode.gs` (or `AccomadationConfig.gs`) with `const CONFIG = { ... }` causes Google Apps Script V8 engine to immediately throw:
  `SyntaxError: Identifier 'CONFIG' has already been declared`
- Furthermore, an unescaped single quote in the email template font-family caused a syntax error in the Apps Script editor.

### ✅ What was fixed:
1. **Renamed Configuration to `ACCOMMODATION_CONFIG`**:
   - `CONFIG` $\rightarrow$ `ACCOMMODATION_CONFIG` (and declared with `var`, preventing redeclaration errors).
   - All references in `AccommodationCode.gs` updated to `ACCOMMODATION_CONFIG`.
2. **Fixed Syntax in Email HTML**:
   - Removed unescaped single quotes from `'Segoe UI'` and `'26'` in HTML string concatenation.
3. **Collision-Safe Architecture**:
   - `SSEC_LOGO_BASE64` renamed to `ACCOM_SSEC_LOGO_BASE64` with fallback to reuse existing logo if co-located.
   - Helper functions namespaced (`accomJsonResponse`, `accomFormatTimestamp`, `accomEscapeHtml`, `handleAccommodationRetryEmail`).
4. **Smart Coexistence Router**:
   - `doPost` and `doGet` now automatically delegate between registration and accommodation actions whether placed in the **same project** or a **dedicated separate project**.

### 📋 Two Supported Deployment Options:

#### Option 1: Dedicated Accommodation Project (Recommended)
1. Go to [script.google.com](https://script.google.com) while logged in as `sakthihackfest@gmail.com`.
2. Click **New project** and name it `Sakthi Hackfest 26 Accommodation Backend`.
3. In `Code.gs`, paste the contents of [`backend/google-apps-script/AccommodationCode.gs`](file:///home/z3r0_byt3/sakthihackfest-26/backend/google-apps-script/AccommodationCode.gs).
4. Click **Deploy** > **New deployment** > Type: **Web app** > Execute as: **Me** > Who has access: **Anyone**.
5. Copy the Web App URL and add it to your environment as `ACCOMMODATION_GAS_URL`.

#### Option 2: Same Project (`SAKTHI HACKFEST 2K26 Backend`)
If you prefer having both in the same project:
1. Open your existing project: `https://script.google.com/u/0/home/projects/1LZjRe9_aA7axqAYIAAtcO7oAMPmthrRyaYBruFaemll-BCK8s4DoYpdH/edit`
2. Update `Code.gs` with the latest [`backend/google-apps-script/Code.gs`](file:///home/z3r0_byt3/sakthihackfest-26/backend/google-apps-script/Code.gs).
3. Add a file named `AccommodationCode.gs` and paste [`backend/google-apps-script/AccommodationCode.gs`](file:///home/z3r0_byt3/sakthihackfest-26/backend/google-apps-script/AccommodationCode.gs).
4. (Optional) If you have `AccomadationConfig.gs`, paste [`backend/google-apps-script/AccomadationConfig.gs`](file:///home/z3r0_byt3/sakthihackfest-26/backend/google-apps-script/AccomadationConfig.gs) or simply delete that file since `AccommodationCode.gs` already contains the full configuration.
5. Deploy a **New version** under **Manage deployments**.

