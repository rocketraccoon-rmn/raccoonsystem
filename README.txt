=====================================================================
 USAGE FORM TOOLKIT  -  Teacher Created / OER / AR data entry
 For the school weekly-usage Google Sheet (SY 2026-2027 workbook)
=====================================================================

WHAT IS IN THIS FOLDER
  1. usage-website-bootstrap.html - the data-entry website (dark design
                           built with Bootstrap). Double-click to open in
                           Chrome or Edge. Needs internet (it loads
                           Bootstrap and the fonts from the internet).
  2. Code.gs             - the Google Apps Script. It lives inside your
                           Google Sheet and receives what the website sends.
  3. logo.png            - the logo (already built into the website).
  4. README.txt          - this guide.

HOW IT WORKS (in one picture)
  Website (usage-website-bootstrap.html)  --->  Apps Script (Code.gs)  --->  Google Sheet
  A website cannot write into a Google Sheet by itself. The script inside
  the sheet does the writing. The website only needs the script's URL
  (the "Web App URL" that ends in /exec).


---------------------------------------------------------------------
 A. REQUIREMENTS
---------------------------------------------------------------------
  - A Google account that OWNS (or can edit) the Google Sheet.
  - Google Chrome or Microsoft Edge, with internet (Bootstrap, its icons
    and the fonts load from the internet).
  - The Google Sheet must have these tabs, named exactly:
        Teacher Created     OER     AR     INDEX
  - Data starts on row 3 (rows 1-2 are headings).
  - The input columns below must stay in the same positions. If you add or
    move columns, see section H.

  INPUT COLUMNS THE FORM WRITES TO (everything else is left alone):

  Teacher Created
     C Date | F Teacher | G Subject | H Grade Level | I Section
     J CLE Digital Authoring Tool | K Title | L Resource (New/Old)
     M Resource Creation | N Resource Usage | O Session Duration
     Q Learning Activity/Strategy | R Status

  OER
     C Date | F Teacher | G Subject | H Grade | I Section | J Title
     K OER Type | L OER Usage | N Session Duration
     O Learning Activity/Strategy | P Status

  AR
     C Date | F Teacher | G Subject | H Grade | I Section | J Title
     K Resource Type | L AR Usage | M Session Duration
     O Learning Activity/Strategy | P Status

  Formula columns (Month, Grading Period, Mode of Delivery, Duplicate?,
  etc.) are NEVER written by the form. Keep their formulas in the sheet.
  Month and Grading Period fill in by themselves from the Date.

  DROPDOWN CHOICES
  The form copies the dropdown lists (data validation) already set up in
  your sheet. If a column has no dropdown, it falls back to the INDEX tab
  (A Teacher, D Subject, M Section, V Grade, P Activity Type,
  S Learning Activity, Y OER Type), or a plain text box.


---------------------------------------------------------------------
 B. FIRST-TIME SETUP  (about 3 minutes)
---------------------------------------------------------------------
  1. Open your Google Sheet.
  2. Click  Extensions > Apps Script.
  3. Delete the sample code. Open Code.gs from this folder in Notepad,
     copy everything, and paste it into the Apps Script editor.
     Click the Save icon.
  3b. Near the top of the code, change
         const SETUP_CODE = 'change-me';
      to your own secret word (for example 'blue-raccoon-2026'). You need it
      once, to create the first admin account. Save again.
  4. Click  Deploy > New deployment.
     Click the gear icon, choose  Web app, then set:
         Execute as:        Me
         Who has access:    Anyone
     Click Deploy.
  5. Click Authorize access, choose your Google account.
     If Google shows "Google hasn't verified this app", click
     Advanced > Go to (project name) (unsafe) > Allow.
     This is normal for your own script.
  6. Copy the Web app URL (it ends in /exec).
  7. Double-click usage-website-bootstrap.html (opens in Chrome/Edge).
     Paste the Web app URL on the sign-in page. The first time, the page
     asks you to create the ADMIN account: type the SETUP_CODE from step
     3b, your name, a username and a password (min. 8 characters).
     You are then signed in. The page remembers the URL.


---------------------------------------------------------------------
 C. DAILY USE
