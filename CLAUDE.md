# Project: Alpha Funds Website

This is a **static website** (HTML/CSS/JS, no build step). Vercel deploys directly from this repo's root.

## Single source of truth

The live site is **`index.html`** at the repo root. There is one HTML file. Edit it, push, Vercel deploys.

History note: this repo previously had three parallel copies of the site (`alpha-funds.html` at root, `alpha-funds-deploy/index.html`, `export/index.html`) which drifted out of sync, causing edits to one file to be invisible on the live site. That structure was collapsed — `alpha-funds-deploy/` and `export/` were deleted, and `alpha-funds.html` was renamed to `index.html`. **Do not re-create separate "deploy" or "export" folders** unless explicitly asked. One file, one source of truth.

Other HTML files at the root (`earth.html`, `boyfriend-app.html`, `alpha_funds_visual_guide_v3 (1).html`) are auxiliary pages or references, not part of the main site flow.

## Asset paths

The site references these paths (all relative to the repo root):

- `frames/orbital-NNNN.webp` — orbital animation sequence (121 frames)
- `portfolio/*.png` — portfolio company logos
- `team/*-matched.png`, `team/*.jpg` — team photos
- `sophia-space-clean.png` — hero/section image
- `video/earth.mp4` — used by `earth.html`
- `css/style.css`, `js/` — stylesheets and scripts

## Rule: never gitignore site assets

When adding entries to `.gitignore`:

1. **Default to including all media files** (`.png`, `.jpg`, `.webp`, `.mp4`, etc.). If a file lives in this repo, assume the site might use it.
2. Before excluding any folder or file pattern, **grep every HTML file** for references — including URL-encoded forms like `sophia%20space%20image.png`:
   ```
   grep -roE '(src|href|poster|url\()[="'\''][^"'\'')]*\.(mp4|webm|webp|png|jpg|jpeg|gif|svg|mov)' . --include="*.html" --include="*.css" --include="*.js"
   ```
3. Only exclude things that are clearly **not site content**: OS metadata (`.DS_Store`), tool binaries (e.g. `ffmpeg`), local editor/IDE config (`.claude/`), and zip archives.
4. **When in doubt, include it.** A bloated repo is recoverable; a broken deploy is visible to users.

## Rule: verify after pushing

After any push that changes `.gitignore`, removes files, or restructures folders, ask the user to check the live Vercel deploy before considering the task done. Static-site asset errors only show up at runtime.

## Vercel deployment

- **Root Directory** in Vercel project settings should be **`/`** (or empty). The site deploys from the repo root.
- Production branch is `main`. Pushes to `main` auto-trigger deploys.
- Production URL: https://alpha-funds-site.vercel.app/

## Large files

GitHub warns at 50MB per file and blocks at 100MB. The largest tracked file is `video/earth.mp4` (~44MB). If a new asset would exceed 50MB, flag it before committing — Git LFS may be needed.
