/**
 * Page-response cache policy for App Router + Hostinger CDN (`hcdn`).
 *
 * Production evidence (2026-09):
 * - `/ru` served `text/x-component` to normal document navigations
 * - `Cache-Control: s-maxage=31536000`, `Vary` stripped/null, `Age` > 0, `Server: hcdn`
 *
 * Root cause: shared CDN cache keyed only by URL (ignores RSC Vary). An RSC/Flight
 * response (or a stale HTML body) is then reused for document requests → raw Flight
 * text in the browser, or HTML pointing at deleted `/_next/static` chunks (no CSS).
 *
 * Next.js 16 Proxy cannot strip Flight headers: the runtime re-applies `rsc` /
 * router headers after Proxy ("Flight headers are not overridable / removable").
 * Defense is therefore response cache policy, not request-header mutation.
 */

export const DOCUMENT_RESPONSE_VARY =
  "RSC, Next-Router-State-Tree, Next-Router-Prefetch, Next-Url, Accept, Accept-Encoding";

/** Apply on every locale/page response so shared caches cannot store HTML/RSC interchangeably. */
export function applySafePageCacheHeaders(headers: Headers): void {
  headers.set(
    "Cache-Control",
    "private, no-cache, no-store, max-age=0, must-revalidate",
  );
  headers.set("Pragma", "no-cache");
  headers.set("Expires", "0");
  // Surrogate / Hostinger / Cloudflare-style CDNs
  headers.set("CDN-Cache-Control", "no-store");
  headers.set("Cloudflare-CDN-Cache-Control", "no-store");
  headers.set("Surrogate-Control", "no-store");
  headers.set("Vary", DOCUMENT_RESPONSE_VARY);
}
