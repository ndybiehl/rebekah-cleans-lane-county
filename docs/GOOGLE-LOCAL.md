# Get Rebekah’s site in Google (Lane County local)

Two free Google products do most of the work. **Google Business Profile** drives Maps / local pack. **Search Console** gets the website indexed in organic search.

You need a Google account (hers is fine: `rebekahcleaning@gmail.com`, or yours as manager).

---

## 1. Google Business Profile (do this first — biggest local impact)

Maps, “cleaning service near me,” and the 3-pack come from a Business Profile, not from the website alone.

1. Open **https://business.google.com/** (or **https://www.google.com/business/**) signed in as Rebekah (or you, then invite her).
2. **Add business** → name: **Rebekah's Cleaning Service** (match the site exactly).
3. Category: primary **House cleaning service** (add secondary: **Commercial cleaning service**, **Window cleaning service**, **Janitorial service** if offered).
4. **Service-area business:** if she has no public storefront, choose that she **delivers services to customers** / service area only — do **not** invent a fake street address for customers to visit.
5. Service areas: **Lane County, OR** + cities: Eugene, Springfield, Cottage Grove, Junction City, Florence, Creswell (and others she covers).
6. Phone: **541-726-1180** (same as site).
7. Website: **https://rebekahcleanslanecounty.com/**
8. Hours, description (use site copy / tagline *Built on Trust, Kept Spotless*), services list.
9. Photos: logo, hibiscus mark, kitchen/window images from the site, plus any real job photos she has.
10. **Verify** (postcard, phone, email, or video — Google chooses). Finish verification; until verified she won’t rank in the local pack.

**Manager access:** Profile → Users → add `r@ndybiehl.com` as Manager if you help run it.

After verify: ask happy clients for **Google reviews** — that moves Lane County ranking more than anything technical on the site.

---

## 2. Google Search Console (index the website)

1. Open **https://search.google.com/search-console**
2. **Add property**
   - Prefer **Domain** property: `rebekahcleanslanecounty.com` (covers http/https/www) — needs a **DNS TXT** record, **or**
   - **URL prefix**: `https://rebekahcleanslanecounty.com/` — easier with HTML file or meta tag.
3. **Verify** (pick one):

| Method | What to do |
|--------|------------|
| **HTML file** | Google gives `googleXXXX.html` → put it in the site root → commit/push → DO deploys → click Verify |
| **HTML meta tag** | Google gives `<meta name="google-site-verification" content="…">` → paste into `index.html` `<head>` → push → Verify |
| **DNS TXT** | Add the TXT at the domain DNS host (currently NS: `systemdns.com`) → Verify |

4. After verified:
   - **Sitemaps** → submit: `https://rebekahcleanslanecounty.com/sitemap.xml`
   - **URL inspection** → `https://rebekahcleanslanecounty.com/` → **Request indexing**
5. Optional: set preferred domain (we use apex `https://rebekahcleanslanecounty.com/`, no `www`).

### Hand the verification string to Grok

If you get a meta tag or HTML filename from Search Console, paste it in chat — it can be added and pushed to GitHub/DO in under a minute.

---

## 3. Already on the website (no action)

- Live HTTPS site on DO  
- `robots.txt` → allows crawl, points at sitemap  
- `sitemap.xml`  
- Canonical URL, Open Graph  
- Structured data: `LocalBusiness` + `HouseCleaner`, phone, email, Lane County cities, services  
- Fast static HTML  

These help Google understand the business once GSC + GBP are connected. They do **not** replace a Business Profile for Maps.

---

## 4. After both are set (checklist)

- [ ] GBP verified  
- [ ] GSC verified + sitemap submitted + homepage “Request indexing”  
- [ ] NAP consistent: **name / 541-726-1180 / website** match on GBP and site  
- [ ] First 3–5 real Google reviews  
- [ ] Optional: Bing Places (https://www.bingplaces.com) — free, secondary  
- [ ] Optional: Apple Business Connect if she wants Maps on iPhone  

**Timeline:** indexing often days–weeks; local pack needs a **verified** profile + reviews and builds over months.

---

## Quick links

| Tool | URL |
|------|-----|
| Business Profile | https://business.google.com/ |
| Search Console | https://search.google.com/search-console |
| Sitemap | https://rebekahcleanslanecounty.com/sitemap.xml |
| Live site | https://rebekahcleanslanecounty.com/ |
