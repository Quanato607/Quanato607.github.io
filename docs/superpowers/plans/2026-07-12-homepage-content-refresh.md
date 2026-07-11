# Shenghao Zhu Homepage Content Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update Shenghao Zhu's existing Jekyll academic homepage from the current CV, remove inaccurate public template data, publish the real CV, and add an AI-generated calligraphic “晟豪” favicon set.

**Architecture:** Preserve the current Academic Pages/Jekyll theme and its one-page anchored homepage. Store factual content in `_pages/about.md`, site identity in `_config.yml`, navigation in `_data/navigation.yml`, and browser-icon references in the existing head include and manifest. Add a small Python validation script for factual, cleanup, and icon invariants; add a deterministic Pillow-based icon-export script after the AI source image is approved.

**Tech Stack:** Jekyll, Liquid, Markdown/Kramdown, YAML, Python 3, PyYAML, Pillow, built-in image generation.

## Global Constraints

- Preserve the existing Academic Pages/Jekyll architecture and overall theme.
- Do not introduce a new framework, visual design system, or layout redesign.
- Use the CV and direct user confirmation as the source of truth.
- State that the B.S. at Hangzhou Dianzi University was completed in May 2026.
- Prioritize multimodal medical AI, missing-modality segmentation, multimodal fusion, knowledge distillation, and longitudinal medical imaging.
- Do not foreground medical dialogue work.
- Do not publish unsourced metrics, rankings, citation counts, star counts, datasets, or performance claims.
- Label GFE-Mamba as under review, SCKansformer only as coauthor, and ReBorn only as ongoing/preprint work without an accepted venue claim.
- Do not publish TC-KANRecon or DiffKAN3D until status is verified.
- The website icon must contain the exact Chinese characters “晟豪”; an incorrect character rendering must not ship.
- Do not push or deploy without explicit user confirmation.

---

### Task 1: Add a Homepage Validation Contract

**Files:**
- Create: `scripts/validate_homepage.py`

**Interfaces:**
- Consumes: repository root files, site configuration, homepage Markdown, CV PDF, manifest, and generated icon files.
- Produces: command-line checks `config`, `content`, `cleanup`, `icons`, and `all`; exits nonzero with actionable failures.

- [ ] **Step 1: Create the failing validation script**

Create `scripts/validate_homepage.py` with this complete implementation:

