(() => {
  "use strict";

  const EMAIL_ADDRESS = "22320220@hdu.edu.cn";
  const SESSION_THEME_KEY = "sz-theme-session";

  const BIBTEX_MAP = {
    adamm: `@article{zhu2026adamm,
  title   = {No Modality Left Behind: Adapting to Missing Modalities via Knowledge Distillation for Brain Tumor Segmentation},
  author  = {Zhu, Shenghao and Chen, Yifei and Chen, Weihong and Tian, Qiyuan and others},
  journal = {Medical Image Analysis},
  year    = {2026},
  doi     = {10.1016/j.media.2026.104108}
}`,
    mstkdnet: `@inproceedings{zhu2025mstkdnet,
  title     = {Bridging the Gap in Missing Modalities: Leveraging Knowledge Distillation and Style Matching for Brain Tumor Segmentation},
  author    = {Zhu, Shenghao and Chen, Yifei and Chen, Weihong and Qin, Feiwei and others},
  booktitle = {Medical Image Computing and Computer Assisted Intervention (MICCAI)},
  year      = {2025},
  doi       = {10.1007/978-3-032-04984-1_10}
}`,
    xlstmhved: `@inproceedings{zhu2025xlstmhved,
  title     = {XLSTM-HVED: Cross-Modal Brain Tumor Segmentation and MRI Reconstruction Method Using Vision XLSTM and Heteromodal Variational Encoder-Decoder},
  author    = {Zhu, Shenghao and Chen, Yifei and Jiang, Shuo and Chen, Weihong and Zhu, Zhu and others},
  booktitle = {IEEE International Symposium on Biomedical Imaging (ISBI)},
  year      = {2025},
  note      = {Oral Presentation}
}`,
    mstnet: `@inproceedings{chen2025mstnet,
  title     = {Toward Robust Early Detection of Alzheimer's Disease via an Integrated Multimodal Learning Approach},
  author    = {Chen, Yifei and Zhu, Shenghao and Fang, Zhaojie and Wang, Changmiao and others},
  booktitle = {IEEE International Conference on Acoustics, Speech and Signal Processing (ICASSP)},
  year      = {2025}
}`,
    sckansformer: `@article{chen2024sckansformer,
  title   = {SCKansformer: Fine-Grained Classification of Bone Marrow Cells via Kansformer Backbone and Hierarchical Attention Mechanisms},
  author  = {Chen, Yifei and Zhu, Zhu and Zhu, Shenghao and Yu, Ge and others},
  journal = {IEEE Journal of Biomedical and Health Informatics},
  year    = {2024},
  doi     = {10.1109/JBHI.2024.3471928}
}`
  };

  let toastTimer = null;

  function showToast(message) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toast.classList.remove("is-visible");
    }, 2400);
  }

  async function copyText(text, successMsg) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const helper = document.createElement("textarea");
        helper.value = text;
        helper.setAttribute("readonly", "");
        helper.style.position = "fixed";
        helper.style.opacity = "0";
        document.body.appendChild(helper);
        helper.select();
        document.execCommand("copy");
        document.body.removeChild(helper);
      }
      showToast(successMsg);
    } catch (_err) {
      showToast("Copy unavailable — please copy manually");
    }
  }

  function initTheme() {
    const toggleBtn = document.getElementById("theme-toggle");
    const root = document.documentElement;
    const mediaQuery = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;

    const getAutoTheme = () => {
      const hour = new Date().getHours();
      const isNight = hour >= 19 || hour < 7;
      const prefersDark = mediaQuery ? mediaQuery.matches : false;
      return prefersDark || isNight ? "dark" : "light";
    };

    const getManualSessionTheme = () => {
      try {
        const manual = sessionStorage.getItem(SESSION_THEME_KEY);
        return manual === "dark" || manual === "light" ? manual : null;
      } catch (_err) {
        return null;
      }
    };

    const applyTheme = (theme) => {
      const normalized = theme === "dark" ? "dark" : "light";
      root.setAttribute("data-theme", normalized);
      if (toggleBtn) {
        const nextLabel = normalized === "dark"
          ? "Switch to Xuan-paper light mode"
          : "Switch to lacquer-black dark mode";
        toggleBtn.setAttribute("aria-label", nextLabel);
        toggleBtn.setAttribute("title", nextLabel);
        toggleBtn.setAttribute("aria-pressed", String(normalized === "dark"));
      }
      const metaTheme = document.querySelector('meta[name="theme-color"]');
      if (metaTheme) {
        metaTheme.setAttribute("content", normalized === "dark" ? "#141311" : "#f7f4ed");
      }
    };

    try {
      localStorage.removeItem("sz-ink-theme");
    } catch (_err) {
      /* ignore storage errors */
    }

    const syncTheme = () => {
      const manual = getManualSessionTheme();
      applyTheme(manual || getAutoTheme());
    };

    syncTheme();

    if (mediaQuery && mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", () => {
        if (!getManualSessionTheme()) applyTheme(getAutoTheme());
      });
    }

    window.setInterval(() => {
      if (!getManualSessionTheme()) applyTheme(getAutoTheme());
    }, 60000);

    if (toggleBtn) {
      toggleBtn.addEventListener("click", () => {
        const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
        try {
          sessionStorage.setItem(SESSION_THEME_KEY, next);
        } catch (_err) {
          /* ignore storage errors */
        }
        applyTheme(next);
      });
    }
  }

  function applyPubFilter(filterKey) {
    const pills = Array.from(document.querySelectorAll(".filter-pill[data-filter]"));
    const cards = Array.from(document.querySelectorAll(".pub-card[data-categories]"));
    const statusEl = document.getElementById("pub-visible-status");
    if (!pills.length || !cards.length) return;

    pills.forEach((pill) => {
      const active = pill.dataset.filter === filterKey;
      pill.classList.toggle("is-active", active);
      pill.setAttribute("aria-pressed", String(active));
    });

    let shown = 0;
    cards.forEach((card) => {
      const cats = (card.dataset.categories || "").split(/\s+/);
      const match = filterKey === "all" || cats.includes(filterKey);
      card.classList.toggle("is-hidden", !match);
      if (match) shown += 1;
    });

    if (statusEl) {
      statusEl.textContent = `Showing ${shown} of ${cards.length} works`;
    }
  }

  function initPublications() {
    const pills = Array.from(document.querySelectorAll(".filter-pill[data-filter]"));
    pills.forEach((pill) => {
      pill.addEventListener("click", () => applyPubFilter(pill.dataset.filter));
    });
    applyPubFilter("all");
  }

  function initPubSlideshows() {
    const cards = Array.from(document.querySelectorAll(".pub-card"));
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    cards.forEach((card, cardIdx) => {
      const stage = card.querySelector(".pub-stage");
      const slides = Array.from(card.querySelectorAll(".pub-slide"));
      const tabs = Array.from(card.querySelectorAll(".pub-slide-tab"));
      const progressFill = card.querySelector(".pub-progress-fill");
      if (!stage || slides.length < 2) return;

      let activeIndex = 0;
      let wipeTimer = null;
      let paused = false;

      const updateUi = (idx) => {
        tabs.forEach((tab, ti) => {
          const active = ti === idx;
          tab.classList.toggle("is-active", active);
          tab.setAttribute("aria-pressed", String(active));
        });
        if (progressFill) {
          progressFill.style.width = `${(((idx + 1) / slides.length) * 100).toFixed(1)}%`;
        }
        card.dataset.activeSlideIndex = String(idx);
      };

      const goToSlide = (targetIdx, animate = true) => {
        const nextIdx = (targetIdx + slides.length) % slides.length;
        if (nextIdx === activeIndex && animate) return;
        const prevIdx = activeIndex;
        activeIndex = nextIdx;

        window.clearTimeout(wipeTimer);
        slides.forEach((s) => s.classList.remove("is-underneath", "is-wiping-in", "is-current"));

        if (animate && !reducedMotion) {
          slides[prevIdx].classList.add("is-underneath");
          const incoming = slides[nextIdx];
          incoming.classList.add("is-current");
          void incoming.offsetWidth;
          incoming.classList.add("is-wiping-in");
          wipeTimer = window.setTimeout(() => {
            slides[prevIdx].classList.remove("is-underneath");
            incoming.classList.remove("is-wiping-in");
          }, 760);
        } else {
          slides[nextIdx].classList.add("is-current");
        }
        updateUi(nextIdx);
      };

      tabs.forEach((tab, tabIdx) => {
        tab.addEventListener("click", (event) => {
          event.stopPropagation();
          goToSlide(tabIdx, true);
        });
      });

      card.addEventListener("mouseenter", () => {
        paused = true;
      });
      card.addEventListener("mouseleave", () => {
        paused = false;
      });
      card.addEventListener("focusin", () => {
        paused = true;
      });
      card.addEventListener("focusout", () => {
        paused = false;
      });

      updateUi(0);

      if (!reducedMotion) {
        window.setTimeout(() => {
          window.setInterval(() => {
            if (paused || document.hidden || card.classList.contains("is-hidden")) return;
            goToSlide(activeIndex + 1, true);
          }, 4200);
        }, cardIdx * 650);
      }
    });
  }

  function initModals() {
    const bibModal = document.getElementById("bibtex-modal");
    const bibTitle = document.getElementById("bibtex-title");
    const bibCode = document.getElementById("bibtex-code");
    const bibCopyBtn = document.getElementById("bibtex-copy-btn");

    const closeModal = (modal) => {
      if (!modal) return;
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
    };

    const openBibtex = (key, title) => {
      const bib = BIBTEX_MAP[key];
      if (!bibModal || !bibCode || !bib) return;
      if (bibTitle) bibTitle.textContent = `BibTeX · ${title || key}`;
      bibCode.textContent = bib;
      bibModal.classList.add("is-open");
      bibModal.setAttribute("aria-hidden", "false");
    };

    document.querySelectorAll("[data-bibtex-id]").forEach((btn) => {
      btn.addEventListener("click", () => {
        openBibtex(btn.dataset.bibtexId, btn.dataset.bibtexTitle);
      });
    });

    if (bibCopyBtn && bibCode) {
      bibCopyBtn.addEventListener("click", () => {
        copyText(bibCode.textContent, "BibTeX citation copied to clipboard");
      });
    }

    if (bibModal) {
      bibModal.addEventListener("click", (event) => {
        if (event.target === bibModal || event.target.closest("[data-modal-close]")) {
          closeModal(bibModal);
        }
      });
    }

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeModal(bibModal);
      }
    });
  }

  function initNewsToggle() {
    const toggleBtn = document.getElementById("toggle-news-btn");
    const extraItems = Array.from(document.querySelectorAll(".news-entry[data-extra-news]"));
    const totalCount = document.querySelectorAll(".news-entry").length;
    if (!toggleBtn || !extraItems.length) return;

    let expanded = false;
    toggleBtn.addEventListener("click", () => {
      expanded = !expanded;
      extraItems.forEach((item) => item.classList.toggle("is-extra-hidden", !expanded));
      toggleBtn.textContent = expanded ? "Show fewer updates" : `Show all ${totalCount} updates`;
      toggleBtn.setAttribute("aria-expanded", String(expanded));
    });
  }

  function initCopyEmail() {
    document.querySelectorAll("[data-copy-email]").forEach((btn) => {
      btn.addEventListener("click", () => {
        copyText(EMAIL_ADDRESS, `Copied ${EMAIL_ADDRESS}`);
      });
    });
  }

  function initCarousels() {
    document.querySelectorAll("[data-photo-carousel]").forEach((carousel) => {
      const track = carousel.querySelector("[data-carousel-track]");
      const slides = Array.from(carousel.querySelectorAll(".carousel-slide"));
      const prevBtn = carousel.querySelector("[data-carousel-prev]");
      const nextBtn = carousel.querySelector("[data-carousel-next]");
      const statusEl = carousel.querySelector("[data-carousel-status]");
      const captionEl = carousel.querySelector("[data-carousel-caption]");
      if (!track || !slides.length) return;

      let activeIndex = 0;

      const renderMeta = (index) => {
        activeIndex = (index + slides.length) % slides.length;
        if (statusEl) {
          statusEl.textContent = `${activeIndex + 1} / ${slides.length}`;
        }
        const img = slides[activeIndex].querySelector("img");
        if (captionEl && img) {
          captionEl.textContent = img.getAttribute("alt") || "";
        }
      };

      const goTo = (index) => {
        const nextIdx = (index + slides.length) % slides.length;
        renderMeta(nextIdx);
        track.scrollTo({
          left: nextIdx * track.clientWidth,
          behavior: "smooth"
        });
      };

      if (prevBtn) {
        prevBtn.addEventListener("click", () => goTo(activeIndex - 1));
      }
      if (nextBtn) {
        nextBtn.addEventListener("click", () => goTo(activeIndex + 1));
      }

      track.addEventListener("keydown", (event) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          goTo(activeIndex - 1);
        } else if (event.key === "ArrowRight") {
          event.preventDefault();
          goTo(activeIndex + 1);
        }
      });

      let scrollTick = null;
      track.addEventListener("scroll", () => {
        window.clearTimeout(scrollTick);
        scrollTick = window.setTimeout(() => {
          if (track.clientWidth > 0) {
            const idx = Math.round(track.scrollLeft / track.clientWidth);
            renderMeta(idx);
          }
        }, 70);
      }, { passive: true });

      renderMeta(0);
    });
  }

  function initSideToc() {
    const links = Array.from(document.querySelectorAll(".toc-link[data-toc-target]"));
    const sections = Array.from(document.querySelectorAll("main section[id]"));
    if (!links.length || !sections.length) return;

    const setActive = (id) => {
      links.forEach((link) => {
        link.classList.toggle("is-active", link.dataset.tocTarget === id);
      });
    };

    if ("IntersectionObserver" in window) {
      const spy = new IntersectionObserver(
        (entries) => {
          if (window.scrollY < 80) {
            setActive(sections[0].id);
            return;
          }
          const visible = entries
            .filter((entry) => entry.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
          if (visible.length) {
            setActive(visible[0].target.id);
          }
        },
        { rootMargin: "-18% 0px -60% 0px", threshold: [0.05, 0.25, 0.5] }
      );
      sections.forEach((sec) => spy.observe(sec));
    }

    window.addEventListener("scroll", () => {
      if (window.scrollY < 80) {
        setActive(sections[0].id);
      }
    }, { passive: true });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initSideToc();
    initPublications();
    initPubSlideshows();
    initModals();
    initNewsToggle();
    initCopyEmail();
    initCarousels();
  });
})();
