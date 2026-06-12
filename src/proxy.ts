import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import {
  DOCUMENT_RESPONSE_VARY,
  shouldForceHtmlDocument,
  withHtmlDocumentHeaders,
} from "./lib/rsc-document-guard";

const intlMiddleware = createMiddleware(routing);

function applyDocumentResponseHeaders(response: NextResponse): NextResponse {
  response.headers.set(
    "Cache-Control",
    "private, no-cache, no-store, max-age=0, must-revalidate",
  );
  response.headers.set("Vary", DOCUMENT_RESPONSE_VARY);
  return response;
}

export default function proxy(request: NextRequest) {
  const forceHtml = shouldForceHtmlDocument(request);

  const normalizedRequest = forceHtml
    ? new NextRequest(request.url, { headers: withHtmlDocumentHeaders(request) })
    : request;

  const response = intlMiddleware(normalizedRequest);

  return forceHtml ? applyDocumentResponseHeaders(response) : response;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
