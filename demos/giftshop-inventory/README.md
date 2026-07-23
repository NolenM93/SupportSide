# Gift Shop Inventory Manager (Demo)

Portfolio demo for **Support Side** - a sample inventory system for a fictional local gift shop (**Harbor Lane Gift Shop**).

## What it demonstrates

- Staff login (demo credentials)
- Product catalog (SKU, category, price, qty, reorder level)
- Stock in / stock out / set quantity
- Low-stock alerts
- Dashboard with totals and recent activity
- Reset back to sample data

## Demo login

- **Email:** `demo@giftshop.local`
- **Password:** `demo1234`

Data is stored in the browser (`localStorage`) so you can change stock without affecting other visitors' sessions.

## Run locally

Open in a browser (from the repo root, after starting any static server):

```text
demos/giftshop-inventory/index.html
```

Or with Python:

```bash
python -m http.server 8080
```

Then visit `http://localhost:8080/demos/giftshop-inventory/`

## Live site

Linked from the Support Side homepage **Example Projects** section:

`https://nolenm93.github.io/SupportSide/demos/giftshop-inventory/`

## Note on GitHub Pages

This demo is **static HTML/JS** so it works on GitHub Pages. A future client build would typically use PHP/MySQL (or similar) with a real server database.
