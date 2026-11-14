=====================================================================
 ROCKET RACCOON SYSTEM  -  Teacher Created / OER / AR data entry
 For the school weekly-usage Google Sheet (SY 2026-2027 workbook)
=====================================================================

WHAT IS IN THIS FOLDER
  1. usage-website-bootstrap.html - the website (rename it index.html if you
                           host it online). Double-click to open in Chrome
                           or Edge. Needs internet (Bootstrap, icons, fonts).
  2. Code.gs             - the Google Apps Script. It lives inside your
                           Google Sheet and does the reading/writing.
  3. logo.png            - the logo (already built into the website).
  4. README.txt          - this guide.

HOW IT WORKS
  Website  --->  Apps Script (Code.gs)  --->  Google Sheet
  A website cannot write into a Google Sheet by itself, so the script inside
  the sheet does it. The website only needs the script's "Web App URL"
  (ends in /exec). Everything except the connection test needs a login.


---------------------------------------------------------------------
 A. REQUIREMENTS
---------------------------------------------------------------------
  - A Google account that owns (or can edit) the Google Sheet.
  - Chrome or Edge with internet.
  - Tabs named exactly: Teacher Created, OER, AR, INDEX, TCUPLOAD,
    OERUPLOAD, ARUPLOAD, Weekly Usage, Weekly Usage (Sections).
    Data starts on row 3. (Weekly Usage D2 = start of school-year week 1.)
  - The form writes ONLY these input columns, never the formula columns:
      Teacher Created: C Date, F Teacher, G Subject, H Grade, I Section,
        J CLE Digital Authoring Tool, K Title, L Resource (New/Old),
        M Resource Creation, N Resource Usage, O Session Duration,
        Q Learning Activity/Strategy, R Status
      OER: C Date, F Teacher, G Subject, H Grade, I Section, J Title,
        K OER Type, L OER Usage, N Session Duration,
        O Learning Activity/Strategy, P Status
      AR:  C Date, F Teacher, G Subject, H Grade, I Section, J Title,
        K Resource Type, L AR Usage, M Session Duration,
        O Learning Activity/Strategy, P Status
  - Dropdown choices are copied from the dropdown rules in your sheet
    (row 3); if a column has none, from the INDEX tab, else a text box.


---------------------------------------------------------------------
 B. FIRST-TIME SETUP  (about 5 minutes)
---------------------------------------------------------------------
  1. Open your Google Sheet > Extensions > Apps Script.
  2. Delete the sample code, paste ALL of Code.gs, click Save.
  3. Near the top change  const SETUP_CODE = 'change-me';  to your own
     secret word. It is needed once, to create the first admin. Save.
  4. Deploy > New deployment > gear icon > Web app:
        Execute as: Me        Who has access: Anyone
     Deploy, then Authorize access (Advanced > Go to ... > Allow).
     Do NOT choose "Only myself": the website could not reach the script.
  5. Copy the Web app URL (ends in /exec).
  6. Open usage-website-bootstrap.html, paste the URL, and create the ADMIN
     account (setup code, name, username, password min. 8 characters).


---------------------------------------------------------------------
 C. DAILY USE
