/**
 * Public SEO health checks for rebekahcleanslanecounty.com
 * (lightweight cousin of keymsp-ops website-seo public health)
 */

const SITE =
  process.env.PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://rebekahcleanslanecounty.com";

const KEY_PATHS = ["/", "/robots.txt", "/sitemap.xml", "/css/styles.css"];

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

function extractMeta(html) {
  const title = html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim() || null;
  const description =
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
    null;
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
  return { title, description, canonical, hasJsonLd, hasOg, hasFormsubmit };
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
  ];
  const score = Math.round(
    (scoreParts.filter(Boolean).length / scoreParts.length) * 100,
  );

  return {
    ok: true,
    site: SITE,
    generatedAt,
    score,
    homepage,
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
    },
    tips: [
      "Keep Google Business Profile hours, categories, and photos up to date.",
      "Ask happy commercial clients for Google reviews — biggest local ranking lever.",
      "After major site edits, open Search Console → URL inspection → Request indexing.",
      "Quote form emails land in rebekahcleaning@gmail.com via FormSubmit.",
      "Service-area business: no public street address (correct for home office).",
    ],
  };
}

module.exports = { buildSeoSnapshot, SITE };
