# Support Side Tech

Official website for **Support Side Tech** — a custom software agency building affordable tools for local businesses.

## Tech Stack

- **HTML5** — semantic, accessible markup
- **Tailwind CSS** — compiled to `assets/css/tailwind.css` at build time
- **GitHub Pages** — static hosting with auto-deploy from `main`
- **Formspree** — contact form submissions delivered to email

## Project Structure

```
SupportSide/
├── index.html              # Main landing page
├── assets/
│   └── css/
│       ├── input.css       # Tailwind source
│       ├── custom.css      # Minimal style overrides
│       └── tailwind.css    # Generated (not committed)
├── .github/workflows/
│   └── deploy.yml          # Build CSS + deploy to GitHub Pages
├── package.json
└── tailwind.config.js
```

## Local Development

Install dependencies once, then rebuild CSS after changing Tailwind classes:

```bash
npm install
npm run build:css

# Optional: watch for changes while editing
npm run watch:css
```

Open `index.html` in a browser or use any static file server. The contact form only works in production after Formspree is configured (see below).

## Deployment (GitHub Pages)

Every push to `main` runs `.github/workflows/deploy.yml`, which:

1. Installs npm dependencies
2. Runs `npm run build:css`
3. Injects the live site URL and Formspree form ID into `index.html`
4. Deploys the site to GitHub Pages

### One-time setup

1. Open **Settings → Pages** on [github.com/NolenM93/SupportSide](https://github.com/NolenM93/SupportSide)
2. Under **Build and deployment**, set **Source** to **GitHub Actions**
3. Create a free form at [formspree.io](https://formspree.io) and copy your form ID (the part after `/f/` in the form URL)
4. Open **Settings → Secrets and variables → Actions** and add:
   - Name: `FORMSPREE_FORM_ID`
   - Value: your Formspree form ID
5. Push to `main` (or re-run the workflow from the **Actions** tab)

Live URL: **https://nolenm93.github.io/SupportSide/**

## Contact Form

The contact form posts to **Formspree** (no backend required). Submissions are emailed to the address on your Formspree account. Free tier: 50 submissions/month.

---

&copy; 2026 Support Side Tech
