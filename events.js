import * as THREE from "three";
import gsap from "gsap";
import { vertexShader, bgFragmentShader } from "./shaders.js";

// =============================================================
// EVENTS DIRECTORY DATA WITH RULES & METADATA
// =============================================================
const EVENTS_DATA = [
  // SOFTWARE
  {
    id: "inno-hack",
    title: "INNO-HACK 2026",
    subtitle: "36-HOUR AI & WEB3 HACKATHON",
    category: "software",
    categoryLabel: "SOFTWARE // TRACK 01",
    image: "/img1.png",
    description:
      "Build cutting-edge decentralized applications, generative AI workflows, and neural interfaces in a high-intensity 36-hour sprint with global mentors and industry judges.",
    teamSize: "2 - 4 MEMBERS",
    prize: "₹1,50,000",
    venue: "INNO-HUB / LAB 4",
    rules: [
      "Teams must consist of 2 to 4 registered participants.",
      "All code, design assets, and smart contracts must be written during the 36-hour hackathon window.",
      "Pre-existing public libraries, open-source APIs, and AI models are permitted with proper attribution.",
      "Final submissions must include a working demo, public GitHub repository, and 3-minute pitch deck.",
      "Plagiarism or pre-built proprietary code results in immediate disqualification.",
    ],
  },
  {
    id: "code-sprint",
    title: "CODE SPRINT",
    subtitle: "HIGH-SPEED ALGORITHMIC COMBAT",
    category: "software",
    categoryLabel: "SOFTWARE // TRACK 02",
    image: "/orbit-01.jpg",
    description:
      "Battle through multi-tiered competitive algorithmic challenges, complex data structures, and optimized mathematical heuristics under intense time pressure.",
    teamSize: "SOLO",
    prize: "₹50,000",
    venue: "COMPUTE HALL A",
    rules: [
      "Individual participation only (Solo competition).",
      "Languages permitted: C++, Python 3, Java, Rust, Go.",
      "Automated test cases evaluate runtime complexity and memory limits.",
      "Submissions are tested against hidden edge-case test suites with penalty time for incorrect attempts.",
      "Use of external AI code generation assistants during contest rounds is strictly prohibited.",
    ],
  },
  {
    id: "byte-blitz",
    title: "BYTE BLITZ",
    subtitle: "DEV RELAY & BUG HUNT SHOWDOWN",
    category: "software",
    categoryLabel: "SOFTWARE // TRACK 03",
    image: "/orbit-02.jpg",
    description:
      "Team-based reverse engineering, live vulnerability assessment, and collaborative code relay across dynamic microservice architectures under simulated outages.",
    teamSize: "3 MEMBERS",
    prize: "₹40,000",
    venue: "CYBER LAB 2",
    rules: [
      "Teams must consist of exactly 3 members in a relay rotation format.",
      "Members rotate active keyboard control every 15 minutes; non-active members may not touch input devices.",
      "Fix security exploits and race conditions across simulated live cloud infrastructure.",
      "Points awarded for patch verification speed, test coverage, and continuous uptime.",
    ],
  },
  {
    id: "devcon-matrix",
    title: "DEVCON MATRIX",
    subtitle: "NEXT-GEN SYSTEM ARCHITECTURE",
    category: "software",
    categoryLabel: "SOFTWARE // TRACK 04",
    image: "/orbit-03.jpg",
    description:
      "Architect scalable distributed backends, high-throughput message brokers, and zero-trust security pipelines for mission-critical enterprise systems.",
    teamSize: "2 MEMBERS",
    prize: "₹45,000",
    venue: "SERVER SUITE 1",
    rules: [
      "Teams of 2 members.",
      "Deliver architectural schematics, data flow diagrams, and load-tested proof of concept.",
      "Architectures will be tested against automated DDoS simulations and database partition scenarios.",
      "Judged on scalability, fault-tolerance, cost efficiency, and latency optimization.",
    ],
  },

  // HARDWARE
  {
    id: "robo-wars",
    title: "ROBO WARS",
    subtitle: "HEAVYWEIGHT COMBAT ROBOTICS",
    category: "hardware",
    categoryLabel: "HARDWARE // TRACK 01",
    image: "/img2.jpeg",
    description:
      "Custom-engineered combat robots clash in a high-octane reinforced arena with high-RPM kinetic spinners, pneumatic flippers, and armored chassis.",
    teamSize: "3 - 5 MEMBERS",
    prize: "₹1,00,000",
    venue: "ARENA MATRIX",
    rules: [
      "Robot weight class: Maximum 30 kg (combat category) or 15 kg (featherweight).",
      "Weapon safety lockouts and active failsafe kill switches are mandatory prior to arena entry.",
      "Match duration: 3 minutes of combat; judges score aggression, damage, and control.",
      "Untethered projectiles, chemical liquids, and radio frequency jammers are strictly banned.",
    ],
  },
  {
    id: "circuit-craft",
    title: "CIRCUIT CRAFT",
    subtitle: "EMBEDDED SYSTEMS & IOT CHALLENGE",
    category: "hardware",
    categoryLabel: "HARDWARE // TRACK 02",
    image: "/orbit-04.jpg",
    description:
      "Design, solder, and deploy custom PCB microcontrollers and sensor telemetry clusters for real-world automated industrial applications.",
    teamSize: "2 MEMBERS",
    prize: "₹35,000",
    venue: "CIRCUIT LAB B",
    rules: [
      "Teams of 2 members.",
      "All schematic capture, component selection, and soldering must be completed within 4 hours.",
      "Standard microcontrollers provided on-site (ESP32 / STM32 / Arduino).",
      "Functionality, power consumption efficiency, and signal clarity determine final scores.",
    ],
  },
  {
    id: "drone-prix",
    title: "DRONE PRIX",
    subtitle: "FPV HIGH-OCTANE AERIAL RACE",
    category: "hardware",
    categoryLabel: "HARDWARE // TRACK 03",
    image: "/orbit-05.jpg",
    description:
      "High-speed custom quadcopter racing through neon-lit obstacle gates with microsecond reaction times and precision aerodynamics.",
    teamSize: "1 - 2 MEMBERS",
    prize: "₹60,000",
    venue: "OUTDOOR OMNI-COURT",
    rules: [
      "FPV racing drones must comply with standard 5-inch 4S/6S battery specifications.",
      "Video transmitters must operate on assigned RaceBand frequencies with max 25mW power.",
      "Time-attack qualifier rounds followed by 4-drone knockout bracket heats.",
      "Pilot safety briefing and failsafe inspection required before arming.",
    ],
  },
  {
    id: "mechatronix",
    title: "MECHATRONIX",
    subtitle: "AUTONOMOUS ROVER DESIGN",
    category: "hardware",
    categoryLabel: "HARDWARE // TRACK 04",
    image: "/orbit-06.jpg",
    description:
      "Construct autonomous planetary terrain rovers capable of obstacle avoidance, computer vision line tracking, and robotic arm payload retrieval.",
    teamSize: "3 - 4 MEMBERS",
    prize: "₹50,000",
    venue: "TEST ARENA C",
    rules: [
      "Teams of 3 to 4 members.",
      "Autonomous rovers must navigate the obstacle arena without manual RF intervention.",
      "Vision tracking and robotic manipulator arms must retrieve and deposit payloads in designated zones.",
      "Scoring based on course completion time and payload accuracy.",
    ],
  },

  // ESPORTS
  {
    id: "valorant-clash",
    title: "VALORANT CLASH",
    subtitle: "TACTICAL 5V5 TOURNAMENT",
    category: "esports",
    categoryLabel: "ESPORTS // TRACK 01",
    image: "/img3.jpeg",
    description:
      "Elite 5v5 tactical shooter championship on 240Hz LAN rigs. Double-elimination bracket with live shoutcasting on the main stage.",
    teamSize: "5 + 1 SUB",
    prize: "₹80,000",
    venue: "ESPORTS MAIN STAGE",
    rules: [
      "Standard 5v5 Competitive Mode tournament format on tournament LAN servers.",
      "Map pool: Current active competitive map rotation; veto process decides map selection.",
      "Group stage Best-of-1, Semifinals and Finals Best-of-3.",
      "Any third-party software, scripts, or game exploits lead to immediate team forfeit.",
    ],
  },
  {
    id: "bgmi-showdown",
    title: "BGMI SHOWDOWN",
    subtitle: "SURVIVAL ROYALE CHAMPIONSHIP",
    category: "esports",
    categoryLabel: "ESPORTS // TRACK 02",
    image: "/orbit-07.jpg",
    description:
      "16 squads drop into battle royale survival combat across Erangel and Miramar with custom point rules and live spectator broadcast.",
    teamSize: "4 MEMBERS",
    prize: "₹60,000",
    venue: "LAN DOME B",
    rules: [
      "4-player squads; mobile devices only (tablets, iPads, and emulators strictly forbidden).",
      "4 matches total: 2 Erangel, 1 Miramar, 1 Sanhok.",
      "Standard official esports point matrix (Placement points + Kill points).",
      "Players must record screen and hand-cam during all matches.",
    ],
  },
  {
    id: "tekken-arena",
    title: "TEKKEN ARENA",
    subtitle: "FIGHTING GAME COMMUNITY CUP",
    category: "esports",
    categoryLabel: "ESPORTS // TRACK 03",
    image: "/orbit-08.jpg",
    description:
      "1v1 high-stakes Tekken 8 fighting game bracket on arcade fightsticks and official tournament monitors.",
    teamSize: "SOLO",
    prize: "₹25,000",
    venue: "ARCADE CORNER",
    rules: [
      "Platform: PlayStation 5 tournament standard.",
      "Double Elimination bracket; Best of 3 games, Finals Best of 5.",
      "Standard timer (60s), 3 rounds to win a game.",
      "Custom arcade sticks and leverless controllers permitted after referee check.",
    ],
  },
  {
    id: "fifa-strike",
    title: "FIFA STRIKE",
    subtitle: "PRO 1V1 CONSOLE SHOWDOWN",
    category: "esports",
    categoryLabel: "ESPORTS // TRACK 04",
    image: "/orbit-09.jpg",
    description:
      "1v1 competitive FC 26 championship on PS5 consoles. Fast-paced knockout bracket with tactical substitutions.",
    teamSize: "SOLO",
    prize: "₹25,000",
    venue: "CONSOLE LOUNGE",
    rules: [
      "1v1 Single Elimination knockout tournament on PS5.",
      "Match length: 6-minute halves, Tactical Defending mandatory.",
      "Extra time (Classic) and Penalties in case of a draw.",
      "Standard official club teams only (no Soccer Aid or custom rosters).",
    ],
  },
];

