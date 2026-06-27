import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = new Set(["/", "/sign-in", "/two-factor", "/verify"]);

function isPublicPath(pathname: string) {
  if (PUBLIC_PATHS.has(pathname)) {
    return true;
  }

  return pathname.startsWith("/api/auth/") || pathname.startsWith("/api/webhooks/");
}

function withRequestId(response: NextResponse, requestId: string) {
  response.headers.set("x-request-id", requestId);

  return response;
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const requestHeaders = new Headers(request.headers);
  const requestId = requestHeaders.get("x-request-id") ?? crypto.randomUUID();

  requestHeaders.set("x-request-id", requestId);

  if (isPublicPath(pathname)) {
    return withRequestId(
      NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      }),
      requestId,
    );
  }

  const sessionCookie = getSessionCookie(request.headers);

  if (sessionCookie) {
    return withRequestId(
      NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      }),
      requestId,
    );
  }

  if (pathname.startsWith("/api/")) {
    return withRequestId(
      NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        },
      ),
      requestId,
    );
  }

  const redirectUrl = new URL("/sign-in", request.url);
  redirectUrl.searchParams.set("next", pathname);

  return withRequestId(NextResponse.redirect(redirectUrl), requestId);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|txt|xml|map)$).*)",
  ],
};
