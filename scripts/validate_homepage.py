#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from urllib.parse import urlparse

from PIL import Image
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
ERRORS: list[str] = []


def require(condition: bool, message: str) -> None:
    if not condition:
        ERRORS.append(message)


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def check_config() -> None:
    config = read("_config.yml")
    require(bool(re.search(r'^locale\s*:\s*"en-US"\s*$', config, re.MULTILINE)), "_config.yml locale must be en-US")
    require(bool(re.search(r'^title\s*:\s*"Shenghao Zhu \| Multimodal Medical AI"\s*$', config, re.MULTILINE)), "site title is stale")
    require(bool(re.search(r'^masthead_title\s*:\s*"Homepage"\s*$', config, re.MULTILINE)), "compact masthead label is missing")
    require(bool(re.search(r'^future\s*:\s*false\s*$', config, re.MULTILINE)), "future posts must be disabled")
    require(bool(re.search(r'^\s+name\s*:\s*"Shenghao Zhu"\s*$', config, re.MULTILINE)), "author name is incorrect")
    require(bool(re.search(r'^\s+bio\s*:\s*"Ph\.D\. Applicant · Fall 2027"\s*$', config, re.MULTILINE)), "Fall 2027 applicant status is missing")
    require(bool(re.search(r'^\s+employer\s*:\s*"Ant Group"\s*$', config, re.MULTILINE)), "current employer must be Ant Group")
    require("6zr4pucAAAAJ" in config, "Google Scholar profile ID is incorrect")
    require(bool(re.search(r'^\s+cv\s*:\s*"/files/Shenghao_Zhu_CV.pdf"\s*$', config, re.MULTILINE)), "sidebar CV link is missing")
    require("583w39sAAAAJ" not in config, "stale Scholar ID remains in config")
    for name in ["teaching", "publications", "portfolio", "talks"]:
        pattern = rf'^  {name}:\s*$\n\s+output:\s*false\s*$'
        require(bool(re.search(pattern, config, re.MULTILINE)), f"{name} collection must not publish")
    for item in {
        "_posts",
        "_publications",
        "_talks",
        "_teaching",
        "_portfolio",
        "google-scholar-stats",
        "docs",
        "scripts",
        "CONTRIBUTING.md",
        "docker-compose.yaml",
    }:
        pattern = rf'^\s*-\s*{re.escape(item)}\s*$'
        require(bool(re.search(pattern, config, re.MULTILINE)), f"{item} must be excluded from the build")


def check_content() -> None:
    about = read("_pages/about.md")
    cv_page = read("_pages/cv.md")
    readme = read("README.md")
    required_about = [
        "Medical AI Research Intern at Ant Group",
        "March 2026 – Present",
        "Medical Image Analysis / Multi-Turn Agents",
        "precision medicine accessible to more people",
        "refine their reasoning through sustained interaction",
        "Westlake University",
        "Tsinghua University",
        "Medical Image Analysis",
        "MICCAI 2025",
        "ReBorn: Turning Full-Modality Segmentation Models into Missing-Modality Survivors",
        "CVPR 2026 Findings",
        "We have one paper accepted at <strong>MICCAI 2025</strong>",
        "Our paper <strong>AdaMM</strong> was published",
        "<em>Medical Image Analysis</em> (Impact Factor: 14.0)",
        "Our <strong>GFE-Mamba</strong> preprint was released on arXiv",
        "ISBI 2025",
        "Zhejiang Provincial Government Scholarship",
        "IEEE T-ITS",
    ]
    for phrase in required_about:
        require(phrase in about, f"homepage is missing: {phrase}")
    for stale in ["junior undergraduate", "Still young over the world", "medical multi-turn dialogue", "583w39sAAAAJ"]:
        require(stale.lower() not in about.lower(), f"stale homepage text remains: {stale}")
    require("Online Research Intern" not in about, "online qualifier must be removed from the BIRTH Lab role")
    require('class="publication-links"' not in about, "paper and code links must be removed from publication entries")
    for verbose_experience in [
        "Research on longitudinal treatment-response analysis",
        "Studied training strategies for segmentation",
        "Developed missing-modality knowledge-distillation methods",
        "Worked on multimodal MRI fusion",
    ]:
        require(verbose_experience not in about, f"research experience should remain concise: {verbose_experience}")
    require("transferred" not in about.lower(), "transferred status must not appear on the homepage")
    require("March 2026 – July 2026" not in about, "Ant Group end date is stale on the homepage")
    require("March 2026 – Present" in cv_page, "Ant Group role must be current on the CV page")
    require("/files/Shenghao_Zhu_CV.pdf" in cv_page, "CV page download link is missing")
    require("GitHub University" not in cv_page, "placeholder CV content remains")
    cv_pdf = ROOT / "files/Shenghao_Zhu_CV.pdf"
    require(cv_pdf.is_file(), "real CV PDF is missing")
    if cv_pdf.is_file():
        pdf_text = "\n".join(page.extract_text() or "" for page in PdfReader(cv_pdf).pages)
        require("March 2026" in pdf_text and "Present" in pdf_text, "downloadable CV must show the current Ant Group role")
        for stale_pdf in ["July 2026", "Online Research Intern", "transferred", "multi-turn dialogue", "autoregressive gap"]:
            require(stale_pdf.lower() not in pdf_text.lower(), f"downloadable CV contains stale text: {stale_pdf}")
    require("Academic Pages template" not in readme, "template README remains")


