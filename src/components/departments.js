import React from "react";
import navData from "../../content/navigation.yml";

// The dropdown, subject strip, and directories share the CMS navigation data.
export const subjects = navData.main.find(item => item.title === "Departments").subnav;
export const departmentGroups = ["Science", "Humanities", "Enrichment"];
export const groupUrl = group => `/departments/${group.toLowerCase()}/`;
const normalize = url => url.replace(/\/$/, "");

const legacyDepartmentGroups = {
  "/departments/english": "Humanities",
  "/departments/programming-and-robotics": "Science",
  "/departments/music-and-performing-arts": "Enrichment",
  "/departments/fine-and-visual-arts": "Enrichment",
};

export const getDepartmentGroup = pathname => {
  const current = subjects.find(subject => normalize(subject.url) === normalize(pathname));
  return current ? current.group : departmentGroups.find(name => normalize(groupUrl(name)) === normalize(pathname)) || legacyDepartmentGroups[normalize(pathname)];
};

export const DepartmentNav = ({ pathname }) => {
  const current = subjects.find(subject => normalize(subject.url) === normalize(pathname));
  const group = getDepartmentGroup(pathname);

  return (
    <aside className={`department-strip${group ? " has-subjects" : ""}`} aria-label="Department navigation">
      <div className="content">
        <div className="department-group-links">
          <a href="/departments/">All departments</a>
          {departmentGroups.map(name => (
            <a key={name} href={groupUrl(name)} className={name === group ? "is-active" : ""}
              aria-current={normalize(groupUrl(name)) === normalize(pathname) ? "page" : undefined}>{name}</a>
          ))}
        </div>
        {group && <a className="department-group-label" href={groupUrl(group)}>{group}</a>}
        {group && <ul className="department-subject-links">
          {subjects.filter(subject => subject.group === group).map(subject => (
            <li key={subject.url}><a href={subject.url} aria-current={subject === current ? "page" : undefined}>{subject.title}</a></li>
          ))}
        </ul>}
      </div>
    </aside>
  );
};

export const DepartmentDirectory = ({ group }) => (
  <div className="department-directory">
    {(group ? [group] : departmentGroups).map(name => (
      <section key={name}>
        <h2><a href={groupUrl(name)}>{name}</a></h2>
        <ul>{subjects.filter(subject => subject.group === name).map(subject => (
          <li key={subject.url}><a href={subject.url}>{subject.title}</a></li>
        ))}</ul>
      </section>
    ))}
  </div>
);
