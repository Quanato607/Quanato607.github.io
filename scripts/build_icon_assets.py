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
