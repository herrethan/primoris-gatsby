// Mocked Google services. No real emails or Sheet writes.
const assert = require("assert")
const fs = require("fs")
const path = require("path")
const vm = require("vm")
const crypto = require("crypto")
const code = fs.readFileSync(path.join(__dirname, "Code.gs"), "utf8")
const data = {
  id: "12345678-1234-4123-8123-123456789abc",
  student: "=Student",
  first: "Parent",
  last: "Example",
  phone: "012345",
  email: "PARENT@example.com",
  grade: "3",
  interests: ["tour", "speak-with-parent", "speak-with-parent-middle"],
  legit: "",
}

function fixture(overrides = {}) {
  let now = Date.now()
  class Clock extends Date {
    constructor(...args) {
      super(...(args.length ? args : [now]))
    }
    static now() {
      return now
    }
  }
  const rows = []
  const props = Object.assign(
    {
      SPREADSHEET_ID: "sheet",
      NOTIFICATION_RECIPIENTS: "jlalibertealle@primorisacademy.org",
      WEBHOOK_SECRET: "a".repeat(64),
      NETLIFY_FORM_ID: "form-id",
    },
    overrides
  )
  const sheet = {
    getLastRow: () => rows.length,
    getRange: (r, c, h = 1, w = 1) => ({
      getValues: () =>
        Array.from({ length: h }, (_, i) =>
          Array.from(
            { length: w },
            (_, j) => (rows[r + i - 1] || [])[c + j - 1] || ""
          )
        ),
      setValues: values =>
        values.forEach((row, i) => {
          rows[r + i - 1] ||= []
          row.forEach((value, j) => {
            rows[r + i - 1][c + j - 1] = value
          })
        }),
      setValue: value => {
        rows[r - 1][c - 1] = value
      },
    }),
  }
  let sends = 0, failures = 0, quota = 100
  const messages = []
  const context = {
    ContentService: {
      MimeType: { JSON: "json" },
      createTextOutput: text => ({
        text,
        setMimeType() {
          return this
        },
      }),
    },
    Date: Clock,
    console: { log: () => {} },
    PropertiesService: {
      getScriptProperties: () => ({ getProperty: key => props[key] ?? null }),
    },
    SpreadsheetApp: {
      openById: () => ({ getSheetByName: () => sheet }),
      flush: () => {},
    },
    LockService: {
      getScriptLock: () => ({
        waitLock: () => {},
        tryLock: () => true,
        releaseLock: () => {},
      }),
    },
    Utilities: {
      DigestAlgorithm: { SHA_256: "sha256" },
      computeDigest: (_, text) =>
        crypto.createHash("sha256").update(text).digest(),
      base64EncodeWebSafe: value => Buffer.from(value).toString("base64url"),
    },
    MailApp: {
      getRemainingDailyQuota: () => quota,
      sendEmail: message => {
        sends++
        messages.push(message)
        if (failures > 0) {
          failures--
          throw new Error("Simulated email failure")
        }
      },
    },
  }
  vm.createContext(context)
  vm.runInContext(code + "\nthis.headers = HEADERS;", context)
  rows.push(Array.from(context.headers))
  return {
    context,
    rows,
    messages,
    props,
    get sends() {
      return sends
    },
    failMail: count => {
      failures = count
    },
    quota: value => {
      quota = value
    },
    advance: ms => {
      now += ms
    },
  }
}

let f = fixture()
assert.strictEqual(f.context.submitInquiry_(data).saved, true)
assert.strictEqual(f.rows[1][2], "'=Student")
assert.strictEqual(f.rows[1][5], "'012345")
assert.strictEqual(f.rows[1][6], "'parent@example.com")
assert.strictEqual(f.rows[1][9], true)
assert.strictEqual(f.rows[1][8], false)
assert.strictEqual(f.rows[1][15], true)
assert.strictEqual(f.rows[1][18], "Sent")
assert.strictEqual(f.messages[0].to, "jlalibertealle@primorisacademy.org")
assert.strictEqual(f.messages[0].replyTo, "parent@example.com")
f.context.submitInquiry_(data)
assert.strictEqual(f.rows.length, 2)
assert.strictEqual(f.sends, 1)
assert.throws(
  () => f.context.submitInquiry_({ ...data, student: "Changed" }),
  /already saved/
)

