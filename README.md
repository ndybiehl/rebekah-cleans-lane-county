# Rebekah’s Cleaning Service

Static marketing site for **[rebekahcleanslanecounty.com](https://rebekahcleanslanecounty.com)** — commercial & residential cleaning in Lane County, Oregon.

| | |
|---|---|
| **Business** | Rebekah’s Cleaning Service |
| **Phone** | [541-726-1180](tel:+15417261180) |
| **Email** | [rebekahcleaning@gmail.com](mailto:rebekahcleaning@gmail.com) |
| **Stack** | Static HTML / CSS (no build step) |
| **Hosting** | DigitalOcean App Platform (static site) or any static host |

## What’s included

- Single-page site: hero, services, about, gallery, service area, contact
- Brand assets from the previous Canva site (hibiscus logo mark, photos)
- Strong local SEO: meta tags, Open Graph, `LocalBusiness` JSON-LD, sitemap, robots
- Mobile-first, fast (system fonts, WebP images, no frameworks)
- Contact form via [FormSubmit](https://formsubmit.co) → `rebekahcleaning@gmail.com` (plus phone / mailto)

## Local preview

```bash
cd rebekah-cleans-lane-county
python3 -m http.server 8080
# open http://localhost:8080
```

## Deploy to DigitalOcean App Platform

1. Push this repo to GitHub (already intended as `ndybiehl/rebekah-cleans-lane-county`).
2. In DO: **Apps → Create App → GitHub** → select the repo → **Static Site**.
3. Settings:
   - **Source directory:** `/`
   - **Output directory:** leave blank (or `/`)
   - **Index document:** `index.html`
4. Or use the spec: `.do/app.yaml` (update the `github.repo` field if the repo name differs).
5. After deploy, point **rebekahcleanslanecounty.com** DNS at the DO app (CNAME to the `*.ondigitalocean.app` hostname, or use DO’s domain UI).

### DNS tip

If the domain currently points at Canva via Cloudflare (or similar), switch the apex/www records to DigitalOcean once the app is live. Keep HTTPS on DO or Cloudflare.

## Contact form (FormSubmit)

The form posts to:

```
https://formsubmit.co/rebekahcleaning@gmail.com
```

**First use:** FormSubmit emails Rebekah once to confirm the address — she must click the confirmation link. After that, quote requests land in Gmail.

Alternatives if you want something else later:

- n8n webhook → email
- `mailto:` only (already linked on the page)

## Edit content

| What | Where |
|------|--------|
| Phone / email / copy | `index.html` |
| Colors / layout | `css/styles.css` |
| Images | `images/` |
| SEO sitemap | `sitemap.xml` |

## Brand notes

- **Tagline:** Built on Trust, Kept Spotless  
- **Colors:** Burgundy `#6b1d2a`, navy `#1e3a5f`, hibiscus red `#c41e3a`  
- **Emblem:** Red hibiscus flowers (from original Canva site)
