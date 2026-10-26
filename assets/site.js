/* ==========================================================================
   Subscribe form + reading progress
   --------------------------------------------------------------------------
   SUBSCRIBE_ENDPOINT is the URL every signup is POSTed to. By default it
   points at the Google Apps Script web app in subscribe/apps-script.gs,
   which appends each email to a Google Sheet you own. See README.md.
   ========================================================================== */

const SUBSCRIBE_ENDPOINT = "https://script.google.com/macros/s/AKfycbyLP87Zn6bukzyrNROPQ0FMo1TlC2FbhkQsYXjxjFmmeSDq9aHhA6M_COsLeb4ckVJn6A/exec"

/* Analytics: PostHog, loaded by a <script> tag before this file. The project token is public by design (it can only send events). Uses PostHog's default cookie storage so returning visitors are recognized. */
const POSTHOG_TOKEN = "phc_w5otgwEvLkUoDvUyJSbbhyDOZyWsSUstINe98nOr5lx";
const POSTHOG_HOST = "https://us.i.posthog.com";

if (window.posthog) {
  posthog.init(POSTHOG_TOKEN, {
    api_host: POSTHOG_HOST,
    person_profiles: "identified_only",
    disable_session_recording: true,
  });
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

document.querySelectorAll("form.subscribe-form").forEach((form) => {
  const input = form.querySelector('input[type="email"]');
  const button = form.querySelector('button[type="submit"]');
  const status = form.querySelector(".subscribe-form__status");

  const setStatus = (msg, state) => {
    status.textContent = msg;
    status.dataset.state = state || "";
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Honeypot: real people never fill this hidden field
    if (form.elements.company && form.elements.company.value) return;

    const email = input.value.trim();
    if (!EMAIL_RE.test(email)) {
      setStatus("Please enter a valid email address.", "error");
      input.focus();
      return;
    }

    if (!SUBSCRIBE_ENDPOINT) {
      console.warn("[subscribe] SUBSCRIBE_ENDPOINT is not set in assets/site.js");
      setStatus("Signups open soon. Please check back shortly.", "error");
      return;
    }

    button.disabled = true;
    setStatus("Subscribing…");

    try {
      // Form-encoded + no-cors keeps this a "simple" request, which Apps Script
      // accepts without a CORS preflight. The response is opaque, so a resolved
      // fetch is treated as success.
      await fetch(SUBSCRIBE_ENDPOINT, {
        method: "POST",
        mode: "no-cors",
        body: new URLSearchParams({
          email,
          source: form.dataset.source || location.pathname,
          referrer: document.referrer,
        }),
      });
      form.reset();
      setStatus("You're on the list. New parts will arrive in your inbox.", "ok");
      // Which page converted; never the email itself
      window.posthog?.capture("subscribed", { source: form.dataset.source || location.pathname });
    } catch (err) {
      console.error("[subscribe]", err);
      setStatus("Something went wrong. Please try again.", "error");
    } finally {
      button.disabled = false;
    }
  });
});

// Locked parts: a click (or Enter/Space) toggles an early-access note
const LOCKED_NOTE = 'Building, researching, or governing at the frontier? ' +
  '<a href="mailto:e@american-intelligence.ai">Get in touch</a> for early access.';

document.querySelectorAll(".toc__item--locked .toc__link, .essay-nav__item--locked").forEach((el) => {
  const note = document.createElement("p");
  note.className = "locked-note";
  note.hidden = true;
  note.innerHTML = LOCKED_NOTE;
  el.append(note);

  el.setAttribute("role", "button");
  el.setAttribute("aria-expanded", "false");
  el.tabIndex = 0;

  const toggle = (e) => {
    if (e.target.closest("a")) return; // let the email link work
    note.hidden = !note.hidden;
    el.setAttribute("aria-expanded", String(!note.hidden));
  };
  el.addEventListener("click", toggle);
  el.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(e); }
  });
});

const progress = document.querySelector(".progress");
if (progress) {
  const update = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? Math.min(scrollY / max, 1) : 0})`;
  };
  addEventListener("scroll", update, { passive: true });
  addEventListener("resize", update);
  update();
}
