# Video to Website

This project scaffolds a scroll-driven website experience built around extracted video frames.

## What is included

- `index.html` — premium scroll website structure
- `css/style.css` — dark immersive visual design
- `js/app.js` — Lenis + GSAP scroll animation and canvas frame rendering
- `frames/` — directory for extracted frame images

## How to use

1. Extract your video frames into `frames/` with names like `frame_0001.webp`, `frame_0002.webp`, etc.
2. Open `index.html` in a local web server. For example:
   - `python3 -m http.server 8000`
   - `npx http-server .`
3. Visit `http://localhost:8000`.

## Frame extraction example

```bash
ffmpeg -i your-video.mp4 -vf "fps=12,scale=1280:-1" -c:v libwebp -quality 80 frames/frame_%04d.webp
```

## Notes

- If frame files are not present, the page still loads with a placeholder canvas.
- The site uses scroll-driven animation and a circle-wipe hero reveal.
