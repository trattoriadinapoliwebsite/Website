import { loadHeader } from './components/header.js';
import { loadFooter } from "./components/footer.js";


// =========================
// SPECIAL FEATURE ANIMATION
// =========================
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

    let progress = 1 - rect.top / vh;
    progress = Math.max(0, Math.min(1, progress));

    targetRotation = progress * 360;
    targetScale = 0.92 + (progress * 0.08);

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

// =========================
// INIT
// =========================
document.addEventListener('DOMContentLoaded', () => {
  loadHeader();
  initSpecialFeature();
  loadFooter();
});
