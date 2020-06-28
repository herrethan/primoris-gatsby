import React from "react"
import { Link, useStaticQuery, graphql } from "gatsby"
import Footer from './footer';
import "./layout.css"

const Layout = ({ location, title, children }) => {
  const data = useStaticQuery(graphql`
    query SiteTitleQuery {
      site {
        siteMetadata {
          title
        }
      }
    }
  `);

      // <header>title: {title}</header>
  return (
    <div>
      <main>{children}</main>
      <Footer />
    </div>

  )
}

export default Layout
