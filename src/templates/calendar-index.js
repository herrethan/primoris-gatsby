import React from "react";
import { graphql } from "gatsby";
import SEO from "../components/seo";
import Header from "../components/header";
import Footer from "../components/footer";
import SchoolCalendar from "../components/school-calendar";
import settings from "../../content/calendar-settings.json";

const CalendarIndexTemplate = ({ data }) => {
  const page = data.markdownRemark;
  const events = data.allCalendarEvent.nodes;

  return (
    <>
      <SEO title={`${settings.schoolYear} ${page.frontmatter.title}`} description={page.excerpt} />
      <Header />
      <main className="content calendar-page">
        <div className="calendar-intro">
          <div>
            <p className="calendar-eyebrow">Primoris Academy · {settings.schoolYear}</p>
            <h1>{page.frontmatter.title}</h1>
            <div className="calendar-description" dangerouslySetInnerHTML={{ __html: page.html }} />
          </div>
          {settings.preliminary && <div className="calendar-preliminary"><span>Preliminary calendar</span><p>Dates are subject to change.<br />Updated {settings.updated}</p></div>}
        </div>
        <SchoolCalendar events={events} />
      </main>
      <Footer />
    </>
  );
};

export default CalendarIndexTemplate;

export const pageQuery = graphql`
  query CalendarBySlug($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      excerpt(pruneLength: 160)
      html
      frontmatter { title }
    }
    allCalendarEvent(sort: {fields: [date, slug], order: ASC}) {
      nodes {
        slug
        detail
        title
        date(formatString: "YYYY-MM-DD")
        endDate(formatString: "YYYY-MM-DD")
        category
        noSchool
        time
      }
    }
  }
`;
