// hacky and bad DOM manipulator for img full-screen-toggle behavior within MD files

const handleClick = (e) => {
  const wrapper = document.createElement('div');
  function die() {
    document.body.removeEventListener('keyup', handleKeyPress);
    document.body.removeChild(wrapper);
  }
  function handleKeyPress(e) {
    if (e.key === 'Escape') {
      die()
    }
  }
  wrapper.className = 'full-screen-toggle-container';
  wrapper.appendChild(e.target.cloneNode());
  wrapper.addEventListener('click', die);
  document.body.addEventListener('keyup', handleKeyPress);
  document.body.appendChild(wrapper);
}

export const initFullScreenToggle = () => {
  const images = document.querySelectorAll('.full-screen-toggle');
  images.forEach(image => {
    image.removeEventListener('click', handleClick);
    image.addEventListener('click', handleClick);
  })
}
