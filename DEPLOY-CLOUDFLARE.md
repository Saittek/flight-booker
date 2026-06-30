# Deploy BagMatch to Cloudflare

BagMatch runs on **Cloudflare Workers** via [@opennextjs/cloudflare](https://opennext.js.org/cloudflare).

## Prerequisites

- A [Cloudflare account](https://dash.cloudflare.com/sign-up)
- Node.js 18+
- Amadeus and Stripe keys (see `.env.example`)

## 1. Log into Cloudflare

```powershell
cd C:\Users\yello\Projects\flight-booker
npx wrangler login
```

This opens a browser window to authorize Wrangler.

## 2. Create a KV namespace for pending bookings

Stripe webhooks store booking state in **Cloudflare KV** (Workers cannot write to the local filesystem).

```powershell
npx wrangler kv namespace create BOOKINGS_KV
npx wrangler kv namespace create BOOKINGS_KV --preview
```

Copy the returned IDs into `wrangler.jsonc`:

```jsonc
"kv_namespaces": [
  {
    "binding": "BOOKINGS_KV",
    "id": "<production id>",
    "preview_id": "<preview id>"
  }
]
```

## 3. Set production secrets

Add your API keys as Worker secrets (not committed to git):

```powershell
npx wrangler secret put AMADEUS_CLIENT_ID
npx wrangler secret put AMADEUS_CLIENT_SECRET
npx wrangler secret put AMADEUS_HOSTNAME
npx wrangler secret put STRIPE_SECRET_KEY
npx wrangler secret put NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
npx wrangler secret put STRIPE_WEBHOOK_SECRET
```

For local preview with bindings, copy `.env.local` values into `.dev.vars` (same keys as `.env.example`).

## 4. Deploy

```powershell
npm run deploy
```

Wrangler prints your Workers URL, e.g. `https://bagmatch.<your-subdomain>.workers.dev`.

## 5. Connect your custom domain

In the [Cloudflare dashboard](https://dash.cloudflare.com):

1. **Workers & Pages** → select **bagmatch**
2. **Settings** → **Domains & Routes** → **Add Custom Domain**
3. Enter your domain (e.g. `bagmatch.example.com` or your root domain)

If the domain is already on Cloudflare, DNS is configured automatically.

## 6. Stripe webhook (production)

In [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks), add:

```
https://your-domain.com/api/webhooks/stripe
```

Events:

- `payment_intent.succeeded`
- `payment_intent.payment_failed`

Use the signing secret as `STRIPE_WEBHOOK_SECRET`.

## 7. Preview locally (Workers runtime)

```powershell
npm run preview
```

Uses the KV preview namespace from `wrangler.jsonc`.

## GitHub continuous deployment (optional)

1. Push the repo to GitHub
2. In Cloudflare: **Workers & Pages** → **Create** → **Connect to Git**
3. Select the repo, set build command to `npm run deploy`, or use Cloudflare's OpenNext template settings
4. Add environment variables / secrets in the dashboard

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `You are not authenticated` | Run `npx wrangler login` |
| Booking not found after payment | Ensure KV namespace IDs are set in `wrangler.jsonc` |
| Stripe webhook 400 | Check `STRIPE_WEBHOOK_SECRET` matches the dashboard endpoint |
| Amadeus 401 | Verify secrets with `npx wrangler secret list` |
