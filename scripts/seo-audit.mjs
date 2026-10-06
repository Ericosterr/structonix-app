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

/** Retired Marbella commercial URLs that must 301 to the primary page. */
const expectedRedirects = [
  {
    path: "/en/villa-construction-marbella",
    to: "/en/construction-company-marbella",
  },
  {
    path: "/en/general-contractor-marbella",
    to: "/en/construction-company-marbella",
  },
  {
    path: "/construccion-villas-marbella",
    to: "/empresa-constructora-marbella",
  },
  {
    path: "/constructora-marbella",
    to: "/empresa-constructora-marbella",
  },
  {
    path: "/ru/stroitelstvo-vill-v-marbele",
    to: "/ru/stroitelnaya-kompaniya-marbelya",
  },
  {
    path: "/ru/generalnyy-podryadchik-marbelya",
    to: "/ru/stroitelnaya-kompaniya-marbelya",
  },
];

/** Exact malformed metadata tokens (missing spaces). Do not strip spaces before matching. */
const malformedMetaTokens = [
  "ofrececonstrucción",
  "theCosta",
  "villaand",
  "конструктив,управление",
  "entoda",
  "gestiónde",
  "andresidential",
  "техническаяподдержка",
  "acrossthe",
  "comercialdel",
  "commercialdel",
  "todedicated",
  "continueto",
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

  // Detect exact known metadata concatenation bugs (missing spaces).
  // Keep this list literal / low-noise — do not strip spaces before matching.
  for (const value of [title, description].filter(Boolean)) {
    const lower = value.toLocaleLowerCase();
    for (const token of malformedMetaTokens) {
      if (lower.includes(token.toLocaleLowerCase())) {
        flags.push(`ERROR malformed-meta:${token}`);
      }
    }
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

async function auditRedirect(entry) {
  const url = `${base}${entry.path}`;
  const flags = [];
  try {
    const res = await fetch(url, {
      redirect: "manual",
      headers: { Accept: "text/html" },
      cache: "no-store",
    });
    const location = res.headers.get("location") || "";
    if (res.status !== 301 && res.status !== 308) {
      flags.push(`ERROR expected-301 got-${res.status}`);
    }
    const normalized = location.replace(base, "");
    if (!normalized.endsWith(entry.to) && normalized !== entry.to) {
      flags.push(`ERROR redirect-target:${location || "missing"}`);
    }
    return {
      level: flags.length ? "ERROR" : "PASS",
      url,
      status: res.status,
      title: null,
      flags: flags.length ? flags : [`PASS redirect->${entry.to}`],
      redirectTo: location,
    };
  } catch (error) {
    return {
      level: "ERROR",
      url,
      status: 0,
      title: null,
      flags: [`ERROR fetch:${error.message}`],
    };
  }
}

function collectSeoStrings(node, path, out) {
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node)) {
    node.forEach((item, index) => collectSeoStrings(item, `${path}[${index}]`, out));
    return;
  }
  for (const [key, value] of Object.entries(node)) {
    const next = path ? `${path}.${key}` : key;
    if (typeof value === "string" && (key === "title" || key === "description")) {
      out.push({ path: next, value });
    } else if (value && typeof value === "object") {
      collectSeoStrings(value, next, out);
    }
  }
}

async function auditSourceMessages() {
  const { readFile } = await import("node:fs/promises");
  const { dirname, join } = await import("node:path");
  const { fileURLToPath } = await import("node:url");
  const root = join(dirname(fileURLToPath(import.meta.url)), "..");
  const flags = [];

  for (const locale of ["en", "es", "ru"]) {
    const filePath = join(root, "messages", `${locale}.json`);
    const data = JSON.parse(await readFile(filePath, "utf8"));
    const entries = [];
    collectSeoStrings(data.seo || {}, `messages/${locale}.json#seo`, entries);
    for (const entry of entries) {
      const lower = entry.value.toLocaleLowerCase();
      for (const token of malformedMetaTokens) {
        if (lower.includes(token.toLocaleLowerCase())) {
          flags.push(`ERROR source-malformed-meta:${token}@${entry.path}`);
        }
      }
      // Missing space after comma before a letter (e.g. "конструктив,управление").
      if (/,[^\s0-9"'[{]/.test(entry.value)) {
        flags.push(`ERROR source-comma-spacing@${entry.path}`);
      }
    }
  }

  return {
    level: flags.length ? "ERROR" : "PASS",
    url: "source://messages/{en,es,ru}.json#seo",
    status: flags.length ? 0 : 200,
    title: null,
    flags: flags.length ? flags : ["PASS source-meta-spacing"],
  };
}

const sourceAudit = await auditSourceMessages();
if (sourceAudit.level === "ERROR") {
  console.log(JSON.stringify({ base, sourceAudit }, null, 2));
  console.error(`seo-audit: source metadata spacing FAILED`);
  process.exit(1);
}

const results = [];
for (const path of paths) {
  results.push(await auditPath(path));
}
for (const entry of expectedRedirects) {
  results.push(await auditRedirect(entry));
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
