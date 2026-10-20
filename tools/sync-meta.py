#!/usr/bin/env python3
"""Copy values from site-config.js into the static index.html.

Why: js/main.js applies site-config.js in the browser, but link previews (messaging apps,
iMessage, social sites), crawlers and visitors without JavaScript only read the static
HTML. Run this after editing site-config.js so both stay identical:

    python3 tools/sync-meta.py --bump   (sets a new assetVersion first; use after any change)
    python3 tools/sync-meta.py          (sync only, keeps the current assetVersion)

It rewrites:
  * the cache-busting ?v=<assetVersion> on styles, scripts, config, favicon and every image,
    plus <html data-asset-version>, which main.js compares with the config before touching images
  * the <title>, description, Open Graph / Twitter tags and canonical link (META block)
  * the text of every element with data-bind="path" (simple text elements only)
  * href / aria-label / src / srcset / alt attributes marked data-bind-href etc.
  * the static villa gallery (GALLERY block)
  * the optional email button/text: shown with a mailto: link when contact.email is set,
    hidden when it is empty
No third-party packages needed.
"""
import html
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CONFIG = ROOT / "site-config.js"
INDEX = ROOT / "index.html"


VERSION = ""


def ver(url):
    if not url or re.match(r"^(https?:|data:|mailto:)", url) or not VERSION:
        return url
    return re.sub(r"[?#].*$", "", url) + "?v=" + VERSION


def bump():
    import datetime
    stamp = datetime.datetime.now().strftime("%Y%m%d%H%M")
    text = CONFIG.read_text(encoding="utf-8")
    text, n = re.subn(r'("assetVersion":\s*")[^"]*(")', lambda m: m.group(1) + stamp + m.group(2), text, count=1)
    if n != 1:
        sys.exit("assetVersion not found in site-config.js")
    CONFIG.write_text(text, encoding="utf-8")
    return stamp


def load_config():
    text = CONFIG.read_text(encoding="utf-8")
    lines = [l for l in text.splitlines() if not l.lstrip().startswith("//")]
    text = "\n".join(lines)
    start = text.index("window.SITE")
    body = text[text.index("=", start) + 1:].strip()
    if body.endswith(";"):
        body = body[:-1]
    return json.loads(body)


def get(cfg, path):
    cur = cfg
    for key in path.split("."):
        if not isinstance(cur, dict) or key not in cur:
            return None
        cur = cur[key]
    return cur


def esc(v):
    return html.escape(str(v), quote=True)


def meta_block(cfg):
    m = cfg.get("meta", {})
    base = m.get("siteUrl", "")
    img = m.get("ogImage", "")
    if img and not img.startswith("http"):
        img = base + img
    title = m.get("title") or cfg.get("brandName", "")
    og_title = m.get("ogTitle") or title
    desc = m.get("description", "")
    og_desc = m.get("ogDescription") or desc
    rows = [
        f"<title>{esc(title)}</title>",
        f'<meta name="description" content="{esc(desc)}">',
        f'<link rel="canonical" href="{esc(base)}">',
        '<meta property="og:type" content="website">',
        f'<meta property="og:site_name" content="{esc(cfg.get("brandName", ""))}">',
        f'<meta property="og:title" content="{esc(og_title)}">',
        f'<meta property="og:description" content="{esc(og_desc)}">',
        f'<meta property="og:url" content="{esc(base)}">',
        f'<meta property="og:image" content="{esc(img)}">',
        '<meta property="og:image:width" content="1200">',
        '<meta property="og:image:height" content="630">',
        f'<meta property="og:image:alt" content="{esc(cfg.get("brandName", ""))}: {esc(cfg.get("tagline", ""))}">',
        '<meta name="twitter:card" content="summary_large_image">',
        f'<meta name="twitter:title" content="{esc(og_title)}">',
        f'<meta name="twitter:description" content="{esc(og_desc)}">',
        f'<meta name="twitter:image" content="{esc(img)}">',
    ]
    return "\n".join("  " + r for r in rows)


def picture(item, lazy=True):
    w = f' width="{item["width"]}"' if item.get("width") else ""
    h = f' height="{item["height"]}"' if item.get("height") else ""
    src = ""
    if item.get("webp"):
        src = f'<source type="image/webp" srcset="{esc(ver(item["webp"]))}">'
    load = ' loading="lazy"' if lazy else ""
    return (f'<picture>{src}<img src="{esc(ver(item.get("jpg") or item.get("src")))}"{w}{h}{load} '
            f'alt="{esc(item.get("alt", ""))}"></picture>')


def figure(item):
    pos = f' style="object-position: {esc(item["position"])}"' if item.get("position") else ""
    pic = picture(item).replace("<img ", f"<img{pos} ", 1) if pos else picture(item)
    cap = f'\n            <figcaption>{esc(item["caption"])}</figcaption>' if item.get("caption") else ""
    return f'          <figure class="g-item">\n            {pic}{cap}\n          </figure>'


def mailto(cfg):
    from urllib.parse import quote
    c = cfg.get("contact", {})
    email = (c.get("email") or "").strip()
    if not email:
        return ""
    subj = c.get("emailSubject") or ""
    return "mailto:" + email + ("?subject=" + quote(subj) if subj else "")


