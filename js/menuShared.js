// js/menuShared.js
const MENU_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbz9cPiTEWGhnLM-euQLMSek-TtVDsQzVzEQpH9-ni4vebaqPn0Z0SGEQI6UL0cJTH3F/exec";

/* =========================
   FETCH
========================= */
async function fetchMenu(menuName) {
  const res = await fetch(`${MENU_ENDPOINT}?menu=${menuName}`);
  if (!res.ok) throw new Error("Menu fetch failed");
  return res.json();
}

/* =========================
   LOADER
========================= */
function renderSkeletonLoader() {
  return `
    <div class="menu-loader">
      <img src="assets/loadingImage.png" alt="Loading menu" />
    </div>
  `;
}

/* =========================
   SLUGIFY
========================= */
function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

/* =========================
   CATEGORY
========================= */
function renderCategory(title, description) {
  const el = document.createElement("section");
  el.className = "menu-category";
  el.id = slugify(title);

  el.innerHTML = `
    <h2>${title}</h2>
    ${description ? `<p class="menu-category-description">${description}</p>` : ""}
  `;
  return el;
}

/* =========================
   ITEM
========================= */
function renderItem(item, isCatering = false) {
  const el = document.createElement("div");
  el.className = "menu-item";

  const hasImage = !!item.image;

  el.innerHTML = `
    <div class="menu-item-header">
      <span class="menu-item-name">
        ${item.itemName}
        ${hasImage ? `
          <span class="menu-item-icon" data-image="${item.image}" data-caption="${item.imageCaption || ""}">
            📷
          </span>` : ""}
      </span>

      <span class="menu-item-price">
        ${isCatering ? formatCateringPrice(item.price) : formatPrice(item.price)}
      </span>
    </div>

    ${item.description ? `<div class="menu-item-description">${item.description}</div>` : ""}

    ${isCatering && item.servings ? `
      <div class="menu-item-servings">
        ${formatCateringServings(item.servings)}
      </div>
    ` : ""}
  `;
  return el;
}

/* =========================
   RENDER MENU
========================= */
function renderMenu(menu, container, options = {}) {
  const isCatering = options.isCatering || false;

  Object.entries(menu).forEach(([category, data]) => {
    const cat = renderCategory(category, data.description);
    container.appendChild(cat);

    data.items.forEach(item => {
      cat.appendChild(renderItem(item, isCatering));
    });
  });
}

/* =========================
   ANCHOR NAV + ACTIVE HIGHLIGHT
========================= */
function buildMenuAnchors(menu) {
  const nav = document.getElementById("menuAnchorNav");
  if (!nav) return;

  nav.innerHTML = "";

  const links = [];

  Object.keys(menu).forEach(category => {
    const id = slugify(category);

    const link = document.createElement("a");
    link.href = "#"; // prevents <base> issues
    link.textContent = category;

    link.addEventListener("click", (e) => {
      e.preventDefault();

      const target = document.getElementById(id);
      if (!target) return;

      const navOffset = nav.offsetHeight || 0;
      const offsetPosition = target.getBoundingClientRect().top + window.pageYOffset - navOffset - 10;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });

      // include full path so refresh keeps you on the same page
      history.replaceState(null, "", `${window.location.pathname}#${id}`);
    });

    nav.appendChild(link);
    links.push({ id, link });
  });

  // Scroll-sync highlighting
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        const linkObj = links.find(l => l.id === entry.target.id);
        if (!linkObj) return;

        if (entry.isIntersecting) {
          links.forEach(l => l.link.classList.remove("active"));
          linkObj.link.classList.add("active");
        }
      });
    },
    {
      root: null,
      rootMargin: `-${nav.offsetHeight}px 0px 0px 0px`,
      threshold: 0.1
    }
  );

  Object.keys(menu).forEach(category => {
    const catEl = document.getElementById(slugify(category));
    if (catEl) observer.observe(catEl);
  });
}

/* =========================
   MODAL
========================= */
function initMenuModal(page) {
  const modal = document.createElement("div");
  modal.className = "menu-modal";

  modal.innerHTML = `
    <div class="menu-modal-overlay"></div>
    <div class="menu-modal-content">
      <img />
      <p></p>
    </div>
  `;

  document.body.appendChild(modal);

  const overlay = modal.querySelector(".menu-modal-overlay");
  const img = modal.querySelector("img");
  const caption = modal.querySelector("p");

  function open(src, cap) {
    img.src = src;
    caption.textContent = cap || "";
    modal.classList.add("active");
  }

  function close() {
    modal.classList.remove("active");
    img.src = "";
  }

  overlay.addEventListener("click", close);

  page.addEventListener("click", (e) => {
    const icon = e.target.closest(".menu-item-icon");
    if (!icon) return;

    open(icon.dataset.image, icon.dataset.caption);
  });
}

/* =========================
   PRICE FORMATTERS
========================= */
function formatPrice({ a, b, fixed }) {
  if (fixed) return fixed;
  if (a && b) return `${a} / ${b}`;
  return a || "";
}

function formatCateringPrice({ a, b, fixed }) {
  if (fixed) return fixed;
  if (a && b) return `${a} (Half) / ${b} (Full)`;
  return a || "";
}

function formatCateringServings({ a, b }) {
  if (a && b) return `Half serves ${a} · Full serves ${b}`;
  return "";
}

/* =========================
   MENU DETECTION
========================= */
function detectMenuName() {
  const h1 = document.querySelector(".menu-header h1");
  if (!h1) return null;

  const title = h1.textContent.trim();
  const mapping = {
    "Dinner Menu": "Dinner_Menu",
    "Lunch Menu": "Lunch_Menu",
    "Fast Bites": "Fast_Bites_Menu",
    "Catering Menu": "Catering_Menu"
  };

  return mapping[title] || null;
}

/* =========================
   AUTO INIT
========================= */
document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("menu");
  if (!container) return;

  const page = document.querySelector(".menu-page");
  const menuName = detectMenuName();

  if (!menuName) {
    container.innerHTML = "<p>Menu not recognized.</p>";
    return;
  }

  container.innerHTML = renderSkeletonLoader();

  try {
    const menu = await fetchMenu(menuName);

    container.innerHTML = "";
    renderMenu(menu, container);
    buildMenuAnchors(menu);
    initMenuModal(page);

    // If URL has a hash, scroll to that category
    const hash = window.location.hash.slice(1);
    if (hash) {
      const target = document.getElementById(hash);
      const nav = document.getElementById("menuAnchorNav");
      if (target && nav) {
        const offsetPosition = target.getBoundingClientRect().top + window.pageYOffset - nav.offsetHeight - 10;
        window.scrollTo({ top: offsetPosition });
      }
    }

  } catch (err) {
    console.error(err);
    container.innerHTML = "<p>Failed to load menu.</p>";
  }
});
