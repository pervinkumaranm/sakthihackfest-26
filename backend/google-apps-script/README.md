# 🚀 SAKTHI HACKFEST 2K26 — Google Sheet, Drive & Email Automation Guide
### Full From-Scratch Setup Guide (Step-by-Step)

> **Official Sender Email:** `sakthihackfest@gmail.com`  
> **Target Recipient:** Only the **Team Leader Email** entered during registration  
> **Storage:** Google Sheets (39 Columns) + Google Drive (`SAKTHI HACKFEST 2K26 / Payment Proofs / <REGISTRATION_ID>`)

---

## 📌 System Architecture Overview

```
Participant Submits Form (React Website)
                  │
                  ▼
      Google Apps Script Web App
                  │
  ┌───────────────┼───────────────┐
  ▼               ▼               ▼
[Google Drive]  [Google Sheet]  [Gmail Automation]
Saves payment    Appends 39-col   Sends confirmation
screenshot into  row with         email strictly from
dedicated        unique ID        sakthihackfest@gmail.com
subfolder        (SHF26-XXXXXX)   to Team Leader Email
```

---

## ⚠️ Most Important Rule (Read Before Starting!)

Because you want emails to be sent from **`sakthihackfest@gmail.com`**, you **MUST**:
1. Open Google Chrome.
2. Log in using **`sakthihackfest@gmail.com`** (We strongly recommend using a **New Chrome Profile** or an **Incognito / Private Window** so other personal Google accounts don't cause permission conflicts).
3. Create the Google Sheet and deploy the Google Apps Script while logged into this account.

---

## 🛠️ Step-by-Step Setup Instructions

### STEP 1 — Create or Open Your Google Sheet

1. Go to [https://sheets.google.com](https://sheets.google.com) logged in as `sakthihackfest@gmail.com`.
2. Create a new blank spreadsheet or open your existing one.
3. Rename the sheet at the top left to:  
   **`SAKTHI_HACKFEST_2K26_REGISTRATIONS`**
4. Copy the **Spreadsheet ID** from your browser URL bar:
   ```
   https://docs.google.com/spreadsheets/d/1xPTyYx7YUZ8WRZD1zs-7gr4CqVknwJDpiC1BreWe9q0/edit
                                         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                                   THIS IS YOUR SPREADSHEET ID
   ```

---

### STEP 2 — Open Apps Script from Google Sheet

1. In your Google Sheet menu bar, click:  
   **Extensions** ➔ **Apps Script**
2. A new tab will open titled *Untitled project*.
3. Rename the project at the top left to:  
   **`Sakthi Hackfest 2K26 Backend`**

---

### STEP 3 — Copy & Paste the Backend Code

1. In the Apps Script code editor, you will see default code inside `Code.gs`.
2. Select everything (`Ctrl + A`) and delete it.
3. Open your local project file:  
   [`backend/google-apps-script/Code.gs`](file:///d:/HACK/backend/google-apps-script/Code.gs)
4. Copy the entire file content and paste it into the Apps Script editor.
5. *(Optional)* Check line 20 in `Code.gs`:
   ```javascript
   SPREADSHEET_ID: "YOUR_SPREADSHEET_ID_HERE",
   ```
   *(Note: If you opened Apps Script from **Extensions > Apps Script**, it automatically binds to your sheet!)*
6. Press `Ctrl + S` or click the **Save icon (💾)**.

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
