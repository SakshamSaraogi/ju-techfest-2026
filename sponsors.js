// =============================================================
// JU TECHFEST 2026 — SPONSORS PAGE LOGIC
// Minimalist Editorial Grid: Logos + Names Only, Full WeAreCasey Menu, GSAP Entrance
// =============================================================

import * as THREE from "three";
import gsap from "gsap";
import { vertexShader, bgFragmentShader } from "./shaders.js";
import { sponsorsData } from "./sponsorsData.js";

let bgRenderer, bgScene, bgCamera;

function init() {
  initBackgroundCanvas();
  initPreloader();
  initFullscreenMenu();
  renderMarquee();
  renderSponsorsGrid();
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
// 3. FULLSCREEN WEARECASEY NAVIGATION MENU (IDENTICAL TO TEAM & HOME)
// =============================================================
function initFullscreenMenu() {
  const fullscreenMenu = document.getElementById("fullscreen-menu");
  const menuBg = document.querySelector(".menu-bg");
  const menuItems = document.querySelectorAll(".fullscreen-menu .menu-item");
  const menuBtn = document.getElementById("menu-btn") || document.querySelector(".menu");

  if (!fullscreenMenu || !menuBtn) return;

  // Split each menu item into letter-boxes and initial GSAP hidden states
  const menuAnimItems = [...menuItems].map((item) => {
    const indexEl = item.querySelector(".item-index");
    const labelEl = item.querySelector(".item-label");
    const dividerEl = item.querySelector(".item-divider");

    const indexText = (indexEl ? indexEl.textContent : "").trim();
    const labelText = (labelEl ? labelEl.textContent : "").trim();

    if (indexEl) {
      indexEl.innerHTML = `<span class="item-index-inner" style="display:inline-block; overflow:hidden;"><span class="index-word" style="display:inline-block;">${indexText}</span></span>`;
    }
    const indexWord = indexEl ? indexEl.querySelector(".index-word") : null;

    const firstCharStr = labelText.charAt(0);
    const trailingCharsStr = labelText.slice(1);

    const firstCharBox = document.createElement("span");
    firstCharBox.className = "item-first-char-box";
    firstCharBox.innerHTML = `<span class="item-first-char" style="display:inline-block;">${firstCharStr}</span>`;

    const trailingCharBox = document.createElement("span");
    trailingCharBox.className = "item-body";

    const trailingChars = [];
    for (let c of trailingCharsStr) {
      const charSpan = document.createElement("span");
      charSpan.className = "item-char-box";
      charSpan.innerHTML = `<span class="item-char" style="display:inline-block;">${c === " " ? "&nbsp;" : c}</span>`;
      trailingCharBox.appendChild(charSpan);
      trailingChars.push(charSpan.querySelector(".item-char"));
    }

    if (labelEl) {
      labelEl.innerHTML = "";
      labelEl.appendChild(firstCharBox);
      labelEl.appendChild(trailingCharBox);
    }

    const firstChar = firstCharBox.querySelector(".item-first-char");

    // Hide characters off-screen initially
    gsap.set([indexWord, firstChar], { yPercent: 100 });
    gsap.set(trailingChars, { xPercent: 125 });
    gsap.set(trailingCharBox, { width: 0 });
    if (dividerEl) gsap.set(dividerEl, { scaleY: 0 });

    return { indexWord, firstChar, trailingChars, trailingCharBox, divider: dividerEl, item };
  });

  const menuTimeline = gsap.timeline({
    paused: true,
    defaults: { ease: "power3.out" },
    onReverseComplete: () => {
      fullscreenMenu.classList.remove("is-menu-open");
      fullscreenMenu.setAttribute("aria-hidden", "true");
    },
  });

  let isMenuOpen = false;

  if (menuBg) {
    menuTimeline.to(menuBg, { opacity: 1, duration: 0.5 }, 0);
  }

  menuAnimItems.forEach(({ indexWord, firstChar, trailingChars, trailingCharBox, divider }, i) => {
    const startTime = 0.25 + i * 0.08;

    if (indexWord && firstChar) {
      menuTimeline.to([indexWord, firstChar], { yPercent: 0, duration: 0.5 }, startTime);
    }
    if (divider) {
      menuTimeline.to(divider, { scaleY: 1, duration: 0.6, ease: "power3.out" }, startTime + 0.04);
    }
    if (trailingCharBox) {
      menuTimeline.to(
        trailingCharBox,
        {
          width: () => trailingCharBox.scrollWidth,
          duration: 0.6,
          ease: "power4.inOut",
        },
        startTime + 0.1
      );
    }
    if (trailingChars.length > 0) {
      menuTimeline.to(
        trailingChars,
        { xPercent: 0, duration: 0.5, stagger: 0.02 },
        startTime + 0.2
      );
    }
  });

  const toggleMenu = () => {
    isMenuOpen = !isMenuOpen;

    if (isMenuOpen) {
      fullscreenMenu.classList.add("is-menu-open");
      fullscreenMenu.setAttribute("aria-hidden", "false");
      menuBtn.classList.add("menu-active");
      menuTimeline.timeScale(1).play();
    } else {
      menuBtn.classList.remove("menu-active");
      menuTimeline.timeScale(1.5).reverse();
    }
  };

  menuBtn.addEventListener("click", toggleMenu);
  menuBtn.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleMenu();
    }
  });

  menuItems.forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");
      if (
        (href === "/sponsors" || href === "/sponsors/" || href === "/sponsors.html") &&
        (window.location.pathname === "/sponsors" || window.location.pathname === "/sponsors/" || window.location.pathname.endsWith("sponsors.html"))
      ) {
        e.preventDefault();
        if (isMenuOpen) toggleMenu();
      }
    });
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isMenuOpen) {
      toggleMenu();
    }
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

  marqueeTrack.innerHTML = `
    <div class="marquee-group">${itemsHtml}</div>
    <div class="marquee-group" aria-hidden="true">${itemsHtml}</div>
  `;
}

