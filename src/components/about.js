import React from "react";
import navData from "../../content/navigation.yml";
import "../styles/about.css";

const aboutPages = navData.main.find(item => item.title === "About Us").subnav;
const normalize = url => url.replace(/\/$/, "");

export const isAboutPage = pathname => aboutPages.some(page => normalize(page.url) === normalize(pathname));

export const AboutNav = ({ pathname }) => (
  <div className="about-navigation" role="navigation" aria-label="About Us">
    <div className="content">
      <span className="about-navigation-label">About Us</span>
      <ul>
        {aboutPages.map(page => (
          <li key={page.url}>
            <a href={page.url} aria-current={normalize(page.url) === normalize(pathname) ? "page" : undefined}>{page.title}</a>
          </li>
        ))}
      </ul>
    </div>
  </div>
);

const descriptions = {
  FAQ: "Find answers about school life, admissions, and what to expect at Primoris.",
  Teachers: "Meet the people behind the learning and explore their teaching stories.",
  Awards: "Celebrate student accomplishments across academics, the arts, and competitions.",
};

export const AboutDirectory = () => (
  <section className="about-directory" aria-labelledby="explore-about-heading">
    <h2 id="explore-about-heading">Get to know Primoris</h2>
    <div className="about-directory-grid">
      {aboutPages.filter(page => descriptions[page.title]).map(page => (
        <a key={page.url} href={page.url}>
          <h3>{page.title}</h3>
          <p>{descriptions[page.title]}</p>
          <span>Explore {page.title}</span>
        </a>
      ))}
    </div>
  </section>
);
