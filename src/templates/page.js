import React, { useEffect } from "react";
import { graphql } from "gatsby";
import SEO from "../components/seo";
import Header from "../components/header";
import Footer from "../components/footer";
import { initForms } from "../components/forms";
import StudentTestimonials from "../components/student-testimonials";
import TeachersCarousel from "../components/teachers-carousel";
import { AboutNav, AboutDirectory, isAboutPage } from "../components/about";
import { SchoolNav } from "../components/schools";
import "../styles/schools.css";
import Faq from "../components/faq";

import { DepartmentNav, DepartmentDirectory, departmentGroups, groupUrl, getDepartmentGroup } from "../components/departments";
import "../styles/departments.css";

const darkHeaderPages = [
  'About Us',
  'FAQ',
  'Teachers',
  'Programs',
  'Pre School'
];

const PageTemplate = ({ data, location }) => {
  const page = data.markdownRemark;
  const pathname = location.pathname;
  const isFaq = /^\/admissions\/faq\/?$/.test(pathname);
  const isSchool = /^\/schools(?:\/|$)/.test(pathname);
  const isSchoolOverview = /^\/schools\/?$/.test(pathname);
  const isHighSchool = /^\/schools\/high-school\/?$/.test(pathname);
  const isAbout = isAboutPage(pathname);
  const isAboutOverview = /^\/about\/?$/.test(pathname);
  const isTeachers = /^\/about\/teachers\/?$/.test(pathname);
  const isDepartment = pathname.startsWith("/departments/");
  const isMathematics = /^\/departments\/math\/?$/.test(pathname);
  const isSubject = isDepartment && !!getDepartmentGroup(pathname) && !departmentGroups.some(group => groupUrl(group).replace(/\/$/, "") === pathname.replace(/\/$/, ""));
  const directoryGroup = departmentGroups.find(group => groupUrl(group).replace(/\/$/, "") === pathname.replace(/\/$/, ""));
  const image = page.frontmatter.image && page.frontmatter.image.publicURL;

  useEffect(() => {
    if (page.frontmatter.title === 'Contact us') initForms();
  }, [page.frontmatter.title]);
  
  const headerHeight = image ? (isMathematics ? 420 : isDepartment ? 300 : 380) : 100;

  const darken = darkHeaderPages.indexOf(page.frontmatter.title) > -1;

  return (
    <>
      <SEO
        title={page.frontmatter.title}
        description={page.excerpt}
      />
      <Header backgroundImg={image} height={headerHeight} darken={darken || isMathematics} departmentPage={isDepartment} departmentSubnav={isDepartment && !!getDepartmentGroup(pathname)} schoolPage={isSchool}>
        {(!!image || isSchool) && !!page.frontmatter.title && (
          <div className="content">
            <div className={`header-blurb${isDepartment ? " department-hero" : ""}${isMathematics ? " mathematics-hero" : ""}${isSchool ? " school-hero" : ""}${isFaq ? " faq-hero" : ""}`}>
              {isFaq && <p className="faq-eyebrow">Frequently asked questions</p>}
              {isSchool && <p className="school-eyebrow">{isSchoolOverview ? "Learning at Primoris" : <a href="/schools/">Our Schools</a>}</p>}
              {isMathematics && <p className="subject-eyebrow">Science at Primoris</p>}
              <h1>{isFaq ? "A closer look at Primoris." : page.frontmatter.title}</h1>
              <div dangerouslySetInnerHTML={{ __html: page.frontmatter.blurb }}></div>
              {isSchool && <a className="button" href="/contact/">Inquire at Primoris</a>}
            </div>
          </div>
        )}
      </Header>

      {isDepartment && <DepartmentNav pathname={pathname} />}
      {isSchool && <SchoolNav pathname={pathname} />}
      {isAbout && <AboutNav pathname={pathname} />}
      <main className={`content${isSubject ? " subject-page" : ""}${isSchool ? " school-page" : ""}${isFaq ? " faq-page" : ""}`}>
        {(isDepartment || isSchool) && page.frontmatter.reviewed !== true && (
          <aside className="department-review-banner" aria-label="Content review status">
            <strong>Not reviewed</strong>
            <span>{isSchool ? "Draft school content for review. Division boundaries, track details, electives, and sample schedules need school confirmation." : "Draft content for review. Curriculum, sample activities, and highlights are illustrative until approved."}</span>
          </aside>
        )}
        {isAboutOverview && <AboutDirectory />}
        {isFaq ? <Faq html={page.html} /> : <div dangerouslySetInnerHTML={{ __html: page.html }} />}
        {isTeachers && <TeachersCarousel subject="Teaching at Primoris" pathname={pathname} layout="grid" />}
        {(directoryGroup || /^\/departments\/?$/.test(pathname)) && <DepartmentDirectory group={directoryGroup} />}
        {isDepartment && <TeachersCarousel subject={page.frontmatter.title} group={getDepartmentGroup(pathname)} pathname={pathname} />}
      </main>

      {isHighSchool && <StudentTestimonials />}

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
        reviewed
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
