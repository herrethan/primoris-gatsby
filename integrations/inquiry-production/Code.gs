// Netlify Forms webhook. Deploy as the school account; see README.md.
const INQUIRY_TAB = 'Inquiries';
const INTERESTS = [
  ['apply', 'Apply'], ['tour', 'Tour'], ['shadow-days', 'Shadow days'],
  ['summer-program', 'Summer program'], ['newsletters', 'Newsletters'],
  ['speak-with-parent', 'Speak with a parent'],
  ['speak-with-parent-elementary', 'Parent contact: Pre-K/Elementary'],
  ['speak-with-parent-middle', 'Parent contact: Middle school'],
  ['speak-with-parent-high', 'Parent contact: High school'],
  ['speak-with-curriculum-designer', 'Speak with curriculum designer']
];
const HEADERS = ['Submission ID', 'Submitted at', 'Student name', 'Parent first name',
  'Parent last name', 'Phone', 'Email', 'Grade'].concat(INTERESTS.map(item => item[1]),
  ['Notification status', 'Notification error', 'Notification attempts', 'Next attempt at', 'Fingerprint',
   'Reply status', 'Reply error', 'Reply attempts', 'Reply next attempt at']);
const COL = { status: 19, error: 20, attempts: 21, next: 22, fingerprint: 23 };

function configuration_() {
  const p = PropertiesService.getScriptProperties();
  const list = key => (p.getProperty(key) || '').split(',').map(v => v.trim()).filter(Boolean);
  const recipients = list('NOTIFICATION_RECIPIENTS');
  if (!recipients.length || recipients.some(v => !/^[^\s@,]+@[^\s@,]+\.[^\s@,]+$/.test(v))) {
    throw new Error('Configure NOTIFICATION_RECIPIENTS in Script Properties.');
  }
  const secret = p.getProperty('WEBHOOK_SECRET');
  if (!secret || !/^[a-f0-9]{64}$/.test(secret)) {
    throw new Error('Configure WEBHOOK_SECRET as 64 random hexadecimal characters.');
  }
  const formId = p.getProperty('NETLIFY_FORM_ID');
  if (!formId) throw new Error('Configure NETLIFY_FORM_ID.');
  const autoReply = p.getProperty('AUTO_REPLY_ENABLED') === 'true';
  const upperSchoolMinGrade = Number(p.getProperty('UPPER_SCHOOL_MIN_GRADE') || '5');
  if (autoReply && (!Number.isInteger(upperSchoolMinGrade) || upperSchoolMinGrade < 1 || upperSchoolMinGrade > 12)) {
    throw new Error('UPPER_SCHOOL_MIN_GRADE must be a grade from 1 through 12.');
  }
  return { p: p, recipients: recipients, secret: secret, formId: formId,
    autoReply: autoReply, upperSchoolMinGrade: upperSchoolMinGrade };
}

// Selectable in the editor. Public web-app visitors cannot invoke setup.
function setupProduction() {
  const activeEmail = Session.getActiveUser().getEmail();
  const effectiveEmail = Session.getEffectiveUser().getEmail();
  if (!activeEmail || activeEmail !== effectiveEmail) {
    throw new Error('Run setupProduction from the Apps Script editor as the project owner.');
  }
  setupProduction_();
}

