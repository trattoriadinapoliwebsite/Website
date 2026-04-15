import { loadHeader } from './components/header.js';
import { loadFooter } from "./components/footer.js";

// =========================
// CONTACT FLIP (UI ONLY)
// =========================
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

// =========================
// CONTACT FORM (SUBMIT + UX)
// =========================
function initContactForm() {
  const form = document.getElementById('contact-form');
  const successState = document.getElementById('form-success');
  const successClose = document.getElementById('form-success-close');
  const card = document.getElementById('contact-card');

  if (!form) return;

  // =========================
  // WAVE LABEL SETUP
  // =========================
  const labels = form.querySelectorAll(".input-group label");
  
  labels.forEach(label => {
    const text = label.textContent;
    label.innerHTML = "";
  
    text.split("").forEach((letter, i) => {
      const span = document.createElement("span");
      span.textContent = letter;
      span.style.setProperty("--i", i);
      label.appendChild(span);
    });
  });

  const nameInput = form.querySelector('[name="name"]');
  const emailInput = form.querySelector('[name="email"]');
  const messageInput = form.querySelector('[name="message"]');
  const submitBtn = form.querySelector(".submit-btn");

  
  function showError(input, message) {
    input.classList.add("input-error");

    let error = input.parentElement.querySelector(".error-text");
    if (!error) {
      error = document.createElement("div");
      error.className = "error-text";
      input.parentElement.appendChild(error);
    }

    error.textContent = message;
  }

  function clearErrors() {
    form.querySelectorAll(".input-error").forEach(el => el.classList.remove("input-error"));
    form.querySelectorAll(".error-text").forEach(el => el.remove());
  }

  function validate() {
    clearErrors();
    let valid = true;

    if (!nameInput.value.trim()) {
      showError(nameInput, "Name is required");
      valid = false;
    }

    const emailVal = emailInput.value.trim();
    if (!emailVal) {
      showError(emailInput, "Email is required");
      valid = false;
    } else if (!/^\S+@\S+\.\S+$/.test(emailVal)) {
      showError(emailInput, "Enter a valid email");
      valid = false;
    }

    if (!messageInput.value.trim()) {
      showError(messageInput, "Message cannot be empty");
      valid = false;
    }

    return valid;
  }

  form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const formDataRaw = new FormData(form);

  // Honeypot
  if (formDataRaw.get('company')) return;

  if (!validate()) return;

  submitBtn.classList.add("loading");
  submitBtn.disabled = true;

  try {
    const formData = new FormData();
    formData.append("name", formDataRaw.get("name"));
    formData.append("email", formDataRaw.get("email"));
    formData.append("message", formDataRaw.get("message"));

    const res = await fetch("https://script.google.com/macros/s/AKfycbx7WxxYkfJ3z1zHBII5UYfCVX1bHL-iNaoRZ8xBp2BPVRU56YtYhmxGHYLBLlb9jAKiBQ/exec", {
      method: "POST",
      body: formData
    });

    const result = await res.json();

    if (result.status === "success") {
      form.classList.add("success");
      successState.classList.add("active");
    } else {
      throw new Error();
    }

    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    
      submitBtn.classList.remove("loading");
      submitBtn.disabled = false;
    }
  });

  successClose.addEventListener('click', () => {
    form.reset();
    clearErrors();
  
    form.classList.remove("success");
    successState.classList.remove("active");
  
    // ✅ RESET BUTTON STATE
    submitBtn.classList.remove("loading");
    submitBtn.disabled = false;
  
    card.classList.remove('flipped');
  });
}

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
  initContactFlip();
  initContactForm();
  initSpecialFeature();
  loadFooter();
});
