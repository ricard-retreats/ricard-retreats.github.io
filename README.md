# Ricard Retreats (website)

Static site for Ricard Chillon's Lanzarote yoga retreat, 5–10 November 2026.
Plain HTML/CSS/JS, no build step.

Live site: https://ricard-retreats.github.io/
Repository: `ricard-retreats/ricard-retreats.github.io` (GitHub organisation `ricard-retreats`),
published with GitHub Pages from the `main` branch root (legacy build, `.nojekyll`).

The older preview at https://fergalfinnerty.github.io/ricardo-retreats/ (repo
`fergalfinnerty/ricardo-retreats`) is legacy; edit this repository instead.

## Editing content
1. Edit `site-config.js` (brand name, host name/title/bio, RR badge labels, playful line,
   eyebrow, dates, facts, arrival/rooms/payment copy, Instagram and chef links, contact email,
   hero and gallery images, optional host/chef photos, page title, description, share tags,
   site URL, footer, colours, form endpoint). It must stay valid JSON after `window.SITE =` (whole-line `//` comments are fine).
2. Run `python3 tools/sync-meta.py --bump` (no dependencies). It copies the config into the static
   `index.html`: `<title>`, description, Open Graph/Twitter tags, every `data-bind` text,
   bound links/labels/images, the villa gallery, and the optional email button/text. `js/main.js` also applies the config in the
   browser, but link previews and crawlers only read the static HTML, so run the script after edits.
3. Commit and push to `main`; Pages redeploys automatically.

Not driven by the config: the section copy written directly in `index.html` (experience
moments, villa paragraph, food text, included list, FAQ answers), the RR monogram drawing
(SVG `<symbol id="rr-pair">` in `index.html`, also in `favicon.svg`), and the share image
`assets/images/og-cover.jpg`, which is rendered from `tools/og-cover.html` with headless Chrome.

## Cache busting (assetVersion)
`site-config.js` has one `assetVersion`. `python3 tools/sync-meta.py --bump` sets it to the
current date and time, then writes `?v=<assetVersion>` onto every local stylesheet, script,
config, favicon and image reference in `index.html`, and sets `<html data-asset-version>`.
`js/main.js` only lets the config change images (hero, gallery, optional host/chef photos) when
the config's `assetVersion` matches the page. A stale cached config therefore can't put old
photos back: the static gallery in `index.html` stays. Bump after every change you deploy.

## Images
Real stills from the 4 June 2026 villa videos (kept out of git in `assets/raw/`), exported at
native resolution with no upscaling or retouching.
- Hero: a sea-view room, VID-20260604-WA0013 at about 23.0s, 464×620.
- Villa gallery (`images.gallery`, shown as an aligned 2x2 grid of 4:3 crops, one column on
  mobile; each item has files, alt, caption and an optional `position` focal point):
  studio with the sea (WA0011, 27.4s), dining/living space with the sea (WA0013, 8.0s),
  communal lounge (WA0013, 3.0s), bedroom (WA0012, 7.0s).
The grid is capped at 960px wide so the ~464px source frames aren't stretched.
Host and chef photos are optional (`images.host` / `images.chef`). While they are `null`, those
sections stay text-led and no empty box is shown.

## Contact
- `contact.instagramUrl`: the main "Message Ricard on Instagram" button.
- `contact.email` + `contact.emailSubject`: when the email is set, an "Email Ricard" mailto button
  appears next to the Instagram button, the address is written out under it, and it is added to
  the "How do I ask about joining?" FAQ answer. Leave the email `""` to hide all three. The site
  never sends email itself; the button just opens the visitor's own mail app.

## Enquiry form
Hidden while `contact.formEndpoint` is empty; visitors see the Instagram (and email) buttons only. When a
real endpoint (e.g. Formspree) is added, the form appears and shows a thank-you only after a
successful (2xx) response, otherwise a friendly error pointing to Instagram.

## Site address
All asset paths are relative, so the site works at any address. The canonical link, `og:url` and
the absolute `og:image` come from `meta.siteUrl` (written into the HTML by `tools/sync-meta.py`).
It is set to the live address https://ricard-retreats.github.io/.

The `ricard-retreats` organisation exists and this repository is the published site.
`tools/deploy-clean-url.sh` was the one-off script that first created this repo from the legacy
preview; it refuses to run now that the repo exists, so don't use it for normal updates. Just
edit, run `sync-meta.py --bump`, commit and push to `main`.

## Draft status
`<meta name="robots" content="noindex, nofollow">` stays in `index.html` until the site is approved.

## Local preview
`python3 -m http.server 8765` then open http://localhost:8765/
