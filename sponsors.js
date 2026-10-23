// =============================================================
// JU TECHFEST 2026 — SPONSORS & PARTNERS PAGE LOGIC
// Minimalist Editorial UI, Dynamic Category Filtering & GSAP Entrance
// =============================================================

import * as THREE from "three";
import gsap from "gsap";
import { vertexShader, bgFragmentShader } from "./shaders.js";
import { sponsorsData, sponsorFilters } from "./sponsorsData.js";

let bgRenderer, bgScene, bgCamera;
let currentFilter = "all";

function init() {
  initBackgroundCanvas();
  initPreloader();
  initFullscreenMenu();
  renderMarquee();
  renderFilterTabs();
  renderSponsorsGrid("all");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

// =============================================================
// 1. THREE.JS ABSTRACT CRIMSON STREAMLINES BACKGROUND (#bg-canvas)
// =============================================================
function initBackgroundCanvas() {
  const bgCanvas = document.getElementById("bg-canvas");
  if (!bgCanvas) return;

  const isMobile = window.innerWidth <= 768;
  const targetDpr = isMobile ? Math.min(window.devicePixelRatio, 1.25) : Math.min(window.devicePixelRatio, 2);

  bgRenderer = new THREE.WebGLRenderer({
    canvas: bgCanvas,
    antialias: !isMobile,
    powerPreference: "high-performance",
  });
  bgRenderer.setSize(window.innerWidth, window.innerHeight);
  bgRenderer.setPixelRatio(targetDpr);

  bgScene = new THREE.Scene();
  bgCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const mouse = new THREE.Vector2(0.5, 0.5);
  const targetMouse = new THREE.Vector2(0.5, 0.5);

  const bgMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      uTime: { value: 0 },
      uMouse: { value: mouse },
      uInvertProgress: { value: 0 },
      uWhiteLinesProgress: { value: 0 },
    },
    vertexShader,
    fragmentShader: bgFragmentShader,
  });

  const quadGeom = new THREE.PlaneGeometry(2, 2);
  const bgMesh = new THREE.Mesh(quadGeom, bgMaterial);
  bgScene.add(bgMesh);

  if (!isMobile) {
    window.addEventListener("pointermove", (e) => {
      targetMouse.x = e.clientX / window.innerWidth;
      targetMouse.y = 1.0 - e.clientY / window.innerHeight;
    }, { passive: true });
  }

  window.addEventListener("resize", () => {
    bgRenderer.setSize(window.innerWidth, window.innerHeight);
    bgMaterial.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
  }, { passive: true });

  const clock = new THREE.Clock();
  function animateBg() {
    requestAnimationFrame(animateBg);
    const delta = clock.getDelta();
    bgMaterial.uniforms.uTime.value += delta * 0.45;
    mouse.lerp(targetMouse, 0.05);
    bgMaterial.uniforms.uMouse.value.copy(mouse);
    bgRenderer.render(bgScene, bgCamera);
  }
  animateBg();
}

// =============================================================
// 2. CENTRAL ASSET PRELOADER (SPIDER FILL & REVEAL)
// =============================================================
function initPreloader() {
  const preloader = document.getElementById("preloader");
  const spiderFill = document.getElementById("spider-fill");
  const counter = document.getElementById("preloader-counter");

  if (!preloader || !spiderFill || !counter) return;

  document.documentElement.classList.add("is-loading");
  document.body.classList.add("is-loading");

  let progress = 0;
  const targetImages = sponsorsData.map(s => s.image);
  let loadedCount = 0;

  targetImages.forEach(src => {
    const img = new Image();
    img.onload = () => { loadedCount++; };
    img.onerror = () => { loadedCount++; };
    img.src = src;
  });

  const interval = setInterval(() => {
    const rawProgress = targetImages.length > 0 ? (loadedCount / targetImages.length) * 100 : 100;
    progress = Math.min(100, Math.max(progress + 4, Math.floor(rawProgress)));

    spiderFill.style.height = `${progress}%`;
    counter.textContent = `${progress}%`;

    if (progress >= 100) {
      clearInterval(interval);
      setTimeout(() => {
        document.documentElement.classList.remove("is-loading");
        document.body.classList.remove("is-loading");

        gsap.to(preloader, {
          opacity: 0,
          duration: 0.6,
          ease: "power2.inOut",
          onComplete: () => {
            preloader.style.display = "none";
            animateEntrance();
          },
        });
      }, 300);
    }
  }, 25);
}

// =============================================================
// 3. FULLSCREEN NAVIGATION MENU LOGIC
// =============================================================
function initFullscreenMenu() {
  const menuBtn = document.getElementById("menu-btn");
  const fullscreenMenu = document.getElementById("fullscreen-menu");
  if (!menuBtn || !fullscreenMenu) return;

  let isMenuOpen = false;

  function toggleMenu() {
    isMenuOpen = !isMenuOpen;
    menuBtn.classList.toggle("active", isMenuOpen);
    fullscreenMenu.classList.toggle("active", isMenuOpen);
    fullscreenMenu.setAttribute("aria-hidden", (!isMenuOpen).toString());
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
  }

  menuBtn.addEventListener("click", toggleMenu);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isMenuOpen) {
      toggleMenu();
    }
  });

  const menuLinks = fullscreenMenu.querySelectorAll(".menu-item");
  menuLinks.forEach(link => {
    link.addEventListener("click", () => {
      if (isMenuOpen) toggleMenu();
    });
  });
}

