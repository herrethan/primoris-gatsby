# Inquiry integration: Netlify Forms → Google Sheets

The existing CMS-managed `Learn more` form posts to Netlify Forms. Netlify stores
and filters submissions before sending an additional webhook to Apps Script.
Apps Script writes a Sheet row, emails admissions and optionally replies to the family. Google failures do not block
website submissions. The form already includes `netlify-honeypot="legit"` and its
hidden input; Netlify also uses Akismet. No Worker, Turnstile, alternate React form,
preview route, browser-to-Google request, or rollout flag is required.

```text
Website → Netlify Forms (original submission retained)
                  ├→ existing Netlify notification
                  └→ Apps Script webhook → Google Sheet → admissions email
```

Applicant replies use the supplied lower- and upper-school wording with a
personalized greeting, submitted-answer recap and Primoris Admissions signature.
Tour/shadow sections appear only for their selected interests. Other selected
interests receive a brief acknowledgment. There are no PDF attachments.

## Enable applicant replies

1. Deploy the website assets first. Email images use school-hosted URLs under
   `https://primorisacademy.org/img/`: existing school photos (`blob-1.jpg`,
   `blob-3.jpg`, `hero-4.jpg`, `hero-1.jpg`) and the locally saved Primoris logo
   (`admissions-email/primoris-logo.jpg`). The original Canva links failed TLS hostname
   validation and are not used. There are no Canva/Google-hosted image dependencies.
2. Replace `Code.gs` in Apps Script with the entire updated file. Keep the current
   Sheet ID. Run **setupProduction** again before updating the deployment. It adds
   four reply-tracking columns to the known old layout without changing old rows;
   historical inquiries are marked **Skipped**, so they do not get welcome emails.
   Existing unrelated columns in positions 24–27 cause a layout error rather than
   being overwritten. Stop concurrent processing while migrating the Sheet.
3. The confirmed split is **Pre-K–4 lower school; grades 5–12 upper school**.
   `UPPER_SCHOOL_MIN_GRADE` defaults to `5`; set it only to override that boundary.
   Grade is taken exactly as submitted, with no next-year increment.
4. Set `AUTO_REPLY_ENABLED` to `true` when ready, and publish a new web-app version
   using **Deploy → Manage deployments → Edit → New version → Deploy** to keep the
   webhook URL. Until enabled, new rows are marked **Skipped** for replies; enabling
   it later does not send retroactive emails to those rows.
5. The tour button uses the verified public Tour Inquiry Form. Shadowing uses the
   supplied lower-school form and the responder destination of the supplied
   upper-school short link, `https://forms.gle/Kd429cj2uQQGHNTZ7`. Sign-in is
   intentional: both buttons say **Google sign-in required**, and families can reply
   to admissions instead. The owner should verify both forms with a personal Google
   account outside the school that has not been explicitly invited. Signed-out
   requests return HTTP 401; this does not establish whether outside Google accounts
   are permitted. Keep form editing restricted, while allowing external Google
   accounts to respond. `LOWER_SHADOW_URL` and `UPPER_SHADOW_URL` optionally override
   the defaults with responder `/viewform` URLs; `/edit` links are rejected.
6. Test with controlled inboxes: lower tour-only, upper shadow-only, applying in
   grades 5–8, and newsletter-only. Check HTML and plain text, sender, Reply-To,
   photos, and the two independent email status columns. The sender display name
   is Primoris Admissions; the actual sender remains the deploying/trigger account.

Lower-school shadow text describes three days. Upper-school text specifies one day
only for entering grades 7–9; other upper grades are directed to admissions for the
appropriate visit. Both retain the December/May restriction. Upper tours retain the
provided Tuesday–Thursday, 10 AM, September–November schedule. The updated recommendation
policy covers newly enrolled Middle School students in grades 5–8 and appears only for applicants
who select **Applying**, in grades 5–8. Introductory school information and the answer
recap appear in every reply. The signature uses the office/text numbers from the
source email, with no personal staff name or year-specific rankings.

Two emails may be sent per submission, so account recipient quotas cover both.
The four new columns are **Reply status**, **Reply error**, **Reply attempts** and
**Reply next attempt at**. Recovery treats admissions and applicant email separately:
one failing does not resend the other. `Sending` left by interrupted execution becomes
`Needs review`; check the inbox before manually resetting it. Disabling
`AUTO_REPLY_ENABLED` also pauses pending applicant retries. The existing recovery
trigger is reused; no second trigger is needed.

Run `npm run preview:inquiry` for sample HTML and plain text in
`/private/tmp/primoris-email-preview`. Previews use sample names, local school images
and the confirmed grade-5 boundary; they do not send emails. These are local review
artifacts, not public routes. Production uses grade 5 unless overridden.

## Google account: share or recreate?

Sharing is enough to reuse the project and Sheet. Sharing alone does **not** change
the sender or migrate triggers. Editors can deploy a web app under their account;
installable triggers run as the account that created them. Use the school account
for both the web deployment and the recovery trigger. It must be an actual Google
account you can sign into, rather than only an email alias or group.

