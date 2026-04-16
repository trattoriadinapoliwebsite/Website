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
   ANCHOR NAV + ACTIVE STATE (FINAL)
========================= */
function buildMenuAnchors(menu) {
  const nav = document.getElementById("menuAnchorNav");
  if (!nav) return;

  nav.innerHTML = "";

  // Create underline element
  const underline = document.createElement("div");
  underline.className = "menu-anchor-underline";
  nav.appendChild(underline);

  const links = [];

  /* =========================
     BUILD LINKS
  ========================= */
  Object.keys(menu).forEach((category) => {
    const id = slugify(category);

    const link = document.createElement("a");
    link.href = "#";
    link.textContent = category;
    link.dataset.target = id; // 🔑 stable mapping

    link.addEventListener("click", (e) => {
      e.preventDefault();

      const target = document.getElementById(id);
      if (!target) return;

      const headerOffset =
        document.querySelector("#header")?.offsetHeight || 0;

      const y =
        target.getBoundingClientRect().top +
        window.pageYOffset -
        headerOffset -
        10;

      window.scrollTo({ top: y, behavior: "smooth" });

      // ✅ preserve full path (fixes /Website/ bug)
      const basePath = window.location.pathname;
      history.replaceState(null, "", `${basePath}#${id}`);
    });

    nav.appendChild(link);
    links.push(link);
  });

  /* =========================
     UNDERLINE POSITIONING
  ========================= */
  function moveUnderline(el) {
    const rect = el.getBoundingClientRect();
    const navRect = nav.getBoundingClientRect();

    underline.style.width = `${rect.width}px`;
    underline.style.transform = `translateX(${rect.left - navRect.left}px)`;
  }

  function setActive(link) {
    if (!link) return;

    links.forEach((l) => l.classList.remove("active"));
    link.classList.add("active");
    moveUnderline(link);
  }

  /* =========================
     INTERSECTION OBSERVER
  ========================= */
  const observer = new IntersectionObserver(
    (entries) => {
      // pick the MOST visible section instead of first match
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible) return;

      const id = visible.target.id;
      const activeLink = links.find(
        (l) => l.dataset.target === id
      );

      if (activeLink) setActive(activeLink);
    },
    {
      rootMargin: "-30% 0px -60% 0px",
      threshold: [0, 0.25, 0.5, 0.75, 1],
    }
  );

  /* =========================
     OBSERVE SECTIONS
  ========================= */
  links.forEach((link) => {
    const section = document.getElementById(link.dataset.target);
    if (section) observer.observe(section);
  });

  /* =========================
     INITIAL STATE
  ========================= */

  function initFromHash() {
    const hash = window.location.hash.replace("#", "");
    const match = links.find((l) => l.dataset.target === hash);

    if (match) {
      setActive(match);

      // scroll to it correctly (with offset)
      const target = document.getElementById(hash);
      if (target) {
        const headerOffset =
          document.querySelector("#header")?.offsetHeight || 0;

        const y =
          target.getBoundingClientRect().top +
          window.pageYOffset -
          headerOffset -
          10;

        window.scrollTo({ top: y });
      }
    } else if (links[0]) {
      setActive(links[0]);
    }
  }

  // Wait for layout to settle before positioning underline
  requestAnimationFrame(() => {
    initFromHash();
  });

  /* =========================
     HANDLE RESIZE (underline stays aligned)
  ========================= */
  window.addEventListener("resize", () => {
    const active = nav.querySelector("a.active");
    if (active) moveUnderline(active);
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
   PHYSICS LOADER (rAF)
========================= */
function runLoaderPhysics(img) {
  let x = window.innerWidth * 0.05;
  let y = -200;

  let vx = 320;
  let vy = 0;

  let rotation = 0;

  const gravity = 2200;
  const bounce = 0.55;
  const friction = 0.985;

  const ground = window.innerHeight * 0.6;

  let lastTime = performance.now();
  let startTime = performance.now();

  // =========================
  // STATES
  // =========================
  let isRolling = true;
  let isBalancing = false;

  const ROLL_TIME = 1800;      // how long it rolls before physics takes over
  const MAX_TIME = 3200;       // when we force the fall
  const BALANCE_DURATION = 450;

  let balanceStart = 0;

  function frame(now) {
    const dt = (now - lastTime) / 1000;
    lastTime = now;

    const elapsed = now - startTime;

    // =========================
    // STATE TRANSITIONS
    // =========================

    // End rolling phase
    if (isRolling && elapsed > ROLL_TIME) {
      isRolling = false;
    }

    // Enter balance state
    if (
      !isRolling &&
      !isBalancing &&
      Math.abs(vx) < 30 &&
      elapsed > MAX_TIME - 700
    ) {
      isBalancing = true;
      balanceStart = now;
      vx = 0;
      vy = 0;
    }

    // =========================
    // BALANCE (TEETER)
    // =========================
    if (isBalancing) {
      const t = now - balanceStart;

      // subtle rocking
      const tilt = Math.sin(t * 0.02) * 8;
      rotation += tilt * 0.15;

      y = ground;

      if (t > BALANCE_DURATION) {
        // tip over → fall
        isBalancing = false;
        vy = 400;
        vx = 30;
      }
    }

    // =========================
    // PHYSICS (if not balancing)
    // =========================
    if (!isBalancing) {
      // gravity control
      if (!isRolling) {
        // stronger gravity near forced fall
        if (elapsed > MAX_TIME) {
          vy += gravity * dt * 1.6;
        } else {
          vy += gravity * dt;
        }
      }

      // motion
      x += vx * dt;
      y += vy * dt;
    }

    // =========================
    // GROUND COLLISION
    // =========================
    if (y >= ground) {
      y = ground;

      if (isRolling) {
        // smooth roll phase (no bounce)
        vy = 0;
        vx *= 0.995;
      } else if (!isBalancing) {
        // real bounce
        vy *= -bounce;
        vx *= friction;
      }
    }

    // =========================
    // ROTATION (velocity-based)
    // =========================
    const speed = Math.sqrt(vx * vx + vy * vy);
    rotation += speed * dt * 0.25;

    // =========================
    // APPLY TRANSFORM
    // =========================
    img.style.transform = `translate(${x}px, ${y}px) rotate(${rotation}deg)`;
    img.style.opacity = 1;

    // =========================
    // EXIT
    // =========================
    if (y < window.innerHeight + 200) {
      requestAnimationFrame(frame);
    } else {
      img.style.opacity = 0;
    }
  }

  requestAnimationFrame(frame);
}

/* =========================
   AUTO INIT
========================= */
document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("menu");
  const load = document.getElementById("loader");
  if (!container) return;

  const page = document.querySelector(".menu-page");
  
  const menuName = detectMenuName();

  if (!menuName) {
    container.innerHTML = "<p>Menu not recognized.</p>";
    return;
  }

  load.innerHTML = renderSkeletonLoader();
  
  const loaderImg = load.querySelector("img");
  runLoaderPhysics(loaderImg);

  try {
    const MIN_LOAD_TIME = 3500; // 3.5 seconds (tune 3000–4000)
    const startTime = performance.now();
  
    const menuPromise = fetchMenu(menuName);
  
    const [menu] = await Promise.all([
      menuPromise,
      new Promise(resolve => setTimeout(resolve, MIN_LOAD_TIME))
    ]);
  
    const elapsed = performance.now() - startTime;
  
    // (Optional safety: ensure we *at least* hit min time even if Promise.all resolves early)
    if (elapsed < MIN_LOAD_TIME) {
      await new Promise(res => setTimeout(res, MIN_LOAD_TIME - elapsed));
    }
  
    // Smooth fade-out of loader
    load.style.opacity = "0";
    load.style.transition = "opacity 0.4s ease";
  
    setTimeout(() => {
      container.innerHTML = "";
      container.style.opacity = "1";
  
      renderMenu(menu, container);
      buildMenuAnchors(menu);
      initMenuModal(page);
      page.classList.remove("is-loading");
    }, 400);
    // Scroll to hash if present
    const hash = window.location.hash.slice(1);
    if (hash) {
      const target = document.getElementById(hash);
      const nav = document.getElementById("menuAnchorNav");
      if (target && nav) {
        const offsetPosition = target.getBoundingClientRect().top + window.pageYOffset - nav.offsetHeight - 8;
        window.scrollTo({ top: offsetPosition });
      }
    }

  } catch (err) {
    console.error(err);
    container.innerHTML = "<p>Failed to load menu.</p>";
  }
});