let currentCategory = "all";
let searchQuery = "";

// =============================================================
// INITIALIZE EVENTS PAGE
// =============================================================
document.addEventListener("DOMContentLoaded", () => {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const catParam = urlParams.get("category");
    const storedCat = sessionStorage.getItem("innov8_selected_category");
    const initialCat = (catParam || storedCat || "all").toLowerCase();
    if (["all", "software", "hardware", "esports"].includes(initialCat)) {
      currentCategory = initialCat;
    }
    sessionStorage.removeItem("innov8_selected_category");
  } catch (err) {}

  initPageEntranceTransition();
  initBackgroundCanvas();
  renderEvents();
  setupFilterControls();
  setupModal();
  animatePageEntrance();
});

// =============================================================
// 0. CIRCULAR PAGE ENTRANCE TRANSITION
// =============================================================
function initPageEntranceTransition() {
  let originX = window.innerWidth / 2;
  let originY = window.innerHeight / 2;

  try {
    const stored = sessionStorage.getItem("innov8_transition_origin");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && parsed.x !== undefined && parsed.y !== undefined) {
        originX = parsed.x;
        originY = parsed.y;
      }
      sessionStorage.removeItem("innov8_transition_origin");
    }
  } catch (err) {
    // fallback
  }

  // The circle opens fluidly to reveal the event page background and contents
  gsap.fromTo(
    document.body,
    {
      clipPath: `circle(0% at ${originX}px ${originY}px)`,
    },
    {
      clipPath: `circle(150% at ${originX}px ${originY}px)`,
      duration: 0.85,
      ease: "power2.out",
      onComplete: () => {
        document.body.style.clipPath = "none";
      },
    }
  );
}

