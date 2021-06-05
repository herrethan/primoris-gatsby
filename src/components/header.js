import React, { useState } from "react";
// TODO: figure out why Links don't work after 3 clicks in production builds
// import { Link } from "gatsby"; 
import navData from "../../content/navigation.yml";
import ChevronDown from "./chevron";
import Magnifier from "./magnifier";

const NavItem = ({ item }) => {
  return (
    <li key={item.url}>
      {!item.subnav && (
        <a href={item.url}>
          {item.title}
          {item.subnav && <ChevronDown />}
        </a>
      )}
      {item.subnav && (
        <>
          <button className="mobile-nav-item">
            {item.title}
            {item.subnav && <ChevronDown />}
          </button>
          <a href={item.url} className="desktop-nav-item">
            {item.title}
            {item.subnav && <ChevronDown />}
          </a>
        </>
      )}
      {item.subnav && (
        <ul className="subnav">
          {item.subnav.map(subitem => (
            <li key={subitem.url}>
              <a href={subitem.url}>{subitem.title}</a>
            </li>
          ))}
        </ul>
      )}
    </li>
  )
}

const Header = ({ backgroundImg, height, children, darken=false }) => {
  const [navOpened, setNavOpened] = useState(false);
  
  const toggleNav = () => setNavOpened(!navOpened);

  return (
    <header style={{ height: height || 100 }} className={navOpened ? 'nav-opened' : ''}>
      
      <div 
        className={`background-img${darken ? ' background-img-darken' : ''}`} 
        style={backgroundImg && { backgroundImage: `url(${backgroundImg})` }}>
      </div>

      {children}

      <nav>
        <h1 className="site-title">
          <a href="/">
            <img className="site-logo" src="/img/p-shadow.png" alt="" />
            <span>Primoris Academy</span>
          </a>
        </h1>
        <button className="hamburger" onClick={toggleNav}>
          <span className="top-bun"></span>
          <span className="meat"></span>
          <span className="bottom-bun"></span>
        </button>
        <ul className="nav-links">
          {navData && navData.main && navData.main.map(item => (
            <NavItem key={item.title} item={item} />
          ))}
          <li className="icon-button">
            <a href="/search"><Magnifier /></a>
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