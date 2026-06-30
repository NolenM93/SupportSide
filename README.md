# Sidekick Software

Official website for **Sidekick Software** — a custom software agency building affordable tools for local businesses.

## Tech Stack

- **HTML5** — semantic, accessible markup
- **Tailwind CSS** — compiled locally to `assets/css/tailwind.css` (no CDN dependency)
- **Netlify** — free hosting with auto-deploy from `main`
- **Netlify Forms** — contact form submissions delivered to email

## Project Structure

```
SupportSide/
├── index.html          # Main landing page
├── assets/
│   ├── css/
│   │   └── custom.css  # Minimal style overrides
│   └── img/            # Static images and logo
├── .gitignore
└── README.md
```

## Local Development

Open `index.html` directly in a browser, or use any static file server:

```bash
# After editing HTML classes, rebuild CSS:
npm run build:css

# Optional: watch for changes while editing
npm run watch:css
```

## Deployment

This repo is connected to [Netlify](https://netlify.com). Every push to `main` automatically deploys the live site.

To set up Netlify for the first time:
1. Log in at [netlify.com](https://netlify.com)
2. Click **Add new site → Import an existing project**
3. Connect this GitHub repo (`NolenM93/SupportSide`)
4. Set publish directory to `/` (root)
5. Click **Deploy site**

## Contact Form

The contact form uses **Netlify Forms** (no backend required). To activate:
- Deploy to Netlify at least once — Netlify detects the `data-netlify="true"` attribute automatically
- Form submissions are delivered to the email on your Netlify account
- Free tier: up to 100 submissions/month

---

&copy; 2026 Sidekick Software