// =============================================================
// 4. CONTINUOUS SPONSORS LOGO MARQUEE
// =============================================================
function renderMarquee() {
  const marqueeTrack = document.getElementById("sponsors-marquee-track");
  if (!marqueeTrack) return;

  function getMarqueeScaleClass(ar) {
    if (ar > 5) return "marquee-wide";
    if (ar < 1.6) return "marquee-tall";
    return "";
  }

  const itemsHtml = sponsorsData.map(sponsor => `
    <div class="marquee-item">
      <div class="marquee-logo-wrap">
        <img src="${sponsor.image}" alt="${sponsor.name}" class="${getMarqueeScaleClass(sponsor.aspectRatio)}" loading="lazy" />
      </div>
      <span class="marquee-name">${sponsor.name}</span>
      <span class="marquee-divider"></span>
    </div>
  `).join("");

  // Duplicate for seamless infinite loop
  marqueeTrack.innerHTML = `
    <div class="marquee-group">${itemsHtml}</div>
    <div class="marquee-group" aria-hidden="true">${itemsHtml}</div>
  `;
}

// =============================================================
// 5. FILTER TABS (CRISP GEOMETRIC NAVIGATION)
// =============================================================
function renderFilterTabs() {
  const navContainer = document.getElementById("sponsors-filters-nav");
  if (!navContainer) return;

  navContainer.innerHTML = sponsorFilters.map(filter => `
    <button class="filter-tab ${filter.key === currentFilter ? "active" : ""}" data-filter="${filter.key}" type="button">
      <span>${filter.label}</span>
      <span class="tab-count">${getFilterCount(filter.key)}</span>
    </button>
  `).join("");

  navContainer.querySelectorAll(".filter-tab").forEach(btn => {
    btn.addEventListener("click", () => {
      const filterKey = btn.getAttribute("data-filter");
      if (filterKey === currentFilter) return;

      currentFilter = filterKey;
      navContainer.querySelectorAll(".filter-tab").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      renderSponsorsGrid(filterKey);
    });
  });
}

function getFilterCount(key) {
  if (key === "all") return sponsorsData.length;
  return sponsorsData.filter(s => s.category === key).length;
}

// =============================================================
// 6. SPONSORS GRID RENDERING & UNIFORM SCALING
// =============================================================
function getOpticalScaleClass(ar, id) {
  if (id === "max-protein") return "scale-compact";
  if (ar > 5) return "scale-wide-text"; // Leafy Bus
  if (ar < 1.6) return "scale-square-tall"; // Denver
  if (ar > 3.2) return "scale-standard-wide"; // Oppo, Krafton, SpinBot, Jio Saavan
  return "scale-medium"; // GB Nodes, HopUp, Jaipur RC Club, Plum, WScube
}

function renderSponsorsGrid(filter = "all") {
  const grid = document.getElementById("sponsors-grid");
  if (!grid) return;

  const filteredList = filter === "all"
    ? sponsorsData
    : sponsorsData.filter(s => s.category === filter);

  if (filteredList.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; color: rgba(255,255,255,0.4); font-family: 'DM Mono', monospace;">
        NO PARTNERS FOUND FOR THIS VERTICAL
      </div>
    `;
    return;
  }

  grid.innerHTML = filteredList.map((sponsor, index) => {
    const scaleClass = getOpticalScaleClass(sponsor.aspectRatio, sponsor.id);
    const indexStr = (index + 1).toString().padStart(2, "0");

    return `
      <article class="sponsor-card" data-id="${sponsor.id}">
        <div class="sponsor-stage">
          <img
            src="${sponsor.image}"
            alt="${sponsor.name} Official Logo"
            class="sponsor-logo-img ${scaleClass}"
            loading="lazy"
            style="max-width: ${sponsor.scaleStyle.maxWidth}; max-height: ${sponsor.scaleStyle.maxHeight};"
          />
        </div>
        <div class="sponsor-details">
          <div class="sponsor-badge-row">
            <span class="sponsor-partner-badge">${sponsor.partnerTitle}</span>
            <span class="sponsor-index-num">// ${indexStr}</span>
          </div>
          <h3 class="sponsor-name">${sponsor.name}</h3>
          <p class="sponsor-desc">${sponsor.description}</p>
        </div>
      </article>
    `;
  }).join("");

  gsap.fromTo(
    grid.querySelectorAll(".sponsor-card"),
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.45, stagger: 0.05, ease: "power2.out" }
  );
}

// =============================================================
// 7. INITIAL PAGE ENTRANCE ANIMATION
// =============================================================
function animateEntrance() {
  const tl = gsap.timeline();
  tl.from(".sponsors-meta-tag", { opacity: 0, y: -15, duration: 0.5, ease: "power2.out" })
    .from(".sponsors-main-heading", { opacity: 0, y: 25, duration: 0.7, ease: "power3.out" }, "-=0.3")
    .from(".sponsors-subtext-bar", { opacity: 0, y: 15, duration: 0.5, ease: "power2.out" }, "-=0.4")
    .from(".sponsors-marquee-section", { opacity: 0, duration: 0.6, ease: "power1.out" }, "-=0.3")
    .from(".sponsors-controls-bar", { opacity: 0, y: 15, duration: 0.5, ease: "power2.out" }, "-=0.3")
    .from(".sponsor-card", { opacity: 0, y: 25, duration: 0.5, stagger: 0.04, ease: "power2.out" }, "-=0.3")
    .from(".sponsors-cta-banner", { opacity: 0, y: 20, duration: 0.6, ease: "power2.out" }, "-=0.2");
}