// Trailing underscores prevent direct google.script.run access to the helper.
function setupProduction_() {
  const config = configuration_();
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    let id = config.p.getProperty('SPREADSHEET_ID');
    if (!id) {
      const spreadsheet = SpreadsheetApp.create('Primoris Inquiries');
      id = spreadsheet.getId();
      config.p.setProperty('SPREADSHEET_ID', id);
    }
    const spreadsheet = SpreadsheetApp.openById(id);
    let sheet = spreadsheet.getSheetByName(INQUIRY_TAB);
    if (!sheet) sheet = spreadsheet.insertSheet(INQUIRY_TAB);
    if (sheet.getMaxColumns() < HEADERS.length) {
      sheet.insertColumnsAfter(sheet.getMaxColumns(), HEADERS.length - sheet.getMaxColumns());
    }
    if (!sheet.getLastRow()) {
      sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
      sheet.setFrozenRows(1);
    }
    // Upgrade only the known original layout. Never email historical inquiries.
    const oldHeaders = sheet.getRange(1, 1, 1, 23).getValues()[0];
    const replyHeaders = sheet.getRange(1, 24, 1, 4).getValues()[0];
    if (HEADERS.slice(0, 23).every((v, i) => oldHeaders[i] === v) && replyHeaders.every(v => v === '')) {
      if (sheet.getLastRow() > 1) {
        sheet.getRange(2, 24, sheet.getLastRow() - 1, 4).setValues(
          Array.from({ length: sheet.getLastRow() - 1 }, () => ['Skipped', 'Predates auto replies', 0, '']));
      }
      sheet.getRange(1, 24, 1, 4).setValues([HEADERS.slice(23)]);
    }
    assertLayout_(sheet);
    // Validate permissions now, rather than on the first visitor's submission.
    MailApp.getRemainingDailyQuota();
    if (!ScriptApp.getProjectTriggers().some(t => t.getHandlerFunction() === 'retryNotifications_')) {
      ScriptApp.newTrigger('retryNotifications_').timeBased().everyMinutes(10).create();
    }
    console.log('Inquiry sheet: ' + spreadsheet.getUrl());
    console.log('Recipients: ' + config.recipients.join(', '));
  } finally {
    lock.releaseLock();
  }
}

function assertLayout_(sheet) {
  if (!sheet || sheet.getLastRow() < 1) throw new Error('Run setupProduction first.');
  const headers = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  if (!HEADERS.every((value, index) => headers[index] === value)) {
    throw new Error('Inquiry sheet headings have changed. Restore them before accepting inquiries.');
  }
}

function inquirySheet_(config) {
  const id = config.p.getProperty('SPREADSHEET_ID');
  if (!id) throw new Error('Run setupProduction first.');
  const sheet = SpreadsheetApp.openById(id).getSheetByName(INQUIRY_TAB);
  assertLayout_(sheet);
  return sheet;
}

function doGet() {
  return ContentService.createTextOutput('Submit inquiries from the Primoris website.');
}

// Apps Script does not expose request headers. Authenticate using a private
// bearer token in the webhook URL, stored only in Netlify and Script Properties.
function doPost(e) {
  const config = configuration_();
  const token = e && e.parameter && e.parameter.token;
  let difference = typeof token === 'string' ? token.length ^ config.secret.length : 1;
  for (let i = 0; i < config.secret.length; i++) {
    difference |= config.secret.charCodeAt(i) ^ (typeof token === 'string' ? token.charCodeAt(i) : 0);
  }
  if (difference !== 0) throw new Error('Unauthorized webhook.');
  const contents = e && e.postData && e.postData.contents;
  if (typeof contents !== 'string' || contents.length > 32000) throw new Error('Invalid webhook body.');
  const response = receiveSubmission_(JSON.parse(contents), config);
  return ContentService.createTextOutput(JSON.stringify({ ok: true, response: response }))
    .setMimeType(ContentService.MimeType.JSON);
}

function receiveSubmission_(submission, config) {
  if (!submission || submission.form_id !== config.formId || submission.is_spam === true) {
    throw new Error('Unexpected form or spam submission.');
  }
  const fields = submission.data;
  if (!fields || typeof fields !== 'object' || Array.isArray(fields)) throw new Error('Missing form data.');
  const raw = fields['interest[]'] === undefined ? fields.interest : fields['interest[]'];
  // Netlify can serialize checkbox values as an array or a comma-separated string.
  const interests = raw === undefined || raw === '' ? [] :
    (Array.isArray(raw) ? raw : typeof raw === 'string' ? raw.split(',').map(v => v.trim()) : null);
  return submitInquiry_({
    id: submission.id,
    student: fields['student-name'], first: fields['parent-first-name'],
    last: fields['parent-last-name'], phone: fields.phone || '', email: fields.email,
    grade: fields.grade, interests: interests, legit: fields.legit || ''
  });
}

