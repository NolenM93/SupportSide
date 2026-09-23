# Support Side

Clients describe their business. We generate a one-page site they can edit. We host it.

```bash
cd studio
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign in with any email (local mode). Create a site, edit, preview, publish to `/s/your-slug`.

## Env (`studio/.env.local`)

```
OPENAI_API_KEY=
STRIPE_SECRET_KEY=
STRIPE_PRICE_ID=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_PLAN_PRICE=$29/month
```

Without Stripe keys, publishing still works (so you can demo). Without OpenAI, the template still fills from the prompt.

Do not put secrets in `NEXT_PUBLIC_` variables. Do not commit `.env.local`.
