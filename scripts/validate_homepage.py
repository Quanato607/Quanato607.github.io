#!/usr/bin/env python3
"""Validate static GitHub Pages academic homepage files, assets, links, and content invariants."""

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


def read(relative_path: str) -> str:
    return (ROOT / relative_path).read_text(encoding="utf-8")


def resolve_local_target(raw_ref: str) -> Path | None:
    if not raw_ref or raw_ref.startswith(("http://", "https://", "mailto:", "data:", "#", "javascript:")):
        return None
    parsed = urlparse(raw_ref)
    rel = parsed.path.lstrip("/")
    if not rel:
        return ROOT / "index.html"
    candidate = ROOT / rel
    if candidate.is_dir():
        return candidate / "index.html"
    if raw_ref.endswith("/"):
        return ROOT / rel / "index.html"
    return candidate


def check_structure() -> None:
    required_files = [
        ".nojekyll",
        "index.html",
        "cv/index.html",
        "about/index.html",
        "about.html",
        "404.html",
        "sitemap.xml",
        "files/Shenghao_Zhu_CV.pdf",
        "images/github-calligraphy-signature.png",
        "images/publications/idea-rl.png",
        "images/publications/idea-rl-actions.png",
        "images/publications/idea-rl-xpatient.png",
        "images/publications/idea-rl-dynamics.png",
        "images/publications/adamm-graph.png",
        "images/publications/adamm-heatmaps.png",
        "images/publications/adamm-adapters.png",
        "images/publications/reborn-split.png",
        "images/publications/reborn-radar.png",
        "images/publications/gfe-mamba-gradcam.png",
        "assets/css/modern-home.css",
        "assets/js/modern-home.js",
    ]
    for rel in required_files:
        require((ROOT / rel).is_file(), f"Required static file missing: {rel}")

    require(
        not (ROOT / "images/publications/xpatient-idearl.svg").exists(),
        "Deprecated images/publications/xpatient-idearl.svg should be deleted",
    )
    require(
        not (ROOT / "images/publications/idea-rl-results.png").exists(),
        "Removed images/publications/idea-rl-results.png should not exist",
    )

    for html_rel in ["index.html", "cv/index.html", "about/index.html", "about.html", "404.html"]:
        path = ROOT / html_rel
        if not path.is_file():
            continue
        text = path.read_text(encoding="utf-8")
        require(not text.lstrip().startswith("---"), f"Unrendered YAML front matter found in {html_rel}")
        for attr, ref in re.findall(r'\b(src|href)="([^"]+)"', text):
            target = resolve_local_target(ref)
            if target is not None:
                require(target.exists(), f"{html_rel}: {attr}=\"{ref}\" does not resolve to an existing file ({target})")