// For recovery, set REPLAY_SUBMISSION_JSON to the original Netlify webhook JSON,
// run this from the editor, and then delete the property. Keep the original ID.
function replaySubmission() {
  const config = configuration_();
  const raw = config.p.getProperty('REPLAY_SUBMISSION_JSON');
  if (!raw) throw new Error('Set REPLAY_SUBMISSION_JSON first.');
  receiveSubmission_(JSON.parse(raw), config);
  config.p.deleteProperty('REPLAY_SUBMISSION_JSON');
}

function normalizedInquiry_(data) {
  if (!data || data.legit) throw new Error('Unable to accept this submission.');
  if (typeof data.id !== 'string' || !/^[a-zA-Z0-9_-]{1,100}$/.test(data.id)) {
    throw new Error('Please reload the form and try again.');
  }
  const text = (key, max, required) => {
    const value = data[key];
    if (typeof value !== 'string' || value.length > max || (required && !value.trim()) || /[\x00-\x1f\x7f]/.test(value)) {
      throw new Error('Please check the ' + key + ' field.');
    }
    return value.trim();
  };
  const details = [text('student', 100, true), text('first', 100, true),
    text('last', 100, true), text('phone', 50, false), text('email', 254, true).toLowerCase(),
    text('grade', 5, true)];
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details[4])) throw new Error('Please check your email address.');
  if (!/^(pre-k|k|[1-9]|1[012])$/.test(details[5])) throw new Error('Please select a grade.');
  const allowed = INTERESTS.map(item => item[0]);
  if (!Array.isArray(data.interests) || data.interests.length > allowed.length ||
      data.interests.some(value => allowed.indexOf(value) === -1)) throw new Error('Please check your interests.');
  const selected = Array.from(new Set(data.interests)).filter(value =>
    value.indexOf('speak-with-parent-') !== 0 || data.interests.indexOf('speak-with-parent') !== -1);
  const flags = INTERESTS.map(item => selected.indexOf(item[0]) !== -1);
  const fingerprint = Utilities.base64EncodeWebSafe(Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256, JSON.stringify(details.concat(flags))));
  return { id: data.id, details: details, flags: flags, fingerprint: fingerprint };
}

function rows_(sheet) {
  return sheet.getLastRow() > 1 ? sheet.getRange(2, 1, sheet.getLastRow() - 1, HEADERS.length).getValues() : [];
}

function existing_(rows, inquiry) {
  const row = rows.find(value => value[0] === inquiry.id);
  if (!row) return null;
  if (row[COL.fingerprint - 1] !== inquiry.fingerprint) {
    throw new Error('An earlier submission is already saved. Reload to send a different inquiry.');
  }
  return { id: inquiry.id, saved: true };
}

function submitInquiry_(data) {
  const config = configuration_();
  const inquiry = normalizedInquiry_(data);
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = inquirySheet_(config);
    const rows = rows_(sheet);
    const duplicate = existing_(rows, inquiry);
    if (duplicate) return duplicate;
    const rowNumber = sheet.getLastRow() + 1;
    sheet.getRange(rowNumber, 1, 1, HEADERS.length).setValues([[
      inquiry.id, new Date()
    ].concat(inquiry.details.map(value => "'" + value), inquiry.flags,
      ['Pending', '', 0, new Date(), inquiry.fingerprint,
       config.autoReply ? 'Pending' : 'Skipped', '', 0, config.autoReply ? new Date() : ''])]);
    SpreadsheetApp.flush();
    try {
      sendNotification_(sheet, rowNumber, config);
    } catch (error) {
      // Saving succeeded. Leave Pending/Sending for recovery instead of telling
      // the visitor the entire inquiry failed after it was already recorded.
      console.log('Notification processing interrupted; review notification status.');
    }
    try {
      if (config.autoReply) sendReply_(sheet, rowNumber, config);
    } catch (error) {
      console.log('Applicant reply processing interrupted; review reply status.');
    }
    return { id: inquiry.id, saved: true };
  } finally { lock.releaseLock(); }
}

// Caller holds the lock. Each email has independent delivery state.
function sendNotification_(sheet, rowNumber, config) {
  sendMail_(sheet, rowNumber, config, false);
}

function sendReply_(sheet, rowNumber, config) {
  if (config.autoReply) sendMail_(sheet, rowNumber, config, true);
}

