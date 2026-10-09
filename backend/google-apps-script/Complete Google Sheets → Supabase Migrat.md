Complete Google Sheets → Supabase Migration
We need to migrate the website's application data layer from Google Sheets/Apps Script to Supabase.
The reason for this migration is reliability: our Google account running Apps Script was temporarily suspended by Google. We do not want the website's core functionality to depend on Google Sheets or Apps Script anymore.
Important: Before changing anything, inspect the entire repository and understand the existing registration, accommodation, attendance, admin, authentication, toggle, QR/team lookup, and API flows. Do not blindly rewrite the application.
1. New architecture
The final architecture should be:
Frontend
   ↓
Vercel API / Serverless Functions
   ↓
Supabase PostgreSQL

Supabase should become the single source of truth for all application data.
Google Sheets and Google Apps Script should no longer be required for normal website operation.
The website must continue running even if the Google account/Apps Script is unavailable.
2. Data that must migrate to Supabase
Migrate the existing data currently stored in Google Sheets[you can use hackfest26.xlsx stored in this workspace] for:
Registration
All required registration/team/member information currently used by the website must be migrated.
This includes, where applicable:
- Team Code / Registration ID
- Team Name
- Team Leader details
- Registered member details
- Member college names
- Team size
- Registration-related selections
- Domain/scenario/theme/etc. where currently applicable
- Registration timestamp
- Any other existing registration data that is required by the website/admin/attendance system
Do not blindly copy every Google Sheet column into one huge table. Analyze the existing data and normalize it properly.
3. Use a proper relational database schema
Do NOT create a spreadsheet-like single table containing everything.
Design a clean PostgreSQL schema with appropriate relationships.
At minimum, consider:
teams
id
team_code
team_name
team_leader_name
team_leader_email
team_size
registration_timestamp
created_at
updated_at

team_members
id
team_id
member_name
college_name
member_order
created_at

Use team_id as the foreign key.
The exact schema should be determined after inspecting the existing project/data structure.
Accommodation
Create a proper accommodation-related structure, for example:
accommodation_requests
accommodation_members

Store:
- Team
- Selected members
- Amount
- Payment screenshot URL
- Payment status if currently required by the application
- Request timestamp
- Any other necessary existing accommodation information
Do NOT upload/migrate payment screenshots into Supabase Storage.
Existing payment screenshots remain in Google Drive.
Only store the existing screenshot URL/path in Supabase.
Example:
payment_screenshot_url

No new image storage system is required.
4. Attendance schema
Attendance must be designed carefully because volunteers may scan and mark teams rapidly.
Do NOT store attendance as an inefficient large text/JSON blob if a relational structure is more appropriate.
Prefer something similar to:
attendance_records
id
team_id
marked_by
marked_at
updated_at

attendance_members
id
attendance_record_id
member_id
status

Where:
status = present | absent

Add appropriate indexes and unique constraints.
For example, there should be a reliable uniqueness rule preventing duplicate attendance records for the same team/event/day.
The exact schema should be finalized after inspecting the existing attendance implementation and requirements.
5. Attendance performance is critical
The attendance page must be optimized for real-world event usage.
Volunteers will potentially scan many teams continuously.
The site must NOT freeze, choke, become excessively slow, or make unnecessary requests while marking attendance.
Optimize the attendance flow:
QR Scan
   ↓
Team Code
   ↓
Single efficient lookup
   ↓
Team + Members + Colleges
   ↓
Mark Present/Absent
   ↓
Single controlled save/update

Requirements:
- Use indexed Team Code lookup.
- Avoid fetching the entire registration database for every scan.
- Avoid repeated unnecessary API calls.
- Fetch only the data required for the attendance screen.
- Use efficient Supabase queries.
- Use database constraints to prevent duplicates.
- Handle concurrent attendance submissions safely.
- Do not block the UI while saving.
- Show clear loading/success/error states.
- After successful save, allow the volunteer to immediately scan the next team.
6. Team lookup
Attendance team lookup must use Supabase, not Google Sheets.
Team identification should continue working through:
QR Scanner
Existing team QR contains data similar to:
{
  "id": "SHF26-XM73ED",
  "team": "Synovate"
}

Use the Team Code/ID as the primary lookup identifier.
Code Search
Volunteers must also be able to manually enter/search a Team Code.
There must be NO photo upload requirement.
Attendance identification uses only:
- QR scanner
- Team Code search
7. Attendance workflow must remain unchanged
Preserve the existing functionality:
Volunteer Login
      ↓
