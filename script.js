/* ============================================================
   SELETE PORTFOLIO — script.js
   - Visitor tracking (GoatCounter — real global count)
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
// Admin visits are NOT counted (GoatCounter no_onload set in index.html)
const IS_ADMIN = new URLSearchParams(window.location.search).has('admin');

// ── VISITOR COUNTER (GoatCounter — real global count) ────────
(function initVisitorCounter() {
  const FIRST_KEY = "san_first_visit";

  // Record first local visit date as a personal reference
  if (!IS_ADMIN && !localStorage.getItem(FIRST_KEY)) {
    localStorage.setItem(FIRST_KEY, new Date().toISOString());
  }

  const firstISO = localStorage.getItem(FIRST_KEY);
  const firstDate = firstISO
    ? new Date(firstISO).toLocaleDateString("en-GB", { month: "long", day: "numeric", year: "numeric" })
    : "—";

  // Animate a number counting up smoothly
  function animateCount(el, target, duration = 1500) {
    if (!el || !target) return;
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

  function renderUI(count) {
    // Hide counter sections from public — show only in admin mode
    const visitorSection = document.getElementById("visitors");
    const visitorNavLink = document.querySelector('a[href="#visitors"]');
    if (visitorSection) visitorSection.style.display = IS_ADMIN ? "" : "none";
    if (visitorNavLink && !IS_ADMIN) visitorNavLink.parentElement.style.display = "none";

    const heroBadge = document.querySelector(".hero-badge");
    if (heroBadge) heroBadge.style.display = IS_ADMIN ? "" : "none";

    const statEl2 = document.getElementById("statVisitors");
    if (statEl2 && !IS_ADMIN) statEl2.textContent = "—";

    if (!IS_ADMIN) return; // public sees nothing below this line

    // ── Admin view: show real global count ──
    const badge = document.getElementById("visitorBadge");
    if (badge) badge.textContent = `${count.toLocaleString()} visitor${count !== 1 ? "s" : ""} so far`;

    const statEl = document.getElementById("statVisitors");
    if (statEl) animateCount(statEl, count, 1200);

    const countEl = document.getElementById("visitorCount");
    if (countEl) animateCount(countEl, count, 1800);

    const dateEl = document.getElementById("firstVisitDate");
    if (dateEl) dateEl.textContent = firstDate;

    const fillEl = document.getElementById("visitorFill");
    if (fillEl) {
      const percent = Math.min((count / 1000) * 100, 100);
      setTimeout(() => { fillEl.style.width = percent + "%"; }, 400);
    }
  }

  function init() {
    if (!IS_ADMIN) {
      renderUI(0); // just hide counter sections for public
      return;
    }

    // Use GoatCounter's official visit_count() API.
    // Requires "Allow adding visitor counts on your website" enabled in
    // GoatCounter Settings > Site. Renders a count into a hidden probe element,
    // then we read the number and feed it into the animated UI.

    // Create a hidden probe element for GoatCounter to write into
    const probe = document.createElement("span");
    probe.id = "gc-probe";
    probe.style.display = "none";
    document.body.appendChild(probe);

    // Poll until count.js has loaded and visit_count is available
    var attempts = 0;
    var t = setInterval(function () {
      attempts++;
      if (window.goatcounter && window.goatcounter.visit_count) {
        clearInterval(t);

        window.goatcounter.visit_count({
          append: "#gc-probe",
          path: location.pathname || "/"
        });

        // Give GoatCounter a moment to write the number into the probe
        setTimeout(function () {
          var raw = (probe.textContent || "").replace(/[^0-9]/g, "");
          var count = parseInt(raw, 10) || 0;
          document.body.removeChild(probe);
          renderUI(count);
        }, 1200);

      } else if (attempts > 80) {
        // count.js never loaded after ~8 seconds — fall back to dashboard link
        clearInterval(t);
        document.body.removeChild(probe);
        var badge = document.getElementById("visitorBadge");
        if (badge) {
          badge.innerHTML = '<a href="https://selete-portfolio.goatcounter.com" target="_blank" rel="noopener" style="color:inherit;text-decoration:underline">Open GoatCounter dashboard →</a>';
        }
        renderUI(0);
      }
    }, 100);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
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

  // Open mailto link so the message lands in Selete's inbox
  const subject = encodeURIComponent(`Portfolio message from ${name.value.trim()}`);
  const body = encodeURIComponent(
    `Name: ${name.value.trim()}\nEmail: ${email.value.trim()}\n\nMessage:\n${message.value.trim()}`
  );
  window.location.href = `mailto:narteykwasi@gmail.com?subject=${subject}&body=${body}`;

  // Reset form after a short delay
  setTimeout(() => {
    name.value = "";
    email.value = "";
    message.value = "";
    showToast("✅ Your email app should open — just hit Send!");
  }, 500);
}


// ── TOAST NOTIFICATION ────────────────────────────────────────
function showToast(msg) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3500);
}
