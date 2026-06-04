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

    const res = await fetch("https://script.google.com/macros/s/AKfycbzq5FRdHlvWWVrhy6G3DQ05rwY3sgUVu1q0djrHE_OLcSb7LXMxZs31uTxQyvVYpbJW2w/exec", {
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

const REVIEW_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbxWYMuE027isj1JIcuRqa-Pp_xoJNr8hlYBOOg9Ois0jLQ_LogYfEJaKaC7JM-7y3O3_w/exec";

async function fetchReviews() {
  const res = await fetch(REVIEW_ENDPOINT);

  if (!res.ok) {
    throw new Error("Review fetch failed");
  }

  return res.json();
}

function renderStars(rating) {
  let html = "";

  for (let i = 1; i <= 5; i++) {
    const value = rating - (i - 1);

    if (value >= 1) {
      html += `<span class="star full">★</span>`;
    }
    else if (value > 0) {
      html += `
        <span class="star partial">
          ★
          <span
            class="fill"
            style="width:${value * 100}%"
          >
            ★
          </span>
        </span>
      `;
    }
    else {
      html += `<span class="star empty">★</span>`;
    }
  }

  return html;
}

function renderReviews(reviews) {
  const track = document.getElementById("reviews-track");

  if (!track) return;

  track.innerHTML = "";

  reviews.forEach(review => {
    const card = document.createElement("div");
    card.className = "review-card";

    card.innerHTML = `
      <div class="review-stars">
        ${renderStars(review.rating)}
      </div>

      <p class="review-text">
        "${review.review}"
      </p>

      <div class="review-meta">
        <span>${review.name}</span>
        <span>${review.when}</span>
      </div>
    `;

    track.appendChild(card);
  });

  initReviewCarousel(track);
}

function initReviewCarousel(track) {
  const cards = track.querySelectorAll(".review-card");

  if (cards.length <= 1) return;

  const prevBtn = document.getElementById("review-prev");
  const nextBtn = document.getElementById("review-next");

  let current = 0;

  const cardWidth =
    cards[0].offsetWidth +
    parseInt(getComputedStyle(track).gap);

  function goTo(index) {
    current = index;

    if (current < 0) {
      current = cards.length - 1;
    }

    if (current >= cards.length) {
      current = 0;
    }

    track.scrollTo({
      left: cardWidth * current,
      behavior: "smooth"
    });
  }

  nextBtn?.addEventListener("click", () => {
    goTo(current + 1);
  });

  prevBtn?.addEventListener("click", () => {
    goTo(current - 1);
  });

  setInterval(() => {
    goTo(current + 1);
  }, 5000);
}

async function initReviews() {
  const track = document.getElementById("reviews-track");

  if (!track) return;

  try {
    const data = await fetchReviews();

    renderReviews(data.reviews || []);
  } catch (err) {
    console.error("Reviews failed to load", err);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadHeader();
  initContactFlip();
  initContactForm();
  initReviews();
  loadFooter();
});
