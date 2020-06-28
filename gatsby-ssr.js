import React from 'react'

export const onRenderBody = ({ setPostBodyComponents }) => {
  setPostBodyComponents([
    <script src="/js/page.js" />,
    <script src="/js/slideshow.js" />,
    <script src="/js/redirect.js" /> // temp redirect
  ])
}