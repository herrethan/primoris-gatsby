import React, { useEffect } from "react";
import { graphql } from "gatsby";
import SEO from "../components/seo";
import Header from "../components/header";
import Footer from "../components/footer";
import { initForms } from "../components/forms";


const ContactUsTemplate = ({ data, location }) => {
  const page = data.markdownRemark;
  const image = page.frontmatter.image && page.frontmatter.image.publicURL;

  useEffect(() => {
    initForms();
  }, []);
  
  return (
    <>
      <SEO
        title={page.frontmatter.title}
        description={page.excerpt}
      />
      <Header backgroundImg={image} height={200}>
        {!!image && !!page.frontmatter.title && (
          <div className="content">
            <div className="header-blurb" style={{top: 50}}>
              <h1>{page.frontmatter.title}</h1>
              <div dangerouslySetInnerHTML={{ __html: page.frontmatter.blurb }}></div>
            </div>
          </div>
        )}
      </Header>
      
      <div dangerouslySetInnerHTML={{ __html: page.html }} />
      {/* <main className="content" dangerouslySetInnerHTML={{ __html: page.html }} /> */}

      <Footer />
    </>
  )
}

export default ContactUsTemplate

export const pageQuery = graphql`
  query ContactBySlug($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      excerpt(pruneLength: 120)
      html
      frontmatter {
        title
        blurb
        image {
          publicURL
        }
      }
    }
    allMarkdownRemark(sort: {fields: frontmatter___date, order: DESC}) {
      edges {
        node {
          fields {
            slug
          }
          frontmatter {
            title
          }
        }
      }
    }
  }
`
