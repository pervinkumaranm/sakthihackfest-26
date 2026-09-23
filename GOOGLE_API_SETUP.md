# Sakthi HackFest'26 — Google Cloud APIs Setup Guide (No Google Apps Script)

This project uses direct **Google Cloud APIs** (Google Sheets API v4, Google Drive API v3, and Gmail API v1) via serverless Node.js endpoints on Vercel (`/api/register`).

---

## 1. Create Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Click on the project dropdown at the top and click **New Project**.
3. Name it: `sakthi-hackfest-2026` (or any name you prefer).
4. Click **Create** and ensure this new project is selected in the top bar.

---

## 2. Enable Google Sheets API

1. In the Google Cloud Console, navigate to **APIs & Services** > **Library**.
2. Search for **Google Sheets API**.
3. Click on **Google Sheets API** and click **Enable**.

---

## 3. Enable Google Drive API

1. In **APIs & Services** > **Library**, search for **Google Drive API**.
2. Click on **Google Drive API** and click **Enable**.

---

## 4. Enable Gmail API

1. In **APIs & Services** > **Library**, search for **Gmail API**.
2. Click on **Gmail API** and click **Enable**.

---

## 5. Create Service Account (for Sheets & Drive)

1. Go to **APIs & Services** > **Credentials**.
2. Click **+ CREATE CREDENTIALS** > **Service Account**.
3. **Service account details**:
   - Service account name: `sakthi-hackfest-backend`
   - Service account ID: `sakthi-hackfest-backend`
   - Description: `Service account for Sakthi HackFest Sheets and Drive automation`
4. Click **Create and Continue**.
5. **Grant role**: Select **Editor** (or Project > Editor).
6. Click **Done**.
7. In the Credentials list under **Service Accounts**, click on the newly created email (e.g., `sakthi-hackfest-backend@your-project.iam.gserviceaccount.com`).
8. Go to the **Keys** tab > **ADD KEY** > **Create new key**.
9. Choose **JSON** and click **Create**. A `.json` key file will download to your computer.
10. Open the `.json` file:
    - Note `project_id` → `GOOGLE_PROJECT_ID`
    - Note `client_email` → `GOOGLE_CLIENT_EMAIL`
    - Note `private_key` → `GOOGLE_PRIVATE_KEY`

---

## 6. Share Google Sheet with Service Account

1. Open your Google Sheet:
   - **Spreadsheet ID**: `1OYdxruhylGwutte02g4SkShEAmmbF91lqNCgF1DxQUk`
   - URL: `https://docs.google.com/spreadsheets/d/1OYdxruhylGwutte02g4SkShEAmmbF91lqNCgF1DxQUk/edit`