for (const changes of [
  { legit: "bot" },
  { email: "bad" },
  { interests: ["other"] },
  { grade: "99" },
  { first: "x\nInjected" },
]) {
  f = fixture()
  assert.throws(() => f.context.submitInquiry_({ ...data, ...changes }))
  assert.strictEqual(f.rows.length, 1)
}
f = fixture()
f.failMail(1)
assert.strictEqual(f.context.submitInquiry_(data).saved, true)
assert.strictEqual(f.rows[1][18], "Failed")
f.context.retryNotifications_()
assert.strictEqual(f.sends, 1)
f.advance(600001)
f.context.retryNotifications_()
assert.strictEqual(f.rows[1][18], "Sent")
assert.strictEqual(f.sends, 2)
f.context.retryNotifications_()
assert.strictEqual(f.sends, 2)
f = fixture()
f.quota(0)
f.context.submitInquiry_(data)
assert.strictEqual(f.rows[1][18], "Pending")
assert.strictEqual(f.sends, 0)
f.quota(100)
f.context.retryNotifications_()
assert.strictEqual(f.rows[1][18], "Sent")
f = fixture()
f.context.submitInquiry_(data)
f.rows[1][18] = "Sending"
f.context.retryNotifications_()
assert.strictEqual(f.rows[1][18], "Needs review")
assert.strictEqual(f.sends, 1)
f = fixture()
f.failMail(5)
f.context.submitInquiry_(data)
for (let i = 0; i < 5; i++) {
  f.advance(86400000)
  f.context.retryNotifications_()
}
assert.strictEqual(f.sends, 5)
assert.strictEqual(f.rows[1][18], "Needs review")
f = fixture()
f.context.Session = {
  getActiveUser: () => ({ getEmail: () => "" }),
  getEffectiveUser: () => ({ getEmail: () => "owner@example.com" }),
}
assert.throws(() => f.context.setupProduction(), /project owner/)
f.context.Session.getActiveUser = () => ({
  getEmail: () => "visitor@example.com",
})
assert.throws(() => f.context.setupProduction(), /project owner/)
let setupCalled = false
f.context.setupProduction_ = () => {
  setupCalled = true
}
f.context.Session.getActiveUser = () => ({
  getEmail: () => "owner@example.com",
})
f.context.setupProduction()
assert(setupCalled)

// Exercise the actual Netlify webhook entry point and field mapping.
f = fixture()
const submission = {
  id: "65e123456789abcdef0123456", form_id: "form-id", data: {
    "student-name": "=Student", "parent-first-name": "Parent",
    "parent-last-name": "Example", phone: "012345", email: "PARENT@example.com",
    grade: "3", "interest[]": ["tour", "speak-with-parent", "speak-with-parent-middle"]
  }
}
const event = (body = submission, token = f.props.WEBHOOK_SECRET) => ({
  parameter: { token }, postData: { contents: JSON.stringify(body) }
})
assert.throws(() => f.context.doPost(event(submission, "wrong")), /Unauthorized/)
assert.throws(() => f.context.doPost({}), /Unauthorized/)
assert.throws(() => f.context.doPost(event({...submission, form_id: "other"})), /Unexpected form/)
assert.throws(() => f.context.doPost(event({...submission, is_spam: true})), /spam/)
assert.strictEqual(f.rows.length, 1)
assert.strictEqual(JSON.parse(f.context.doPost(event()).text).response.saved, true)
f.context.doPost(event())
assert.strictEqual(f.rows.length, 2)
assert.strictEqual(f.sends, 1)
assert.strictEqual(f.rows[1][0], submission.id)
assert.strictEqual(f.rows[1][15], true)
const next = JSON.parse(JSON.stringify(submission))
next.id = "another-netlify-id"
next.data["interest[]"] = "tour, newsletters"
f.context.doPost(event(next))
assert.strictEqual(f.rows[2][9], true)
assert.strictEqual(f.rows[2][12], true)
next.id = "empty-interests"
delete next.data["interest[]"]
f.context.doPost(event(next))
assert(f.rows[3].slice(8,18).every(flag => flag === false))
next.id = "stale-radio"
next.data.interest = ["speak-with-parent-middle"]
f.context.doPost(event(next))
assert.strictEqual(f.rows[4][15], false)
assert.throws(() => f.context.doPost(event({...submission, data: {...submission.data, email: "invalid"}})))
assert.throws(() => f.context.doPost(event({...submission, data: {...submission.data, "student-name": "Changed"}})), /already saved/)
assert.throws(() => f.context.doPost({parameter: {token: f.props.WEBHOOK_SECRET}, postData: {contents: "x".repeat(32001)}}), /Invalid webhook/)
f.props.REPLAY_SUBMISSION_JSON = JSON.stringify(submission)
let removed = false
f.context.PropertiesService.getScriptProperties = () => ({
  getProperty: key => f.props[key] ?? null,
  deleteProperty: key => { delete f.props[key]; removed = true }
})
f.context.replaySubmission()
assert(removed)
assert.strictEqual(f.rows.length, 5)
assert.strictEqual(f.sends, 4)
console.log("Passed: webhook authentication and mapping, validation, literal Sheet values, duplicate prevention, email quotas/recovery, replay, and setup identity.")