---------------------------------------------------------------------
  Top bar: /TEACHER CREATED  /OER  /AR  and DATA OVERVIEW (dropdown).
  Each sheet has the tabs: Form | Pending | Done | Stats, and at the right:
  Row (show/hide the row numbers), reload button, CSV.

  FORM TAB
   - Left: "Check existing titles". Right: the entry form.
   - Type the Title: the banner on the left checks it against ALL rows (Done
     and Pending) for the grade of the new entry (the form's Grade, or the
     Grade filter if the form's Grade is still empty):
        GREEN  = no entry with this exact title yet. You can proceed.
        RED    = duplicate: the same title is already entered for the same
                 grade. The banner lists the grade, section and row.
        ORANGE = the same title exists only in other grades (listed). It is
                 not entered for your grade, so you can proceed. Also orange
                 when no Grade is chosen yet, as a reminder to pick one.
     The table below highlights the matching rows in the same colours and has
     a Grade column. Filters and search cover ALL rows, Done and Pending.
   - Month and Grading Period come from the sheet. Session Duration is
     optional; Mode of Delivery fills in by itself like the sheet formula:
     Synchronous if a duration is chosen, else Asynchronous.
   - Submit saves to the next empty row. After saving, only the Title is
     cleared so you can enter the next resource for the same class.
   - Pencil button (left of each row in the panel) edits a saved row.

  PENDING TAB
   - Only rows with Status Pending. Search + Teacher/Subject/Grade/Section.
   - The number of pending rows is a yellow badge on the Pending tab (visible
     from every tab) and at the top of the list ("22 pending", or
     "22 pending - 5 shown" when a filter is on).
   - Tick rows, then "Duplicate to other sections": choose sections and the
     grade of each; copies are saved with Usage = Non-unique (originals are
     not changed). Copies are skipped if the same title is already entered
     for that section.
   - "Done" on a row, "Mark selected as Done", or "Mark all as Done (n)"
     (all rows shown; with a filter on, only those). A pop-up in the middle
     of the screen, in the system's theme, asks you to confirm. Only rows
     still Pending in the sheet are changed. Delete-account and
     reject-request also use this pop-up, and short notices appear at the
     bottom of the screen instead of the browser's own boxes.
   DONE TAB: rows with Status Done.

  CSV BUTTON: downloads only the PENDING rows of the selected form in the
   exact format of TCUPLOAD / OERUPLOAD / ARUPLOAD: the header row is copied
   as it is (nothing renamed or reordered) and the values are what the upload
   sheet shows. Upload row n belongs to source row n+1. Check that the upload
   sheets have formulas down to the last row.

  STATS TAB (per form): weeks x tools (CLE Digital Authoring Tool for Teacher
   Created, OER Type for OER, Resource Type for AR), counts and totals,
   filters by Status and week range. Week 1 starts at Weekly Usage D2.

  DATA OVERVIEW (dropdown, pop-ups)
   - Overall: all three forms - cards, pie chart (red = Teacher Created,
     yellow = OER, green = AR), weeks x forms, tools used.
   - Weekly Usage: mirrors the "Weekly Usage" sheet (TC blue, OER orange,
     TC+OER green, totals and the two Check lines, which should be 0). It
     adds a RANK column: teachers ranked by Total Usage from highest to
     lowest (1st, 2nd, 3rd ... with gold, silver and bronze for the top
     three). Equal usage shares the same rank; no usage shows a dash. The
     list is sorted by rank by default; "Order of the sheet" and "Total
     weeks" are in the sort dropdown. Rank is always calculated over all
     teachers, so searching or filtering does not change it.
   - Section Weekly Usage: mirrors "Weekly Usage (Sections)".

  PROFILE ICON (top right): Change password, Sign out, and for admins
   Accounts.

  SPEED AND RELOAD: each sheet's rows are kept for 3 minutes and new/edited
   rows appear at once. The reload button re-reads the Google Sheet. If you
   reload the browser page you stay signed in on the same screen with the
   last data, which is then refreshed quietly (same browser tab only; sign
   out erases it).


---------------------------------------------------------------------
 D. ACCOUNTS AND SECURITY
---------------------------------------------------------------------
  Roles: admin (everything + Accounts), encoder (add/edit/duplicate/done,
  stats, CSV), viewer (read only).
  CREATE AN ACCOUNT: profile icon > Accounts > name, username, role,
   temporary password (Generate button) > Create account.
  REQUEST AN ACCOUNT: the sign-in page has a "Request an account" link. The
   person chooses a username and password; it is saved (password hashed) in
   a hidden "Requests" tab. A red number by the admin's name shows waiting
   requests; in Accounts the admin picks a role and clicks Approve/Reject.
   Max 20 requests per hour.
  Other actions: change a role, reset a password, disable/enable, delete. The
   last active admin cannot be disabled, demoted or deleted.
  Sessions last 12 hours (7 days with "Keep me signed in"). After 5 wrong
   passwords an account is locked for 10 minutes.
  Accounts live in a hidden "Users" tab of the Google Sheet (salted hashed
   passwords only). Anyone who can EDIT the sheet can open it, so share the
   sheet only with people you trust. Forgot the only admin password? Unhide
   "Users" (View > Hidden sheets), delete the rows under the header, reopen
   the website: it asks for the first admin again (needs your SETUP_CODE).
  After the first admin exists, change SETUP_CODE to a new secret word.


---------------------------------------------------------------------
 E. COPYING THE GOOGLE SHEET (new quarter / school year)
---------------------------------------------------------------------
  File > Make a copy. The copy has the script (and the Users tab, so the same
  logins work), but NOT the deployment. In the copy: Extensions > Apps
  Script > Deploy > New deployment (Web app, Me, Anyone) > Authorize, copy
  the NEW /exec URL and use it in the website. The old URL still points to
  the old sheet. If you delete the Users tab in a copy, the script creates a
  new empty one and the website asks for a first admin again.
  A brand-new blank sheet needs Code.gs pasted in and the same tab names and
  columns.


---------------------------------------------------------------------
 F. UPDATING THE SCRIPT LATER
---------------------------------------------------------------------
  Paste the new Code.gs, Save, then Deploy > Manage deployments > pencil >
  Version: New version > Deploy. The URL stays the same. (Saving alone is not
  enough.) Each copy of the sheet has its own script.


---------------------------------------------------------------------
 G. HOSTING ON YOUR OWN DOMAIN (Hostinger)
---------------------------------------------------------------------
  Needs a Hostinger WEB HOSTING plan with File Manager (not Website Builder).
  1. Rename usage-website-bootstrap.html to index.html.
  2. hPanel > Websites > Dashboard > File Manager > public_html > Upload
     index.html (remove any default placeholder page). For a subdomain
     (usage.yourdomain.com) create it under Domains > Subdomains and upload
     into its folder.
  3. SSL page: enable SSL / Force HTTPS.
  4. Open https://yourdomain.com, paste the Web App URL, sign in.
  Do NOT upload Code.gs. Replace index.html for updates and press Ctrl+F5.


---------------------------------------------------------------------
 H. DATES SHOW ONE DAY OFF (time zones)
---------------------------------------------------------------------
  Cause: the Apps Script project has its own time zone, which can differ
  from the Google Sheet's. Old versions saved the typed date as midnight in
  the SCRIPT time zone, so the sheet could show the day before.
  Current Code.gs reads and writes dates in the Google Sheet's time zone.
  To repair rows saved by old versions (once per sheet):
    1. File > Make a copy (backup).
    2. In Apps Script choose function  checkFormDates  > Run > open the
       Execution log: it shows both time zones and what would change.
    3. If the examples are right, run  fixFormDates.
  It only changes dates that are exactly midnight in the script time zone but
  not in the sheet's time zone. Dates typed by hand are not touched.


---------------------------------------------------------------------
 I. TROUBLESHOOTING
---------------------------------------------------------------------
  "Cannot reach the script, or it is the old version": wrong URL, access not
     "Anyone", or you did not deploy a New version (section F). Each
     deployment has its own URL; use the one you updated.
  "Open Code.gs, change SETUP_CODE...": set your own SETUP_CODE (step B3),
     save, deploy a new version.
  "Wrong username or password" / "Too many wrong attempts": check spelling;
     after 5 failures wait 10 minutes or ask an admin to reset the password.
  "Your account is read-only": the role is viewer; an admin can change it.
  Dropdowns empty / text box: add a dropdown rule to that column on row 3, or
     fill the INDEX tab.
  Grading Period / Month / Mode blank on a new row: the formulas do not reach
     that row; fill them down in the sheet.
  Pending CSV says no Pending rows: no row in that sheet has Status Pending.
  Weekly Usage pop-up "Sheet not found": the error lists the tabs found; the
     script accepts names like "Weekly Usage (Sections)".
  "update Code.gs ... Unknown action": the script is older than the website;
     deploy the new Code.gs as a New version.
  Page looks plain (no styling): no internet for Bootstrap/fonts.


---------------------------------------------------------------------
 J. CHANGING THE LOOK / COLUMNS
---------------------------------------------------------------------
  Colors and fonts: the DESIGN TOKENS block at the top of the <style> in the
  HTML (--green is #00B7CD, plus --bg, --panel, --dot and the --f-* fonts).
  Logo: replace the base64 image in the <img> tag or point src to logo.png.

  LOOK AND BEHAVIOUR (all in the one HTML file):
   - Background: a still dot grid (20px, dots --dot on --bg). No script.
   - Glass sheet switcher: /TEACHER CREATED /OER /AR /DATA OVERVIEW sit in a
     glass pill (cyan active item). In Chrome and Edge the glass bends what is
     behind it (SVG refraction, the <filter id="glassf"> at the top of the
     page body); other browsers get a plain frosted glass.
   - Cursor glow: a soft cyan spotlight follows the pointer inside the cards
     and the glass pill, and the card border lights up. Look for the
     "cursor spotlight" block in the script (colour: rgba(0,183,205,...) in the
     CSS next to ".cardx::before").
   - Usage Input header On/Off: the switch at the right of the header hides or
     shows it (remembered in this browser).
   - Fit: on a large enough window (about 1200px wide and 600px tall of
     page area) the Form tab fills the window with no page scroll; the list on
     the left scrolls inside. On a smaller window the page scrolls as usual.
     Turn the Usage Input header Off to gain space.
   - Credit and version in the footer: edit the CREDIT line in the script,
        const CREDIT={name:'John Paul Romano',version:'1.0',built:'Nov 11, 2026'};
     (also shown on the sign-in card).
  If you add or move sheet columns, change the letters in BOTH Code.gs (CFG
  block) and the HTML (SHEETS block), deploy a new version, refresh the page.
  Good to know: the website does not delete rows (delete duplicates in the
  sheet, or fix them with the pencil button). It cannot pull data from Moodle
  by itself.
