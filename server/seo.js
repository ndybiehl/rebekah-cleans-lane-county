/**
 * Public SEO health checks for rebekahcleanslanecounty.com
 * (lightweight cousin of keymsp-ops website-seo public health)
 */

const SITE =
  process.env.PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://rebekahcleanslanecounty.com";

/** GA4 — created under rebekahcleaning@gmail.com (2026-07-28) */
const GA4_MEASUREMENT_ID =
  process.env.GA4_MEASUREMENT_ID?.trim() || "G-Z7SYCSYNN9";
const GA4_PROPERTY_ID = process.env.GA4_PROPERTY_ID?.trim() || "547446420";
const GA4_ACCOUNT_ID = process.env.GA4_ACCOUNT_ID?.trim() || "402544998";
const GA4_STREAM_ID = process.env.GA4_STREAM_ID?.trim() || "15341565315";

const KEY_PATHS = ["/", "/robots.txt", "/sitemap.xml", "/css/styles.css"];

const { fetchGa4Traffic, ga4Configured } = require("./ga4");

async function fetchText(url, opts = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), opts.timeoutMs || 12000);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      redirect: "follow",
      headers: {
        "User-Agent": "RebekahCleaning-SEO-Admin/1.0",
        Accept: opts.accept || "*/*",
      },
    });
    const text = await res.text();
    return { ok: res.ok, status: res.status, text, url: res.url };
  } catch (e) {
    return {
      ok: false,
      status: null,
      text: "",
      url,
      error: e instanceof Error ? e.message : String(e),
    };
  } finally {
    clearTimeout(t);
  }
}