def review_card(t, pt):
    q = esc(t["quote"]).replace("&#x27;", "'")
    link = ""
    if t.get("sourceUrl"):
        link = (f'<a class="review-link" href="{esc(t["sourceUrl"])}" target="_blank" rel="noopener noreferrer">'
                f'{esc(pt.get("testimonialLinkText") or "Read on Instagram")}'
                f'<span class="visually-hidden"> (opens in a new tab)</span></a>')
    src = esc(pt.get("testimonialSourceLabel") or "")
    return ('            <figure class="review">\n'
            f'              <blockquote><p>{q}</p></blockquote>\n'
            f'              <figcaption><span class="review-name">{esc(t["name"])}</span>'
            f'<span class="review-source">{src}</span>{link}</figcaption>\n'
            '            </figure>')


def replace_block(s, name, content):
    pat = re.compile(r"(<!-- %s:START[^>]*-->)(.*?)(\s*<!-- %s:END -->)" % (name, name), re.S)
    if not pat.search(s):
        sys.exit(f"Marker {name} not found in index.html")
    return pat.sub(lambda mo: mo.group(1) + "\n" + content + mo.group(3), s, count=1)


def main():
    global VERSION
    if "--bump" in sys.argv[1:]:
        print("assetVersion ->", bump())
    cfg = load_config()
    VERSION = str(cfg.get("assetVersion") or "")
    s = INDEX.read_text(encoding="utf-8")

    # cache-busting versions on local CSS/JS/config/favicon/image references
    s = re.sub(r'(<html\b[^>]*\sdata-asset-version=")[^"]*"', lambda m: m.group(1) + esc(VERSION) + '"', s, count=1)
    def vref(mo):
        return mo.group(1) + esc(ver(mo.group(2))) + '"'
    s = re.sub(r'(\s(?:href|src|srcset|poster)=")((?!https?:|mailto:|#|data:)[^"]+\.(?:css|js|svg|jpg|jpeg|png|webp|mp4)(?:\?[^"]*)?)"', vref, s)

    s = replace_block(s, "META", meta_block(cfg))

    gallery = list(get(cfg, "images.gallery") or [])
    s = replace_block(s, "GALLERY", "\n".join(figure(i) for i in gallery))

    # Optional email: show/hide [data-email-only] and point [data-email-link] at the mailto URL
    href = mailto(cfg)
    def email_only(mo):
        tag = re.sub(r"\s+hidden(?=[\s>])", "", mo.group(0))
        return tag if href else tag[:-1] + " hidden>"
    s = re.sub(r"<[^<>]*\bdata-email-only\b[^<>]*>", email_only, s)
    if href:
        s = re.sub(r"(<[^<>]*\bdata-email-link\b[^<>]*\shref=\")[^\"]*", lambda mo: mo.group(1) + esc(href), s)

    # London yoga next-class line: copy endsAt into data-ends-at; hide statically if the label is empty
    nc = get(cfg, "londonYoga.nextClass") or {}
    def next_class(mo):
        tag = re.sub(r"\s+hidden(?=[\s>])", "", mo.group(0))
        if nc.get("endsAt"):
            tag = re.sub(r'data-ends-at="[^"]*"', 'data-ends-at="%s"' % esc(nc["endsAt"]), tag)
        return tag if (nc.get("label") or "").strip() else tag[:-1] + " hidden>"
    s = re.sub(r"<[^<>]*\bdata-next-class\b[^<>]*>", next_class, s)

    # Personal training reviews (TESTIMONIALS block); the wrapper is hidden when the list is empty
    pt = get(cfg, "personalTraining") or {}
    reviews = [t for t in (pt.get("testimonials") or []) if t.get("quote") and t.get("name")]
    s = replace_block(s, "TESTIMONIALS", "\n".join(review_card(t, pt) for t in reviews))
    def pt_wrap(mo):
        tag = re.sub(r"\s+hidden(?=[\s>])", "", mo.group(0))
        return tag if reviews else tag[:-1] + " hidden>"
    s = re.sub(r'<div class="pt-testimonials" id="pt-testimonials"[^<>]*>', pt_wrap, s, count=1)

    missing = []

    # <tag ... data-bind="path" ...>text</tag>  (only when the element holds plain text)
    def text_sub(mo):
        val = get(cfg, mo.group(2))
        if not isinstance(val, str):
            missing.append(mo.group(2))
            return mo.group(0)
        return mo.group(1) + esc(val).replace("&#x27;", "'") + mo.group(3)
    s = re.sub(r'(<[a-zA-Z][^<>]*\bdata-bind="([^"]+)"[^<>]*>)([^<]*)(?=</)',
               lambda mo: mo.group(1) + (esc(get(cfg, mo.group(2))).replace("&#x27;", "'")
                                         if isinstance(get(cfg, mo.group(2)), str)
                                         else (missing.append(mo.group(2)) or mo.group(3))),
               s)

    for attr, target in (("href", "href"), ("aria", "aria-label"), ("src", "src"),
                         ("srcset", "srcset"), ("alt", "alt"), ("poster", "poster")):
        def attr_sub(mo, target=target):
            tag = mo.group(0)
            val = get(cfg, mo.group(1))
            if not isinstance(val, str):
                missing.append(mo.group(1))
                return tag
            if target in ("src", "srcset", "poster"):
                val = ver(val)
            new = re.sub(r'\s%s="[^"]*"' % re.escape(target), f' {target}="{esc(val)}"', tag, count=1)
            if new == tag and f' {target}="' not in tag:
                new = tag[:-1] + f' {target}="{esc(val)}">'
            return new
        s = re.sub(r'<[^<>]*\bdata-bind-%s="([^"]+)"[^<>]*>' % attr, attr_sub, s)

    INDEX.write_text(s, encoding="utf-8")
    if missing:
        print("Warning: no config value for:", ", ".join(sorted(set(missing))))
    print("index.html updated from site-config.js")


if __name__ == "__main__":
    main()
