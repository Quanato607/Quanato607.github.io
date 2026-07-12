#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from urllib.parse import urlparse

from PIL import Image

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
    require(bool(re.search(r'^future\s*:\s*false\s*$', config, re.MULTILINE)), "future posts must be disabled")
    require(bool(re.search(r'^\s+name\s*:\s*"Shenghao Zhu"\s*$', config, re.MULTILINE)), "author name is incorrect")
    require(bool(re.search(r'^\s+employer\s*:\s*"Ant Group"\s*$', config, re.MULTILINE)), "current employer must be Ant Group")
    require("6zr4pucAAAAJ" in config, "Google Scholar profile ID is incorrect")
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
        "missing-modality segmentation",
        "Westlake University",
        "Tsinghua University",
        "Medical Image Analysis",
        "MICCAI 2025",
        "ReBorn: Turning Full-Modality Segmentation Models into Missing-Modality Survivors",
        "CVPR 2026 Findings",
        "ISBI 2025",
        "Zhejiang Provincial Government Scholarship",
        "IEEE T-ITS",
    ]
    for phrase in required_about:
        require(phrase in about, f"homepage is missing: {phrase}")
    for stale in ["junior undergraduate", "Still young over the world", "medical multi-turn dialogue", "583w39sAAAAJ"]:
        require(stale.lower() not in about.lower(), f"stale homepage text remains: {stale}")
    require("transferred" not in about.lower(), "transferred status must not appear on the homepage")
    require("March 2026 – July 2026" not in about, "Ant Group end date is stale on the homepage")
    require("March 2026 – Present" in cv_page, "Ant Group role must be current on the CV page")
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


def check_generated() -> None:
    site = ROOT / "_site"
    require(site.is_dir(), "_site must exist; run a fresh Jekyll build")
    require((site / "sitemap.xml").is_file(), "generated sitemap.xml is missing")
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
