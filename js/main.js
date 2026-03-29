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
  const wrap = document.querySelector(".special-image-wrap");
  const img = document.querySelector(".special-image");

  if (!section || !wrap || !img) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  let current = {
    rotation: 0,
    scale: 0.92,
    y: 0,
    shimmer: 0
  };

  let target = {
    rotation: 0,
    scale: 1,
    y: 0,
    shimmer: 0
  };

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

    // ROTATION (full spin across section)
    target.rotation = progress * 360;

    // SCALE (ease in slightly)
    target.scale = 0.92 + progress * 0.08;

    // PARALLAX (image moves slower than scroll)
    target.y = (progress - 0.5) * 60;

    // SHIMMER INTENSITY (only mid-scroll)
    target.shimmer = Math.sin(progress * Math.PI);

    // LERP everything
    current.rotation += (target.rotation - current.rotation) * ease;
    current.scale += (target.scale - current.scale) * ease;
    current.y += (target.y - current.y) * ease;
    current.shimmer += (target.shimmer - current.shimmer) * ease;

    // APPLY TRANSFORMS
    img.style.transform = `
      translateY(${current.y * 0.3}px)
      scale(${current.scale})
      rotate(${current.rotation}deg)
    `;

    wrap.style.transform = `translateY(${current.y}px)`;

    // SHIMMER EFFECT
    wrap.style.setProperty(
      "--shimmer-opacity",
      current.shimmer * 0.25
    );

    wrap.style.setProperty(
      "--shimmer-shift",
      `${current.y * 0.5}px`
    );

    wrap.style.setProperty(
      "--shimmer-scale",
      1 + current.shimmer * 0.02
    );

    wrap.style.setProperty(
      "--shimmer-opacity",
      current.shimmer * 0.25
    );

    wrap.style.setProperty(
      "--shimmer-translate",
      `${Math.sin(current.rotation * 0.05) * 10}px`
    );

    wrap.style.setProperty(
      "--shimmer-blur",
      `${current.shimmer * 6}px`
    );

    wrap.style.setProperty(
      "--shimmer-opacity",
      current.shimmer * 0.2
    );

    wrap.style.setProperty(
      "--shimmer-y",
      `${current.y * 0.5}px`
    );

    // apply to pseudo element via style injection
    wrap.style.setProperty(
      "--shimmer-final-opacity",
      current.shimmer * 0.2
    );

    wrap.style.setProperty(
      "--shimmer-transform",
      `translateY(${current.y * 0.5}px) scale(${1 + current.shimmer * 0.03})`
    );

    // manually apply to ::after via CSS variable
    wrap.style.setProperty(
      "--shimmer-opacity",
      current.shimmer * 0.2
    );

    wrap.style.setProperty(
      "--shimmer-transform",
      `translateY(${current.y * 0.5}px)`
    );

    wrap.style.setProperty(
      "--shimmer-scale",
      1 + current.shimmer * 0.03
    );

    wrap.style.setProperty(
      "--shimmer-blur",
      `${current.shimmer * 4}px`
    );

    wrap.style.setProperty(
      "--shimmer-opacity",
      current.shimmer * 0.18
    );

    // apply via inline style to pseudo (final)
    wrap.style.setProperty(
      "--after-opacity",
      current.shimmer * 0.18
    );

    requestAnimationFrame(animate);
  }

  animate();
}

document.addEventListener('DOMContentLoaded', () => {
  loadHeader();
  initContactFlip();
  initSpecialRotate();
});