// =============================================================
// 1. THREE.JS BACKGROUND STREAMLINES CANVAS (#bg-canvas)
// =============================================================
function initBackgroundCanvas() {
  const bgCanvas = document.getElementById("bg-canvas");
  if (!bgCanvas) return;

  const bgRenderer = new THREE.WebGLRenderer({
    canvas: bgCanvas,
    antialias: true,
    powerPreference: "high-performance",
  });
  bgRenderer.setSize(window.innerWidth, window.innerHeight);
  bgRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const bgScene = new THREE.Scene();
  const bgCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const mouse = new THREE.Vector2(0.5, 0.5);
  const targetMouse = new THREE.Vector2(0.5, 0.5);

  const bgMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      uTime: { value: 0 },
      uMouse: { value: mouse },
      uInvertProgress: { value: 0 },
    },
    vertexShader,
    fragmentShader: bgFragmentShader,
  });

  const quadGeom = new THREE.PlaneGeometry(2, 2);
  const bgMesh = new THREE.Mesh(quadGeom, bgMaterial);
  bgScene.add(bgMesh);

  window.addEventListener("pointermove", (e) => {
    targetMouse.x = e.clientX / window.innerWidth;
    targetMouse.y = 1.0 - e.clientY / window.innerHeight;
  });

  window.addEventListener("resize", () => {
    bgRenderer.setSize(window.innerWidth, window.innerHeight);
    bgMaterial.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
  });

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
// 2. RENDER EVENT CARDS GRID (SQUARE CARDS, BIG TITLES, NO SUBLINES)
// =============================================================
function renderEvents() {
  const grid = document.getElementById("events-grid");
  const noResults = document.getElementById("no-results-box");
  const countBadge = document.getElementById("results-count-badge");
  if (!grid) return;

  const filtered = EVENTS_DATA.filter((event) => {
    const matchesCategory =
      currentCategory === "all" || event.category === currentCategory;
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      event.title.toLowerCase().includes(query) ||
      event.subtitle.toLowerCase().includes(query) ||
      event.category.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  // Update counts
  if (countBadge) {
    countBadge.textContent = `SHOWING ${filtered.length} OF ${EVENTS_DATA.length}`;
  }

  updateCategoryCounts();

  if (filtered.length === 0) {
    grid.innerHTML = "";
    if (noResults) noResults.style.display = "flex";
    return;
  }

  if (noResults) noResults.style.display = "none";

  grid.innerHTML = filtered
    .map(
      (event, index) => `
      <article class="event-card" data-id="${event.id}" data-index="${index}">
        <div class="event-thumb-box">
          <img src="${event.image}" alt="${event.title}" class="event-thumb-img" loading="lazy" />
          <div class="event-thumb-overlay"></div>
        </div>
        <div class="event-info">
          <h2 class="event-title">${event.title}</h2>
        </div>
      </article>
    `
    )
    .join("");

  // Attach card click handlers for GSAP circle-to-box morph modal
  grid.querySelectorAll(".event-card").forEach((card) => {
    card.addEventListener("click", (e) => {
      const eventId = card.getAttribute("data-id");
      const eventData = EVENTS_DATA.find((e) => e.id === eventId);
      if (eventData) {
        const thumbBox = card.querySelector(".event-thumb-box");
        const rect = thumbBox ? thumbBox.getBoundingClientRect() : card.getBoundingClientRect();
        const clickPoint = {
          x: e.clientX || rect.left + rect.width / 2,
          y: e.clientY || rect.top + rect.height / 2,
        };
        openModalWithCircleMorph(eventData, clickPoint);
      }
    });
  });

  // Animate cards appearance
  gsap.fromTo(
    ".event-card",
    {
      opacity: 0,
      y: 30,
      scale: 0.95,
    },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.5,
      stagger: 0.04,
      ease: "power3.out",
    }
  );
}

// =============================================================
// 3. CATEGORY COUNTS
// =============================================================
function updateCategoryCounts() {
  const allCount = EVENTS_DATA.length;
  const hwCount = EVENTS_DATA.filter((e) => e.category === "hardware").length;
  const swCount = EVENTS_DATA.filter((e) => e.category === "software").length;
  const espCount = EVENTS_DATA.filter((e) => e.category === "esports").length;

  const countAll = document.getElementById("count-all");
  const countHw = document.getElementById("count-hardware");
  const countSw = document.getElementById("count-software");
  const countEsp = document.getElementById("count-esports");

  if (countAll) countAll.textContent = allCount;
  if (countHw) countHw.textContent = hwCount;
  if (countSw) countSw.textContent = swCount;
  if (countEsp) countEsp.textContent = espCount;
}

// =============================================================
// 4. FILTER & SEARCH CONTROLS (LETTER-BY-LETTER KINETIC TYPOGRAPHY)
// =============================================================
function setupFilterControls() {
  const categoryBtns = document.querySelectorAll(".category-item");
  const searchInput = document.getElementById("events-search-input");
  const clearBtn = document.getElementById("clear-search-btn");
  const resetBtn = document.getElementById("reset-filter-btn");

  // Setup letter-by-letter rolling typography for each category button
  categoryBtns.forEach((btn) => {
    const wrap = btn.querySelector(".cat-label-wrap");
    const countEl = btn.querySelector(".cat-count");
    const cat = (btn.getAttribute("data-category") || "all").toLowerCase();
    const categoryName = cat.toUpperCase();

    if (cat === currentCategory) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }

    if (wrap) {
      // Replace inner markup with individual letter boxes
      wrap.innerHTML = categoryName
        .split("")
        .map(
          (char) => `
          <span class="char-roll-box">
            <span class="char-letter char-main">${char}</span>
            <span class="char-letter char-clone">${char}</span>
          </span>
        `
        )
        .join("");

      const charMains = wrap.querySelectorAll(".char-main");
      const charClones = wrap.querySelectorAll(".char-clone");

      btn.addEventListener("mouseenter", () => {
        if (btn.classList.contains("active")) return;

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

        if (countEl) {
          gsap.to(countEl, {
            color: "#d91424",
            scale: 1.08,
            duration: 0.25,
            ease: "power2.out",
          });
        }
      });

      btn.addEventListener("mouseleave", () => {
        if (btn.classList.contains("active")) return;

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

        if (countEl) {
          gsap.to(countEl, {
            color: "rgba(255, 255, 255, 0.3)",
            scale: 1,
            duration: 0.25,
            ease: "power2.out",
          });
        }
      });
    }

    btn.addEventListener("click", () => {
      categoryBtns.forEach((b) => {
        b.classList.remove("active");
        const bMains = b.querySelectorAll(".char-main");
        const bClones = b.querySelectorAll(".char-clone");
        const bCount = b.querySelector(".cat-count");
        if (bMains.length) {
          gsap.killTweensOf(bMains);
          gsap.killTweensOf(bClones);
          gsap.to(bMains, { yPercent: 0, duration: 0.25, ease: "power2.out" });
          gsap.to(bClones, { yPercent: 0, duration: 0.25, ease: "power2.out" });
        }
        if (bCount) gsap.to(bCount, { color: "rgba(255, 255, 255, 0.3)", scale: 1, duration: 0.25 });
      });

      btn.classList.add("active");
      currentCategory = btn.getAttribute("data-category") || "all";
      renderEvents();
    });
  });

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value;
      if (clearBtn) {
        clearBtn.style.display = searchQuery ? "block" : "none";
      }
      renderEvents();
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      if (searchInput) searchInput.value = "";
      searchQuery = "";
      clearBtn.style.display = "none";
      renderEvents();
      if (searchInput) searchInput.focus();
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      currentCategory = "all";
      searchQuery = "";
      if (searchInput) searchInput.value = "";
      if (clearBtn) clearBtn.style.display = "none";
      categoryBtns.forEach((b) => {
        const bMains = b.querySelectorAll(".char-main");
        const bClones = b.querySelectorAll(".char-clone");
        const bCount = b.querySelector(".cat-count");
        if (bMains.length) {
          gsap.to(bMains, { yPercent: 0, duration: 0.25 });
          gsap.to(bClones, { yPercent: 0, duration: 0.25 });
        }
        if (bCount) gsap.to(bCount, { color: "rgba(255, 255, 255, 0.3)", scale: 1 });

        if (b.getAttribute("data-category") === "all") {
          b.classList.add("active");
        } else {
          b.classList.remove("active");
        }
      });
      renderEvents();
    });
  }
}

