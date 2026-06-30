# Deploy BagMatch to GitHub + your website

## Step 1 — Log into GitHub (one time)

Open PowerShell and run:

```powershell
$env:Path = "C:\Program Files\GitHub CLI;" + $env:Path
gh auth login
```

Choose:
- **GitHub.com**
- **HTTPS**
- **Login with a web browser** (easiest)

## Step 2 — Create repo and push

```powershell
cd C:\Users\yello\Projects\flight-booker
$env:Path = "C:\Program Files\Git\bin;C:\Program Files\Git\cmd;C:\Program Files\GitHub CLI;" + $env:Path

gh repo create flight-booker --public --source=. --remote=origin --push
```

This creates `https://github.com/YOUR_USERNAME/flight-booker` and pushes your code.

**Already have a repo?** Use:

```powershell
git remote add origin https://github.com/YOUR_USERNAME/flight-booker.git
git push -u origin main
```

## Step 3 — Deploy to a live website (Vercel, recommended)

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. **Add New Project** → import `flight-booker`
3. Add **Environment Variables** (Settings → Environment Variables):

| Variable | Value |
|----------|-------|
| `AMADEUS_CLIENT_ID` | From developers.amadeus.com |
| `AMADEUS_CLIENT_SECRET` | From developers.amadeus.com |
| `AMADEUS_HOSTNAME` | `test` or `production` |
| `STRIPE_SECRET_KEY` | From Stripe Dashboard |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | From Stripe Dashboard |
| `STRIPE_WEBHOOK_SECRET` | From Stripe webhook (see below) |

4. Deploy — Vercel gives you a URL like `https://flight-booker.vercel.app`

### Stripe webhook (production)

In Stripe Dashboard → Webhooks → Add endpoint:

```
https://YOUR-VERCEL-URL.vercel.app/api/webhooks/stripe
```

Events: `payment_intent.succeeded`, `payment_intent.payment_failed`

Copy the signing secret into Vercel as `STRIPE_WEBHOOK_SECRET`.

## Optional — Custom domain

In Vercel → Project → Settings → Domains → add your domain and follow DNS instructions.

## Git identity (optional)

If future commits ask for your name/email:

```powershell
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

Use your GitHub noreply email: `YOUR_ID+YOUR_USERNAME@users.noreply.github.com`
