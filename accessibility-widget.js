/**
 * Accessibility Widget - Standalone Vanilla JS
 * Renders a floating a11y panel in a Shadow DOM with global CSS injection.
 * All preferences are persisted in localStorage.
 */
(function () {
  "use strict";

  const STORAGE_KEY = "a11y-widget-state";
  const WIDGET_ID = "a11y-widget-root";

  // ── Default State ──────────────────────────────────────────────────
  const defaults = {
    profile: null,
    contrast: "normal",
    textSize: 100,
    lineHeight: 100,
    letterSpacing: 100,
    textAlign: "standard",
    linkHighlight: false,
    headingHighlight: false,
  };

  let state = { ...defaults };

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) state = { ...defaults, ...JSON.parse(raw) };
    } catch (_) { /* ignore */ }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (_) { /* ignore */ }
  }

  // ── Global CSS Injection ───────────────────────────────────────────
  let styleEl = null;

  function ensureStyleEl() {
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = "a11y-global-styles";
      document.head.appendChild(styleEl);
    }
  }

  const EXCLUDE = ":not(#a11y-widget-root)";

  function buildGlobalCSS() {
    const s = state;
    const txtScale = s.textSize / 100;
    const lh = s.lineHeight / 100;
    const ls = s.letterSpacing / 100;

    return `
/* ── A11y Widget Global Styles ─────────────────────────────── */

/* Text sizing & spacing on html */
html.a11y-active {
  font-size: ${Math.round(txtScale * 100) / 100 * 100}% !important;
}
html.a11y-active {
  line-height: ${lh} !important;
  letter-spacing: ${(ls - 1) * 0.2}em !important;
}

/* ── Profiles ──────────────────────────────────────────────── */

/* Vision impairment */
body.a11y-profile-vision${EXCLUDE} {
  filter: contrast(1.2);
}

/* Dyslexia */
body.a11y-profile-dyslexie${EXCLUDE},
body.a11y-profile-dyslexie ${EXCLUDE} {
  font-family: 'OpenDyslexic', Arial, Helvetica, sans-serif !important;
  letter-spacing: 0.12em !important;
  word-spacing: 0.16em !important;
}

/* ADHD – reduce distractions */
body.a11y-profile-adhs ${EXCLUDE} a,
body.a11y-profile-adhs ${EXCLUDE} button {
  outline: 2px solid #005fcc !important;
  outline-offset: 2px !important;
}
body.a11y-profile-adhs ${EXCLUDE} img,
body.a11y-profile-adhs ${EXCLUDE} video,
body.a11y-profile-adhs ${EXCLUDE} iframe {
  opacity: 0.7;
}

/* Motor */
body.a11y-profile-motor ${EXCLUDE} a,
body.a11y-profile-motor ${EXCLUDE} button,
body.a11y-profile-motor ${EXCLUDE} input,
body.a11y-profile-motor ${EXCLUDE} select,
body.a11y-profile-motor ${EXCLUDE} textarea,
body.a11y-profile-motor ${EXCLUDE} [role="button"],
body.a11y-profile-motor ${EXCLUDE} [onclick] {
  min-height: 44px !important;
  min-width: 44px !important;
  padding: 12px 18px !important;
  font-size: 1.1em !important;
}
body.a11y-profile-motor {
  cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Ccircle cx='16' cy='16' r='14' fill='rgba(255,0,0,0.35)' stroke='%23000' stroke-width='2'/%3E%3C/svg%3E") 16 16, auto;
}

/* Cognitive */
body.a11y-profile-kognitiv${EXCLUDE} {
  line-height: 1.8 !important;
  letter-spacing: 0.05em !important;
}
body.a11y-profile-kognitiv${EXCLUDE} *:not(#a11y-widget-root) {
  line-height: 1.8 !important;
  letter-spacing: 0.05em !important;
}
body.a11y-profile-kognitiv ${EXCLUDE} img {
  max-width: 100%;
  height: auto;
}

/* Epilepsy – kill animations */
body.a11y-profile-epilepsie ${EXCLUDE} *,
body.a11y-profile-epilepsie ${EXCLUDE} *::before,
body.a11y-profile-epilepsie ${EXCLUDE} *::after {
  animation-duration: 0.001s !important;
  animation-delay: 0s !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.001s !important;
  transition-delay: 0s !important;
  scroll-behavior: auto !important;
}
body.a11y-profile-epilepsie ${EXCLUDE} video,
body.a11y-profile-epilepsie ${EXCLUDE} iframe {
  animation: none !important;
}

/* ── Contrast modes ────────────────────────────────────────── */
body.a11y-contrast-dark {
  background-color: #1a1a2e !important;
  color: #e0e0e0 !important;
}
body.a11y-contrast-dark${EXCLUDE} * {
  border-color: #444 !important;
}
body.a11y-contrast-dark ${EXCLUDE} img {
  opacity: 0.85;
}

body.a11y-contrast-light {
  background-color: #fdfdfd !important;
  color: #222 !important;
}

body.a11y-contrast-high {
  background-color: #000 !important;
  color: #ff0 !important;
}
body.a11y-contrast-high${EXCLUDE} * {
  border-color: #ff0 !important;
}
body.a11y-contrast-high ${EXCLUDE} a {
  color: #0ff !important;
}

/* ── Text alignment ────────────────────────────────────────── */
body.a11y-align-left ${EXCLUDE} * {
  text-align: left !important;
}
body.a11y-align-center ${EXCLUDE} * {
  text-align: center !important;
}

/* ── Link highlight ────────────────────────────────────────── */
body.a11y-link-highlight ${EXCLUDE} a,
body.a11y-link-highlight ${EXCLUDE} a * {
  text-decoration: underline !important;
  text-decoration-thickness: 3px !important;
  text-underline-offset: 4px !important;
  background-color: rgba(0, 120, 255, 0.12) !important;
  border-bottom: 3px solid #0078ff !important;
  padding-bottom: 1px !important;
  border-radius: 3px !important;
}

/* ── Heading highlight ─────────────────────────────────────── */
body.a11y-heading-highlight ${EXCLUDE} h1,
body.a11y-heading-highlight ${EXCLUDE} h2,
body.a11y-heading-highlight ${EXCLUDE} h3,
body.a11y-heading-highlight ${EXCLUDE} h4,
body.a11y-heading-highlight ${EXCLUDE} h5,
body.a11y-heading-highlight ${EXCLUDE} h6 {
  border-left: 5px solid #ff6600 !important;
  background-color: rgba(255, 102, 0, 0.10) !important;
  padding: 8px 14px !important;
  margin: 12px 0 !important;
  border-radius: 0 8px 8px 0 !important;
}
`;
  }

  function applyGlobalStyles() {
    ensureStyleEl();
    styleEl.textContent = buildGlobalCSS();

    // Toggle the a11y-active class on html and body
    document.documentElement.classList.toggle("a11y-active", state.textSize !== 100 || state.lineHeight !== 100 || state.letterSpacing !== 100);

    // Profile class on body
    document.body.classList.remove(
      "a11y-profile-vision",
      "a11y-profile-dyslexie",
      "a11y-profile-adhs",
      "a11y-profile-motor",
      "a11y-profile-kognitiv",
      "a11y-profile-epilepsie"
    );
    if (state.profile) {
      document.body.classList.add("a11y-profile-" + state.profile);
    }

    // Contrast class on body
    document.body.classList.remove(
      "a11y-contrast-normal",
      "a11y-contrast-dark",
      "a11y-contrast-light",
      "a11y-contrast-high"
    );
    document.body.classList.add("a11y-contrast-" + state.contrast);

    // Align
    document.body.classList.remove("a11y-align-left", "a11y-align-center");
    if (state.textAlign !== "standard") {
      document.body.classList.add("a11y-align-" + state.textAlign);
    }

    // Reading aid classes
    document.body.classList.toggle("a11y-link-highlight", !!state.linkHighlight);
    document.body.classList.toggle("a11y-heading-highlight", !!state.headingHighlight);
  }

  // ── Reset global styles on cleanup ─────────────────────────────────
  function clearGlobalStyles() {
    if (styleEl) {
      styleEl.remove();
      styleEl = null;
    }
    document.documentElement.classList.remove("a11y-active");
    document.body.classList.remove(
      "a11y-profile-vision", "a11y-profile-dyslexie", "a11y-profile-adhs",
      "a11y-profile-motor", "a11y-profile-kognitiv", "a11y-profile-epilepsie",
      "a11y-contrast-normal", "a11y-contrast-dark", "a11y-contrast-light", "a11y-contrast-high",
      "a11y-align-left", "a11y-align-center",
      "a11y-link-highlight", "a11y-heading-highlight"
    );
  }

  // ── Shadow DOM Setup ──────────────────────────────────────────────
  function createWidget() {
    // Remove existing instance if any
    const existing = document.getElementById(WIDGET_ID);
    if (existing) existing.remove();

    const host = document.createElement("div");
    host.id = WIDGET_ID;
    host.style.cssText = "position:fixed;bottom:20px;left:20px;z-index:999999;";
    document.body.appendChild(host);

    const shadow = host.attachShadow({ mode: "open" });

    // ── Build Shadow DOM content ────────────────────────────────────
    shadow.innerHTML = `
      <style>${widgetCSS()}</style>
      <div id="wrapper" class="wrapper">
        <!-- Trigger Button -->
        <button
          id="a11y-trigger"
          class="trigger-btn"
          aria-label="Barrierefreiheits-Einstellungen öffnen"
          aria-expanded="false"
          aria-controls="a11y-panel"
          title="Barrierefreiheits-Widget"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="28" height="28" aria-hidden="true" focusable="false">
            <circle cx="32" cy="32" r="30" fill="none" stroke="currentColor" stroke-width="4"/>
            <circle cx="32" cy="14" r="5" fill="currentColor"/>
            <path d="M20 30 h24 M32 18 v12 M24 42 l-4 12 M40 42 l4 12" stroke="currentColor" stroke-width="4" stroke-linecap="round" fill="none"/>
          </svg>
        </button>

        <!-- Panel -->
        <div id="a11y-panel" class="panel" role="dialog" aria-label="Barrierefreiheits-Einstellungen" tabindex="-1">
          <div class="panel-header">
            <span class="panel-title">Einstellungen</span>
            <button id="a11y-close" class="icon-btn" aria-label="Panel schließen" title="Schließen">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
          <div class="panel-body">

            <!-- Tab Navigation -->
            <nav class="tabs" role="tablist" aria-label="Einstellungs-Kategorien">
              <button class="tab active" role="tab" aria-selected="true" aria-controls="tab-profiles" id="btn-profiles">Profile</button>
              <button class="tab" role="tab" aria-selected="false" aria-controls="tab-display" id="btn-display" tabindex="-1">Darstellung</button>
              <button class="tab" role="tab" aria-selected="false" aria-controls="tab-reading" id="btn-reading" tabindex="-1">Lesehilfen</button>
            </nav>

            <!-- Tab: Profiles -->
            <div class="tab-panel" id="tab-profiles" role="tabpanel" aria-labelledby="btn-profiles">
              <div class="section-label">Vorlagen</div>
              <div class="profile-grid">
                <button class="profile-btn" data-profile="vision" aria-label="Profil Sehbehinderung aktivieren">
                  <span class="profile-icon">👁</span><span class="profile-name">Sehbehinderung</span>
                </button>
                <button class="profile-btn" data-profile="dyslexie" aria-label="Profil Dyslexie aktivieren">
                  <span class="profile-icon">📖</span><span class="profile-name">Dyslexie</span>
                </button>
                <button class="profile-btn" data-profile="adhs" aria-label="Profil ADHS aktivieren">
                  <span class="profile-icon">🧠</span><span class="profile-name">ADHS</span>
                </button>
                <button class="profile-btn" data-profile="motor" aria-label="Profil Motorik aktivieren">
                  <span class="profile-icon">🖱</span><span class="profile-name">Motorik</span>
                </button>
                <button class="profile-btn" data-profile="kognitiv" aria-label="Profil Kognitiv aktivieren">
                  <span class="profile-icon">💡</span><span class="profile-name">Kognitiv</span>
                </button>
                <button class="profile-btn" data-profile="epilepsie" aria-label="Profil Epilepsie aktivieren">
                  <span class="profile-icon">⚡</span><span class="profile-name">Epilepsie</span>
                </button>
              </div>
            </div>

            <!-- Tab: Display -->
            <div class="tab-panel hidden" id="tab-display" role="tabpanel" aria-labelledby="btn-display">

              <div class="section-label">Kontrast</div>
              <div class="contrast-grid">
                <button class="contrast-btn active" data-contrast="normal" aria-pressed="true">Normal</button>
                <button class="contrast-btn" data-contrast="dark" aria-pressed="false">Dunkel</button>
                <button class="contrast-btn" data-contrast="light" aria-pressed="false">Hell</button>
                <button class="contrast-btn" data-contrast="high" aria-pressed="false">Hoher Kontrast</button>
              </div>

              <div class="section-label">Textgröße</div>
              <div class="stepper-row">
                <button class="stepper-btn" data-action="textSize-down" aria-label="Textgröße verkleinern">−</button>
                <span class="stepper-value" id="textSize-val">${state.textSize}%</span>
                <button class="stepper-btn" data-action="textSize-up" aria-label="Textgröße vergrößern">+</button>
                <button class="stepper-btn reset" data-action="textSize-reset" aria-label="Textgröße zurücksetzen" title="Zurücksetzen">↺</button>
              </div>

              <div class="section-label">Zeilenabstand</div>
              <div class="stepper-row">
                <button class="stepper-btn" data-action="lineHeight-down" aria-label="Zeilenabstand verkleinern">−</button>
                <span class="stepper-value" id="lineHeight-val">${state.lineHeight}%</span>
                <button class="stepper-btn" data-action="lineHeight-up" aria-label="Zeilenabstand vergrößern">+</button>
                <button class="stepper-btn reset" data-action="lineHeight-reset" aria-label="Zeilenabstand zurücksetzen" title="Zurücksetzen">↺</button>
              </div>

              <div class="section-label">Buchstabenabstand</div>
              <div class="stepper-row">
                <button class="stepper-btn" data-action="letterSpacing-down" aria-label="Buchstabenabstand verkleinern">−</button>
                <span class="stepper-value" id="letterSpacing-val">${state.letterSpacing}%</span>
                <button class="stepper-btn" data-action="letterSpacing-up" aria-label="Buchstabenabstand vergrößern">+</button>
                <button class="stepper-btn reset" data-action="letterSpacing-reset" aria-label="Buchstabenabstand zurücksetzen" title="Zurücksetzen">↺</button>
              </div>

              <div class="section-label">Textausrichtung</div>
              <div class="align-row">
                <button class="align-btn active" data-align="standard" aria-pressed="true">Standard</button>
                <button class="align-btn" data-align="left" aria-pressed="false">Links</button>
                <button class="align-btn" data-align="center" aria-pressed="false">Zentriert</button>
              </div>

            </div>

            <!-- Tab: Reading Aids -->
            <div class="tab-panel hidden" id="tab-reading" role="tabpanel" aria-labelledby="btn-reading">

              <div class="toggle-row">
                <span class="toggle-label">Links hervorheben</span>
                <button class="toggle" role="switch" aria-checked="${state.linkHighlight}" data-toggle="linkHighlight" aria-label="Links hervorheben">
                  <span class="toggle-thumb"></span>
                </button>
              </div>

              <div class="toggle-row">
                <span class="toggle-label">Überschriften markieren</span>
                <button class="toggle" role="switch" aria-checked="${state.headingHighlight}" data-toggle="headingHighlight" aria-label="Überschriften markieren">
                  <span class="toggle-thumb"></span>
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    `;

    // ── Event Wiring ────────────────────────────────────────────────
    const $ = (sel) => shadow.querySelector(sel);
    const $$ = (sel) => shadow.querySelectorAll(sel);
    const trigger = $("#a11y-trigger");
    const panel = $("#a11y-panel");
    const closeBtn = $("#a11y-close");
    const wrapper = $("#wrapper");

    // ── Panel toggle ────────────────────────────────────────────────
    let panelOpen = false;

    function openPanel() {
      panelOpen = true;
      panel.classList.remove("hidden");
      trigger.setAttribute("aria-expanded", "true");
      trigger.setAttribute("aria-label", "Barrierefreiheits-Einstellungen schließen");
      panel.focus();
    }

    function closePanel() {
      panelOpen = false;
      panel.classList.add("hidden");
      trigger.setAttribute("aria-expanded", "false");
      trigger.setAttribute("aria-label", "Barrierefreiheits-Einstellungen öffnen");
      trigger.focus();
    }

    function togglePanel() {
      panelOpen ? closePanel() : openPanel();
    }

    trigger.addEventListener("click", togglePanel);
    closeBtn.addEventListener("click", closePanel);

    // Click outside to close
    document.addEventListener("click", (e) => {
      if (panelOpen && !wrapper.contains(e.target)) closePanel();
    });

    // Escape to close
    shadow.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && panelOpen) closePanel();
    });

    // Focus trap
    panel.addEventListener("keydown", (e) => {
      if (e.key !== "Tab" || !panelOpen) return;
      const focusable = panel.querySelectorAll(
        'button:not([disabled]), [tabindex="0"]'
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (shadow.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (shadow.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });

    // ── Tab switching ───────────────────────────────────────────────
    const tabBtns = $$(".tab");
    const tabPanels = $$(".tab-panel");

    function switchTab(btn) {
      tabBtns.forEach((b) => {
        b.classList.remove("active");
        b.setAttribute("aria-selected", "false");
        b.setAttribute("tabindex", "-1");
      });
      tabPanels.forEach((p) => p.classList.add("hidden"));
      btn.classList.add("active");
      btn.setAttribute("aria-selected", "true");
      btn.setAttribute("tabindex", "0");
      const target = shadow.getElementById(btn.getAttribute("aria-controls"));
      if (target) target.classList.remove("hidden");
    }

    tabBtns.forEach((btn) => {
      btn.addEventListener("click", () => switchTab(btn));
      btn.addEventListener("keydown", (e) => {
        const tabs = Array.from(tabBtns);
        const idx = tabs.indexOf(btn);
        let next = -1;
        if (e.key === "ArrowRight") next = (idx + 1) % tabs.length;
        if (e.key === "ArrowLeft") next = (idx - 1 + tabs.length) % tabs.length;
        if (next >= 0) {
          e.preventDefault();
          tabs[next].focus();
          switchTab(tabs[next]);
        }
      });
    });

    // ── Profile buttons ─────────────────────────────────────────────
    $$(".profile-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const p = btn.dataset.profile;
        if (state.profile === p) {
          state.profile = null;
        } else {
          state.profile = p;
        }
        syncUI();
        applyGlobalStyles();
        saveState();
      });
    });

    // ── Contrast buttons ────────────────────────────────────────────
    $$(".contrast-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.contrast = btn.dataset.contrast;
        syncUI();
        applyGlobalStyles();
        saveState();
      });
    });

    // ── Steppers ────────────────────────────────────────────────────
    const STEPS = { textSize: 10, lineHeight: 10, letterSpacing: 5 };
    const MIN = { textSize: 60, lineHeight: 60, letterSpacing: 50 };
    const MAX = { textSize: 200, lineHeight: 200, letterSpacing: 200 };

    $$(".stepper-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const [prop, action] = btn.dataset.action.split("-");
        if (action === "reset") {
          state[prop] = defaults[prop];
        } else if (action === "up") {
          state[prop] = Math.min(state[prop] + STEPS[prop], MAX[prop]);
        } else if (action === "down") {
          state[prop] = Math.max(state[prop] - STEPS[prop], MIN[prop]);
        }
        syncUI();
        applyGlobalStyles();
        saveState();
      });
    });

    // ── Alignment buttons ───────────────────────────────────────────
    $$(".align-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.textAlign = btn.dataset.align;
        syncUI();
        applyGlobalStyles();
        saveState();
      });
    });

    // ── Toggle switches ─────────────────────────────────────────────
    $$(".toggle").forEach((t) => {
      t.addEventListener("click", () => {
        const key = t.dataset.toggle;
        state[key] = !state[key];
        syncUI();
        applyGlobalStyles();
        saveState();
      });
    });

    // ── Sync UI to state ────────────────────────────────────────────
    function syncUI() {
      // Profiles
      $$(".profile-btn").forEach((b) => {
        b.classList.toggle("active", b.dataset.profile === state.profile);
      });

      // Contrast
      $$(".contrast-btn").forEach((b) => {
        const active = b.dataset.contrast === state.contrast;
        b.classList.toggle("active", active);
        b.setAttribute("aria-pressed", String(active));
      });

      // Steppers
      $$(".stepper-value").forEach((v) => {
        const prop = v.id.replace("-val", "");
        v.textContent = state[prop] + "%";
      });

      // Alignment
      $$(".align-btn").forEach((b) => {
        const active = b.dataset.align === state.textAlign;
        b.classList.toggle("active", active);
        b.setAttribute("aria-pressed", String(active));
      });

      // Toggles
      $$(".toggle").forEach((t) => {
        const key = t.dataset.toggle;
        const on = !!state[key];
        t.setAttribute("aria-checked", String(on));
        t.classList.toggle("on", on);
      });
    }

    syncUI();
  }

  // ── Widget Shadow DOM CSS ────────────────────────────────────────
  function widgetCSS() {
    return `
      :host {
        all: initial;
        font-family: system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        font-size: 14px;
        line-height: 1.4;
        color: #1a1a2e;
      }

      *, *::before, *::after {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }

      .wrapper {
        position: fixed;
        bottom: 20px;
        left: 20px;
        z-index: 999999;
      }

      /* ── Trigger Button ─────────────────────────────────────── */
      .trigger-btn {
        width: 56px;
        height: 56px;
        border-radius: 50%;
        border: none;
        background: #005fcc;
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 4px 14px rgba(0,0,0,0.25);
        transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
      }
      .trigger-btn:hover {
        background: #004ba3;
        transform: scale(1.06);
        box-shadow: 0 6px 20px rgba(0,0,0,0.30);
      }
      .trigger-btn:focus-visible {
        outline: 3px solid #ff6600;
        outline-offset: 3px;
      }
      .trigger-btn svg {
        pointer-events: none;
      }

      /* ── Panel ──────────────────────────────────────────────── */
      .panel {
        position: absolute;
        bottom: 70px;
        left: 0;
        width: 380px;
        max-height: 80vh;
        background: #ffffff;
        border-radius: 14px;
        box-shadow: 0 12px 40px rgba(0,0,0,0.18);
        border: 1px solid #e2e2e2;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        animation: a11y-slide-up 0.22s ease-out;
      }
      .panel.hidden {
        display: none !important;
      }

      @keyframes a11y-slide-up {
        from { opacity: 0; transform: translateY(12px); }
        to   { opacity: 1; transform: translateY(0); }
      }

      /* ── Panel Header ───────────────────────────────────────── */
      .panel-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 14px 18px;
        background: #f7f8fa;
        border-bottom: 1px solid #e5e5e5;
      }
      .panel-title {
        font-weight: 700;
        font-size: 15px;
        color: #1a1a2e;
      }
      .icon-btn {
        width: 34px;
        height: 34px;
        border: none;
        background: transparent;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: #555;
        transition: background 0.15s;
      }
      .icon-btn:hover {
        background: #e8e8e8;
      }
      .icon-btn:focus-visible {
        outline: 3px solid #ff6600;
        outline-offset: 2px;
      }

      /* ── Panel Body ─────────────────────────────────────────── */
      .panel-body {
        overflow-y: auto;
        padding: 16px 18px 20px;
        flex: 1;
      }

      /* ── Tabs ───────────────────────────────────────────────── */
      .tabs {
        display: flex;
        gap: 4px;
        margin-bottom: 16px;
        background: #f0f1f3;
        border-radius: 10px;
        padding: 4px;
      }
      .tab {
        flex: 1;
        padding: 8px 6px;
        border: none;
        background: transparent;
        border-radius: 8px;
        font-size: 13px;
        font-weight: 600;
        color: #555;
        cursor: pointer;
        transition: background 0.15s, color 0.15s;
      }
      .tab:hover {
        color: #1a1a2e;
      }
      .tab.active {
        background: #fff;
        color: #005fcc;
        box-shadow: 0 1px 4px rgba(0,0,0,0.08);
      }
      .tab:focus-visible {
        outline: 3px solid #ff6600;
        outline-offset: 2px;
      }

      /* ── Tab Panels ─────────────────────────────────────────── */
      .tab-panel.hidden { display: none !important; }

      /* ── Section Labels ─────────────────────────────────────── */
      .section-label {
        font-size: 12px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: #888;
        margin-bottom: 10px;
        margin-top: 16px;
      }
      .section-label:first-child { margin-top: 0; }

      /* ── Profile Grid ───────────────────────────────────────── */
      .profile-grid {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 8px;
      }
      .profile-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        padding: 14px 6px;
        border: 2px solid #e8e8e8;
        background: #fafbfc;
        border-radius: 10px;
        cursor: pointer;
        transition: border-color 0.15s, background 0.15s, transform 0.1s;
      }
      .profile-btn:hover {
        border-color: #005fcc;
        background: #f0f7ff;
      }
      .profile-btn.active {
        border-color: #005fcc;
        background: #e6f0ff;
        box-shadow: 0 0 0 1px #005fcc inset;
      }
      .profile-btn:focus-visible {
        outline: 3px solid #ff6600;
        outline-offset: 2px;
      }
      .profile-icon {
        font-size: 22px;
        line-height: 1;
      }
      .profile-name {
        font-size: 11px;
        font-weight: 600;
        color: #333;
        text-align: center;
      }

      /* ── Contrast Grid ──────────────────────────────────────── */
      .contrast-grid {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr 1fr;
        gap: 6px;
      }
      .contrast-btn {
        padding: 8px 4px;
        border: 2px solid #e8e8e8;
        background: #fafbfc;
        border-radius: 8px;
        font-size: 11px;
        font-weight: 600;
        cursor: pointer;
        transition: border-color 0.15s, background 0.15s;
        color: #333;
      }
      .contrast-btn:hover {
        border-color: #005fcc;
      }
      .contrast-btn.active {
        border-color: #005fcc;
        background: #e6f0ff;
        color: #005fcc;
      }
      .contrast-btn:focus-visible {
        outline: 3px solid #ff6600;
        outline-offset: 2px;
      }

      /* ── Steppers ───────────────────────────────────────────── */
      .stepper-row {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .stepper-btn {
        width: 38px;
        height: 38px;
        border: 2px solid #ddd;
        background: #fafbfc;
        border-radius: 8px;
        font-size: 18px;
        font-weight: 700;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #333;
        transition: border-color 0.15s, background 0.15s;
      }
      .stepper-btn:hover {
        border-color: #005fcc;
        background: #f0f7ff;
      }
      .stepper-btn:focus-visible {
        outline: 3px solid #ff6600;
        outline-offset: 2px;
      }
      .stepper-btn.reset {
        margin-left: auto;
        font-size: 16px;
        color: #888;
        border-color: transparent;
        background: transparent;
      }
      .stepper-btn.reset:hover {
        color: #d33;
        border-color: transparent;
        background: #fff0f0;
      }
      .stepper-value {
        min-width: 60px;
        text-align: center;
        font-weight: 700;
        font-size: 14px;
        color: #1a1a2e;
      }

      /* ── Alignment Row ──────────────────────────────────────── */
      .align-row {
        display: flex;
        gap: 6px;
      }
      .align-btn {
        flex: 1;
        padding: 8px 6px;
        border: 2px solid #e8e8e8;
        background: #fafbfc;
        border-radius: 8px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: border-color 0.15s, background 0.15s;
        color: #333;
      }
      .align-btn:hover {
        border-color: #005fcc;
      }
      .align-btn.active {
        border-color: #005fcc;
        background: #e6f0ff;
        color: #005fcc;
      }
      .align-btn:focus-visible {
        outline: 3px solid #ff6600;
        outline-offset: 2px;
      }

      /* ── Toggle Switches ────────────────────────────────────── */
      .toggle-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 0;
        border-bottom: 1px solid #f0f0f0;
      }
      .toggle-row:last-child {
        border-bottom: none;
      }
      .toggle-label {
        font-weight: 600;
        font-size: 13px;
        color: #333;
      }
      .toggle {
        width: 48px;
        height: 26px;
        border: none;
        border-radius: 13px;
        background: #ccc;
        position: relative;
        cursor: pointer;
        transition: background 0.2s;
        flex-shrink: 0;
      }
      .toggle.on {
        background: #005fcc;
      }
      .toggle:focus-visible {
        outline: 3px solid #ff6600;
        outline-offset: 3px;
      }
      .toggle-thumb {
        position: absolute;
        top: 3px;
        left: 3px;
        width: 20px;
        height: 20px;
        background: #fff;
        border-radius: 50%;
        box-shadow: 0 1px 4px rgba(0,0,0,0.2);
        transition: transform 0.2s;
        pointer-events: none;
      }
      .toggle.on .toggle-thumb {
        transform: translateX(22px);
      }
    `;
  }

  // ── Init ────────────────────────────────────────────────────────
  function init() {
    loadState();
    applyGlobalStyles();
    createWidget();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
