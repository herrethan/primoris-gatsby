import React from "react";
import { Link } from "gatsby";
import SEO from "../components/seo";
import Header from '../components/header';
import Footer from '../components/footer';
import Hero from '../../static/img/hero-1.jpg';
import Faq from "../components/faq";

const SiteIndex = () => {
  return (
    <>
      <SEO
        title={''}
        description="A vibrant and nurturing school for the passionately curious"
      />
      <Header height={480} backgroundImg={Hero}>
        <div className="content">
          <div className="header-blurb">
            <h1>Never Bored, Always Inspired</h1>
            <p>Discover limitless opportunities to learn, and explore the endless possibilities of the world and our own.</p>
            <Link to="/contact" className="button primary inverted">
              Inquire
            </Link>
          </div>
        </div>
      </Header>
        <main className="content">
          <div className="row">
            <div className="column medium-6">
              <h2>Education transformed</h2>
              <p>Primoris Academy was established on the firm belief that school should
                fuel a child's curiosity. We also believe that a learning
                environment befitting their level incites children to perform and develop
                at their true potential. Students are placed based on ability rather than
                by age, and experiential learning is at the core of our approach.</p>
              <ul className="bullets">
                <li>Joyful, encouraging start to the learning journey</li>
                <li>Lively and exciting environment for continuous exploration, growth and confidence building</li>
                <li>Incubator of passionate young people, abundant creativity, and once in a lifetime opportunities </li>
              </ul>
              <Link to="/programs" className="button secondary" style={{marginTop: 20}}>
                Our programs
              </Link>
            </div>
            <div className="column medium-6">
              <img src="/img/blob-1.jpg" alt="Primoris First Lego League team Lions" />
            </div>
          </div>
          <div className="row">
            <div className="column medium-6 medium-push-6">
              <h2>A great place to be</h2>
              <p>Our mission is to foster children into thoughtful, inquisitive
                individuals with bold aspirations. Owing to a joyful, personal, and
                open education, our students will take natural interest and
                leadership in their school, local, and global communities.</p>
              <ul className="bullets">
                <li>Early exposure to all subjects</li>
                <li>Frequent cross curricular connections &amp; activities</li>
                <li>Extensive extracurricular and enrichment programs</li>
                <li>Team based competitions, interactions with field experts</li>
              </ul>
            </div>
            <div className="column medium-6 medium-pull-6">
              <img src="/img/blob-2.jpg" alt="Middle school students" />
            </div>
          </div>
        </main>
        <div className="kid-grid"></div>
        <Faq />

      <Footer />
    </>
  )
}

export default SiteIndex