2. Click the green **Share** button in the top right corner.
3. Paste your **Service Account email** (`GOOGLE_CLIENT_EMAIL`).
4. Set permission to **Editor**.
5. Uncheck "Notify people" (since it's a bot) and click **Share** / **Save**.

---

## 7. Share Google Drive Parent Folder with Service Account

1. Open Google Drive with your account (`sakthihackfest@gmail.com`).
2. Create or open the folder: **SAKTHI HACKFEST 2K26**.
3. Right click the folder > **Share** > **Share**.
4. Paste your **Service Account email** (`GOOGLE_CLIENT_EMAIL`).
5. Set permission to **Editor** and click **Save**.
6. *(Optional)* If you want to fix the root folder ID, copy the folder ID from the URL (`https://drive.google.com/drive/folders/<FOLDER_ID>`) and set `GOOGLE_DRIVE_ROOT_FOLDER_ID`.

---

## 8. Create Gmail OAuth 2.0 Credentials

Since standard Gmail accounts (`sakthihackfest@gmail.com`) cannot be impersonated directly by external service accounts without Google Workspace domain-wide delegation, Gmail API uses standard server-side OAuth2 with a long-lived Refresh Token.

1. Go to **APIs & Services** > **OAuth consent screen**.
   - Choose **External** and click **Create**.
   - App name: `Sakthi HackFest Registration`
   - User support email: `sakthihackfest@gmail.com`
   - Developer contact email: `sakthihackfest@gmail.com`
   - Click **Save and Continue**.
2. **Scopes**:
   - Click **Add or Remove Scopes**.
   - Search for `https://www.googleapis.com/auth/gmail.send` and check it.
   - Click **Update** then **Save and Continue**.
3. **Test users**:
   - Click **+ Add Users**.
   - Enter: `sakthihackfest@gmail.com`.
   - Click **Save and Continue**.
4. Go to **APIs & Services** > **Credentials**.
   - Click **+ CREATE CREDENTIALS** > **OAuth client ID**.
   - Application type: **Web application**.
   - Name: `Sakthi HackFest Gmail Sender`.
   - Authorized redirect URIs:
     Add `https://developers.google.com/oauthplayground`
   - Click **Create**.
   - Note the **Client ID** → `GMAIL_CLIENT_ID`
   - Note the **Client Secret** → `GMAIL_CLIENT_SECRET`

---

## 9. Generate Gmail Refresh Token

1. Go to [Google OAuth 2.0 Playground](https://developers.google.com/oauthplayground/).
2. Click the **Gear icon (OAuth 2.0 configuration)** in the top right:
   - Check **Use your own OAuth credentials**.
   - OAuth Client ID: paste your `GMAIL_CLIENT_ID`.
   - OAuth Client secret: paste your `GMAIL_CLIENT_SECRET`.
   - Close the settings popup.
3. In **Step 1 (Select & authorize APIs)** on the left:
   - Scroll down to **Gmail API v1**.
   - Select `https://www.googleapis.com/auth/gmail.send`.
   - Click **Authorize APIs**.
4. Sign in with **`sakthihackfest@gmail.com`**.
   - If prompted with "Google hasn’t verified this app", click **Advanced** > **Go to Sakthi HackFest Registration (unsafe)**.
   - Click **Continue** to grant permission.
5. In **Step 2 (Exchange authorization code for tokens)**:
   - Click **Exchange authorization code for tokens**.
   - Copy the value of **Refresh token** → `GMAIL_REFRESH_TOKEN`.

---

## 10. Add Vercel Environment Variables

In your Vercel Project Dashboard:
Go to **Settings** > **Environment Variables** and add:

| Key | Value Description | Example / Note |
|---|---|---|
| `GOOGLE_PROJECT_ID` | Google Cloud project ID | `sakthi-hackfest-2026` |
| `GOOGLE_CLIENT_EMAIL` | Service Account email | `...@...iam.gserviceaccount.com` |
| `GOOGLE_PRIVATE_KEY` | Entire private key with newlines | `"-----BEGIN PRIVATE KEY-----\n..."` |
| `GOOGLE_SPREADSHEET_ID` | Your Google Sheet ID | `1OYdxruhylGwutte02g4SkShEAmmbF91lqNCgF1DxQUk` |
| `GOOGLE_DRIVE_ROOT_FOLDER_ID` | (Optional) Root Drive folder ID | ID from Drive folder URL |
| `GMAIL_CLIENT_ID` | OAuth Client ID | `...apps.googleusercontent.com` |
| `GMAIL_CLIENT_SECRET` | OAuth Client Secret | `GOCSPX-...` |
| `GMAIL_REFRESH_TOKEN` | OAuth Refresh Token | `1//04...` |
| `GMAIL_SENDER_EMAIL` | Sender Email | `sakthihackfest@gmail.com` |

> **Private Key Tip:** When pasting `GOOGLE_PRIVATE_KEY` in Vercel's dashboard, you can paste the literal multi-line private key or the `\n`-escaped string. The backend code automatically parses both formats.

---

## 11. Deploy

Push the updated code to GitHub:

```bash
git add .
git commit -m "feat: complete Google APIs integration without Google Apps Script"
git push
```

Vercel will automatically build and deploy.

---

## 12. Test & Verification

1. Navigate to `/register` on your site.
2. Complete Step 1 (Team info), Step 2 (Team leader & members), and Step 3 (Payment screenshot & UPI ID).
3. Click **SUBMIT REGISTRATION**.
   - The button shows `SUBMITTING...`.
   - The browser sends `POST /api/register`.
   - There are **ZERO requests to `script.google.com` or `script.googleusercontent.com`**.
4. Check your records:
   - **Google Sheet**: A new row appears with all 40 columns and the generated `SHF26-XXXXXX` ID.
   - **Google Drive**: Screenshot is saved under `SAKTHI HACKFEST 2K26` > `Payment Proofs` > `SHF26-XXXXXX`.
   - **Gmail**: Confirmation email is delivered to the Team Leader email from `sakthihackfest@gmail.com`.
   - **Frontend**: Instantly displays the verified **Registration Pass** with QR code and download ticket button.
