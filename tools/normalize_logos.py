"""Normalize portfolio logos for the Alpha Funds dark-tile grid.

Reads each source in SLUG_MAP from portfolio/, knocks out the background by
luminance (auto-detecting whether the source is dark-on-light or
light-on-dark), recolors every opaque pixel to pure white, trims to the
non-transparent bounding box, and pads onto a uniform 1.6:1 transparent
canvas with consistent visual weight.

Re-run after dropping new source art into portfolio/.
"""

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
PORTFOLIO = ROOT / "portfolio"

CANVAS_W, CANVAS_H = 800, 500
MAX_W_RATIO = 0.92
MAX_H_RATIO = 0.78
GAMMA = 1.4
NEAR_BG_BIAS = 0.02

SLUG_MAP = {
    "anthropic": "anthropic-ai-logo-vector.png",
    "bioorbit": "BioOrbit-logo_1200.jpg",
    "boom": "Boom-Technology-Logo.jpg",
    "dawn": "dawnaerospace.png",
    "gravitics": "gravitics.png",
    "openai": "OpenAI-Logo-2022.png",
    "sophia": "sophiaspace.jpg",
    "starpath": "starpath.png",
    "stathera": "stathera.png",
    "xset": "XSET_logo.png",
}


def has_meaningful_alpha(img):
    """True if the source already uses transparency for shape information."""
    if img.mode != "RGBA":
        return False
    alpha = img.split()[-1]
    transparent_px = sum(1 for p in alpha.getdata() if p < 245)
    return transparent_px > (img.size[0] * img.size[1] * 0.01)


def detect_polarity(img):
    """Return True if mark is dark-on-light. Samples only opaque corner pixels."""
    rgba = img.convert("RGBA")
    w, h = rgba.size
    patch = 8
    samples = []
    for x0, y0 in [(0, 0), (w - patch, 0), (0, h - patch), (w - patch, h - patch)]:
        region = rgba.crop((x0, y0, x0 + patch, y0 + patch))
        opaque = [(r, g, b) for r, g, b, a in region.getdata() if a > 200]
        if not opaque:
            continue
        avg = sum(0.2126 * r + 0.7152 * g + 0.0722 * b for r, g, b in opaque) / len(opaque) / 255.0
        samples.append(avg)
    if not samples:
        return True
    return (sum(samples) / len(samples)) > 0.5


def silhouette(img):
    """Recolor every visible pixel to white. For transparent sources, keep the
    original alpha. For opaque sources, derive alpha from luminance (with
    polarity auto-detection)."""
    img = img.convert("RGBA")
    w, h = img.size
    out = Image.new("RGBA", (w, h), (255, 255, 255, 0))
    out_pixels = out.load()
    src_pixels = img.load()

    if has_meaningful_alpha(img):
        for y in range(h):
            for x in range(w):
                a = src_pixels[x, y][3]
                if a > 0:
                    out_pixels[x, y] = (255, 255, 255, a)
        return out

    dark_on_light = detect_polarity(img)
    for y in range(h):
        for x in range(w):
            r, g, b, a = src_pixels[x, y]
            if a == 0:
                continue
            lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255.0
            shape = (1.0 - lum) if dark_on_light else lum
            shape = max(0.0, shape - NEAR_BG_BIAS) / (1.0 - NEAR_BG_BIAS)
            shape = shape ** GAMMA
            new_a = int(round(a * shape))
            if new_a > 0:
                out_pixels[x, y] = (255, 255, 255, new_a)
    return out


def trim(img):
    bbox = img.getbbox()
    return img.crop(bbox) if bbox else img


def pad_to_canvas(logo):
    canvas = Image.new("RGBA", (CANVAS_W, CANVAS_H), (255, 255, 255, 0))
    lw, lh = logo.size
    max_w = CANVAS_W * MAX_W_RATIO
    max_h = CANVAS_H * MAX_H_RATIO
    scale = min(max_w / lw, max_h / lh)
    new_w = max(1, int(round(lw * scale)))
    new_h = max(1, int(round(lh * scale)))
    resized = logo.resize((new_w, new_h), Image.LANCZOS)
    x = (CANVAS_W - new_w) // 2
    y = (CANVAS_H - new_h) // 2
    canvas.alpha_composite(resized, (x, y))
    return canvas


def process(slug, src_name):
    src = PORTFOLIO / src_name
    dst = PORTFOLIO / f"{slug}.png"
    img = Image.open(src)
    sil = silhouette(img)
    trimmed = trim(sil)
    final = pad_to_canvas(trimmed)
    final.save(dst, "PNG", optimize=True)
    print(f"  {src_name}  ->  {dst.name}  ({trimmed.size[0]}x{trimmed.size[1]} trimmed)")


def main():
    print(f"Normalizing {len(SLUG_MAP)} logos into {PORTFOLIO}/")
    for slug, src_name in SLUG_MAP.items():
        process(slug, src_name)
    print("Done.")


if __name__ == "__main__":
    main()
