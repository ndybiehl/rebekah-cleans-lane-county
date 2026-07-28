# Rebekah’s Cleaning Service

Public marketing site + owner **SEO admin** for **[rebekahcleanslanecounty.com](https://rebekahcleanslanecounty.com)**.

| | |
|---|---|
| **Business** | Rebekah's Cleaning Service |
| **Phone** | [541-726-1180](tel:+15417261180) |
| **Email** | [rebekahcleaning@gmail.com](mailto:rebekahcleaning@gmail.com) |
| **Google Maps** | https://maps.app.goo.gl/KtoGTbdjrLLAUEL88 |
| **Yelp** | https://www.yelp.com/biz/rebekah-s-cleaning-service-springfield |
| **Stack** | Node (Express) + static HTML/CSS |
| **Admin** | `/admin` — SEO health for `rebekahcleaning@gmail.com` |
| **Hosting** | DigitalOcean App Platform (Node service) |

## Local development

```bash
cd rebekah-cleans-lane-county
npm install
cp .env.example .env
# Optional: set ADMIN_PASSWORD in .env for local login
npm run dev
# Public site:  http://localhost:3000/
# SEO admin:    http://localhost:3000/admin
```

Default first-boot password (only if no hash/env password): `ChangeMe-Rebekah2026!`  
**Set a real password before sharing with Rebekah.**

```bash
npm run hash-password -- 'her-secure-password'
# put the hash in ADMIN_PASSWORD_HASH (DO app env secret)
```

## Google Analytics 4

| | |
|--|--|
| **Measurement ID** | `G-Z7SYCSYNN9` |
| **Property ID** | `547446420` |
| **Account** | rebekahcleaning@gmail.com |
| **Stream** | Web · rebekahcleanslanecounty.com |

Tag is in `public/index.html` (gtag). Quote form success fires `generate_lead`.

## Admin SEO dashboard

Like KeyMSP ops website SEO (lighter):

- Live checks: homepage, robots.txt, sitemap, CSS, **GA4 tag**
- Homepage title / description / canonical / JSON-LD / OG / GA4 ID
- Health score
- Deep links: **GA4 Realtime / Reports**, Google Business Profile, Search Console, Yelp, Gmail

Sign-in: **rebekahcleaning@gmail.com** + password from env.

Realtime verify after deploy: open [GA4 Realtime](https://analytics.google.com/analytics/web/#/p547446420/realtime/overview) while browsing the live site.

## Deploy (DigitalOcean)

1. App type: **Web Service** (Node), not static-only.
2. Build: `npm install` (default)
3. Run: `npm start`
4. HTTP port: `3000`
5. Health check: `/healthz`
6. Secrets in DO:
   - `SESSION_SECRET` — long random string  
   - `ADMIN_PASSWORD_HASH` — from `npm run hash-password`  
   - `ADMIN_EMAIL=rebekahcleaning@gmail.com`  
   - `PUBLIC_SITE_URL=https://rebekahcleanslanecounty.com`  
   - `NODE_ENV=production`

Spec: `.do/app.yaml` (update if the DO app was created as static earlier — convert to service).

## Project layout

```
public/          # Marketing site (HTML, CSS, images, map)
server/          # Express: static + /admin + SEO API
```

## Contact form

FormSubmit → `rebekahcleaning@gmail.com` (AJAX). See earlier activation notes.

## Google / local

Manage existing GBP + Yelp — see `public/docs/GOOGLE-LOCAL.md`.
