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

function initspecialrotate() {
      const section = document.currentScript.closest(".special-feature");
      const img = section.querySelector(".special-image");
      if (!img) return;

      /* Respect reduced motion */
      if (
        window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        return;
      }

      let targetRotation = 0;
      let currentRotation = 0;
      let lastTouchY = null;
      let isVisible = false;

      const ease = 0.08;
      const MAX_STEP = 22; /* slightly more rotation */

      /* Visibility + fade-in */
      if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver(
          ([entry]) => {
            isVisible = entry.isIntersecting;
            section.classList.toggle("is-active", isVisible);
          },
          { rootMargin: "150px 0px", threshold: 0 }
        );
        observer.observe(section);
      } else {
        isVisible = true;
        section.classList.add("is-active");
      }

      /* Desktop input */
      window.addEventListener(
        "wheel",
        (e) => {
          if (!isVisible) return;
          const delta = Math.max(
            -MAX_STEP,
            Math.min(MAX_STEP, e.deltaY)
          );
          targetRotation += delta * 0.4;
        },
        { passive: true }
      );

      /* Mobile input */
      window.addEventListener(
        "touchmove",
        (e) => {
          if (!isVisible || e.touches.length !== 1) return;
          const y = e.touches[0].clientY;

          if (lastTouchY !== null) {
            const delta = lastTouchY - y;
            const clamped = Math.max(
              -MAX_STEP,
              Math.min(MAX_STEP, delta)
            );
            targetRotation += clamped * 1.0;
          }

          lastTouchY = y;
        },
        { passive: true }
      );

      window.addEventListener("touchend", () => {
        lastTouchY = null;
      });

      /* Render loop */
      function animate() {
        if (isVisible) {
          currentRotation +=
            (targetRotation - currentRotation) * ease;
          img.style.transform = `rotate(${currentRotation}deg)`;
        }
        requestAnimationFrame(animate);
      }

      animate();
    }

document.addEventListener('DOMContentLoaded', () => {
  loadHeader();
  initContactFlip();
  initspecialrotate();
});
