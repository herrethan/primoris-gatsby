// Calendar dates are school dates, independent of the visitor's time zone.
const categories = {
  school: "School event",
  closed: "No school",
  formal: "Formal day",
  theme: "Theme day",
  conferences: "Conferences",
};

const asDate = date => new Date(`${date.slice(0, 10)}T12:00:00Z`);
const dateKey = date => date.toISOString().slice(0, 10);
const formatDate = (date, options = {}) => asDate(date).toLocaleDateString("en-US", {
  timeZone: "UTC", month: "long", day: "numeric", ...options,
});
const addDays = (date, count) => {
  const next = asDate(date);
  next.setUTCDate(next.getUTCDate() + count);
  return dateKey(next);
};
const addMonths = (month, count) => {
  const next = asDate(`${month}-01`);
  next.setUTCMonth(next.getUTCMonth() + count);
  return dateKey(next).slice(0, 7);
};
const monthDates = month => {
  const start = `${month}-01`;
  const end = addDays(`${addMonths(month, 1)}-01`, -1);
  const gridStart = addDays(start, -asDate(start).getUTCDay());
  const length = Math.ceil((asDate(start).getUTCDay() + Number(end.slice(8))) / 7) * 7;
  return Array.from({ length }, (_, index) => addDays(gridStart, index));
};
const eventsOnDate = (events, date) => events.filter(event =>
  event.date <= date && (event.endDate || event.date) >= date
);
const eventsInMonth = (events, month) => events.filter(event =>
  event.date < `${addMonths(month, 1)}-01` && (event.endDate || event.date) >= `${month}-01`
);
const eventDateLabel = event => {
  const start = formatDate(event.date);
  if (!event.endDate || event.endDate === event.date) return start;
  return `${start} – ${formatDate(event.endDate)}`;
};
const schoolToday = () => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(new Date());
  const value = type => parts.find(part => part.type === type).value;
  return `${value("year")}-${value("month")}-${value("day")}`;
};

module.exports = {
  categories, asDate, formatDate, addDays, addMonths, monthDates,
  eventsOnDate, eventsInMonth, eventDateLabel, schoolToday,
};
