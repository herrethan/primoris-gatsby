import React, { useEffect, useRef, useState } from "react"
import "../styles/faq.css"

const topics = [
  {
    id: "finding-the-right-fit",
    title: "Finding the right fit",
    description: "Your child’s interests, pace, and learning needs.",
  },
  {
    id: "learning-and-student-life",
    title: "Learning & student life",
    description: "Inside the classroom and beyond the lesson.",
  },
  {
    id: "visiting-and-applying",
    title: "Visiting & applying",
    description: "From your first visit to an admissions decision.",
  },
  {
    id: "tuition-and-financial-assistance",
    title: "Tuition & financial assistance",
    description: "Planning for your family’s next chapter.",
  },
  {
    id: "everyday-essentials",
    title: "Everyday essentials",
    description: "The practical details that help a day go smoothly.",
  },
]

const Faq = ({ html }) => {
  const answers = useRef(null)
  const savedOpen = useRef(null)
  const searchInput = useRef(null)
  const [query, setQuery] = useState("")
  const [count, setCount] = useState(null)

  useEffect(() => {
    const groups = Array.from(answers.current.querySelectorAll(".faq-group"))
    const entries = groups.flatMap(group =>
      Array.from(group.querySelectorAll("details"))
    )
    const term = query.trim().toLocaleLowerCase()
    if (term && !savedOpen.current)
      savedOpen.current = entries.map(entry => entry.open)
    let matches = 0
    groups.forEach(group => {
      let groupMatches = 0
      group.querySelectorAll("details").forEach(entry => {
        const match =
          !term || entry.textContent.toLocaleLowerCase().includes(term)
        entry.hidden = !match
        if (term) entry.open = match
        if (match) groupMatches++
      })
      group.hidden = groupMatches === 0
      matches += groupMatches
    })
    if (!term && savedOpen.current) {
      entries.forEach((entry, index) => {
        entry.open = savedOpen.current[index]
      })
      savedOpen.current = null
    }
    setCount(matches)
  }, [query, html])

  const setAllOpen = open => {
    answers.current.querySelectorAll("details:not([hidden])").forEach(entry => {
      entry.open = open
    })
  }
  const clearSearch = () => {
    setQuery("")
    searchInput.current.focus()
  }
  const browseTopic = () => {
    setQuery("")
    // Make an anchor target visible before the browser follows the topic link.
    answers.current.querySelectorAll("[hidden]").forEach(element => {
      element.hidden = false
    })
  }

  return (
    <div className="family-faq">
      <aside className="faq-draft">
        <strong>Draft answers for review</strong>
        <span>
          Sample copy while we confirm school policies, schedules, fees, and
          admissions requirements. Please contact admissions for current
          details.
        </span>
      </aside>
      <div className="faq-layout">
        <aside className="faq-sidebar">
          <nav aria-label="FAQ topics">
            <p className="faq-eyebrow">What’s on your mind?</p>
            <ul>
              {topics.map(topic => (
                <li key={topic.id}>
                  <a href={`#${topic.id}`} onClick={browseTopic}>
                    <strong>{topic.title}</strong>
                    <span>{topic.description}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="faq-personal">
            <p>Every child has a story.</p>
            <span>We’d love to hear yours.</span>
            <a href="/contact/">Talk with admissions</a>
          </div>
        </aside>
        <div className="faq-main">
          <div className="faq-search">
            <label htmlFor="faq-search">Find an answer</label>
            <div className="faq-search-input">
              <input
                id="faq-search"
                ref={searchInput}
                type="search"
                placeholder="Try “placement” or “shadow days”"
                value={query}
                onChange={event => setQuery(event.target.value)}
                aria-controls="faq-answers"
              />
              {query && (
                <button type="button" onClick={clearSearch}>
                  Clear
                </button>
              )}
            </div>
          </div>
          <div className="faq-tools">
            <p role="status" aria-live="polite">
              {count !== null &&
                `${count} ${count === 1 ? "answer" : "answers"}${
                  query.trim() ? " found" : " to explore"
                }`}
            </p>
            <div>
              <button type="button" onClick={() => setAllOpen(true)}>
                Expand all
              </button>
              <button type="button" onClick={() => setAllOpen(false)}>
                Collapse all
              </button>
            </div>
          </div>
          <div
            id="faq-answers"
            ref={answers}
            dangerouslySetInnerHTML={{ __html: html }}
          />
          {count === 0 && (
            <div className="faq-empty">
              <h2>Let’s try another question.</h2>
              <p>
                Try a shorter phrase, browse a topic, or ask our admissions
                team.
              </p>
              <button type="button" onClick={clearSearch}>
                Show all questions
              </button>
            </div>
          )}
        </div>
      </div>
      <section
        className="faq-invitation"
        aria-labelledby="faq-invitation-title"
      >
        <div>
          <p className="faq-eyebrow">Let’s get to know each other</p>
          <h2 id="faq-invitation-title">
            Some answers start with a conversation.
          </h2>
          <p>
            Tell us what your child loves, what they need, and what you’re
            hoping to find in a school.
          </p>
        </div>
        <div className="faq-invitation-actions">
          <a className="faq-contact" href="/contact/">
            Start a conversation
          </a>
          <a href="/admissions/apply/">Explore the application process</a>
        </div>
      </section>
    </div>
  )
}

export default Faq
