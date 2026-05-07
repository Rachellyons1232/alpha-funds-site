# Project: Alpha Funds Website

This is a **static website** (HTML/CSS/JS, no build step). Vercel deploys it directly from this repo.

## Deploy sources

The site has multiple HTML entry points and self-contained deploy folders:

- `alpha-funds-deploy/index.html` — the version Vercel currently deploys
- `export/index.html` — an alternate export of the site
- `alpha-funds.html` (root) — a working copy
- `index.html`, `earth.html`, `boyfriend-app.html` — additional pages

Each deploy folder (`alpha-funds-deploy/`, `export/`) is **self-contained** and bundles its own copy of `frames/`, `portfolio/`, `team/`, and image assets. Do not assume a folder named `*-deploy/` is a throwaway build artifact — it is the deploy source.

## Rule: never gitignore site assets

When adding entries to `.gitignore`:

1. **Default to including all media files** (`.png`, `.jpg`, `.webp`, `.mp4`, etc.). If a file lives in this repo, assume the site might use it.
2. Before excluding any folder or file pattern, **grep every HTML file** (root and deploy folders) for references — including URL-encoded forms like `sophia%20space%20image.png`:
   ```
   grep -roE '(src|href|poster|url\()[="'\''][^"'\'')]*\.(mp4|webm|webp|png|jpg|jpeg|gif|svg|mov)' . --include="*.html" --include="*.css" --include="*.js"
   ```
3. Only exclude things that are clearly **not site content**: OS metadata (`.DS_Store`), tool binaries (`ffmpeg`), local editor/IDE config (`.claude/`), and zip archives that just duplicate tracked folders.
4. **When in doubt, include it.** A bloated repo is recoverable; a broken deploy is visible to users.

## Rule: verify after pushing

After any push that changes `.gitignore` or removes files, ask the user to check the live Vercel deploy before considering the task done. Static-site asset errors only show up at runtime.

## Large files

GitHub warns at 50MB per file and blocks at 100MB. The largest tracked file is `video/earth.mp4` (~44MB). If a new asset would exceed 50MB, flag it before committing — Git LFS may be needed.
