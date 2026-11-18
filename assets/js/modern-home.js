(() => {
  "use strict";

  const EMAIL_ADDRESS = "22320220@hdu.edu.cn";
  const THEME_STORAGE_KEY = "sz-theme";

  const PILLAR_DATA = {
    "pillar-1": {
      badge: "Pillar 01 · Incomplete Imaging Robustness",
      title: "Missing-Modality 3D Medical Image Analysis",
      summary:
        "Clinical acquisitions frequently lack full MRI sequences due to scan time, motion artifacts, or institutional protocols. My foundational work builds unified architectures that segment tumors and reconstruct missing sequences from arbitrary available subsets.",
      points: [
        "Adapter-based cross-modal knowledge distillation (AdaMM, Medical Image Analysis 2026)",
        "Multi-scale attention alignment & adversarial style matching (MST-KDNet, MICCAI 2025)",
        "Pareto gradient-balanced survival training (ReBorn, CVPR 2026 Findings) & Vision-XLSTM fusion (ISBI 2025 Oral)"
      ],
      filterTarget: "imaging-world",
      filterLabel: "Filter Imaging & World Model Papers →"
    },
    "pillar-2": {
      badge: "Pillar 02 · Longitudinal Disease Modeling",
      title: "Patient World Models for Tumor Progression",
      summary:
        "Moving beyond single-timepoint scans, my Ant Group research models serial brain-metastasis MRI alongside treatment history to forecast subsequent tumor progression and clinical outcome trajectories.",
      points: [
        "Serial MRI lesion segmentation aligned with longitudinal tumor-burden trajectories",
        "Patient world models predicting progressive disease (PD) & BN20 clinical quality scores",
        "Generative multimodal feature extraction for MCI-to-AD conversion (GFE-Mamba, Information Fusion)"
      ],
      filterTarget: "imaging-world",
      filterLabel: "Filter Imaging & World Model Papers →"
    },
    "pillar-3": {
      badge: "Pillar 03 · Interactive Consultation & Synthesis",
      title: "Multi-Turn Clinical Consultation & Longitudinal Integration",
      summary:
        "At the University of Michigan, I study how diagnostic LLM agents gather incomplete history without hallucination—and aim to unify image-based progression signals with active multi-turn clinical inquiry.",
      points: [
        "Fact-constrained patient simulation preventing fabrication & tracking disclosed clinical evidence (XPatient)",
        "Outcome-associated process credit for first evidence acquisition across trajectories (IDEA-RL, γ = 1)",
        "Next step: coupling imaging biomarkers & world-model uncertainty with targeted follow-up consultation"
      ],
      filterTarget: "agents-rl",
      filterLabel: "Filter Multi-Turn Consultation Work →"
    }
  };

  const BIBTEX_MAP = {
    xpatient: `@misc{zhu2026idearl,
  title  = {IDEA-RL and XPatient: Fact-Grounded Patient Simulation and Evidence-Attributed Policy Optimization for Multi-Turn Clinical Consultation},
  author = {Zhu, Shenghao and Shen, Liyue and others},
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
  author    = {Zhu, Shenghao and Chen, Yifei and Chen, Weihong and Zheng, Yefeng and others},
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
  author  = {Fang, Zhaojie and Zhu, Shenghao and Chen, Yifei and Hu, Zhenguo and others},
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

  function initVisionExplorer() {
    const tabs = Array.from(document.querySelectorAll(".vision-tab[data-pillar]"));
    const nodes = Array.from(document.querySelectorAll(".vision-node[data-pillar]"));
    const badgeEl = document.getElementById("vision-detail-badge");
    const titleEl = document.getElementById("vision-detail-title");
    const summaryEl = document.getElementById("vision-detail-summary");
    const pointsEl = document.getElementById("vision-detail-points");
    const filterBtn = document.getElementById("vision-filter-btn");
    if (!tabs.length || !badgeEl || !titleEl || !summaryEl || !pointsEl) return;

    let currentFilterTarget = "imaging-world";

    const selectPillar = (pillarKey) => {
      const data = PILLAR_DATA[pillarKey];
      if (!data) return;

      tabs.forEach((tab) => {
        const active = tab.dataset.pillar === pillarKey;
        tab.classList.toggle("is-active", active);
        tab.setAttribute("aria-selected", String(active));
      });

      nodes.forEach((node) => {
        const active = node.dataset.pillar === pillarKey;
        node.classList.toggle("is-active", active);
        node.classList.toggle("is-dimmed", !active);
      });

      badgeEl.textContent = data.badge;
      titleEl.textContent = data.title;
      summaryEl.textContent = data.summary;
      pointsEl.innerHTML = "";
      data.points.forEach((point) => {
        const li = document.createElement("li");
        li.textContent = point;
        pointsEl.appendChild(li);
      });

      currentFilterTarget = data.filterTarget;
      if (filterBtn) {
        filterBtn.textContent = data.filterLabel;
      }
    };

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => selectPillar(tab.dataset.pillar));
    });

    nodes.forEach((node) => {
      node.addEventListener("click", () => selectPillar(node.dataset.pillar));
      node.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          selectPillar(node.dataset.pillar);
        }
      });
    });

    if (filterBtn) {
      filterBtn.addEventListener("click", () => {
        applyPubFilter(currentFilterTarget);
        const pubSection = document.getElementById("selected-publications");
        if (pubSection) {
          pubSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    }

    selectPillar("pillar-1");
  }

  function initPublications() {
    const pills = Array.from(document.querySelectorAll(".filter-pill[data-filter]"));
    pills.forEach((pill) => {
      pill.addEventListener("click", () => applyPubFilter(pill.dataset.filter));
    });
    applyPubFilter("all");
  }

  function initModals() {
    const lightbox = document.getElementById("lightbox-modal");
    const lightboxImg = document.getElementById("lightbox-img");
    const lightboxTitle = document.getElementById("lightbox-title");
    const lightboxCaption = document.getElementById("lightbox-caption");

    const bibModal = document.getElementById("bibtex-modal");
    const bibTitle = document.getElementById("bibtex-title");
    const bibCode = document.getElementById("bibtex-code");
    const bibCopyBtn = document.getElementById("bibtex-copy-btn");

    const closeModal = (modal) => {
      if (!modal) return;
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
    };

    const openLightbox = (src, title, caption) => {
      if (!lightbox || !lightboxImg) return;
      lightboxImg.src = src;
      lightboxImg.alt = caption || title || "Enlarged preview";
      if (lightboxTitle) lightboxTitle.textContent = title || "Figure Preview";
      if (lightboxCaption) lightboxCaption.textContent = caption || "";
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

    document.querySelectorAll("[data-lightbox-trigger]").forEach((trigger) => {
      trigger.addEventListener("click", () => {
        const img = trigger.querySelector("img");
        if (!img) return;
        const src = img.currentSrc || img.getAttribute("src");
        const title = trigger.getAttribute("data-lightbox-title") || "Preview";
        const caption = trigger.getAttribute("data-lightbox-caption") || img.getAttribute("alt") || "";
        openLightbox(src, title, caption);
      });
    });

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
    initVisionExplorer();
    initPublications();
    initModals();
    initNewsToggle();
    initCopyEmail();
    initCarousels();
  });
})();
