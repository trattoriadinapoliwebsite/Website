const GAS_URL = "https://script.google.com/macros/s/AKfycbxxrg_jX3ElYktnIxU_cUgYEBTw2o-wTSmI471aFe1hIwpoTCGPuvRVXIAf4YvV4t60/exec";
const IMAGE_BASE_PATH = "gallery/images/";

let images = [];
let currentIndex = 0;
let scrollLock = false;

const heroImage = document.getElementById("hero-image");
const heroCaption = document.getElementById("hero-caption");
const thumbWheel = document.getElementById("thumb-wheel");

const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");

// =========================
// FETCH
// =========================
async function fetchGallery() {
  const res = await fetch(GAS_URL);
  const data = await res.json();

  images = data.map(item => ({
    image: IMAGE_BASE_PATH + item.Image.trim(),
    caption: item.Caption || "",
    alt: item.Alt || ""
  }));

  init();
}

// =========================
// INIT
// =========================
function init() {
  renderWheel();
  showImage(0);
  bindControls();
}

// =========================
// SHOW IMAGE
// =========================
function showImage(index) {
  currentIndex = (index + images.length) % images.length;

  heroImage.classList.remove("active");
  heroCaption.classList.remove("show");

  setTimeout(() => {
    const img = images[currentIndex];

    heroImage.src = img.image;
    heroImage.alt = img.alt;
    heroCaption.textContent = img.caption;

    heroImage.classList.add("active");
    heroCaption.classList.add("show");

    updateWheel();
    preload();

  }, 100);
}

// =========================
// THUMB WHEEL (9 visible)
// =========================
function renderWheel() {
  thumbWheel.innerHTML = "";

  for (let i = -4; i <= 4; i++) {
    const idx = (currentIndex + i + images.length) % images.length;
    const div = document.createElement("div");

    div.className = "thumb";
    div.dataset.offset = i;

    div.innerHTML = `<img src="${images[idx].image}" loading="lazy">`;

    div.addEventListener("click", () => {
      showImage(idx);
    });

    thumbWheel.appendChild(div);
  }
}

function updateWheel() {
  const thumbs = thumbWheel.children;

  for (let i = 0; i < thumbs.length; i++) {
    const offset = i - 4;
    const idx = (currentIndex + offset + images.length) % images.length;

    const thumb = thumbs[i];
    thumb.classList.toggle("active", offset === 0);

    thumb.querySelector("img").src = images[idx].image;
  }
}

// =========================
// PRELOAD
// =========================
function preload() {
  const next = (currentIndex + 1) % images.length;
  new Image().src = images[next].image;
}

// =========================
// CONTROLS
// =========================
function bindControls() {

  // ARROWS
  nextBtn.onclick = () => next();
  prevBtn.onclick = () => prev();

  // SCROLL (ONLY INSIDE HERO)
  document.getElementById("gallery-hero")
    .addEventListener("wheel", (e) => {
      e.preventDefault();

      if (scrollLock) return;
      scrollLock = true;

      e.deltaY > 0 ? next() : prev();

      setTimeout(() => scrollLock = false, 300);
    }, { passive: false });

  // SWIPE
  let startX = 0;

  heroImage.addEventListener("touchstart", e => {
    startX = e.touches[0].clientX;
  });

  heroImage.addEventListener("touchend", e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) < 50) return;

    diff > 0 ? next() : prev();
  });
}

// =========================
// NAV
// =========================
function next() {
  showImage(currentIndex + 1);
}

function prev() {
  showImage(currentIndex - 1);
}

// =========================
// START
// =========================
fetchGallery();
