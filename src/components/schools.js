import React from "react";
import navData from "../../content/navigation.yml";

const normalize = pathname => pathname.replace(/\/$/, "");

export const SchoolNav = ({ pathname }) => {
  const schools = navData.main.find(item => item.title === "Our Schools");
  if (!schools) return null;

  return (
    <aside className="school-strip" aria-label="School divisions">
      <div className="content">
        <a className="school-strip-overview" href={schools.url}
          aria-current={normalize(pathname) === normalize(schools.url) ? "page" : undefined}>
          Our Schools
        </a>
        <ul>
          {schools.subnav.filter(school => normalize(school.url) !== normalize(schools.url)).map(school => (
            <li key={school.url}>
              <a href={school.url} aria-current={normalize(pathname) === normalize(school.url) ? "page" : undefined}>
                {school.title}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};
