(() => {
  "use strict";

  const THEME_STORAGE_KEY = "sz-theme";

  const BENCHMARK_DATA = {
    pmc: {
      note: "Out-of-distribution (OOD) PMC-Patients-v2 benchmark. Rows are sorted by Diagnosis Jaccard; Effective Turns measures newly uncovered evidence turns per case.",
      rows: [
        { model: "IDEA-RL (Qwen3-4B)", ours: true, jac: 0.449, eff: 2.69 },
        { model: "MedGemma-27B", ours: false, jac: 0.292, eff: 2.41 },
        { model: "GPT-4o", ours: false, jac: 0.278, eff: 2.78 },
        { model: "Baichuan-M2-32B", ours: false, jac: 0.253, eff: 1.96 },
        { model: "Gemini 2.5 Flash", ours: false, jac: 0.237, eff: 2.55 },
        { model: "GPT-4.1", ours: false, jac: 0.235, eff: 2.40 },
        { model: "Qwen3-32B", ours: false, jac: 0.150, eff: 2.12 }
      ]
    },
    mimic: {
      note: "MIMIC-IV emergency clinical diagnosis benchmark. IDEA-RL (Qwen3-4B) leads both in Diagnosis Jaccard (0.563) and Effective Turns (4.76).",
      rows: [
        { model: "IDEA-RL (Qwen3-4B)", ours: true, jac: 0.563, eff: 4.76 },
        { model: "GPT-4.1", ours: false, jac: 0.318, eff: 4.52 },
        { model: "MedGemma-27B", ours: false, jac: 0.220, eff: 3.62 },
        { model: "Gemini 2.5 Flash", ours: false, jac: 0.209, eff: 3.40 },
        { model: "Baichuan-M2-32B", ours: false, jac: 0.206, eff: 2.59 },
        { model: "GPT-4o", ours: false, jac: 0.184, eff: null },
        { model: "Qwen3-32B", ours: false, jac: 0.104, eff: 2.99 }
      ]
    },
    ddx: {
      note: "DDxPlus diagnostic benchmark across 49 pathologies. IDEA-RL (Qwen3-4B) achieves 0.900 Diagnosis Jaccard with 4.61 Effective Turns.",
      rows: [
        { model: "IDEA-RL (Qwen3-4B)", ours: true, jac: 0.900, eff: 4.61 },
        { model: "GPT-4o", ours: false, jac: 0.671, eff: 2.39 },
        { model: "GPT-4.1", ours: false, jac: 0.658, eff: 2.23 },
        { model: "Gemini 2.5 Flash", ours: false, jac: 0.651, eff: 2.50 },
        { model: "MedGemma-27B", ours: false, jac: 0.575, eff: 2.79 },
        { model: "Qwen3-32B", ours: false, jac: 0.513, eff: 2.44 },
        { model: "Baichuan-M2-32B", ours: false, jac: 0.498, eff: 1.93 }
      ]
    }
  };

  let activeDataset = "pmc";
  let toastTimer = null;

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function showToast(message) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toast.classList.remove("is-visible");
    }, 2600);
  }

  function setAnonMode(isAnon, updateUrl = true) {
    document.documentElement.setAttribute("data-anon", isAnon ? "true" : "false");

    const toggleBtn = document.getElementById("anon-toggle");
    const toggleLabel = document.getElementById("anon-toggle-label");
    if (toggleBtn) toggleBtn.setAttribute("aria-pressed", isAnon ? "true" : "false");
    if (toggleLabel) toggleLabel.textContent = isAnon ? "Anonymous (?anon=1)" : "Named View";

    document.title = isAnon
      ? "No Critic, Which Clue? — IDEA-RL Project Page (Anonymous)"
      : "No Critic, Which Clue? — IDEA-RL Project Page | Shenghao Zhu";

    if (updateUrl && window.history && window.history.replaceState) {
      const url = new URL(window.location.href);
      if (isAnon) url.searchParams.set("anon", "1");
      else url.searchParams.delete("anon");
      window.history.replaceState({}, "", url.toString());
    }
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    const btn = document.getElementById("theme-toggle");
    if (btn) {
      const isDark = theme === "dark";
      btn.setAttribute("aria-pressed", isDark ? "true" : "false");
      btn.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
    }
  }

  function initThemeAndMode() {
    let savedTheme = "light";
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === "dark" || stored === "light") savedTheme = stored;
      else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) savedTheme = "dark";
    } catch (_) {}
    applyTheme(savedTheme);

    const themeBtn = document.getElementById("theme-toggle");
    if (themeBtn) {
      themeBtn.addEventListener("click", () => {
        const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
        applyTheme(next);
        try {
          localStorage.setItem(THEME_STORAGE_KEY, next);
        } catch (_) {}
      });
    }

    const params = new URLSearchParams(window.location.search);
    setAnonMode(params.get("anon") === "1", false);

    const anonBtn = document.getElementById("anon-toggle");
    if (anonBtn) {
      anonBtn.addEventListener("click", () => {
        const next = document.documentElement.getAttribute("data-anon") !== "true";
        setAnonMode(next, true);
        showToast(next ? "Switched to Anonymous Double-Blind View (?anon=1)" : "Switched to Named Author View");
      });
    }
  }

  function renderBenchmarkChart() {
    const dataset = BENCHMARK_DATA[activeDataset];
    const host = document.getElementById("bench-bars");
    const noteEl = document.getElementById("bench-note");
    if (!dataset || !host) return;

    document.querySelectorAll("[data-bench-ds]").forEach((btn) => {
      const active = btn.getAttribute("data-bench-ds") === activeDataset;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });

    const sorted = [...dataset.rows].sort((a, b) => b.jac - a.jac);
    host.innerHTML = sorted
      .map((row) => {
        const jacPct = Math.min(100, row.jac * 100);
        const effAvailable = typeof row.eff === "number";
        const effPct = effAvailable ? Math.min(100, (row.eff / 5.0) * 100) : 0;
        const effText = effAvailable ? row.eff.toFixed(2) : "—";
        const badge = row.ours ? '<span class="ours-tag">Ours</span>' : "";
        return `
          <div class="bench-row ${row.ours ? "bench-row--ours" : ""}">
            <div class="bench-model">
              <span>${escapeHtml(row.model)}</span>
              ${badge}
            </div>
            <div class="bench-metric-cell">
              <div class="bench-bar-track" aria-hidden="true">
                <div class="bench-bar-fill bench-bar-fill--jac" style="width: ${jacPct.toFixed(1)}%;"></div>
              </div>
              <div class="bench-val bench-val--jac">${row.jac.toFixed(3)}</div>
            </div>
            <div class="bench-metric-cell">
              <div class="bench-bar-track" aria-hidden="true">
                <div class="bench-bar-fill bench-bar-fill--eff" style="width: ${effPct.toFixed(1)}%;"></div>
              </div>
              <div class="bench-val bench-val--eff ${effAvailable ? "" : "bench-val--muted"}">${effText}</div>
            </div>
          </div>
        `;
      })
      .join("");

    if (noteEl) noteEl.textContent = dataset.note;
  }

  function initBenchmarkChart() {
    document.querySelectorAll("[data-bench-ds]").forEach((btn) => {
      btn.addEventListener("click", () => {
        activeDataset = btn.getAttribute("data-bench-ds");
        renderBenchmarkChart();
      });
    });
    renderBenchmarkChart();
  }

  function initExplainerVideo() {
    const video = document.getElementById("explainer-video");
    const chapterBtns = Array.from(document.querySelectorAll("[data-video-seek]"));
    if (!video || !chapterBtns.length) return;

    function syncActiveChapter() {
      const t = video.currentTime || 0;
      let activeIdx = 0;
      chapterBtns.forEach((btn, idx) => {
        const start = Number(btn.getAttribute("data-video-seek")) || 0;
        if (t + 0.08 >= start) activeIdx = idx;
      });
      chapterBtns.forEach((btn, idx) => {
        btn.classList.toggle("is-active", idx === activeIdx);
      });
    }

    chapterBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const seekTime = Number(btn.getAttribute("data-video-seek")) || 0;
        video.currentTime = seekTime;
        syncActiveChapter();
        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(() => {});
        }
      });
    });

    video.addEventListener("timeupdate", syncActiveChapter);
    video.addEventListener("seeked", syncActiveChapter);
    syncActiveChapter();
  }

  function initLightboxAndActions() {
    const modal = document.getElementById("lightbox-modal");
    const modalImg = document.getElementById("lightbox-img");
    const modalTitle = document.getElementById("lightbox-title");
    const modalCaption = document.getElementById("lightbox-caption");

    function closeModal() {
      if (!modal) return;
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
    }

    document.querySelectorAll("[data-lightbox-trigger]").forEach((frame) => {
      frame.addEventListener("click", () => {
        const img = frame.querySelector("img");
        if (!img || !modal || !modalImg) return;
        modalImg.src = img.getAttribute("src");
        modalImg.alt = img.getAttribute("alt") || "";
        if (modalTitle) modalTitle.textContent = frame.getAttribute("data-lightbox-title") || "Figure Preview";
        if (modalCaption) modalCaption.textContent = frame.getAttribute("data-lightbox-caption") || "";
        modal.classList.add("is-open");
        modal.setAttribute("aria-hidden", "false");
      });
    });

    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal || e.target.hasAttribute("data-modal-close")) {
          closeModal();
        }
      });
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modal.classList.contains("is-open")) {
          closeModal();
        }
      });
    }

    const codeBtn = document.getElementById("code-coming-soon-btn");
    if (codeBtn) {
      codeBtn.addEventListener("click", (e) => {
        e.preventDefault();
        showToast("Code & XPatient benchmark scripts will be released upon publication.");
      });
    }
  }

  function initScrollUi() {
    const progress = document.getElementById("scroll-progress");
    const topBtn = document.getElementById("scroll-to-top");
    const navLinks = Array.from(document.querySelectorAll(".header-nav a[href^='#']"));
    const sections = navLinks
      .map((link) => document.querySelector(link.getAttribute("href")))
      .filter(Boolean);

    function onScroll() {
      const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (progress && docHeight > 0) {
        progress.style.width = `${Math.min(100, (scrollTop / docHeight) * 100)}%`;
      }
      if (topBtn) {
        topBtn.classList.toggle("visible", scrollTop > 320);
      }

      let currentId = "";
      for (const sec of sections) {
        const rect = sec.getBoundingClientRect();
        if (rect.top <= 140) currentId = sec.id;
      }
      navLinks.forEach((link) => {
        link.classList.toggle("is-active", link.getAttribute("href") === `#${currentId}`);
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    if (topBtn) {
      topBtn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    initThemeAndMode();
    initBenchmarkChart();
    initExplainerVideo();
    initLightboxAndActions();
    initScrollUi();
  });
})();