// Applicant email variants and independent delivery state.
function replyFixture() {
  return fixture({AUTO_REPLY_ENABLED: 'true', UPPER_SCHOOL_MIN_GRADE: '5'})
}
f = replyFixture()
f.context.submitInquiry_({...data, first: '<Parent & Family>', interests: ['tour']})
assert.strictEqual(f.sends, 2)
assert.strictEqual(f.rows[1][23], 'Sent')
let reply = f.messages[1]
assert.strictEqual(reply.to, 'parent@example.com')
assert.strictEqual(reply.name, 'Primoris Admissions')
assert.strictEqual(reply.replyTo, 'admissions@primorisacademy.org')
assert(reply.body.includes('Dear <Parent & Family>,'))
assert(reply.htmlBody.includes('&lt;Parent &amp; Family&gt;'))
assert(!reply.htmlBody.includes('<Parent & Family>'))
assert(reply.body.includes('Learning at Primoris'))
assert(reply.body.includes('Request a tour'))
assert(!reply.body.includes('Shadowing'))
assert(!reply.htmlBody.includes('/edit'))
assert(!reply.htmlBody.includes('canva-cdn'))
assert(!reply.htmlBody.includes('googleusercontent'))
assert(!reply.attachments)
f.context.submitInquiry_({...data, first: '<Parent & Family>', interests: ['tour']})
assert.strictEqual(f.sends, 2)
for (const grade of ['pre-k', 'k', '4', '5', '7', '8', '9', '10', '12']) {
  f = replyFixture()
  f.context.submitInquiry_({...data, grade, interests: ['apply', 'shadow-days']})
  reply = f.messages[1]
  const upper = Number(grade) >= 5
  assert.strictEqual(reply.body.includes('Middle School and High School'), upper)
  assert.strictEqual(reply.body.includes('for three days'), !upper)
  assert.strictEqual(reply.body.includes('for one day'), upper && Number(grade) >= 7 && Number(grade) <= 9)
  assert.strictEqual(reply.body.includes('A note about teacher recommendations'), Number(grade) >= 5 && Number(grade) <= 8)
  assert(reply.body.includes('unavailable in December and May'))
  assert(!reply.body.includes('Request a tour'))
  assert(reply.body.includes('Register for shadowing — Google sign-in required'))
  assert(reply.body.includes('Prefer not to use Google? Reply to this email'))
  assert(reply.body.includes(upper ? '1FAIpQLSdyZG7mltR24SUIIM3Ot7JKnCGNUppchWaaIOfD5Gwxb7Zkbw' : '1FAIpQLSdQkCICQ4Q1OcTNTFTLo2wiHgtNymZ-ycEUUL-1Sxmx0HsXFQ'))
}
f = replyFixture()
f.context.submitInquiry_({...data, grade: '7', interests: ['summer-program', 'newsletters', 'speak-with-parent', 'speak-with-parent-high', 'speak-with-curriculum-designer']})
reply = f.messages[1]
assert(!reply.body.includes('Shadowing'))
assert(!reply.body.includes('Visit Us!'))
assert(!reply.body.includes('A note about teacher recommendations'))
assert(reply.body.includes('in High School'))
assert(reply.body.includes('summer program information'))
assert(reply.body.includes('curriculum designer'))
f = replyFixture()
f.context.submitInquiry_({...data, interests: []})
assert(f.messages[1].body.includes('None selected'))
// An admissions failure must not block the family reply or cause it to resend.
f = replyFixture()
f.failMail(1)
f.context.submitInquiry_(data)
assert.strictEqual(f.rows[1][18], 'Failed')
assert.strictEqual(f.rows[1][23], 'Sent')
f.advance(600001)
f.context.retryNotifications_()
assert.strictEqual(f.sends, 3)
assert.strictEqual(f.rows[1][18], 'Sent')
// A family reply failure retries independently without another admissions email.
f = replyFixture()
const originalSend = f.context.MailApp.sendEmail
f.context.MailApp.sendEmail = message => {
  if (message.to === 'parent@example.com') throw new Error('Reply failed')
  originalSend(message)
}
f.context.submitInquiry_(data)
assert.strictEqual(f.rows[1][18], 'Sent')
assert.strictEqual(f.rows[1][23], 'Failed')
f.context.MailApp.sendEmail = originalSend
f.advance(600001)
f.context.retryNotifications_()
assert.strictEqual(f.rows[1][23], 'Sent')
assert.strictEqual(f.sends, 2)
f = replyFixture()
f.quota(0)
f.context.submitInquiry_(data)
assert.strictEqual(f.rows[1][23], 'Pending')
f.quota(100)
f.context.retryNotifications_()
assert.strictEqual(f.rows[1][23], 'Sent')
f.rows[1][23] = 'Sending'
f.context.retryNotifications_()
assert.strictEqual(f.rows[1][23], 'Needs review')
f = fixture({AUTO_REPLY_ENABLED: 'true', UPPER_SCHOOL_MIN_GRADE: 'invalid'})
assert.throws(() => f.context.submitInquiry_(data), /UPPER_SCHOOL_MIN_GRADE/)
// Legacy Sheets upgrade appends columns, preserving rows and skipping old replies.
f = fixture()
f.context.submitInquiry_(data)
f.rows.forEach(row => row.splice(23))
let columns = 26
f.context.SpreadsheetApp.openById = () => ({getSheetByName: () => ({
  getLastRow: () => f.rows.length,
  getMaxColumns: () => columns,
  insertColumnsAfter: (after, count) => { assert.strictEqual(after, 26); columns += count },
  getRange: (r, c, h=1, w=1) => ({
    getValues: () => Array.from({length:h}, (_,i) => Array.from({length:w}, (_,j) => f.rows[r+i-1]?.[c+j-1] ?? '')),
    setValues: values => values.forEach((row,i) => row.forEach((v,j) => { f.rows[r+i-1][c+j-1] = v }))
  })
})})
let triggers = 0
f.context.ScriptApp = {
  getProjectTriggers: () => triggers ? [{getHandlerFunction: () => 'retryNotifications_'}] : [],
  newTrigger: () => ({timeBased: () => ({everyMinutes: () => ({create: () => { triggers++ }})})})
}
f.context.SpreadsheetApp.openById = ((original) => () => ({...original(), getUrl: () => 'https://example.test/sheet'}))(f.context.SpreadsheetApp.openById)
f.context.setupProduction_()
assert.strictEqual(columns, 27)
assert.strictEqual(f.rows[0][23], 'Reply status')
assert.strictEqual(f.rows[1][23], 'Skipped')
assert.strictEqual(f.rows[1][18], 'Sent')
f.context.setupProduction_()
assert.strictEqual(triggers, 1)
assert.strictEqual(f.rows[1][23], 'Skipped')
console.log('Passed: lower/upper variants, conditional interests, shadowing ages, recommendations, HTML escaping, independent reply recovery, quotas, and safe legacy Sheet migration.')
f = replyFixture()
f.props.UPPER_SHADOW_URL = 'https://docs.google.com/forms/d/e/public-upper-form/viewform'
f.props.LOWER_SHADOW_URL = 'https://docs.google.com/forms/d/e/public-lower-form/viewform'
f.context.submitInquiry_({...data, grade: '7', interests: ['shadow-days']})
assert(f.messages[1].body.includes('public-upper-form/viewform'))
assert(!f.messages[1].body.includes('public-lower-form'))
f.context.submitInquiry_({...data, id: 'lower-test', grade: '3', interests: ['shadow-days']})
assert(f.messages[3].body.includes('public-lower-form/viewform'))
f = fixture()
f.context.submitInquiry_(data)
assert.strictEqual(f.rows[1][23], 'Skipped')
f.props.AUTO_REPLY_ENABLED = 'true'
f.props.UPPER_SCHOOL_MIN_GRADE = '5'
f.context.retryNotifications_()
assert.strictEqual(f.sends, 1)
console.log('Passed: separate public shadow URLs and no retroactive replies after enablement.')

