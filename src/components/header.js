import React, { useState } from "react";
import { Link } from "gatsby";
import navData from "../../content/navigation.yml";

const Header = ({ backgroundImg, height, children }) => {
  const [navOpened, setNavOpened] = useState(false);

  const toggleNav = () => setNavOpened(!navOpened);

  return (
    <header style={{ height: height || 100 }} className={navOpened ? 'nav-opened' : ''}>
      
      <div className="background-img" style={{ backgroundImage: `url(${backgroundImg})` }}></div>

      {children}

      <h1 className="site-title">
        <Link to="/">
          <img className="site-logo" src="/img/p-shadow.png" />
          <span>Primoris Academy</span>
        </Link>
      </h1>

      <nav>
        <a className="hamburger" onClick={toggleNav}>
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
    </header >
  );
};

export default Header;