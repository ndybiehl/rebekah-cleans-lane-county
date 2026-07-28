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

## Contact form (FormSubmit → Gmail)

The quote form uses **AJAX** to:

```
https://formsubmit.co/ajax/rebekahcleaning@gmail.com
```

Submissions are emailed to **rebekahcleaning@gmail.com** (subject: `Website quote request — Rebekahcleanslanecounty.com`). Reply-To is set to the visitor’s email.

### One-time activation (required)

FormSubmit will **not** forward real leads until the inbox owner activates:

1. Open **rebekahcleaning@gmail.com** (check Spam/Promotions too).
2. Find the email from **FormSubmit** titled something like “Activate Form”.
3. Click **Activate Form**.
4. Submit a test quote on the live site — it should appear in Gmail within a minute.

Until activation, the site shows a clear on-page message instead of a silent failure.

### Test from the browser

```bash
python3 -m http.server 8080
# open http://localhost:8080/#contact → fill form → Send
```

Alternatives later: n8n webhook → email, or Formspree.

## Google / local search (Lane County)

**Existing listings (do not recreate):**

| | |
|--|--|
| Google Maps / Business | https://maps.app.goo.gl/KtoGTbdjrLLAUEL88 |
| Yelp (Springfield) | https://www.yelp.com/biz/rebekah-s-cleaning-service-springfield |

Name: **Rebekah's Cleaning Service** · Phone: **(541) 726-1180** · Website already on Google.

→ Manage + Search Console steps: **[docs/GOOGLE-LOCAL.md](docs/GOOGLE-LOCAL.md)**

Paste a Search Console verification meta/file here if you want it added to the site.

## Edit content

| What | Where |
|------|--------|
| Phone / email / copy | `index.html` |
| Colors / layout | `css/styles.css` |
| Images | `images/` |
| SEO sitemap | `sitemap.xml` |
| Google setup guide | `docs/GOOGLE-LOCAL.md` |

## Brand notes

- **Tagline:** Built on Trust, Kept Spotless  
- **Colors:** Burgundy `#6b1d2a`, navy `#1e3a5f`, hibiscus red `#c41e3a`  
- **Emblem:** Red hibiscus flowers (from original Canva site)