function sendMail_(sheet, rowNumber, config, reply) {
  const row = sheet.getRange(rowNumber, 1, 1, HEADERS.length).getValues()[0];
  const start = reply ? 24 : COL.status;
  const attempts = Number(row[start + 1]) || 0;
  const status = row[start - 1];
  if (['Sent', 'Sending', 'Skipped', 'Needs review'].indexOf(status) !== -1 || attempts >= 5) return;
  if (MailApp.getRemainingDailyQuota() < (reply ? 1 : config.recipients.length)) return;
  const value = index => String(row[index]).replace(/^'/, '');
  const selected = INTERESTS.filter((item, index) => row[8 + index] === true).map(item => item[1]);
  // Render before marking Sending: a template error has not attempted delivery.
  const message = reply ? applicantReply_(row, config) : {
    to: config.recipients.join(','), replyTo: value(6),
    subject: 'Primoris inquiry — ' + row[0],
    body: 'Submission ID: ' + row[0] + '\nStudent: ' + value(2) +
      '\nParent: ' + value(3) + ' ' + value(4) + '\nPhone: ' + value(5) +
      '\nEmail: ' + value(6) + '\nGrade: ' + value(7) + '\nInterests: ' + selected.join(', ') +
      '\n\nSheet: https://docs.google.com/spreadsheets/d/' + config.p.getProperty('SPREADSHEET_ID')
  };
  sheet.getRange(rowNumber, start, 1, 4).setValues([['Sending', '', attempts + 1, '']]);
  SpreadsheetApp.flush();
  try {
    MailApp.sendEmail(message);
  } catch (error) {
    sheet.getRange(rowNumber, start, 1, 4).setValues([[
      attempts + 1 >= 5 ? 'Needs review' : 'Failed',
      "'" + String(error.message || error).slice(0, 500), attempts + 1,
      new Date(Date.now() + Math.pow(2, attempts) * 600000)]]);
    SpreadsheetApp.flush();
    return;
  }
  sheet.getRange(rowNumber, start).setValue('Sent');
  SpreadsheetApp.flush();
}

function retryNotifications_() {
  const config = configuration_();
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(1000)) return;
  try {
    const sheet = inquirySheet_(config);
    const rows = rows_(sheet);
    let processed = 0;
    for (let i = 0; i < rows.length && processed < 5; i++) {
      for (const reply of [false, true]) {
        if ((reply && !config.autoReply) || processed >= 5) continue;
        const row = rows[i];
        const start = reply ? 24 : COL.status;
        const status = row[start - 1];
        if (status === 'Sending') {
          sheet.getRange(i + 2, start, 1, 2).setValues([['Needs review',
            'Email delivery uncertain. Check the inbox before resending.']]);
          continue;
        }
        const next = row[start + 2];
        if ((status === 'Pending' || status === 'Failed') &&
            (!(next instanceof Date) || next.getTime() <= Date.now())) {
          try { sendMail_(sheet, i + 2, config, reply); }
          catch (error) { console.log('Email recovery interrupted; review delivery status.'); }
          processed++;
        }
      }
    }
  } finally { lock.releaseLock(); }
}

