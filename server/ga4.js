/**
 * GA4 Data API — service account metrics for /admin charts.
 *
 * Env (one of):
 *   GA4_SERVICE_ACCOUNT_JSON   full JSON string of the service account key
 *   GOOGLE_APPLICATION_CREDENTIALS  path to key file
 *   GA4_SERVICE_ACCOUNT_PATH   path to key file
 *
 * Property access: grant the SA email Viewer (or Analyst) on the GA4 property.
 */

const { BetaAnalyticsDataClient } = require("@google-analytics/data");
const { GoogleAuth } = require("google-auth-library");
const fs = require("fs");
const path = require("path");

const GA4_PROPERTY_ID = process.env.GA4_PROPERTY_ID?.trim() || "547446420";
const GA4_MEASUREMENT_ID =
  process.env.GA4_MEASUREMENT_ID?.trim() || "G-Z7SYCSYNN9";

function loadCredentials() {
  const raw = process.env.GA4_SERVICE_ACCOUNT_JSON?.trim();
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      // sometimes double-encoded
      return JSON.parse(JSON.parse(raw));
    }
  }
  const filePath =
    process.env.GA4_SERVICE_ACCOUNT_PATH?.trim() ||
    process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim() ||
    "";
  if (filePath && fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  }
  // local default path (never commit the key)
  const local = path.join(__dirname, "..", "secrets", "ga4-service-account.json");
  if (fs.existsSync(local)) {
    return JSON.parse(fs.readFileSync(local, "utf8"));
  }
  return null;
}

function ga4Configured() {
  return Boolean(loadCredentials());
}

function clientFromCredentials(creds) {
  return new BetaAnalyticsDataClient({
    credentials: {
      client_email: creds.client_email,
      private_key: creds.private_key,
    },
    projectId: creds.project_id,
  });
}

function dateDaysAgo(n) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

/**
 * @returns {Promise<{
 *   configured: boolean,
 *   ok: boolean,
 *   error?: string,
 *   propertyId: string,
 *   measurementId: string,
 *   serviceAccountEmail?: string,
 *   range: { startDate: string, endDate: string, days: number },
 *   totals: { sessions: number, users: number, pageViews: number, leads: number },
 *   days: Array<{ date: string, sessions: number, users: number, pageViews: number, leads: number }>,
 *   topPages: Array<{ path: string, pageViews: number, sessions: number }>,
 *   events: Array<{ name: string, count: number }>,
 * }>}
 */
async function fetchGa4Traffic(days = 28) {
  const propertyId = GA4_PROPERTY_ID;
  const measurementId = GA4_MEASUREMENT_ID;
  const startDate = dateDaysAgo(days - 1);
  const endDate = dateDaysAgo(0);
  const range = { startDate, endDate, days };

  const creds = loadCredentials();
  if (!creds) {
    return {
      configured: false,
      ok: false,
      error:
        "GA4 service account not configured. Set GA4_SERVICE_ACCOUNT_JSON (or path) and grant the SA Viewer on the GA4 property.",
      propertyId,
      measurementId,
      range,
      totals: { sessions: 0, users: 0, pageViews: 0, leads: 0 },
      days: [],
      topPages: [],
      events: [],
    };
  }

  try {
    const client = clientFromCredentials(creds);
    const property = `properties/${propertyId}`;

    const [daily] = await client.runReport({
      property,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "date" }],
      metrics: [
        { name: "sessions" },
        { name: "totalUsers" },
        { name: "screenPageViews" },
        { name: "eventCount" },
      ],
      orderBys: [{ dimension: { dimensionName: "date" }, desc: false }],
      keepEmptyRows: true,
    });

    // Lead events (form success)
    let leadByDate = new Map();
    try {
      const [leads] = await client.runReport({
        property,
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: "date" }],
        metrics: [{ name: "eventCount" }],
        dimensionFilter: {
          filter: {
            fieldName: "eventName",
            stringFilter: { value: "generate_lead", matchType: "EXACT" },
          },
        },
        orderBys: [{ dimension: { dimensionName: "date" }, desc: false }],
      });
      for (const row of leads.rows || []) {
        leadByDate.set(row.dimensionValues[0].value, Number(row.metricValues[0].value || 0));
      }
    } catch {
      // property may have no lead events yet
    }

    const dayPoints = (daily.rows || []).map((row) => {
      const raw = row.dimensionValues[0].value; // YYYYMMDD
      const date = `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
      return {
        date,
        sessions: Number(row.metricValues[0].value || 0),
        users: Number(row.metricValues[1].value || 0),
        pageViews: Number(row.metricValues[2].value || 0),
        leads: leadByDate.get(raw) || 0,
      };
    });

    // Fill missing calendar days with zeros for a continuous chart
    const byDate = new Map(dayPoints.map((d) => [d.date, d]));
    const filled = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = dateDaysAgo(i);
      filled.push(
        byDate.get(d) || {
          date: d,
          sessions: 0,
          users: 0,
          pageViews: 0,
          leads: 0,
        },
      );
    }

    const totals = filled.reduce(
      (acc, d) => {
        acc.sessions += d.sessions;
        acc.users += d.users;
        acc.pageViews += d.pageViews;
        acc.leads += d.leads;
        return acc;
      },
      { sessions: 0, users: 0, pageViews: 0, leads: 0 },
    );

    // Top pages
    let topPages = [];
    try {
      const [pages] = await client.runReport({
        property,
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: "pagePath" }],
        metrics: [{ name: "screenPageViews" }, { name: "sessions" }],
        orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
        limit: 10,
      });
      topPages = (pages.rows || []).map((row) => ({
        path: row.dimensionValues[0].value,
        pageViews: Number(row.metricValues[0].value || 0),
        sessions: Number(row.metricValues[1].value || 0),
      }));
    } catch {
      topPages = [];
    }

    // Top events
    let events = [];
    try {
      const [ev] = await client.runReport({
        property,
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: "eventName" }],
        metrics: [{ name: "eventCount" }],
        orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
        limit: 12,
      });
      events = (ev.rows || []).map((row) => ({
        name: row.dimensionValues[0].value,
        count: Number(row.metricValues[0].value || 0),
      }));
    } catch {
      events = [];
    }

    return {
      configured: true,
      ok: true,
      propertyId,
      measurementId,
      serviceAccountEmail: creds.client_email,
      range,
      totals,
      days: filled,
      topPages,
      events,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return {
      configured: true,
      ok: false,
      error: msg,
      propertyId,
      measurementId,
      serviceAccountEmail: creds.client_email,
      range,
      totals: { sessions: 0, users: 0, pageViews: 0, leads: 0 },
      days: [],
      topPages: [],
      events: [],
    };
  }
}

module.exports = {
  fetchGa4Traffic,
  ga4Configured,
  loadCredentials,
  GA4_PROPERTY_ID,
  GA4_MEASUREMENT_ID,
};
