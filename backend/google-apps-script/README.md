# 🚀 SAKTHI HACKFEST 2K26 — Full Backend Setup Guide
### Google Sheets + Google Drive + Email Automation via Google Apps Script

This step-by-step guide walks you through connecting the **SAKTHI HACKFEST 2K26** React website to Google Sheets, Google Drive, and Gmail Email Automation.

---

## 📌 What This System Does Automatically

```
User Submits Registration Form (React)
               ↓
    Google Apps Script Web App
               ↓
  1. Validates all inputs & file size (<= 5MB)
  2. Generates Unique Random ID: SHF26-XXXXXX (no duplicates)
  3. Uploads Payment Screenshot to Google Drive:
     SAKTHI HACKFEST 2K26 / Payment Proofs / SHF26-XXXXXX / payment_screenshot.png
  4. Stores Complete Row into Google Sheets (Columns A to AH)
  5. Sends Professional Confirmation Email to Team Leader (MailApp)
  6. Returns Success to Frontend
               ↓
    Displays Participant Pass + Gate QR Code
```

---

## 🛠️ Step-by-Step Setup Instructions

### STEP 1 — Open Google Apps Script from Your Google Sheet

1. Open your Google Sheet (**`SAKTHI_HACKFEST_2K26_REGISTRATIONS`**).
2. Click **Extensions** in the top menu.
3. Select **Apps Script**.
4. A new tab will open with the Google Apps Script editor.

---

### STEP 2 — Copy & Paste the Backend Code

