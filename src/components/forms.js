// hacky and bad DOM manipulator for form enhancing in MD content

const handleChange = (e) => {
  const el = document.querySelector(`[data-show-when-checked="${e.target.id}"]`)
  if (el) {
    if (e.target.checked) {
      el.className = '';
    } else {
      el.className = 'display-none';
    }
  }
}

export const initForms = () => {
  const conditionalInputs = document.querySelectorAll('[data-show-when-checked]');
  conditionalInputs.forEach(el => {
    const input = document.querySelector(`#${el.getAttribute('data-show-when-checked')}`);
    input.removeEventListener('change', handleChange);
    input.addEventListener('change', handleChange);
  });
}