```python
#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import yaml
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ERRORS: list[str] = []


def require(condition: bool, message: str) -> None:
    if not condition:
        ERRORS.append(message)


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def check_config() -> None:
    config = yaml.safe_load(read("_config.yml"))
    require(config.get("locale") == "en-US", "_config.yml locale must be en-US")
    require(config.get("title") == "Shenghao Zhu | Multimodal Medical AI", "site title is stale")
    require(config.get("future") is False, "future posts must be disabled")
    author = config.get("author", {})
    require(author.get("name") == "Shenghao Zhu", "author name is incorrect")
    require(author.get("employer") == "Ant Group", "current employer must be Ant Group")
    scholar = author.get("googlescholar", "")
    require("6zr4pucAAAAJ" in scholar, "Google Scholar profile ID is incorrect")
    require("583w39sAAAAJ" not in scholar, "stale Scholar ID remains in config")
    collections = config.get("collections", {})
    for name in ["teaching", "publications", "portfolio", "talks"]:
        require(collections.get(name, {}).get("output") is False, f"{name} collection must not publish")
    excluded = set(config.get("exclude", []))
    for item in {"_posts", "_publications", "_talks", "_teaching", "_portfolio", "google-scholar-stats"}:
        require(item in excluded, f"{item} must be excluded from the build")


def check_content() -> None:
    about = read("_pages/about.md")
    cv_page = read("_pages/cv.md")
    readme = read("README.md")
    required_about = [
        "Medical AI Research Intern at Ant Group",
        "missing-modality segmentation",
        "Westlake University",
        "Tsinghua University",
        "Medical Image Analysis",
        "MICCAI 2025",
        "ISBI 2025",
        "Zhejiang Provincial Government Scholarship",
        "IEEE T-ITS",
    ]
    for phrase in required_about:
        require(phrase in about, f"homepage is missing: {phrase}")
    for stale in ["junior undergraduate", "Still young over the world", "medical multi-turn dialogue", "583w39sAAAAJ"]:
        require(stale.lower() not in about.lower(), f"stale homepage text remains: {stale}")
    require("/files/Shenghao_Zhu_CV.pdf" in about, "homepage CV link is missing")
    require("/files/Shenghao_Zhu_CV.pdf" in cv_page, "CV page download link is missing")
    require("GitHub University" not in cv_page, "placeholder CV content remains")
    require((ROOT / "files/Shenghao_Zhu_CV.pdf").is_file(), "real CV PDF is missing")
    require("Academic Pages template" not in readme, "template README remains")


def check_cleanup() -> None:
    require(not (ROOT / "_posts/2199-01-01-future-post.md").exists(), "future demo post remains")
    wrong_files = [
        "google-scholar-stats/gs_data.json",
        "google-scholar-stats/gs_data_shieldsio.json",
        "_data/google-scholar-stats/gs_data.json",
        "_data/google-scholar-stats/gs_data_shieldsio.json",
    ]
    for path in wrong_files:
        require(not (ROOT / path).exists(), f"incorrect Scholar data remains: {path}")
    public_text = "\n".join(read(path) for path in ["_config.yml", "_pages/about.md", "_pages/cv.md", "README.md"])
    require("4FA6C0AAAAJ" not in public_text, "unrelated researcher Scholar ID remains")
    require("7648" not in public_text, "unrelated citation count remains")


def check_icons() -> None:
    manifest = json.loads(read("images/manifest.json"))
    require(manifest.get("name") == "Shenghao Zhu", "manifest name is incorrect")
    required = {
        "images/shenghao-calligraphy.png": None,
        "images/favicon-32x32.png": (32, 32),
        "images/apple-touch-icon-180x180.png": (180, 180),
        "images/favicon-192x192.png": (192, 192),
        "images/favicon-512x512.png": (512, 512),
        "images/favicon.ico": None,
    }
    for relative, size in required.items():
        path = ROOT / relative
        require(path.is_file(), f"missing icon asset: {relative}")
        if path.is_file() and size:
            with Image.open(path) as image:
                require(image.size == size, f"{relative} has size {image.size}, expected {size}")
    source = ROOT / "images/shenghao-calligraphy.png"
    if source.is_file():
        with Image.open(source) as image:
            require(image.mode == "RGBA", "calligraphy source must be RGBA")
            require(image.getextrema()[3][0] == 0, "calligraphy source must have transparent pixels")
    icon_sources = {icon.get("src") for icon in manifest.get("icons", [])}
    require("/images/favicon-192x192.png" in icon_sources, "manifest is missing 192px icon")
    require("/images/favicon-512x512.png" in icon_sources, "manifest is missing 512px icon")


CHECKS = {
    "config": check_config,
    "content": check_content,
    "cleanup": check_cleanup,
    "icons": check_icons,
}


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("check", choices=[*CHECKS, "all"], nargs="?", default="all")
    args = parser.parse_args()
    selected = CHECKS.values() if args.check == "all" else [CHECKS[args.check]]
    for check in selected:
        check()
    if ERRORS:
        print("Homepage validation failed:")
        for error in ERRORS:
            print(f"- {error}")
        return 1
    print(f"Homepage validation passed: {args.check}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
```

- [ ] **Step 2: Run the validation script and verify the existing site fails**

Run:

```bash
/Users/zhushenghao/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 scripts/validate_homepage.py all
```

Expected: exit code `1`, with failures for stale locale/title, stale homepage copy, fake CV content, incorrect Scholar data, missing CV PDF, and missing calligraphy icon.

- [ ] **Step 3: Commit the validation contract**

```bash
git add scripts/validate_homepage.py
git commit -m "test: add homepage content validation"
```

---

### Task 2: Correct Site Identity and Remove Public Template Debris

**Files:**
- Modify: `_config.yml`
- Modify: `_data/navigation.yml`
- Modify: `README.md`
- Delete: `_posts/2199-01-01-future-post.md`
- Delete: `google-scholar-stats/gs_data.json`
- Delete: `google-scholar-stats/gs_data_shieldsio.json`
- Delete: `_data/google-scholar-stats/gs_data.json`
- Delete: `_data/google-scholar-stats/gs_data_shieldsio.json`

