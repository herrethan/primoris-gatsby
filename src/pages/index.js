import React from "react";
import { Link, graphql } from "gatsby";
import SEO from "../components/seo";
import slider from "../../content/home-page-slider.yml";
import homePageBody from "../../content/home-page-body.yml";
import Header from '../components/header';
import Footer from '../components/footer';
import ImageSlider from '../components/image-slider';

const SiteIndex = ({ data, location }) => {
  // console.log(location)
  // const siteTitle = data.site.siteMetadata.title;
  // const posts = data.allMarkdownRemark.edges;

  return (
    <>
      <SEO
        title={''}
        description="A vibrant and nurturing school for the passionately curious"
      />
      <Header height={700}>
        {slider && slider.images && slider.images.length && <ImageSlider interval={slider.interval * 1000} images={slider.images} />}
        <div className="page-head-wrap">
          <span className="page-subhead">a vibrant &amp; nurturing school for the</span>
          <h1>PASSIONATELY CURIOUS</h1>
          <Link to="/about" className="cta-button">Learn More</Link>
        </div>
      </Header>
      {homePageBody && <main className="content" dangerouslySetInnerHTML={{ __html: homePageBody.body }} />}
      <Footer />
    </>
  )
}

export default SiteIndex

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
    allMarkdownRemark(sort: { fields: [frontmatter___date], order: DESC }) {
      edges {
        node {
          excerpt
          fields {
            slug
          }
          frontmatter {
            date(formatString: "MMMM DD, YYYY")
            title
            description
          }
        }
      }
    }
  }
`
