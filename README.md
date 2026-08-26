# Shared Counter

**Live app:** https://samuelasherivello.github.io/hermes-counter-app/

A no-login Next.js counter backed by Supabase Postgres. Increment, decrement, and reset use atomic database RPC functions; Supabase Realtime synchronizes open devices.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. The checked-in fallback uses the public Supabase URL and publishable key; `.env.local` can override them with the names in `.env.example`. Never place a service-role key in this frontend.

## Verify

```bash
npm test
npm run build
npm audit
```

Database schema: `supabase/migrations/20260825134500_create_counter.sql`.

GitHub Pages deploys automatically from `main` through `.github/workflows/deploy-pages.yml`.
