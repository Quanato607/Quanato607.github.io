(() => {
  "use strict";

  const EMAIL_ADDRESS = "22320220@hdu.edu.cn";
  const THEME_STORAGE_KEY = "sz-theme";

  const BIBTEX_MAP = {
    xpatient: `@misc{zhu2026idearl,
  title  = {IDEA-RL and XPatient: Fact-Grounded Patient Simulation and Evidence-Attributed Policy Optimization for Multi-Turn Clinical Consultation},
  author = {Zhu, Shenghao},
  year   = {2026}
}`,
    adamm: `@article{zhu2026adamm,
  title   = {No Modality Left Behind: Adapting to Missing Modalities via Knowledge Distillation for Brain Tumor Segmentation},
  author  = {Zhu, Shenghao and Chen, Yifei and Chen, Weihong and Tian, Qiyuan and others},
  journal = {Medical Image Analysis},
  year    = {2026},
  doi     = {10.1016/j.media.2026.104108}
}`,
    reborn: `@inproceedings{zhu2026reborn,
  title     = {ReBorn: Turning Full-Modality Segmentation Models into Missing-Modality Survivors},
  author    = {Zhu, Shenghao},
  booktitle = {Findings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR)},
  year      = {2026}
}`,
    mstkdnet: `@inproceedings{zhu2025mstkdnet,
  title     = {Bridging the Gap in Missing Modalities: Leveraging Knowledge Distillation and Style Matching for Brain Tumor Segmentation},
  author    = {Zhu, Shenghao and Chen, Yifei and Chen, Weihong and Qin, Feiwei and others},
  booktitle = {Medical Image Computing and Computer Assisted Intervention (MICCAI)},
  year      = {2025}
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
  year    = {2024}
}`,
    gfemamba: `@article{fang2025gfemamba,
  title   = {GFE-Mamba: Mamba-Based AD Multimodal Progression Assessment via Generative Feature Extraction from MCI},
  author  = {Zhu, Shenghao},
  journal = {Information Fusion},
  year    = {2025},
  note    = {Under Review}
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
    const applyTheme = (theme) => {
      root.setAttribute("data-theme", theme);
      if (toggleBtn) {
        const nextLabel = theme === "dark" ? "Switch to light theme" : "Switch to dark theme";
        toggleBtn.setAttribute("aria-label", nextLabel);
        toggleBtn.setAttribute("aria-pressed", String(theme === "dark"));
      }
      const metaTheme = document.querySelector('meta[name="theme-color"]');
      if (metaTheme) {
        metaTheme.setAttribute("content", theme === "dark" ? "#090d1a" : "#1e40af");
      }
    };

    const current = root.getAttribute("data-theme") || "light";
    applyTheme(current);

    if (toggleBtn) {
      toggleBtn.addEventListener("click", () => {
        const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
        try {
          localStorage.setItem(THEME_STORAGE_KEY, next);
        } catch (_err) {
          /* ignore storage errors */
        }
        applyTheme(next);
      });
    }
  }

  function initScrollAndNav() {
    const progressEl = document.getElementById("scroll-progress");
    const mobileBtn = document.getElementById("mobile-menu-btn");
    const drawer = document.getElementById("mobile-drawer");
    const navLinks = Array.from(document.querySelectorAll(".nav-link[data-section], .mobile-drawer a[data-section]"));

    let ticking = false;
    const updateProgress = () => {
      ticking = false;
      if (!progressEl) return;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? Math.min(100, Math.max(0, (window.scrollY / docHeight) * 100)) : 0;
      progressEl.style.width = `${pct.toFixed(1)}%`;
    };

    window.addEventListener("scroll", () => {
      if (!ticking) {
        window.requestAnimationFrame(updateProgress);
        ticking = true;
      }
    }, { passive: true });
    updateProgress();

    if (mobileBtn && drawer) {
      mobileBtn.addEventListener("click", () => {
        const isOpen = drawer.classList.toggle("is-open");
        mobileBtn.setAttribute("aria-expanded", String(isOpen));
      });
      drawer.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
          drawer.classList.remove("is-open");
          mobileBtn.setAttribute("aria-expanded", "false");
        });
      });
    }

    const sections = Array.from(document.querySelectorAll("section[id]"));
    if ("IntersectionObserver" in window && sections.length && navLinks.length) {
      const setActive = (id) => {
        navLinks.forEach((link) => {
          link.classList.toggle("is-active", link.getAttribute("data-section") === id);
        });
      };
      const spy = new IntersectionObserver(
        (entries) => {
          const visible = entries
            .filter((entry) => entry.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
          if (visible.length) {
            setActive(visible[0].target.id);
          }
        },
        { rootMargin: "-25% 0px -55% 0px", threshold: [0.1, 0.35, 0.6] }
      );
      sections.forEach((sec) => spy.observe(sec));
    }
  }

  function initReveal() {
    const revealEls = Array.from(document.querySelectorAll(".reveal"));
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if ("IntersectionObserver" in window && !reducedMotion) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer.unobserve(entry.target);
            }
          });
        },
        { rootMargin: "0px 0px -40px 0px", threshold: 0.05 }
      );
      revealEls.forEach((el) => observer.observe(el));
    } else {
      revealEls.forEach((el) => el.classList.add("is-visible"));
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
      let autoInterval = null;
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
          autoInterval = window.setInterval(() => {
            if (paused || document.hidden || card.classList.contains("is-hidden")) return;
            goToSlide(activeIndex + 1, true);
          }, 4200);
        }, cardIdx * 650);
      }
    });
  }

  function initModals() {
    const lightbox = document.getElementById("lightbox-modal");
    const lightboxImg = document.getElementById("lightbox-img");
    const lightboxTitle = document.getElementById("lightbox-title");
    const lightboxCaption = document.getElementById("lightbox-caption");
    const lightboxNav = document.getElementById("lightbox-nav");
    const lightboxPrev = document.getElementById("lightbox-prev");
    const lightboxNext = document.getElementById("lightbox-next");
    const lightboxCounter = document.getElementById("lightbox-counter");

    const bibModal = document.getElementById("bibtex-modal");
    const bibTitle = document.getElementById("bibtex-title");
    const bibCode = document.getElementById("bibtex-code");
    const bibCopyBtn = document.getElementById("bibtex-copy-btn");

    let gallerySlides = [];
    let galleryIdx = 0;

    const closeModal = (modal) => {
      if (!modal) return;
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
    };

    const renderGalleryFrame = () => {
      if (!gallerySlides.length || !lightboxImg) return;
      const item = gallerySlides[galleryIdx];
      lightboxImg.src = item.src;
      lightboxImg.alt = item.caption || item.title || "Enlarged preview";
      if (lightboxTitle) lightboxTitle.textContent = item.title || "Figure Preview";
      if (lightboxCaption) lightboxCaption.textContent = item.caption || "";
      if (lightboxNav) {
        lightboxNav.hidden = gallerySlides.length <= 1;
      }
      if (lightboxCounter) {
        lightboxCounter.textContent = `${galleryIdx + 1} / ${gallerySlides.length}`;
      }
    };

    const openGallery = (slides, startIndex) => {
      if (!lightbox || !slides.length) return;
      gallerySlides = slides;
      galleryIdx = Math.max(0, Math.min(startIndex, slides.length - 1));
      renderGalleryFrame();
      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
    };

    const openBibtex = (key, title) => {
      const bib = BIBTEX_MAP[key];
      if (!bibModal || !bibCode || !bib) return;
      if (bibTitle) bibTitle.textContent = `BibTeX · ${title || key}`;
      bibCode.textContent = bib;
      bibModal.classList.add("is-open");
      bibModal.setAttribute("aria-hidden", "false");
    };

    document.querySelectorAll(".pub-stage").forEach((stage) => {
      stage.addEventListener("click", () => {
        const card = stage.closest(".pub-card");
        const baseTitle = stage.getAttribute("data-paper-title") || "Figure Preview";
        const slideEls = Array.from(stage.querySelectorAll(".pub-slide"));
        if (!slideEls.length) return;
        const slides = slideEls.map((el) => {
          const img = el.querySelector("img");
          const label = el.getAttribute("data-slide-label") || "";
          return {
            src: img ? (img.currentSrc || img.getAttribute("src")) : "",
            title: label ? `${baseTitle} — ${label}` : baseTitle,
            caption: el.getAttribute("data-caption") || (img ? img.getAttribute("alt") : "") || ""
          };
        });
        const startIdx = Number((card && card.dataset.activeSlideIndex) || "0");
        openGallery(slides, startIdx);
      });
    });

    document.querySelectorAll("[data-lightbox-trigger]").forEach((trigger) => {
      trigger.addEventListener("click", () => {
        const img = trigger.querySelector("img");
        if (!img) return;
        const src = img.currentSrc || img.getAttribute("src");
        const title = trigger.getAttribute("data-lightbox-title") || "Preview";
        const caption = trigger.getAttribute("data-lightbox-caption") || img.getAttribute("alt") || "";
        openGallery([{ src, title, caption }], 0);
      });
    });

    if (lightboxPrev) {
      lightboxPrev.addEventListener("click", () => {
        if (gallerySlides.length <= 1) return;
        galleryIdx = (galleryIdx - 1 + gallerySlides.length) % gallerySlides.length;
        renderGalleryFrame();
      });
    }

    if (lightboxNext) {
      lightboxNext.addEventListener("click", () => {
        if (gallerySlides.length <= 1) return;
        galleryIdx = (galleryIdx + 1) % gallerySlides.length;
        renderGalleryFrame();
      });
    }

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

    [lightbox, bibModal].forEach((modal) => {
      if (!modal) return;
      modal.addEventListener("click", (event) => {
        if (event.target === modal || event.target.closest("[data-modal-close]")) {
          closeModal(modal);
        }
      });
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeModal(lightbox);
        closeModal(bibModal);
      } else if (lightbox && lightbox.classList.contains("is-open") && gallerySlides.length > 1) {
        if (event.key === "ArrowLeft") {
          galleryIdx = (galleryIdx - 1 + gallerySlides.length) % gallerySlides.length;
          renderGalleryFrame();
        } else if (event.key === "ArrowRight") {
          galleryIdx = (galleryIdx + 1) % gallerySlides.length;
          renderGalleryFrame();
        }
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

  document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initScrollAndNav();
    initReveal();
    initPublications();
    initPubSlideshows();
    initModals();
    initNewsToggle();
    initCopyEmail();
    initCarousels();
  });
})();
