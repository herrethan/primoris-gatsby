import React from 'react'

export const onRenderBody = ({ setPostBodyComponents }) => {
  setPostBodyComponents([
    // <script src="http://hacky-johns.js" /> // 3rd party libraries go here
  ])
}