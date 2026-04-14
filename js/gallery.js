const GAS_URL = "https://script.google.com/macros/s/AKfycbxxrg_jX3ElYktnIxU_cUgYEBTw2o-wTSmI471aFe1hIwpoTCGPuvRVXIAf4YvV4t60/exec";
const IMAGE_BASE_PATH = "gallery/images/";

let images = [];
let currentIndex = 0;
let preloaded = {};

const heroImage = document.getElementById("hero-image");
const heroCaption = document.getElementById("hero-caption");
const thumbsContainer = document.getElementById("gallery-thumbs");

// =========================
// FETCH FROM GAS
// =========================
async function fetchGallery() {
  try {
    const res = await fetch(GAS_URL);
    const data = await res.json();

    images = data
      .map(item => {
        if (!item.Image) {
          console.warn("Missing image field:", item);
          return null;
        }
    
        return {
          image: IMAGE_BASE_PATH + item.Image.trim(),
          caption: item.Caption || "",
          alt: item.Alt || ""
        };
      })
      .filter(Boolean);

    initGallery();

  } catch (err) {
    console.error("Gallery load failed", err);
  }
}

// =========================
// INIT
// =========================
function initGallery() {
  renderThumbs();
  showImage(0);
  initScrollZone();
  initSwipe();
}

// =========================
// RENDER THUMBS (LAZY)
// =========================
function renderThumbs() {
  thumbsContainer.innerHTML = "";

  images.forEach((img, index) => {
    const thumb = document.createElement("div");
    thumb.className = "thumb";

    thumb.innerHTML = `
      <img loading="lazy" src="${img.image}" alt="${img.alt}">
    `;

    thumb.addEventListener("click", () => showImage(index));

    thumbsContainer.appendChild(thumb);
  });
}

// =========================
// SHOW IMAGE
// =========================
function showImage(index) {
  currentIndex = index;

  heroImage.classList.remove("active");
  heroCaption.classList.remove("show");

  setTimeout(() => {
    const img = images[index];

    heroImage.src = img.image;
    heroImage.alt = img.alt || "";
    heroCaption.textContent = img.caption || "";

    heroImage.classList.add("active");
    heroCaption.classList.add("show");

    updateThumbs();
    preloadAdjacent();

  }, 100);
}

// =========================
// PRELOAD (NEXT/PREV)
// =========================
function preloadAdjacent() {
  const next = (currentIndex + 1) % images.length;
  const prev = (currentIndex - 1 + images.length) % images.length;

  [next, prev].forEach(i => {
    const src = images[i].image;

    if (!preloaded[src]) {
      const img = new Image();
      img.src = src;
      preloaded[src] = true;
    }
  });
}

// =========================
// UPDATE THUMBS
// =========================
function updateThumbs() {
  const thumbs = document.querySelectorAll(".thumb");

  thumbs.forEach((t, i) => {
    t.classList.toggle("active", i === currentIndex);
  });

  thumbs[currentIndex].scrollIntoView({
    behavior: "smooth",
    inline: "center"
  });
}

// =========================
// SCROLL CONTROL (HOVER ONLY)
// =========================
let scrollLock = false;
let isHoveringHero = false;

function initScrollZone() {
  const heroContainer = document.querySelector(".gallery-hero");

  // Track hover state
  heroContainer.addEventListener("mouseenter", () => {
    isHoveringHero = true;
  });

  heroContainer.addEventListener("mouseleave", () => {
    isHoveringHero = false;
  });

  // Attach scroll ONLY to hero container
  heroContainer.addEventListener("wheel", handleScroll, { passive: false });
}

function handleScroll(e) {
  // HARD stop propagation first
  e.stopPropagation();

  // Only act if inside hero
  if (!isHoveringHero) return;

  e.preventDefault();

  if (scrollLock) return;
  scrollLock = true;

  if (e.deltaY > 0) nextImage();
  else prevImage();

  setTimeout(() => (scrollLock = false), 400);
}

function nextImage() {
  showImage((currentIndex + 1) % images.length);
}

function prevImage() {
  showImage((currentIndex - 1 + images.length) % images.length);
}
// =========================
// SWIPE SUPPORT (MOBILE)
// =========================
function initSwipe() {
  let startX = 0;
  let endX = 0;

  const threshold = 50;

  heroImage.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
  });

  heroImage.addEventListener("touchend", (e) => {
    endX = e.changedTouches[0].clientX;
    handleSwipe();
  });

  function handleSwipe() {
    const diff = startX - endX;

    if (Math.abs(diff) < threshold) return;

    if (diff > 0) nextImage();
    else prevImage();
  }
}

// =========================
// START
// =========================
fetchGallery();
