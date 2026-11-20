import React from "react";
import { Link, graphql } from "gatsby";
import SEO from "../components/seo";
import Header from "../components/header";
import Footer from "../components/footer";
import { categories, eventDateLabel } from "../utils/calendar";
import settings from "../../content/calendar-settings.json";
import "../styles/calendar.css";

const PageTemplate = ({ data }) => {
  const event = data.calendarEvent;

  return (
    <>
      <SEO
        title={event.title}
        description={event.detail || `${event.title} · ${eventDateLabel(event)}`}
      />
      <Header />
      {event && (
        <main className="content calendar-page calendar-event-page">
          <p className="calendar-eyebrow">{settings.schoolYear} · {categories[event.category]}</p>
          <h1>{event.title}</h1>
          <p className="calendar-event-full-date">{eventDateLabel(event)}{event.time && ` · ${event.time} ET`}</p>
          {event.detail && <p style={{ whiteSpace: "pre-line" }}>{event.detail}</p>}
          {settings.preliminary && <p className="calendar-empty">Preliminary calendar. Dates are subject to change.</p>}
          <Link className="calendar-back" to="/calendar/">Back to calendar</Link>
        </main>
      )}
      <Footer />
    </>
  )
}

export default PageTemplate

export const pageQuery = graphql`
  query CalendarEventById($id: String!) {
    calendarEvent(id: { eq: $id }) {
        detail
        title
        date(formatString: "YYYY-MM-DD")
        endDate(formatString: "YYYY-MM-DD")
        category
        noSchool
        time
    }
  }
`
