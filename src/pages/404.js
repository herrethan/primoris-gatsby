import React from "react";
import { Link } from "gatsby";
import Layout from "../components/layout";
import SEO from "../components/seo";

const NotFoundPage = () => {

  return (
    <Layout>
      <SEO title="404: Not Found" />
      <h1>Not Found</h1>
      <p>Sorry, you've reached a page that doesn&#39;t exist.</p>
      <p>Please <Link to="/contact">contact us</Link> if you believe this is an error.</p>
    </Layout>
  )
}

export default NotFoundPage;
