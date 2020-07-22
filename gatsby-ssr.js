import React from 'react'

export const onRenderBody = ({ setPostBodyComponents }) => {
  setPostBodyComponents([
    <script src="/js/redirect.js" /> // temp redirect
  ])
}