import React from "react";
import QuoteMark from '../components/quote-mark';
import studentTestimonials from '../../content/student-testimonials.yml';

const partition = (testimonials) => {
  const left = [];
  const right = [];
  testimonials.forEach((testimonial, i) => i % 2 === 0 ? right.push(testimonial) : left.push(testimonial));
  return [left, right];
}

const Card = ({ testimonial }) => {
  console.log(testimonial)
  return (
    <div className="student-testimonial-card">
      <div className="student-testimonial-card-header">
        <div className="student-avatar">
          {testimonial.avatar && <img src={testimonial.avatar} alt="Primoris student testimonial headshot" />}
          {!testimonial.avatar && <h2 className="student-avatar-initial">{testimonial.author.slice(0, 1)}</h2>}
        </div>
        <div style={{paddingLeft: 20}}>
          <h4 className="student-name">{testimonial.author}</h4>
          <small className="student-caption">{testimonial.caption}</small>
        </div>
      </div>
      <p>
        <QuoteMark />
        {testimonial.post}
      </p>
    </div>
  )
}

const StudentTestimonials = () => {
  if (!studentTestimonials || !studentTestimonials.entries || studentTestimonials.entries.length === 0) return null;

  const columns = partition(studentTestimonials.entries);

  return (
    <div className="student-testimonials">
      <div className="content row">
        <div className="column large-5 large-push-2">
          <div className="student-testimonials-header">
            <QuoteMark />
            <h1>What our students say</h1>
            <p>Get inspired by their stories.</p>
          </div>
          {columns[0].map(testimonial => <Card testimonial={testimonial} />)}
        </div>
        <div className="column large-5">
          {columns[1].map(testimonial => <Card testimonial={testimonial} />)}
        </div>
      </div>
    </div>
  )
}

export default StudentTestimonials;