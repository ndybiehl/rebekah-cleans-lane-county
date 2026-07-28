/**
 * Rebekah's Cleaning Service
 * - Serves public static site from /public
 * - Owner admin at /admin (SEO dashboard)
 *
 * Env:
 *   PORT
 *   SESSION_SECRET
 *   ADMIN_EMAIL          (default rebekahcleaning@gmail.com)
 *   ADMIN_PASSWORD_HASH  (bcrypt hash — generate with npm run hash-password)
 *   ADMIN_PASSWORD       (dev only plain password if hash not set)
 *   PUBLIC_SITE_URL      (default https://rebekahcleanslanecounty.com)
 */

const path = require("path");
const crypto = require("crypto");
const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const { buildSeoSnapshot, SITE } = require("./seo");

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const PUBLIC = path.join(__dirname, "..", "public");

const ADMIN_EMAIL = (
  process.env.ADMIN_EMAIL || "rebekahcleaning@gmail.com"
)
  .trim()
  .toLowerCase();

const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  crypto.randomBytes(32).toString("hex");

function passwordOk(plain) {
  const hash = process.env.ADMIN_PASSWORD_HASH?.trim();
  if (hash) return bcrypt.compareSync(plain, hash);
  const dev = process.env.ADMIN_PASSWORD?.trim();
  if (dev) return plain === dev;
  // First-boot fallback so deploy isn't locked out — CHANGE IMMEDIATELY
  return plain === "ChangeMe-Rebekah2026!";
}

app.set("trust proxy", 1);
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.json({ limit: "64kb" }));

app.use(
  session({
    name: "rcls_admin",
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 12, // 12h
    },
  }),
);

function requireAdmin(req, res, next) {
  if (req.session?.adminEmail === ADMIN_EMAIL) return next();
  if (req.path.startsWith("/api/")) {
    return res.status(401).json({ error: "Sign in required" });
  }
  return res.redirect("/admin/login?next=" + encodeURIComponent(req.originalUrl));
}

// ---------- Admin pages ----------
app.get("/admin/login", (req, res) => {
  if (req.session?.adminEmail === ADMIN_EMAIL) {
    return res.redirect("/admin");
  }
  const err = req.query.error ? String(req.query.error) : "";
  res.type("html").send(loginPage(err));
});

app.post("/admin/login", (req, res) => {
  const email = String(req.body.email || "")
    .trim()
    .toLowerCase();
  const password = String(req.body.password || "");
  if (email !== ADMIN_EMAIL || !passwordOk(password)) {
    return res.redirect("/admin/login?error=invalid");
  }
  req.session.adminEmail = ADMIN_EMAIL;
  req.session.loginAt = new Date().toISOString();
  return res.redirect("/admin");
});

app.post("/admin/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/admin/login");
  });
});

app.get("/admin", requireAdmin, (req, res) => {
  res.type("html").send(adminShell());
});

app.get("/api/admin/seo", requireAdmin, async (req, res) => {
  try {
    const snapshot = await buildSeoSnapshot();
    res.set("Cache-Control", "private, no-store");
    res.json(snapshot);
  } catch (e) {
    res.status(502).json({
      ok: false,
      error: e instanceof Error ? e.message : String(e),
    });
  }
});

app.get("/api/admin/me", requireAdmin, (req, res) => {
  res.json({
    email: req.session.adminEmail,
    loginAt: req.session.loginAt,
    site: SITE,
  });
});

// Health for DO
app.get("/healthz", (_req, res) => res.json({ ok: true }));

// Static marketing site (after admin routes)
app.use(
  express.static(PUBLIC, {
    extensions: ["html"],
    maxAge: process.env.NODE_ENV === "production" ? "1h" : 0,
  }),
);

// SPA-ish fallback for unknown paths → home
app.use((req, res) => {
  if (req.method === "GET" && !req.path.startsWith("/api/")) {
    return res.sendFile(path.join(PUBLIC, "index.html"));
  }
  res.status(404).json({ error: "Not found" });
});