function escapeHtml_(value) {
  return String(value).replace(/[&<>"']/g, character =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}

function applicantReply_(row, config) {
  const value = index => String(row[index] || '').replace(/^'/, '');
  const grade = value(7);
  const upper = Number(grade) >= config.upperSchoolMinGrade;
  const selected = INTERESTS.filter((item, index) => row[8 + index] === true);
  const has = key => selected.some(item => item[0] === key);
  const admissions = 'admissions@primorisacademy.org';
  const assetBase = 'https://primorisacademy.org/img/';
  const tourUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSeWtTl_gKvoLvpaVB5Bg9YARmGsu1I8WnqDvCS8a73f5q0HFg/viewform';
  const lowerShadowUrl = config.p.getProperty('LOWER_SHADOW_URL') || 'https://docs.google.com/forms/d/e/1FAIpQLSdQkCICQ4Q1OcTNTFTLo2wiHgtNymZ-ycEUUL-1Sxmx0HsXFQ/viewform';
  // Set this only to a public respondent URL, never a Forms /edit URL.
  const upperShadowUrl = config.p.getProperty('UPPER_SHADOW_URL') || 'https://docs.google.com/forms/d/e/1FAIpQLSdyZG7mltR24SUIIM3Ot7JKnCGNUppchWaaIOfD5Gwxb7Zkbw/viewform';
  for (const url of [lowerShadowUrl, upperShadowUrl]) {
    if (url && !/^https:\/\/docs\.google\.com\/forms\/d\/(?:e\/)?[a-zA-Z0-9_-]+\/viewform(?:\?[^\s"<>]*)?$/.test(url)) {
      throw new Error('Shadow registration links must be public Google Forms viewform URLs.');
    }
  }
  const sections = [];
  const add = (title, paragraphs, image, action) => sections.push({ title: title, paragraphs: paragraphs, image: image, action: action });
  add('', ['Dear ' + value(3) + ',', upper ?
    'Thank you for reaching out to Primoris Academy! We are delighted by your interest in our school, where possibility, kindness, and wonder thrive. We look forward to learning more about ' + value(2) + ' and sharing how your family could become part of the Primoris community.' :
    'Thank you for reaching out to us about ' + value(2) + '’s education. We are delighted by your interest in Primoris Academy, where passion, kindness, and curiosity thrive. We are eager to learn about your student and how your family can become a part of the Primoris community.']);
  add(upper ? 'Middle School and High School' : 'Learning at Primoris', upper ? [
    'At Primoris Academy, we believe in helping students discover their passions, develop their unique strengths, and make meaningful contributions to the world around them. Our engaging, experiential Middle School and High School curricula combine rigorous academics with an emphasis on social development, character, and well-rounded growth.',
    'Our Middle School students have opportunities to explore High School-level coursework, while High School students can take advantage of university-level classes through in-person, online, and hybrid learning experiences. SAT preparation, including guidance and coaching, is also incorporated into our High School program.'
  ] : [
    'Primoris Academy’s engaging curriculum emphasizes social development and character, as well as rigorous academics. Students explore Humanities, STEM and the Arts, including English, History, Math, Robotics, Science, Foreign Languages, Art and Music. Our learning is hands-on and experiential.',
    'On Fridays, a wide variety of electives encourage creative exploration and a love of learning. Alongside weekly Drama, past courses have included sign language, newsletter and video, sports and dance, architecture, and the Community Outreach and Kindness club.',
    'Program highlights: small class sizes; project-based learning; subject teachers from K–12; customized learning; leadership and life skills development.'
  ], upper ? 'blob-3.jpg' : 'blob-1.jpg');
  if (has('tour')) {
    add('Visit Us!', [
      'We invite you to explore Primoris Academy in person at 64 E. Midland Avenue, Paramus, NJ.',
      upper ? 'School tours are available Tuesdays, Wednesdays, and Thursdays at 10:00 AM from September through November. Please let us know which specific date works best for your family and complete our Tour Inquiry Form.' :
        'School is generally open for many holidays. Please feel free to request a tour on those days and bring your child to see our campus. Complete our Tour Inquiry Form to arrange a visit.',
      'Your child is welcome to join you and experience our learning environment firsthand.'
    ], 'hero-4.jpg', { label: 'Request a tour', url: tourUrl });
  }
  // Event times are explicit New York offsets, independent of script timezone.
  if (upper && has('tour') && Date.now() < Date.parse('2026-11-07T11:00:00-05:00')) {
    add('November Open House', [
      'We cordially invite you and your child to our November Open House on Saturday, November 7, 2026, from 11:00 AM to 12:30 PM (Eastern Time). Please complete the RSVP form to let us know you will be joining us.',
      'If you have difficulty accessing the form, reply to admissions and we will help with your RSVP.'
    ], null, { label: 'RSVP for the open house',
      url: 'https://docs.google.com/forms/d/1JeDZvlPq-8ZkCk98ZMiPeM7QycVuG6WqoQsCXAaNMV4/viewform' });
  }
  if (has('shadow-days')) {
    const oneDay = upper && Number(grade) >= 7 && Number(grade) <= 9;
    const paragraphs = upper ? [oneDay ?
      'As part of our admissions process, students entering Grades 7–9 are required to shadow Primoris classes for one day. This experience allows prospective students to participate in classroom activities, meet our teachers and students, and discover what learning at Primoris could look like for them.' :
      'Thank you for your interest in shadowing. The one-day shadowing requirement applies to students entering Grades 7–9. Please contact admissions to discuss the appropriate visit for your student’s grade.'
    ] : [
      'As part of the admissions process, students are required to shadow age-appropriate Primoris classes for three days. This gives us—and your student—a wider window into possibilities for your family at Primoris.',
      'We highly recommend booking months in advance, as spots fill up quickly.'
    ];
    paragraphs.push('Please note that shadowing is unavailable in December and May.');
    const shadowUrl = upper ? upperShadowUrl : lowerShadowUrl;
    paragraphs.push('Google sign-in is required to complete the registration form. Prefer not to use Google? Reply to this email to arrange a visit with admissions.');
    add('Shadowing', paragraphs, 'hero-1.jpg', { label: 'Register for shadowing — Google sign-in required', url: shadowUrl });
  }
  if (has('apply') && Number(grade) >= 5 && Number(grade) <= 8) {
    add('A note about teacher recommendations', [
      'Primoris teachers do not write recommendation letters for newly enrolled Middle School students in Grades 5–8. We understand that recommendation letters are often an important part of the admissions process at many schools, and we want prospective families to be aware of this policy as they consider whether Primoris is the right fit for their child.',
      'Please contact admissions with any questions about this policy.'
    ]);
  }
  if (has('apply')) add('Applying to Primoris', ['Our admissions team will follow up about the application process and next steps for your family.']);
  if (has('summer-program')) add('Summer program', ['We have received your request for summer program information. Our team will follow up with details.']);
  if (has('newsletters')) add('Primoris newsletters', ['We have noted your interest in Primoris activity newsletters.']);
  if (has('speak-with-parent')) {
    const level = has('speak-with-parent-elementary') ? 'Pre-K/Elementary' : has('speak-with-parent-middle') ? 'Middle School' : has('speak-with-parent-high') ? 'High School' : '';
    add('Speak with a Primoris parent', ['We have received your request to speak with a current Primoris parent' + (level ? ' in ' + level : '') + '. Our team will follow up to help arrange a conversation.']);
  }
  if (has('speak-with-curriculum-designer')) add('Speak with our curriculum designer', ['We have received your request to speak with our curriculum designer. Our team will follow up to help arrange a conversation.']);
  const gradeLabel = grade === 'pre-k' ? 'Pre-K' : grade === 'k' ? 'Kindergarten' : 'Grade ' + grade;
  add('Your inquiry', [
    'Student: ' + value(2), 'Parent or guardian: ' + value(3) + ' ' + value(4),
    'Student grade (as submitted): ' + gradeLabel,
    'Interests: ' + (selected.filter(item => item[0].indexOf('speak-with-parent-') !== 0).map(item => item[1]).join(', ') || 'None selected'),
    'Inquiry reference: ' + row[0], 'If any of these details need correcting, please reply to this email.'
  ]);
  const signature = ['Primoris Admissions', 'Primoris Academy', '64 E. Midland Avenue, Paramus, NJ',
    'Office: (201) 722-1000', 'Text & Call: (201) 500-8629', admissions, 'https://primorisacademy.org',
    'Tolle Ingenium: Lift Up Your Talent'];
  const body = sections.map(section => (section.title ? section.title + '\n' : '') + section.paragraphs.join('\n\n') +
    (section.action ? '\n\n' + section.action.label + ': ' + section.action.url : '')).join('\n\n') + '\n\n' + signature.join('\n');
  const htmlBody = renderApplicantHtml_(sections, upper, assetBase, admissions);
  return { to: value(6), name: 'Primoris Admissions', replyTo: admissions,
    subject: 'Thank you for your interest in Primoris Academy', body: body, htmlBody: htmlBody };
}


// Table layouts and inline styles keep the primary design usable in email clients.
// The two variants follow the supplied lower- and upper-school references.
function renderApplicantHtml_(sections, upper, assetBase, admissions) {
  const green = '#029651';
  const darkGreen = '#17523b';
  const panel = '#edeced';
  const image = (file, width, alt) => '<img src="' + assetBase + file + '" width="' + width +
    '" alt="' + escapeHtml_(alt) + '" style="display:block;border:0;outline:none;width:100%;max-width:' + width + 'px;height:auto">';
  const paragraphs = (texts, color, leading) => texts.map(text =>
    '<p style="margin:0 0 16px;color:' + color + ';font-size:16px;line-height:' + leading + '">' + escapeHtml_(text) + '</p>').join('');
  const button = (action, filled) => action ?
    '<table role="presentation" border="0" cellspacing="0" cellpadding="0" style="border-collapse:separate;margin:4px 0 8px"><tr><td bgcolor="' + (filled ? darkGreen : panel) +
    '" style="border-radius:5px;text-align:center"><a href="' + escapeHtml_(action.url) +
    '" style="display:inline-block;padding:16px 22px;color:' + (filled ? '#ffffff' : darkGreen) +
    ';font-size:16px;line-height:23px;font-weight:bold;text-decoration:none">' + escapeHtml_(action.label) + '</a></td></tr></table>' : '';
  const heading = (text, color) => text ? '<h2 style="margin:0 0 16px;color:' + color +
    ';font-size:22px;font-weight:700;line-height:1.35;letter-spacing:-0.3px">' + escapeHtml_(text) + '</h2>' : '';
  let htmlSections = '';
  for (const section of sections) {
    const intro = !section.title;
    const recap = section.title === 'Your inquiry';
    const visit = section.title === 'Visit Us!' || section.title === 'Shadowing';
    const learning = section.title === 'Learning at Primoris';
    if (upper) {
      // Original upper-school reference: white paper, generous horizontal padding,
      // simple section headings and no repeated photo banners between paragraphs.
      htmlSections += '<tr><td class="email-pad" bgcolor="#ffffff" style="padding:' + (intro ? '28px' : '8px') + ' 24px 8px">' +
        (recap ? '<table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td bgcolor="#f3f6f3" style="padding:20px;border:1px solid #dce6de;border-radius:8px">' : '') +
        heading(section.title, darkGreen) + paragraphs(section.paragraphs, '#202020', '1.5') + button(section.action, true) +
        (recap ? '</td></tr></table>' : '') + '</td></tr>';
      continue;
    }
    if (intro) {
      htmlSections += '<tr><td class="email-pad" bgcolor="' + panel + '" style="padding:24px 24px 16px">' +
        '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:separate"><tr><td style="padding:28px 30px 12px;border:3px solid ' + green + ';border-radius:15px">' +
        paragraphs(section.paragraphs, '#202020', '1.6') + '</td></tr></table></td></tr>';
    } else if (learning) {
      const text = section.paragraphs.slice(0, -1);
      const highlights = section.paragraphs[section.paragraphs.length - 1].replace(/^Program highlights: /, '').replace(/\.$/, '').split('; ');
      htmlSections += '<tr><td class="email-pad" bgcolor="' + panel + '" style="padding:12px 24px 8px">' +
        '<table role="presentation" width="360" align="center" cellspacing="0" cellpadding="0" style="width:100%;max-width:360px;margin:0 auto 24px"><tr><td>' +
        image('blob-1.jpg', 360, 'Hands-on learning at Primoris Academy') + '</td></tr></table>' +
        paragraphs(text, '#202020', '1.7') + '</td></tr>' +
        '<tr><td class="email-pad" bgcolor="' + panel + '" style="padding:0 24px 24px">' +
        '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:separate"><tr><td style="padding:24px 30px;border:3px solid ' + green + ';border-radius:15px">' +
        heading('Program highlights', darkGreen) + '<ul style="margin:0;padding-left:22px;color:' + darkGreen + ';font-size:16px;line-height:1.8">' +
        highlights.map(text => '<li>' + escapeHtml_(text.charAt(0).toUpperCase() + text.slice(1)) + '</li>').join('') + '</ul></td></tr></table></td></tr>';
    } else {
      const background = visit ? green : recap ? '#f3f6f3' : panel;
      const color = visit ? '#ffffff' : '#202020';
      htmlSections += '<tr><td class="email-pad" bgcolor="' + panel + '" style="padding:0 24px 20px">' +
        '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:separate"><tr><td bgcolor="' + background + '" style="padding:24px;border-radius:' + (visit ? '15px' : '8px') +
        (recap ? ';border:1px solid #dce6de' : '') + '">' +
        (visit && section.image ? '<div style="margin-bottom:20px">' + image(section.image, 480, section.title === 'Visit Us!' ? 'Explore Primoris Academy' : 'Experience a day of learning at Primoris') + '</div>' : '') +
        heading(section.title, visit ? '#ffffff' : darkGreen) + paragraphs(section.paragraphs, color, '1.7') + button(section.action, !visit) + '</td></tr></table></td></tr>';
    }
  }
  const headerPhoto = upper ? 'hero-3.jpg' : 'hero-4.jpg';
  return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">' +
    '<meta name="color-scheme" content="light"><title>Thank you for your interest in Primoris Academy</title>' +
    '<style>@media only screen and (max-width:480px){.email-pad{padding-left:16px!important;padding-right:16px!important}.email-shell{width:100%!important}}</style></head>' +
    '<body style="margin:0;padding:0;background:#f0f1f5;font-family:Arial,Helvetica,sans-serif;color:#202020;-webkit-text-size-adjust:100%">' +
    '<div style="display:none;max-height:0;overflow:hidden;mso-hide:all">Thank you for reaching out. Discover Primoris and the next steps for your family.</div>' +
    '<table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#f0f1f5"><tr><td align="center" style="padding:24px 0">' +
    '<!--[if mso]><table role="presentation" width="600" align="center"><tr><td><![endif]-->' +
    '<table role="presentation" class="email-shell" width="600" border="0" cellspacing="0" cellpadding="0" bgcolor="' + (upper ? '#ffffff' : panel) + '" style="width:100%;max-width:600px;margin:0 auto">' +
    '<tr><td bgcolor="#ffffff" style="padding:22px 24px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr>' +
    '<td width="76" valign="middle"><img src="' + assetBase + 'admissions-email/primoris-logo.jpg" width="64" height="64" alt="Primoris Academy crest" style="display:block;width:64px;height:64px;border:0"></td>' +
    '<td valign="middle"><p style="margin:0;color:' + darkGreen + ';font-size:25px;line-height:1.25;font-weight:bold">PRIMORIS ACADEMY</p>' +
    '<p style="margin:6px 0 0;color:#496253;font-size:13px;line-height:1.5;letter-spacing:1px">TOLLE INGENIUM · LIFT UP YOUR TALENT</p></td></tr></table></td></tr>' +
    '<tr><td>' + image(headerPhoto, 600, upper ? 'Discover Middle School and High School at Primoris' : 'Welcome to Primoris Academy') + '</td></tr>' + htmlSections +
    '<tr><td class="email-pad" bgcolor="' + (upper ? '#ffffff' : panel) + '" style="padding:20px 24px 28px;color:#202020;font-size:15px;line-height:1.7">' +
    'Sincerely,<br><strong>Primoris Admissions</strong><br>We look forward to getting to know your family.</td></tr>' +
    '<tr><td bgcolor="' + (upper ? darkGreen : green) + '" align="center" style="padding:28px 24px;color:#ffffff;font-size:13px;line-height:1.8">' +
    '<strong style="font-size:16px">Primoris Academy</strong><br>64 E. Midland Avenue, Paramus, New Jersey<br>' +
    '<a href="tel:+12017221000" style="color:#ffffff;text-decoration:none">Office: (201) 722-1000</a> · ' +
    '<a href="tel:+12015008629" style="color:#ffffff;text-decoration:none">Text &amp; Call: (201) 500-8629</a><br>' +
    '<a href="mailto:' + admissions + '" style="color:#ffffff;text-decoration:underline">' + admissions + '</a><br>' +
    '<a href="https://primorisacademy.org" style="color:#ffffff;text-decoration:underline">Visit our website</a>' +
    '<p style="margin:18px 0 0;font-size:14px;font-style:italic">Tolle Ingenium: Lift Up Your Talent</p></td></tr>' +
    '</table><!--[if mso]></td></tr></table><![endif]--></td></tr></table></body></html>';
}
