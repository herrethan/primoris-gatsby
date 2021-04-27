import React, { useState } from "react";
import { Link } from "gatsby";
import navData from "../../content/navigation.yml";
import ChevronDown from "./chevron";

const Header = ({ backgroundImg, height, children }) => {
  const [navOpened, setNavOpened] = useState(false);

  const toggleNav = () => setNavOpened(!navOpened);

  return (
    <header style={{ height: height || 100 }} className={navOpened ? 'nav-opened' : ''}>
      
      <div className="background-img" style={{ backgroundImage: `url(${backgroundImg})` }}></div>

      {children}

      <nav>
        <h1 className="site-title">
          <Link to="/">
            <img className="site-logo" src="/img/p-shadow.png" alt="" />
            <span>Primoris Academy</span>
          </Link>
        </h1>
        <button className="hamburger" onClick={toggleNav}>
          <span className="top-bun"></span>
          <span className="meat"></span>
          <span className="bottom-bun"></span>
        </button>
        <ul className="nav-links">
          {navData && navData.main && navData.main.map(item => (
            <li key={item.url}>
              <Link to={item.url}>
                {item.title}
                {item.subnav && <ChevronDown />}
              </Link>
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
          <li className="cta">
            <Link to="/contact" className="primary button">
              Inquire
            </Link>
          </li>
        </ul>
      </nav>
    </header >
  );
};

export default Header;