Attendance Page
      ↓
Scanner / Code Search
      ↓
Team Lookup
      ↓
Team + Members + College
      ↓
Select Present / Absent
      ↓
Submit
      ↓
Supabase

If attendance already exists:
Team Lookup
     ↓
Existing Attendance
     ↓
Show current status
     ↓
Edit Attendance
     ↓
Warning Confirmation
     ↓
Update Supabase

Do not create duplicate records when editing.
8. Toggle system
Migrate the existing Registration/Accommodation toggle state to Supabase as well.
Do NOT continue using:
config/toggles.json

as the runtime source of truth.
Create a proper settings/configuration table, for example:
app_settings
id
key
value
updated_at
updated_by

Or another clean schema if better suited.
Store:
registration_open = false
accommodation_open = false

initially, because both registration and accommodation periods are currently over.
The Admin Page toggle must update Supabase directly.
Public pages and backend APIs must read the same Supabase state.
There must be one source of truth.
No JSON + Supabase + frontend state combinations that can become inconsistent.
9. Registration system
Registration must continue to behave exactly as it currently does, except that its data storage changes from Google Sheets to Supabase.
Preserve:
- Registration form
- Validation
- 75-team maximum
- Team code/registration ID generation
- QR/pass generation
- Existing UI
- Admin registration view
- Team/member data
- Existing registration closed behavior
The registration submission should become:
Registration Form
      ↓
Vercel API
      ↓
Supabase transaction
      ↓
Team + Members stored

Use transactions/appropriate database operations so that a team is not partially stored if one operation fails.
10. Accommodation system
Preserve the existing accommodation functionality, but change its database from Google Sheets to Supabase.
Preserve:
- Team lookup
- Registered member selection
- Accommodation member selection
- ₹100/member calculation
- Review page
- Payment flow
- Existing UPI QR
- Payment screenshot upload
- Existing screenshot storage in Google Drive
- Screenshot URL storage
- Admin accommodation view
- Payment verification workflow
Do not implement new image storage.
The existing Google Drive screenshot URL should simply be stored in Supabase.
11. Email system
Remove/disable automatic email sending from the new application flow.
We do NOT need:
- Automatic registration confirmation emails
- Automatic accommodation emails
- Attendance emails
- Email recovery logic
- Email status processing
Registration confirmation emails have already been sent to team leaders.
Do not introduce a new email provider.
Do not make registration/accommodation submission depend on email delivery.
Existing email-related historical fields may be retained in the database if useful for migration/history, but they must not control the application's current workflow.
12. Google Drive
Google Drive can remain only for the existing payment screenshots.
Do NOT migrate those files.
Do NOT introduce any new Drive upload functionality.
Store only the existing screenshot URL/reference in Supabase.
The website's core data operations must not depend on Google Drive either.
13. Remove Google Sheets/Apps Script runtime dependency
After migration, these should no longer be required for normal application operation:
Registration → Google Sheets
Accommodation → Google Sheets
Attendance → Google Sheets
Toggles → Google Sheet
Registration → Apps Script
Accommodation → Apps Script
Attendance → Apps Script

Replace them with:
Vercel API
     ↓
Supabase

Keep old Apps Script files only if they are needed for historical/reference purposes. Do not leave them accidentally connected to production.
14. Authentication and authorization
Preserve the existing authentication system where possible.
Maintain separate permissions for:
- Admin
- Attendance Volunteer
- Public user
Attendance volunteers must not gain access to the full Admin dashboard.
Admin-only operations such as:
- Changing registration toggle
- Changing accommodation toggle
- Viewing sensitive registration data
- Editing administrative information
must remain protected.
15. Supabase security
Do not expose the Supabase service-role key to the browser.
Use Vercel server-side APIs/serverless functions for privileged operations.
Keep secrets in Vercel environment variables.
Never commit:
SUPABASE_SERVICE_ROLE_KEY

or other credentials to Git.
Use appropriate database constraints, indexes, and Row Level Security where applicable.
16. Existing data migration
Before switching production to Supabase:
1. Inspect all current Google Sheet structures.
2. Map every required field to the new schema.
3. Import existing:
   - Registration data
   - Team/member data
   - Accommodation data
   - Attendance data
   - Toggle state
