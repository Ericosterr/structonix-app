import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { applySafePageCacheHeaders } from "./lib/rsc-document-guard";

const intlMiddleware = createMiddleware(routing);

/**
 * Locale routing + anti-CDN-poison cache headers.
 *
 * Do not attempt to delete `RSC` / Flight request headers here: Next.js 16
 * re-injects them after Proxy, so HTML vs Flight is decided by the real
 * incoming headers. Shared caches must never store those responses by URL alone.
 */
export default function proxy(request: NextRequest) {
  const response = intlMiddleware(request);
  applySafePageCacheHeaders(response.headers);
  return response;
}

export const config = {
  // Do not run on API, Next internals, or any path with a file extension.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
