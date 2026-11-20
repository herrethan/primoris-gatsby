const { categories } = require("../../src/utils/calendar");

const columns = ["slug", "title", "date", "endDate", "category", "time", "noSchool", "detail"];

// Handle spreadsheet CSV exports, including BOM, CRLF, quoted commas,
// escaped quotes, and notes that span multiple lines.
const parseRows = source => {
  const text = source.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");
  const rows = [];
  let row = [], field = "", quoted = false, closedQuote = false;
  for (let index = 0; index <= text.length; index++) {
    const character = index === text.length ? "\n" : text[index];
    if (quoted) {
      if (index === text.length) throw new Error("Unclosed quoted field.");
      if (character === '"') {
        if (text[index + 1] === '"') { field += '"'; index++; }
        else { quoted = false; closedQuote = true; }
      } else field += character;
    } else if (character === "," || character === "\n") {
      row.push(field);
      field = "";
      closedQuote = false;
      if (character === "\n") {
        if (row.some(value => value.trim())) rows.push(row);
        row = [];
      }
    } else if (closedQuote) {
      if (!/[ \t]/.test(character)) throw new Error("Unexpected text after a closing quote.");
    } else if (character === '"') {
      if (field) throw new Error("Quotes inside a field must be escaped and the field enclosed in quotes.");
      quoted = true;
    } else field += character;
  }
  return rows;
};

const validDate = value => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

const readCalendarCsv = text => {
  const [rawHeaders, ...rows] = parseRows(text);
  if (!rawHeaders) throw new Error("A CSV header row is required.");
  const headers = rawHeaders.map(header => header.trim());
  if (new Set(headers).size !== headers.length) throw new Error("Duplicate column name.");
  for (const header of headers) {
    if (!columns.includes(header)) throw new Error(`Unknown column: ${header}.`);
  }
  for (const column of ["slug", "title", "date", "category"]) {
    if (!headers.includes(column)) throw new Error(`Missing required column: ${column}.`);
  }
  const slugs = new Set();
  return rows.map((values, index) => {
    const fail = message => { throw new Error(`CSV row ${index + 2}: ${message}`); };
    if (values.length !== headers.length) fail(`Expected ${headers.length} cells, received ${values.length}. Quote notes that contain commas.`);
    const row = Object.fromEntries(headers.map((header, column) => [header, values[column].trim()]));
    for (const column of ["slug", "title", "date", "category"]) {
      if (!row[column]) fail(`${column} is required.`);
    }
    if (!/^\/calendar\/(?:[^/?#\\\s]+\/)+$/.test(row.slug) || row.slug.split("/").some(part => part === "." || part === "..")) {
      fail("slug must be a unique /calendar/event-name/ path with a trailing slash.");
    }
    if (slugs.has(row.slug)) fail(`Duplicate slug: ${row.slug}.`);
    slugs.add(row.slug);
    if (!validDate(row.date)) fail("date must be a real date in YYYY-MM-DD format.");
    if (row.endDate && (!validDate(row.endDate) || row.endDate < row.date)) fail("endDate must be a real date on or after date.");
    if (!Object.prototype.hasOwnProperty.call(categories, row.category)) fail(`Unknown category: ${row.category}.`);
    const noSchool = (row.noSchool || "false").toLowerCase();
    if (!["true", "false"].includes(noSchool)) fail("noSchool must be true or false.");
    return {
      slug: row.slug, title: row.title, date: row.date, endDate: row.endDate || null,
      category: row.category, time: row.time || null, noSchool: noSchool === "true", detail: row.detail || "",
    };
  }).sort((first, second) => first.date.localeCompare(second.date) || first.slug.localeCompare(second.slug));
};

module.exports = { readCalendarCsv };