---------------------------------------------------------------------
  1. Open usage-website-bootstrap.html and sign in with your account.
  2. Click the sheet at the top: Teacher Created, OER or AR.
  3. Form tab:
       - Fill in the fields. Required fields are marked with a red *.
       - Session Duration is optional. Mode of Delivery fills in by
         itself, the same way as in the sheet: Synchronous when a Session
         Duration is chosen, Asynchronous when only the Date is filled.
       - Status defaults to Pending. Change it if needed.
  4. BEFORE submitting, check the title in the panel below the form
     ("Check existing titles"). It fills in as you type the Title.
         Green  = no entry with this title yet. You can proceed.
         Orange = the title exists in other sections (listed with row
                  numbers). This is fine; a new section may proceed.
         Red    = already entered for the section you selected.
     You can also use the search box and the Teacher / Subject / Grade /
     Section / Status filters to look at older data. It searches ALL rows,
     Done and Pending.
  5. Click Submit -> the entry is added to the next empty row of the
     sheet. After a successful submit the Title is cleared and the other
     fields stay, so you can enter the next resource for the same class.
  6. Pending tab (each of Teacher Created, OER and AR):
       - Shows only the rows with Status Pending. Use the search box and
         the Teacher / Subject / Grade / Section filters, like in the
         "Check existing titles" panel of the form.
       - Tick the rows you want (or use the top checkbox for all rows
         shown), then click "Duplicate to other sections". The small
         copy button at the end of a row does the same for that one row.
       - In the pop-up: tick the sections to copy to and choose the grade
         of each section. The preview shows what will be saved.
       - Each copy is saved with Usage = Non-unique. The original rows
         are not changed. The status of the copies (default Pending) and
         their date (default: same date as the original) can be changed
         in the pop-up.
       - A copy is skipped if the same title is already entered for that
         section, or if the section is the row's own section.
       - "Done" button on a row: changes its Status in the Google Sheet
         to Done.
     Done tab: rows with Status Done.
  7. Edit button (in the title-check table): change a title, section,
     status, etc. for an existing row. Only the fields you change are
     written.


  8. LAYOUT of the Form tab: the "Check existing titles" filter is on the
     LEFT, the data-entry form is on the RIGHT (on a small screen the form
     comes first).

  9. CSV button (at the right of the tabs, for the selected sheet)
     Downloads a .csv with ONLY the rows whose Status is Pending, taken
     from TCUPLOAD (Teacher Created), OERUPLOAD (OER) or ARUPLOAD (AR).
     The header row is copied exactly from row 1 of that upload sheet
     (nothing renamed, nothing reordered, extra columns such as Holder and
     Checking included), and every value is exactly what the upload sheet
     shows. Upload row n is matched to source row n+1, the way your upload
     sheets are built. If the upload sheet has no new rows yet, check that
     its formulas reach the last row.

 10. STATS tab (Teacher Created, OER or AR)
     Table of weeks x tools: every tool/resource type used (CLE Digital
     Authoring Tool for Teacher Created, OER Type for OER, Resource Type
     for AR) with the count in each week and totals. Filter by Status and
     by week range. A week runs Monday to Sunday; Week 1 starts on the
     date in cell D2 of the "Weekly Usage" sheet, the same numbering as
     that sheet.

 11. DATA OVERVIEW (top bar, after /AR) is a dropdown with three pop-up
     dashboards:
       - Overall: combines the three forms. Summary cards, a PIE CHART of
         the usage share of each form (red = Teacher Created, yellow = OER,
         green = AR), a weeks x forms table, and a table of every
         tool/resource used with the count per form. It has Status and
         week-range filters.
       - Weekly Usage: mirrors the "Weekly Usage" sheet: every teacher with
         Total Usage, Total Weeks, TC Weeks, OER Weeks and one column per
         week (TC = blue, OER = orange, TC+OER = green), the TOTAL USAGE row
         and the two "Check" lines (both should be 0). Search, sort, and
         "Only with usage" filter.
       - Section Weekly Usage: the same, per section. It mirrors the
         "Weekly Usage (Sections)" sheet; only the name in the website is
         changed, the Google Sheet tab keeps its name.
     The numbers come straight from those sheets, so they always match.
     The Stats tab inside each form is still there and unchanged.

 12. ACCOUNTS (admins only): open the profile icon at the top right >
     Accounts. Create accounts, choose the role, reset a password,
     disable/enable or delete an account (see section F). It is no longer
     a tab in the forms. A red number next to your name means there are
     account requests waiting (see below).

 12b. REQUEST AN ACCOUNT: the sign-in page has a "Request an account" link.
     The person enters a name, a username, the password they want and an
     optional note. Nothing is created yet: the request is saved (with the
     password only as a hash) in a hidden "Requests" tab. An admin opens
     Accounts, sees "Account requests", picks a role and clicks Approve
     (the person can then sign in with the password they chose) or Reject.
     At most 20 requests per hour are accepted, to stop spam.

 13. SPEED: the page keeps each sheet's rows in memory for 3 minutes and
     adds new or edited rows on screen at once, so switching tabs does not
     reload everything. The round-arrow button next to CSV reloads the data
     (and the dropdown lists) from the Google Sheet. The script also caches
     the dropdown lists for 10 minutes and the login check for 5 minutes.
     If someone else edits the sheet, press the reload button to see it.
     Saving a row still takes a couple of seconds: that part is Google.

 14. BACKGROUND: a still gradient dot field (violet to cyan). The hover
     lens effect was removed on request. To change the dots, see the Dot
     Field block near the end of the script in the HTML file (GAP = dot
     spacing, FROM and TO = the two colors).

 14b. RELOADING THE PAGE (browser reload icon): you stay signed in and on
     the same sheet and tab, with the last data shown at once. The page
     then refreshes the data from the Google Sheet in the background. This
     works inside the same browser tab. If you close the tab, you must sign
     in again (unless you ticked "Keep me signed in"). Signing out erases
     the saved screen and data.

 15. ROW NUMBERS: the "Row numbers" button (next to CSV) shows or hides the
     row number column in the tables. They are hidden by default so the
     edit (pencil) button stays visible.
