/* Ricard Retreats: applies site-config.js to the page, builds the gallery,
   runs the mobile menu and the (optional) enquiry form. No dependencies. */
(function () {
  "use strict";

  var site = window.SITE || {};
  var pageVersion = document.documentElement.getAttribute("data-asset-version") || "";
  // Only let the config drive images if it is the same version as this HTML.
  // A stale cached config can then never put old photos back.
  var configFresh = !!site.assetVersion && site.assetVersion === pageVersion;

  function v(url) {
    if (!url || /^(https?:|data:|mailto:)/.test(url) || !site.assetVersion) return url;
    return url.replace(/[?#].*$/, "") + "?v=" + encodeURIComponent(site.assetVersion);
  }

  function get(path) {
    return path.split(".").reduce(function (acc, key) {
      return acc != null && acc[key] != null ? acc[key] : null;
    }, site);
  }

  function each(selector, fn) {
    Array.prototype.forEach.call(document.querySelectorAll(selector), fn);
  }

  /* Text, links, attributes */
  function applyBindings() {
    each("[data-bind]", function (el) {
      var v = get(el.getAttribute("data-bind"));
      if (typeof v === "string") el.textContent = v;
    });
    each("[data-bind-href]", function (el) {
      var v = get(el.getAttribute("data-bind-href"));
      if (v) el.setAttribute("href", v);
    });
    each("[data-bind-aria]", function (el) {
      var v = get(el.getAttribute("data-bind-aria"));
      if (v) el.setAttribute("aria-label", v);
    });
    if (configFresh) {
      each("[data-bind-src]", function (el) {
        var val = get(el.getAttribute("data-bind-src"));
        if (val) el.setAttribute("src", v(val));
      });
      each("[data-bind-poster]", function (el) {
        var val = get(el.getAttribute("data-bind-poster"));
        if (val) el.setAttribute("poster", v(val));
      });
      each("[data-bind-srcset]", function (el) {
        var val = get(el.getAttribute("data-bind-srcset"));
        if (val) el.setAttribute("srcset", v(val));
      });
    }
    each("[data-bind-alt]", function (el) {
      var v = get(el.getAttribute("data-bind-alt"));
      if (v != null) el.setAttribute("alt", v);
    });

    var c = site.colours || {};
    var root = document.documentElement.style;
    if (c.ivory) root.setProperty("--ivory", c.ivory);
    if (c.seaGreen) root.setProperty("--sea", c.seaGreen);
    if (c.charcoal) root.setProperty("--charcoal", c.charcoal);
    if (c.sand) root.setProperty("--sand", c.sand);
    if (c.terracotta) root.setProperty("--terracotta", c.terracotta);
    if (c.terracottaText) root.setProperty("--terracotta-text", c.terracottaText);

    var year = document.getElementById("year");
    if (year) year.textContent = String(new Date().getFullYear());
  }

  /* Title and share metadata (static copies are written by tools/sync-meta.py) */
  function setMeta(attr, key, value) {
    if (!value) return;
    var el = document.head.querySelector("meta[" + attr + '="' + key + '"]');
    if (!el) {
      el = document.createElement("meta");
      el.setAttribute(attr, key);
      document.head.appendChild(el);
    }
    el.setAttribute("content", value);
  }

  function applyMeta() {
    var m = site.meta || {};
    if (m.title) document.title = m.title;
    var base = m.siteUrl || "";
    var img = m.ogImage ? (/^https?:/.test(m.ogImage) ? m.ogImage : base + m.ogImage) : "";
    setMeta("name", "description", m.description);
    setMeta("property", "og:type", "website");
    setMeta("property", "og:site_name", site.brandName);
    setMeta("property", "og:title", m.ogTitle || m.title);
    setMeta("property", "og:description", m.ogDescription || m.description);
    setMeta("property", "og:url", base);
    setMeta("property", "og:image", img);
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", m.ogTitle || m.title);
    setMeta("name", "twitter:description", m.ogDescription || m.description);
    setMeta("name", "twitter:image", img);
    if (m.noIndex !== false) setMeta("name", "robots", "noindex, nofollow");
  }

  /* Images */
  var GALLERY_SIZES = "(min-width: 900px) 30vw, (min-width: 640px) 46vw, 92vw";
  function srcsetOf(item, smallKey, bigKey) {
    if (item[smallKey] && item.width) return v(item[smallKey]) + " 800w, " + v(item[bigKey]) + " " + item.width + "w";
    return v(item[bigKey]);
  }

  function picture(item, opts) {
    var pic = document.createElement("picture");
    var responsive = !!(item.jpg800 || item.webp800);
    if (item.webp) {
      var s = document.createElement("source");
      s.type = "image/webp";
      s.srcset = srcsetOf(item, "webp800", "webp");
      if (responsive) s.sizes = GALLERY_SIZES;
      pic.appendChild(s);
    }
    var img = document.createElement("img");
    img.src = v(item.jpg || item.src);
    if (responsive) { img.srcset = srcsetOf(item, "jpg800", "jpg"); img.sizes = GALLERY_SIZES; }
    img.alt = item.alt || "";
    if (item.width) img.width = item.width;
    if (item.height) img.height = item.height;
    if (!opts || !opts.eager) img.loading = "lazy";
    img.decoding = "async";
    pic.appendChild(img);
    return pic;
  }

  function figure(item) {
    var fig = document.createElement("figure");
    fig.className = "g-item";
    var pic = picture(item);
    if (item.position) pic.querySelector("img").style.objectPosition = item.position;
    fig.appendChild(pic);
    if (item.caption) {
      var cap = document.createElement("figcaption");
      cap.textContent = item.caption;
      fig.appendChild(cap);
    }
    return fig;
  }

  function buildGallery() {
    var list = site.images && site.images.gallery;
    var gallery = document.getElementById("gallery");
    // The static gallery in index.html is the baseline; only rebuild from a matching config.
    if (!configFresh || !list || !list.length || !gallery) return;
    gallery.innerHTML = "";
    list.forEach(function (item) { gallery.appendChild(figure(item)); });
  }

  /* Optional email: contact.email + contact.emailSubject */
  function mailtoHref() {
    var c = site.contact || {};
    var email = (c.email || "").trim();
    if (!email) return "";
    return "mailto:" + email + (c.emailSubject ? "?subject=" + encodeURIComponent(c.emailSubject) : "");
  }

  function setupEmail() {
    var href = mailtoHref();
    each("[data-email-only]", function (el) { el.hidden = !href; });
    if (href) each("[data-email-link]", function (el) { el.setAttribute("href", href); });
  }

  function optionalPhoto(id, item) {
    var slot = document.getElementById(id);
    if (!slot || !item || !(item.jpg || item.src)) return; // stays hidden: no empty boxes
    slot.appendChild(picture(item));
    if (item.caption) {
      var cap = document.createElement("figcaption");
      cap.textContent = item.caption;
      slot.appendChild(cap);
    }
    slot.hidden = false;
  }

  /* London yoga: hide the next-class line once it has finished (londonYoga.nextClass.endsAt) */
  function setupNextClass() {
    each("[data-next-class]", function (el) {
      var nc = (site.londonYoga && site.londonYoga.nextClass) || {};
      var label = typeof nc.label === "string" ? nc.label.trim() : el.textContent.trim();
      var ends = Date.parse(nc.endsAt || el.getAttribute("data-ends-at") || "");
      el.hidden = !label || (!isNaN(ends) && Date.now() >= ends);
    });
  }

  /* Personal training reviews: verified quotes only; nothing is shown while the list is empty */
  function setupTestimonials() {
    var box = document.getElementById("pt-testimonials");
    var grid = document.getElementById("review-grid");
    var pt = site.personalTraining;
    if (!box || !grid || !pt || !Array.isArray(pt.testimonials)) return; // keep the static HTML
    var list = pt.testimonials.filter(function (t) { return t && t.quote && t.name; });
    grid.innerHTML = "";
    list.forEach(function (t) {
      var fig = document.createElement("figure");
      fig.className = "review";
      var bq = document.createElement("blockquote");
      var p = document.createElement("p");
      p.textContent = t.quote;
      bq.appendChild(p);
      fig.appendChild(bq);
      var cap = document.createElement("figcaption");
      var name = document.createElement("span");
      name.className = "review-name";
      name.textContent = t.name;
      cap.appendChild(name);
      var src = document.createElement("span");
      src.className = "review-source";
      src.textContent = pt.testimonialSourceLabel || "";
      cap.appendChild(src);
      if (t.sourceUrl) {
        var a = document.createElement("a");
        a.className = "review-link";
        a.href = t.sourceUrl; a.target = "_blank"; a.rel = "noopener noreferrer";
        a.textContent = pt.testimonialLinkText || "Read on Instagram";
        var hid = document.createElement("span");
        hid.className = "visually-hidden";
        hid.textContent = " (opens in a new tab)";
        a.appendChild(hid);
        cap.appendChild(a);
      }
      fig.appendChild(cap);
      grid.appendChild(fig);
    });
    box.hidden = list.length === 0;
  }

  /* Villa tour video: muted, controls always shown; plays only while in view, never with reduced motion */
  function setupVideo() {
    var vid = document.getElementById("villa-video");
    if (!vid) return;
    vid.muted = true;
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) return;
    var userPaused = false, auto = false;
    vid.addEventListener("pause", function () { if (!auto) userPaused = true; auto = false; });
    vid.addEventListener("play", function () { userPaused = false; });
    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && e.intersectionRatio >= 0.5) {
          if (!userPaused && vid.paused) { var p = vid.play(); if (p && p.catch) p.catch(function () {}); }
        } else if (!vid.paused) {
          auto = true; vid.pause();
        }
      });
    }, { threshold: [0, 0.5] }).observe(vid);
  }

  /* Navigation: mobile menu toggle + "Retreats" submenu (click/tap, not hover) */
  function setupNav() {
    var toggle = document.getElementById("nav-toggle");
    var nav = document.getElementById("site-nav");
    var subBtn = document.getElementById("retreats-toggle");
    var sub = document.getElementById("retreats-menu");
    if (!toggle || !nav) return;
    var desktop = window.matchMedia("(min-width: 900px)");

    function setSub(open) {
      if (!subBtn || !sub) return;
      subBtn.setAttribute("aria-expanded", String(open));
      sub.hidden = !open;
    }
    function subOpen() { return !!sub && !sub.hidden; }
    function menuOpen() { return nav.classList.contains("is-open"); }
    function closeMenu() {
      toggle.setAttribute("aria-expanded", "false");
      nav.classList.remove("is-open");
      setSub(false);
    }

    toggle.addEventListener("click", function () {
      var open = !menuOpen();
      toggle.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("is-open", open);
      if (!open) setSub(false);
      else nav.scrollTop = 0;
    });
    if (subBtn) subBtn.addEventListener("click", function () { setSub(!subOpen()); });

    // Choosing any link closes the submenu and the mobile menu
    each("#site-nav a", function (a) { a.addEventListener("click", closeMenu); });

    // Desktop: clicking outside the dropdown closes it
    document.addEventListener("click", function (e) {
      if (subOpen() && desktop.matches && !e.target.closest(".nav-has-sub")) setSub(false);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      if (desktop.matches) {
        if (subOpen()) { setSub(false); subBtn.focus(); }
      } else if (menuOpen()) {
        closeMenu(); toggle.focus();
      }
    });

    // Switching between layouts starts from a clean, closed state
    var wasDesktop = desktop.matches;
    var onChange = function () { if (desktop.matches !== wasDesktop) { wasDesktop = desktop.matches; closeMenu(); } };
    if (desktop.addEventListener) desktop.addEventListener("change", onChange);
    else if (desktop.addListener) desktop.addListener(onChange);
  }

  /* Enquiry form: only shown once contact.formEndpoint is set */
  function setupForm() {
    var form = document.getElementById("interest-form");
    var status = document.getElementById("form-status");
    var submit = document.getElementById("form-submit");
    var endpoint = ((site.contact && site.contact.formEndpoint) || "").trim();
    if (!form) return;
    if (!endpoint) { form.hidden = true; return; }
    form.hidden = false;

    function show(type, msg) {
      status.className = "form-status " + type;
      status.textContent = msg;
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      show("", "");
      if (!form.reportValidity()) return;
      submit.disabled = true;
      fetch(endpoint, {
        method: (site.contact && site.contact.formMethod) || "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      })
        .then(function (res) {
          if (!res.ok) throw new Error("HTTP " + res.status);
          show("success", "Thank you, your message is on its way to Ricard.");
          form.reset();
        })
        .catch(function () {
          show("error", "Sorry, your message couldn't be sent just now. Please try again, or message Ricard on Instagram.");
        })
        .then(function () { submit.disabled = false; });
    });
  }

  applyBindings();
  applyMeta();
  buildGallery();
  if (configFresh) {
    optionalPhoto("host-photo", site.images && site.images.host);
    optionalPhoto("chef-photo", site.images && site.images.chef);
  }
  setupEmail();
  setupNextClass();
  setupVideo();
  setupTestimonials();
  setupNav();
  setupForm();
})();
