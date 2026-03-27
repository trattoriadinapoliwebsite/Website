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

function initSpecialRotate() {
  const section = document.querySelector(".special-feature");
  if (!section) return;

  const img = section.querySelector(".special-image");
  if (!img) return;

  let currentRotation = 0;
  let targetRotation = 0;

  function update() {
    const rect = section.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    // progress through viewport (0 → 1)
    const progress = 1 - (rect.top / windowHeight);

    // clamp
    const clamped = Math.max(0, Math.min(1.5, progress));

    // map to rotation range
    targetRotation = clamped * 180; // adjust intensity here

    // smooth interpolation
    currentRotation += (targetRotation - currentRotation) * 0.08;

    img.style.transform = `rotate(${currentRotation}deg)`;

    requestAnimationFrame(update);
  }

  update();
}

document.addEventListener('DOMContentLoaded', () => {
  loadHeader();
  initContactFlip();
  initSpecialRotate();
});
