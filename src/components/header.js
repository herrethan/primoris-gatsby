import React, { useState, useEffect, useRef } from "react";
// TODO: figure out why Links don't work after 3 clicks in production builds
// import { Link } from "gatsby"; 
import navData from "../../content/navigation.yml";
import ChevronDown from "./chevron";
import Magnifier from "./magnifier";
import { departmentGroups, groupUrl } from "./departments";

const NavItem = ({ item, grouped = false }) => {
  const dropdown = useRef(null);

  useEffect(() => {
    const closeOutside = event => {
      if (dropdown.current && !dropdown.current.contains(event.target)) dropdown.current.open = false;
    };
    const closeWithEscape = event => {
      if (event.key === "Escape" && dropdown.current && dropdown.current.open && dropdown.current.contains(event.target)) {
        dropdown.current.open = false;
        dropdown.current.querySelector("summary").focus();
      }
    };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeWithEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeWithEscape);
    };
  }, []);

  return (
    <li className={grouped ? "departments-menu" : ""}>
      {!item.subnav ? <a href={item.url}>{item.title}</a> : (
        <details className="nav-dropdown" ref={dropdown}
          onBlur={event => {
            if (!event.currentTarget.contains(event.relatedTarget)) event.currentTarget.open = false;
          }}>
          <summary>{item.title}<ChevronDown /></summary>
          <div className={`subnav${grouped ? " grouped-subnav" : ""}`}>
            {grouped ? <>
              <a className="departments-overview-link" href={item.url}>Explore all departments</a>
              <div className="department-menu-columns">
                {departmentGroups.map(group => <div key={group}>
                  <a className="department-menu-heading" href={groupUrl(group)}>{group}</a>
                  <ul>{item.subnav.filter(subject => subject.group === group).map(subject => (
                    <li key={subject.url}><a href={subject.url}>{subject.title}</a></li>
                  ))}</ul>
                </div>)}
              </div>
            </> : <ul>{item.subnav.map(subject => (
              <li key={subject.url}><a href={subject.url}>{subject.title}</a></li>
            ))}</ul>}
          </div>
        </details>
      )}
    </li>
  );
};

const Header = ({ backgroundImg, height, children, darken=false, departmentPage=false, departmentSubnav=false, schoolPage=false }) => {
  const [navOpened, setNavOpened] = useState(false);
  const toggleNav = () => setNavOpened(!navOpened);

  return (
    <header style={{ height: schoolPage ? "var(--school-banner-height, 300px)" : departmentPage ? `var(--department-banner-height, ${height || 100}px)` : height || 100 }}
      className={`${navOpened ? "nav-opened" : ""}${departmentPage ? " department-header" : ""}${departmentSubnav ? " has-department-subnav" : ""}${schoolPage ? " school-header" : ""}`}>
      
      <div 
        className={`background-img${darken ? ' background-img-darken' : ''}`} 
        style={backgroundImg && { backgroundImage: `url(${backgroundImg})` }}>
      </div>

      {children}

      <nav aria-label="Main navigation">
        <h1 className="site-title">
          <a href="/">
            <img className="site-logo" src="/img/p-shadow.png" alt="" />
            <span>Primoris Academy</span>
          </a>
        </h1>
        <button className="hamburger" onClick={toggleNav} aria-label={navOpened ? "Close menu" : "Open menu"} aria-expanded={navOpened} aria-controls="main-navigation">
          <span className="top-bun"></span>
          <span className="meat"></span>
          <span className="bottom-bun"></span>
        </button>
        <ul className="nav-links" id="main-navigation">
          {navData && navData.main && navData.main.map(item => (
            <NavItem key={item.title} item={item} grouped={!!item.subnav && item.subnav.some(subject => subject.group)} />
          ))}
          <li className="icon-button">
            <a href="/search" aria-label="Search"><Magnifier /></a>
          </li>
          <li className="cta">
            <a href="/contact" className="primary button">
              Inquire
            </a>
          </li>
        </ul>
      </nav>
    </header >
  );
};

export default Header;
