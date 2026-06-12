import type { NextRequest } from "next/server";

/** In-app browsers and link-preview crawlers must receive HTML documents. */
const HTML_DOCUMENT_USER_AGENT =
  /telegram|facebookexternalhit|facebot|whatsapp|linkedinbot|twitterbot|slackbot|discordbot|embedly|preview/i;

const RSC_REQUEST_HEADERS = [
  "rsc",
  "next-router-state-tree",
  "next-router-prefetch",
  "next-url",
] as const;

export function shouldForceHtmlDocument(request: NextRequest): boolean {
  const userAgent = request.headers.get("user-agent") ?? "";

  if (HTML_DOCUMENT_USER_AGENT.test(userAgent)) {
    return true;
  }

  const hasRscQuery = request.nextUrl.searchParams.has("_rsc");
  if (hasRscQuery) {
    return false;
  }

  // CDN / reverse-proxy redirect bug: RSC header survives without ?_rsc query.
  if (request.headers.get("rsc") === "1") {
    return true;
  }

  const accept = request.headers.get("accept") ?? "";
  const isFlightAccept =
    accept === "text/x-component" ||
    accept.startsWith("text/x-component,") ||
    accept.startsWith("text/x-component;");

  const secFetchMode = request.headers.get("sec-fetch-mode");
  const secFetchDest = request.headers.get("sec-fetch-dest");

  if (
    isFlightAccept &&
    (secFetchMode === "navigate" || secFetchDest === "document")
  ) {
    return true;
  }

  return false;
}

export function withHtmlDocumentHeaders(request: NextRequest): Headers {
  const headers = new Headers(request.headers);

  for (const name of RSC_REQUEST_HEADERS) {
    headers.delete(name);
  }

  const accept = headers.get("accept") ?? "";
  if (!accept.includes("text/html")) {
    headers.set(
      "accept",
      `text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8${accept ? `,${accept}` : ""}`,
    );
  }

  return headers;
}

export const DOCUMENT_RESPONSE_VARY =
  "RSC, Next-Router-State-Tree, Next-Router-Prefetch, Next-Url, Accept, Accept-Encoding";
