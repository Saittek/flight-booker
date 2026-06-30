# BagMatch

Baggage-aware flight search with **live Amadeus flight data**, real pricing (base + taxes + fees), airline baggage allowances, **Stripe card payments**, and checkout/booking.

## Setup

### 1. Amadeus (flights)

1. Register at [developers.amadeus.com](https://developers.amadeus.com/register)
2. Create an app and copy API Key & Secret

### 2. Stripe (payments)

1. Create account at [stripe.com](https://stripe.com)
2. Copy **Publishable key** and **Secret key** from [Dashboard → API keys](https://dashboard.stripe.com/test/apikeys) (use test mode first)
3. Use test card `4242 4242 4242 4242`, any future expiry, any CVC

### 3. Environment

Copy `.env.example` to `.env.local`:

```bash
AMADEUS_CLIENT_ID=your_api_key
AMADEUS_CLIENT_SECRET=your_api_secret
AMADEUS_HOSTNAME=test

STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 4. Stripe webhooks (recommended for production)

Webhooks verify payments server-side before booking — the client never triggers the booking directly.

**Local development** (requires [Stripe CLI](https://stripe.com/docs/stripe-cli)):

```bash
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the `whsec_...` signing secret into `.env.local` as `STRIPE_WEBHOOK_SECRET`, then restart the dev server.

**Production:** In [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks), add endpoint:

```
https://your-domain.com/api/webhooks/stripe
```

Events to listen for:
- `payment_intent.succeeded`
- `payment_intent.payment_failed`

### 5. Run

```bash
npm install
npm run dev
```

Without API keys, the app falls back to **demo data** so you can still test the UI.

## Features

- **Live flight search** — Amadeus Flight Offers Search (400+ airlines)
- **Rich baggage parsing** — fare family, branded fare, included checked/cabin bags, amenities, per-segment breakdown, chargeable bag catalog (`include=bags` on pricing)
- **Real pricing** — base fare, taxes, and fees broken out
- **Stripe webhooks** — server-side payment verification; booking only after signed `payment_intent.succeeded`
- **Booking** — Amadeus Flight Create Orders triggered by webhook (or direct fallback without webhook secret)

## Checkout flow (with webhooks)

1. Select flight → price confirmed with airline
2. Enter passenger details → server stores a **pending booking**
3. Pay with card → Stripe PaymentIntent linked to pending booking
4. **Stripe webhook** receives `payment_intent.succeeded` → verifies amount → books via Amadeus
5. Client polls booking status → confirmation page with receipt

## Test notes

- Amadeus **test** = sandbox flights/bookings (not real tickets)
- Stripe **test** = no real charges; use test cards
- For production: Amadeus production keys + Stripe live keys + webhook for payment confirmation

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Production server |
