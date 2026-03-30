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

function initSpecialFeature() {
  const section = document.querySelector(".special-feature");
  const img = document.querySelector(".special-image");

  if (!section || !img) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  let currentRotation = 0;
  let currentScale = 0.92;

  let targetRotation = 0;
  let targetScale = 1;

  const ease = 0.08;

  const observer = new IntersectionObserver(
    ([entry]) => {
      section.classList.toggle("is-active", entry.isIntersecting);
    },
    { threshold: 0.2 }
  );

  observer.observe(section);

  function animate() {
    const rect = section.getBoundingClientRect();
    const vh = window.innerHeight;

    // progress through viewport
    let progress = 1 - rect.top / vh;
    progress = Math.max(0, Math.min(1, progress));

    // rotation: full spin across scroll
    targetRotation = progress * 360;

    // subtle scale-in
    targetScale = 0.92 + (progress * 0.08);

    // smooth interpolation
    currentRotation += (targetRotation - currentRotation) * ease;
    currentScale += (targetScale - currentScale) * ease;

    img.style.transform = `
      scale(${currentScale})
      rotate(${currentRotation}deg)
    `;

    requestAnimationFrame(animate);
  }

  animate();
}

document.addEventListener('DOMContentLoaded', () => {
  loadHeader();
  initContactFlip();
  initSpecialFeature();
});
