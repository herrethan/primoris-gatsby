import React from "react";
import { Link, graphql } from "gatsby";
import SEO from "../components/seo";
import Header from "../components/header";
import Footer from "../components/footer";
import moment from 'moment';
import { partition } from 'lodash';
import GTM from "../components/gtm";

const CalendarIndexTemplate = ({ data }) => {
  const page = data.markdownRemark;
  const image = page.frontmatter.image && page.frontmatter.image.publicURL;
  const entries = data.allMarkdownRemark.edges || [];
  const events = partition(entries, entry => moment(entry.node.frontmatter.date) > moment());

  return (
    <>
      <SEO
        title={page.frontmatter.title}
        description={page.excerpt}
      />
      <GTM />
      <Header backgroundImg={image} height={image ? 500 : 100}>
        <div className="page-head-wrap">
          <h1 className="uppercase">{page.frontmatter.title}</h1>
        </div>
      </Header>
      <main className="content">
        {page && <div dangerouslySetInnerHTML={{ __html: page.html }}></div>}
        {entries.length && (
          <ul className="events">
            {[...events[0], ...events[1]].map((entry, i) => (
              <li className={i >= events[0].length ? 'is-past' : ''} key={entry.node.fields.slug}>
                <Link className="date-block" to={entry.node.fields.slug}>
                  <div>
                    <span className="month">{moment(entry.node.frontmatter.date).format('MMM')}</span>
                    <span className="day">{moment(entry.node.frontmatter.date).format('D')}</span>
                  </div>
                </Link>
                <div className="event-text">
                  <h2><Link to={entry.node.fields.slug}>{entry.node.frontmatter.title}</Link></h2>
                  <p>
                    {moment(entry.node.frontmatter.date).format('dddd, MMMM Do, YYYY')}
                    <br />
                    {entry.node.frontmatter.detail}
                  </p>
                  <p></p>                
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
      <Footer />
    </>
  )
}

export default CalendarIndexTemplate

export const pageQuery = graphql`
  query CalendarBySlug($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      excerpt(pruneLength: 120)
      html
      frontmatter {
        title
        image {
          publicURL
        }
      }
    }
    allMarkdownRemark(filter: {fields: {source: {eq: "calendar"}}}, sort: {fields: frontmatter___date, order: ASC}) {
      edges {
        node {
          fields {
            slug
          }
          frontmatter {
            detail
            title
            date
          }
        }
      }
    }
  }
`
