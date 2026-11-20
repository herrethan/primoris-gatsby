const assert = require("assert/strict");
const fs = require("fs");
const path = require("path");
const { readCalendarCsv } = require("./lib/calendar-csv.cjs");
const calendar = require("../src/utils/calendar");
const settings = require("../content/calendar-settings.json");

const events = readCalendarCsv(fs.readFileSync(path.join(__dirname, "../content/calendar/events.csv"), "utf8"));

// Spreadsheet exports must preserve punctuation, Unicode, and multiline notes.
const header = "slug,title,date,endDate,category,time,noSchool,detail\r\n";
const row = '/calendar/example/,"Family, Friends & “Lions”",2026-12-23,2027-01-04,closed,,TRUE,"Bring a “guest” and ""smile"".\r\nHappy holidays!"\r\n';
const [example] = readCalendarCsv(`\uFEFF${header}${row}`);
assert.equal(example.title, "Family, Friends & “Lions”");
assert.equal(example.detail, 'Bring a “guest” and "smile".\nHappy holidays!');
assert.equal(example.noSchool, true);
assert.equal(readCalendarCsv(header).length, 0);
assert.throws(() => readCalendarCsv(`${header}${row}${row}`), /Duplicate slug/);
assert.throws(() => readCalendarCsv(header + row.replace("2026-12-23", "2026-02-30")), /real date/);
assert.throws(() => readCalendarCsv(header + row.replace("2027-01-04", "2026-12-01")), /on or after/);
assert.throws(() => readCalendarCsv(header + row.replace(",TRUE,", ",yes,")), /true or false/);
assert.throws(() => readCalendarCsv(header + row.replace(",closed,", ",typo,")), /Unknown category/);
assert.throws(() => readCalendarCsv(header + row.slice(0, -3)), /Unclosed quoted field/);
assert.throws(() => readCalendarCsv(header + "/calendar/example/,Title,2026-09-01"), /Expected 8 cells/);

// Breaks must remain visible in both months, including their final day.
const holiday = events.find(event => event.title === "Holiday Recess");
assert.ok(calendar.eventsInMonth([holiday], "2026-12").includes(holiday));
assert.ok(calendar.eventsInMonth([holiday], "2027-01").includes(holiday));
assert.deepEqual(calendar.eventsOnDate([holiday], "2027-01-04"), [holiday]);
assert.deepEqual(calendar.eventsOnDate([holiday], "2027-01-05"), []);
assert.deepEqual(calendar.eventsInMonth([holiday], "2027-02"), []);

// Overlapping events must coexist; staff-requested conferences must not
// accidentally be treated as a school closure.
assert.equal(calendar.eventsOnDate(events, "2026-12-22").length, 2);
assert.equal(calendar.eventsOnDate(events, "2027-03-04").length, 2);
assert.equal(calendar.eventsOnDate(events, "2027-05-07").length, 2);
assert.ok(events.find(event => event.date === "2026-12-10").noSchool);
assert.ok(!events.find(event => event.date === "2027-03-19").noSchool);

// Calendar arithmetic must survive year changes, leap years, and DST.
assert.equal(calendar.addMonths("2026-12", 1), "2027-01");
assert.equal(calendar.addMonths("2027-01", -1), "2026-12");
assert.equal(calendar.addDays("2028-02-28", 1), "2028-02-29");
assert.equal(calendar.addDays("2027-03-13", 1), "2027-03-14");
assert.equal(calendar.addDays("2027-03-14", 1), "2027-03-15");
assert.equal(calendar.formatDate("2027-03-14"), "March 14");
assert.equal(calendar.eventDateLabel(holiday), "December 23 – January 4");

for (let month = settings.startDate.slice(0, 7); month <= settings.endDate.slice(0, 7); month = calendar.addMonths(month, 1)) {
  const days = calendar.monthDates(month);
  assert.equal(days.length % 7, 0);
  assert.equal(calendar.asDate(days[0]).getUTCDay(), 0);
  assert.equal(calendar.asDate(days[days.length - 1]).getUTCDay(), 6);
  assert.ok(days.includes(`${month}-01`));
  for (let index = 1; index < days.length; index++) {
    assert.equal(days[index], calendar.addDays(days[index - 1], 1));
  }
}

for (const event of events) {
  assert.match(event.date, /^\d{4}-\d{2}-\d{2}$/);
  assert.ok(event.date >= settings.startDate && (event.endDate || event.date) <= settings.endDate, event.title);
  assert.ok(calendar.categories[event.category], event.title);
  if (event.endDate) assert.ok(event.endDate >= event.date, event.title);
}

console.log(`Calendar checks passed: ${events.length} events, multi-day breaks, overlapping events, date arithmetic, and every school-year month.`);