// =============================================================
// 5. GSAP CIRCLE-TO-BOX MORPH MODAL WITH RULES & REGISTER
// =============================================================
let activeOriginPoint = null;

function setupModal() {
  const modal = document.getElementById("event-modal");
  const closeBtn = document.getElementById("modal-close-btn");

  if (closeBtn && modal) {
    closeBtn.addEventListener("click", closeModalWithMorph);
  }

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModalWithMorph();
    });
  }

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal && modal.classList.contains("open")) {
      closeModalWithMorph();
    }
  });
}

function openModalWithCircleMorph(event, originPoint) {
  activeOriginPoint = originPoint;
  const modal = document.getElementById("event-modal");
  const dialog = modal.querySelector(".event-modal-dialog");
  const body = document.getElementById("modal-body-content");
  if (!modal || !dialog || !body) return;

  const rulesListHtml = event.rules
    .map((rule) => `<li><span>${rule}</span></li>`)
    .join("");

  body.innerHTML = `
    <!-- Top Row: Square Poster on Left, Big Name on Right -->
    <div class="modal-grid-top modal-anim-item">
      <div class="modal-poster-box">
        <img src="${event.image}" alt="${event.title}" class="modal-poster-img" />
      </div>
      <div class="modal-top-right">
        <div class="modal-badge">
          <span class="badge-dot"></span>
          <span>${event.categoryLabel}</span>
        </div>
        <h1 class="modal-title">${event.title}</h1>
        <p class="modal-subtitle">${event.subtitle}</p>
        <p class="modal-desc">${event.description}</p>
        
        <div class="modal-info-row">
          <div class="modal-info-item">
            <span class="modal-info-label">PRIZE POOL</span>
            <span class="modal-info-val">${event.prize}</span>
          </div>
          <div class="modal-info-item">
            <span class="modal-info-label">TEAM SIZE</span>
            <span class="modal-info-val">${event.teamSize}</span>
          </div>
          <div class="modal-info-item">
            <span class="modal-info-label">VENUE</span>
            <span class="modal-info-val">${event.venue}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Section: Rules & Guidelines -->
    <div class="modal-rules-section modal-anim-item">
      <h3 class="rules-heading">RULES & GUIDELINES</h3>
      <ul class="rules-list">
        ${rulesListHtml}
      </ul>
    </div>

    <!-- Bottom Action Bar: Register Now -->
    <div class="modal-cta-row modal-anim-item">
      <span class="modal-reg-status">REGISTRATIONS OPEN • JU INNOV8 2026</span>
      <button class="modal-register-btn" id="event-action-register-btn">REGISTER NOW</button>
    </div>
  `;

  // Attach register click alert/feedback
  const regBtn = document.getElementById("event-action-register-btn");
  if (regBtn) {
    regBtn.addEventListener("click", () => {
      alert(`Registration for "${event.title}" is now open! Please proceed with your team credentials.`);
    });
  }

  const centerX = originPoint.x;
  const centerY = originPoint.y;

  modal.style.display = "flex";
  modal.classList.add("open");
  document.body.style.overflow = "hidden";

  // GSAP Expanding Circle Morph Animation on the full modal backdrop
  gsap.killTweensOf(modal);
  gsap.killTweensOf(dialog);

  gsap.set(modal, {
    clipPath: `circle(0% at ${centerX}px ${centerY}px)`,
    opacity: 1,
  });

  gsap.to(modal, {
    clipPath: `circle(150% at ${centerX}px ${centerY}px)`,
    duration: 0.75,
    ease: "power2.out",
  });

  gsap.set(dialog, {
    scale: 0.92,
    opacity: 0,
    y: 20,
  });

  gsap.to(dialog, {
    scale: 1,
    opacity: 1,
    y: 0,
    duration: 0.65,
    ease: "power2.out",
    delay: 0.05,
  });

  // Stagger modal inner contents
  gsap.fromTo(
    ".modal-anim-item",
    { opacity: 0, y: 15 },
    {
      opacity: 1,
      y: 0,
      duration: 0.45,
      stagger: 0.06,
      ease: "power2.out",
      delay: 0.15,
    }
  );
}

