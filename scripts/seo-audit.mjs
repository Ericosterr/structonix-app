/**
 * Lightweight SEO crawl for Structonix commercial pages.
 *
 * Usage:
 *   node scripts/seo-audit.mjs https://structonixsistem.com
 *   node scripts/seo-audit.mjs http://127.0.0.1:3010
 */
const base = (process.argv[2] || "https://structonixsistem.com").replace(/\/$/, "");

const paths = [
  "/",
  "/en",
  "/ru",
  "/zonas/marbella",
  "/en/zonas/marbella",
  "/ru/zonas/marbella",
  "/zonas/costa-del-sol",
  "/en/zonas/costa-del-sol",
  "/ru/zonas/costa-del-sol",
  "/empresa-constructora-marbella",
  "/en/construction-company-marbella",
  "/ru/stroitelnaya-kompaniya-marbelya",
  "/constructora-costa-del-sol",
  "/en/builders-costa-del-sol",
  "/ru/stroiteli-costa-del-sol",
  "/servicios/estructura",
  "/en/servicios/arquitectura",
  "/ru/servicios/ingenieria",
];

function textBetween(html, startRe, endRe) {
  const start = html.match(startRe);
  if (!start) return null;
  const from = start.index + start[0].length;
  const rest = html.slice(from);
  const end = rest.search(endRe);
  return (end === -1 ? rest : rest.slice(0, end)).trim();
}

function decode(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function metaContent(html, name) {
  const re = new RegExp(
    `<meta[^>]+(?:name|property)=["']${name}["'][^>]*content=["']([^"']*)["']`,
    "i",
  );
  const alt = new RegExp(
    `<meta[^>]+content=["']([^"']*)["'][^>]*(?:name|property)=["']${name}["']`,
    "i",
  );
  const match = html.match(re) || html.match(alt);
  return match ? decode(match[1]) : null;
}

function allMatches(html, re) {
  return [...html.matchAll(re)].map((m) => decode(m[1]));
}

async function auditPath(path) {
  const url = `${base}${path}`;
  const flags = [];
  let status = 0;
  let html = "";
  let contentType = "";

  try {
    const res = await fetch(url, {
      redirect: "manual",
      headers: {
        Accept: "text/html",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Dest": "document",
      },
      cache: "no-store",
    });
    status = res.status;
    contentType = res.headers.get("content-type") || "";
    if (status >= 300 && status < 400) {
      flags.push(`WARNING redirect:${res.headers.get("location") || ""}`);
      return { url, status, flags, title: null };
    }
    html = await res.text();
  } catch (error) {
    flags.push(`ERROR fetch:${error.message}`);
    return { url, status: 0, flags, title: null };
  }

  if (status >= 400) flags.push("ERROR status");
  if (!contentType.includes("text/html")) flags.push("ERROR content-type");

  const title = textBetween(html, /<title[^>]*>/i, /<\/title>/i);
  const description = metaContent(html, "description");
  const canonical = metaContent(html, "canonical") ||
    (html.match(/<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)["']/i) ||
      html.match(/<link[^>]+href=["']([^"']+)["'][^>]*rel=["']canonical["']/i) ||
      [])[1] || null;
  // Next.js emits hrefLang (camelCase) in markup.
  const hreflangs = [...html.matchAll(/hreflang=["']([^"']+)["']/gi)].map((m) =>
    decode(m[1]),
  );
  const robots = metaContent(html, "robots");
  const h1s = allMatches(html, /<h1[^>]*>([\s\S]*?)<\/h1>/gi).map((v) =>
    v.replace(/<[^>]+>/g, "").trim(),
  );
  const jsonLd = (html.match(/application\/ld\+json/gi) || []).length;
  const internalLinks = (html.match(/href=["']\/[^"']*["']/g) || []).length;

  if (!title) flags.push("ERROR missing-title");
  else if (title.length < 15 || title.length > 70) flags.push("WARNING title-length");
  if (!description) flags.push("ERROR missing-description");
  else if (description.length < 50 || description.length > 170) {
    flags.push("WARNING description-length");
  }
  if (!canonical) flags.push("ERROR missing-canonical");
  else if (!canonical.startsWith("https://structonixsistem.com")) {
    flags.push("ERROR canonical-host");
  }
  if (robots && /noindex/i.test(robots)) flags.push("ERROR noindex");
  if (h1s.length === 0) flags.push("ERROR missing-h1");
  if (h1s.length > 1) flags.push("WARNING multiple-h1");
  if (hreflangs.length < 3) flags.push("WARNING thin-hreflang");
  if (jsonLd < 1) flags.push("WARNING missing-jsonld");

  const level = flags.some((f) => f.startsWith("ERROR"))
    ? "ERROR"
    : flags.some((f) => f.startsWith("WARNING"))
      ? "WARNING"
      : "PASS";

  return {
    level,
    url,
    status,
    title,
    titleLength: title?.length ?? 0,
    description,
    canonical,
    h1Count: h1s.length,
    h1: h1s[0] || null,
    robots,
    hreflangCount: hreflangs.length,
    jsonLd,
    internalLinks,
    flags,
  };
}

const results = [];
for (const path of paths) {
  results.push(await auditPath(path));
}

const titles = new Map();
for (const row of results) {
  if (!row.title) continue;
  const list = titles.get(row.title) || [];
  list.push(row.url);
  titles.set(row.title, list);
}
for (const [title, urls] of titles) {
  if (urls.length > 1) {
    for (const row of results) {
      if (row.title === title) {
        row.flags.push("WARNING duplicate-title");
        if (row.level === "PASS") row.level = "WARNING";
      }
    }
  }
}

console.log(JSON.stringify({ base, checked: results.length, results }, null, 2));

const errors = results.filter((r) => r.level === "ERROR").length;
const warnings = results.filter((r) => r.level === "WARNING").length;
console.error(`seo-audit: ${errors} ERROR, ${warnings} WARNING, ${results.length - errors - warnings} PASS`);
process.exit(errors > 0 ? 1 : 0);
