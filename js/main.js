import { loadHeader } from './components/header.js';

function initContactToggle() {
  const btn = document.getElementById('contact-toggle');
  const form = document.getElementById('contact-form');

  if (!btn || !form) return;

  btn.addEventListener('click', () => {
    form.classList.toggle('active');
  });
}

document.addEventListener('DOMContentLoaded', () => {
  loadHeader();
  initContactToggle();
});