4. Verify record counts.
5. Verify several teams manually.
6. Verify accommodation records and screenshot URLs.
7. Verify existing attendance records.
8. Verify Team Code lookups.
Do not lose existing data.
Do not duplicate records during migration.
Use Team Code/Registration ID and appropriate database identifiers to maintain relationships.
17. Admin Page
The Admin Page should continue to provide the same functionality and UI.
Replace its data source with Supabase.
Registration:
Admin → Supabase → Registration data

Accommodation:
Admin → Supabase → Accommodation data

Attendance:
Admin → Supabase → Attendance data

Toggles:
Admin → Supabase → app_settings

Preserve existing filters, views, status displays, screenshots/Drive links, and other useful functionality.
18. API architecture
Use the existing Vercel API structure where possible:
/api/register
/api/accommodation
/api/attendance
/api/settings
/api/admin

Refactor these to use Supabase rather than Google Apps Script/Sheets.
Avoid creating unnecessary duplicate APIs.
Keep API responses small and purpose-specific.
19. Error handling
Every database operation must have proper error handling.
Never show:
Success

unless Supabase confirms the operation succeeded.
Handle:
- Supabase unavailable
- Invalid Team Code
- Duplicate Team
- Duplicate attendance
- Invalid member
- Unauthorized admin
- Unauthorized attendance user
- Database constraint errors
- Registration closed
- Accommodation closed
gracefully.
20. Performance
The application must remain fast under event-time usage.
Pay particular attention to attendance because multiple volunteers may be scanning teams simultaneously.
Add appropriate indexes, especially for:
team_code
team_id
member_id
attendance_record_id
attendance date/event

Avoid N+1 database queries.
Use efficient joins/queries where appropriate.
Avoid loading all teams/members into the browser unnecessarily.
21. UI preservation
Do not redesign the website.
Preserve:
- Existing theme
- Navigation
- Registration UI
- Accommodation UI
- Attendance UI
- Admin UI
- Sponsor section
- QR/pass UI
- Responsive behavior
This is primarily a backend/data-layer migration, not a visual redesign.
22. Testing requirements
Before considering the migration complete, test:
Registration
Registration ON
→ Submit team
→ Supabase
→ Team created
→ Members created
→ QR/pass workflow works

Registration closed
Registration OFF
→ UI shows closed
→ Direct API submission rejected

Accommodation
Team lookup
→ Select members
→ Calculate amount
→ Upload payment screenshot to existing Drive
→ Store Drive URL in Supabase
→ Submission succeeds

No email should be triggered.
Attendance
Login
→ QR Scan
→ Team Lookup
→ Members
→ Present/Absent
→ Save
→ Supabase

Also:
Code Search
→ Team Lookup
→ Existing Attendance
→ Edit
→ Warning
→ Update

Test multiple volunteers/rapid scans to ensure attendance does not choke.
Toggles
Admin changes toggle
→ Supabase
→ Public site immediately reflects state
→ Backend enforces same state

23. Migration safety
Do not delete the existing Google Sheet data until migration has been verified.
Keep the existing Google Sheets/Apps Script implementation available as a backup/reference during development.
Only switch the production runtime to Supabase after:
- Schema is verified
- Data migration is verified
- APIs are tested
- Attendance is tested
- Registration is tested
- Accommodation is tested
- Admin is tested
- Toggles are tested
24. Final report
At the end, provide a concise migration report containing:
1. Supabase tables created
2. Relationships between tables
3. Indexes/constraints added
4. Existing records migrated
5. APIs changed
6. Google Sheets dependencies removed
7. Apps Script dependencies removed
8. Email functionality removed from runtime
9. Google Drive screenshot handling retained
10. Environment variables required in Vercel
11. Supabase configuration required
12. Any remaining manual steps
13. Test results
Do not guess credentials, Supabase project IDs, keys, Google Sheet mappings, or environment variables. If anything is missing, clearly tell me exactly what I need to provide/configure.
Final architecture must be:
                   ┌── Registration
                   │
                   ├── Accommodation
Website → Vercel ──┼── Attendance ──→ Supabase PostgreSQL
                   │
                   ├── Admin
                   │
                   └── Toggles

Existing payment screenshots → Google Drive
Screenshot URL/reference      → Supabase

Automatic email → REMOVED
Google Sheets runtime dependency → REMOVED
Google Apps Script runtime dependency → REMOVED

All existing features should remain functionally the same unless explicitly stated above. The primary change is replacing Google Sheets/Apps Script as the application's operational data layer with a reliable, properly normalized Supabase database.