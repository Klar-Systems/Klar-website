# Klar-website

Marketing site and client-proposal host for **Klar Systems** — "The Restaurant System."

Plain static HTML/CSS (no build step) — files are served as-is.

## Structure
- `index.html` — main marketing landing page
- `proposals/` — bespoke per-client pitch pages (e.g. `kiku86`, `meri-liike`)
- `calls/` — call / booking landing page
- `public/`, `logo.png`, `favicon.png` — assets

## What this repo does *not* own

**https://booking.klarsystems.com is not served from here.** Its landing page and every
route under it (`/login`, `/terms`, `/book/<slug>`, `/admin/<slug>`, `/api/*`) come from
the `klar-console` monorepo — source `apps/booking/src/app/page.tsx`, deployed as the
Vercel project `booking-system` with Root Directory `apps/booking`. It is a Next.js app,
not static HTML, so it cannot be served from this repo. Edit the landing copy there.

## Related repos
- `klar-console` — the monorepo that owns booking.klarsystems.com (`apps/booking`), plus
  the console and ordering apps. This is the reservation product this site sells.
- `booking-system` — the standalone pre-monorepo version of that product. Legacy: last
  commit 2026-07-07, and the Vercel project of the same name was repointed to
  `klar-console` on 2026-07-17. Do not edit for live changes.
- `klar-websites-previews` — gallery of generated restaurant demo sites
