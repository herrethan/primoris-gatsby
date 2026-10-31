# PR title

Add Google Sheets and personalized admissions replies through a Netlify webhook

# PR description

Keep the existing Netlify `Learn more` form as the intake system and add an optional
outgoing webhook to Apps Script. Netlify retains submissions independently of
Google availability; Apps Script records each inquiry in Sheets and emails the
configured admissions recipients. Optional family replies use lower/upper-school
wording, selected-interest sections, personalized greetings and an answer recap,
with a Primoris Admissions signature and school-hosted images. No PDFs are attached.

Remove the React form replacement, rollout flag, preview route, Cloudflare Worker
and Turnstile dependencies. Preserve the existing CMS form, honeypot and Netlify
notifications. The backend authenticates a private webhook token, checks the form
ID, validates original form fields, stores literal text and Boolean interest columns,
and prevents duplicate rows/emails on replay using the Netlify submission ID.

Existing email quota/retry handling is retained. Missing webhook deliveries require
manual reconciliation/replay; automated retries for admissions email do not recover
missing Sheet rows. Applicant replies have independent status/retries. Setup safely appends reply
columns and skips historical inquiries. Lower school is Pre-K–4; upper school is grades 5–12. Shadowing uses the supplied responder links, with an explicit Google sign-in
notice and the option to reply to admissions instead. The owner must verify access
using an external Google account.

## Deployment

The Netlify owner adds an HTTP POST notification for `Learn more`; a collaborator
plan upgrade is not required. Deploy Apps Script under the school account and set
`WEBHOOK_SECRET`, `NETLIFY_FORM_ID`, `NOTIFICATION_RECIPIENTS` and optionally the
existing `SPREADSHEET_ID`. Keep the credential-bearing webhook URL out of source.
Deploy the website image assets, run setup to migrate the Sheet, configure
`AUTO_REPLY_ENABLED` (the grade boundary defaults to 5), then update the Apps Script web
deployment. Website deployment alone does not configure Google or Netlify.

See the [inquiry guide](../integrations/inquiry-production/README.md) for sharing vs.
creating a school-owned Google project, trigger migration, setup, verification,
missed-submission replay and retirement of the obsolete Cloudflare services.

## Validation

`npm test` and the production Gatsby build pass using Node 16.20.2. Built Contact
HTML was checked for the original Netlify form and honeypot, with no Turnstile or
React replacement; the removed test route is absent. Backend tests mock Google
services. Live webhook payloads, redirects/failures, permissions and sender identity
still require an end-to-end sample after deployment.