function decodeEntities(s) {
  if (!s) return s;
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

function extractMeta(html) {
  const title = decodeEntities(
    html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim() || null,
  );
  const description = decodeEntities(
    html
      .match(
        /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i,
      )?.[1]
      ?.trim() ||
      html
        .match(
          /<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i,
        )?.[1]
        ?.trim() ||
      null,
  );
  const canonical =
    html.match(
      /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)["']/i,
    )?.[1] ||
    html.match(
      /<link[^>]+href=["']([^"']*)["'][^>]+rel=["']canonical["']/i,
    )?.[1] ||
    null;
  const hasJsonLd = /application\/ld\+json/i.test(html);
  const hasOg = /property=["']og:title["']/i.test(html);
  const hasFormsubmit = /formsubmit\.co/i.test(html);
  const ga4Match = html.match(/G-[A-Z0-9]{6,}/);
  const hasGa4 =
    /googletagmanager\.com\/gtag\/js/i.test(html) ||
    /gtag\s*\(\s*['"]config['"]/i.test(html);
  return {
    title,
    description,
    canonical,
    hasJsonLd,
    hasOg,
    hasFormsubmit,
    hasGa4,
    ga4MeasurementId: ga4Match ? ga4Match[0] : null,
  };
}

function parseSitemapUrls(xml) {
  const urls = [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)].map((m) =>
    m[1].trim(),
  );
  return urls;
}

/**
 * @returns {Promise<object>}
 */
async function buildSeoSnapshot() {
  const generatedAt = new Date().toISOString();

  const [home, robots, sitemap, css] = await Promise.all([
    fetchText(`${SITE}/`, { accept: "text/html" }),
    fetchText(`${SITE}/robots.txt`, { accept: "text/plain" }),
    fetchText(`${SITE}/sitemap.xml`, { accept: "application/xml,text/xml" }),
    fetchText(`${SITE}/css/styles.css`, { accept: "text/css" }),
  ]);

  const homepage = home.ok ? extractMeta(home.text) : null;
  const sitemapUrls = sitemap.ok ? parseSitemapUrls(sitemap.text) : [];
  const robotsSitemap =
    robots.text
      .split("\n")
      .map((l) => l.trim())
      .find((l) => /^sitemap:/i.test(l)) || null;

  const checks = [
    { name: "Homepage", path: "/", ...home, detail: home.ok ? "OK" : home.error },
    {
      name: "robots.txt",
      path: "/robots.txt",
      ...robots,
      detail: robots.ok
        ? robotsSitemap || "No Sitemap: line"
        : robots.error || `HTTP ${robots.status}`,
    },
    {
      name: "sitemap.xml",
      path: "/sitemap.xml",
      ...sitemap,
      detail: sitemap.ok
        ? `${sitemapUrls.length} URL(s)`
        : sitemap.error || `HTTP ${sitemap.status}`,
    },
    {
      name: "styles.css",
      path: "/css/styles.css",
      ...css,
      detail: css.ok ? `${Math.round(css.text.length / 1024)} KB` : css.error,
    },
  ];

  const ga4OnPage =
    homepage?.hasGa4 &&
    (!homepage.ga4MeasurementId ||
      homepage.ga4MeasurementId === GA4_MEASUREMENT_ID);

  checks.push({
    name: "GA4 tag",
    path: "/",
    ok: Boolean(ga4OnPage),
    status: home.status,
    detail: homepage?.hasGa4
      ? `Found ${homepage.ga4MeasurementId || "gtag"} on homepage`
      : `Missing gtag — expect ${GA4_MEASUREMENT_ID}`,
  });

  const scoreParts = [
    home.ok,
    robots.ok && Boolean(robotsSitemap),
    sitemap.ok && sitemapUrls.length > 0,
    css.ok,
    Boolean(homepage?.title),
    Boolean(homepage?.description),
    Boolean(homepage?.canonical),
    Boolean(homepage?.hasJsonLd),
    Boolean(homepage?.hasOg),
    Boolean(ga4OnPage),
  ];
  const score = Math.round(
    (scoreParts.filter(Boolean).length / scoreParts.length) * 100,
  );

  const ga4Home = `https://analytics.google.com/analytics/web/#/p${GA4_PROPERTY_ID}/reports/intelligenthome`;
  const ga4Realtime = `https://analytics.google.com/analytics/web/#/p${GA4_PROPERTY_ID}/realtime/overview`;
  const ga4Reports = `https://analytics.google.com/analytics/web/#/p${GA4_PROPERTY_ID}/reports/reportinghub`;
  const ga4Admin = `https://analytics.google.com/analytics/web/#/a${GA4_ACCOUNT_ID}p${GA4_PROPERTY_ID}/admin`;

  // Live traffic from GA4 Data API (service account)
  let traffic = await fetchGa4Traffic(28);

  return {
    ok: true,
    site: SITE,
    generatedAt,
    score,
    homepage,
    traffic,
    ga4: {
      measurementId: GA4_MEASUREMENT_ID,
      propertyId: GA4_PROPERTY_ID,
      accountId: GA4_ACCOUNT_ID,
      streamId: GA4_STREAM_ID,
      onPage: Boolean(homepage?.hasGa4),
      onPageId: homepage?.ga4MeasurementId || null,
      matchesConfig: ga4OnPage,
      dataApiConfigured: ga4Configured(),
      dataApiOk: Boolean(traffic?.ok),
      dataApiError: traffic?.error || null,
    },
    checks: checks.map((c) => ({
      name: c.name,
      path: c.path,
      ok: c.ok,
      status: c.status,
      detail: c.detail,
    })),
    sitemap: {
      ok: sitemap.ok,
      urlCount: sitemapUrls.length,
      sample: sitemapUrls.slice(0, 10),
    },
    robots: {
      ok: robots.ok,
      sitemapLine: robotsSitemap,
      preview: robots.text.slice(0, 400),
    },
    links: {
      liveSite: SITE + "/",
      sitemap: SITE + "/sitemap.xml",
      robots: SITE + "/robots.txt",
      googleBusiness: "https://maps.app.goo.gl/KtoGTbdjrLLAUEL88",
      yelp: "https://www.yelp.com/biz/rebekah-s-cleaning-service-springfield",
      searchConsole: `https://search.google.com/search-console?resource_id=${encodeURIComponent(SITE + "/")}`,
      searchConsoleDomain: "https://search.google.com/search-console",
      businessProfile: "https://business.google.com/",
      gmail: "https://mail.google.com/",
      ga4: ga4Home,
      ga4Realtime,
      ga4Reports,
      ga4Admin,
    },
    tips: [
      "Open GA4 Realtime, then load the live site in another tab — you should see 1+ active users within a minute of deploy.",
      "Quote form submissions fire a generate_lead event in GA4 when the form succeeds.",
      "Keep Google Business Profile hours, categories, and photos up to date.",
      "Ask happy commercial clients for Google reviews — biggest local ranking lever.",
      "After major site edits, open Search Console → URL inspection → Request indexing.",
      "Quote form emails land in rebekahcleaning@gmail.com via FormSubmit.",
    ],
  };
}

module.exports = {
  buildSeoSnapshot,
  SITE,
  GA4_MEASUREMENT_ID,
  GA4_PROPERTY_ID,
  GA4_ACCOUNT_ID,
};
