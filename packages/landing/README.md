# packages/landing

Static landing page for chess — plain HTML + CSS, no build step.

## Structure

```
index.html    # single-page site (nav, hero, features, demo, how it works, install, footer)
404.html      # GitHub Pages 404 page
styles.css    # all styles; light page, dark terminals
logo.svg      # brand mark (nav, 404, apple-touch-icon)
favicon.svg   # favicon
og-image.png  # Open Graph image (1280x640)
robots.txt    # allow all + sitemap reference
sitemap.xml   # single-URL sitemap for the Pages site
humans.txt    # project/team credits
```

Asset paths are relative, so the same files work locally and under the
GitHub Pages `/chess/` base path. Open `index.html` directly or serve the
directory:

```bash
python3 -m http.server 8000 -d packages/landing
```

`og-image.png` is rendered from `assets/svg/brand/og.svg`:

```bash
rsvg-convert -w 1280 -h 640 assets/svg/brand/og.svg -o packages/landing/og-image.png
```

## Deployment

CI deploys this directory to GitHub Pages on pushes to `master` — there is no
build or test step.
