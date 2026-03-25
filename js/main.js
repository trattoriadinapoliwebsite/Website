import { loadHeader } from './components/header.js';

function initContactFlip() {
  const card = document.getElementById('contact-card');
  const openBtn = document.getElementById('contact-toggle');
  const closeBtn = document.getElementById('contact-close');

  if (!card || !openBtn) return;

  openBtn.addEventListener('click', () => {
    card.classList.add('flipped');
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      card.classList.remove('flipped');
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadHeader();
  initContactFlip();
});
