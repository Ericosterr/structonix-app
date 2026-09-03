/**
 * Stability probe for HTML vs RSC responses and CSS chunks.
 * Usage:
 *   node scripts/probe-html-rsc.mjs http://127.0.0.1:3010 40
 *   node scripts/probe-html-rsc.mjs https://structonixsistem.com 40
 */
const base = (process.argv[2] || "http://127.0.0.1:3010").replace(/\/$/, "");
const paths = ["/", "/es", "/en", "/ru"];
const rounds = Number(process.argv[3] || 40);

function isFlightBody(body) {
  const head = body.slice(0, 200).trimStart();
  return (
    head.startsWith("1:") ||
    head.includes("$Sreact") ||
    head.includes("$React") ||
    head.includes("$Sreact.fragment")
  );
}

function isHtml(body, contentType) {
  const ct = (contentType || "").toLowerCase();
  if (ct.includes("text/x-component")) return false;
  if (isFlightBody(body)) return false;
  const head = body.slice(0, 200).trimStart();
  return (
    head.startsWith("<!DOCTYPE") ||
    head.startsWith("<html") ||
    ct.includes("text/html")
  );
}

function summarize(res, body) {
  return {
    status: res.status,
    contentType: res.headers.get("content-type"),
    cacheControl: res.headers.get("cache-control"),
    cdnCacheControl: res.headers.get("cdn-cache-control"),
    vary: res.headers.get("vary"),
    age: res.headers.get("age"),
    server: res.headers.get("server"),
    head: body.slice(0, 100).replace(/\n/g, "|"),
  };
}

async function fetchText(url, headers = {}) {
  const res = await fetch(url, { headers, redirect: "manual", cache: "no-store" });
  const body = await res.text();
  return { res, body, ...summarize(res, body) };
}

const docHeaders = {
  Accept: "text/html,application/xhtml+xml",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Dest": "document",
};

const rscHeaders = {
  RSC: "1",
  Accept: "text/x-component",
};

let failures = 0;
const buildIds = new Set();

for (const path of paths) {
  const pageUrl =
    path === "/" || path === "/es" ? `${base}/` : `${base}${path}`;

  for (let i = 0; i < rounds; i++) {
    // Order A: document → must be HTML
    const doc = await fetchText(pageUrl, docHeaders);
    if (!isHtml(doc.body, doc.contentType) || doc.status >= 400) {
      failures += 1;
      console.error("FAIL document", { path: pageUrl, i, ...summarize(doc.res, doc.body) });
      break;
    }

    // Order B: RSC (may be Flight) then document again — document must stay HTML
    // (detects CDN cache-key collision / poisoning)
    const flight = await fetchText(
      `${pageUrl}${pageUrl.includes("?") ? "&" : "?"}_rsc=1`,
      rscHeaders,
    );
    if (flight.status >= 500) {
      failures += 1;
      console.error("FAIL flight", { path: pageUrl, i, status: flight.status });
      break;
    }

    const docAfter = await fetchText(pageUrl, docHeaders);
    if (!isHtml(docAfter.body, docAfter.contentType) || docAfter.status >= 400) {
      failures += 1;
      console.error("FAIL document-after-rsc", {
        path: pageUrl,
        i,
        ...summarize(docAfter.res, docAfter.body),
      });
      break;
    }

    // Reverse order: document after a header-only RSC attempt (no ?_rsc)
    const rscNoQuery = await fetchText(pageUrl, rscHeaders);
    const docAfterPoisonAttempt = await fetchText(pageUrl, docHeaders);
    if (
      !isHtml(docAfterPoisonAttempt.body, docAfterPoisonAttempt.contentType) ||
      docAfterPoisonAttempt.status >= 400
    ) {
      failures += 1;
      console.error("FAIL document-after-rsc-headers", {
        path: pageUrl,
        i,
        poisonedWasFlight: isFlightBody(rscNoQuery.body),
        ...summarize(docAfterPoisonAttempt.res, docAfterPoisonAttempt.body),
      });
      break;
    }
  }

  const sample = await fetchText(pageUrl, docHeaders);
  if (!isHtml(sample.body, sample.contentType)) {
    failures += 1;
    console.error("FAIL sample-html", { path: pageUrl, ...summarize(sample.res, sample.body) });
    continue;
  }

  const buildIdMatch = sample.body.match(/"buildId"\s*:\s*"([^"]+)"/);
  if (buildIdMatch) buildIds.add(buildIdMatch[1]);

  const cssHrefs = [
    ...sample.body.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/g),
  ].map((m) => m[1]);
  const jsHrefs = [
    ...sample.body.matchAll(/<script[^>]+src="([^"]+_next\/static[^"]+)"/g),
  ].map((m) => m[1]);

  for (const href of [...cssHrefs, ...jsHrefs].slice(0, 12)) {
    const abs = href.startsWith("http") ? href : `${base}${href}`;
    const asset = await fetchText(abs);
    const isCss = href.includes(".css");
    const ok =
      asset.status === 200 &&
      (isCss
        ? (asset.contentType || "").includes("text/css") ||
          asset.body.includes("{")
        : (asset.contentType || "").includes("javascript") ||
          (asset.contentType || "").includes("ecmascript") ||
          asset.body.length > 0);
    if (!ok) {
      failures += 1;
      console.error("FAIL asset", {
        href: abs,
        status: asset.status,
        contentType: asset.contentType,
      });
    }
  }

  const cc = (sample.cacheControl || "").toLowerCase();
  const sharedYearCache =
    cc.includes("s-maxage=31536000") ||
    (cc.includes("s-maxage=") && !cc.includes("private") && !cc.includes("no-store"));

  if (sharedYearCache) {
    failures += 1;
    console.error("FAIL unsafe-page-cache", {
      path: pageUrl,
      cacheControl: sample.cacheControl,
      vary: sample.vary,
      age: sample.age,
      server: sample.server,
    });
  }

  console.log("OK", pageUrl, {
    rounds,
    cacheControl: sample.cacheControl,
    cdnCacheControl: sample.cdnCacheControl,
    vary: sample.vary,
    age: sample.age,
    cssCount: cssHrefs.length,
    jsSample: jsHrefs.length,
  });
}

if (buildIds.size > 1) {
  failures += 1;
  console.error("FAIL mixed-buildIds", [...buildIds]);
} else if (buildIds.size === 1) {
  console.log("buildId", [...buildIds][0]);
}

if (failures > 0) {
  console.error(`probe: FAIL (${failures})`);
  process.exit(1);
}
console.log("probe: PASS");
