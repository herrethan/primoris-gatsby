import React, { useEffect, useRef, useState } from "react";
import teacherData from "../../content/teachers.json";
import departmentResources from "../../content/department-resources.json";
import "../styles/teachers-carousel.css";

const groupExamples = {
  Science: "A sample investigation could ask students to make a prediction, choose what to measure, and compare a model with their observations.",
  Humanities: "A sample discussion could begin with two interpretations of the same source, asking students which details support each reading.",
  Enrichment: "A sample project could follow a composition, prototype, or performance from its first idea through feedback and a new version.",
};

const TeachersCarousel = ({ subject, group, pathname, layout = "carousel" }) => {
  const isGrid = layout === "grid";
  const track = useRef(null);
  const dialog = useRef(null);
  const [activeTeacher, setActiveTeacher] = useState(null);
  const [position, setPosition] = useState({ start: true, end: false });
  const isPlaceholder = teacherData.placeholder;
  const profiles = teacherData.profiles;
  const resourceSlug = pathname.split("/").filter(Boolean).pop();
  const resources = departmentResources[resourceSlug];
  const sampleActivity = resources && resources.divisions["Middle School"][0];

  useEffect(() => {
    if (isGrid) return;
    const element = track.current;
    const updatePosition = () => {
      setPosition({ start: element.scrollLeft <= 2, end: element.scrollLeft + element.clientWidth >= element.scrollWidth - 2 });
    };
    updatePosition();
    element.addEventListener("scroll", updatePosition, { passive: true });
    window.addEventListener("resize", updatePosition);
    return () => {
      element.removeEventListener("scroll", updatePosition);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isGrid]);

  useEffect(() => {
    if (activeTeacher && dialog.current && !dialog.current.open) dialog.current.showModal();
  }, [activeTeacher]);

  const move = direction => {
    const element = track.current;
    const firstCard = element.querySelector("article");
    const gap = parseFloat(window.getComputedStyle(element).columnGap) || 0;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    element.scrollBy({ left: direction * (firstCard.getBoundingClientRect().width + gap), behavior: reduceMotion ? "auto" : "smooth" });
  };

  return (
    <section className={`teachers-section${isGrid ? " teachers-directory" : ""}`} id="our-teachers" aria-labelledby="teachers-heading">
      <div className="teachers-section-heading">
        <div>
          <p className="subject-eyebrow">The people behind the questions</p>
          <h2 id="teachers-heading">Our teachers</h2>
          <p className="teachers-introduction">Meet the educators who help curiosity grow.</p>
        </div>
        {!isGrid && <div className="teachers-controls" aria-label="Teacher slider controls">
          <button type="button" onClick={() => move(-1)} disabled={position.start} aria-controls="teachers-track">Previous</button>
          <button type="button" onClick={() => move(1)} disabled={position.end} aria-controls="teachers-track">Next</button>
        </div>}
      </div>
      {isPlaceholder && <p className="teachers-placeholder-note">Sample profiles · Fictional names and AI-generated portraits. Highlights are draft examples.</p>}
      <div className="teachers-track" id="teachers-track" ref={track} role="region" aria-roledescription={isGrid ? undefined : "carousel"} aria-label="Teacher profiles">
        {profiles.map((teacher, index) => (
          <article className="teacher-card" key={teacher.id} aria-label={`${teacher.name}, ${index + 1} of ${profiles.length}`}>
            <div className="teacher-identity">
              <img src={teacher.portrait} alt={isPlaceholder ? `AI-generated portrait for fictional teacher ${teacher.name}` : teacher.name} width="72" height="72" loading="lazy" />
              <div><h3>{teacher.name}</h3><p>{teacher.focus}</p></div>
            </div>
            <button className="teacher-highlight" type="button" onClick={() => setActiveTeacher(teacher)} aria-haspopup="dialog" aria-label={`Read ${teacher.name}'s highlight: ${teacher.highlight.title}`}>
              <span className="teacher-highlight-label">{isPlaceholder ? "Sample teaching highlight" : "Teaching highlight"}</span>
              <span className="teacher-highlight-title">{teacher.highlight.title}</span>
              <span className="teacher-highlight-excerpt">{teacher.highlight.excerpt}</span>
              <span className="teacher-highlight-read">Read highlight</span>
            </button>
          </article>
        ))}
      </div>
      <dialog className="teacher-dialog" ref={dialog} aria-labelledby="teacher-highlight-heading" onClose={() => setActiveTeacher(null)}>
        {activeTeacher && <>
          <div className="teacher-dialog-topline"><span>{isPlaceholder ? "Sample teaching highlight" : "Teaching highlight"}</span><form method="dialog"><button type="submit">Close</button></form></div>
          <div className="teacher-identity"><img src={activeTeacher.portrait} alt="" width="64" height="64" /><div><h3>{activeTeacher.name}</h3><p>{activeTeacher.focus}</p></div></div>
          <p className="teacher-dialog-subject">{subject}</p>
          <h2 id="teacher-highlight-heading">{activeTeacher.highlight.title}</h2>
          {isPlaceholder && <p className="teacher-dialog-note">Not reviewed · This is a fictional teacher and an illustrative article, not a report of actual faculty or classroom work.</p>}
          {activeTeacher.highlight.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
          {isPlaceholder && !isGrid && <div className="teacher-dialog-example"><h3>A possible connection in this department</h3><p>{groupExamples[group] || "A sample project could connect ideas across subjects, giving students a chance to compare approaches and explain what they discover."}</p>{sampleActivity && <><h4>{sampleActivity.title}</h4><p>{sampleActivity.prompt}</p></>}</div>}
        </>}
      </dialog>
    </section>
  );
};

export default TeachersCarousel;
