import React, { useEffect, useRef, useState } from "react";
import { Link } from "gatsby";
import settings from "../../content/calendar-settings.json";
import {
  categories, asDate, formatDate, addDays, addMonths, monthDates,
  eventsOnDate, eventsInMonth, eventDateLabel, schoolToday,
} from "../utils/calendar";
import "../styles/calendar.css";

export const CalendarEvent = ({ event }) => (
  <article className={`calendar-event calendar-category-${event.category}`}>
    <span className="calendar-category-label">{categories[event.category]}{event.noSchool && event.category !== "closed" && " · No school"}</span>
    <h3><Link to={event.slug}>{event.title}</Link></h3>
    <p className="calendar-event-date">{eventDateLabel(event)}{event.time && ` · ${event.time} ET`}</p>
    {event.detail && <p>{event.detail}</p>}
  </article>
);

const SchoolCalendar = ({ events }) => {
  const firstMonth = settings.startDate.slice(0, 7);
  const lastMonth = settings.endDate.slice(0, 7);
  const [month, setMonth] = useState(firstMonth);
  const [selected, setSelected] = useState(settings.startDate);
  const [today, setToday] = useState("");
  const [view, setView] = useState("month");
  const [filter, setFilter] = useState("all");
  const calendar = useRef(null);
  const focusDay = useRef(false);

  useEffect(() => {
    const current = schoolToday();
    setToday(current);
    const initial = current >= settings.startDate && current <= settings.endDate
      ? current : settings.startDate;
    setMonth(initial.slice(0, 7));
    setSelected(initial);
  }, []);

  useEffect(() => {
    if (focusDay.current && calendar.current) {
      const button = calendar.current.querySelector(`[data-date="${selected}"]`);
      if (button) button.focus();
      focusDay.current = false;
    }
  }, [selected, month]);

  const months = [];
  for (let value = firstMonth; value <= lastMonth; value = addMonths(value, 1)) months.push(value);
  const visibleEvents = events.filter(event => filter === "all" || event.category === filter || (filter === "closed" && event.noSchool));
  const monthEvents = eventsInMonth(visibleEvents, month);
  const dayEvents = eventsOnDate(visibleEvents, selected);
  const dates = monthDates(month);
  const weeks = Array.from({ length: dates.length / 7 }, (_, index) => dates.slice(index * 7, index * 7 + 7));
  const monthLabel = formatDate(`${month}-01`, { day: undefined, year: "numeric" });
  const goToMonth = next => {
    setMonth(next);
    setSelected(`${next}-01`);
  };
  const goToToday = () => {
    setMonth(today.slice(0, 7));
    setSelected(today);
  };
  const onDayKeyDown = (event, date) => {
    const offsets = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    let next;
    if (event.key in offsets) next = addDays(date, offsets[event.key]);
    if (event.key === "Home") next = addDays(date, -asDate(date).getUTCDay());
    if (event.key === "End") next = addDays(date, 6 - asDate(date).getUTCDay());
    if (!next) return;
    event.preventDefault();
    if (next < settings.startDate || next > settings.endDate) return;
    focusDay.current = true;
    setMonth(next.slice(0, 7));
    setSelected(next);
  };

  return (
    <section className="school-calendar" aria-label={`${settings.schoolYear} school calendar`}>
      <div className="calendar-toolbar">
        <div className="calendar-month-controls">
          <button type="button" className="calendar-step" aria-label="Previous month" disabled={month === firstMonth}
            onClick={() => goToMonth(addMonths(month, -1))}><span aria-hidden="true">‹</span></button>
          <label className="calendar-month-select">
            <span className="calendar-sr-only">Choose month</span>
            <select value={month} onChange={event => goToMonth(event.target.value)}>
              {months.map(value => <option key={value} value={value}>{formatDate(`${value}-01`, { day: undefined, year: "numeric" })}</option>)}
            </select>
          </label>
          <button type="button" className="calendar-step" aria-label="Next month" disabled={month === lastMonth}
            onClick={() => goToMonth(addMonths(month, 1))}><span aria-hidden="true">›</span></button>
          {today >= settings.startDate && today <= settings.endDate && <button type="button" className="calendar-today" onClick={goToToday}>Today</button>}
        </div>
        <div className="calendar-view-toggle" role="group" aria-label="Calendar view">
          <button type="button" aria-pressed={view === "month"} onClick={() => setView("month")}>Month</button>
          <button type="button" aria-pressed={view === "agenda"} onClick={() => setView("agenda")}>Agenda</button>
        </div>
      </div>
      <div className="calendar-filters" role="group" aria-label="Filter events">
        <button type="button" aria-pressed={filter === "all"} onClick={() => setFilter("all")}>All events</button>
        {Object.entries(categories).map(([key, label]) => <button type="button" key={key}
          className={`calendar-filter calendar-category-${key}`} aria-pressed={filter === key} onClick={() => setFilter(key)}>
          <span className="calendar-category-dot" aria-hidden="true" />{label}
        </button>)}
      </div>
      <p className="calendar-result-count" role="status">{monthLabel} · {monthEvents.length} {monthEvents.length === 1 ? "event" : "events"}{filter !== "all" && ` · ${categories[filter]}`}</p>
      {view === "month" ? (
        <div className="calendar-layout">
          <div className="calendar-grid-panel" ref={calendar}>
            <table className="calendar-grid" aria-label={monthLabel}>
              <thead><tr>{["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map(day =>
                <th key={day} scope="col"><abbr title={day}>{day.slice(0, 3)}</abbr></th>
              )}</tr></thead>
              <tbody>{weeks.map(week => <tr key={week[0]}>{week.map(date => {
                const inMonth = date.slice(0, 7) === month;
                const entries = inMonth ? eventsOnDate(visibleEvents, date) : [];
                return <td key={date} className={!inMonth ? "calendar-outside" : ""}>
                  {inMonth ? <button type="button" data-date={date} tabIndex={date === selected ? 0 : -1}
                    className={`calendar-day${date === selected ? " is-selected" : ""}${date === today ? " is-today" : ""}`}
                    aria-current={date === today ? "date" : undefined} aria-pressed={date === selected}
                    aria-label={`${formatDate(date, { weekday: "long", year: "numeric" })}${date === today ? ", today" : ""}. ${entries.length ? entries.map(entry => entry.title).join("; ") : "No scheduled events"}`}
                    onClick={() => setSelected(date)} onKeyDown={event => onDayKeyDown(event, date)}>
                    <span className="calendar-day-number">{Number(date.slice(8))}</span>
                    <span className="calendar-day-events" aria-hidden="true">{entries.map(entry =>
                      <span key={entry.slug} className={`calendar-day-event calendar-category-${entry.category}`}>
                        <span className="calendar-category-dot" /><span className="calendar-day-event-title">{entry.title}</span>
                      </span>
                    )}</span>
                  </button> : <span className="calendar-outside-number" aria-hidden="true">{Number(date.slice(8))}</span>}
                </td>;
              })}</tr>)}</tbody>
            </table>
            <p className="calendar-hint">Select a day for details. Use arrow keys to move between days.</p>
          </div>
          <aside className="calendar-day-details" aria-label="Selected day" aria-live="polite" aria-atomic="true">
            <p className="calendar-eyebrow">{formatDate(selected, { weekday: "long", month: undefined, day: undefined })}</p>
            <h2>{formatDate(selected)}</h2>
            {dayEvents.length ? dayEvents.map(event => <CalendarEvent event={event} key={event.slug} />) :
              <div className="calendar-empty"><p>{filter === "all" ? "No scheduled events." : "No matching events on this day."}</p>
                <p>{filter === "all" ? "No events are scheduled for this day." : "Choose another day or select All events."}</p>
              </div>}
            <div className="calendar-month-summary"><span>{monthEvents.length}</span> {filter === "all" ? "events" : "matching events"} this month
              {monthEvents.length > 0 && <button type="button" onClick={() => setView("agenda")}>View month’s agenda</button>}
            </div>
          </aside>
        </div>
      ) : (
        <div className="calendar-agenda" aria-label={`${monthLabel} agenda`}>
          <h2>{monthLabel}</h2>
          {monthEvents.length ? monthEvents.map(event => <CalendarEvent key={event.slug} event={event} />) :
            <p className="calendar-empty">No events match this filter for {monthLabel}. Try another month or select All events.</p>}
        </div>
      )}
      <div className="calendar-trimesters" aria-label="Trimester dates">
        {settings.trimesters.map(trimester => <div key={trimester.name}>
          <h2>{trimester.name}</h2><p>{formatDate(trimester.start, { month: "short" })} – {formatDate(trimester.end, { month: "short" })}</p>
        </div>)}
      </div>
    </section>
  );
};

export default SchoolCalendar;
