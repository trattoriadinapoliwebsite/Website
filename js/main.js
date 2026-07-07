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
// HOMEPAGE POPUP
// =========================
function initPopup() {
  const popup = document.getElementById("event-popup");
  if (!popup) return;

  const img = popup.querySelector("img");
  const closeBtn = document.getElementById("popup-close");

  // =========================
  // HARD EXIT CONDITIONS
  // =========================

  // No image element at all → remove popup entirely
  if (!img) {
    popup.remove();
    return;
  }

  // Image exists but has no valid src → remove popup
  if (!img.getAttribute("src") || img.getAttribute("src").trim() === "") {
    popup.remove();
    return;
  }

  // =========================
  // WAIT FOR IMAGE VALIDATION
  // =========================

  img.onload = () => {
    // Only show AFTER image successfully loads
    popup.style.display = "flex";
  };

  img.onerror = () => {
    // Broken image → remove popup
    popup.remove();
  };

  // =========================
  // CLOSE HANDLER
  // =========================

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      popup.style.display = "none";
    });
  }
}
// =========================
// INIT
// =========================
document.addEventListener('DOMContentLoaded', () => {
  loadHeader();
  initSpecialFeature();
  initPopup();
  loadFooter();
});
