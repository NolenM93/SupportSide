# Support Side

Personal site for **Nolen Millington** and **Support Side Tech**: a short description of the practice, a resume, selected work, and a contact form.

## Local

```bash
npm install
npm run build:css
```

Open `index.html`, or serve the folder with any static server. Rebuild CSS after changing Tailwind classes (`npm run watch:css` while editing).

## Deploy

Pushes to `main` run `.github/workflows/deploy.yml`: build CSS, inject the Formspree form ID, deploy to GitHub Pages.

Live: **https://supportsidetech.com** (also **https://nolenm93.github.io/SupportSide/**)

Contact form uses Formspree. Set `FORMSPREE_FORM_ID` in the repo Actions secrets.
