import React from "react"
import Header from './header';
import Footer from './footer';

const Layout = ({ children }) => {
  return (
    <>
      <Header />
      <main className="content">{children}</main>
      <Footer />
    </>
  )
}

export default Layout
