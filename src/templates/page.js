import React, { useEffect } from "react";
import { graphql } from "gatsby";
import SEO from "../components/seo";
import Header from "../components/header";
import Footer from "../components/footer";
import { initFullScreenToggle } from "../components/full-screen-toggle";
import { initForms } from "../components/forms";
import StudentTestimonials from "../components/student-testimonials";
import Faq from "../components/faq";

const departmentPages = [
  'English/Language Arts',
  'Science',
  'Math',
  'Programming and Robotics',
  'Mandarin',
  'History',
  'Music and Performing Arts',
  'Fine and Visual Arts',
  'Athletics and Health'
]

const PageTemplate = ({ data, location }) => {
  const page = data.markdownRemark;
  const image = page.frontmatter.image && page.frontmatter.image.publicURL;

  useEffect(() => {
    if (page.frontmatter.title === 'Contact us') initForms();
    if (page.frontmatter.title === 'High school') initFullScreenToggle();
  }, [page.frontmatter.title]);
  

  const headerHeight = image ? (departmentPages.indexOf(page.frontmatter.title) > -1 ? 300 : 380) : 100;
  
  return (
    <>
      <SEO
        title={page.frontmatter.title}
        description={page.excerpt}
      />
      <Header backgroundImg={image} height={headerHeight}>
        {!!image && !!page.frontmatter.title && (
          <div className="content">
            <div className="header-blurb">
              <h1>{page.frontmatter.title}</h1>
              <div dangerouslySetInnerHTML={{ __html: page.frontmatter.blurb }}></div>
            </div>
          </div>
        )}
      </Header>

      <main className="content" dangerouslySetInnerHTML={{ __html: page.html }} />

      {page.frontmatter.title === 'High school' && <StudentTestimonials />}

      {page.frontmatter.title === 'Elementary and Middle School' && <Faq />}

      <Footer />
    </>
  )
}

export default PageTemplate

export const pageQuery = graphql`
  query PageBySlug($slug: String!) {
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
