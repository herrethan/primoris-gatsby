import React from "react";
import { Link, graphql } from "gatsby";
import SEO from "../components/seo";
import Header from "../components/header";
import Footer from "../components/footer";
import moment from 'moment';

const PageTemplate = ({ data }) => {
  const page = data.markdownRemark;

  return (
    <>
      <SEO
        title={page.frontmatter.title}
        description={page.excerpt}
      />
      <Header />
      {page && (
        <main className="content">
          <h1>{page.frontmatter.title}</h1>
          <p>
            {moment(page.frontmatter.date).format('dddd, MMMM Do, YYYY')}
            <br />
            {page.frontmatter.detail}
          </p>
          <div dangerouslySetInnerHTML={{ __html: page.html }}></div>
          <Link to="/calendar">&larr; Back to calendar</Link>
        </main>
      )}
      <Footer />
    </>
  )
}

export default PageTemplate

export const pageQuery = graphql`
  query EventBySlug($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      excerpt(pruneLength: 120)
      html
      frontmatter {
        detail
        title
        date
      }
    }
  }
`
