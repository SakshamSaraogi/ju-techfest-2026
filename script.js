import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import {
  vertexShader,
  bgFragmentShader,
  fluidFragmentShader,
  displayFragmentShader,
} from "./shaders.js";

gsap.registerPlugin(ScrollTrigger);

function init() {
  // -------------------------------------------------------------
  // 0. CENTRAL ASSET LOADING MANAGER & REAL PRELOADER
  // -------------------------------------------------------------
  const preloader = document.getElementById("preloader");
  const spiderFill = document.getElementById("spider-fill");
  const counter = document.getElementById("preloader-counter");
  const spiderContainer = document.getElementById("spider-container");
  const textWrapper = document.getElementById("preloader-text-wrapper");

  // Lock scrolling while preloading
  document.documentElement.classList.add("is-loading");
  document.body.classList.add("is-loading");

  const loadingManager = new THREE.LoadingManager();
  let itemsTotalTracked = 0;
  let realLoadProgress = 0;
  let isAssetsComplete = false;
  let hasPreloaderFinished = false;

  // Track fonts
  loadingManager.itemStart("fonts");
  if (document.fonts) {
    document.fonts.ready
      .then(() => loadingManager.itemEnd("fonts"))
      .catch(() => loadingManager.itemEnd("fonts"));
  } else {
    loadingManager.itemEnd("fonts");
  }

  // Track essential static images
  const essentialImages = ["/spider-icon.png", "/left.png", "/right.png", "/falling.png"];
  essentialImages.forEach((src) => {
    loadingManager.itemStart(src);
    const img = new Image();
    img.onload = () => loadingManager.itemEnd(src);
    img.onerror = () => loadingManager.itemEnd(src);
    img.src = src;
  });

  loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
    itemsTotalTracked = Math.max(itemsTotal, itemsTotalTracked);
    if (itemsTotalTracked > 0) {
      realLoadProgress = Math.min(100, Math.round((itemsLoaded / itemsTotalTracked) * 100));
    }
  };

  loadingManager.onLoad = () => {
    isAssetsComplete = true;
    realLoadProgress = 100;
  };

  // Smooth visual progress loop
  let displayProgress = 0;
  let minProgress = 0;

  gsap.to({ val: 0 }, {
    val: 20,
    duration: 0.7,
    ease: "power1.out",
    onUpdate: function () {
      minProgress = this.targets()[0].val;
    },
  });

  const progressInterval = setInterval(() => {
    const target = isAssetsComplete ? 100 : Math.max(minProgress, realLoadProgress);
    displayProgress += (target - displayProgress) * 0.12;

    const rounded = Math.min(100, Math.round(displayProgress));
    if (counter) counter.textContent = `${rounded}%`;
    if (spiderFill) spiderFill.style.clipPath = `inset(${100 - rounded}% 0 0 0)`;

    if (isAssetsComplete && displayProgress >= 99.2 && !hasPreloaderFinished) {
      hasPreloaderFinished = true;
      clearInterval(progressInterval);

      if (counter) counter.textContent = "100%";
      if (spiderFill) spiderFill.style.clipPath = "inset(0% 0 0 0)";

      finishPreloader();
    }
  }, 1000 / 60);

  // Safety fallback: if any image hangs or network drops, force complete after 12s
  setTimeout(() => {
    if (!hasPreloaderFinished) {
      isAssetsComplete = true;
      realLoadProgress = 100;
    }
  }, 12000);

  function finishPreloader() {
    // 1. Initial WebGL Warmup: compile all scenes on GPU behind preloader
    try {
      if (bgRenderer && bgScene && bgCamera) bgRenderer.compile(bgScene, bgCamera);
      if (heroRenderer && heroScene && heroCamera) heroRenderer.compile(heroScene, heroCamera);
      if (carouselRenderer && carouselScene && carouselCamera) carouselRenderer.compile(carouselScene, carouselCamera);
      if (domainsRenderer && domainsScene && domainsCamera) domainsRenderer.compile(domainsScene, domainsCamera);
      if (glimpsesRenderer && glimpsesScene && glimpsesCamera) glimpsesRenderer.compile(glimpsesScene, glimpsesCamera);
    } catch (_) {}

    ScrollTrigger.refresh();

    // 2. Animate out the preloader curtain
    const tl = gsap.timeline({
      delay: 0.15,
      onComplete: () => {
        if (preloader) preloader.style.display = "none";
        document.documentElement.classList.remove("is-loading");
        document.body.classList.remove("is-loading");
        lenis.start();
        ScrollTrigger.refresh();
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
        duration: 0.85,
        ease: "power4.inOut",
      },
      "-=0.08"
    );
  }

  // -------------------------------------------------------------
  // DEVICE & PERFORMANCE PROFILING
  // -------------------------------------------------------------
  const isTouchDevice = () =>
    window.innerWidth < 900 ||
    ("ontouchstart" in window && window.innerWidth < 1024) ||
    (navigator.maxTouchPoints && navigator.maxTouchPoints > 0 && window.innerWidth < 1024);

  const isMobile = isTouchDevice();

  const getOptimalDpr = () =>
    isTouchDevice()
      ? Math.min(window.devicePixelRatio || 1, 1.25)
      : Math.min(window.devicePixelRatio || 1, 1.75);

  // -------------------------------------------------------------
  // 1. LENIS SMOOTH SCROLL & GSAP SCROLLTRIGGER SETUP
  // -------------------------------------------------------------
  const lenis = new Lenis({
    lerp: 0.08,
    smoothWheel: true,
    syncTouch: false,
  });
  window.lenis = lenis;
  lenis.stop(); // Locked while preloader is active

  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(500, 33);

  // -------------------------------------------------------------
  // 2. BACKGROUND WEBGL RENDERER SETUP (#bg-canvas)
  // -------------------------------------------------------------
  const bgCanvas = document.getElementById("bg-canvas");
  const bgRenderer = new THREE.WebGLRenderer({
    canvas: bgCanvas,
    antialias: !isMobile,
    powerPreference: "high-performance",
  });
  bgRenderer.setSize(window.innerWidth, window.innerHeight);
  bgRenderer.setPixelRatio(getOptimalDpr());

  const bgScene = new THREE.Scene();
  const bgCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const sharedMouse = new THREE.Vector2(0.5, 0.5);

  const bgMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      uTime: { value: 0 },
      uMouse: { value: sharedMouse },
      uInvertProgress: { value: 0 },
      uWhiteLinesProgress: { value: 0 },
    },
    vertexShader,
    fragmentShader: bgFragmentShader,
  });

  const quadGeom = new THREE.PlaneGeometry(2, 2);
  const bgMesh = new THREE.Mesh(quadGeom, bgMaterial);
  bgScene.add(bgMesh);

  // -------------------------------------------------------------
  // 3. 3D CURVED HELICAL CAROUSEL (EXACT TRIONN 21-FRAME MOTION)
  // -------------------------------------------------------------
  const carouselCanvas = document.getElementById("carousel-canvas");
  const carouselRenderer = new THREE.WebGLRenderer({
    canvas: carouselCanvas,
    antialias: !isMobile,
    alpha: true,
    powerPreference: "high-performance",
  });
  carouselRenderer.setSize(window.innerWidth, window.innerHeight);
  carouselRenderer.setPixelRatio(getOptimalDpr());

  const carouselScene = new THREE.Scene();
  const carouselCamera = new THREE.PerspectiveCamera(
    42,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  carouselCamera.position.set(0, 0, 13.5);

  // Physically curved rectangular plane geometry matching the cylinder radius
  function createCurvedPlaneGeometry(width, height, curveRadius, segments = 32) {
    const geom = new THREE.PlaneGeometry(width, height, segments, 1);
    const pos = geom.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const angle = x / curveRadius;
      pos.setX(i, Math.sin(angle) * curveRadius);
      pos.setZ(i, (Math.cos(angle) - 1.0) * curveRadius);
    }
    geom.computeVertexNormals();
    return geom;
  }

  const cardWidth = 3.35;
  const cardHeight = 2.10;
  const cardCurvatureRadius = 7.8; // Natural cylinder curvature hugging the 3D helical loop
  const curvedCardGeom = createCurvedPlaneGeometry(
    cardWidth,
    cardHeight,
    cardCurvatureRadius,
    32
  );

  const textureLoader = new THREE.TextureLoader(loadingManager);
  const orbitImages = [
    "/orbit-01.jpg",
    "/orbit-02.jpg",
    "/orbit-03.jpg",
    "/orbit-04.jpg",
    "/orbit-05.jpg",
    "/orbit-06.jpg",
    "/orbit-07.jpg",
    "/orbit-08.jpg",
    "/orbit-09.jpg",
  ];

  const totalCards = 9;
  const cardMeshes = [];
  const cardStates = [];

  for (let i = 0; i < totalCards; i++) {
    const texture = textureLoader.load(orbitImages[i]);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;

    const material = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.DoubleSide,
      transparent: true,
    });

    const mesh = new THREE.Mesh(curvedCardGeom, material);
    mesh.userData = { index: i };
    carouselScene.add(mesh);
    cardMeshes.push(mesh);

    cardStates.push({
      hoverScale: 1.0,
      hoverOffsetZ: 0.0,
    });
  }

  const spiralState = {
    progress: 0.0,
  };

  const deltaPhi = 0.74; // Scaled angular gap between larger cards to maintain zero overlap and clear margins
  const radiusX = 5.8;
  const radiusZ = 3.6;

  // 3D Parametric Ribbon Curve Functions
  function getRibbonPosition(p) {
    const isMobile = window.innerWidth < 900;
    const rX = isMobile ? 3.9 : radiusX;
    const rZ = isMobile ? 2.6 : radiusZ;
    const x = Math.sin(p) * rX;
    const z = Math.cos(p) * rZ;
    // On mobile, position ribbon so cards loop cleanly underneath the Innov8 logo and stay clear of both the logo and the bottom edge
    const yOffset = isMobile ? -2.4 : -3.4;
    const ySpread = isMobile ? 0.98 : 1.05;
    const y = -Math.cos(p) * 1.40 + (p + 0.5 * Math.PI) * ySpread + yOffset;
    return { x, y, z };
  }

  // Subtle 3D Orbit Guideline (Initially hidden, only appears during carousel phase)
  const trackPoints = [];
  for (let p = -0.65 * Math.PI; p <= 2.45 * Math.PI; p += 0.03) {
    const pos = getRibbonPosition(p);
    trackPoints.push(new THREE.Vector3(pos.x, pos.y, pos.z));
  }
  const trackGeom = new THREE.BufferGeometry().setFromPoints(trackPoints);
  const trackMat = new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.0, // Initially invisible
  });
  const trackLine = new THREE.Line(trackGeom, trackMat);
  carouselScene.add(trackLine);

  function updateCurvedCarousel(scrollProgress) {
    if (cardMeshes.length === 0) return;

    const isMobile = window.innerWidth < 900;
    const baseScale = isMobile ? 0.78 : 1.0;

    for (let i = 0; i < totalCards; i++) {
      const mesh = cardMeshes[i];
      const state = cardStates[i];

      // Single-file ribbon progression with scaled spacing: zero overlap during movement
      const phi = -i * deltaPhi + scrollProgress * (Math.PI * 6.2) - 0.65 * Math.PI;

      // Check if card is outside the entry or exit boundary
      if (phi < -0.65 * Math.PI || phi > 2.45 * Math.PI) {
        mesh.visible = false;
        mesh.material.opacity = 0.0;
        continue;
      }
      mesh.visible = true;

      // Smooth opacity fade at entry and exit thresholds
      let alpha = 1.0;
      if (phi < -0.35 * Math.PI) {
        alpha = Math.min((phi - (-0.65 * Math.PI)) / (0.30 * Math.PI), 1.0);
      } else if (phi > 2.15 * Math.PI) {
        alpha = Math.max(1.0 - (phi - 2.15 * Math.PI) / (0.30 * Math.PI), 0.0);
      }
      mesh.material.opacity = Math.max(alpha, 0.0);
      if (mesh.material.opacity <= 0.005) {
        mesh.visible = false;
      }

      // 3D Cartesian coordinates along the ribbon
      const pos = getRibbonPosition(phi);
      mesh.position.set(pos.x, pos.y, pos.z + state.hoverOffsetZ);

      // Card Orientations: NEVER FLIP (smooth camera-facing bank following ribbon)
      mesh.rotation.y = -Math.sin(phi) * 0.42;
      mesh.rotation.x = -0.09;
      mesh.rotation.z = Math.cos(phi) * 0.04;

      const scale = state.hoverScale * baseScale;
      mesh.scale.set(scale, scale, scale);
    }
  }

  // Initial layout: all cards placed outside the frame lower-left
  updateCurvedCarousel(0);

  // -------------------------------------------------------------
  // 4. INTERACTIVE RAYCASTER HOVER FOR 3D CARDS
  // -------------------------------------------------------------
  const raycaster = new THREE.Raycaster();
  const ndcMouse = new THREE.Vector2(-1000, -1000);
  let hoveredIndex = -1;

  function onCarouselMouseMove(event) {
    const rect = carouselCanvas.getBoundingClientRect();
    ndcMouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    ndcMouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  function onCarouselMouseLeave() {
    ndcMouse.set(-1000, -1000);
    hoveredIndex = -1;
  }

  window.addEventListener("mousemove", onCarouselMouseMove, { passive: true });
  document.addEventListener("mouseleave", onCarouselMouseLeave);

  // -------------------------------------------------------------
  // 5. MASTER SCROLL TIMELINE (PHASED STAGES & 3D SPIRAL ORBIT FLIGHT)
  // -------------------------------------------------------------
  const heroCard = document.getElementById("hero-card");
  const floatingLogo = document.getElementById("floating-logo");
  const revealRedStrip = document.getElementById("reveal-red-strip");
  const welcomeText = document.getElementById("welcome-text");

  // Dynamic scale and positioning helpers for crisp, perfectly proportioned floating logo
  const getHeaderLogoScale = () => {
    if (window.innerWidth <= 480) return 0.45;
    if (window.innerWidth <= 768) return 0.30;
    return 0.22;
  };

  const getLockupLogoScale = () => {
    if (window.innerWidth <= 480) return 0.96;
    if (window.innerWidth <= 768) return 0.95;
    return 1.0;
  };

  const getLockupLogoY = () => {
    const welcomeEl = document.getElementById("welcome-text");
    const anchorEl = document.getElementById("logo-anchor");
    if (welcomeEl && anchorEl) {
      const welcomeRect = welcomeEl.getBoundingClientRect();
      const anchorRect = anchorEl.getBoundingClientRect();
      // Snug gap pulling the spiderweb right under the "Welcome To" text
      const gap = window.innerWidth <= 480 ? -12 : window.innerWidth <= 768 ? -20 : -28;
      return (welcomeRect.bottom - anchorRect.top) + gap;
    }
    return window.innerWidth <= 480
      ? window.innerHeight * 0.42
      : window.innerHeight * 0.40;
  };

  if (floatingLogo) {
    gsap.set(floatingLogo, {
      x: 0,
      y: 0,
      scale: getHeaderLogoScale(),
      transformOrigin: "center top",
    });
  }

  const masterTl = gsap.timeline({
    scrollTrigger: {
      trigger: "#hero-scroll-section",
      start: "top top",
      end: "+=5600",
      pin: true,
      scrub: 0.5,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
  });

  // Stage 1: Hero card zooms out into a centered rectangular frame (0.0 -> 0.18)
  masterTl.to(
    heroCard,
    {
      scale: 0.44,
      borderRadius: "14px",
      boxShadow: "0 30px 100px rgba(0, 0, 0, 0.98), 0 0 0 1px rgba(217, 20, 36, 0.45)",
      ease: "power1.inOut",
      duration: 0.18,
    },
    0
  );

  // Stage 1b: Hero card shrinks to 0 in center and vanishes (0.18 -> 0.28)
  masterTl.to(
    heroCard,
    {
      scale: 0.0,
      opacity: 0,
      borderRadius: "20px",
      ease: "power2.in",
      duration: 0.1,
    },
    0.18
  );

  // Background smooth color inversion (Black+Red -> Crimson+Black) (0.08 -> 0.32)
  masterTl.to(
    bgMaterial.uniforms.uInvertProgress,
    {
      value: 1.0,
      ease: "power1.inOut",
      duration: 0.24,
    },
    0.08
  );

  // Stage 2: Logo glides down from header into lockup center & expands (0.22 -> 0.36)
  masterTl.fromTo(
    floatingLogo,
    {
      x: 0,
      y: 0,
      scale: getHeaderLogoScale,
    },
    {
      x: 0,
      y: getLockupLogoY,
      scale: getLockupLogoScale,
      ease: "power2.inOut",
      duration: 0.14,
    },
    0.22
  );

  // Stage 2b: Red strip expands from left across "Welcome To" text (0.30 -> 0.38)
  masterTl.fromTo(
    revealRedStrip,
    {
      left: "0%",
      width: "0%",
    },
    {
      width: "100%",
      left: "0%",
      ease: "power2.inOut",
      duration: 0.08,
    },
    0.3
  );

  // "Welcome To" text switches to visible under the red strip (0.37)
  masterTl.to(
    welcomeText,
    {
      opacity: 1,
      duration: 0.01,
    },
    0.37
  );

  // Stage 2c: Red strip slides off to the right, unveiling "Welcome To" (0.38 -> 0.44)
  masterTl.to(
    revealRedStrip,
    {
      left: "100%",
      width: "0%",
      ease: "power2.inOut",
      duration: 0.06,
    },
    0.38
  );

  // Stage 3: Motion Line fades in ONLY when carousel starts (0.40 -> 0.48)
  masterTl.to(
    trackMat,
    {
      opacity: 0.22,
      duration: 0.08,
      ease: "power1.out",
    },
    0.40
  );

  // Stage 3 (Carousel Phase): Starts AFTER Welcome To & Logo are settled (0.40 -> 1.0)
  masterTl.to(
    spiralState,
    {
      progress: 1.0,
      ease: "none",
      duration: 0.6,
      onUpdate: () => {
        updateCurvedCarousel(spiralState.progress);
      },
    },
    0.4
  );

  // Motion Line fades out as carousel concludes (0.94 -> 1.0)
  masterTl.to(
    trackMat,
    {
      opacity: 0.0,
      duration: 0.06,
      ease: "power1.in",
    },
    0.94
  );

  // Background color reverts smoothly back to original black & red streamlines (0.86 -> 1.0)
  masterTl.to(
    bgMaterial.uniforms.uInvertProgress,
    {
      value: 0.0,
      ease: "power1.inOut",
      duration: 0.14,
    },
    0.86
  );

  // "Welcome To" text vanishes as hero concludes (0.86 -> 0.94)
  masterTl.to(
    "#welcome-reveal-container",
    {
      opacity: 0,
      duration: 0.08,
      ease: "power2.in",
    },
    0.86
  );

  // Innov8 logo glides smoothly back up to top-center in the header (0.86 -> 0.98)
  masterTl.to(
    floatingLogo,
    {
      x: 0,
      y: 0,
      scale: getHeaderLogoScale,
      opacity: 1,
      ease: "power2.inOut",
      duration: 0.12,
    },
    0.86
  );

  // All Home & Logo Links (Top Header Logo, Footer Notch Logo, Footer HOME pill, Menu HOME) -> Smoothly scrolls to the initial top frame (0)
  const homeAndLogoLinks = document.querySelectorAll(
    "#floating-logo, .nav-logo-link, .footer-notch-logo-link, #footer-notch-logo-link, a[href='#hero-scroll-section'], .footer-link-pill[data-text='HOME'], .menu-item[data-target='home']"
  );

  const scrollToFirstPageTop = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      sessionStorage.removeItem("return_to_domains");
    } catch (_) {}

    const path = window.location.pathname;
    if (path !== "/" && !path.endsWith("index.html") && path !== "") {
      window.location.href = "/";
      return;
    }

    // Close fullscreen menu if open
    const menuNav = document.getElementById("fullscreen-menu");
    const menuBtn = document.getElementById("menu-btn");
    if (menuNav && menuNav.classList.contains("is-menu-open")) {
      menuNav.classList.remove("is-menu-open");
      if (menuBtn) menuBtn.classList.remove("menu-active");
    }

    if (window.lenis) {
      window.lenis.scrollTo(0, {
        immediate: false,
        duration: 1.3,
        lock: false,
        onComplete: () => {
          ScrollTrigger.update();
        },
      });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  homeAndLogoLinks.forEach((link) => {
    link.addEventListener("click", scrollToFirstPageTop);
  });

  // -------------------------------------------------------------
  // 6. ABOUT SECTION: ZENTRY SPOTLIGHT & HANGING CHARACTERS
  // -------------------------------------------------------------
  const hangingWrapper = document.getElementById("hanging-characters-wrapper");
  const hangerLeft = document.getElementById("hanger-left");
  const hangerRight = document.getElementById("hanger-right");
  const aboutSection = document.getElementById("about-section");

  if (hangingWrapper && hangerLeft && hangerRight && aboutSection) {
    // Visibility toggle when entering/exiting about section
    ScrollTrigger.create({
      trigger: "#about-section",
      start: "top 95%",
      end: "bottom 5%",
      onEnter: () => {
        gsap.to(hangingWrapper, {
          opacity: 1,
          visibility: "visible",
          duration: 0.3,
        });
      },
      onLeave: () => {
        gsap.to(hangingWrapper, {
          opacity: 0,
          duration: 0.3,
          onComplete: () => {
            gsap.set(hangingWrapper, { visibility: "hidden" });
          },
        });
      },
      onEnterBack: () => {
        gsap.to(hangingWrapper, {
          opacity: 1,
          visibility: "visible",
          duration: 0.3,
        });
      },
      onLeaveBack: () => {
        gsap.to(hangingWrapper, {
          opacity: 0,
          duration: 0.3,
          onComplete: () => {
            gsap.set(hangingWrapper, { visibility: "hidden" });
          },
        });
      },
    });

    // Descent on web strands when entering About, and retract back up when exiting towards Domains
    const hangerScrollTl = gsap.timeline({
      scrollTrigger: {
        trigger: "#about-section",
        start: "top 85%",
        end: "bottom 15%",
        scrub: 1.0,
      },
    });

    // 0.0 -> 0.30: Drop down from top
    hangerScrollTl.fromTo(
      [hangerLeft, hangerRight],
      {
        y: "-115%",
        opacity: 0,
      },
      {
        y: "0%",
        opacity: 1,
        ease: "power1.out",
        duration: 0.3,
      },
      0
    );

    // 0.30 -> 0.70: Stay suspended in About section
    hangerScrollTl.to([hangerLeft, hangerRight], { y: "0%", opacity: 1, duration: 0.4 }, 0.3);

    // 0.70 -> 1.00: Retract back up into ceiling when leaving About section
    hangerScrollTl.to(
      [hangerLeft, hangerRight],
      {
        y: "-115%",
        opacity: 0,
        ease: "power1.in",
        duration: 0.3,
      },
      0.7
    );

    const leftBox = hangerLeft.querySelector(".character-img-box");
    const rightBox = hangerRight.querySelector(".character-img-box");

    const SWING_TIME = 3.6;

    // Miles Morales (Left): swings Left <-> Right (-26px to +26px, -7.5deg to +7.5deg)
    gsap.fromTo(
      leftBox,
      {
        x: -26,
        rotation: -7.5,
      },
      {
        x: 26,
        rotation: 7.5,
        duration: SWING_TIME,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      }
    );

    // Spider-Gwen (Right): moves in exact OPPOSITE direction (Right <-> Left)
    gsap.fromTo(
      rightBox,
      {
        x: 26,
        rotation: 7.5,
      },
      {
        x: -26,
        rotation: -7.5,
        duration: SWING_TIME,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      }
    );

    // Slingy elastic web tension & spring bounce (subtle bevel stretch effect without large displacement)
    gsap.fromTo(
      [leftBox, rightBox],
      {
        scaleY: 0.985,
        scaleX: 1.01,
        y: 0,
      },
      {
        scaleY: 1.028,
        scaleX: 0.982,
        y: 6,
        duration: SWING_TIME / 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      }
    );
  }

  // ZENTRY INTERACTIVE SPOTLIGHT PHOTO HOVER & REAL-PHONE AUTO-REVEAL
  // =============================================================
  // ZENTRY INTERACTIVE SPOTLIGHT PHOTO HOVER & AUTO-REVEAL
  // =============================================================
  const isDesktop = () => window.innerWidth >= 900 && window.matchMedia("(hover: hover)").matches;

  const getCardOpenConfig = () => {
    if (isDesktop()) {
      return { width: "26rem", height: "19.5rem", borderRadius: "0.6rem" };
    } else {
      const w = Math.round(Math.min(window.innerWidth * 0.78, 310));
      const h = Math.round(w * 0.75);
      return { width: `${w}px`, height: `${h}px`, borderRadius: "10px" };
    }
  };

  const CARD_DOT = { width: "0.4em", height: "0.4em", borderRadius: "0.04em" };

  const CARD_CENTERED = {
    x: 0,
    y: 0,
    rotateX: 0,
    rotateY: 0,
    xPercent: -50,
    yPercent: -50,
  };

  const allSpots = Array.from(document.querySelectorAll(".spot"));
  let activeSpotManual = null;

  // 1. Manual Open / Close Controllers (No auto-reveal timeline, purely user-driven)
  const openSpotDirectly = (spot) => {
    allSpots.forEach((s) => {
      if (s !== spot) {
        s.classList.remove("active");
        const c = s.querySelector(".spot-card");
        const im = s.querySelector("img");
        const pl = s.closest(".line");
        gsap.to(c, { width: "0.4em", height: "0.4em", duration: 0.35, ease: "power3.out", overwrite: "auto" });
        gsap.to(im, { opacity: 0, duration: 0.2, overwrite: "auto" });
        gsap.set(s, { zIndex: 10 });
        if (pl) gsap.set(pl, { zIndex: 1 });
      }
    });

    spot.classList.add("active");
    activeSpotManual = spot;

    const card = spot.querySelector(".spot-card");
    const img = spot.querySelector("img");
    const parentLine = spot.closest(".line");
    const allLines = document.querySelectorAll(".headline .line");
    const isBottomLine = parentLine && parentLine === allLines[allLines.length - 1];

    gsap.set(spot, { zIndex: 1000 });
    if (parentLine) gsap.set(parentLine, { zIndex: 1000 });
    gsap.set(card, {
      ...CARD_CENTERED,
      yPercent: isBottomLine ? -75 : -50,
    });

    const openSize = getCardOpenConfig();
    gsap.to(card, {
      width: openSize.width,
      height: openSize.height,
      borderRadius: openSize.borderRadius,
      duration: isDesktop() ? 0.6 : 0.5,
      ease: "power3.out",
      overwrite: "auto",
    });
    gsap.to(img, {
      opacity: 1,
      duration: isDesktop() ? 0.4 : 0.3,
      ease: "power2.out",
      overwrite: "auto",
    });
  };

  const closeSpotDirectly = (spot) => {
    if (!spot) return;
    spot.classList.remove("active");
    if (activeSpotManual === spot) activeSpotManual = null;

    const card = spot.querySelector(".spot-card");
    const img = spot.querySelector("img");
    const parentLine = spot.closest(".line");

    gsap.to(card, {
      width: "0.4em",
      height: "0.4em",
      borderRadius: "0.04em",
      duration: 0.35,
      ease: "power3.out",
      overwrite: "auto",
      onComplete: () => {
        gsap.set(spot, { zIndex: 10 });
        if (parentLine) gsap.set(parentLine, { zIndex: 1 });
      },
    });
    gsap.to(img, {
      opacity: 0,
      duration: 0.2,
      ease: "power2.out",
      overwrite: "auto",
    });
  };

  // 2. Attach Event Listeners to each Spot
  allSpots.forEach((spot) => {
    const card = spot.querySelector(".spot-card");

    // Desktop hover: Opens on mouseenter, Closes on mouseleave
    spot.addEventListener("mouseenter", () => {
      if (isDesktop()) openSpotDirectly(spot);
    });

    spot.addEventListener("mouseleave", () => {
      if (isDesktop()) closeSpotDirectly(spot);
    });

    // Desktop 3D cursor tilt tracking
    spot.addEventListener("mousemove", (event) => {
      if (!isDesktop() || !spot.classList.contains("active")) return;
      const bounds = spot.getBoundingClientRect();
      const centerX = bounds.left + bounds.width / 2;
      const centerY = bounds.top + bounds.height / 2;
      const cardBounds = card.getBoundingClientRect();
      const ratioX = (event.clientX - centerX) / (cardBounds.width / 2);
      const ratioY = (event.clientY - centerY) / (cardBounds.height / 2);
      const clamp = (v) => Math.max(-1, Math.min(1, v));
      gsap.to(card, {
        rotateY: clamp(ratioX) * -18,
        rotateX: clamp(ratioY) * 18,
        duration: 0.2,
        ease: "power1.out",
        overwrite: "auto",
      });
    });

    // Mobile touch & click toggle: Tap to open, Tap to close
    const handleMobileTap = (e) => {
      if (isDesktop()) return;
      if (spot.classList.contains("active")) {
        closeSpotDirectly(spot);
      } else {
        openSpotDirectly(spot);
      }
    };

    spot.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "touch" || !isDesktop()) {
        e.stopPropagation();
        handleMobileTap(e);
      }
    });

    spot.addEventListener("click", (e) => {
      if (isDesktop()) return;
      e.stopPropagation();
      handleMobileTap(e);
    });
  });

  // Tap outside closes active spot on mobile
  const handleOutsideTap = (e) => {
    if (!e.target.closest(".spot") && activeSpotManual) {
      closeSpotDirectly(activeSpotManual);
    }
  };
  document.addEventListener("pointerdown", handleOutsideTap);
  document.addEventListener("touchstart", handleOutsideTap, { passive: true });

  // ZENTRY 3D LEFT-BEVEL ENTRANCE ANIMATION
  const headline = document.querySelector(".headline");
  const headlineLines = document.querySelectorAll(".headline .line");

  if (headline) {
    gsap.set(headline, {
      transformPerspective: 1400,
      transformOrigin: "0% 50% -120px",
      transformStyle: "preserve-3d",
    });

    const aboutTitleTl = gsap.timeline({
      scrollTrigger: {
        trigger: "#about-section",
        start: "top 80%",
        end: "top 18%",
        scrub: 1.0,
        invalidateOnRefresh: true,
      },
    });

    // The entire headline sweeps in from the left-bevel pose directly at natural center (no top gap)
    aboutTitleTl.fromTo(
      headline,
      {
        opacity: 0,
        x: -280,
        y: 0,
        z: -180,
        rotateY: -35,
        rotateX: 16,
        rotateZ: -10,
        skewX: -12,
        filter: isMobile ? "none" : "blur(6px)",
      },
      {
        opacity: 1,
        x: 0,
        y: 0,
        z: 0,
        rotateY: 0,
        rotateX: 0,
        rotateZ: 0,
        skewX: 0,
        filter: isMobile ? "none" : "blur(0px)",
        duration: 1.0,
        ease: "power2.out",
      },
      0
    );

    if (headlineLines.length > 0) {
      aboutTitleTl.fromTo(
        headlineLines,
        {
          x: (i) => -60 + i * 10,
          y: 0,
          z: (i) => -60 + i * 10,
          rotateY: -10,
          rotateZ: -3,
          opacity: 0,
        },
        {
          x: 0,
          y: 0,
          z: 0,
          rotateY: 0,
          rotateZ: 0,
          opacity: 1,
          duration: 1.0,
          stagger: 0.03,
          ease: "power2.out",
        },
        0
      );
    }
  }

  // Entrance reveal for Domains header & pills
  gsap.from(".domains-left-content, .domains-right-nav", {
    scrollTrigger: {
      trigger: "#domains-scroll-section",
      start: "top 80%",
    },
    y: 40,
    opacity: 0,
    duration: 0.9,
    stagger: 0.15,
    ease: "power3.out",
  });

  // -------------------------------------------------------------
  // 8. SECTION 3: DOMAINS 3D SHOWCASE CAROUSEL (3 CURVED FRAMES)
  // -------------------------------------------------------------
  const domainsCanvas = document.getElementById("domains-canvas");
  let domainsRenderer = null;
  let domainsScene = null;
  let domainsCamera = null;
  const domainMeshes = [];
  const domainVideoElements = [];

  const isMobileViewport = isMobile;

  if (domainsCanvas) {
    domainsRenderer = new THREE.WebGLRenderer({
      canvas: domainsCanvas,
      antialias: !isMobile,
      alpha: true,
      powerPreference: "high-performance",
    });
    domainsRenderer.setSize(window.innerWidth, window.innerHeight);
    domainsRenderer.setPixelRatio(getOptimalDpr());

    domainsScene = new THREE.Scene();
    domainsCamera = new THREE.PerspectiveCamera(
      40,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    domainsCamera.position.set(0, 0, 14);

    // Large curved screen geometry matching the 16:9 1920x1080 videos
    const domainCardWidth = 8.6;
    const domainCardHeight = 4.84;

    const domainVideos = ["/videos/1.mp4", "/videos/2.mp4", "/videos/3.mp4"];
    const segments = isMobile ? 16 : 32;

    for (let i = 0; i < 3; i++) {
      // Create independent plane geometry for dynamic curvature morphing
      const geom = new THREE.PlaneGeometry(domainCardWidth, domainCardHeight, segments, 1);
      const baseX = [];
      for (let j = 0; j < geom.attributes.position.count; j++) {
        baseX.push(geom.attributes.position.getX(j));
      }
      geom.userData = { baseX };

      // HTML5 video element for seamless continuous looping playback
      const video = document.createElement("video");
      video.src = domainVideos[i];
      video.crossOrigin = "anonymous";
      video.loop = true;
      video.muted = true;
      video.defaultMuted = true;
      video.playsInline = true;
      video.setAttribute("playsinline", "");
      video.setAttribute("webkit-playsinline", "");
      video.setAttribute("muted", "");
      video.preload = "auto";
      video.autoplay = true;

      // Start looping playback immediately
      video.play().catch(() => {});
      domainVideoElements.push(video);

      // THREE.VideoTexture with high-performance linear filtering and no mipmaps
      const videoTexture = new THREE.VideoTexture(video);
      videoTexture.colorSpace = THREE.SRGBColorSpace;
      videoTexture.minFilter = THREE.LinearFilter;
      videoTexture.magFilter = THREE.LinearFilter;
      videoTexture.generateMipmaps = false;

      const material = new THREE.MeshBasicMaterial({
        map: videoTexture,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.0,
      });

      const mesh = new THREE.Mesh(geom, material);
      mesh.userData = { index: i, lastCurvature: null, video, videoTexture };
      domainsScene.add(mesh);
      domainMeshes.push(mesh);
    }

    // Ensure continuous playback on first user interaction if deferred by browser policy
    const resumeDomainVideos = () => {
      domainVideoElements.forEach((vid) => {
        if (vid.paused) {
          vid.play().catch(() => {});
        }
      });
    };
    window.addEventListener("click", resumeDomainVideos, { passive: true });
    window.addEventListener("touchstart", resumeDomainVideos, { passive: true });
    window.addEventListener("scroll", resumeDomainVideos, { passive: true });
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        resumeDomainVideos();
      }
    });
  }

  // Dynamic mesh curvature deformation: Inward curl for entering frame, outward curl for exiting frame
  function updateCardCurvature(mesh, curvatureK) {
    if (mesh.userData.lastCurvature !== null && Math.abs(mesh.userData.lastCurvature - curvatureK) < 0.001) {
      return;
    }
    mesh.userData.lastCurvature = curvatureK;

    const pos = mesh.geometry.attributes.position;
    const baseX = mesh.geometry.userData.baseX;
    if (!baseX) return;
    const count = pos.count;

    for (let i = 0; i < count; i++) {
      const x = baseX[i];
      if (Math.abs(curvatureK) < 0.0005) {
        pos.setX(i, x);
        pos.setZ(i, 0);
      } else {
        const angle = x * curvatureK;
        pos.setX(i, Math.sin(angle) / curvatureK);
        pos.setZ(i, (Math.cos(angle) - 1.0) / curvatureK);
      }
    }
    pos.needsUpdate = true;
  }

  const DOMAIN_CARD_GAP = 1.25;

  const domainState = {
    progress: -DOMAIN_CARD_GAP,
  };

  // Cursor reaction for domains section
  const domainMouse = new THREE.Vector2(0, 0);
  const targetDomainMouse = new THREE.Vector2(0, 0);

  window.addEventListener("mousemove", (e) => {
    targetDomainMouse.x = (e.clientX / window.innerWidth - 0.5) * 2.0;
    targetDomainMouse.y = -(e.clientY / window.innerHeight - 0.5) * 2.0;
  });

  // Trajectory function for Domains orbit: bottom-left -> center focus -> top-right exit
  function getDomainCardTransform(u) {
    const isMobile = window.innerWidth < 900;
    const aspect = window.innerWidth / Math.max(window.innerHeight, 1);

    // Responsive scale: on desktop ~1.0; on mobile (portrait aspect ~0.45 - 0.6) scale down to ~0.46 - 0.50 so it fits cleanly
    const responsiveScale = isMobile ? Math.min(0.50, Math.max(0.38, aspect * 0.96)) : 1.0;

    // Travel trajectory distance adapted for mobile vs desktop screen bounds
    const travelX = isMobile ? 7.2 : 13.5;
    const travelY = isMobile ? 6.5 : 9.5;
    const x = u * travelX;
    // On mobile, center the card slightly lower in the open space between the CTA button and the bottom nav pills
    const y = u * travelY + (isMobile ? -0.2 : 0.0);

    // Parabolic depth arch: highest at center (z = 0.6 in front of center logo), curves back into z = -7.5 at extremities
    const z = -Math.pow(Math.abs(u), 1.4) * (isMobile ? 4.8 : 6.5) + (1.0 - Math.min(Math.abs(u), 1.0)) * 0.6;

    // Face left initially when entering (rotY < 0), face front at center (rotY = 0), face right when exiting (rotY > 0)
    const rotY = u * (isMobile ? 0.48 : 0.65);
    const rotX = -u * (isMobile ? 0.08 : 0.14);
    // Diagonal banking tilt along the bottom-left to top-right flow
    const rotZ = -Math.abs(u) * (isMobile ? 0.10 : 0.16);

    // Consistent curvature with edges bending towards the back side
    const curvatureK = (0.08 + Math.abs(u) * 0.14) * (isMobile ? 0.85 : 1.0);

    // Scale: 1.0 at center, slightly smaller at extremities, adjusted by responsive scale factor
    const baseScale = 1.0 - Math.min(Math.abs(u) * 0.12, 0.28);
    const scale = baseScale * responsiveScale;

    // Opacity: 100% solid inside the visible frame (|u| <= 0.85), fades only at outer perimeter (0.85 -> 1.25)
    let opacity = 1.0;
    if (u < -0.85) {
      opacity = Math.max(1.0 - (-0.85 - u) / 0.40, 0.0);
    } else if (u > 0.85) {
      opacity = Math.max(1.0 - (u - 0.85) / 0.40, 0.0);
    }

    return { x, y, z, rotX, rotY, rotZ, curvatureK, scale, opacity };
  }

  function updateDomainsCarousel(progress) {
    if (domainMeshes.length === 0) return;

    // Subtle cursor tilt & parallax
    const cardTiltX = -domainMouse.y * 0.08;
    const cardTiltY = domainMouse.x * 0.10;
    const cardShiftX = domainMouse.x * 0.28;
    const cardShiftY = domainMouse.y * 0.20;

    for (let i = 0; i < 3; i++) {
      const mesh = domainMeshes[i];
      const u = progress - i * DOMAIN_CARD_GAP;

      if (Math.abs(u) > 1.30) {
        mesh.visible = false;
        mesh.material.opacity = 0;
        continue;
      }

      const t = getDomainCardTransform(u);
      if (t.opacity <= 0.005) {
        mesh.visible = false;
        mesh.material.opacity = 0;
        continue;
      }

      mesh.visible = true;
      if (mesh.userData.video && mesh.userData.video.paused) {
        mesh.userData.video.play().catch(() => {});
      }
      updateCardCurvature(mesh, t.curvatureK);
      mesh.position.set(t.x + cardShiftX, t.y + cardShiftY, t.z);
      mesh.rotation.set(t.rotX + cardTiltX, t.rotY + cardTiltY, t.rotZ);
      mesh.scale.set(t.scale, t.scale, t.scale);
      mesh.material.opacity = t.opacity;
    }
  }

  // Initial layout: All cards invisible and offscreen at start
  updateDomainsCarousel(-DOMAIN_CARD_GAP);

  // ScrollTrigger & Domain Kinetic Navigation
  const domainPills = document.querySelectorAll(".domain-pill");

  domainPills.forEach((pill) => {
    const wrap = pill.querySelector(".domain-label-wrap");
    const rawText = (pill.getAttribute("data-category") || pill.textContent || "").trim().toUpperCase();

    if (wrap) {
      wrap.innerHTML = rawText
        .split("")
        .map(
          (char) => `
          <span class="domain-char-box">
            <span class="domain-char domain-char-main">${char}</span>
            <span class="domain-char domain-char-clone">${char}</span>
          </span>
        `
        )
        .join("");

      const charMains = wrap.querySelectorAll(".domain-char-main");
      const charClones = wrap.querySelectorAll(".domain-char-clone");

      pill.addEventListener("mouseenter", () => {
        if (pill.classList.contains("active")) return;

        gsap.killTweensOf(charMains);
        gsap.killTweensOf(charClones);

        gsap.to(charMains, {
          yPercent: -100,
          duration: 0.38,
          stagger: 0.03,
          ease: "power2.out",
        });

        gsap.to(charClones, {
          yPercent: -100,
          duration: 0.38,
          stagger: 0.03,
          ease: "power2.out",
        });
      });

      pill.addEventListener("mouseleave", () => {
        if (pill.classList.contains("active")) return;

        gsap.killTweensOf(charMains);
        gsap.killTweensOf(charClones);

        gsap.to(charMains, {
          yPercent: 0,
          duration: 0.32,
          stagger: 0.025,
          ease: "power2.out",
        });

        gsap.to(charClones, {
          yPercent: 0,
          duration: 0.32,
          stagger: 0.025,
          ease: "power2.out",
        });
      });
    }

    pill.addEventListener("click", (e) => {
      e.preventDefault();
      const cat = (pill.getAttribute("data-category") || "software").toLowerCase();
      const rect = pill.getBoundingClientRect();
      const clickX = e.clientX || rect.left + rect.width / 2;
      const clickY = e.clientY || rect.top + rect.height / 2;

      try {
        sessionStorage.setItem("innov8_selected_category", cat);
        sessionStorage.setItem("innov8_transition_origin", JSON.stringify({ x: clickX, y: clickY }));
        sessionStorage.setItem("return_to_domains", "true");
      } catch (err) {}

      window.location.href = `/events?category=${cat}`;
    });
  });

  function setActiveDomainPill(index) {
    const categories = ["software", "hardware", "esports"];
    const activeCat = categories[index] || "software";
    const domainsCtaBtn = document.querySelector(".domains-cta-btn");
    if (domainsCtaBtn) {
      domainsCtaBtn.setAttribute("href", `/events?category=${activeCat}`);
    }

    domainPills.forEach((pill, idx) => {
      const charMains = pill.querySelectorAll(".domain-char-main");
      const charClones = pill.querySelectorAll(".domain-char-clone");

      if (idx === index) {
        pill.classList.add("active");
      } else {
        pill.classList.remove("active");
        if (charMains.length) {
          gsap.to(charMains, { yPercent: 0, duration: 0.25, ease: "power2.out" });
          gsap.to(charClones, { yPercent: 0, duration: 0.25, ease: "power2.out" });
        }
      }
    });
  }

  const domainsScrollTrigger = ScrollTrigger.create({
    trigger: "#domains-scroll-section",
    start: "top top",
    end: window.innerWidth < 900 ? "+=1600" : "+=3400",
    pin: true,
    scrub: window.innerWidth < 900 ? 0.35 : 0.8,
    onUpdate: (self) => {
      // Map self.progress (0.0 -> 1.0) across the 3 domains with wide gap
      const orbitT = -DOMAIN_CARD_GAP + self.progress * (DOMAIN_CARD_GAP * 3.0);
      domainState.progress = orbitT;
      const activeIdx = orbitT < DOMAIN_CARD_GAP * 0.5 ? 0 : (orbitT < DOMAIN_CARD_GAP * 1.5 ? 1 : 2);
      setActiveDomainPill(activeIdx);
    },
  });

  // -------------------------------------------------------------
  // 10. SECTION 4: GLIMPSES 3D SPIRAL VORTEX & FREEFALLING CHARACTER (#glimpses-canvas)
  // -------------------------------------------------------------
  const glimpsesVertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
    }
  `;

  const glimpsesFragmentShader = `
    uniform sampler2D uMap;
    varying vec2 vUv;
    void main() {
      vec4 tex = texture2D(uMap, vUv);
      gl_FragColor = tex;
    }
  `;

  const GLIMPSES_CONFIG = {
    tilesPerRevolution: 14,
    revolutions: 5.5,
    startRadius: 5.4,
    endRadius: 3.6,
    tileHeightRatio: 1.15,
    tileSegments: 24,
    spiralGap: 0.35,
    tileOverlap: 0.005,
    cameraZ: 12,
    cameraSmoothing: 0.09,
    baseRotationSpeed: 0.0055,
    cameraYMultiplier: 1.05,
  };

  const glimpsesCanvas = document.getElementById("glimpses-canvas");
  let glimpsesRenderer = null;
  let glimpsesScene = null;
  let glimpsesCamera = null;
  let glimpsesSpiralGroup = null;
  let glimpsesFallingMesh = null;
  let glimpsesCharacterGroup = null;
  let glimpsesHeight = 0;

  const glimpsesState = {
    progress: 0.0,
    targetProgress: 0.0,
  };

  if (glimpsesCanvas) {
    glimpsesRenderer = new THREE.WebGLRenderer({
      canvas: glimpsesCanvas,
      antialias: !isMobile,
      alpha: true,
      powerPreference: "high-performance",
    });
    glimpsesRenderer.setSize(window.innerWidth, window.innerHeight);
    glimpsesRenderer.setPixelRatio(getOptimalDpr());

    glimpsesScene = new THREE.Scene();
    glimpsesCamera = new THREE.PerspectiveCamera(
      72,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    glimpsesCamera.position.set(0, 0, GLIMPSES_CONFIG.cameraZ);

    const glimpsesImages = [
      "/deadlock-studios/public/spiral/spiral-1.jpg",
      "/deadlock-studios/public/spiral/spiral-2.jpg",
      "/deadlock-studios/public/spiral/spiral-3.jpg",
      "/deadlock-studios/public/spiral/spiral-4.jpg",
      "/deadlock-studios/public/spiral/spiral-5.jpg",
      "/deadlock-studios/public/spiral/spiral-6.jpg",
      "/deadlock-studios/public/spiral/spiral-7.jpg",
      "/deadlock-studios/public/spiral/spiral-8.jpg",
      "/deadlock-studios/public/spiral/spiral-9.jpg",
      "/deadlock-studios/public/spiral/spiral-10.jpg",
      "/deadlock-studios/public/spiral/spiral-11.jpg",
      "/deadlock-studios/public/spiral/spiral-12.jpg",
      "/deadlock-studios/public/spiral/spiral-13.jpg",
      "/deadlock-studios/public/spiral/spiral-14.jpg",
      "/deadlock-studios/public/spiral/spiral-15.jpg",
      "/deadlock-studios/public/spiral/spiral-16.jpg",
      "/deadlock-studios/public/spiral/spiral-17.jpg",
      "/deadlock-studios/public/spiral/spiral-18.jpg",
      "/deadlock-studios/public/spiral/spiral-19.jpg",
    ];

    const maxAnisotropy = glimpsesRenderer
      ? glimpsesRenderer.capabilities.getMaxAnisotropy()
      : 16;
    const glimpsesTextures = glimpsesImages.map((src) => {
      const t = textureLoader.load(src);
      t.colorSpace = THREE.SRGBColorSpace;
      t.generateMipmaps = false;
      t.minFilter = THREE.LinearFilter;
      t.magFilter = THREE.LinearFilter;
      t.anisotropy = maxAnisotropy;
      return t;
    });

    const spiralTotalTiles = Math.floor(
      GLIMPSES_CONFIG.tilesPerRevolution * GLIMPSES_CONFIG.revolutions
    );
    const spiralAngleStep = (Math.PI * 2) / GLIMPSES_CONFIG.tilesPerRevolution;

    const spiralTileEdgesY = [0];

    for (let i = 0; i < spiralTotalTiles; i++) {
      const progress = i / spiralTotalTiles;
      const radius =
        GLIMPSES_CONFIG.startRadius +
        (GLIMPSES_CONFIG.endRadius - GLIMPSES_CONFIG.startRadius) * progress;
      const arcWidth =
        (2 * Math.PI * radius) / GLIMPSES_CONFIG.tilesPerRevolution;
      const tileHeight = arcWidth * GLIMPSES_CONFIG.tileHeightRatio;
      spiralTileEdgesY.push(
        spiralTileEdgesY[i] -
          (tileHeight + GLIMPSES_CONFIG.spiralGap) /
            GLIMPSES_CONFIG.tilesPerRevolution
      );
    }

    glimpsesHeight = Math.abs(spiralTileEdgesY[spiralTotalTiles]);

    glimpsesSpiralGroup = new THREE.Group();
    glimpsesScene.add(glimpsesSpiralGroup);

    for (let i = 0; i < spiralTotalTiles; i++) {
      const progress = i / spiralTotalTiles;
      const radius =
        GLIMPSES_CONFIG.startRadius +
        (GLIMPSES_CONFIG.endRadius - GLIMPSES_CONFIG.startRadius) * progress;
      const arcWidth =
        (2 * Math.PI * radius) / GLIMPSES_CONFIG.tilesPerRevolution;
      const tileHeight = arcWidth * GLIMPSES_CONFIG.tileHeightRatio;
      const tileAngle = arcWidth / radius + GLIMPSES_CONFIG.tileOverlap;

      const centerY = (spiralTileEdgesY[i] + spiralTileEdgesY[i + 1]) / 2;
      const slope = spiralTileEdgesY[i + 1] - spiralTileEdgesY[i];

      const positions = [];
      const uvCoords = [];
      const indices = [];
      const segments = GLIMPSES_CONFIG.tileSegments;

      for (let row = 0; row <= 1; row++) {
        for (let col = 0; col <= segments; col++) {
          const angle = (col / segments - 0.5) * tileAngle;
          positions.push(
            Math.sin(angle) * radius,
            (row - 0.5) * tileHeight + (col / segments - 0.5) * slope,
            Math.cos(angle) * radius
          );
          uvCoords.push(col / segments, row);
        }
      }

      for (let col = 0; col < segments; col++) {
        const current = col;
        const below = current + segments + 1;
        indices.push(
          current,
          below,
          current + 1,
          below,
          below + 1,
          current + 1
        );
      }

      const geom = new THREE.BufferGeometry();
      geom.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(positions, 3)
      );
      geom.setAttribute("uv", new THREE.Float32BufferAttribute(uvCoords, 2));
      geom.setIndex(indices);
      geom.computeVertexNormals();

      const mat = new THREE.MeshBasicMaterial({
        map: glimpsesTextures[i % glimpsesTextures.length],
        side: THREE.DoubleSide,
      });

      const tileMesh = new THREE.Mesh(geom, mat);
      tileMesh.position.y = centerY;

      const tileGroup = new THREE.Group();
      tileGroup.rotation.y = i * spiralAngleStep;
      tileGroup.add(tileMesh);
      glimpsesSpiralGroup.add(tileGroup);
    }

    // 3D FREEFALLING CHARACTER MESH (Layered at Z = 0 between front and back spiral layers)
    const fallingTexture = textureLoader.load("/falling.png");
    fallingTexture.colorSpace = THREE.SRGBColorSpace;
    fallingTexture.minFilter = THREE.LinearMipmapLinearFilter;
    fallingTexture.magFilter = THREE.LinearFilter;

    const charAspect = 752 / 1623;
    const charHeight = 5.2;
    const charWidth = charHeight * charAspect;
    const fallingGeom = new THREE.PlaneGeometry(charWidth, charHeight);
    const fallingMat = new THREE.MeshBasicMaterial({
      map: fallingTexture,
      transparent: true,
      alphaTest: 0.02,
      side: THREE.DoubleSide,
      depthWrite: true,
      depthTest: true,
    });
    glimpsesFallingMesh = new THREE.Mesh(fallingGeom, fallingMat);

    // Volumetric depth shadow backing plane (prevents paper-thin look)
    const shadowGeom = new THREE.PlaneGeometry(charWidth * 1.03, charHeight * 1.03);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: fallingTexture,
      color: 0x050002,
      transparent: true,
      opacity: 0.85,
      alphaTest: 0.02,
      side: THREE.DoubleSide,
      depthWrite: true,
      depthTest: true,
    });
    const shadowMesh = new THREE.Mesh(shadowGeom, shadowMat);
    shadowMesh.position.set(0, 0, -0.06);

    glimpsesCharacterGroup = new THREE.Group();
    glimpsesCharacterGroup.add(shadowMesh);
    glimpsesCharacterGroup.add(glimpsesFallingMesh);
    glimpsesCharacterGroup.position.set(0, 0, 0);
    glimpsesScene.add(glimpsesCharacterGroup);

    const updateGlimpsesScale = () => {
      if (!glimpsesSpiralGroup) return;
      const scale = Math.min(1, window.innerWidth / 1400);
      glimpsesSpiralGroup.scale.setScalar(Math.max(0.78, scale));
      if (glimpsesCharacterGroup) {
        glimpsesCharacterGroup.scale.setScalar(Math.max(0.82, scale));
      }
    };

    updateGlimpsesScale();

    // ScrollTrigger to pin the section and drive the freefall vortex
    ScrollTrigger.create({
      trigger: "#glimpses-section",
      start: "top top",
      end: "+=3200",
      pin: true,
      scrub: 0.5,
      onUpdate: (self) => {
        glimpsesState.targetProgress = self.progress;
      },
    });

    // GLIMPSES 3D LEFT-BEVEL ENTRANCE ANIMATION & KINETIC QUOTE
    const glimpsesTitle = document.querySelector(".glimpses-title");
    const quoteContainer = document.getElementById("glimpses-quote-container");

    if (quoteContainer) {
      const wrap = quoteContainer.querySelector(".glimpses-quote-label-wrap");
      const rawText = (wrap ? (wrap.getAttribute("data-text") || wrap.textContent) : "")
        .replace(/\s+/g, " ")
        .trim()
        .toUpperCase();

      if (wrap) {
        wrap.innerHTML = rawText
          .split("")
          .map(
            (char) => `
            <span class="glimpses-char-box">
              <span class="glimpses-char glimpses-char-main">${char === " " ? "&nbsp;" : char}</span>
              <span class="glimpses-char glimpses-char-clone">${char === " " ? "&nbsp;" : char}</span>
            </span>
          `
          )
          .join("");

        const charMains = wrap.querySelectorAll(".glimpses-char-main");
        const charClones = wrap.querySelectorAll(".glimpses-char-clone");

        quoteContainer.addEventListener("mouseenter", () => {
          gsap.killTweensOf(charMains);
          gsap.killTweensOf(charClones);

          gsap.to(charMains, {
            yPercent: -100,
            duration: 0.38,
            stagger: 0.018,
            ease: "power2.out",
          });

          gsap.to(charClones, {
            yPercent: -100,
            duration: 0.38,
            stagger: 0.018,
            ease: "power2.out",
          });
        });

        quoteContainer.addEventListener("mouseleave", () => {
          gsap.killTweensOf(charMains);
          gsap.killTweensOf(charClones);

          gsap.to(charMains, {
            yPercent: 0,
            duration: 0.32,
            stagger: 0.014,
            ease: "power2.out",
          });

          gsap.to(charClones, {
            yPercent: 0,
            duration: 0.32,
            stagger: 0.014,
            ease: "power2.out",
          });
        });
      }
    }

    if (glimpsesTitle) {
      gsap.set(glimpsesTitle, {
        transformPerspective: 1400,
        transformOrigin: "0% 50% -120px",
        transformStyle: "preserve-3d",
      });

      const glimpsesTitleTl = gsap.timeline({
        scrollTrigger: {
          trigger: "#glimpses-section",
          start: "top 80%",
          end: "top 5%",
          scrub: 1.0,
          invalidateOnRefresh: true,
        },
      });

      // 1. EXPERIENCE THE INNOVERSE sweeps in from the 3D left-bevel pose
      glimpsesTitleTl.fromTo(
        glimpsesTitle,
        {
          opacity: 0,
          x: -280,
          y: 0,
          z: -180,
          rotateY: -35,
          rotateX: 16,
          rotateZ: -10,
          skewX: -12,
          filter: isMobile ? "none" : "blur(6px)",
        },
        {
          opacity: 1,
          x: 0,
          y: 0,
          z: 0,
          rotateY: 0,
          rotateX: 0,
          rotateZ: 0,
          skewX: 0,
          filter: isMobile ? "none" : "blur(0px)",
          duration: 1.0,
          ease: "power2.out",
        },
        0
      );

      if (quoteContainer) {
        const charMains = quoteContainer.querySelectorAll(".glimpses-char-main");
        const charClones = quoteContainer.querySelectorAll(".glimpses-char-clone");

        // Quote container fades into place alongside the title
        glimpsesTitleTl.fromTo(
          quoteContainer,
          {
            opacity: 0,
            y: 15,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out",
          },
          0.3
        );

        // 2. AFTER EXPERIENCE THE INNOVERSE arrives fully, roll the quote letters automatically letter-by-letter
        if (charMains.length > 0) {
          glimpsesTitleTl.to(
            charMains,
            {
              yPercent: -100,
              duration: 0.5,
              stagger: 0.032,
              ease: "power2.out",
            },
            1.05
          );

          glimpsesTitleTl.to(
            charClones,
            {
              yPercent: -100,
              duration: 0.5,
              stagger: 0.032,
              ease: "power2.out",
            },
            1.05
          );
        }
      }
    }

    // -------------------------------------------------------------
    // 12. AFTERMOVIE INTERACTIVE SECTION
    // -------------------------------------------------------------
    const aftermovieSection = document.getElementById("aftermovie-section");
    const leftImg = document.getElementById("aftermovie-left-img");
    const rightImg = document.getElementById("aftermovie-right-img");
    const aftermovieTitle = document.getElementById("aftermovie-title");
    const mediaCard = document.getElementById("aftermovie-media-card");
    const mediaOverlay = document.querySelector(".aftermovie-media-overlay");
    const menuBtn = document.querySelector(".menu");
    const scrollHint = document.getElementById("aftermovie-scroll-hint");

    if (aftermovieSection) {
      const mmAftermovie = gsap.matchMedia();

      // DESKTOP (>= 900px): Pinned Full-Screen Zoom Sequence
      mmAftermovie.add("(min-width: 900px)", () => {
        const aftermovieTl = gsap.timeline({
          scrollTrigger: {
            trigger: "#aftermovie-section",
            start: "top top",
            end: "+=3400",
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        });

        // Phase 1 (0.0 -> 0.32): Smoothly transition streamlines from Red to White
        aftermovieTl.fromTo(
          bgMaterial.uniforms.uWhiteLinesProgress,
          { value: 0.0 },
          {
            value: 1.0,
            duration: 0.32,
            ease: "power2.inOut",
          },
          0
        );

        if (aftermovieTitle) {
          gsap.set(aftermovieTitle, {
            transformPerspective: 1400,
            transformOrigin: "0% 50% -120px",
            transformStyle: "preserve-3d",
          });

          // 3D Left-Bevel entrance matching EXPERIENCE THE INNOVERSE
          aftermovieTl.fromTo(
            aftermovieTitle,
            {
              opacity: 0,
              x: -280,
              y: 0,
              z: -180,
              rotateY: -35,
              rotateX: 16,
              rotateZ: -10,
              skewX: -12,
              filter: isMobile ? "none" : "blur(6px)",
            },
            {
              opacity: 1,
              x: 0,
              y: 0,
              z: 0,
              rotateY: 0,
              rotateX: 0,
              rotateZ: 0,
              skewX: 0,
              filter: isMobile ? "none" : "blur(0px)",
              duration: 0.32,
              ease: "power2.out",
            },
            0.04
          );
        }

        if (leftImg) {
          aftermovieTl.fromTo(
            leftImg,
            {
              x: "-100%",
              opacity: 0,
            },
            {
              x: "0%",
              opacity: 1,
              duration: 0.32,
              ease: "power3.out",
            },
            0.04
          );
        }

        if (rightImg) {
          aftermovieTl.fromTo(
            rightImg,
            {
              x: "100%",
              opacity: 0,
            },
            {
              x: "0%",
              opacity: 1,
              duration: 0.32,
              ease: "power3.out",
            },
            0.04
          );
        }

        if (mediaCard) {
          aftermovieTl.fromTo(
            mediaCard,
            {
              scale: 0.8,
              opacity: 0,
              top: "68%",
              left: "50%",
              xPercent: -50,
              yPercent: -50,
            },
            {
              scale: 1,
              opacity: 1,
              top: "68%",
              left: "50%",
              xPercent: -50,
              yPercent: -50,
              duration: 0.32,
              ease: "power2.out",
            },
            0.06
          );

          if (scrollHint) {
            aftermovieTl.fromTo(
              scrollHint,
              {
                opacity: 0,
                y: 20,
              },
              {
                opacity: 1,
                y: 0,
                duration: 0.24,
                ease: "power2.out",
              },
              0.12
            );
          }

          // Full screen expansion on desktop (0.52 -> 1.0)
          if (scrollHint) {
            aftermovieTl.to(
              scrollHint,
              {
                opacity: 0,
                y: 15,
                duration: 0.13,
                ease: "power2.in",
              },
              0.52
            );
          }

          if (menuBtn) {
            aftermovieTl.to(
              menuBtn,
              {
                opacity: 0,
                y: -20,
                duration: 0.16,
                ease: "power2.inOut",
              },
              0.52
            );
          }

          if (aftermovieTitle) {
            aftermovieTl.to(
              aftermovieTitle,
              {
                opacity: 0,
                y: -40,
                scale: 0.95,
                filter: isMobile ? "none" : "blur(8px)",
                duration: 0.3,
                ease: "power2.inOut",
              },
              0.54
            );
          }

          if (leftImg) {
            aftermovieTl.to(
              leftImg,
              {
                x: "-100%",
                opacity: 0,
                duration: 0.3,
                ease: "power2.inOut",
              },
              0.54
            );
          }

          if (rightImg) {
            aftermovieTl.to(
              rightImg,
              {
                x: "100%",
                opacity: 0,
                duration: 0.3,
                ease: "power2.inOut",
              },
              0.54
            );
          }

          aftermovieTl.to(
            mediaCard,
            {
              top: "50%",
              left: "50%",
              xPercent: -50,
              yPercent: -50,
              width: "100vw",
              height: "100vh",
              borderRadius: "0px",
              borderWidth: "0px",
              boxShadow: "none",
              duration: 0.48,
              ease: "power3.inOut",
            },
            0.52
          );

          if (mediaOverlay) {
            aftermovieTl.to(
              mediaOverlay,
              {
                background: "rgba(0, 0, 0, 0.0)",
                duration: 0.35,
                ease: "power2.out",
              },
              0.58
            );
          }
        }
      });

      // MOBILE (< 900px): Pinned Section to allow viewing without skipping through to footer
      mmAftermovie.add("(max-width: 899px)", () => {
        const mobileAftermovieTl = gsap.timeline({
          scrollTrigger: {
            trigger: "#aftermovie-section",
            start: "top top",
            end: "+=1200",
            pin: true,
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        });

        // Smooth streamline color transition
        mobileAftermovieTl.fromTo(
          bgMaterial.uniforms.uWhiteLinesProgress,
          { value: 0.0 },
          { value: 1.0, duration: 0.35, ease: "power2.inOut" },
          0
        );

        // Entrance reveals
        mobileAftermovieTl.fromTo(
          "#aftermovie-title",
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" },
          0.04
        );

        mobileAftermovieTl.fromTo(
          "#aftermovie-media-card",
          { opacity: 0, scale: 0.92, y: 20 },
          { opacity: 1, scale: 1, y: 0, duration: 0.35, ease: "power2.out" },
          0.06
        );

        mobileAftermovieTl.fromTo(
          "#aftermovie-left-img",
          { x: "-100%", opacity: 0 },
          { x: "0%", opacity: 1, duration: 0.35, ease: "power3.out" },
          0.08
        );

        mobileAftermovieTl.fromTo(
          "#aftermovie-right-img",
          { x: "100%", opacity: 0 },
          { x: "0%", opacity: 1, duration: 0.35, ease: "power3.out" },
          0.08
        );

        mobileAftermovieTl.fromTo(
          "#aftermovie-scroll-hint",
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.25, ease: "power2.out" },
          0.15
        );
      });

      // Desktop Video Sound Toggle and Auto-Pause / Auto-Mute Management
      const desktopVideo = document.getElementById("aftermovie-desktop-video");
      const soundBtn = document.getElementById("aftermovie-sound-btn");
      const ytIframe = document.getElementById("aftermovie-yt-iframe");

      function updateSoundBtnUI(isMuted) {
        if (!soundBtn) return;
        const iconMuted = soundBtn.querySelector(".sound-icon-muted");
        const iconUnmuted = soundBtn.querySelector(".sound-icon-unmuted");
        const soundLabel = soundBtn.querySelector(".sound-label");
        if (isMuted) {
          if (iconMuted) iconMuted.style.display = "block";
          if (iconUnmuted) iconUnmuted.style.display = "none";
          if (soundLabel) soundLabel.textContent = "UNMUTE";
        } else {
          if (iconMuted) iconMuted.style.display = "none";
          if (iconUnmuted) iconUnmuted.style.display = "block";
          if (soundLabel) soundLabel.textContent = "MUTE";
        }
      }

      function stopAftermovieAudioAndVideo() {
        // 1. Immediately pause desktop video and reset audio to muted
        if (desktopVideo) {
          desktopVideo.pause();
          desktopVideo.muted = true;
        }
        updateSoundBtnUI(true);

        // 2. Pause YouTube iframe (mobile view) via postMessage
        if (ytIframe && ytIframe.contentWindow) {
          try {
            ytIframe.contentWindow.postMessage(
              JSON.stringify({ event: "command", func: "pauseVideo", args: "" }),
              "*"
            );
          } catch (_) {}
        }
      }

      function startAftermovieVideo() {
        if (desktopVideo && desktopVideo.paused) {
          desktopVideo.play().catch(() => {});
        }
      }

      if (desktopVideo && soundBtn) {
        soundBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          desktopVideo.muted = !desktopVideo.muted;
          updateSoundBtnUI(desktopVideo.muted);
          if (!desktopVideo.muted) {
            desktopVideo.play().catch(() => {});
          }
        });
      }

      // ScrollTrigger: Automatically stops/pauses when scrolling away UP or DOWN past aftermovie
      ScrollTrigger.create({
        trigger: "#aftermovie-section",
        start: "top 95%",
        end: () => {
          const pinExtra = window.innerWidth >= 900 ? 3400 : 1200;
          return `+=${(aftermovieSection ? aftermovieSection.offsetHeight : 800) + pinExtra}`;
        },
        onEnter: () => startAftermovieVideo(),
        onEnterBack: () => startAftermovieVideo(),
        onLeave: () => stopAftermovieAudioAndVideo(),
        onLeaveBack: () => stopAftermovieAudioAndVideo(),
      });

      // IntersectionObserver fallback: verifies element visibility on screen
      if ("IntersectionObserver" in window && aftermovieSection) {
        const aftermovieObserver = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting || entry.intersectionRatio < 0.05) {
                stopAftermovieAudioAndVideo();
              } else if (entry.isIntersecting && entry.intersectionRatio >= 0.1) {
                startAftermovieVideo();
              }
            });
          },
          { threshold: [0, 0.05, 0.1, 0.5] }
        );
        aftermovieObserver.observe(aftermovieSection);
      }

      // Document Visibility Change: automatically pause when switching tabs
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
          stopAftermovieAudioAndVideo();
        } else if (aftermovieSection) {
          const rect = aftermovieSection.getBoundingClientRect();
          if (rect.bottom > 0 && rect.top < window.innerHeight) {
            startAftermovieVideo();
          }
        }
      });
    }
  }

  // -------------------------------------------------------------
  // 11. HERO INTERACTIVE CHARACTER WEBGL RENDERER (#hero-canvas)
  // -------------------------------------------------------------
  const heroCanvas = document.getElementById("hero-canvas");
  const heroRenderer = new THREE.WebGLRenderer({
    canvas: heroCanvas,
    antialias: !isMobile,
    alpha: true,
    precision: isMobile ? "mediump" : "highp",
    powerPreference: "high-performance",
  });
  heroRenderer.setSize(window.innerWidth, window.innerHeight);
  heroRenderer.setPixelRatio(getOptimalDpr());

  const heroScene = new THREE.Scene();
  const heroCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 10);
  heroCamera.position.z = 1;

  const clock = new THREE.Clock();

  // User mouse tracking
  const targetMouse = new THREE.Vector2(0.5, 0.5);
  const userMouse = new THREE.Vector2(0.5, 0.5);
  const userPrevMouse = new THREE.Vector2(0.5, 0.5);
  let userIsMoving = false;
  let lastUserMoveTime = 0;
  let userInteracted = false;
  let firstMove = true;

  // Auto-stroke tracking (3 equal-gap strokes: Eyes -> Lower Neck -> Bottom Chest)
  const autoMouse = new THREE.Vector2(0.26, 0.63);
  const autoPrevMouse = new THREE.Vector2(0.26, 0.63);
  let autoIsMoving = false;
  let autoStrokeActive = true;
  let autoStrokeStartTime = performance.now() + 300;
  const autoStrokeDuration = 2050; // ms
  let lastAutoStrokeEndTime = performance.now() + 300 + 2050;
  const AUTO_INTERVAL = 4000; // repeats every 4s

  function getAutoStrokePosition(progress) {
    const y = 0.63 - progress * 0.49;
    const angle = progress * Math.PI * 3;
    const x = 0.5 - Math.cos(angle) * 0.24;
    return { x, y };
  }

  // Ping-Pong Render Targets for Fluid Simulation
  const size = isMobile ? 256 : 512;
  const pingPongTargets = [
    new THREE.WebGLRenderTarget(size, size, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      type: THREE.HalfFloatType,
    }),
    new THREE.WebGLRenderTarget(size, size, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      type: THREE.HalfFloatType,
    }),
  ];
  let currentTarget = 0;

  const topTexture = createPlaceholderTexture("#111114");
  const bottomTexture = createPlaceholderTexture("#1e1e24");

  const topTextureSize = new THREE.Vector2(1, 1);
  const bottomTextureSize = new THREE.Vector2(1, 1);

  const trailsMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uPrevTrails: { value: null },
      uMouse: { value: userMouse },
      uPrevMouse: { value: userPrevMouse },
      uIsMoving: { value: false },
      uAutoMouse: { value: autoMouse },
      uAutoPrevMouse: { value: autoPrevMouse },
      uAutoIsMoving: { value: false },
      uResolution: { value: new THREE.Vector2(size, size) },
      uDecay: { value: 0.915 },
    },
    vertexShader,
    fragmentShader: fluidFragmentShader,
  });

  const displayMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uFluid: { value: null },
      uTopTexture: { value: topTexture },
      uBottomTexture: { value: bottomTexture },
      uResolution: {
        value: new THREE.Vector2(window.innerWidth, window.innerHeight),
      },
      uDpr: { value: Math.min(window.devicePixelRatio, 2) },
      uTopTextureSize: { value: topTextureSize },
      uBottomTextureSize: { value: bottomTextureSize },
      uMouse: { value: userMouse },
      uTime: { value: 0 },
    },
    vertexShader,
    fragmentShader: displayFragmentShader,
    transparent: true,
  });

  loadImage("/portrait_top.png", topTexture, topTextureSize);
  loadImage("/portrait_bottom.png", bottomTexture, bottomTextureSize);

  const displayMesh = new THREE.Mesh(quadGeom, displayMaterial);
  heroScene.add(displayMesh);

  const simMesh = new THREE.Mesh(quadGeom, trailsMaterial);
  const simScene = new THREE.Scene();
  simScene.add(simMesh);

  heroRenderer.setRenderTarget(pingPongTargets[0]);
  heroRenderer.clear();
  heroRenderer.setRenderTarget(pingPongTargets[1]);
  heroRenderer.clear();
  heroRenderer.setRenderTarget(null);

  // Pointer & Window Events
  window.addEventListener("mousemove", onMouseMove, { passive: true });
  window.addEventListener("mouseenter", onMouseEnter, { passive: true });
  window.addEventListener("mouseleave", onMouseLeave, { passive: true });
  window.addEventListener("touchmove", onTouchMove, { passive: true });
  window.addEventListener("touchstart", onTouchStart, { passive: true });
  window.addEventListener("resize", onWindowResize);

  // -------------------------------------------------------------
  // VIEWPORT CULLING & VISIBILITY GATING (MOBILE OPTIMIZATION)
  // -------------------------------------------------------------
  let isHeroVisible = true;
  let isDomainsVisible = false;
  let isGlimpsesVisible = false;
  let isTabVisible = !document.hidden;

  document.addEventListener("visibilitychange", () => {
    isTabVisible = !document.hidden;
  });

  const heroScrollSectionEl = document.getElementById("hero-scroll-section");
  const domainsScrollSectionEl = document.getElementById("domains-scroll-section");
  const glimpsesSectionEl = document.getElementById("glimpses-section");

  if ("IntersectionObserver" in window) {
    const heroObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isHeroVisible = entry.isIntersecting;
        });
      },
      { rootMargin: "300px 0px 300px 0px" }
    );
    if (heroScrollSectionEl) heroObserver.observe(heroScrollSectionEl);

    const domainsObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isDomainsVisible = entry.isIntersecting;
          // Automatically pause/play videos to save mobile GPU/CPU video decoding
          domainVideoElements.forEach((vid) => {
            if (entry.isIntersecting) {
              if (vid.paused) vid.play().catch(() => {});
            } else {
              if (!vid.paused) vid.pause();
            }
          });
        });
      },
      { rootMargin: "300px 0px 300px 0px" }
    );
    if (domainsScrollSectionEl) domainsObserver.observe(domainsScrollSectionEl);

    const glimpsesObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isGlimpsesVisible = entry.isIntersecting;
        });
      },
      { rootMargin: "300px 0px 300px 0px" }
    );
    if (glimpsesSectionEl) glimpsesObserver.observe(glimpsesSectionEl);
  }

  animate();

  function createPlaceholderTexture(color) {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 512;
    const ctx = c.getContext("2d");
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 512, 512);

    const texture = new THREE.CanvasTexture(c);
    texture.minFilter = THREE.LinearFilter;
    return texture;
  }

  function loadImage(url, targetTexture, textureSizeVector) {
    loadingManager.itemStart(url);
    const img = new Image();
    img.crossOrigin = "Anonymous";

    img.onload = function () {
      const originalWidth = img.width;
      const originalHeight = img.height;
      textureSizeVector.set(originalWidth, originalHeight);

      const maxSize = 4096;
      let newWidth = originalWidth;
      let newHeight = originalHeight;

      if (originalWidth > maxSize || originalHeight > maxSize) {
        if (originalWidth > originalHeight) {
          newWidth = maxSize;
          newHeight = Math.floor(originalHeight * (maxSize / originalWidth));
        } else {
          newHeight = maxSize;
          newWidth = Math.floor(originalWidth * (maxSize / originalHeight));
        }
      }

      const c = document.createElement("canvas");
      c.width = newWidth;
      c.height = newHeight;
      const ctx = c.getContext("2d");
      ctx.drawImage(img, 0, 0, newWidth, newHeight);

      const newTexture = new THREE.CanvasTexture(c);
      newTexture.minFilter = THREE.LinearFilter;
      newTexture.magFilter = THREE.LinearFilter;

      if (url.includes("top")) {
        displayMaterial.uniforms.uTopTexture.value = newTexture;
      } else {
        displayMaterial.uniforms.uBottomTexture.value = newTexture;
      }

      loadingManager.itemEnd(url);
    };

    img.onerror = function (err) {
      console.error(`Error loading image ${url}:`, err);
      loadingManager.itemEnd(url);
    };

    img.src = url;
  }

  function updatePointerPosition(clientX, clientY) {
    const canvasRect = heroCanvas.getBoundingClientRect();
    if (
      clientX >= canvasRect.left &&
      clientX <= canvasRect.right &&
      clientY >= canvasRect.top &&
      clientY <= canvasRect.bottom
    ) {
      const posX = (clientX - canvasRect.left) / canvasRect.width;
      const posY = 1 - (clientY - canvasRect.top) / canvasRect.height;
      const now = performance.now();

      if (firstMove || now - lastUserMoveTime > 1500) {
        userMouse.set(posX, posY);
        userPrevMouse.set(posX, posY);
        targetMouse.set(posX, posY);
        userIsMoving = false;
        firstMove = false;
      } else {
        userPrevMouse.copy(userMouse);
        targetMouse.set(posX, posY);
        userIsMoving = true;
      }

      userInteracted = true;
      lastUserMoveTime = now;
    }
  }

  function onMouseMove(event) {
    updatePointerPosition(event.clientX, event.clientY);
  }

  function onMouseEnter(event) {
    firstMove = true;
    updatePointerPosition(event.clientX, event.clientY);
  }

  function onMouseLeave() {
    userIsMoving = false;
    firstMove = true;
  }

  function onTouchStart(event) {
    firstMove = true;
    if (event.touches.length > 0) {
      updatePointerPosition(event.touches[0].clientX, event.touches[0].clientY);
    }
  }

  function onTouchMove(event) {
    if (event.touches.length > 0) {
      updatePointerPosition(event.touches[0].clientX, event.touches[0].clientY);
    }
  }

  function onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const dpr = getOptimalDpr();

    bgRenderer.setSize(width, height);
    bgRenderer.setPixelRatio(dpr);
    bgMaterial.uniforms.uResolution.value.set(width, height);

    heroRenderer.setSize(width, height);
    heroRenderer.setPixelRatio(dpr);
    displayMaterial.uniforms.uResolution.value.set(width, height);
    displayMaterial.uniforms.uDpr.value = dpr;

    carouselRenderer.setSize(width, height);
    carouselRenderer.setPixelRatio(dpr);
    carouselCamera.aspect = width / height;
    carouselCamera.updateProjectionMatrix();

    if (domainsRenderer && domainsCamera) {
      domainsRenderer.setSize(width, height);
      domainsRenderer.setPixelRatio(dpr);
      domainsCamera.aspect = width / height;
      domainsCamera.updateProjectionMatrix();
      updateDomainsCarousel(domainState.progress);
    }

    if (glimpsesRenderer && glimpsesCamera) {
      glimpsesRenderer.setSize(width, height);
      glimpsesRenderer.setPixelRatio(dpr);
      glimpsesCamera.aspect = width / height;
      glimpsesCamera.updateProjectionMatrix();
      const scale = Math.min(1, width / 1400);
      if (glimpsesSpiralGroup) {
        glimpsesSpiralGroup.scale.setScalar(Math.max(0.78, scale));
      }
    }

    updateCurvedCarousel(spiralState.progress);
    ScrollTrigger.refresh();
  }

  // -------------------------------------------------------------
  // 7. ANIMATION LOOP
  // -------------------------------------------------------------
  function animate() {
    requestAnimationFrame(animate);

    // Freeze render loop when tab/browser is minimized/hidden
    if (!isTabVisible) return;

    const elapsedTime = clock.getElapsedTime();
    const now = performance.now();

    // 1. AUTO-STROKE ENGINE (Runs every 4s, no snapping)
    if (!autoStrokeActive && now - lastAutoStrokeEndTime >= AUTO_INTERVAL) {
      autoStrokeActive = true;
      autoStrokeStartTime = now;
      const initialPos = getAutoStrokePosition(0.0);
      autoMouse.set(initialPos.x, initialPos.y);
      autoPrevMouse.set(initialPos.x, initialPos.y);
      autoIsMoving = false;
    }

    if (autoStrokeActive && now >= autoStrokeStartTime) {
      const elapsed = now - autoStrokeStartTime;
      const progress = Math.min(elapsed / autoStrokeDuration, 1.0);

      const pos = getAutoStrokePosition(progress);
      autoPrevMouse.copy(autoMouse);
      autoMouse.set(pos.x, pos.y);
      autoIsMoving = true;

      if (progress >= 1.0) {
        autoStrokeActive = false;
        autoIsMoving = false;
        lastAutoStrokeEndTime = now;
      }
    } else {
      autoIsMoving = false;
    }

    // 2. USER MOUSE INTERACTION & 3D PARALLAX
    if (!userInteracted) {
      const idleOffset = Math.sin(elapsedTime * 0.8) * 0.035;
      const idleOffsetY = Math.cos(elapsedTime * 0.6) * 0.025;
      targetMouse.x = 0.5 + idleOffset;
      targetMouse.y = 0.5 + idleOffsetY;
    }

    userPrevMouse.copy(userMouse);
    userMouse.x += (targetMouse.x - userMouse.x) * 0.16;
    userMouse.y += (targetMouse.y - userMouse.y) * 0.16;

    if (userIsMoving && now - lastUserMoveTime > 60) {
      userIsMoving = false;
    }

    sharedMouse.copy(userMouse);

    // 3. 3D RAYCASTER HOVER INTERACTION ON CURVED MESHES (Desktop cursor only)
    if (isHeroVisible && !isMobile && userInteracted) {
      raycaster.setFromCamera(ndcMouse, carouselCamera);
      const intersects = raycaster.intersectObjects(cardMeshes);

      if (intersects.length > 0) {
        hoveredIndex = intersects[0].object.userData.index;
      } else {
        hoveredIndex = -1;
      }
    } else {
      hoveredIndex = -1;
    }

    if (isHeroVisible) {
      // Smooth hover interpolation for all card states
      for (let i = 0; i < totalCards; i++) {
        const state = cardStates[i];
        const targetScale = i === hoveredIndex ? 1.08 : 1.0;
        const targetOffsetZ = i === hoveredIndex ? 0.35 : 0.0;

        state.hoverScale += (targetScale - state.hoverScale) * 0.18;
        state.hoverOffsetZ += (targetOffsetZ - state.hoverOffsetZ) * 0.18;
      }

      updateCurvedCarousel(spiralState.progress);

      // Subtle 3D mouse parallax on carousel scene
      carouselScene.rotation.y = (userMouse.x - 0.5) * 0.06;
      carouselScene.rotation.x = -(userMouse.y - 0.5) * 0.04;
    }

    // 4. RENDER GLOBAL BACKGROUND (#bg-canvas)
    bgMaterial.uniforms.uTime.value = elapsedTime;
    bgMaterial.uniforms.uMouse.value.copy(sharedMouse);
    bgRenderer.render(bgScene, bgCamera);

    // 5. RENDER FLUID PING-PONG PASS & HERO SCENE (#hero-canvas & #carousel-canvas)
    if (isHeroVisible) {
      const prevTarget = pingPongTargets[currentTarget];
      currentTarget = (currentTarget + 1) % 2;
      const currentRenderTarget = pingPongTargets[currentTarget];

      trailsMaterial.uniforms.uPrevTrails.value = prevTarget.texture;
      trailsMaterial.uniforms.uMouse.value.copy(userMouse);
      trailsMaterial.uniforms.uPrevMouse.value.copy(userPrevMouse);
      trailsMaterial.uniforms.uIsMoving.value = userIsMoving;
      trailsMaterial.uniforms.uAutoMouse.value.copy(autoMouse);
      trailsMaterial.uniforms.uAutoPrevMouse.value.copy(autoPrevMouse);
      trailsMaterial.uniforms.uAutoIsMoving.value = autoIsMoving;

      heroRenderer.setRenderTarget(currentRenderTarget);
      heroRenderer.render(simScene, heroCamera);

      // 6. RENDER HERO CHARACTER PASS (#hero-canvas)
      displayMaterial.uniforms.uFluid.value = currentRenderTarget.texture;
      displayMaterial.uniforms.uMouse.value.copy(userMouse);
      displayMaterial.uniforms.uTime.value = elapsedTime;

      displayMesh.rotation.y = (userMouse.x - 0.5) * 0.035;
      displayMesh.rotation.x = -(userMouse.y - 0.5) * 0.035;

      heroRenderer.setRenderTarget(null);
      heroRenderer.render(heroScene, heroCamera);

      // 7. RENDER 3D CURVED CAROUSEL PASS (#carousel-canvas)
      carouselRenderer.render(carouselScene, carouselCamera);
    }

    // 8. RENDER 3D DOMAINS CAROUSEL PASS (#domains-canvas)
    if (isDomainsVisible && domainsRenderer && domainsScene && domainsCamera) {
      domainMouse.x += (targetDomainMouse.x - domainMouse.x) * 0.08;
      domainMouse.y += (targetDomainMouse.y - domainMouse.y) * 0.08;
      updateDomainsCarousel(domainState.progress);
      domainsRenderer.render(domainsScene, domainsCamera);
    }

    // 9. RENDER 3D GLIMPSES SPIRAL VORTEX & FREEFALLING PASS (#glimpses-canvas)
    if (isGlimpsesVisible && glimpsesRenderer && glimpsesScene && glimpsesCamera && glimpsesSpiralGroup) {
      glimpsesState.progress += (glimpsesState.targetProgress - glimpsesState.progress) * 0.12;

      // Faster continuous ambient auto-rotation + scroll-driven spin
      glimpsesSpiralGroup.rotation.y += GLIMPSES_CONFIG.baseRotationSpeed;
      glimpsesSpiralGroup.rotation.y += (glimpsesState.targetProgress - glimpsesState.progress) * 0.14;

      // Camera & Character vertical travel (Starts high above -> dives inside -> exits below)
      const camStartY = 1.0;
      const camEndY = -glimpsesHeight - 2.5;
      const targetCamY = camStartY + glimpsesState.progress * (camEndY - camStartY);

      glimpsesCamera.position.y += (targetCamY - glimpsesCamera.position.y) * GLIMPSES_CONFIG.cameraSmoothing;
      glimpsesCamera.position.x = domainMouse.x * 0.45;
      glimpsesCamera.position.z = GLIMPSES_CONFIG.cameraZ - domainMouse.y * 0.35;

      // 3D Freefalling Character: starts high above spiral with ample space, dives through center, exits out bottom
      if (glimpsesCharacterGroup) {
        const charStartY = 2.4;
        const charEndY = -glimpsesHeight - 14.0;
        const charBaseY = charStartY + glimpsesState.progress * (charEndY - charStartY);

        // Dynamic roll banking (Z) with subtle pitch/yaw to keep 3D volume without paper-thin flattening
        const wobbleZ = (Math.sin(elapsedTime * 3.0 + glimpsesState.progress * 8.0) * 8.0) * (Math.PI / 180);
        const wobbleX = (Math.cos(elapsedTime * 2.0 + glimpsesState.progress * 4.0) * 1.8) * (Math.PI / 180);
        const wobbleY = (Math.sin(elapsedTime * 1.8 + glimpsesState.progress * 4.0) * 2.2) * (Math.PI / 180);
        const driftX = domainMouse.x * 0.65;
        const driftY = -domainMouse.y * 0.45;
        const breathScale = 1.0 + Math.sin(elapsedTime * 2.6) * 0.035;

        // Character exits downward and fades out as user reaches end of glimpses
        const charFade = Math.max(1.0 - Math.max(0, glimpsesState.progress - 0.75) * 4.0, 0.0);

        glimpsesCharacterGroup.position.x = driftX;
        glimpsesCharacterGroup.position.y = charBaseY + driftY;
        glimpsesCharacterGroup.position.z = 0;

        glimpsesCharacterGroup.rotation.z = wobbleZ;
        glimpsesCharacterGroup.rotation.x = wobbleX;
        glimpsesCharacterGroup.rotation.y = wobbleY;
        glimpsesCharacterGroup.scale.setScalar(breathScale * charFade);
      }

      // Title moves upwards on scroll while the character dives downwards
      const glimpsesHeader = document.querySelector(".glimpses-header-container");
      if (glimpsesHeader) {
        const headerOpacity = Math.max(1.0 - glimpsesState.progress * 2.8, 0.0);
        const headerY = -glimpsesState.progress * 130;
        glimpsesHeader.style.opacity = headerOpacity;
        glimpsesHeader.style.transform = `translateX(-50%) translateY(${headerY}px)`;
      }

      const glimpsesCounter = document.getElementById("glimpses-counter");
      if (glimpsesCounter) {
        const depthMeters = Math.round(glimpsesState.progress * 280);
        glimpsesCounter.textContent = `DEPTH: ${depthMeters}M / FREEFALL ARCHIVES`;
      }

      glimpsesRenderer.render(glimpsesScene, glimpsesCamera);
    }
  }

  // -------------------------------------------------------------
  // 10. GSAP EXPANDING CIRCLE PAGE TRANSITION FOR "REGISTER NOW"
  // -------------------------------------------------------------
  const transitionOverlay = document.getElementById("page-transition-overlay");
  const registerBtns = document.querySelectorAll(".domains-cta-btn, a[href='/events'], a[href='/events/'], a[href='/events.html'], a[href='events.html']");

  registerBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const targetUrl = btn.getAttribute("href") || "/events";
      const rect = btn.getBoundingClientRect();
      const clickX = e.clientX || rect.left + rect.width / 2;
      const clickY = e.clientY || rect.top + rect.height / 2;

      try {
        sessionStorage.setItem("return_to_domains", "true");
        sessionStorage.setItem(
          "innov8_transition_origin",
          JSON.stringify({ x: clickX, y: clickY })
        );
      } catch (err) {
        // fallback
      }

      window.location.href = targetUrl;
    });
  });

  // -------------------------------------------------------------
  // 13. SECTION 6: INNOV8 FOOTER KINETIC TYPOGRAPHY & ENTRANCE
  // -------------------------------------------------------------
  const footerLinks = document.querySelectorAll(".footer-link-pill");
  footerLinks.forEach((link) => {
    const wrap = link.querySelector(".footer-link-wrap");
    const rawText = (link.getAttribute("data-text") || (wrap ? wrap.textContent : "")).trim().toUpperCase();

    if (wrap) {
      wrap.innerHTML = rawText
        .split("")
        .map(
          (char) => `
          <span class="footer-char-box">
            <span class="footer-char footer-char-main">${char === " " ? "&nbsp;" : char}</span>
            <span class="footer-char footer-char-clone">${char === " " ? "&nbsp;" : char}</span>
          </span>
        `
        )
        .join("");

      const charMains = wrap.querySelectorAll(".footer-char-main");
      const charClones = wrap.querySelectorAll(".footer-char-clone");

      link.addEventListener("mouseenter", () => {
        gsap.killTweensOf(charMains);
        gsap.killTweensOf(charClones);

        gsap.to(charMains, {
          yPercent: -100,
          duration: 0.35,
          stagger: 0.02,
          ease: "power2.out",
        });

        gsap.to(charClones, {
          yPercent: -100,
          duration: 0.35,
          stagger: 0.02,
          ease: "power2.out",
        });
      });

      link.addEventListener("mouseleave", () => {
        gsap.killTweensOf(charMains);
        gsap.killTweensOf(charClones);

        gsap.to(charMains, {
          yPercent: 0,
          duration: 0.3,
          stagger: 0.016,
          ease: "power2.out",
        });

        gsap.to(charClones, {
          yPercent: 0,
          duration: 0.3,
          stagger: 0.016,
          ease: "power2.out",
        });
      });
    }
  });

  // Footer subtle scroll entrance animation & Block Wipe Tagline Reveal
  const footerCard = document.getElementById("footer-card");
  const footerNotchLogo = document.getElementById("footer-notch-logo-container");
  const footerStrip1 = document.getElementById("footer-strip-1");
  const footerStrip2 = document.getElementById("footer-strip-2");
  const footerLine1 = document.getElementById("footer-tagline-line1");
  const footerLine2 = document.getElementById("footer-tagline-line2");
  const footerCharImg = document.querySelector(".footer-character-img");

  // Smoothly hide global fixed header logo & mobile menu button when entering footer and restore when leaving
  ScrollTrigger.create({
    trigger: "#site-footer",
    start: "top 75%",
    onEnter: () => {
      gsap.to("#logo-anchor", { opacity: 0, y: -20, pointerEvents: "none", duration: 0.35, ease: "power2.out" });
      if (window.innerWidth < 900) {
        gsap.to(".menu", { opacity: 0, y: -20, pointerEvents: "none", duration: 0.35, ease: "power2.out" });
      }
    },
    onLeaveBack: () => {
      gsap.to("#logo-anchor", { opacity: 1, y: 0, pointerEvents: "auto", duration: 0.35, ease: "power2.out" });
      if (window.innerWidth < 900) {
        gsap.to(".menu", { opacity: 1, y: 0, pointerEvents: "auto", duration: 0.35, ease: "power2.out" });
      }
    },
  });

  if (footerCard) {
    const footerTl = gsap.timeline({
      scrollTrigger: {
        trigger: "#site-footer",
        start: "top 78%",
        toggleActions: "play none none reverse",
      },
    });

    // 1. Footer Card scale and rise
    footerTl.fromTo(
      footerCard,
      { scale: 0.95, opacity: 0.7, y: 35 },
      { scale: 1.0, opacity: 1.0, y: 0, duration: 0.8, ease: "power2.out" },
      0
    );

    // 1b. In-Footer Notch Logo appears smoothly in the crown tab
    if (footerNotchLogo) {
      footerTl.fromTo(
        footerNotchLogo,
        { opacity: 0, y: -15, scale: 0.88 },
        { opacity: 1, y: 0, scale: 1.0, duration: 0.6, ease: "power2.out" },
        0.15
      );
    }

    // 2. Character visual smooth entrance
    if (footerCharImg) {
      footerTl.fromTo(
        footerCharImg,
        { y: 40, opacity: 0.3 },
        { y: 0, opacity: 1, duration: 0.85, ease: "power3.out" },
        0.1
      );
    }

    // 3. Line 1 "WHERE TECH" block reveal (strip expands from left, text appears, strip slides off to right)
    if (footerStrip1 && footerLine1) {
      footerTl.fromTo(
        footerStrip1,
        { left: "0%", width: "0%" },
        { left: "0%", width: "100%", duration: 0.36, ease: "power2.inOut" },
        0.28
      );
      footerTl.set(footerLine1, { opacity: 1 }, 0.62);
      footerTl.to(
        footerStrip1,
        { left: "100%", width: "0%", duration: 0.34, ease: "power2.inOut" },
        0.64
      );
    }

    // 4. Line 2 "MEETS THRILL" block reveal
    if (footerStrip2 && footerLine2) {
      footerTl.fromTo(
        footerStrip2,
        { left: "0%", width: "0%" },
        { left: "0%", width: "100%", duration: 0.36, ease: "power2.inOut" },
        0.44
      );
      footerTl.set(footerLine2, { opacity: 1 }, 0.78);
      footerTl.to(
        footerStrip2,
        { left: "100%", width: "0%", duration: 0.34, ease: "power2.inOut" },
        0.80
      );
    }
  }

  // -------------------------------------------------------------
  // 14. BROWSER BACK / PAGESHOW RETURN HANDLER
  // -------------------------------------------------------------
  const handleReturnToDomains = () => {
    const overlay = document.getElementById("page-transition-overlay");
    if (overlay) {
      overlay.style.pointerEvents = "none";
      gsap.set(overlay, { clipPath: "circle(0% at 50% 50%)", opacity: 0 });
    }

    const shouldReturn =
      sessionStorage.getItem("return_to_domains") === "true" ||
      window.location.hash === "#domains-scroll-section" ||
      window.location.hash === "#domains-section";

    if (shouldReturn) {
      sessionStorage.removeItem("return_to_domains");
      setTimeout(() => {
        const domainsEl = document.getElementById("domains-scroll-section");
        if (domainsEl && lenis) {
          lenis.scrollTo(domainsEl, { immediate: true, offset: 0 });
          ScrollTrigger.refresh();
        }
      }, 100);
    } else if (window.location.hash) {
      setTimeout(() => {
        const targetEl = document.querySelector(window.location.hash);
        if (targetEl && lenis) {
          lenis.scrollTo(targetEl, { immediate: true, offset: 0 });
          ScrollTrigger.refresh();
        }
      }, 100);
    }
  };

  handleReturnToDomains();
  window.addEventListener("pageshow", handleReturnToDomains);
  window.addEventListener("popstate", handleReturnToDomains);

  // -------------------------------------------------------------
  // 15. FULLSCREEN WEARECASEY INTERACTIVE MENU OVERLAY
  // -------------------------------------------------------------
  const fullscreenMenu = document.getElementById("fullscreen-menu");
  const menuBg = document.querySelector(".menu-bg");
  const menuItems = document.querySelectorAll(".fullscreen-menu .menu-item");
  const menuBtn = document.getElementById("menu-btn") || document.querySelector(".menu");
  const menuBtnLabel = document.getElementById("menu-btn-label") || (menuBtn ? menuBtn.querySelector("p") : null);

  // Initialize split animation structures
  const menuAnimItems = [...menuItems].map((item) => {
    const indexEl = item.querySelector(".item-index");
    const labelEl = item.querySelector(".item-label");
    const dividerEl = item.querySelector(".item-divider");

    const indexText = (indexEl ? indexEl.textContent : "").trim();
    const labelText = (labelEl ? labelEl.textContent : "").trim();

    // 1. Index Word Wrap
    if (indexEl) {
      indexEl.innerHTML = `<span class="item-index-inner" style="display:inline-block; overflow:hidden;"><span class="index-word" style="display:inline-block;">${indexText}</span></span>`;
    }
    const indexWord = indexEl ? indexEl.querySelector(".index-word") : null;

    // 2. Character Split with Overflow Mask
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
    gsap.set(dividerEl, { scaleY: 0 });

    return { indexWord, firstChar, trailingChars, trailingCharBox, divider: dividerEl, item };
  });

  function flickerTextTo(element, text) {
    if (!element) return;
    element.innerHTML = text
      .split("")
      .map((char) => `<span class="flicker-char" style="display:inline-block; opacity:0;">${char}</span>`)
      .join("");
    const chars = element.querySelectorAll(".flicker-char");
    gsap.to(chars, {
      opacity: 1,
      duration: 0.05,
      ease: "power2.inOut",
      overwrite: true,
      stagger: { amount: 0.24, from: "random" },
    });
  }

  const menuTimeline = gsap.timeline({
    paused: true,
    defaults: { ease: "power3.out" },
    onReverseComplete: () => {
      if (fullscreenMenu) {
        fullscreenMenu.classList.remove("is-menu-open");
        fullscreenMenu.setAttribute("aria-hidden", "true");
      }
    },
  });
  let isMenuOpen = false;

  menuTimeline.to(menuBg, { opacity: 1, duration: 0.6 }, 0);

  menuAnimItems.forEach(({ indexWord, firstChar, trailingChars, trailingCharBox, divider }, i) => {
    const startTime = 0.3 + i * 0.1;

    if (indexWord && firstChar) {
      menuTimeline.to([indexWord, firstChar], { yPercent: 0, duration: 0.6 }, startTime);
    }
    if (divider) {
      menuTimeline.to(divider, { scaleY: 1, duration: 0.75, ease: "power3.out" }, startTime + 0.05);
    }
    if (trailingCharBox) {
      menuTimeline.to(
        trailingCharBox,
        {
          width: () => trailingCharBox.scrollWidth,
          duration: 0.75,
          ease: "power4.inOut",
        },
        startTime + 0.15
      );
    }
    if (trailingChars.length > 0) {
      menuTimeline.to(
        trailingChars,
        { xPercent: 0, duration: 0.6, stagger: 0.03 },
        startTime + 0.3
      );
    }
  });

  const toggleMenu = () => {
    isMenuOpen = !isMenuOpen;

    if (isMenuOpen) {
      if (fullscreenMenu) {
        fullscreenMenu.classList.add("is-menu-open");
        fullscreenMenu.setAttribute("aria-hidden", "false");
      }
      menuBtn?.classList.add("menu-active");
      menuTimeline.timeScale(1).play();
    } else {
      menuBtn?.classList.remove("menu-active");
      menuTimeline.timeScale(1.4).reverse();
    }
  };

  if (menuBtn) {
    menuBtn.addEventListener("click", toggleMenu);
    menuBtn.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleMenu();
      }
    });
  }

  // Smooth scroll and navigation handling for menu items
  menuItems.forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");
      if (href && href.startsWith("#")) {
        e.preventDefault();
        if (isMenuOpen) toggleMenu();

        setTimeout(() => {
          const targetEl = document.querySelector(href);
          if (targetEl && lenis) {
            lenis.scrollTo(targetEl, { offset: 0, duration: 1.5 });
          }
        }, 300);
      } else if (href === "/") {
        if (window.location.pathname === "/" || window.location.pathname.endsWith("index.html") || window.location.pathname === "") {
          e.preventDefault();
          if (isMenuOpen) toggleMenu();
          try {
            sessionStorage.removeItem("return_to_domains");
          } catch (_) {}
          setTimeout(() => {
            if (lenis) lenis.scrollTo(0, { duration: 1.5 });
          }, 300);
        }
      }
    });
  });

  // Close on Escape key
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isMenuOpen) {
      toggleMenu();
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}


