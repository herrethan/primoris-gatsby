---
name: contact
title: Contact
date: 2020-07-19T15:52:32.007Z
image: boys-looking.jpg
---

<div class="row">
  <div class="column medium-7">
    <h1>Learn more</h1>
    <form id="learn-more" class="contact-form" name="Learn more" method="POST" netlify-honeypot="legit" data-netlify="true">
      <input type="hidden" name="form-name" value="Learn more" />
      <div class="field text name required">
        <label>Student name<input name="student-name" required="" type="text" value="" /></label>
      </div>
      <div class="field">
        <h2>Parent or guardian info</h2>
        <div class="required">
          <label>First name<input name="parent-first-name" required="" type="text" value="" /></label>
        </div>
        <div class="required">
          <label>Last name<input name="parent-last-name" required="" type="text" value="" /></label>
        </div>
        <label>Cell phone<input name="phone" type="tel" value="" /></label>
        <div class="required">
          <label>Email address<input name="email" required="" type="email" value="" /></label>
        </div>
      </div>
      <div class="field required">
        <label class="select-arrow">Student grade 
          <select name="grade">
            <option value="pre-k">Pre-K</option>
            <option value="k">K</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
            <option value="6">6</option>
            <option value="7">7</option>
            <option value="8">8</option>
            <option value="9">9</option>
            <option value="10">10</option>
            <option value="11">11</option>
            <option value="12">12</option>
          </select>
        </label>
      </div>
      <div class="field">
        <h2>I am interested in:</h2>
        <div>
          <label>
            <input type="checkbox" id="apply" name="interest" value="apply">
            Applying for my child to attend
          </label>
        </div>
        <div>
          <label>
            <input type="checkbox" id="tour" name="interest" value="tour">
            Touring the school facility
          </label>
        </div>
        <div>
          <label>
            <input type="checkbox" id="shadow-days" name="interest" value="shadow-days">
            Having my child experience the school via 3 “Shadow Days”
          </label>
        </div>
        <div>
          <label>
            <input type="checkbox" id="summer-program" name="interest" value="summer-program">
            Receiving the summer program information
          </label>
        </div>
        <div>
          <label>
            <input type="checkbox" id="newsletters" name="interest" value="newsletters">
            Receiving Primoris activity newsletters
          </label>
        </div>
        <div>
          <label>
            <input type="checkbox" id="speak-with-parent" name="interest" value="speak-with-parent">
            Speaking with a parent of a current Primoris student
          </label>
        </div>
        <div data-show-when-checked="speak-with-parent" class="display-none">
          <label>
            <input type="radio" id="speak-with-parent-elementary" name="interest" value="speak-with-parent-elementary">
            Pre-K/Elementary
          </label>
          <label>
            <input type="radio" id="speak-with-parent-middle" name="interest" value="speak-with-parent-middle">
            Middle school
          </label>
          <label>
            <input type="radio" id="speak-with-parent-high" name="interest" value="speak-with-parent-high">
            High school
          </label>
        </div>
        <div>
          <label>
            <input type="checkbox" id="speak-with-admin" name="interest" value="speak-with-admin">
            Speaking with our curriculum designer
          </label>
        </div>
      </div>
      <p class="display-none">
        <label>Hey, are you too legit to quit? <input name="legit" /></label>
      </p>
      <input id="learn-more-submit" class="submit" type="submit" value="Submit">
    </form>
  </div>
  <div class="column medium-5">
    <h1>Visit Us</h1>
    Phone: (201) 722-1000<br />
    Fax: (201) 722-1001<br />
    120 Washington Ave<br />
    Westwood, NJ 07675<br><br><br>
    <div id="map" style="width:100%;height:350px;">
      <a href="https://www.google.com/maps/place/Primoris+Academy/@40.9926179,-74.0387749,17z/data=!3m1!4b1!4m5!3m4!1s0x89c2e57b91b82aa1:0xad394ae9fedb0ca8!8m2!3d40.9926179!4d-74.0365862?hl=en-US" target="_blank" title="Open in google maps">
        <img src="/img/map.jpg" alt="Primoris Academy in Westwood NJ">
      </a>
    </div>
  </div>
</div>