function closeModalWithMorph() {
  const modal = document.getElementById("event-modal");
  const dialog = modal ? modal.querySelector(".event-modal-dialog") : null;
  if (!modal || !dialog) return;

  const centerX = activeOriginPoint ? activeOriginPoint.x : window.innerWidth / 2;
  const centerY = activeOriginPoint ? activeOriginPoint.y : window.innerHeight / 2;

  gsap.killTweensOf(modal);
  gsap.killTweensOf(dialog);

  gsap.to(dialog, {
    scale: 0.92,
    opacity: 0,
    y: 15,
    duration: 0.45,
    ease: "power2.in",
  });

  gsap.to(modal, {
    clipPath: `circle(0% at ${centerX}px ${centerY}px)`,
    duration: 0.55,
    ease: "power2.inOut",
    onComplete: () => {
      modal.classList.remove("open");
      modal.style.display = "none";
      document.body.style.overflow = "auto";
    },
  });
}

// =============================================================
// 6. PAGE ENTRANCE ANIMATIONS
// =============================================================
function animatePageEntrance() {
  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

  tl.from(".events-sidebar", {
    opacity: 0,
    x: -35,
    duration: 0.8,
  }).from(
    ".events-meta-bar",
    {
      opacity: 0,
      y: -20,
      duration: 0.6,
    },
    "-=0.5"
  );

  const logoLink = document.querySelector(".nav-logo-link");
  if (logoLink) {
    logoLink.addEventListener("click", () => {
      try {
        sessionStorage.setItem("return_to_domains", "true");
      } catch (err) {}
    });
  }

  // =============================================================
  // 7. FULLSCREEN WEARECASEY INTERACTIVE MENU OVERLAY
  // =============================================================
  const fullscreenMenu = document.getElementById("fullscreen-menu");
  const menuBg = document.querySelector(".menu-bg");
  const menuItems = document.querySelectorAll(".fullscreen-menu .menu-item");
  const menuBtn = document.getElementById("menu-btn") || document.querySelector(".menu");
  const menuBtnLabel = document.getElementById("menu-btn-label") || (menuBtn ? menuBtn.querySelector("p") : null);

  if (fullscreenMenu && menuBtn) {
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
        menuBtn.classList.add("menu-active");
        menuTimeline.timeScale(1).play();
      } else {
        menuBtn.classList.remove("menu-active");
        menuTimeline.timeScale(1.4).reverse();
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
        if (href === "/events.html" && window.location.pathname.endsWith("events.html")) {
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
}