---------------------------------------------------------------------
 D. MAKING A COPY OF THE GOOGLE SHEET (new quarter / new school year)
---------------------------------------------------------------------
  A copy keeps the script code, but NOT the deployment. The old URL still
  points to the ORIGINAL sheet. For each copy:
  1. File > Make a copy.
  2. Open the copy > Extensions > Apps Script (the code is already there).
  3. Deploy > New deployment > Web app > Execute as: Me,
     Who has access: Anyone > Deploy > Authorize.
  4. Copy the NEW /exec URL, paste it in the website, click Connect.
  Use the same usage-website-bootstrap.html file. Only the URL changes.

  WARNING: if you paste the old URL by mistake, entries go into the old
  sheet.

  If you create a brand-new blank sheet instead of copying, you must also
  paste Code.gs into it (step B3) and recreate the same tab names and
  column layout (section A). Copying is much easier.


---------------------------------------------------------------------
 E. UPDATING THE SCRIPT LATER
---------------------------------------------------------------------
  If you receive a new Code.gs:
  1. Extensions > Apps Script. Replace all the code. Save.
  2. Deploy > Manage deployments > click the pencil icon >
     Version: New version > Deploy.
  The URL stays the same. (Saving the code alone is NOT enough; the web
  app keeps running the old version until you deploy a new version.)
  Each copy of the sheet has its own script, so update each one.


---------------------------------------------------------------------
 F. ACCOUNTS AND SECURITY (login)
---------------------------------------------------------------------
  Everything except the connection test needs a signed-in account.
  ROLES
     admin    - everything, plus Accounts (profile icon menu)
     encoder  - add, edit, duplicate, mark done, stats, CSV
     viewer   - read only (view, filters, stats, CSV)
  CREATE AN ACCOUNT (admin): profile icon > Accounts > fill in name, username, role and a
  temporary password (the Generate button makes one) > Create account. Give
  the username and password to the user; they can change it from the user
  menu at the top right > Change password.
  OTHER ACTIONS: change a role, Reset password, Disable/Enable, Delete.
  The last active admin cannot be disabled, demoted or deleted.
  SIGN-IN: stays for 12 hours, or 7 days with "Keep me signed in". After 5
  wrong passwords an account is locked for 10 minutes. Forgot the admin
  password? Another admin can reset it. If you are the only admin, open the
  Google Sheet, unhide the "Users" sheet (View > Hidden sheets), delete its
  rows below the header, then open the website: it asks for the first admin
  again (needs your SETUP_CODE).
  WHERE ACCOUNTS ARE KEPT: in a hidden sheet named "Users" inside your
  Google Sheet. Only salted, hashed passwords are stored, never the real
  password. Anyone who can EDIT your Google Sheet can still open that sheet,
  so share the Google Sheet only with people you trust. The old PASSCODE
  setting no longer exists.