**Interfaces:**
- Consumes: factual identity and Scholar ID from the design spec.
- Produces: correct site metadata and navigation; prevents sample content and incorrect Scholar data from being built.

- [ ] **Step 1: Update `_config.yml` identity settings**

Set the relevant values to:

```yaml
locale                   : "en-US"
site_theme               : "default"
title                    : "Shenghao Zhu | Multimodal Medical AI"
title_separator          : "-"
name                     : &name "Shenghao Zhu"
description              : &description "Shenghao Zhu researches robust multimodal medical AI, missing-modality segmentation, knowledge distillation, and longitudinal medical imaging."
url                      : https://quanato607.github.io
baseurl                  : ""
repository               : "Quanato607/Quanato607.github.io"
google_scholar_stats_use_cdn : false

author:
  avatar           : "profile.png"
  name             : "Shenghao Zhu"
  bio              : "Medical AI Researcher"
  location         : "Hangzhou, China"
  employer         : "Ant Group"
  uri              : "https://quanato607.github.io"
  email            : "22320220@hdu.edu.cn"
  googlescholar    : "https://scholar.google.com/citations?user=6zr4pucAAAAJ&hl=en"
  github           : "Quanato607"

future                   : false
og_image                 : "favicon-512x512.png"
atom_feed:
  hide                   : true
```

Change collection `output` values for `teaching`, `publications`, `portfolio`, and `talks` to `false`. Add these exact entries to `exclude`:

```yaml
  - _drafts
  - _posts
  - _portfolio
  - _publications
  - _talks
  - _teaching
  - google-scholar-stats
  - markdown_generator
  - talkmap
  - _pages/archive-layout-with-content.md
  - _pages/category-archive.html
  - _pages/collection-archive.html
  - _pages/markdown.md
  - _pages/non-menu-page.md
  - _pages/page-archive.html
  - _pages/portfolio.html
  - _pages/publications.html
  - _pages/sitemap.md
  - _pages/tag-archive.html
  - _pages/talkmap.html
  - _pages/talks.html
  - _pages/teaching.html
  - _pages/terms.md
  - _pages/year-archive.html
  - files/paper1.pdf
  - files/paper2.pdf
  - files/paper3.pdf
  - files/slides1.pdf
  - files/slides2.pdf
  - files/slides3.pdf
```

- [ ] **Step 2: Replace navigation with the factual homepage anchors**

Set `_data/navigation.yml` to:

```yaml
main:
  - title: "About"
    url: "/#about"
  - title: "Research Experience"
    url: "/#research-experience"
  - title: "Selected Publications"
    url: "/#selected-publications"
  - title: "News"
    url: "/#news"
  - title: "Education & Awards"
    url: "/#education-awards"
  - title: "Service"
    url: "/#academic-service"
  - title: "CV"
    url: "/cv/"
```

- [ ] **Step 3: Replace the template README**

Set `README.md` to:

````markdown
# Shenghao Zhu's Academic Homepage

