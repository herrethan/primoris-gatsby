import React from "react";
import ChevronDown from "./chevron";
import faq from "../../content/faq.yml";

const Accordion = ({ question, answer }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="accordion">
      <button onClick={() => setIsOpen(open => !open)} className="no-style">
        <h4 className={`accordion-header ${isOpen && 'open'}`}>
          {question}
          <ChevronDown />
        </h4>
      </button>
      {isOpen && <p dangerouslySetInnerHTML={{ __html: answer }}></p>}
    </div>
  )
}

const Faq = () => {
  if (!faq) return null;

  return (
    <div className="faq align-center">
      <h2 className="faq-header">{faq.header}</h2>
      <div className="content row">
        {faq.entries.map(entry => (
          <Accordion key={entry.question} question={entry.question} answer={entry.answer} />
        ))}
      </div>
    </div>
  )
}

export default Faq;