1. In the Apps Script editor, you will see `Code.gs`.
2. Delete everything inside `Code.gs`.
3. Open this local file:
   [`backend/google-apps-script/Code.gs`](file:///d:/HACK/backend/google-apps-script/Code.gs)
4. Copy the **entire contents** of `Code.gs` and paste it into the editor.
5. Click the **Save** icon (💾) or press `Ctrl + S`.

> 💡 **Notice:** `CONFIG.SPREADSHEET_ID` is pre-configured with your exact sheet ID:
> ```javascript
> SPREADSHEET_ID: "1OYdxruhylGwutte02g4SkShEAmmbF91lqNCgF1DxQUk"
> ```

---

### STEP 3 — Create the 34 Columns in Your Google Sheet (One Click)

1. In the Apps Script toolbar at the top, find the function dropdown (it usually shows `myFunction` or `doPost`).
2. Select **`setupRegistrationSheet`** from the dropdown.
3. Click **Run** (▶).
4. Google will ask for authorization on the first run:
   - Click **Review permissions**
   - Choose your Google Account
   - Click **Advanced** (bottom left of popup)
   - Click **Go to Untitled project (unsafe)**
   - Click **Allow**
5. Go back to your Google Sheet — you will see **34 exact columns (A to AH)** created with dark styling and red headers!

---

### STEP 4 — Deploy as Web App

1. In the Apps Script editor, click **Deploy** (top right) → **New deployment** (or **Manage deployments** if updating).
2. Click the gear icon ⚙️ next to *Select type* and select **Web app**.
3. Configure the settings:

| Setting | Value to Select |
|---|---|
| **Description** | `SAKTHI HACKFEST 2K26 Production v2` |
| **Execute as** | **`Me (your-account@gmail.com)`** |
| **Who has access** | **`Anyone`** *(Must be Anyone so students can register without logging in)* |

4. Click **Deploy**.
5. Copy the **Web app URL** (it looks like `https://script.google.com/macros/s/.../exec`).

---

### STEP 5 — Update Your `.env` File

1. In your local project, open `.env`:
   ```env
   VITE_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/YOUR_ACTUAL_DEPLOYED_ID/exec
   ```
2. Save the file.
3. Vite will automatically reload the new URL.

---

## 📊 Google Sheets 34-Column Structure

The sheet tab `Registrations` stores these 34 columns:

| Col | Header Name | Description |
|:---:|---|---|
| **A** | `Registration ID` | Unique ID e.g. `SHF26-A12BJ4` |
| **B** | `Timestamp` | Submission time (Asia/Kolkata) |
| **C** | `Team Name` | Name of the team |
| **D** | `Team Size` | 2, 3, or 4 |
| **E** | `Selected Theme` | Chosen problem track |
| **F** | `Team Leader Name` | Leader full name |
| **G** | `Team Leader Department` | Department / Branch |
| **H** | `Team Leader Year` | Academic year |
| **I** | `Team Leader WhatsApp` | 10-digit number |
| **J** | `Team Leader Email` | Notification recipient |
| **K** | `Member 2 Name` | Member 2 name |
| **L** | `Member 2 Department` | Member 2 department |
| **M** | `Member 2 Year` | Member 2 year |
| **N** | `Member 2 WhatsApp` | Member 2 phone |
| **O** | `Member 2 Email` | Member 2 email |
| **P** | `Member 3 Name` | Empty if team size = 2 |
| **Q** | `Member 3 Department` | Empty if team size = 2 |
| **R** | `Member 3 Year` | Empty if team size = 2 |
| **S** | `Member 3 WhatsApp` | Empty if team size = 2 |
| **T** | `Member 3 Email` | Empty if team size = 2 |
| **U** | `Member 4 Name` | Empty if team size < 4 |
| **V** | `Member 4 Department` | Empty if team size < 4 |
| **W** | `Member 4 Year` | Empty if team size < 4 |
| **X** | `Member 4 WhatsApp` | Empty if team size < 4 |
| **Y** | `Member 4 Email` | Empty if team size < 4 |
| **Z** | `Payment Amount` | Fixed ₹1,000 |
| **AA** | `UPI Transaction ID` | UTR / Txn reference number |
| **AB** | `Payment Screenshot URL` | Google Drive shareable link |
| **AC** | `Google Drive File ID` | Drive file ID |
| **AD** | `Payment Status` | `PENDING` / `VERIFIED` / `REJECTED` |
| **AE** | `Registration Status` | `CONFIRMED` |
| **AF** | `Email Status` | `SENT` or `FAILED` |
| **AG** | `Email Sent At` | Timestamp email was delivered |
| **AH** | `Last Updated` | Latest update timestamp |

---

## 📁 Google Drive Hierarchy Created

```
Google Drive (My Drive)
└── SAKTHI HACKFEST 2K26
    └── Payment Proofs
        ├── SHF26-A12BJ4
        │   └── payment_screenshot.png
        ├── SHF26-7K9P2X
        │   └── payment_screenshot.jpg
        └── ...
```

---

## 📧 Automated Confirmation Email Format

- **Sender**: `Team Sakthi HackFest'26` (`sakthihackfest@gmail.com`)
- **Recipient**: Team Leader's Email (`teamLeader.email`) **ONLY** — no CC, no BCC, no team members, no admin
- **Subject**: `Registration received Sakthi HackFest'26 | {{REGISTRATION_ID}}` (e.g. `Registration received Sakthi HackFest'26 | SHF26-A12BJ4`)
- **Dynamic Content**:
  - `Dear {{TEAM_LEADER_NAME}},`
  - Team name: `{{TEAM_NAME}}`
  - Team ID: `{{REGISTRATION_ID}}` (visually highlighted)
  - Members: `{{TEAM_MEMBER_NAMES}}` (e.g., `Rahul Kumar, Arun, Priya` dynamically assembled from actual team size; no blanks/nulls/empty commas)
  - Payment status: `Received, verification in progress. Your registration will be confirmed once your payment is verified. We will email you when it is.`
  - Event details: `Dates: 10-11 October 2026`, `Reporting: 9:00 AM, 10 October, at the Sree Sakthi Engineering College`, `Venue: Sree Sakthi Engineering College, Karamadai.`
  - Domains: Generative AI, Cryptography and Cyber Security, Sustainable Development Goals, Digital Prototyping & Design, Web3 & FinTech
  - WhatsApp CTA Button: `JOIN OFFICIAL WHATSAPP GROUP` linking to `https://chat.whatsapp.com/J4GVC6UgtX37ioBMVsRoYa`
  - Coordinator Contact: Jeevanandh at `+91 63812 06466`
- **Design**: Professional responsive HTML email with dark header, red/orange accents, clean white content area, highlighted Registration ID badge, status cards, and contact footer.
- **Fail-Safe Processing**: The registration row is written to Google Sheets and payment screenshot saved to Google Drive first; if MailApp encounters an error, `Email Status` is marked as `FAILED` without losing the registration. Admins can resend anytime from `/admin`.

---

## 🛠️ Admin Dashboard (`/admin`)

- Access the admin portal at `http://localhost:5173/admin`
- View all registrations live from Google Sheets
- Check Payment Screenshot directly via Google Drive
- **Email Status**: Shows `✓ SENT`, `⚠ FAILED`, or `PENDING`
- **Resend Email Button**: If Email Status is `FAILED`, admin can click **RESEND CONFIRMATION EMAIL** to trigger the Apps Script `RETRY_EMAIL` endpoint.