app.listen(PORT, () => {
  console.log(`Rebekah site listening on :${PORT} (admin ${ADMIN_EMAIL})`);
  if (!process.env.ADMIN_PASSWORD_HASH && !process.env.ADMIN_PASSWORD) {
    console.warn(
      "[warn] Using default admin password — set ADMIN_PASSWORD_HASH in production",
    );
  }
});

function loginPage(error) {
  const msg =
    error === "invalid"
      ? `<p class="err">Invalid email or password.</p>`
      : "";
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>Sign in · Rebekah's Cleaning Service</title>
<style>
  :root { --burgundy:#6b1d2a; --navy:#1e3a5f; --cream:#faf7f5; }
  * { box-sizing: border-box; }
  body { margin:0; min-height:100vh; font-family: system-ui, sans-serif;
    background: linear-gradient(160deg, var(--cream), #fff 50%, #f0ebe6);
    display:grid; place-items:center; color:#1a1a1a; padding:1.5rem; }
  .card { width:min(100%, 400px); background:#fff; border:1px solid rgba(107,29,42,.12);
    border-radius:16px; padding:1.75rem; box-shadow:0 12px 40px rgba(74,18,32,.08); }
  h1 { font-family: Georgia, serif; color:var(--burgundy); font-size:1.4rem; margin:0 0 .35rem; }
  .sub { color:#666; font-size:.92rem; margin:0 0 1.25rem; }
  label { display:block; font-weight:600; font-size:.88rem; color:var(--navy); margin:.75rem 0 .3rem; }
  input { width:100%; padding:.75rem .9rem; border:1px solid rgba(107,29,42,.15);
    border-radius:10px; font:inherit; }
  input:focus { outline:3px solid rgba(196,30,58,.2); border-color:#c41e3a; }
  button { margin-top:1.1rem; width:100%; padding:.85rem; border:0; border-radius:999px;
    background:#c41e3a; color:#fff; font-weight:700; font:inherit; cursor:pointer; }
  button:hover { background:var(--burgundy); }
  .err { color:#c41e3a; font-weight:600; font-size:.92rem; }
  a { color:var(--hibiscus, #c41e3a); }
</style>
</head>
<body>
  <form class="card" method="post" action="/admin/login">
    <h1>Owner sign-in</h1>
    <p class="sub">SEO dashboard for Rebekah's Cleaning Service</p>
    ${msg}
    <label for="email">Email</label>
    <input id="email" name="email" type="email" required autocomplete="username"
      value="rebekahcleaning@gmail.com">
    <label for="password">Password</label>
    <input id="password" name="password" type="password" required autocomplete="current-password">
    <button type="submit">Sign in</button>
    <p class="sub" style="margin-top:1rem;margin-bottom:0">
      <a href="/">← Back to website</a>
    </p>
  </form>
</body>
</html>`;
}

function adminShell() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>SEO dashboard · Rebekah's Cleaning Service</title>
<style>
  :root {
    --burgundy:#6b1d2a; --navy:#1e3a5f; --hibiscus:#c41e3a;
    --cream:#faf7f5; --line:rgba(107,29,42,.12); --ok:#1b6b3a; --bad:#b42318;
  }
  * { box-sizing:border-box; }
  body { margin:0; font-family:system-ui,sans-serif; background:var(--cream); color:#1a1a1a; }
  header { background:#fff; border-bottom:1px solid var(--line); padding:1rem 1.25rem;
    display:flex; flex-wrap:wrap; gap:1rem; align-items:center; justify-content:space-between; }
  header h1 { font-family:Georgia,serif; color:var(--burgundy); font-size:1.2rem; margin:0; }
  header .meta { font-size:.88rem; color:#555; }
  main { width:min(100% - 2rem, 960px); margin:1.5rem auto 3rem; }
  .score { display:flex; gap:1rem; align-items:center; background:#fff; border:1px solid var(--line);
    border-radius:14px; padding:1.25rem; margin-bottom:1rem; box-shadow:0 4px 16px rgba(30,58,95,.06); }
  .score-ring { width:72px; height:72px; border-radius:50%; display:grid; place-items:center;
    font-weight:800; font-size:1.25rem; color:var(--burgundy); border:4px solid var(--hibiscus); }
  .cards { display:grid; gap:1rem; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); }
  .card { background:#fff; border:1px solid var(--line); border-radius:14px; padding:1.1rem 1.2rem; }
  .card h2 { font-family:Georgia,serif; color:var(--navy); font-size:1.05rem; margin:0 0 .75rem; }
  table { width:100%; border-collapse:collapse; font-size:.92rem; }
  th, td { text-align:left; padding:.5rem .35rem; border-bottom:1px solid var(--line); vertical-align:top; }
  .badge { display:inline-block; font-size:.72rem; font-weight:800; letter-spacing:.04em;
    text-transform:uppercase; padding:.2rem .5rem; border-radius:999px; }
  .badge.ok { background:#e8f5eb; color:var(--ok); }
  .badge.bad { background:#fdecea; color:var(--bad); }
  a { color:var(--hibiscus); }
  .links a { display:inline-block; margin:.25rem .5rem .25rem 0; padding:.45rem .8rem;
    background:var(--cream); border-radius:999px; text-decoration:none; font-weight:600; font-size:.88rem;
    border:1px solid var(--line); color:var(--navy); }
  .links a:hover { border-color:var(--hibiscus); color:var(--hibiscus); }
  ul.tips { margin:0; padding-left:1.1rem; color:#444; font-size:.95rem; }
  ul.tips li { margin:.35rem 0; }
  button, .btn { font:inherit; cursor:pointer; border:0; border-radius:999px; padding:.55rem 1rem;
    font-weight:700; }
  .btn-primary { background:var(--hibiscus); color:#fff; }
  .btn-ghost { background:transparent; border:1px solid var(--line); color:var(--navy); }
  .err { color:var(--bad); }
  .muted { color:#666; font-size:.88rem; }
  code { font-size:.85em; background:var(--cream); padding:.1rem .35rem; border-radius:4px; }
</style>
</head>
<body>
  <header>
    <div>
      <h1>SEO dashboard</h1>
      <div class="meta" id="who">Loading…</div>
    </div>
    <div style="display:flex;gap:.5rem;align-items:center;flex-wrap:wrap">
      <button type="button" class="btn-ghost" id="refresh">Refresh checks</button>
      <a class="btn-ghost" href="/" style="text-decoration:none">View site</a>
      <form method="post" action="/admin/logout" style="margin:0">
        <button type="submit" class="btn-ghost">Sign out</button>
      </form>
    </div>
  </header>
  <main>
    <div id="root"><p class="muted">Running live site checks…</p></div>
  </main>
  <script>
    async function load() {
      const root = document.getElementById('root');
      try {
        const [me, seo] = await Promise.all([
          fetch('/api/admin/me').then(r => r.json()),
          fetch('/api/admin/seo').then(r => r.json()),
        ]);
        document.getElementById('who').textContent =
          me.email + (me.loginAt ? ' · signed in ' + new Date(me.loginAt).toLocaleString() : '');

        if (!seo.ok && seo.error) {
          root.innerHTML = '<p class="err">' + esc(seo.error) + '</p>';
          return;
        }

        const rows = (seo.checks || []).map(c =>
          '<tr><td><strong>' + esc(c.name) + '</strong><br><span class="muted">' + esc(c.path) +
          '</span></td><td><span class="badge ' + (c.ok ? 'ok' : 'bad') + '">' +
          (c.ok ? 'OK' : 'Issue') + '</span></td><td>' + esc(String(c.status ?? '—')) +
          '</td><td>' + esc(c.detail || '') + '</td></tr>'
        ).join('');

        const hp = seo.homepage || {};
        const links = seo.links || {};
        const tips = (seo.tips || []).map(t => '<li>' + esc(t) + '</li>').join('');

        root.innerHTML = \`
          <div class="score">
            <div class="score-ring">\${seo.score}%</div>
            <div>
              <strong>Site health score</strong>
              <p class="muted" style="margin:.25rem 0 0">Live checks against
                <a href="\${esc(seo.site)}" target="_blank" rel="noopener">\${esc(seo.site)}</a>
                · \${esc(new Date(seo.generatedAt).toLocaleString())}
              </p>
            </div>
          </div>

          <div class="cards">
            <div class="card" style="grid-column:1/-1">
              <h2>Technical checks</h2>
              <table>
                <thead><tr><th>Check</th><th>Status</th><th>HTTP</th><th>Detail</th></tr></thead>
                <tbody>\${rows}</tbody>
              </table>
            </div>

            <div class="card">
              <h2>Homepage SEO</h2>
              <p><strong>Title</strong><br>\${esc(hp.title || '—')}</p>
              <p><strong>Description</strong><br>\${esc(hp.description || '—')}</p>
              <p><strong>Canonical</strong><br>\${esc(hp.canonical || '—')}</p>
              <p class="muted">
                JSON-LD: \${hp.hasJsonLd ? 'yes' : 'no'} ·
                Open Graph: \${hp.hasOg ? 'yes' : 'no'} ·
                Contact form: \${hp.hasFormsubmit ? 'FormSubmit' : '—'} ·
                GA4: \${hp.hasGa4 ? esc(hp.ga4MeasurementId || 'yes') : 'missing'}
              </p>
            </div>

            <div class="card">
              <h2>Google Analytics 4</h2>
              <p><strong>Measurement ID</strong><br><code>\${esc((seo.ga4 && seo.ga4.measurementId) || '—')}</code></p>
              <p><strong>Property</strong><br><code>\${esc((seo.ga4 && seo.ga4.propertyId) || '—')}</code>
                · stream <code>\${esc((seo.ga4 && seo.ga4.streamId) || '—')}</code></p>
              <p>
                <span class="badge \${seo.ga4 && seo.ga4.onPage ? 'ok' : 'bad'}">
                  \${seo.ga4 && seo.ga4.onPage ? 'Tag on site' : 'Tag not detected'}
                </span>
              </p>
              <p class="muted">Sign in as rebekahcleaning@gmail.com to open reports. Realtime may take a few minutes after deploy.</p>
              <div class="links">
                <a href="\${esc(links.ga4Realtime || '#')}" target="_blank" rel="noopener">Realtime</a>
                <a href="\${esc(links.ga4 || '#')}" target="_blank" rel="noopener">GA4 home</a>
                <a href="\${esc(links.ga4Reports || '#')}" target="_blank" rel="noopener">Reports</a>
                <a href="\${esc(links.ga4Admin || '#')}" target="_blank" rel="noopener">Admin</a>
              </div>
            </div>

            <div class="card">
              <h2>Sitemap</h2>
              <p>\${seo.sitemap?.ok ? seo.sitemap.urlCount + ' URL(s)' : 'Not OK'}</p>
              <ul class="muted">\${(seo.sitemap?.sample || []).map(u => '<li><code>' + esc(u) + '</code></li>').join('')}</ul>
            </div>

            <div class="card" style="grid-column:1/-1">
              <h2>Open in Google &amp; more</h2>
              <div class="links">
                <a href="\${esc(links.ga4Realtime || '#')}" target="_blank" rel="noopener">GA4 Realtime</a>
                <a href="\${esc(links.businessProfile)}" target="_blank" rel="noopener">Google Business Profile</a>
                <a href="\${esc(links.googleBusiness)}" target="_blank" rel="noopener">Maps listing</a>
                <a href="\${esc(links.searchConsoleDomain)}" target="_blank" rel="noopener">Search Console</a>
                <a href="\${esc(links.yelp)}" target="_blank" rel="noopener">Yelp</a>
                <a href="\${esc(links.gmail)}" target="_blank" rel="noopener">Gmail (form leads)</a>
                <a href="\${esc(links.liveSite)}" target="_blank" rel="noopener">Live website</a>
              </div>
            </div>

            <div class="card" style="grid-column:1/-1">
              <h2>Tips</h2>
              <ul class="tips">\${tips}</ul>
            </div>
          </div>
        \`;
      } catch (e) {
        root.innerHTML = '<p class="err">Failed to load SEO data.</p>';
      }
    }
    function esc(s) {
      return String(s ?? '').replace(/[&<>"']/g, c =>
        ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    }
    document.getElementById('refresh').onclick = () => {
      document.getElementById('root').innerHTML = '<p class="muted">Refreshing…</p>';
      load();
    };
    load();
  </script>
</body>
</html>`;
}