### Reuse the existing project (least work)

1. From the current account, share the Apps Script project with the school account
   as **Editor**. For a script bound to a Sheet, share the Sheet as Editor too.
   Share the existing inquiry Sheet as Editor in either case.
2. Sign into a separate browser profile with only the school account. Open the
   shared script, replace `Code.gs` with this file, and remove obsolete HTML bridge
   files if present. Save. Existing deployments keep their deployed version until
   updated; coordinate the cutover rather than updating the old Worker deployment.
3. In **Project Settings → Script properties**, configure the properties below.
   Keep `SPREADSHEET_ID` to preserve the original Sheet and rows. Project properties
   are shared by project editors; only grant editor access to trusted maintainers.
4. Run **setupProduction** from the editor under the school account and approve
   Sheets/email/trigger permissions. It reuses the Sheet and installs a ten-minute
   recovery trigger under this account. Do not reorder existing Sheet headings.
5. Under the school account, choose **Deploy → New deployment → Web app**,
   **Execute as: Me**, **Who has access: Anyone**. Authorize and copy the `/exec` URL.
   Workspace policy must permit public web apps for an external webhook to work.
6. Have the Netlify owner configure the webhook below, deploy this website branch,
   and verify an end-to-end sample. Confirm the email sender is the school account.
7. After cutover, sign into the old Google account and remove its
   `retryNotifications_` trigger from **Triggers**. Other users cannot see or manage
   each other's triggers. Keep the school account's trigger. Archive the old web
   deployment and disable the obsolete Cloudflare Worker once the new flow works.
   Remove old Turnstile/relay settings from Google and retire the Cloudflare widget.

The project and Sheet may still be owned by the original account. Sharing and
redeploying changes the execution identity, not ownership. If long-term ownership
must move to the school, transfer it if your Workspace policies permit; otherwise
create a school-owned project as below.

### Create a school-owned project (clean ownership)

1. Sign into the school Google account and create a standalone project at
   https://script.google.com/. Paste this repository's `Code.gs`; no HTML file needed.
2. Add the properties below. Properties, authorizations, deployments and triggers
   need configuring in the new project; copying source does not migrate them.
3. To retain the data, share the old Sheet as Editor and set `SPREADSHEET_ID` to its
   ID. To create a new school-owned Sheet, omit that property before running setup.
   Copying the Sheet to the school account and using the copy's ID is another way
   to retain rows with school ownership; pause processing during the copy/cutover.
4. Run **setupProduction**, authorize, and create the web deployment as above.
5. Switch the Netlify webhook to the new URL, test, then retire old deployments and
   triggers. Never run old and new projects against the same Sheet concurrently:
   Apps Script locks are project-specific.

For future attachments, share the PDFs with the school account as Viewer, or upload
school-owned copies to its Drive. They do not need public link sharing.

## Script properties

| Property | Value |
| --- | --- |
| `NOTIFICATION_RECIPIENTS` | Comma-separated admissions email addresses |
| `WEBHOOK_SECRET` | 64 random lowercase hex characters; generate locally with `openssl rand -hex 32` |
| `NETLIFY_FORM_ID` | ID of the site's `Learn more` form; ask the Netlify owner for it |
| `SPREADSHEET_ID` | Existing inquiry Sheet ID, or omit only when creating a new Sheet |
| `AUTO_REPLY_ENABLED` | `true` to send applicant replies; otherwise disabled |
| `UPPER_SCHOOL_MIN_GRADE` | Optional override of the confirmed first upper-school grade; defaults to `5` |
| `LOWER_SHADOW_URL` | Optional lower-school responder `/viewform` URL override; defaults to supplied form |
| `UPPER_SHADOW_URL` | Optional upper-school responder `/viewform` URL override; defaults to supplied form |

The form ID is not its display name or HTML `id="learn-more"`. The Netlify owner
can obtain it from the form's dashboard URL or the Netlify API. Configure it before
running setup. Removed properties (`TURNSTILE_SECRET_KEY`, `RELAY_SECRET`, allowed
origins/hostnames and submission limits) are no longer used.

## Netlify owner's steps

1. Keep Netlify form detection enabled. Deploy this branch: Contact always renders
   the original form from Markdown, including its existing honeypot.
2. Under **Forms → Submission notifications → Add notification**, add an outgoing
   HTTP POST webhook for **Learn more** only. Preserve the existing notifications.
3. Use this private destination (replace placeholders locally):

   ```text
   https://script.google.com/macros/s/DEPLOYMENT_ID/exec?token=WEBHOOK_SECRET
   ```

4. Keep the complete URL private. It is a bearer credential, sent over HTTPS, stored
   only in Netlify notification settings and Google Script Properties. Do not put
   it into site HTML, source, PR comments, screenshots or public logs. Rotate it in
   both places if exposed. Apps Script's documented `doPost` event does not expose
   incoming HTTP headers, so this direct receiver does not verify Netlify's
   `X-Webhook-Signature`. A header-verifying relay would be a different design.
