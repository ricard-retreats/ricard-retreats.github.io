// Ricard Retreats: the one file to edit for names, dates, prices, links, images and colours.
// Format note: everything between "window.SITE =" and the final ";" must stay valid JSON
// (double quotes, no trailing commas). Whole-line comments starting with // are fine.
// After editing, run:  python3 tools/sync-meta.py --bump  so the static HTML (seen by link previews,
// crawlers and visitors without JavaScript) matches this file. In the browser, js/main.js also
// applies these values on page load.
window.SITE = {
  // Cache-busting version. Bump with:  python3 tools/sync-meta.py --bump
  "assetVersion": "202610200858",
  "brandName": "Ricard Retreats",
  "hostName": "Ricard Chillon",
  "hostTitle": "Personal trainer and yoga teacher",
  "hostCredentials": "Level 3 personal trainer · 200-hour YMCA yoga teacher training",
  "hostStatement": "Movement, reflection and connection, brought together.",
  "hostBio": "Ricard brings movement, reflection and connection together. He is sincere, empathetic and positive: a thoughtful, proactive host and a natural community builder, who likes people to feel at ease and part of things from the start.",
  "hostBio2": "His classes welcome you wherever you are with your practice, and you are welcome to message him with any questions before you decide.",

  "monogram": {
    "top": "RICARD",
    "bottom": "RETREATS",
    "ariaLabel": "Ricard Retreats RR monogram"
  },
  "playfulLine": "Truly the RR of retreats.",
  "tagline": "A little more space to breathe.",
  "eyebrow": "Lanzarote · 5–10 November 2026",
  "heroLede": "Five nights of yoga, shared meals and sea air at a villa in northern Lanzarote, hosted by Ricard Chillon.",
  "welcome": "A few days to step away from the everyday: to move, to rest, to eat well and to share the table with good company. Come as you are, and take what you need from each day.",

  "meta": {
    "title": "Ricard Retreats · Yoga retreat in Lanzarote, 5–10 November 2026",
    "description": "Five nights of yoga, shared meals and sea air in northern Lanzarote, 5–10 November 2026, hosted by Ricard Chillon. £1,350 per person, flights not included.",
    "ogTitle": "Ricard Retreats · A little more space to breathe",
    "ogDescription": "A five-night yoga retreat in northern Lanzarote, 5–10 November 2026, hosted by Ricard Chillon.",
    "siteUrl": "https://ricard-retreats.github.io/",
    "ogImage": "assets/images/og-cover.jpg",
    "noIndex": true
  },

  "colours": {
    "ivory": "#f6f2e9",
    "seaGreen": "#345a48",
    "charcoal": "#273d35",
    "sand": "#e8e2d5",
    "terracotta": "#956451",
    "terracottaText": "#835846"
  },

  "retreat": {
    "place": "Lanzarote",
    "datesLabel": "5–10 November 2026",
    "nights": "Five nights",
    "priceLabel": "£1,350 per person",
    "flightsNote": "Flights not included",
    "arrivalNote": "Villa access from 16:00 on Thursday 5 November.",
    "locationNote": "A villa in northern Lanzarote, close to the sea and natural pools.",
    "roomsNote": "For directions and room sharing details, just ask Ricard.",
    "availabilityPaymentNote": "Ask Ricard about current availability and payment arrangements.",
    "freeTimeNote": "Free time to rest or explore at your own pace."
  },

  "contact": {
    "heading": "Ask Ricard about joining",
    "intro": "Thinking of joining us? Message Ricard to ask about availability, rooms or anything you'd like to know.",
    "ctaLabel": "Message Ricard on Instagram",
    "instagramUrl": "https://www.instagram.com/ricardchillonpt/",
    "instagramHandle": "@ricardchillonpt",
    // Email shown as an "Email Ricard" button with the address written out. Leave "" to hide it.
    "email": "ricardchillon@gmail.com",
    "emailSubject": "Lanzarote retreat enquiry",
    "emailLabel": "Email Ricard",
    // Leave formEndpoint empty until a real form service (e.g. a Formspree URL) is set up.
    // While it is empty, the enquiry form stays hidden and only the Instagram button shows.
    "formEndpoint": "",
    "formMethod": "POST"
  },

  "chef": {
    "instagramUrl": "https://www.instagram.com/maurosiepechef/",
    "instagramHandle": "@maurosiepechef"
  },

  // "Next retreat" section near the end of the page. No dates or prices on purpose.
  "futureTeaser": {
    "eyebrow": "Next retreat",
    "heading": "The Crete Adventure\u00a0·\u00a02027",
    "lead": "A little Greek sunshine. A deeper breath. A new adventure.",
    "body": "Leave the new-year rush behind and look towards Crete, with mindful movement and room to exhale. Follow Ricard on Instagram for a first glimpse in early 2027.",
    "linkText": "Follow the Crete adventure",
    "linkUrl": "https://www.instagram.com/ricardchillonpt/"
  },

  "footer": {
    "line": "Hosted by Ricard Chillon · Lanzarote",
    "previewLabel": "Website preview"
  },

  "images": {
    "hero": {
      "webp": "assets/images/hero-room-sea.webp",
      "jpg": "assets/images/hero-room-sea.jpg",
      "width": 464,
      "height": 620,
      "alt": "A bright room at the villa, with two chairs by sheer curtains and glass doors opening onto a view of the sea",
      "caption": "Sea view from one of the villa's rooms"
    },
    // Villa gallery: shown as an aligned 2x2 grid (one column on mobile), every image cropped to 4:3.
    // "position" is the optional CSS object-position focal point, e.g. "50% 40%".
    "gallery": [
      {
        "webp": "assets/images/villa-studio-sea.webp",
        "jpg": "assets/images/villa-studio-sea.jpg",
        "width": 464, "height": 348,
        "alt": "The yoga studio: a mat on a pale wooden floor in front of wide glass doors, with the sea beyond",
        "caption": "The yoga studio, looking out to the sea",
        "position": "50% 50%"
      },
      {
        "webp": "assets/images/villa-living-sea.webp",
        "jpg": "assets/images/villa-living-sea.jpg",
        "width": 464, "height": 348,
        "alt": "Dining area with a long table and chairs in front of glass doors that open towards the sea",
        "caption": "Dining and living space, with the sea beyond",
        "position": "50% 50%"
      },
      {
        "webp": "assets/images/villa-lounge.webp",
        "jpg": "assets/images/villa-lounge.jpg",
        "width": 464, "height": 348,
        "alt": "The communal lounge, with deep sofas and striped cushions beneath hanging plants",
        "caption": "The communal lounge",
        "position": "50% 50%"
      },
      {
        "webp": "assets/images/villa-bedroom.webp",
        "jpg": "assets/images/villa-bedroom.jpg",
        "width": 576, "height": 432,
        "alt": "A bedroom with white linen, a bedside lamp, a wooden headboard and a built-in wardrobe",
        "caption": "One of the bedrooms",
        "position": "50% 50%"
      }
    ],
    // Optional: add a real, approved photo later, e.g. {"jpg": "assets/images/ricard.jpg", "alt": "Ricard Chillon"}.
    // Leave as null and the section stays text-led (no empty photo box is shown).
    "host": null,
    "chef": null
  }
};
