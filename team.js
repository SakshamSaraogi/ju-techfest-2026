// =============================================================
// JU TECHFEST 2026 — TEAM PAGE LOGIC
// Minimalist Editorial UI, Dynamic Department Filtering & GSAP Entrance
// =============================================================

import * as THREE from "three";
import gsap from "gsap";
import { vertexShader, bgFragmentShader } from "./shaders.js";
import { secretariesData, coreTeamData, departmentFilters } from "./teamData.js";

let bgRenderer, bgScene, bgCamera;
let currentFilter = "all";

function init() {
  initBackgroundCanvas();
  initPreloader();
  initFullscreenMenu();
  renderSecretaries();
  renderFilterTabs();
  renderCoreTeam("all");
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
  const fullscreenMenu = document.getElementById("fullscreen-menu");
  const menuBg = document.querySelector(".menu-bg");
  const menuItems = document.querySelectorAll(".fullscreen-menu .menu-item");
  const menuBtn = document.getElementById("menu-btn") || document.querySelector(".menu");

  if (!fullscreenMenu || !menuBtn) return;

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
        (href === "/team" || href === "/team/" || href === "/team.html") &&
        (window.location.pathname === "/team" || window.location.pathname === "/team/" || window.location.pathname.endsWith("team.html"))
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
// 4. RENDER EXECUTIVE SECRETARIES
// =============================================================
function renderSecretaries() {
  const container = document.getElementById("secretaries-grid");
  if (!container) return;

  container.innerHTML = secretariesData
    .map((member) => `
      <article class="team-card team-card--secretary" data-id="${member.id}">
        <div class="team-card-image-wrap">
          <img 
            src="${member.image}" 
            alt="${member.name}" 
            class="team-card-img" 
            loading="lazy" 
            onerror="this.src='/fallback_avatar.png'"
          />
          <div class="team-card-vignette"></div>
          <span class="team-card-tag">${member.tag}</span>
          <span class="team-card-index">// ${member.index}</span>
        </div>
        <div class="team-card-details">
          <h3 class="team-card-name">${member.name}</h3>
          <p class="team-card-role">${member.role}</p>
        </div>
        <div class="team-card-accent-bar"></div>
      </article>
    `)
    .join("");
}

// =============================================================
// 5. RENDER DEPARTMENT FILTER TABS (GEOMETRIC RECTANGLES, NO PILLS)
// =============================================================
function renderFilterTabs() {
  const container = document.getElementById("team-filters-nav");
  if (!container) return;

  container.innerHTML = departmentFilters
    .map(
      (f) => `
      <button 
        type="button" 
        class="filter-btn ${f.key === currentFilter ? "active" : ""}" 
        data-filter="${f.key}"
        aria-pressed="${f.key === currentFilter}"
      >
        <span>${f.label}</span>
        <span class="filter-count">[ ${f.count} ]</span>
      </button>
    `
    )
    .join("");

  const buttons = container.querySelectorAll(".filter-btn");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const filterKey = btn.dataset.filter;
      if (filterKey === currentFilter) return;

      currentFilter = filterKey;
      buttons.forEach((b) => {
        const isActive = b.dataset.filter === currentFilter;
        b.classList.toggle("active", isActive);
        b.setAttribute("aria-pressed", isActive ? "true" : "false");
      });

      renderCoreTeam(currentFilter, true);
    });
  });
}

// =============================================================
// 6. RENDER CORE TEAM WITH SMOOTH GSAP TRANSITIONS
// =============================================================
function renderCoreTeam(filter = "all", animate = false) {
  const container = document.getElementById("core-team-grid");
  if (!container) return;

  const filtered = filter === "all"
    ? coreTeamData
    : coreTeamData.filter((member) => member.department === filter || member.secondaryDept === filter);

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="team-empty-state">
        <h4 class="empty-title">NO MEMBERS FOUND</h4>
        <p class="empty-subtext">No coordinators registered under this vertical category.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered
    .map(
      (member, i) => `
      <article class="team-card team-card--core" data-id="${member.id}" data-dept="${member.department}">
        <div class="team-card-image-wrap">
          <img 
            src="${member.image}" 
            alt="${member.name}" 
            class="team-card-img" 
            loading="lazy" 
            onerror="this.src='/fallback_avatar.png'"
          />
          <div class="team-card-vignette"></div>
          <span class="team-card-tag">${member.deptLabel}</span>
          <span class="team-card-index">// ${(i + 1).toString().padStart(2, "0")}</span>
        </div>
        <div class="team-card-details">
          <h3 class="team-card-name">${member.name}</h3>
          <p class="team-card-role">${member.role}</p>
        </div>
        <div class="team-card-accent-bar"></div>
      </article>
    `
    )
    .join("");

  if (animate) {
    gsap.fromTo(
      container.querySelectorAll(".team-card"),
      { opacity: 0, y: 18 },
      {
        opacity: 1,
        y: 0,
        duration: 0.35,
        stagger: 0.03,
        ease: "power2.out",
      }
    );
  }
}

// =============================================================
// 7. INITIAL PAGE ENTRANCE ANIMATION
// =============================================================
function animatePageEntrance() {
  const tl = gsap.timeline();

  tl.fromTo(
    ".team-header-section > *",
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
    "#secretaries-grid .team-card",
    { opacity: 0, y: 30 },
    {
      opacity: 1,
      y: 0,
      duration: 0.55,
      stagger: 0.06,
      ease: "power2.out",
    },
    "-=0.3"
  );

  tl.fromTo(
    "#core-team-grid .team-card",
    { opacity: 0, y: 24 },
    {
      opacity: 1,
      y: 0,
      duration: 0.45,
      stagger: 0.03,
      ease: "power2.out",
    },
    "-=0.2"
  );
}
