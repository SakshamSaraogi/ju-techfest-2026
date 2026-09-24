// =============================================================
// JU TECHFEST 2026 — CONTACT PAGE LOGIC
// Minimalist Editorial UI, Dynamic Vertical Directory & Phone Copy Actions
// =============================================================

import * as THREE from "three";
import gsap from "gsap";
import { vertexShader, bgFragmentShader } from "./shaders.js";
import { contactData } from "./contactData.js";

let bgRenderer, bgScene, bgCamera;

function init() {
  initBackgroundCanvas();
  initPreloader();
  initFullscreenMenu();
  renderMarquee();
  renderVerticals();
  renderVenueBlock();
  initCopyActions();
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
    const elapsedTime = clock.getElapsedTime();
    mouse.x += (targetMouse.x - mouse.x) * 0.08;
    mouse.y += (targetMouse.y - mouse.y) * 0.08;

    bgMaterial.uniforms.uTime.value = elapsedTime;
    bgMaterial.uniforms.uMouse.value.copy(mouse);
    bgRenderer.render(bgScene, bgCamera);
  }

  animateBg();
}

// =============================================================
// 2. SPIDER FILL REAL PRELOADER
// =============================================================
function initPreloader() {
  const preloader = document.getElementById("preloader");
  const spiderFill = document.getElementById("spider-fill");
  const counter = document.getElementById("preloader-counter");
  const spiderContainer = document.getElementById("spider-container");
  const textWrapper = document.getElementById("preloader-text-wrapper");

  if (!preloader) return;

  let displayProgress = 0;
  let isPageLoaded = (document.readyState === "complete");
  let hasFinished = false;

  window.addEventListener("load", () => {
    isPageLoaded = true;
  });

  const progressInterval = setInterval(() => {
    const target = isPageLoaded ? 100 : 88;
    displayProgress += (target - displayProgress) * 0.12;

    const rounded = Math.min(100, Math.round(displayProgress));
    if (counter) counter.textContent = `${rounded}%`;
    if (spiderFill) spiderFill.style.clipPath = `inset(${100 - rounded}% 0 0 0)`;

    if (isPageLoaded && displayProgress >= 98.5 && !hasFinished) {
      hasFinished = true;
      clearInterval(progressInterval);

      if (counter) counter.textContent = "100%";
      if (spiderFill) spiderFill.style.clipPath = "inset(0% 0 0 0)";

      finishPreloader();
    }
  }, 1000 / 60);

  setTimeout(() => {
    if (!hasFinished) {
      isPageLoaded = true;
    }
  }, 3200);

  function finishPreloader() {
    try {
      if (bgRenderer && bgScene && bgCamera) {
        bgRenderer.compile(bgScene, bgCamera);
      }
    } catch (_) {}

    const tl = gsap.timeline({
      delay: 0.1,
      onComplete: () => {
        if (preloader) {
          preloader.style.display = "none";
          preloader.style.pointerEvents = "none";
        }
        animatePageEntrance();
      },
    });

    tl.to([spiderContainer, textWrapper], {
      y: -28,
      opacity: 0,
      duration: 0.45,
      ease: "power2.in",
    }).to(
      preloader,
      {
        yPercent: -100,
        duration: 0.75,
        ease: "power4.inOut",
      },
      "-=0.15"
    );
  }
}

// =============================================================
// 3. FULLSCREEN WEARECASEY NAVIGATION MENU
// =============================================================
function initFullscreenMenu() {
  const menuBtn = document.getElementById("menu-btn");
  const fullscreenMenu = document.getElementById("fullscreen-menu");
  const hamburgerIcon = document.getElementById("hamburger-icon");
  if (!menuBtn || !fullscreenMenu) return;

  let isMenuOpen = false;

  const menuItems = fullscreenMenu.querySelectorAll(".menu-item");
  const menuBg = fullscreenMenu.querySelector(".menu-bg");

  gsap.set(fullscreenMenu, { autoAlpha: 0 });
  gsap.set(menuBg, { scaleY: 0, transformOrigin: "top center" });
  gsap.set(menuItems, { y: 40, opacity: 0 });

  function openMenu() {
    isMenuOpen = true;
    fullscreenMenu.setAttribute("aria-hidden", "false");
    hamburgerIcon.classList.add("active");
    document.body.style.overflow = "hidden";

    gsap.killTweensOf([fullscreenMenu, menuBg, menuItems]);

    gsap.set(fullscreenMenu, { autoAlpha: 1 });
    gsap.to(menuBg, {
      scaleY: 1,
      duration: 0.65,
      ease: "power4.inOut",
    });

    gsap.to(menuItems, {
      y: 0,
      opacity: 1,
      duration: 0.5,
      stagger: 0.05,
      ease: "power3.out",
      delay: 0.25,
    });
  }

  function closeMenu() {
    isMenuOpen = false;
    fullscreenMenu.setAttribute("aria-hidden", "true");
    hamburgerIcon.classList.remove("active");
    document.body.style.overflow = "";

    gsap.killTweensOf([fullscreenMenu, menuBg, menuItems]);

    gsap.to(menuItems, {
      y: -25,
      opacity: 0,
      duration: 0.3,
      stagger: 0.03,
      ease: "power3.in",
    });

    gsap.to(menuBg, {
      scaleY: 0,
      duration: 0.55,
      ease: "power4.inOut",
      delay: 0.15,
      onComplete: () => {
        gsap.set(fullscreenMenu, { autoAlpha: 0 });
      },
    });
  }

  menuBtn.addEventListener("click", () => {
    if (isMenuOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isMenuOpen) {
      closeMenu();
    }
  });
}