5. Submit sample data through the deployed Contact page. Check the retained Netlify
   submission, one Sheet row, Boolean interests, admissions email and its sender.
   Repeat with no interests and multiple interests. Verify the actual webhook
   payload matches the fixture below; automated tests do not validate a live service.
6. Replay the same original submission to confirm it creates no second row/email.
   Test a wrong token: it must fail without writing a row or sending email.

Netlify supplies a JSON submission object with `id`, `form_id` and `data`. Expected
field names match the original form, not the removed React form:

```json
{
  "id": "original-netlify-submission-id",
  "form_id": "configured-netlify-form-id",
  "data": {
    "student-name": "Sample Student",
    "parent-first-name": "Sample",
    "parent-last-name": "Parent",
    "phone": "0123456789",
    "email": "your-test-inbox@example.com",
    "grade": "3",
    "interest[]": ["tour", "speak-with-parent", "speak-with-parent-elementary"]
  }
}
```

The receiver also accepts `interest` and comma-separated checkbox strings. A stale
parent-level radio value is ignored if the parent-contact checkbox is unchecked.
It checks the secret, expected form ID, field validity and honeypot, rejects marked
spam, stores user strings as literal Sheet text, and deduplicates by Netlify ID.
The form ID check is filtering, not authentication; secrecy of the token matters.

## Failures and recovery

Netlify remains the authoritative intake record. A webhook failure can leave a
submission in Netlify without a Sheet row. **There is no automatic Netlify-to-Sheet
reconciliation in this integration.** Compare verified Netlify submissions with
Sheet IDs regularly; preserve the existing Netlify notification as an independent
alert. Do not assume Netlify will retry every failure: Google ContentService uses
redirects and cannot choose arbitrary HTTP response status codes, so live delivery
and failure behavior must be checked during setup.

To recover a missed row, obtain its original JSON from the Netlify owner/API. Set
`REPLAY_SUBMISSION_JSON` in Script Properties to that object and run
**replaySubmission** in the editor. It uses the same validation and deduplication,
and deletes the property after success. Keep the original ID; replaying the same
submission is safe. Do not paste student information into public debugging tools.
If the JSON exceeds a Script Property's size limit, the owner can POST it directly
to the private webhook URL using a local client instead.

Email recovery is separate: saved rows survive notification errors. The ten-minute
trigger retries `Pending`/`Failed` messages, up to five attempts with increasing
delays, processing up to five rows per run. Quota shortages leave messages pending.
`Sent` means Google accepted the email, not guaranteed inbox delivery. `Needs review`
means attempts were exhausted or delivery is uncertain. Check the inbox by submission
ID before resetting status to `Pending`, attempts to `0` and clearing the next time.
Do not delete/reorder headings or rows while processing is running.

To disable Google automation, remove its Netlify notification; normal form intake
and existing notifications continue. Merging the website PR does not deploy Apps
Script or change Netlify account settings. No Netlify collaborator upgrade is needed:
the current account owner can configure the webhook.

## Validation

Use the repository's existing Node 16 environment and installed dependencies:

```sh
npm test
npm run build
```

Tests mock Google services and exercise webhook authentication, field mapping,
validation, literal Sheet values, interest columns, duplicates, notification quotas,
retry/exhaustion, uncertain mail, manual replay and setup identity. They send no real
emails. Live Netlify → Google delivery, account permissions and inbox delivery must
be verified after setup. Node 16 is end-of-life; upgrading Gatsby is separate work.

## References

- [Netlify notifications](https://docs.netlify.com/manage/forms/notifications/)
- [Netlify spam protection](https://docs.netlify.com/manage/forms/spam-filters/)
- [Apps Script web apps and request parameters](https://developers.google.com/apps-script/guides/web)
- [Project sharing and deployment](https://developers.google.com/apps-script/guides/collaborating)
- [Trigger execution accounts](https://developers.google.com/apps-script/guides/triggers/installable)

## October 30 upper-school email update

The attached upper-school email supersedes the earlier recommendation wording:
teachers do not write recommendation letters for **newly enrolled Middle School
students in grades 5–8**. This note still follows the selected Applying interest.
Upper-school families selecting Tour also receive the November 7, 2026 open-house
invitation (11 AM–12:30 PM Eastern). The invitation stops appearing at 11 AM Eastern
on November 7. The supplied RSVP edit URL is changed to its responder `/viewform`
URL; its access could not be verified automatically. Test with an outside account.
The email includes a reply-to-admissions fallback for RSVP access problems.

With the Netlify webhook already configured, retain its existing destination and
secret. Update the script, run setup, enable replies and publish a **new version of
the existing deployment** to retain the webhook URL. Verify the deployed website
hosts the email logo. Submit controlled lower/upper-school tests and check Netlify,
Sheet rows, admissions notification and family reply. Do not create a new deployment
URL unless the Netlify owner will update the webhook destination too.