---------------------------------------------------------------------
 G. TROUBLESHOOTING
---------------------------------------------------------------------
  "Enter the full URL ending in /exec"
      Paste the Web app URL from Deploy, not the Apps Script editor URL.

  Cannot connect / red message after Connect
      - Check that "Who has access" is set to Anyone.
      - Make sure you completed Authorize access.
      - After editing the script, deploy a NEW VERSION (section E).

  "Old script version: redeploy the new Code.gs"
      The sheet still runs an old script. Do section E.

  Dropdowns are empty or show a text box
      The column has no dropdown rule on row 3 and no matching list in the
      INDEX tab. Add a data-validation dropdown to that column in the
      sheet (row 3 is the one the form reads).

  Check-title panel shows fewer rows than the sheet
      Compare with the line "Loaded N rows from the sheet (X Done,
      Y Pending)". The page skips rows that have no Title and no Teacher.

  Entry added but Grading Period / Month / Mode is blank
      The formula columns do not extend to that row. Fill the formulas
      down in the Google Sheet.

  Date shows wrong or as a number
      Format column C in the sheet as a date.

  Something went to the wrong sheet
      You used the URL of a different copy. Check the URL (section D).


  "Cannot reach the script, or it is the old version"
      The Web App URL is wrong, or you did not deploy the new Code.gs as a
      New version (section E).

  "Open Code.gs, change SETUP_CODE..."
      Set your own SETUP_CODE (step 3b), save, deploy a new version.

  "Wrong username or password" / "Too many wrong attempts"
      Check the spelling; after 5 failures wait 10 minutes, or ask an admin
      to reset your password.

  "Your account is read-only"
      The account role is viewer. An admin can change it to encoder.

  Pending CSV says there are no Pending rows
      No row in the selected sheet has Status Pending.


---------------------------------------------------------------------
 H. IF YOU CHANGE THE SHEET'S COLUMNS
---------------------------------------------------------------------
  The column letters are set in two places:
    - Code.gs         -> the CFG block at the top
    - usage-website-bootstrap.html -> the SHEETS block inside the <script> section
  Change the letters in both so they match the new layout, then follow
  section E (new version) and refresh the website page.


---------------------------------------------------------------------
 I. GOOD TO KNOW
---------------------------------------------------------------------
  - The website is a local file. Your data goes only between your browser
    and your own Google Sheet. Do not upload the website to a public place.
  - It cannot pull data from Moodle by itself; you type the entries in the
    form.
  - It does not delete rows. If a row is a true duplicate, delete it in
    the Google Sheet (deleting rows in the middle can affect formulas, so
    check them afterwards) or fix it with the Edit button.
  - The title match ignores capital letters, extra spaces and punctuation.
  - New entries go to the first row after the last row that has data in the
    key columns (Date, Teacher, Title).

---------------------------------------------------------------------
 J. CHANGING THE LOOK OF THE WEBSITE
---------------------------------------------------------------------
  usage-website-bootstrap.html uses Bootstrap 5.3 and Bootstrap Icons
  (loaded from cdn.jsdelivr.net) plus Google Fonts.

  DESIGN
  - Background: dark with a dot pattern.
  - Colors: black panels with a green accent and a terminal-style look.
  - Cards have a glowing border that follows the mouse near their edges.
  - Fonts: Oswald (headings), Inter (body text), Poppins (buttons and
    tabs), JetBrains Mono (labels, tables, badges), Merriweather
    (description text).
  - Logo: built into the file (also saved as logo.png).

  WHERE TO CHANGE THINGS
  - At the top of the file, inside <style>, the "DESIGN TOKENS" block holds
    the colors (--bg, --dot, --panel, --green ...) and the fonts
    (--f-head, --f-body, --f-ui, --f-mono, --f-serif). Change them there.
  - To change the logo: replace the long data:image/png;base64,... text in
    the <img> tag (and the page icon at the top) with your new image, or
    point src to a file in the same folder, e.g. src="logo.png".
  - Layout: the form() function in the script holds the form layout.
    Change the col-md-* classes to resize fields.
  - Fully offline use: download bootstrap.min.css, bootstrap.bundle.min.js,
    the bootstrap-icons font and the Google Fonts files, keep them in the
    same folder, and point the <link>/<script> tags at those files.
