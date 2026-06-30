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

## 2. Create KV namespace (pending bookings)

```powershell
npx wrangler kv namespace create BOOKINGS_KV
npx wrangler kv namespace create BOOKINGS_KV --preview
```

Copy the IDs into `wrangler.jsonc` under `kv_namespaces`.

## 3. Create D1 database (user accounts & tickets)

```powershell
npx wrangler d1 create bagmatch-db
```

Copy the `database_id` into `wrangler.jsonc` under `d1_databases`, then run migrations:

```powershell
npm run d1:migrate
```

For local preview: `npm run d1:migrate:local`

## 4. Set secrets

Runtime secrets (Wrangler dashboard or CLI):

```powershell
npx wrangler secret put AMADEUS_CLIENT_ID
npx wrangler secret put AMADEUS_CLIENT_SECRET
npx wrangler secret put AMADEUS_HOSTNAME
npx wrangler secret put STRIPE_SECRET_KEY
npx wrangler secret put STRIPE_WEBHOOK_SECRET
```

**Build-time variable** (Cloudflare dashboard → Settings → Environment variables):

- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — required at build for checkout UI

For local preview, copy `.dev.vars.example` to `.dev.vars` and fill in all values.

## 5. Deploy

### Option A — Cloudflare Git integration (recommended)

| Step | Command |
|------|---------|
| Build | `npm run build` |
| Deploy | `npx wrangler deploy` |

### Option B — Manual from your machine

```powershell
npm run deploy
```

## 6. Connect your custom domain

Cloudflare dashboard → **Workers & Pages** → **bagmatch** → **Settings** → **Domains & Routes** → **Add Custom Domain**

## 7. Stripe webhook (production)

Add endpoint: `https://your-domain.com/api/webhooks/stripe`

Events: `payment_intent.succeeded`, `payment_intent.payment_failed`

## Local Workers preview

```powershell
npm run preview
```

Uses KV preview namespace and local D1 from `wrangler.jsonc`.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `Could not find compiled Open Next config` | Build must run `npm run build` (OpenNext bundle), not `next build` alone |
| `BOOKINGS_KV binding is not configured` | Create KV namespace and update `wrangler.jsonc` |
| `DB binding is not configured` | Create D1 database, update `wrangler.jsonc`, run `npm run d1:migrate` |
| Auth fails on Workers | Ensure D1 is provisioned and schema migrated |
| Stripe fails on Workers | Set secrets; use fetch client (already configured) |
| Amadeus fails | Set `AMADEUS_*` secrets; uses fetch API (Workers-compatible) |