def check_content_and_safety() -> None:
    index_html = read("index.html")
    cv_html = read("cv/index.html")
    html404 = read("404.html")
    css_text = read("assets/css/modern-home.css")
    js_text = read("assets/js/modern-home.js")

    require('id="research-vision"' not in index_html, "Research Vision section must be removed from index.html")
    require('href="#research-vision"' not in index_html, "Research Vision nav link must be removed from index.html")
    require('href="/#research-vision"' not in cv_html, "Research Vision nav link must be removed from cv/index.html")

    required_index = [
        "University of Michigan",
        "Prof. Liyue Shen",
        "Ant Group",
        "Dr. Le Lu",
        "6zr4pucAAAAJ",
        "22320220@hdu.edu.cn",
        "AdaMM",
        "ReBorn",
        "MST-KDNet",
        "XLSTM-HVED",
        "XPatient",
        "IDEA-RL",
        "No Critic, Which Clue? Quantifying Evidence Advantages in Interactive Diagnosis",
        "Erbao 二宝",
        "/images/github-calligraphy-signature.png",
        "/images/publications/idea-rl.png",
        "/files/Shenghao_Zhu_CV.pdf",
    ]
    for item in required_index:
        require(item in index_html, f"index.html is missing required fact: {item}")

    require("<em>Medical Image Analysis</em>, 2026 · First author" in index_html, "AdaMM must be labeled First author on index.html")
    require("Track I" in index_html and "Track II" in index_html and "Track III" in index_html, "Overview must contain Track I, Track II, and Track III")
    require("patient world models" in index_html.lower() and "doctor consultation and diagnosis models" in index_html.lower(), "Track III must describe patient world models for doctor consultation and diagnosis models")
    require(len(re.findall(r'class="focus-item(?:\s|")', index_html)) == 3, "Overview focus ledger must contain exactly 3 tracks")
    require('class="calligraphy-mark"' not in index_html, "Old top-right calligraphy-mark watermark must be removed")
    require('class="seal"' not in index_html and 'class="seal"' not in cv_html, "Vermilion seal (.seal) must be removed")
    require("Set in Crimson Pro" not in index_html and "Set in Crimson Pro" not in cv_html, "Removed Crimson Pro colophon attribution must not appear")
    require('class="side"' in index_html and 'class="side-toc"' in index_html, "Left rail (.side + .side-toc) is required in index.html")
    require('class="inscription hero-signature"' in index_html, "Enlarged calligraphy inscription is missing")
    require("sz-theme-session" in index_html and "sz-theme-session" in cv_html and "sz-theme-session" in html404 and "sz-theme-session" in js_text, "Auto dark mode session key sz-theme-session must be wired in all pages and JS")
    require("prefers-color-scheme: dark" in index_html and "prefers-color-scheme: dark" in cv_html and "prefers-color-scheme: dark" in html404 and "prefers-color-scheme: dark" in js_text, "Auto dark mode prefers-color-scheme detection must be wired")
    require("#f7f4ed" in css_text and "#141311" in css_text, "Both Xuan-paper light (#f7f4ed) and lacquer-black dark (#141311) tokens must exist in modern-home.css")

    require("No Critic, Which Clue? Quantifying Evidence Advantages in Interactive Diagnosis" in cv_html, "cv/index.html must include real IDEA-RL title")
    require("In preparation for ICML" in index_html and "In preparation for ICML" in cv_html, "IDEA-RL venue must read 'In preparation for ICML'")
    require("Preprint, 2026" not in index_html, "Old 'Preprint, 2026' IDEA-RL venue must be replaced")
    require("★" not in index_html and "Code (" not in index_html, "Star counts next to Code buttons must be removed")
    require('id="lightbox-modal"' not in index_html and 'class="zoom-hint"' not in index_html, "Figure Lightbox zoom must be removed in favor of direct paper/repo links")
    require("Figures cycle left-to-right" not in index_html and 'class="pub-subnote"' not in index_html, "Instructional .pub-subnote line must be removed from index.html")
    require("westlake" not in index_html.lower() and "westlake" not in cv_html.lower(), "Westlake University must be removed from index.html and cv/index.html")
    stage_links = re.findall(r'<a class="pub-stage"\s+href="([^"]+)"', index_html)
    title_links = re.findall(r'<a class="pub-title-link"\s+href="([^"]+)"', index_html)
    require(len(stage_links) == 7, f"Expected 7 paper/project clickable figures (excluding forthcoming ReBorn), found {len(stage_links)}")
    require(len(title_links) == 7, f"Expected 7 paper/project clickable titles (excluding forthcoming ReBorn), found {len(title_links)}")
    allowed_paper_markers = ("doi.org", "arxiv.org", "ieeexplore.ieee.org", "/idea-rl/")
    for href in stage_links + title_links:
        require("github.com" not in href.lower(), f"Publication figure/title link must point to paper, never GitHub code: {href}")
        require(any(marker in href for marker in allowed_paper_markers), f"Unexpected paper/project URL target: {href}")
    require('<div class="pub-stage pub-stage--static"' in index_html and "Paper &amp; Code Coming Soon" in index_html, "Forthcoming ReBorn card must use non-link static stage until proceedings release")

    # Check every publication card has >= 2 slides, tab parity, concise explicit Insight, published-only BibTeX, and unpublished privacy
    pub_cards = re.findall(r'<article class="pub-card".*?</article>', index_html, re.S)
    require(len(pub_cards) == 8, f"Expected 8 publication cards, found {len(pub_cards)}")
    unpublished_forbidden = ["Yefeng Zheng", "Zhaojie Fang", "Liyue Shen", "Yifei Chen", "Weihong Chen"]
    bibtex_ids_seen = set(re.findall(r'data-bibtex-id="([^"]+)"', index_html))
    expected_published_bibtex = {"adamm", "mstkdnet", "xlstmhved", "mstnet", "sckansformer"}
    require(bibtex_ids_seen == expected_published_bibtex, f"BibTeX must exist strictly for the 5 published papers {sorted(expected_published_bibtex)}, found {sorted(bibtex_ids_seen)}")
    for idx, card in enumerate(pub_cards, start=1):
        require('<span class="insight-tag">Insight</span>' in card, f"Publication card #{idx} is missing explicit Insight tag")
        m_insight = re.search(r'<p class="pub-insight">(.*?)</p>', card, re.S)
        require(m_insight is not None, f"Publication card #{idx} is missing <p class=\"pub-insight\">")
        if m_insight:
            plain_insight = re.sub(r"<[^>]+>", "", m_insight.group(1)).strip()
            body_text = re.sub(r"^Insight\s+", "", plain_insight)
            word_count = len(body_text.split())
            require(12 <= word_count <= 32, f"Publication card #{idx} insight word count ({word_count}) must be between 12 and 32")
        slides = re.findall(r'class="pub-slide(?:\s|")', card)
        tabs = re.findall(r'class="pub-slide-tab(?:\s|")', card)
        require(len(slides) == len(tabs), f"Publication card #{idx} slide count ({len(slides)}) != tab count ({len(tabs)})")
        require(len(slides) >= 2, f"Publication card #{idx} must contain at least 2 slides, found {len(slides)}")
        if "No Critic, Which Clue?" in card:
            require(len(slides) == 4, f"IDEA-RL & XPatient card must contain 4 slides, found {len(slides)}")
            require(">Results<" not in card, "IDEA-RL & XPatient card must not contain Results tab")
        if "No Modality Left Behind:" in card:
            require(len(slides) == 5, f"AdaMM card must contain 5 slides, found {len(slides)}")
        if "ReBorn:" in card:
            require(len(slides) == 4, f"ReBorn card must contain 4 slides, found {len(slides)}")
        if "GFE-Mamba:" in card:
            require(len(slides) == 4, f"GFE-Mamba card must contain 4 slides, found {len(slides)}")
        if any(marker in card for marker in ("No Critic, Which Clue?", "ReBorn:", "GFE-Mamba:")):
            require("data-bibtex-id" not in card and ">BibTeX<" not in card, f"Unpublished/forthcoming card #{idx} must not include BibTeX button")
            for name in unpublished_forbidden:
                require(name not in card, f"Unpublished/under-review card #{idx} must not list coauthor/advisor '{name}'")
            require("<strong>First author</strong>" in card or "<strong>Co-first author</strong>" in card, f"Unpublished card #{idx} must state author role only")

    for forbidden_bib in ("xpatient", "reborn", "gfemamba"):
        require(not re.search(rf"\b{forbidden_bib}\s*:", js_text), f"BIBTEX_MAP in modern-home.js must not include unpublished entry '{forbidden_bib}'")
    for pub_bib in expected_published_bibtex:
        require(bool(re.search(rf"\b{pub_bib}\s*:\s*`", js_text)), f"BIBTEX_MAP missing published entry '{pub_bib}'")

    forbidden_green_tokens = ["#0d9488", "#0f766e", "#2dd4bf", "#5eead4", "13, 148, 136", "45, 212, 191"]
    for file_name, content in [
        ("index.html", index_html),
        ("cv/index.html", cv_html),
        ("404.html", html404),
        ("modern-home.css", css_text),
        ("modern-home.js", js_text),
    ]:
        lowered = content.lower()
        for tok in forbidden_green_tokens:
            require(tok not in lowered, f"Forbidden green/teal color token '{tok}' found in {file_name}")
        require("transferred" not in lowered, f"Forbidden status 'transferred' appeared in {file_name}")
        require("causal value" not in lowered, f"Forbidden phrase 'causal value' appeared in {file_name}")
        require("true information gain" not in lowered, f"Forbidden phrase 'true information gain' appeared in {file_name}")
        require("583w39saaaaj" not in lowered, f"Stale Scholar ID appeared in {file_name}")

    for file_name, content in [
        ("index.html", index_html),
        ("cv/index.html", cv_html),
        ("modern-home.js", js_text),
    ]:
        lowered = content.lower()
        require("acl submission" not in lowered, f"Forbidden 'acl submission' wording found in {file_name}")
        require("acl rolling review" not in lowered, f"Forbidden 'acl rolling review' wording found in {file_name}")

    require("Online Research Intern" not in index_html, "Online qualifier should not appear in homepage experience")


