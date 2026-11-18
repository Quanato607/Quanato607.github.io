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
        "images/publications/idea-rl-results.png",
        "assets/css/modern-home.css",
        "assets/js/modern-home.js",
    ]
    for rel in required_files:
        require((ROOT / rel).is_file(), f"Required static file missing: {rel}")

    require(
        not (ROOT / "images/publications/xpatient-idearl.svg").exists(),
        "Deprecated images/publications/xpatient-idearl.svg should be deleted",
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
    require('class="calligraphy-mark"' not in index_html, "Old top-right calligraphy-mark watermark must be removed")
    require('class="side"' in index_html and 'class="axis"' in index_html, "Two-column monograph shell (.side + .axis) is required in index.html")
    require('class="inscription hero-signature"' in index_html and 'class="seal"' in index_html, "Side-bottom calligraphy inscription and vermilion seal are missing")
    require("sz-ink-theme" in index_html and "sz-ink-theme" in js_text, "Default Xuan-paper theme key sz-ink-theme must be wired")
    require("#f7f4ed" in css_text and "#141311" in css_text, "Both Xuan-paper light (#f7f4ed) and lacquer-black dark (#141311) tokens must exist in modern-home.css")

    require("No Critic, Which Clue? Quantifying Evidence Advantages in Interactive Diagnosis" in cv_html, "cv/index.html must include real IDEA-RL title")
    require('id="lightbox-modal"' not in index_html and 'class="zoom-hint"' not in index_html, "Figure Lightbox zoom must be removed in favor of direct paper/repo links")
    require(len(re.findall(r'<a class="pub-stage"\s+href="[^"]+"', index_html)) == 8, "All 8 publication figures must be direct clickable links")
    require(len(re.findall(r'<a class="pub-title-link"\s+href="[^"]+"', index_html)) == 8, "All 8 publication titles must be direct clickable links")

    # Check every publication card has >= 2 slides and unpublished cards do not expose coauthor/advisor names
    pub_cards = re.findall(r'<article class="pub-card".*?</article>', index_html, re.S)
    require(len(pub_cards) == 8, f"Expected 8 publication cards, found {len(pub_cards)}")
    unpublished_forbidden = ["Yefeng Zheng", "Zhaojie Fang", "Liyue Shen", "Yifei Chen", "Weihong Chen"]
    for idx, card in enumerate(pub_cards, start=1):
        slides = re.findall(r'class="pub-slide(?:\s|")', card)
        require(len(slides) >= 2, f"Publication card #{idx} must contain at least 2 slides, found {len(slides)}")
        if "No Critic, Which Clue?" in card:
            require(len(slides) == 5, f"IDEA-RL & XPatient card must contain 5 slides, found {len(slides)}")
        if any(marker in card for marker in ("No Critic, Which Clue?", "ReBorn:", "GFE-Mamba:")):
            for name in unpublished_forbidden:
                require(name not in card, f"Unpublished/under-review card #{idx} must not list coauthor/advisor '{name}'")
            require("<strong>First author</strong>" in card or "<strong>Co-first author</strong>" in card, f"Unpublished card #{idx} must state author role only")

    for bib_key in ("xpatient", "reborn", "gfemamba"):
        m = re.search(rf"{bib_key}\s*:\s*`([^`]*)`", js_text, re.S)
        require(m is not None, f"BibTeX entry missing for {bib_key}")
        if m:
            for name in unpublished_forbidden:
                require(name not in m.group(1), f"BibTeX entry {bib_key} must not expose '{name}'")

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
