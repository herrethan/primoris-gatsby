import React from "react"
import { Link, graphql } from "gatsby"

import Layout from "../components/layout"
import navData from "../../content/navigation.yml"

const BlogIndex = ({ data, location }) => {
  const siteTitle = data.site.siteMetadata.title
  const posts = data.allMarkdownRemark.edges
  console.log(navData, location)

  return (
    <Layout location={location} title={siteTitle}>
      <div className="body-index">
        <header>
          <div className="slideshow" style={{position:'relative', height: '100%'}}>
          <div className="background-img" style={{backgroundImage: 'url(/img/pole-corners.jpg)', opacity: 1}}></div>
          <div className="background-img" style={{backgroundImage: 'url(/img/in-garden.jpg)', opacity: 1}}></div>
          <div className="background-img" style={{backgroundImage: 'url(/img/antigone.jpg)', opacity: 0}}></div>
          <div className="background-img" style={{backgroundImage: 'url(/img/ground-mural.jpg)', opacity: 0}}></div>
          <div className="background-img" style={{backgroundImage: 'url(/img/pythias.jpg)', opacity: 0}}></div></div>
          <button className="slideshow-arrow-left">←</button>
          <button className="slideshow-arrow-right">→</button>


          <h1 className="site-title">
            <a href="/">
              <img className="site-logo" src="/img/p-shadow.png" />
              <span>Primoris Academy</span>
            </a>
          </h1>
          <div className="page-head-wrap">
            <span className="page-subhead">a vibrant &amp; nurturing school for the</span>
            <h1>PASSIONATELY CURIOUS</h1>
            <a href="/about" className="cta-button">Learn More</a>
          </div>

          <nav>
            <a href="javascript:;" className="hamburger">
              <span className="top-bun"></span>
              <span className="meat"></span>
              <span className="bottom-bun"></span>
            </a>
            <ul className="nav-links">
              {navData && navData.main && navData.main.map(item => (
                <li key={item.url}>
                  <Link to={item.url}>{item.title}</Link>
                  {item.subnav && (
                    <ul className="subnav">
                      {item.subnav.map(subitem => (
                        <li key={subitem.url}>
                          <Link to={subitem.url}>{subitem.title}</Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </nav>

        </header>
      </div>
    </Layout>
  )
}

        // <nav>
        //   <a href="javascript:;" class="hamburger">
        //     <span class="top-bun"></span>
        //     <span class="meat"></span>
        //     <span class="bottom-bun"></span>
        //   </a>
        //   <ul class="nav-links">        <li>
        //         <a href="https://primoris.herokuapp.com/about">about
        //         </a>
        //       </li>        <li>
        //         <a href="https://primoris.herokuapp.com/programs">programs
        //         </a>
        //       </li>        <li>
        //         <a href="https://primoris.herokuapp.com/admissions/apply">admissions
        //         </a>            <ul class="subnav">            <li><a href="https://primoris.herokuapp.com/admissions/apply">Apply</a></li>            <li><a href="https://primoris.herokuapp.com/admissions/faq">FAQ</a></li>            </ul>
        //       </li>        <li>
        //         <a href="https://primoris.herokuapp.com/calendar">calendar
        //         </a>
        //       </li>        <li>
        //         <a href="https://primoris.herokuapp.com/contact">contact
        //         </a>
        //       </li>    </ul>
        // </nav>
export default BlogIndex

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


// {posts.map(({ node }) => {
//         const title = node.frontmatter.title || node.fields.slug
//         return (
//           <article key={node.fields.slug}>
//             <header>
//               <h3
//                 style={{
//                   marginBottom: rhythm(1 / 4),
//                 }}
//               >
//                 <Link style={{ boxShadow: `none` }} to={node.fields.slug}>
//                   {title}
//                 </Link>
//               </h3>
//               <small>{node.frontmatter.date}</small>
//             </header>
//             <section>
//               <p
//                 dangerouslySetInnerHTML={{
//                   __html: node.frontmatter.description || node.excerpt,
//                 }}
//               />
//             </section>
//           </article>
//         )
//       })}