// =============================================================
// 4. RENDER MARQUEE TICKER
// =============================================================
function renderMarquee() {
  const container = document.getElementById("contact-marquee-track");
  if (!container) return;

  const textChunk = `
    <span class="marquee-chunk">
      <span>REACH OUT TO INNOVERSE</span>
      <span class="marquee-dot">•</span>
      <span>TECHNICAL</span>
      <span class="marquee-dot">•</span>
      <span>CULTURAL</span>
      <span class="marquee-dot">•</span>
      <span>SPORTS</span>
      <span class="marquee-dot">•</span>
      <span>MEDIA</span>
      <span class="marquee-dot">•</span>
      <span>SPONSORSHIP</span>
      <span class="marquee-dot">•</span>
      <span>PUBLIC RELATIONS</span>
      <span class="marquee-dot">•</span>
      <span>JU TECHFEST 2026</span>
      <span class="marquee-dot">•</span>
    </span>
  `;

  // Repeat 4 times for continuous scrolling loop
  container.innerHTML = textChunk.repeat(4);
}

// =============================================================
// 5. RENDER VERTICALS DIRECTORY
// =============================================================
function renderVerticals() {
  const container = document.getElementById("verticals-grid");
  if (!container) return;

  container.innerHTML = contactData.verticals
    .map(
      (dept) => `
      <article class="vertical-card" data-dept="${dept.id}">
        <div class="vertical-card-top-bar"></div>
        <div class="vertical-card-header">
          <div class="vertical-card-meta">
            <span class="vertical-num">// ${dept.num}</span>
            <span class="vertical-badge">COORDINATION</span>
          </div>
          <h3 class="vertical-title">${dept.vertical}</h3>
          <p class="vertical-desc">${dept.description}</p>
        </div>
        <div class="vertical-contacts-list">
          ${dept.contacts
            .map(
              (c) => `
            <div class="contact-person-item">
              <div class="contact-person-info">
                <span class="contact-person-name">${c.name}</span>
                <span class="contact-person-role">${c.role}</span>
              </div>
              <div class="contact-actions-wrap">
                <a href="tel:${c.tel}" class="contact-phone-btn" title="Call ${c.name}">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                  <span>${c.phone}</span>
                </a>
                <button 
                  type="button" 
                  class="copy-phone-btn" 
                  data-copy="${c.phone}" 
                  title="Copy phone number" 
                  aria-label="Copy phone number for ${c.name}"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                  <span class="copy-tooltip">COPIED!</span>
                </button>
              </div>
            </div>
          `
            )
            .join("")}
        </div>
      </article>
    `
    )
    .join("");
}

// =============================================================
// 6. RENDER CAMPUS VENUE / HEADQUARTERS BLOCK
// =============================================================
function renderVenueBlock() {
  const container = document.getElementById("contact-venue-block");
  if (!container) return;

  const v = contactData.venue;

  container.innerHTML = `
    <div class="venue-card">
      <div class="venue-left">
        <span class="venue-tag">// ${v.title}</span>
        <h3 class="venue-name">${v.name}</h3>
        <p class="venue-address">${v.address}</p>
      </div>
      <div class="venue-right">
        <a href="${v.mapsUrl}" target="_blank" rel="noopener noreferrer" class="venue-action-btn venue-action-btn--primary">
          <span>VIEW ON MAPS</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
            <line x1="7" y1="17" x2="17" y2="7"></line>
            <polyline points="7 7 17 7 17 17"></polyline>
          </svg>
        </a>
        <a href="mailto:${v.email}" class="venue-action-btn venue-action-btn--secondary">
          <span>EMAIL SUPPORT</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
            <polyline points="22,6 12,13 2,6"></polyline>
          </svg>
        </a>
      </div>
    </div>
  `;
}

// =============================================================
// 7. COPY-TO-CLIPBOARD ACTIONS
// =============================================================
function initCopyActions() {
  document.addEventListener("click", (e) => {
    const copyBtn = e.target.closest(".copy-phone-btn");
    if (!copyBtn) return;

    const textToCopy = copyBtn.dataset.copy;
    if (!textToCopy) return;

    navigator.clipboard.writeText(textToCopy).then(() => {
      copyBtn.classList.add("copied");
      setTimeout(() => {
        copyBtn.classList.remove("copied");
      }, 1800);
    }).catch(() => {
      // Fallback
      const input = document.createElement("input");
      input.value = textToCopy;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      copyBtn.classList.add("copied");
      setTimeout(() => {
        copyBtn.classList.remove("copied");
      }, 1800);
    });
  });
}

// =============================================================
// 8. INITIAL PAGE ENTRANCE ANIMATION
// =============================================================
function animatePageEntrance() {
  const tl = gsap.timeline();

  tl.fromTo(
    ".contact-header-section > *",
    { opacity: 0, y: 24 },
    {
      opacity: 1,
      y: 0,
      duration: 0.6,
      stagger: 0.08,
      ease: "power2.out",
    }
  );

  tl.fromTo(
    ".contact-marquee-section",
    { opacity: 0, scaleY: 0.8 },
    {
      opacity: 1,
      scaleY: 1,
      duration: 0.5,
      ease: "power2.out",
    },
    "-=0.3"
  );

  tl.fromTo(
    "#verticals-grid .vertical-card",
    { opacity: 0, y: 30 },
    {
      opacity: 1,
      y: 0,
      duration: 0.55,
      stagger: 0.06,
      ease: "power2.out",
    },
    "-=0.2"
  );

  tl.fromTo(
    "#contact-venue-block",
    { opacity: 0, y: 20 },
    {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: "power2.out",
    },
    "-=0.2"
  );
}
