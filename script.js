/* ============================================================
   SELETE PORTFOLIO — script.js
   - Visitor tracking (localStorage)
   - Admin mode via ?admin URL param (owner-only counter view)
   - Scroll reveal animations
   - Project tag filtering
   - Navbar scroll behaviour
   - Contact form validation
   - Mobile menu
============================================================ */

// ── ADMIN MODE ────────────────────────────────────────────────
// The visitor counter section & hero badge are hidden from public visitors.
// To see them, visit your site with ?admin at the end of the URL:
//   e.g.  https://selete-tetteh.github.io?admin
const IS_ADMIN = new URLSearchParams(window.location.search).has('admin');

// ── VISITOR COUNTER ──────────────────────────────────────────
(function initVisitorCounter() {
  const COUNT_KEY = "san_visit_count";
  const FIRST_KEY = "san_first_visit";
  const LOG_KEY = "san_visit_log";

  // Increment count
  let count = parseInt(localStorage.getItem(COUNT_KEY) || "0", 10) + 1;
  localStorage.setItem(COUNT_KEY, count);

  // Record first visit date
  if (!localStorage.getItem(FIRST_KEY)) {
    localStorage.setItem(FIRST_KEY, new Date().toISOString());
  }

  // Append to visit log (max 100 entries)
  try {
    let log = JSON.parse(localStorage.getItem(LOG_KEY) || "[]");
    log.push({ time: new Date().toISOString(), visit: count });
    if (log.length > 100) log = log.slice(-100);
    localStorage.setItem(LOG_KEY, JSON.stringify(log));
  } catch (_) { }

  // Format first visit date
  const firstISO = localStorage.getItem(FIRST_KEY);
  const firstDate = firstISO
    ? new Date(firstISO).toLocaleDateString("en-GB", { month: "long", day: "numeric", year: "numeric" })
    : "—";

  // Animate count up
  function animateCount(el, target, duration = 1500) {
    if (!el) return;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target).toLocaleString();
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target.toLocaleString();
    };
    requestAnimationFrame(step);
  }

  function setVisitorUI() {
    // Show visitor section only in admin mode
    const visitorSection = document.getElementById('visitors');
    const visitorNavLink = document.querySelector('a[href="#visitors"]');
    if (visitorSection) visitorSection.style.display = IS_ADMIN ? '' : 'none';
    if (visitorNavLink && !IS_ADMIN) visitorNavLink.parentElement.style.display = 'none';

    // Show hero badge only in admin mode
    const heroBadge = document.querySelector('.hero-badge');
    if (heroBadge) heroBadge.style.display = IS_ADMIN ? '' : 'none';

    // Stat in hero — show dash if not admin
    const statEl2 = document.getElementById('statVisitors');
    if (statEl2 && !IS_ADMIN) { statEl2.textContent = '—'; }

    if (!IS_ADMIN) return; // don't set counter text for public
    // Hero badge
    const badge = document.getElementById("visitorBadge");
    if (badge) badge.textContent = `${count.toLocaleString()} visitor${count !== 1 ? "s" : ""} so far`;

    // Stat in hero
    const statEl = document.getElementById("statVisitors");
    if (statEl) animateCount(statEl, count, 1200);

    // Big counter section
    const countEl = document.getElementById("visitorCount");
    if (countEl) animateCount(countEl, count, 1800);

    // First visit date
    const dateEl = document.getElementById("firstVisitDate");
    if (dateEl) dateEl.textContent = firstDate;

    // Progress bar (visual only — fills proportionally up to 1000)
    const fillEl = document.getElementById("visitorFill");
    if (fillEl) {
      const percent = Math.min((count / 1000) * 100, 100);
      setTimeout(() => { fillEl.style.width = percent + "%"; }, 400);
    }
  }

  // Run after DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setVisitorUI);
  } else {
    setVisitorUI();
  }
})();


// ── NAVBAR SCROLL BEHAVIOUR ───────────────────────────────────
window.addEventListener("scroll", () => {
  const nav = document.getElementById("navbar");
  if (!nav) return;
  if (window.scrollY > 60) {
    nav.classList.add("scrolled");
  } else {
    nav.classList.remove("scrolled");
  }
});


// ── MOBILE MENU ───────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.getElementById("hamburger");
  const mobileMenu = document.getElementById("mobileMenu");

  if (hamburger && mobileMenu) {
    hamburger.addEventListener("click", () => {
      hamburger.classList.toggle("open");
      mobileMenu.classList.toggle("open");
    });
    // Close on link click
    mobileMenu.querySelectorAll(".mobile-link").forEach(link => {
      link.addEventListener("click", () => {
        hamburger.classList.remove("open");
        mobileMenu.classList.remove("open");
      });
    });
  }

  // Smooth scroll for all nav links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", (e) => {
      const target = document.querySelector(anchor.getAttribute("href"));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  });
});


// ── SCROLL REVEAL (Intersection Observer) ─────────────────────
document.addEventListener("DOMContentLoaded", () => {
  const elements = document.querySelectorAll(".reveal");
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  elements.forEach((el) => observer.observe(el));
});


// ── PROJECT TAG FILTER ────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".filter-btn");
  const cards = document.querySelectorAll(".project-card");

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const filter = btn.getAttribute("data-filter");
      cards.forEach(card => {
        const tags = card.getAttribute("data-tags") || "";
        if (filter === "all" || tags.includes(filter)) {
          card.style.display = "";
          setTimeout(() => card.classList.add("visible"), 50);
        } else {
          card.style.display = "none";
        }
      });
    });
  });
});


// ── CONTACT FORM ──────────────────────────────────────────────
function handleFormSubmit(e) {
  e.preventDefault();

  const name = document.getElementById("name");
  const email = document.getElementById("email");
  const message = document.getElementById("message");
  const btn = document.getElementById("submitBtn");

  let valid = true;

  function setError(fieldId, msg) {
    const el = document.getElementById(fieldId + "Error");
    if (el) el.textContent = msg;
    if (msg) valid = false;
  }

  setError("name", name.value.trim() ? "" : "Please enter your name.");
  setError("email", /\S+@\S+\.\S+/.test(email.value.trim()) ? "" : "Please enter a valid email.");
  setError("message", message.value.trim() ? "" : "Please enter a message.");

  if (!valid) return;

  // Simulate sending
  btn.textContent = "Sending…";
  btn.disabled = true;

  setTimeout(() => {
    btn.textContent = "Send Message";
    btn.disabled = false;
    name.value = "";
    email.value = "";
    message.value = "";
    showToast("✅ Message sent! I'll be in touch soon.");
  }, 1200);
}


// ── TOAST NOTIFICATION ────────────────────────────────────────
function showToast(msg) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3500);
}
