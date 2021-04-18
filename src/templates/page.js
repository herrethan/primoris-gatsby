import React, { useEffect } from "react";
import { Link, graphql } from "gatsby";
import SEO from "../components/seo";
import Header from "../components/header";
import Footer from "../components/footer";
import { isEqual } from 'lodash';
import { initFullScreenToggle } from "../components/full-screen-toggle";
import { initForms } from "../components/forms";
import StudentTestimonials from "../components/student-testimonials";

const pageTerms = (path) => path.split('/').filter(term => !!term);

const PageTemplate = ({ data, location }) => {
  const page = data.markdownRemark;
  const image = page.frontmatter.image && page.frontmatter.image.publicURL;
  const pathTerms = pageTerms(location.pathname);
  let subPages = [];

  // if (pathTerms.length > 1) {
  //   subPages = data.allMarkdownRemark && data.allMarkdownRemark.edges.map(
  //     edge => ({
  //       slug: edge?.node?.fields?.slug,
  //       title: edge?.node?.frontmatter?.title
  //     })
  //   ).filter(node => pageTerms(node.slug).length > 1 && pageTerms(node.slug)[0] === pathTerms[0]);    
  // }

  useEffect(() => {
    if (page.frontmatter.title === 'Contact us') initForms();
    if (page.frontmatter.title === 'High school') initFullScreenToggle();
  }, [page.frontmatter.title])
  
  return (
    <>
      <SEO
        title={page.frontmatter.title}
        description={page.excerpt}
      />
      <Header backgroundImg={image} height={image ? 380 : 100}>
        {!!image && !!page.frontmatter.title && (
          <div className="content">
            <div className="header-blurb">
              <h1>{page.frontmatter.title}</h1>
              <div dangerouslySetInnerHTML={{ __html: page.frontmatter.blurb }}></div>
            </div>
          </div>
        )}
      </Header>

      {/* {subPages.length > 0 && (
        <main className="content">
          <div className="row">
            <div className="column medium-3">
              <h2 className="capitalize">{pathTerms[0]}</h2>
              <ul className="content-subnav">
                {subPages.map(subpage => (
                  <li key={subpage.slug} className={isEqual(pageTerms(subpage.slug), pathTerms) ? 'active' : ''}>
                    <h3><Link to={subpage.slug}>{subpage.title}</Link></h3>
                  </li>
                ))}
              </ul>
            </div>
            <div className="column medium-9" dangerouslySetInnerHTML={{ __html: page.html }}></div>
          </div>
        </main> 
      )} */}

      {/* {subPages.length === 0 && ( */}
        <main className="content" dangerouslySetInnerHTML={{ __html: page.html }} />
      {/* )} */}
        {page.frontmatter.title == 'High school' && <StudentTestimonials />}
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