// Updated upper-school email: current policy and expiring open-house invitation.
f = replyFixture()
f.context.Date.now = () => Date.parse('2026-10-30T12:00:00-04:00')
f.context.submitInquiry_({...data, grade: '7', interests: ['apply', 'tour']})
assert(f.messages[1].body.includes('newly enrolled Middle School students in Grades 5–8'))
assert(f.messages[1].body.includes('November 7, 2026'))
assert(f.messages[1].body.includes('11:00 AM to 12:30 PM'))
assert(f.messages[1].body.includes('RSVP for the open house'))
assert(!f.messages[1].htmlBody.includes('/edit'))
f.context.Date.now = () => Date.parse('2026-11-07T11:00:00-05:00')
f.context.submitInquiry_({...data, id: 'after-open-house', grade: '7', interests: ['tour']})
assert(!f.messages[3].body.includes('November Open House'))
f.context.Date.now = () => Date.parse('2026-10-30T12:00:00-04:00')
f.context.submitInquiry_({...data, id: 'no-tour', grade: '7', interests: ['shadow-days']})
assert(!f.messages[5].body.includes('November Open House'))
f.context.submitInquiry_({...data, id: 'lower-tour', grade: '3', interests: ['tour']})
assert(!f.messages[7].body.includes('November Open House'))
console.log('Passed: updated recommendations and upper-school tour invitation expiry.')