def check_design() -> None:
    about = read("_pages/about.md")
    navigation = read("_data/navigation.yml")
    main_scss = read("assets/css/main.scss")
    design_scss = read("_sass/layout/_academic-home.scss")
    masthead = read("_includes/masthead.html")
    navigation_js = read("assets/js/plugins/jquery.greedy-navigation.js")
    default_layout = read("_layouts/default.html")
    single_layout = read("_layouts/single.html")

    for marker in [
        'body_class: academic-home',
        'class="research-snapshot"',
        'class="publication-item"',
        'class="experience-item"',
        'id="honors-awards"',
        'id="education"',
    ]:
        require(marker in about, f"homepage design marker is missing: {marker}")
    require('"layout/academic-home"' in main_scss, "academic homepage stylesheet is not imported")
    require(".academic-home" in design_scss, "academic homepage styles are not scoped")
    require("publication-item" in design_scss, "publication row styles are missing")
    require(".publication-links" not in design_scss, "obsolete publication-link styles must be removed")
    require("profile-links" not in about, "research profile links should not be duplicated in the intro")
    require('aria-label="Toggle navigation"' in masthead, "mobile navigation button has no accessible label")
    require('aria-expanded="false"' in masthead, "mobile navigation button has no initial expanded state")
    require("aria-expanded" in navigation_js, "mobile navigation does not update its expanded state")
    require("page.body_class" in default_layout, "default layout does not expose the homepage body class")
    require("page.hide_title" in single_layout, "single layout does not support a compact hidden title")
    for anchor in ["/#about", "/#news", "/#selected-publications", "/#research-experience", "/#honors-awards", "/#education"]:
        require(anchor in navigation, f"navigation is missing: {anchor}")

    publication_images = [
        "adamm.png",
        "mst-kdnet.png",
        "reborn.png",
        "xlstm-hved.png",
        "mstnet.png",
        "sckansformer.png",
        "gfe-mamba.png",
    ]
    for filename in publication_images:
        relative = f"images/publications/{filename}"
        path = ROOT / relative
        require(path.is_file(), f"publication thumbnail is missing: {relative}")
        require(f'/images/publications/{filename}' in about, f"publication thumbnail is not used: {filename}")
        if path.is_file():
            with Image.open(path) as image:
                require(500 <= image.width <= 800, f"{relative} should be optimized to 500–800px wide, got {image.width}px")


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


def check_generated() -> None:
    site = ROOT / "_site"
    require(site.is_dir(), "_site must exist; run a fresh Jekyll build")
    require((site / "sitemap.xml").is_file(), "generated sitemap.xml is missing")
    index = site / "index.html"
    require(index.is_file(), "generated homepage is missing")
    if index.is_file():
        homepage_html = index.read_text(encoding="utf-8")
        require('class="research-snapshot"' in homepage_html, "generated homepage is stale: research snapshot is missing")
        require('class="publication-item"' in homepage_html, "generated homepage is stale: publication rows are missing")
        require("Online Research Intern" not in homepage_html, "generated homepage still contains the online qualifier")
        newest_source = max(
            (ROOT / path).stat().st_mtime
            for path in [
                "_pages/about.md",
                "_config.yml",
                "_data/navigation.yml",
                "_includes/author-profile.html",
                "_includes/masthead.html",
                "_sass/layout/_academic-home.scss",
                "assets/css/main.scss",
                "_layouts/default.html",
                "_layouts/single.html",
            ]
        )
        require(index.stat().st_mtime >= newest_source, "generated homepage predates the current source files")
    for relative in ["docs", "scripts", "CONTRIBUTING.md", "docker-compose.yaml"]:
        require(not (site / relative).exists(), f"generated site exposes {relative}")
    generated_html = [
        (path, path.read_text(encoding="utf-8")) for path in site.rglob("*.html")
    ]
    broken_sitemap_links = [
        path for path, html in generated_html if 'href="/sitemap/"' in html
    ]
    sitemap_links = [
        (path, href)
        for path, html in generated_html
        for href in re.findall(r'href="([^"]+)"', html)
        if urlparse(href).path == "/sitemap.xml"
    ]
    require(not broken_sitemap_links, "generated HTML contains broken /sitemap/ link")
    require(
        bool(sitemap_links),
        "generated HTML is missing the /sitemap.xml footer link",
    )


CHECKS = {
    "config": check_config,
    "content": check_content,
    "design": check_design,
    "cleanup": check_cleanup,
    "icons": check_icons,
    "generated": check_generated,
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
