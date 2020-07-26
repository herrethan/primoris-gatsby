---
name: contact
title: Contact
date: 2020-07-19T15:52:32.007Z
image: boys-looking.jpg
---

<div class="row">
  <div class="column medium-6">
    <h1>Contact Us</h1>
    Phone: (201) 722-1000<br />
    Fax: (201) 722-1001
    <form class="contact-form" name="Contact us" method="POST" netlify-honeypot="legit" data-netlify="true">
      <input type="hidden" name="form-name" value="Contact us" />
      <div class="field text name required">
        <label>Full name<input name="name" required="" type="text" value="" /></label>
      </div>
      <div class="field email required">
        <label>Email address<input name="email" required="" type="email" value="" /></label>
      </div>
      <div class="field tel">
        <label>Phone<input name="phone" type="tel" value="" /></label>
      </div>
      <div class="field text subject">
        <label>Subject<input name="subject" type="text" value="" /></label>
      </div>
      <div class="field textarea message required">
        <label>Message<textarea name="message" required="" rows="10"></textarea></label>
      </div>
      <p class="display-none">
        <label>Hey bots, fill this out: <input name="legit" /></label>
      </p>
      <input class="submit" type="submit" value="Submit">
    </form>
  </div>
  <div class="column medium-6">
    <h1>Visit Us</h1>
    120 Washington Ave<br>
    Westwood, NJ 07675<br><br><br>
    <div id="map" style="width:100%;height:350px;">
      <a href="https://www.google.com/maps/place/Primoris+Academy/@40.9926179,-74.0387749,17z/data=!3m1!4b1!4m5!3m4!1s0x89c2e57b91b82aa1:0xad394ae9fedb0ca8!8m2!3d40.9926179!4d-74.0365862?hl=en-US" target="_blank">
        <img src="img/map.jpg" alt="Primoris Academy in Westwood NJ">
      </a>
    </div>
  </div>
</div>
