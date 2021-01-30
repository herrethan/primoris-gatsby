// hacky and bad DOM manipulator for img full-screen-toggle behavior within MD files
const handleClick = (e) => {
  const wrapper = document.createElement('div');
  wrapper.className = 'full-screen-toggle-container';
  wrapper.appendChild(e.target.cloneNode());
  wrapper.addEventListener('click', () => document.body.removeChild(wrapper));
  document.body.appendChild(wrapper);
}

export const initFullScreenToggle = () => {
  const images = document.querySelectorAll('.full-screen-toggle');
  images.forEach(image => {
    image.removeEventListener('click', handleClick);
    image.addEventListener('click', handleClick);
  })
}