// Reference-inspired email layouts remain fluid, branded and email-client friendly.
f = replyFixture()
f.context.submitInquiry_({...data, interests: ['tour', 'shadow-days']})
const lowerHtml = f.messages[1].htmlBody
assert(lowerHtml.includes('border:3px solid #029651;border-radius:15px'))
assert(lowerHtml.includes('<li>Small class sizes</li>'))
assert(lowerHtml.includes('bgcolor="#029651"'))
assert(lowerHtml.includes('max-width:600px'))
assert(!lowerHtml.includes('min-width:600px'))
assert(lowerHtml.includes('<!--[if mso]>'))
assert(lowerHtml.includes('tel:+12017221000'))
assert(lowerHtml.includes('mailto:admissions@primorisacademy.org'))
f.context.submitInquiry_({...data, id: 'upper-layout', grade: '7', interests: ['tour', 'shadow-days']})
const upperHtml = f.messages[3].htmlBody
assert(upperHtml.includes('bgcolor="#17523b"'))
assert(!upperHtml.includes('Program highlights'))
assert(!upperHtml.includes('border:3px solid #029651'))
assert.strictEqual((upperHtml.match(/<img /g) || []).length, 2)
for (const html of [lowerHtml, upperHtml]) {
  for (const match of html.matchAll(/<img [^>]*src="([^"]+)"/g)) {
    assert(match[1].startsWith('https://primorisacademy.org/img/'))
  }
  assert(!html.includes('canva-cdn'))
  assert(!html.includes('Unsubscribe'))
  assert(!html.includes('Annie Woo'))
}
console.log('Passed: reference-inspired lower/upper layouts, hosted images, responsive widths and email-compatible markup.')