This repository contains the source for [Shenghao Zhu's academic homepage](https://quanato607.github.io/), focused on multimodal medical AI, missing-modality learning, knowledge distillation, and medical image analysis.

The site is built with Jekyll and the Academic Pages theme and is deployed through GitHub Pages.

## Local preview

```bash
bundle install
bundle exec jekyll serve -l -H localhost
```

## Content validation

```bash
python3 scripts/validate_homepage.py all
```
````

- [ ] **Step 4: Remove the future demo post and incorrect Scholar data**

Delete only the five files listed in this task's `Delete` section. Do not remove any user-authored homepage content.

- [ ] **Step 5: Run targeted validation**

```bash
/Users/zhushenghao/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 scripts/validate_homepage.py config
/Users/zhushenghao/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 scripts/validate_homepage.py cleanup
```

Expected: both commands print `Homepage validation passed`.

- [ ] **Step 6: Commit the metadata cleanup**

```bash
git add _config.yml _data/navigation.yml README.md _posts/2199-01-01-future-post.md google-scholar-stats _data/google-scholar-stats
git commit -m "chore: clean academic homepage metadata"
```

---

### Task 3: Publish the Current CV-Based Homepage Content

**Files:**
- Modify: `_pages/about.md`
- Modify: `_pages/cv.md`
- Create: `files/Shenghao_Zhu_CV.pdf`

**Interfaces:**
- Consumes: verified CV facts, selected publication URLs, and navigation anchors from Task 2.
- Produces: factual one-page research profile and a working real-CV route/download.

- [ ] **Step 1: Copy the supplied CV into the site**

```bash
cp /Users/zhushenghao/Desktop/resume/Shenghao_Zhu_CV.pdf files/Shenghao_Zhu_CV.pdf
```

Expected: `files/Shenghao_Zhu_CV.pdf` exists and opens as a two-page PDF.

- [ ] **Step 2: Replace `_pages/about.md` with CV-based content**

Use front matter:

```yaml
---
permalink: /
title: "Shenghao Zhu"
excerpt: "Medical AI researcher working on robust multimodal learning for incomplete clinical inputs."
author_profile: true
redirect_from:
  - /about/
  - /about.html
---
```

Follow it with these sections and claims:

```markdown
# About {#about}

I am a **Medical AI Research Intern at Ant Group**. I received my B.S. in Computer Science and Technology from Hangzhou Dianzi University in May 2026. My research focuses on **robust multimodal medical AI**, particularly missing-modality segmentation, multimodal fusion, knowledge distillation, and longitudinal medical image analysis.

I have conducted research at Ant Group, Westlake University, Tsinghua University's BIRTH Lab, and the SRIBD/CUHK-Shenzhen–HDU collaboration. I am interested in building efficient and reliable medical AI systems that remain useful when clinical inputs are incomplete or heterogeneous.

[**Download CV**](/files/Shenghao_Zhu_CV.pdf) · [**Google Scholar**](https://scholar.google.com/citations?user=6zr4pucAAAAJ&hl=en) · [**GitHub**](https://github.com/Quanato607)

# Research Experience {#research-experience}

### Ant Group — Medical AI Research Intern
*March 2026 – July 2026 · Supervisor: Dr. Le Lu*

Research on longitudinal treatment-response analysis for lung-cancer brain metastasis, integrating serial brain-MRI lesion segmentation with lesion-trajectory modeling to characterize tumor-burden changes and support response assessment.

### Westlake University — Visiting Student, Medical Artificial Intelligence Lab
*August 2025 – March 2026 · Supervisor: Prof. Yefeng Zheng*

Studied training strategies for segmentation with arbitrary missing modalities, including Pareto training, model-split weight-moving training, and gradient-entropy-balanced optimization. This work includes the ongoing ReBorn project; no accepted venue is claimed here.

### Tsinghua University — Online Research Intern, BIRTH Lab
*June 2024 – August 2025 · Supervisor: Prof. Qiyuan Tian*

Developed missing-modality knowledge-distillation methods with lightweight adapters and unified student models, leading to AdaMM and MST-KDNet.

### SRIBD / CUHK-Shenzhen and HDU 3DV Lab — Research Intern
*August 2023 – June 2024 · Supervisors: Prof. Changmiao Wang and Prof. Feiwei Qin*

Worked on multimodal MRI fusion, missing-modality segmentation, MRI reconstruction, MRI-to-PET synthesis, and multimodal disease-progression assessment.

# Selected Publications {#selected-publications}

<span style="color:#b02418;font-weight:bold;">†</span> co-first author

1. **No Modality Left Behind: Adapting to Missing Modalities via Knowledge Distillation for Brain Tumor Segmentation.** **Shenghao Zhu**, Yifei Chen, Weihong Chen, et al. *Medical Image Analysis*, 2026. **First author.** [Paper](https://doi.org/10.1016/j.media.2026.104108) · [Code](https://github.com/Quanato607/AdaMM)
2. **Bridging the Gap in Missing Modalities: Leveraging Knowledge Distillation and Style Matching for Brain Tumor Segmentation.** **Shenghao Zhu**, Yifei Chen, Weihong Chen, et al. MICCAI 2025. **First author.** [Code](https://github.com/Quanato607/MST-KDNet)
3. **XLSTM-HVED: Cross-Modal Brain Tumor Segmentation and MRI Reconstruction Method Using Vision XLSTM and Heteromodal Variational Encoder-Decoder.** **Shenghao Zhu**, Yifei Chen, Shuo Jiang, et al. IEEE ISBI 2025, **Oral Presentation; first author.** [Paper](https://arxiv.org/abs/2412.07804) · [Code](https://github.com/Quanato607/XLSTM-HVED)
4. **Toward Robust Early Detection of Alzheimer's Disease via an Integrated Multimodal Learning Approach.** Yifei Chen, **Shenghao Zhu**, et al. IEEE ICASSP 2025. **Second author.** [Paper](https://ieeexplore.ieee.org/document/10888363) · [Code](https://github.com/JustlfC03/MSTNet)
5. **SCKansformer: Fine-Grained Classification of Bone Marrow Cells via Kansformer Backbone and Hierarchical Attention Mechanisms.** Yifei Chen, Zhu Zhu, **Shenghao Zhu**, et al. IEEE JBHI, 2024. **Coauthor.** [Paper](https://ieeexplore.ieee.org/document/10713291) · [Code](https://github.com/JustlfC03/SCKansformer)
6. **GFE-Mamba: Mamba-Based AD Multimodal Progression Assessment via Generative Feature Extraction from MCI.** Zhaojie Fang<sup>†</sup>, **Shenghao Zhu<sup>†</sup>**, Yifei Chen<sup>†</sup>, et al. *Information Fusion*, **under review; co-first author.** [Preprint](https://arxiv.org/abs/2407.15719) · [Code](https://github.com/Tinysqua/GFE-Mamba)

# News {#news}

- **2026:** AdaMM was published in *Medical Image Analysis*.
- **2025:** MST-KDNet appeared at MICCAI 2025; XLSTM-HVED was presented orally at IEEE ISBI 2025; MSTNet appeared at IEEE ICASSP 2025.
- **2025:** Received the Zhejiang Provincial Government Scholarship.
- **2024:** Received the Zhejiang Provincial Government Scholarship and a National First Prize in the China College Students' Service Outsourcing Innovation and Entrepreneurship Competition.

# Education & Awards {#education-awards}

### Education

- **Hangzhou Dianzi University**, B.S. in Computer Science and Technology, September 2022 – May 2026.

### Selected Honors

- Zhejiang Provincial Government Scholarship, 2024 and 2025.
- Science and Technology Innovation Star.
- National First Prize, China College Students' Service Outsourcing Innovation and Entrepreneurship Competition, Enterprise Proposition Category, 2024.
- National Second Prize, Chinese Collegiate Computing Competition, Big Data Practice Track, 2024.
- National Bronze Award, China International College Students' Innovation Competition, 2024.

### Project Leadership

- Project Lead, National Undergraduate Innovation and Entrepreneurship Training Program, 2024.
- Project Lead, Zhejiang Provincial Undergraduate Scientific and Technological Innovation Activities Program, 2024.

# Academic Service {#academic-service}

- Reviewer for the **IEEE Journal of Biomedical and Health Informatics (JBHI)** and **IEEE Transactions on Intelligent Transportation Systems (T-ITS)**.

# Technical Skills {#technical-skills}

- **Research:** missing-modality segmentation, multimodal fusion, knowledge distillation, medical image analysis, and computer vision.
- **Tools:** PyTorch, OpenCV, Linux, LaTeX, SGLang, and vLLM.
```

- [ ] **Step 3: Replace the placeholder CV page**

Set `_pages/cv.md` to:

```markdown
---
layout: archive
title: "Curriculum Vitae"
permalink: /cv/
author_profile: true
redirect_from:
  - /resume
---

# Shenghao Zhu

Medical AI researcher working on robust multimodal learning, missing-modality segmentation, knowledge distillation, and medical image analysis.

[**Download the complete CV (PDF)**](/files/Shenghao_Zhu_CV.pdf)

## Education

- B.S. in Computer Science and Technology, Hangzhou Dianzi University, 2022–2026.

## Current Role

- Medical AI Research Intern, Ant Group, March–July 2026.

## Research Profiles

- [Google Scholar](https://scholar.google.com/citations?user=6zr4pucAAAAJ&hl=en)
- [GitHub](https://github.com/Quanato607)
- [Email](mailto:22320220@hdu.edu.cn)
```

- [ ] **Step 4: Run content validation**

```bash
/Users/zhushenghao/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 scripts/validate_homepage.py content
```

Expected: `Homepage validation passed: content`.

- [ ] **Step 5: Commit the CV-based content update**

```bash
git add _pages/about.md _pages/cv.md files/Shenghao_Zhu_CV.pdf
git commit -m "content: refresh academic profile from current CV"
```

---

### Task 4: Generate and Integrate the “晟豪” Calligraphic Icon

**Files:**
- Create: `images/shenghao-calligraphy.png`
- Create: `images/favicon-32x32.png`
- Replace: `images/apple-touch-icon-180x180.png`
- Replace: `images/favicon-192x192.png`
- Replace: `images/favicon-512x512.png`
- Replace: `images/favicon.ico`
- Create: `scripts/build_icon_assets.py`
- Modify: `images/manifest.json`
- Modify: `_includes/head/custom.html`

**Interfaces:**
- Consumes: one inspected AI-generated source whose exact visible text is “晟豪”.
- Produces: transparent master PNG and deterministic favicon variants referenced by Jekyll and the web manifest.

- [ ] **Step 1: Generate the calligraphic source with the built-in image tool**

Use this exact production prompt:

```text
Use case: logo-brand
Asset type: square academic website favicon and personal calligraphic mark
Primary request: create an original Chinese calligraphy mark containing exactly the two characters “晟豪” (晟 followed by 豪), vertically stacked and clearly legible
Subject: only the Chinese characters “晟豪”, with 晟 on top and 豪 below
Style/medium: contemporary Chinese semi-cursive ink-brush calligraphy; confident, scholarly, minimal, strong silhouette suitable for reduction to a favicon
Composition/framing: centered square composition, generous even padding, no cropping, balanced vertical stack
Color palette: deep navy-black brush ink with one very small restrained medical-teal accent stroke
Text (verbatim): “晟豪”
Scene/backdrop: perfectly flat solid #00ff00 chroma-key background for local removal
Constraints: render exactly two Chinese characters and no other text; character structure must be correct; background must be one uniform #00ff00 color with no shadow, gradient, texture, reflection, floor plane, or lighting variation; crisp brush edges; no mockup, seal text, English letters, border, scenery, 3D effect, watermark, or decorative objects; do not use #00ff00 inside the calligraphy
Avoid: illegible grass script, merged characters, invented strokes, extra red stamp characters, extra symbols
```

Save the selected built-in result into `tmp/imagegen/shenghao-calligraphy-chroma.png` before post-processing.

- [ ] **Step 2: Inspect exact character accuracy**

Open the result with the local image viewer. Confirm, visually and individually:

- top character is `晟`, including the `日` upper component and correct lower structure;
- bottom character is `豪`, with no missing or invented main strokes;
- there are exactly two characters and no extra seal text;
- both remain distinguishable at thumbnail scale.

If any character is wrong, issue exactly one targeted regeneration repeating the verbatim text and character-structure constraints. Do not proceed with an inaccurate result.

- [ ] **Step 3: Remove the chroma-key background**

```bash
mkdir -p tmp/imagegen
/Users/zhushenghao/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 \
  /Users/zhushenghao/.codex/skills/.system/imagegen/scripts/remove_chroma_key.py \
  --input tmp/imagegen/shenghao-calligraphy-chroma.png \
  --out images/shenghao-calligraphy.png \
  --auto-key border \
  --soft-matte \
  --transparent-threshold 12 \
  --opaque-threshold 220 \
  --despill
```

Expected: an RGBA PNG with transparent corners and no green fringe.

- [ ] **Step 4: Create the deterministic asset exporter**

Create `scripts/build_icon_assets.py`:

```python
#!/usr/bin/env python3
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "images/shenghao-calligraphy.png"
TARGETS = {
    "favicon-32x32.png": 32,
    "apple-touch-icon-180x180.png": 180,
    "favicon-192x192.png": 192,
    "favicon-512x512.png": 512,
}

with Image.open(SOURCE).convert("RGBA") as source:
    alpha = source.getchannel("A")
    bbox = alpha.getbbox()
    if not bbox:
        raise SystemExit("Calligraphy source is fully transparent")
    mark = source.crop(bbox)
    for filename, size in TARGETS.items():
        canvas = Image.new("RGBA", (size, size), (255, 255, 255, 0))
        max_mark = round(size * 0.80)
        mark_copy = mark.copy()
        mark_copy.thumbnail((max_mark, max_mark), Image.Resampling.LANCZOS)
        x = (size - mark_copy.width) // 2
        y = (size - mark_copy.height) // 2
        canvas.alpha_composite(mark_copy, (x, y))
        canvas.save(ROOT / "images" / filename, optimize=True)
    icon = Image.open(ROOT / "images/favicon-512x512.png").convert("RGBA")
    icon.save(ROOT / "images/favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])
```

- [ ] **Step 5: Build the favicon variants**

```bash
/Users/zhushenghao/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 scripts/build_icon_assets.py
```

Expected: all PNG and ICO targets exist with the expected dimensions.

- [ ] **Step 6: Update the manifest and head references**

Set `images/manifest.json` to:

```json
{
  "name": "Shenghao Zhu",
  "short_name": "晟豪",
  "icons": [
    {
      "src": "/images/favicon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/images/favicon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "theme_color": "#123852",
  "background_color": "#ffffff",
  "display": "standalone"
}
```

Replace favicon declarations in `_includes/head/custom.html` with:

```html
<link rel="apple-touch-icon" sizes="180x180" href="{{ base_path }}/images/apple-touch-icon-180x180.png">
<link rel="icon" type="image/png" sizes="32x32" href="{{ base_path }}/images/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="192x192" href="{{ base_path }}/images/favicon-192x192.png">
<link rel="icon" href="{{ base_path }}/images/favicon.ico" sizes="any">
<link rel="manifest" href="{{ base_path }}/images/manifest.json">
<meta name="theme-color" content="#123852">
```

Retain the existing Academicons stylesheet. Remove the obsolete academic-progressive SVG favicon reference.

- [ ] **Step 7: Run icon validation**

```bash
/Users/zhushenghao/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 scripts/validate_homepage.py icons
```

Expected: `Homepage validation passed: icons`.

- [ ] **Step 8: Commit the icon pipeline and assets**

```bash
git add images/shenghao-calligraphy.png images/favicon-32x32.png images/apple-touch-icon-180x180.png images/favicon-192x192.png images/favicon-512x512.png images/favicon.ico images/manifest.json _includes/head/custom.html scripts/build_icon_assets.py
git commit -m "feat: add Shenghao calligraphic site icon"
```

---

### Task 5: Build, Audit, and Prepare the GitHub Pages Update

**Files:**
- Modify only if validation exposes a real defect: files changed in Tasks 1–4.

**Interfaces:**
- Consumes: complete content refresh, cleanup settings, CV, and icon assets.
- Produces: validated local commits ready for user review and optional push.

- [ ] **Step 1: Run all repository validation checks**

```bash
/Users/zhushenghao/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 scripts/validate_homepage.py all
```

Expected: `Homepage validation passed: all`.

- [ ] **Step 2: Install local Jekyll dependencies if absent**

```bash
bundle config set --local path vendor/bundle
bundle install
```

Expected: Bundler resolves the repository Gemfile without modifying global gems. If network access is unavailable, record that limitation and continue with the content validator; do not claim a successful Jekyll build.

- [ ] **Step 3: Run the production build and Jekyll doctor**

```bash
JEKYLL_ENV=production bundle exec jekyll build --trace
bundle exec jekyll doctor
```

Expected: both commands exit `0`; `_site/index.html`, `_site/cv/index.html`, and `_site/files/Shenghao_Zhu_CV.pdf` exist.

- [ ] **Step 4: Verify generated public output**

```bash
test -f _site/index.html
test -f _site/cv/index.html
test -f _site/files/Shenghao_Zhu_CV.pdf
rg -n "Shenghao Zhu|Ant Group|AdaMM|MST-KDNet|晟豪" _site/index.html _site/cv/index.html _site/images/manifest.json
if rg -n "GitHub University|Yi Ren|4FA6C0AAAAJ|2199-01-01|Paper Title Number" _site; then exit 1; fi
```

Expected: current content is found and no template/incorrect Scholar strings are found.

- [ ] **Step 5: Review the complete diff and repository status**

```bash
git diff --check origin/master...HEAD
git status --short --branch
git log --oneline --decorate origin/master..HEAD
```

Expected: no whitespace errors, no untracked implementation artifacts, and only the planned local commits are ahead of `origin/master`.

- [ ] **Step 6: Deliver for user review without pushing**

Provide the local repository path, the generated icon preview, validation results, commit list, and a concise list of factual changes. Ask for explicit permission before any `git push` or GitHub Pages deployment action.
