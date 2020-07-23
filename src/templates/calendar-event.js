import React from "react";
import { graphql } from "gatsby";
import SEO from "../components/seo";
import Header from "../components/header";
import Footer from "../components/footer";

const PageTemplate = ({ data }) => {
  const page = data.markdownRemark;
  const image = page.frontmatter.image && page.frontmatter.image.publicURL;

  return (
    <>
      <SEO
        title={`${page.frontmatter.title} | `}
        description={page.frontmatter.description || page.excerpt}
      />
      <Header backgroundImg={image} height={image ? 500 : 100}>
        <div className="page-head-wrap">
          <h1 className="uppercase">{page.frontmatter.title}</h1>
        </div>
      </Header>
      {page && <main className="content" dangerouslySetInnerHTML={{ __html: page.html }} />}
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
        title
        description
        image {
          publicURL
        }
      }
    }
  }
`
