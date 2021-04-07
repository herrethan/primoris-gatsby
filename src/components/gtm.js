/**
 * Google Tag Manager component that needs to be rendered within the <body> tag
 * Feeds off GTM container inside <head> tag, implemented in /seo.js
 */

import React from "react";

const GTM = () => {
  // Google Tag Manager (noscript)
  return (
    <noscript>
      <iframe 
        src="https://www.googletagmanager.com/ns.html?id=GTM-KTX4DC2"
        height={0}
        width={0}
        style={{ display: "none", visibility: "hidden" }}>
      </iframe>
    </noscript>
  );
  // End Google Tag Manager (noscript)
}


export default GTM;