// =============================================================
// 5. UNIFORM SPONSORS GRID RENDERING (IMAGES & NAMES ONLY)
// =============================================================
function getOpticalScaleClass(ar, id) {
  if (id === "max-protein") return "scale-compact";
  if (ar > 5) return "scale-wide-text"; // Leafy Bus
  if (ar < 1.6) return "scale-square-tall"; // Denver
  if (ar > 3.2) return "scale-standard-wide"; // Oppo, Krafton, SpinBot, Jio Saavan
  return "scale-medium"; // GB Nodes, HopUp, Jaipur RC Club, Plum, WScube
}

function renderSponsorsGrid() {
  const grid = document.getElementById("sponsors-grid");
  if (!grid) return;

  grid.innerHTML = sponsorsData.map((sponsor) => {
    const scaleClass = getOpticalScaleClass(sponsor.aspectRatio, sponsor.id);

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
          <h3 class="sponsor-name">${sponsor.name}</h3>
        </div>
      </article>
    `;
  }).join("");

  gsap.fromTo(
    grid.querySelectorAll(".sponsor-card"),
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.45, stagger: 0.04, ease: "power2.out" }
  );
}

// =============================================================
// 6. INITIAL PAGE ENTRANCE ANIMATION
// =============================================================
function animateEntrance() {
  const tl = gsap.timeline();
  tl.from(".sponsors-meta-tag", { opacity: 0, y: -15, duration: 0.5, ease: "power2.out" })
    .from(".sponsors-main-heading", { opacity: 0, y: 25, duration: 0.7, ease: "power3.out" }, "-=0.3")
    .from(".sponsors-subtext-bar", { opacity: 0, y: 15, duration: 0.5, ease: "power2.out" }, "-=0.4")
    .from(".sponsors-marquee-section", { opacity: 0, duration: 0.6, ease: "power1.out" }, "-=0.3")
    .from(".sponsor-card", { opacity: 0, y: 25, duration: 0.5, stagger: 0.04, ease: "power2.out" }, "-=0.3")
    .from(".sponsors-cta-banner", { opacity: 0, y: 20, duration: 0.6, ease: "power2.out" }, "-=0.2");
}
