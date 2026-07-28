# GA4 Data API for `/admin` traffic charts

The admin dashboard can pull **users, sessions, page views, generate_lead**, top pages, and a 28‑day chart via the **Google Analytics Data API**.

## Already done

| Item | Value |
|------|--------|
| Measurement ID | `G-Z7SYCSYNN9` |
| Property ID | `547446420` |
| Account (owner) | `rebekahcleaning@gmail.com` |
| Site tag | gtag in `public/index.html` |
| Server module | `server/ga4.js` |

## One-time: service account (needs a GCP project)

Google Cloud **project creation** for new free accounts often requires accepting a free trial / billing profile. That’s intentional — do it once as Rebekah (or under Randy’s GCP and only grant this SA access to *her* GA4 property).

### A. Create project + service account

1. Open https://console.cloud.google.com/ as **rebekahcleaning@gmail.com** (or Randy).
2. Complete free trial if prompted (card required by Google; you can stay on free tier).
3. Create project: e.g. `rebekah-cleaning-ga4`.
4. Enable API:  
   https://console.cloud.google.com/apis/library/analyticsdata.googleapis.com  
   → **Enable** Google Analytics Data API.
5. **IAM → Service accounts → Create**:
   - Name: `rebekah-ga4-reader`
   - Role: none required on the project (access is via GA4).
6. **Keys → Add key → JSON** → download once.
7. Copy the `client_email` (looks like `rebekah-ga4-reader@….iam.gserviceaccount.com`).

### B. Grant the SA access on the GA4 property

1. https://analytics.google.com/ → Admin (gear)
2. Property **Rebekah's Cleaning Service - Website** → **Property access management**
3. **+** → add the service account **email**
4. Role: **Viewer** (enough for reports)

### C. Put the key on the server (DigitalOcean)

**Preferred (secret env):**

```bash
# minify JSON to one line and paste into DO App Platform secret:
GA4_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"...", ... }'
```

Also set (already defaulted in code if omitted):

```
GA4_MEASUREMENT_ID=G-Z7SYCSYNN9
GA4_PROPERTY_ID=547446420
GA4_ACCOUNT_ID=402544998
```

**Local:**

```bash
mkdir -p secrets
# place key as secrets/ga4-service-account.json  (gitignored)
npm run dev
```

Never commit the JSON key.

### D. Verify

1. Deploy / restart app.
2. Sign in to `/admin`.
3. You should see **Data API live**, totals, chart, top pages, events.
4. If you see a permission error, double-check step B (Viewer on property).

## API usage notes

- Free GA4 Data API quotas are fine for an owner dashboard (refresh on page load).
- New properties show empty charts for ~24–48h; Realtime works sooner.
- `generate_lead` only appears after successful quote form posts with the gtag event.

## If free trial is blocked

Use **Randy’s existing GCP project** (KeyMSP/personal):

1. Create SA there + enable Analytics Data API  
2. Add that SA as Viewer on **Rebekah’s** GA4 property only  
3. Put that JSON on the Rebekah DO app  

Do **not** put KeyMSP production keys on this site.
