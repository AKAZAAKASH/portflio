/* ==========================================================================
   Akash Chandran — Portfolio
   Vanilla JS: theme toggle, typing effect, scroll reveal, navbar state,
   scroll progress, back-to-top, mobile menu, skill bars, contact validation.
   ========================================================================== */
(function () {
  "use strict";

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* --------------------------------------------------------------------------
     0. PRELOADER (loading animation with the name)
     -------------------------------------------------------------------------- */
  const preloader = $("#preloader");
  if (preloader) {
    // Stagger each letter's entrance for a smooth wave effect
    $$(".preloader-name span").forEach((letter, idx) => {
      letter.style.animationDelay = (0.25 + idx * 0.05) + "s";
    });

    const start = Date.now();
    const MIN_VISIBLE = prefersReduced ? 0 : 2200; // let the animation finish

    const hidePreloader = () => {
      const wait = Math.max(0, MIN_VISIBLE - (Date.now() - start));
      setTimeout(() => {
        preloader.classList.add("hide");
        document.body.style.overflow = "";
        // Remove from DOM after the fade so it can't trap focus
        setTimeout(() => preloader.remove(), 700);
      }, wait);
    };

    // Lock scroll while loading, then reveal
    document.body.style.overflow = "hidden";
    if (document.readyState === "complete") hidePreloader();
    else window.addEventListener("load", hidePreloader);
    // Safety net in case 'load' never fires
    setTimeout(hidePreloader, 5000);
  }

  /* --------------------------------------------------------------------------
     1. THEME TOGGLE (persisted in localStorage)
     -------------------------------------------------------------------------- */
  const root = document.documentElement;
  const themeToggle = $("#themeToggle");
  const STORAGE_KEY = "portfolio-theme";

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    if (themeToggle) {
      themeToggle.setAttribute("aria-label", `Switch to ${theme === "dark" ? "light" : "dark"} mode`);
    }
  }

  // Initial theme: saved choice → system preference → dark
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    applyTheme(saved);
  } else {
    const systemLight = window.matchMedia("(prefers-color-scheme: light)").matches;
    applyTheme(systemLight ? "light" : "dark");
  }

  themeToggle?.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(next);
    localStorage.setItem(STORAGE_KEY, next);
  });

  /* --------------------------------------------------------------------------
     2. TYPING EFFECT (hero)
     -------------------------------------------------------------------------- */
  const typedEl = $("#typed");
  const phrases = [
    "clean web experiences.",
    "accessible interfaces.",
    "fast, modern UIs.",
    "things people enjoy using.",
  ];

  if (typedEl) {
    if (prefersReduced) {
      typedEl.textContent = phrases[0]; // respect reduced motion
    } else {
      let p = 0, i = 0, deleting = false;

      const type = () => {
        const current = phrases[p];
        typedEl.textContent = deleting
          ? current.slice(0, i--)
          : current.slice(0, i++);

        let delay = deleting ? 45 : 85;

        if (!deleting && i > current.length) {
          deleting = true;
          delay = 1600;               // pause at full word
        } else if (deleting && i < 0) {
          deleting = false;
          i = 0;
          p = (p + 1) % phrases.length; // next phrase
          delay = 350;
        }
        setTimeout(type, delay);
      };
      type();
    }
  }

  /* --------------------------------------------------------------------------
     3. SCROLL REVEAL (IntersectionObserver) + skill bar fill
     -------------------------------------------------------------------------- */
  const revealEls = $$(".reveal");

  if ("IntersectionObserver" in window && !prefersReduced) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          // fill any skill bars inside this revealed element
          $$(".bar-fill", entry.target).forEach((bar) => {
            bar.style.width = (bar.dataset.level || 0) + "%";
          });
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });

    revealEls.forEach((el) => io.observe(el));
  } else {
    // Fallback: show everything immediately
    revealEls.forEach((el) => el.classList.add("visible"));
    $$(".bar-fill").forEach((bar) => (bar.style.width = (bar.dataset.level || 0) + "%"));
  }

  /* --------------------------------------------------------------------------
     4. NAVBAR: scrolled state, scroll progress, active link, back-to-top
     -------------------------------------------------------------------------- */
  const navbar = $("#navbar");
  const progress = $("#scrollProgress");
  const toTop = $("#toTop");
  const boostMeter = $("#boostMeter");
  const boostNum = $("#boostNum");
  const boostGauge = $("#boostGauge");

  // Build the Rocket League boost-meter ticks once.
  // Ticks span an arc with an open gap at the bottom; the fill starts at the
  // bottom-left edge and grows up the left side and over the top.
  const BOOST_TICKS = 44;
  const tickEls = [];
  const boostRim = $("#boostRim");
  if (boostRim) {
    const startA = 40, sweep = 280, rInner = 39, lenMin = 9, lenMax = 20;
    for (let i = 0; i < BOOST_TICKS; i++) {
      const t = i / (BOOST_TICKS - 1);
      const tick = document.createElement("div");
      tick.className = "b-tick";
      tick.style.setProperty("--a", (startA + t * sweep).toFixed(2) + "deg");
      // sin profile → short at the ends (by the gap), tallest at the top
      tick.style.setProperty("--len", (lenMin + (lenMax - lenMin) * Math.sin(t * Math.PI)).toFixed(1) + "px");
      tick.style.setProperty("--r", rInner + "px");
      boostRim.appendChild(tick);
      tickEls.push(tick);
    }
  }
  const navLinks = $$(".nav-link");
  const sections = navLinks
    .map((link) => $(link.getAttribute("href")))
    .filter(Boolean);

  function onScroll() {
    const y = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (y / docHeight) * 100 : 0;

    // Scroll progress / boost bar
    if (progress) progress.style.width = pct + "%";

    // Boost gauge fills 0 -> 100 as you scroll (RL boost meter)
    if (boostNum) boostNum.textContent = Math.round(pct);
    const lit = Math.round((pct / 100) * BOOST_TICKS);
    for (let i = 0; i < tickEls.length; i++) {
      tickEls[i].classList.toggle("lit", i < lit);
      tickEls[i].classList.toggle("tip", i === lit - 1 && lit < BOOST_TICKS);
    }
    // Full boost: shimmer/pulse like the in-game meter when it's maxed
    boostGauge?.classList.toggle("full", lit >= BOOST_TICKS);
    boostMeter?.classList.toggle("show", y > 160);

    // Navbar border once scrolled
    navbar?.classList.toggle("scrolled", y > 12);

    // Back-to-top visibility
    toTop?.classList.toggle("show", y > 500);

    // Active section highlight
    let activeId = sections[0]?.id;
    const mark = y + window.innerHeight * 0.35;
    for (const sec of sections) {
      if (sec.offsetTop <= mark) activeId = sec.id;
    }
    navLinks.forEach((link) =>
      link.classList.toggle("active", link.getAttribute("href") === "#" + activeId)
    );
  }

  // rAF-throttled scroll handler
  let ticking = false;
  window.addEventListener("scroll", () => {
    if (!ticking) {
      window.requestAnimationFrame(() => { onScroll(); ticking = false; });
      ticking = true;
    }
  }, { passive: true });
  onScroll();

  toTop?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
  });

  /* --------------------------------------------------------------------------
     5. MOBILE MENU
     -------------------------------------------------------------------------- */
  const menuToggle = $("#menuToggle");
  const navLinksWrap = $("#navLinks");

  function setMenu(open) {
    navLinksWrap?.classList.toggle("open", open);
    menuToggle?.setAttribute("aria-expanded", String(open));
    menuToggle?.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  menuToggle?.addEventListener("click", () => {
    setMenu(!navLinksWrap.classList.contains("open"));
  });
  // Close menu after choosing a link
  navLinks.forEach((link) => link.addEventListener("click", () => setMenu(false)));
  // Close on Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setMenu(false);
  });

  /* --------------------------------------------------------------------------
     6. CONTACT FORM VALIDATION (client-side, no backend)
     -------------------------------------------------------------------------- */
  const form = $("#contactForm");
  const status = $("#formStatus");
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function setError(field, msg) {
    const wrap = field.closest(".field");
    const err = wrap?.querySelector(".error");
    wrap?.classList.toggle("invalid", Boolean(msg));
    if (err) err.textContent = msg || "";
    return !msg;
  }

  function validate() {
    const name = $("#name"), email = $("#email"), message = $("#message");
    let ok = true;
    ok = setError(name, name.value.trim() ? "" : "Please enter your name.") && ok;
    ok = setError(email, emailRe.test(email.value.trim()) ? "" : "Enter a valid email address.") && ok;
    ok = setError(message, message.value.trim().length >= 10 ? "" : "Message should be at least 10 characters.") && ok;
    return ok;
  }

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validate()) {
      if (status) { status.style.color = "#e74c6f"; status.textContent = "Please fix the highlighted fields."; }
      return;
    }
    // No backend here — simulate success. Wire to a service (Formspree, etc.) as needed.
    if (status) {
      status.style.color = "";
      status.textContent = "Nice shot! Your message is on its way — I'll reply soon.";
    }
    form.reset();
    $$(".field").forEach((f) => f.classList.remove("invalid"));
  });

  // Clear an individual error as the user fixes it
  $$("#contactForm input, #contactForm textarea").forEach((input) => {
    input.addEventListener("input", () => {
      if (input.closest(".field").classList.contains("invalid")) validate();
    });
  });

  /* --------------------------------------------------------------------------
     7. QUICK-CHAT EASTER EGG (Rocket League)
        Press 1-4 anywhere (outside form fields) to fire a quick chat,
        just like the in-game wheel. Each key maps to a category.
     -------------------------------------------------------------------------- */
  const quickChats = {
    "1": ["I got it!", "Need boost!", "Take the shot!", "Defending...", "Go for it!"], // Information
    "2": ["Nice shot!", "Great pass!", "Thanks!", "What a save!", "Nice one!"],        // Compliments
    "3": ["Wow!", "Close one!", "No way!", "Calculated.", "Whew!"],                    // Reactions
    "4": ["Sorry!", "My bad.", "No problem.", "Whoops.", "All yours."],                // Apologies
  };

  let qcToast = null;
  let qcTimer = null;

  function showQuickChat(text) {
    if (!qcToast) {
      qcToast = document.createElement("div");
      qcToast.className = "qc-toast";
      qcToast.setAttribute("role", "status");
      qcToast.setAttribute("aria-live", "polite");
      document.body.appendChild(qcToast);
    }
    qcToast.textContent = text;
    // Force reflow so the show transition replays on rapid presses
    void qcToast.offsetWidth;
    qcToast.classList.add("show");
    clearTimeout(qcTimer);
    qcTimer = setTimeout(() => qcToast.classList.remove("show"), 1600);
  }

  document.addEventListener("keydown", (e) => {
    // Ignore when typing in a field or using modifier keys
    const tag = (e.target.tagName || "").toLowerCase();
    if (tag === "input" || tag === "textarea" || e.ctrlKey || e.metaKey || e.altKey) return;

    const group = quickChats[e.key];
    if (group) {
      const phrase = group[Math.floor(Math.random() * group.length)];
      showQuickChat(phrase);
    }
  });

  // Subtle hint for the curious (console only — keeps the UI clean)
  console.log("%c🚀 Psst — press 1, 2, 3 or 4 for a Rocket League quick chat.",
    "color:#ff8a00;font-weight:bold;font-size:13px;");

  /* --------------------------------------------------------------------------
     8. ALPHA BOOST CURSOR TRAIL
        Golden boost particles trail the cursor (desktop / fine pointer only).
     -------------------------------------------------------------------------- */
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  if (finePointer && !prefersReduced) {
    let lastX = null, lastY = null;

    const spawnFlame = (x, y, size) => {
      const p = document.createElement("div");
      p.className = "boost-particle";
      p.style.left = x + "px";
      p.style.top = y + "px";
      p.style.width = p.style.height = size + "px";
      // Small jitter so the flame flickers as it rises/falls
      p.style.setProperty("--dx", (Math.random() * 10 - 5).toFixed(1) + "px");
      p.style.setProperty("--dy", (6 + Math.random() * 12).toFixed(1) + "px");
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 550);
    };

    window.addEventListener("mousemove", (e) => {
      const x = e.clientX, y = e.clientY;
      if (lastX === null) { lastX = x; lastY = y; }

      // Lay down particles ALONG the path so the trail reads as one
      // continuous flame ribbon instead of separated dots ("fireflies").
      const dx = x - lastX, dy = y - lastY;
      const dist = Math.hypot(dx, dy);
      const steps = Math.min(Math.floor(dist / 5), 14); // cap on fast moves

      for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        spawnFlame(lastX + dx * t, lastY + dy * t, 11 + Math.random() * 8);
      }
      if (steps === 0 && dist > 1) spawnFlame(x, y, 11 + Math.random() * 8);

      lastX = x; lastY = y;
    }, { passive: true });
  }

  /* --------------------------------------------------------------------------
     9. FOOTER YEAR
     -------------------------------------------------------------------------- */
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
