import * as THREE from "three";
import gsap from "gsap";
import { vertexShader, bgFragmentShader } from "./shaders.js";
import { RULEBOOKS_DATA } from "./rulebooksData.js";

function initPreloader() {
  const preloader = document.getElementById("preloader");
  const spiderFill = document.getElementById("spider-fill");
  const counter = document.getElementById("preloader-counter");
  const spiderContainer = document.getElementById("spider-container");
  const textWrapper = document.getElementById("preloader-text-wrapper");

  if (!preloader) return;

  const loaderProxy = { progress: 0 };

  gsap.to(loaderProxy, {
    progress: 100,
    duration: 1.8,
    ease: "power2.inOut",
    onUpdate: () => {
      const p = Math.min(100, Math.round(loaderProxy.progress));
      if (counter) counter.textContent = `${p}%`;
      if (spiderFill) spiderFill.style.clipPath = `inset(${100 - p}% 0 0 0)`;
    },
    onComplete: () => {
      const tl = gsap.timeline({
        onComplete: () => {
          preloader.style.display = "none";
        },
      });

      tl.to([spiderContainer, textWrapper], {
        y: -25,
        opacity: 0,
        duration: 0.45,
        ease: "power2.in",
      }).to(
        preloader,
        {
          yPercent: -100,
          duration: 0.8,
          ease: "power4.inOut",
        },
        "-=0.1"
      );
    },
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initPreloader);
} else {
  initPreloader();
}

// =============================================================
// EVENTS DIRECTORY DATA WITH RULES & METADATA
// =============================================================
const EVENTS_DATA = [
  // SOFTWARE
  {
    id: "codehunt",
    title: "CODEHUNT",
    subtitle: "4-LEVEL KNOCKOUT C CLUE-HUNT",
    category: "software",
    categoryLabel: "SOFTWARE // TRACK 01",
    image: "/event%20posters/codehunt.png",
    description:
      "A competitive, time-bound coding challenge testing knowledge of the C programming language, algorithmic speed, and problem-solving. Solve C problems across 4 knockout levels, decipher clues to find hidden sealed envelopes across campus, and race the clock to victory.",
    teamSize: "1 - 2 MEMBERS",
    prize: "₹30,000",
    venue: "TECH LAB 1",
    rules: [
      "<strong>Team Format:</strong> Each team may consist of a minimum of 1 and a maximum of 2 participants who must remain together throughout the event.",
      "<strong>Requirements:</strong> Each team must bring their own laptop with a fully functional C compiler/IDE installed in offline mode and sufficient battery backup.",
      "<strong>Strict Offline Environment:</strong> No internet access will be provided during the event, and the use of mobile phones is strictly prohibited.",
      "<strong>4 Knockout Levels:</strong> Participants receive a C programming problem at each level. They must solve the problem, determine correct output, and submit code to the designated coordinator.",
      "<strong>Clue & Envelope Hunt:</strong> After verified completion of each level, teams receive a clue leading to a physical location. Participants must locate the spot, collect the sealed envelope, and return to the arena.",
      "<strong>Sealed Envelope Integrity:</strong> Envelopes must be opened ONLY in the presence of the event coordinator. Any damaged or pre-opened envelope results in immediate team disqualification.",
      "<strong>Time Limits:</strong> Each level has a designated time limit announced in the final briefing. Failure to complete within the allotted time may result in elimination.",
      "<strong>Discipline & Sportsmanship:</strong> Participants must maintain proper discipline throughout the hunt. Any unsafe, disruptive, or unsporting conduct will lead to disqualification.",
    ],
  },
  {
    id: "ghost-code",
    title: "GHOST CODE",
    subtitle: "SCREEN-OFF LOGIC & CONCENTRATION TRIAL",
    category: "software",
    categoryLabel: "SOFTWARE // TRACK 02",
    image: "/event%20posters/ghostcode.png",
    description:
      "A premier technical challenge designed to test memory, logical thinking, concentration, and pure coding ability without visual feedback. Solve increasingly complex programming problems with your screen turned off during designated blind phases.",
    teamSize: "1 - 2 MEMBERS",
    prize: "₹25,000",
    venue: "COMPUTE LAB A",
    rules: [
      "<strong>Team Format:</strong> Teams may consist of a minimum of 1 and a maximum of 2 participants using their own laptops.",
      "<strong>Approved Platform:</strong> Participants must use strictly the online compiler and platform approved by the event coordinators.",
      "<strong>Round 1 – Easy Level:</strong> 20 minutes to solve a fundamental coding logic problem. 10 points for a perfect answer; 1 point deducted for every error.",
      "<strong>Round 2 – Intermediate Level:</strong> 40 minutes for a more challenging logical reasoning and coding problem. 10 points for a perfect answer; 1 point deducted for every error.",
      "<strong>Round 3 – Final Level:</strong> 40 minutes total on a single problem. Phase 1: 20 minutes of coding with screens completely turned OFF. One-minute pause to review code and visible errors. Final phase: screens turned OFF again to complete the solution. 10 points max; 1 point deducted per error.",
      "<strong>Fair Play & Screen Rules:</strong> Participants must follow screen-off and screen-on instructions exactly as announced. Sharing code or communicating answers with other teams is strictly forbidden.",
      "<strong>No External Assistance:</strong> The use of unauthorized websites, third-party assistance, AI tools, or prohibited resources will result in immediate disqualification.",
      "<strong>Judging Decision:</strong> The decision of the organizing committee and event judges will be final and binding in all matters.",
    ],
  },
  {
    id: "ju-hackathon",
    title: "JU HACKATHON",
    subtitle: "24-HOUR THEME-BASED ON-CAMPUS HACKATHON",
    category: "software",
    categoryLabel: "SOFTWARE // TRACK 03",
    image: "/event%20posters/hackathon.png",
    description:
      "The flagship 24-hour on-campus hackathon at JECRC University. Following an online prototype screening of top 100 teams, finalists build live, innovative solutions to newly unveiled theme challenges across AI/ML, IoT, Cybersecurity, FinTech, and Open Innovation.",
    teamSize: "2 - 4 MEMBERS",
    prize: "₹1,00,000",
    venue: "INNOVERSE HALL / JU CAMPUS",
    rules: [
      "<strong>Eligibility & Team Size:</strong> Teams must consist of 2 to 4 registered participants with one nominated Team Leader. Every participant may register with only one team.",
      "<strong>Phases 1 & 2 (Online Shortlisting):</strong> Teams submit GitHub repo, live working prototype, and solution overview for technical screening. Top 100 teams are invited to the 24-hour on-campus finale.",
      "<strong>Phase 3 (24-Hour Offline Hackathon):</strong> Fresh, theme-specific problem statements are released on-site at the start of the 24-hour clock. Solutions must directly address this new on-site challenge.",
      "<strong>Themes:</strong> AI & Machine Learning, Smart Cities & IoT, Cybersecurity & Digital Trust, HealthTech & Accessibility, FinTech & Digital Commerce, Sustainability & ClimateTech, EdTech & Future of Work, and Open Innovation.",
      "<strong>Development Policy:</strong> Open tech stack. All project code must be developed during the official 24-hour hackathon period. Open-source libraries, frameworks, and public APIs are permitted with clear attribution.",
      "<strong>Originality & AI Transparency:</strong> Material AI contributions, third-party APIs, and starter templates must be transparently disclosed in documentation. Pre-existing full projects are strictly prohibited.",
      "<strong>Phase 4 (Mentoring Checkpoints):</strong> Mandatory progress evaluations with mentors covering Architecture & MVP, Technical Blockers, and Submission Readiness.",
      "<strong>Phase 5 (Final Submission & Jury):</strong> Final GitHub repo, deployment URL, README, and demo credentials submitted before deadline, followed by live demonstration and jury Q&A.",
      "<strong>Evaluation Criteria:</strong> Problem understanding & relevance, working implementation & completeness, technical depth, innovation, user experience, code ownership, and feasibility.",
      "<strong>Zero-Tolerance Disqualification:</strong> Plagiarism, unauthorized external code assistance, tampering, or malicious network behavior leads to immediate expulsion.",
    ],
  },
  {
    id: "promptify",
    title: "PROMPTIFY",
    subtitle: "AI GRAPHIC DESIGN & VISUAL STORYTELLING",
    category: "software",
    categoryLabel: "SOFTWARE // TRACK 04",
    image: "/event%20posters/promptify.png",
    description:
      "A creative visual competition where imagination meets generative AI. Participants generate a sequential 4-poster visual storyline based on mystery assigned elements, testing prompting finesse, artistic flow, consistency, and narrative presentation.",
    teamSize: "SOLO",
    prize: "₹20,000",
    venue: "DESIGN SUITE B",
    rules: [
      "<strong>Participation:</strong> Single participation only (Solo competition).",
      "<strong>Round 1 – Elemental Beginnings:</strong> Participants receive 4 elements and must design 2 AI posters in 1 hour. Each poster must incorporate at least one assigned element.",
      "<strong>Round 2 – Expanding the Story:</strong> 6 new elements provided. Participants must create 2 additional posters in 45 minutes continuing the established storyline.",
      "<strong>Round 3 – The Final Narrative:</strong> Participants present their 4-poster visual narrative in sequence to the jury, articulating the concept, artistic decisions, and story flow.",
      "<strong>Permitted AI Tools:</strong> Adobe Firefly, Stable Diffusion, DALL-E, Midjourney, etc. All generation must be performed live during the event.",
      "<strong>Originality & Resources:</strong> External pre-made templates or assets are prohibited; only the provided resource set and live AI generations may be utilized.",
      "<strong>Judging Criteria:</strong> Creativity and originality, storyline consistency across posters, visual appeal & design quality, effective use of given elements, and narrative presentation.",
      "<strong>Content Policy:</strong> Any abusive, offensive, racial, caste-based, or hateful imagery/language results in immediate disqualification.",
    ],
  },
  {
    id: "ai-arena",
    title: "AI ARENA",
    subtitle: "PROMPT ENGINEERING & INTELLIGENT WORKFLOWS",
    category: "software",
    categoryLabel: "SOFTWARE // TRACK 05",
    image: "/event%20posters/aiarena.png",
    description:
      "A multi-round practical AI tournament testing prompting precision, logical reasoning, code debugging, and task automation. Move through structured challenges to an unseen final mission where correctness, speed, and reliability determine the champion.",
    teamSize: "1 - 2 MEMBERS",
    prize: "₹30,000",
    venue: "AI INNOVATION LAB",
    rules: [
      "<strong>Team Specification:</strong> 1 to 2 participants per team using their own laptops.",
      "<strong>Beginner-Friendly Architecture:</strong> Open to all years. Deep ML expertise not compulsory; tasks can be solved via clear prompting, Python, spreadsheets, or approved tools.",
      "<strong>Round 1 – Prompt & Logic Sprint:</strong> Rapid-fire tasks covering prompt optimization, logical reasoning, structured output generation, and error detection.",
      "<strong>Round 2 – AI Mission Lab:</strong> Practical applied challenges: data extraction, Python script debugging, document-based research, summarization, and structured response synthesis.",
      "<strong>Round 3 – AI Battle Arena:</strong> Shortlisted teams receive an unseen live challenge revealed at round start. Evaluated on accuracy, response latency, and reliability.",
      "<strong>Round 4 – The Final Boss:</strong> Finalists tackle a high-stakes surprise verification trial: diagnosing hallucinations, debugging complex outputs, or advanced data reasoning.",
      "<strong>Approved Tools:</strong> ChatGPT, Google Gemini, Claude, open-source/local models, Python, spreadsheets, and officially permitted platforms.",
      "<strong>Scoring Weights:</strong> Accuracy & Task Success (40%), Reliability & Correctness (20%), Response Time / Latency (15%), Resource Efficiency (10%), Security & Ethics (10%), Explainability (5%).",
      "<strong>Integrity:</strong> Sharing prompts, task contents, or solutions between teams is strictly prohibited and results in immediate disqualification.",
    ],
  },
  {
    id: "among-bugs",
    title: "AMONG BUGS",
    subtitle: "STRATEGIC DEBUGGING & SOCIAL DECEPTION",
    category: "software",
    categoryLabel: "SOFTWARE // TRACK 06",
    image: "/event%20posters/amongbugs.png",
    description:
      "A thrilling competitive arena blending technical code debugging with social deduction. Hunt down insidious bugs, optimize broken programs, and outmaneuver Traitors planting sabotages inside shared GitHub repositories.",
    teamSize: "SOLO",
    prize: "₹25,000",
    venue: "CYBER ARENA 3",
    rules: [
      "<strong>Participation:</strong> Individual participation only. All participants must use their own laptops.",
      "<strong>Round 1 – MCQ Elimination:</strong> Rapid technical assessment testing fundamental debugging instincts, syntax traps, and programming concepts (Top 50 advance).",
      "<strong>Round 2 – Debug the Code:</strong> Shortlisted participants receive printed buggy code on paper and must diagnose, patch, and execute the clean program on their machines (Top 36 advance).",
      "<strong>Round 3 – Commit & Betray:</strong> Batches of 6 compete inside a shared GitHub repository. Traitors secretly plant subtle bugs while Innocents patch code and deduce who the traitors are (Top 12 advance).",
      "<strong>Round 4 – Group Showdown:</strong> Top 12 divided into 2 groups of 6 for an escalated round of strategic debugging and code sabotage (Top 6 advance).",
      "<strong>Round 5 – The Grand Finale:</strong> The final 6 face an elite debugging and optimization showdown to crown the top 2 overall winners.",
      "<strong>Strict Tool Restrictions:</strong> Use of external debugging tools, AI code generators, or search engines for solutions is strictly prohibited.",
      "<strong>Network Limits:</strong> Internet access is strictly restricted to GitHub. Revealing secret roles in rounds 3 & 4 leads to immediate disqualification.",
    ],
  },
  {
    id: "blink-and-build",
    title: "BLINK & BUILD",
    subtitle: "TIMED MEMORY-BASED UI RECREATION",
    category: "software",
    categoryLabel: "SOFTWARE // TRACK 07",
    image: "/event%20posters/blinkandbuild.png",
    description:
      "An individual frontend design and development showdown. Observe a mystery reference UI for a few fleeting seconds, commit the typography, layout, spacing, and micro-interactions to memory, and recreate it from scratch within a 45-minute sprint.",
    teamSize: "SOLO",
    prize: "₹25,000",
    venue: "WEB LAB 2",
    rules: [
      "<strong>Individual Entry:</strong> Individual participation only; pair programming and outside collaboration are strictly prohibited.",
      "<strong>Observation & Build Protocol:</strong> Participants observe a reference UI for a timed window, after which the reference vanishes. The build window is strictly 45 minutes.",
      "<strong>Round 1 – Qualification:</strong> 1-minute visual observation window, followed by a 45-minute sprint to recreate basic layout and frontend components.",
      "<strong>Round 2 – Selection:</strong> 45-second observation of a more intricate UI with richer styling and layout details, followed by 45 minutes to build from memory.",
      "<strong>Round 3 – Championship Final:</strong> 30-second observation of an advanced UI with complex responsive interactions and visual polish; 45 minutes to execute.",
      "<strong>Zero Screen Capture:</strong> Taking screenshots, recordings, photos, or searching the web for matching templates or assets is strictly forbidden.",
      "<strong>No Generative AI:</strong> AI UI generators, automated code scrapers, or outside assistance are prohibited during the timed build window.",
      "<strong>Judging Criteria:</strong> Visual similarity to reference, layout precision & spacing, responsive viewport fidelity, functional interactions, clean code quality, and typography/shadow details.",
      "<strong>Submission:</strong> Projects must be submitted through the official portal before the deadline and render properly in the evaluation browser.",
    ],
  },
  {
    id: "code-golf",
    title: "CODE GOLF",
    subtitle: "ULTRA-EFFICIENT ALGORITHMIC OPTIMIZATION",
    category: "software",
    categoryLabel: "SOFTWARE // TRACK 08",
    image: "/event%20posters/codegolf.png",
    description:
      "The ultimate test of algorithmic efficiency, minimal runtime, and elegant code optimization. Progress through a language quiz and algorithmic problems to a Code Golf challenge where every millisecond, byte, and CPU cycle counts.",
    teamSize: "SOLO",
    prize: "₹25,000",
    venue: "COMPUTE LAB B",
    rules: [
      "<strong>Eligibility:</strong> Individual participation only; teams are not permitted.",
      "<strong>Permitted Languages:</strong> Solutions must be written strictly in C, C++, Java, or Python. Any other language will be rejected.",
      "<strong>Round 1 – Language Quiz (Easy Level):</strong> Time-limited quiz assessing syntax, output prediction, loops, memory models, data structures, and language quirks across C, C++, Java, and Python.",
      "<strong>Round 2 – Moderate Coding Challenge:</strong> Algorithmic problem-solving evaluated primarily on correctness, runtime execution speed, and space/memory complexity.",
      "<strong>Round 3 – Code Golf Challenge (Final):</strong> Participants receive starter code with inefficient logic and must refactor, rewrite, and optimize the algorithm to minimize runtime and memory consumption while preserving exact outputs.",
      "<strong>Automated Test Suites:</strong> Solutions are evaluated automatically against hidden edge cases. A fast solution that fails test cases will be disqualified.",
      "<strong>Prohibited Conduct:</strong> Hardcoding output values to bypass test suites or tampering with compiler environments results in immediate disqualification.",
      "<strong>Fair Play:</strong> Use of external AI code assistants, pre-written code snippets, or online solution lookup is strictly prohibited during the contest.",
    ],
  },

  // HARDWARE
  {
    id: "go-karting",
    title: "GO-KARTING",
    subtitle: "RECREATIONAL CLOSED-TRACK DRIVING EXPERIENCE",
    category: "hardware",
    categoryLabel: "HARDWARE // TRACK 01",
    image: "/event%20posters/gokarting.png",
    description:
      "A thrilling recreational driving event providing participants with an exhilarating experience of piloting Go-Karts on a closed loop track. Focused on safe, enjoyable, and high-energy driving with strict safety equipment and timed slots.",
    teamSize: "INDIVIDUAL (1 DRIVER)",
    prize: "RECREATIONAL EVENT",
    venue: "OUTDOOR CLOSED TRACK",
    rules: [
      "<strong>Format:</strong> Recreational individual driving activity on a closed-circuit loop track.",
      "<strong>Duration:</strong> Maximum of 5 minutes per participant to complete their lap following the predetermined route.",
      "<strong>Mandatory Safety:</strong> Helmets, Neck Collars, seat belts, and fully enclosed footwear are strictly required.",
      "<strong>Vehicle Specs:</strong> Provided by organizers; electric or fuel powered.",
      "<strong>Eligibility:</strong> Minimum age requirement is 17 years old with pre-event briefing.",
      "<strong>Safety Conduct:</strong> Reckless driving or arguments with the organizing team result in immediate removal; damage caused by negligence requires repair/replacement reimbursement.",
    ],
  },
  {
    id: "lfr",
    title: "LFR",
    subtitle: "AUTONOMOUS LINE FOLLOWER ROBOT CHAMPIONSHIP",
    category: "hardware",
    categoryLabel: "HARDWARE // TRACK 02",
    image: "/event%20posters/lfr.png",
    description:
      "A precision robotics challenge where custom autonomous bots navigate a black line on a white surface across curves, intersections, and turns in the shortest possible time.",
    teamSize: "1 - 4 MEMBERS",
    prize: "CASH PRIZE (TOP 2)",
    venue: "ROBO ARENA",
    rules: [
      "<strong>Team Format:</strong> Teams of 1–4 members using their own pre-built autonomous robots.",
      "<strong>Bot Limits:</strong> Maximum dimensions: 25 cm × 25 cm × 25 cm; maximum weight: 2 kg including batteries.",
      "<strong>Power Source:</strong> Battery-powered only (max 12V DC). External tethers, combustibles, and remote controls prohibited.",
      "<strong>Autonomy:</strong> Must operate completely autonomously without wireless intervention or manual nudging.",
      "<strong>Track:</strong> Black line on white flexi sheet laid flat on rigid base with curves and intersections.",
      "<strong>Penalties:</strong> Hand touch (+10s), Checkpoint skip/wrong path (+30s or DQ), Track damage (+45s or DQ), Manual nudge (Immediate DQ).",
    ],
  },
  {
    id: "robo-hurdle",
    title: "ROBO HURDLE",
    subtitle: "ALL-TERRAIN OBSTACLE ROBOTIC TRIAL",
    category: "hardware",
    categoryLabel: "HARDWARE // TRACK 03",
    image: "/event%20posters/robohurdlerace.png",
    description:
      "Conquer demanding obstacle courses—bridges, speed breakers, marble pits, rotating arms, slippery paths, and seesaws—with a manually controlled wired or wireless robot in the fastest time.",
    teamSize: "1 - 3 MEMBERS",
    prize: "EXCELLENCE AWARD (TOP 2)",
    venue: "HURDLE RACETRACK ARENA",
    rules: [
      "<strong>Team Format:</strong> 1 to 3 participants per team (cross-college teams permitted).",
      "<strong>Bot Specs:</strong> Max 300 mm × 300 mm × 300 mm; maximum weight: 5 kg. Wired or wireless control.",
      "<strong>Power Constraints:</strong> Electrically powered only (max 24V DC). No AC supply provided; no IC engines allowed.",
      "<strong>Obstacles:</strong> Track includes bridges, speed breakers, marble pits, rotating discs, rotating arms, curved ramps, and seesaws.",
      "<strong>Course Rules:</strong> Robot must stay on track; leaving track requires restarting from last crossed checkpoint while timer continues. Teams may skip any one hurdle.",
      "<strong>Evaluation:</strong> Combined score across Time-Limit Course points and Drag Race speed knockouts.",
    ],
  },
  {
    id: "robo-soccer",
    title: "ROBO SOCCER",
    subtitle: "1V1 COMPETITIVE ROBOT FOOTBALL ARENA",
    category: "hardware",
    categoryLabel: "HARDWARE // TRACK 04",
    image: "/event%20posters/robosoccer.png",
    description:
      "A dynamic 1v1 soccer clash inside a 12ft × 8ft wooden arena. Build an agile robot to tackle opponents, dribble, and score goals with tennis balls into 20cm goalposts.",
    teamSize: "1 - 4 MEMBERS",
    prize: "CASH AWARDS",
    venue: "SOCCER ARENA (12 FT × 8 FT)",
    rules: [
      "<strong>Team Format:</strong> 1 to 4 participants. Teams designate 1 Robot Handler and 1 Wire/Battery Handler in the game zone.",
      "<strong>Bot Constraints:</strong> Max 300 mm × 300 mm × 300 mm; max weight: 5 kg (5% tolerance). Max 24V DC (up to 6S battery). Any motor permitted.",
      "<strong>Wired Bots:</strong> Minimum 3m wire length; external battery weight is included in total bot weight check.",
      "<strong>Matchplay:</strong> One-on-one soccer with tennis balls in a 12 ft × 8 ft arena. Highest goals at match end wins.",
      "<strong>Tiebreaker:</strong> In case of a draw, extra time for a quick-scorer (Golden Goal) is played—first to score wins immediately.",
    ],
  },
  {
    id: "robo-sumo",
    title: "ROBO SUMO",
    subtitle: "1V1 HEAVYWEIGHT ROBOT SUMO BATTLE",
    category: "hardware",
    categoryLabel: "HARDWARE // TRACK 05",
    image: "/event%20posters/robosumo.png",
    description:
      "High-traction, heavy-torque robotic sumo battle. Design a powerful robot to grapple, push, and eject the opponent bot completely out of the designated sumo ring.",
    teamSize: "1 - 3 MEMBERS",
    prize: "CASH AWARDS",
    venue: "SUMO RING ARENA",
    rules: [
      "<strong>Team Format:</strong> 1 to 3 participants. 1 Robot Handler and 1 Wire/Battery Handler allowed in the zone.",
      "<strong>Bot Specs:</strong> Max weight: 7 kg (5% tolerance). Max 24V DC (up to 6S battery). Any motor permitted. Wired or wireless.",
      "<strong>Wired Bots:</strong> Minimum 4m wire length; external battery weight included in total bot weight check.",
      "<strong>Win Condition:</strong> Push opponent bot out of the designated ring. If any part of a bot leaves the arena line, the opponent wins.",
      "<strong>Pre-Match Inspection:</strong> Weight checked strictly before the event. Unsportsmanlike conduct leads to automatic disqualification.",
    ],
  },
  {
    id: "robowar-8kg",
    title: "ROBOWAR 8KG",
    subtitle: "COMBAT ROBOTICS (8KG CATEGORY)",
    category: "hardware",
    categoryLabel: "HARDWARE // TRACK 06",
    image: "/event%20posters/robowar8kg.png",
    description:
      "The 8kg combat robotics arena at JU TechFest. Custom-armored machines with high-RPM active weapons clash in an enclosed steel cage across intense 3-minute knockout battles.",
    teamSize: "1 - 6 MEMBERS",
    prize: "CHAMPIONSHIP CASH PRIZE",
    venue: "COMBAT ROBOTIC ARENA",
    rules: [
      "<strong>Team Format:</strong> 1 to 6 members. Contested on a single-elimination knockout basis with 3-minute rounds.",
      "<strong>8 kg Category:</strong> Bots MUST have an active weapon. No passive wedge bots are permitted in 8kg.",
      "<strong>Zero Tolerance:</strong> Strict 0% weight tolerance (max 8.0 kg).",
      "<strong>Safety & Kill Switch:</strong> Truly wireless control only. Mandatory active Kill Switch in each category. DC power only.",
      "<strong>Inactivity:</strong> Inability to move for more than 10 seconds results in round disqualification. Strict anti-harassment policy.",
    ],
  },
  {
    id: "robowar-15kg",
    title: "ROBOWAR 15KG",
    subtitle: "COMBAT ROBOTICS (15KG CATEGORY)",
    category: "hardware",
    categoryLabel: "HARDWARE // TRACK 07",
    image: "/event%20posters/robowar15kg.png",
    description:
      "The heavyweight combat robotics arena at JU TechFest. Custom-armored machines with high-RPM active weapons and cluster bots clash in an enclosed steel cage across the 15kg weight division.",
    teamSize: "1 - 6 MEMBERS",
    prize: "CHAMPIONSHIP CASH PRIZE",
    venue: "COMBAT ROBOTIC ARENA",
    rules: [
      "<strong>Team Format:</strong> 1 to 6 members. Contested on a single-elimination knockout basis with 3-minute rounds.",
      "<strong>15 kg Category:</strong> Clustering allowed within 15 kg (8kg units + wedges permitted; total weight must strictly be ≤ 15 kg).",
      "<strong>Zero Tolerance:</strong> Strict 0% weight tolerance (max 15.0 kg).",
      "<strong>Safety & Kill Switch:</strong> Truly wireless control only. Mandatory active Kill Switch in each category. DC power only.",
      "<strong>Inactivity:</strong> Inability to move for more than 10 seconds results in round disqualification. Strict anti-harassment policy.",
    ],
  },
  {
    id: "robowar-3lbs",
    title: "ROBOWAR 3 LBS",
    subtitle: "BEETLEWEIGHT COMBAT ROBOTICS (UP TO 1.5 KG)",
    category: "hardware",
    categoryLabel: "HARDWARE // TRACK 08",
    image: "/event%20posters/robowar3lbs.png",
    description:
      "Fast and furious beetleweight combat robotics. Up to 1.5 kg machines armed with active spinners, drums, and flippers fight in a 3-minute knockout cage match.",
    teamSize: "1 - 4 MEMBERS",
    prize: "EXCELLENCE AWARD (TOP 2)",
    venue: "MINI COMBAT ARENA",
    rules: [
      "<strong>Team Format:</strong> 1 to 4 members. Single-elimination knockout bracket with 3-minute combat rounds.",
      "<strong>Weight Limit:</strong> Exactly 3 lbs up to 1.5 kg (maximum) with strict 0% weight tolerance.",
      "<strong>Mandatory Weapon:</strong> Bot must have an active weapon. Truly wireless control only.",
      "<strong>Failsafe Switch:</strong> An accessible, functional Kill Switch is mandatory before arena entry.",
      "<strong>Inactivity Rule:</strong> Inability to displace from position for more than 10 seconds results in round forfeiture.",
      "<strong>Awards:</strong> Certificates of Excellence awarded to the top 2 winners; participation certificates for compliant teams.",
    ],
  },
  {
    id: "rc-basher",
    title: "RC BASHER",
    subtitle: "HIGH-SPEED OFF-ROAD RC BASHING & STUNT TRIAL",
    category: "hardware",
    categoryLabel: "HARDWARE // TRACK 09",
    image: "/event%20posters/rcbasher.png",
    description:
      "High-octane RC basher challenge testing vehicle durability, throttle control, aerial jumps, and precision driving over extreme off-road terrain.",
    teamSize: "1 - 3 MEMBERS",
    prize: "CASH AWARDS",
    venue: "RC OFF-ROAD TRACK",
    rules: [
      "To be updated",
    ],
  },
  {
    id: "rc-hurdle",
    title: "RC HURDLE",
    subtitle: "DYNAMIC RC OBSTACLE & TECHNICAL NAVIGATION",
    category: "hardware",
    categoryLabel: "HARDWARE // TRACK 10",
    image: "/event%20posters/rchurdle.png",
    description:
      "Precision RC vehicle obstacle trial. Navigate tight chicanes, dynamic elevated ramps, uneven surfaces, and complex hurdles in the fastest clean time.",
    teamSize: "1 - 3 MEMBERS",
    prize: "CASH AWARDS",
    venue: "RC OBSTACLE ARENA",
    rules: [
      "To be updated",
    ],
  },
  {
    id: "drone-soccer",
    title: "DRONE SOCCER",
    subtitle: "AERIAL COMBAT & DRONE FOOTBALL SHOWDOWN",
    category: "hardware",
    categoryLabel: "HARDWARE // TRACK 11",
    image: "/event%20posters/dronesoccer.png",
    description:
      "High-tech aerial sport where protected drone spheres clash, tackle, and score goals through elevated circular hoops inside an enclosed safety-netted cage.",
    teamSize: "1 - 4 MEMBERS",
    prize: "CASH AWARDS",
    venue: "DRONE ARENA (ENCLOSED NET)",
    rules: [
      "To be updated",
    ],
  },

  // ESPORTS
  {
    id: "valorant",
    title: "VALORANT",
    subtitle: "5V5 TACTICAL SHOOTER LAN TOURNAMENT",
    category: "esports",
    categoryLabel: "ESPORTS // TRACK 01",
    image: "/event%20posters/valorant.png",
    description:
      "The premier Valorant LAN championship at JECRC University. 5v5 tactical shooter tournament kicking off with online qualifiers and culminating in an 8-team offline LAN showdown with tournament-grade PCs, live map vetoes, and Mumbai server competition.",
    teamSize: "5 + 1 SUBSTITUTE",
    prize: "₹1,00,000",
    venue: "ESPORTS LAN ARENA",
    rules: [
      "<strong>Team Roster:</strong> Minimum of 5 players and 1 registered substitute (5+1 squad).",
      "<strong>Online Qualifiers:</strong> Single Elimination Best-of-1 matches held 2 weeks prior; Top 8 advance to LAN.",
      "<strong>LAN Finals:</strong> Quarter Finals (BO1), Semi Finals (BO1), and Grand Finals (BO3) played offline at JECRC University Campus on provided tournament PCs.",
      "<strong>Map Pool:</strong> Ascent, Abyss, Haven, Lotus, Split, Summit, Sunset. Coin toss determines veto/pick precedence.",
      "<strong>Fair Play & Anti-Cheat:</strong> Third-party tools, scripts, or game exploits lead to immediate team disqualification.",
      "<strong>Punctuality:</strong> 5-minute lobby check-in window. Minimum 4 players required in lobby or match is forfeited.",
    ],
  },
  {
    id: "bgmi",
    title: "BGMI",
    subtitle: "BATTLE ROYALE SQUAD SURVIVAL TOURNAMENT",
    category: "esports",
    categoryLabel: "ESPORTS // TRACK 02",
    image: "/event%20posters/bgmi.png",
    description:
      "Survive the chaos, eliminate rival squads, and be the last team standing in Battle Royale: BGMI. Squads drop into Erangel, Miramar, and Rondo across multi-stage qualifiers and 16-team finals for the championship title.",
    teamSize: "4 + 1 MEMBERS",
    prize: "₹1,00,000",
    venue: "ESPORTS ARENA B",
    rules: [
      "<strong>Team Roster:</strong> Maximum 4+1 participants. Cross-institution squads are allowed.",
      "<strong>Device Policy:</strong> Mobile phones and iPads only. Emulators are strictly prohibited.",
      "<strong>Tournament Stages:</strong> Qualifiers (2 matches: Erangel, Miramar), Semi-Finals (32 squads, 3 matches), Finals (16 squads, 4 matches including Rondo).",
      "<strong>Point Matrix:</strong> Placement points (1st: 10 pts, 2nd: 6, 3rd: 5, 4th: 4, 5th: 3, 6th: 2, 7th: 1, 8th: 1) plus 1 point per kill.",
      "<strong>Disconnections:</strong> Squads must continue at disadvantage; matches will not be paused or rehosted.",
    ],
  },
  {
    id: "freefire-max",
    title: "FREEFIRE MAX",
    subtitle: "BATTLE ROYALE SQUAD CHAMPIONSHIP",
    category: "esports",
    categoryLabel: "ESPORTS // TRACK 03",
    image: "/event%20posters/freefire.png",
    description:
      "High-speed survival battle royale tournament in Free Fire Max. 48 players per lobby in Esports Mode battling through Qualifiers, 24-team Semi-Finals, and 12-team Grand Finals across Bermuda, Purgatory, Kalahari, Nexterra, and Solara.",
    teamSize: "4 + 1 MEMBERS",
    prize: "₹1,00,000",
    venue: "ESPORTS ARENA C",
    rules: [
      "<strong>Team Roster:</strong> 4 players + 1 substitute. Students from different institutes are permitted to team up.",
      "<strong>Device Policy:</strong> Strictly mobile phones only. Emulators and iPads are prohibited.",
      "<strong>Settings:</strong> Classic Squad Battle Royale, 48 players, Esports Mode drop list, 200 HP, 100% speed, Gun properties disabled.",
      "<strong>Stages:</strong> Qualifiers (Open), Semi-Finals (Top 24, 3 matches), Grand Finals (Top 12, 6 matches).",
      "<strong>Scoring:</strong> Booyah (12 pts), 2nd (9 pts), 3rd (8 pts), 4th (7 pts), 5th (6 pts), 6th (5 pts), 7th (4 pts), 8th (3 pts), 9th (2 pts), 10th (1 pt) + 1 point per kill.",
    ],
  },
  {
    id: "minecraft",
    title: "MINECRAFT",
    subtitle: "BEDWARS SOLO CHAMPIONSHIP",
    category: "esports",
    categoryLabel: "ESPORTS // TRACK 04",
    image: "/event%20posters/minecraft.png",
    description:
      "The ultimate individual BedWars showdown. Protect your bed, gather resources, bridge the void, and eliminate competitors across custom Paper/Spigot zero-lag tournament servers. 128 gladiators compete through online qualifiers to the LAN Grand Finals.",
    teamSize: "SOLO",
    prize: "₹15,000",
    venue: "COMPUTE ARENA LAN",
    rules: [
      "<strong>Format:</strong> BedWars Solo (8 players per arena) with strict vanilla Minecraft mechanics.",
      "<strong>Timing:</strong> Beds destroyed at 10 minutes; Sudden Death Dragon phase at 15 minutes; hard cap at 20 minutes.",
      "<strong>Scoring:</strong> 1st: 20 pts, 2nd: 15, 3rd: 12, 4th: 9, 5th: 7, 6th: 5, 7th: 3, 8th: 1. Beds Destroyed: +2 pts each. Final Kills: +1 pt each.",
      "<strong>Tournament Stages:</strong> Round 1 Qualifiers (128 players), Round 2 Quarter Finals (64 players), Round 3 Semi Finals LAN (32 players), Round 4 Grand Finals LAN (8 finalists, 3 matches).",
      "<strong>Vanilla Integrity:</strong> Zero client modifications, hacks (Kill Aura, Reach, Aimbot, Speed, Fly, X-Ray), or auto-clicker macros. Banned hardware mice with macro buttons.",
    ],
  },
  {
    id: "fifa",
    title: "FIFA",
    subtitle: "PRO 1V1 CONSOLE SHOWDOWN (PS5)",
    category: "esports",
    categoryLabel: "ESPORTS // TRACK 05",
    image: "/event%20posters/fifa.png",
    description:
      "Elite head-to-head console football tournament played live on PlayStation 5 consoles at JECRC University. 1v1 Club Mode bracket with tactical defending, fast-paced matches, and penalty shootouts.",
    teamSize: "SOLO",
    prize: "₹20,000",
    venue: "PS5 CONSOLE LOUNGE",
    rules: [
      "<strong>Format:</strong> 1v1 Single Elimination knockout in Club Mode on provided PS5 setups.",
      "<strong>Match Length:</strong> 6 minutes (3 minutes per half); Semifinals and Finals extended to 8 minutes (4 minutes per half).",
      "<strong>Gameplay:</strong> Tactical Defending mandatory. Tiebreakers resolved via Extra Time (Classic) and Penalties.",
      "<strong>No-Show Rule:</strong> Players must report within 10 minutes of scheduled match call or receive default loss.",
      "<strong>Fair Play:</strong> In-game open-play pauses, abusive conduct, or match-fixing/collusion lead to immediate disqualification.",
    ],
  },
  {
    id: "tekken",
    title: "TEKKEN",
    subtitle: "1V1 IRON FIST FIGHTING CHAMPIONSHIP",
    category: "esports",
    categoryLabel: "ESPORTS // TRACK 06",
    image: "/event%20posters/tekken.png",
    description:
      "The Iron Fist Tournament descends upon JU TechFest 2026. Live 1v1 double elimination championship in Tekken played on competition rigs at JECRC University, featuring bracket resets, character lock rules, and premier fighting game action.",
    teamSize: "SOLO",
    prize: "₹20,000",
    venue: "ESPORTS FIGHTING LOUNGE",
    rules: [
      "<strong>Tournament Format:</strong> Double-elimination bracket. All matches prior to finals are Best-of-1 games; Grand Finals are Best-of-3 games.",
      "<strong>Bracket Reset:</strong> The Grand Final will reset if the player emerging from the Loser's Bracket wins the first set.",
      "<strong>Character Selection:</strong> Winner of a game must lock their character; the loser is permitted to switch characters for the next game.",
      "<strong>DLC & Customization:</strong> All characters including DLC are permitted unless specifically restricted. Character customization must be disabled.",
      "<strong>Fair Play:</strong> Spamming uncompetitive power moves is prohibited. Random stage selection if players do not mutually agree on a rematch stage.",
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

  const fullRulebook = RULEBOOKS_DATA && RULEBOOKS_DATA[event.id];

  let rulebookViewerHtml = "";
  if (fullRulebook) {
    rulebookViewerHtml = `
      <div class="rulebook-document-viewer">
        <div class="rb-viewer-header">
          <div class="rb-viewer-badge">
            <span class="rb-pulse-dot"></span>
            <span>${fullRulebook.subtitle || "OFFICIAL RULEBOOK // JU TECHFEST 2026"}</span>
          </div>
          <span class="rb-scroll-hint">SCROLL TO READ COMPLETE RULES ↓</span>
        </div>
        <div class="rb-viewer-content">
          ${fullRulebook.html}
        </div>
      </div>
    `;
  } else {
    const rulesListHtml = (event.rules || [])
      .map((rule) => `<li><span>${rule}</span></li>`)
      .join("");
    rulebookViewerHtml = `
      <div class="rulebook-document-viewer">
        <div class="rb-viewer-header">
          <div class="rb-viewer-badge">
            <span class="rb-pulse-dot"></span>
            <span>EVENT GUIDELINES // JU TECHFEST 2026</span>
          </div>
          <span class="rb-scroll-hint">SCROLL TO READ GUIDELINES ↓</span>
        </div>
        <div class="rb-viewer-content">
          <ul class="rules-list">
            ${rulesListHtml}
          </ul>
        </div>
      </div>
    `;
  }

  const categoryKey = (event.category || "").toLowerCase();
  const regLinks = {
    software: "https://rzp.io/rzp/softwareju",
    hardware: "https://rzp.io/rzp/hardwareju",
    esports: "https://rzp.io/rzp/esportsju",
  };
  const regUrl = regLinks[categoryKey] || "https://rzp.io/rzp/softwareju";

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
        
        <div class="modal-info-action-row">
          <div class="modal-info-row">
            <div class="modal-info-item">
              <span class="modal-info-label">TEAM SIZE</span>
              <span class="modal-info-val">${event.teamSize}</span>
            </div>
          </div>
          <a href="${regUrl}" target="_blank" rel="noopener noreferrer" class="modal-register-btn modal-register-btn-inline" id="event-header-register-btn">
            <span>REGISTER NOW</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </a>
        </div>
      </div>
    </div>

    <!-- Bottom Section: In-Panel Full Rulebook & Guidelines -->
    <div class="modal-rules-section modal-anim-item">
      <div class="rules-header-row">
        <h3 class="rules-heading">EVENT SPECIFICATIONS</h3>
      </div>
      ${rulebookViewerHtml}
    </div>

    <!-- Bottom Action Bar: Register Now (Direct Link to Category Razorpay Portal) -->
    <div class="modal-cta-row modal-anim-item">
      <div class="modal-reg-status">
        <span class="reg-live-dot"></span>
        <span>REGISTRATIONS ACTIVE • JU TECHFEST 2026</span>
      </div>
      <a href="${regUrl}" target="_blank" rel="noopener noreferrer" class="modal-register-btn" id="event-action-register-btn">
        <span>REGISTER NOW</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
          <line x1="5" y1="12" x2="19" y2="12"></line>
          <polyline points="12 5 19 12 12 19"></polyline>
        </svg>
      </a>
    </div>
  `;

  const centerX = originPoint.x;
  const centerY = originPoint.y;

  modal.style.display = "flex";
  modal.classList.add("open");
  document.body.classList.add("event-modal-active");
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

  document.body.classList.remove("event-modal-active");

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

  const homeAndLogoLinks = document.querySelectorAll(".nav-logo-link, .menu-item[data-target='home']");
  homeAndLogoLinks.forEach((link) => {
    link.addEventListener("click", () => {
      try {
        sessionStorage.removeItem("return_to_domains");
      } catch (err) {}
    });
  });

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
        if (
          (href === "/events" || href === "/events/" || href === "/events.html") &&
          (window.location.pathname === "/events" || window.location.pathname === "/events/" || window.location.pathname.endsWith("events.html"))
        ) {
          e.preventDefault();
          if (isMenuOpen) toggleMenu();
        } else if (href === "/") {
          try {
            sessionStorage.removeItem("return_to_domains");
          } catch (_) {}
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