def check_assets() -> None:
    manifest_path = ROOT / "images/manifest.json"
    require(manifest_path.is_file(), "images/manifest.json missing")
    if manifest_path.is_file():
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        for icon in manifest.get("icons", []):
            target = resolve_local_target(icon.get("src", ""))
            require(target is not None and target.is_file(), f"Manifest icon missing: {icon.get('src')}")

    signature = ROOT / "images/github-calligraphy-signature.png"
    require(signature.is_file(), "images/github-calligraphy-signature.png missing")
    if signature.is_file():
        with Image.open(signature) as im:
            require(im.mode == "RGBA", "Signature PNG must be RGBA")

    for fig in Path(ROOT / "images/publications").glob("*.png"):
        with Image.open(fig) as im:
            require(im.width > 100 and im.height > 100, f"Invalid dimensions for {fig.name}")

    cv_pdf = ROOT / "files/Shenghao_Zhu_CV.pdf"
    require(cv_pdf.is_file() and cv_pdf.stat().st_size > 1024, "CV PDF missing or unexpectedly small")
    if cv_pdf.is_file():
        reader = PdfReader(str(cv_pdf))
        require(len(reader.pages) >= 1, "CV PDF must contain at least 1 page")
        first_page_text = reader.pages[0].extract_text() or ""
        require("Shenghao Zhu" in first_page_text, "CV PDF missing candidate name")


CHECKS = {
    "structure": check_structure,
    "content": check_content_and_safety,
    "assets": check_assets,
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
        for err in ERRORS:
            print(f"- {err}")
        return 1
    print(f"Homepage validation passed: {args.check}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
