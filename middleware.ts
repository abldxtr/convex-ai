import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  isAuthenticatedNextjs,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
const isSignInPage = createRouteMatcher(["/auth"]);
const isProtectedRoute = createRouteMatcher(["/chat(.*)"]);

const SUSPICIOUS_UA_PATTERNS = [
  /^\s*$/, // Empty user agents
  /\.\./, // Path traversal attempt
  /<\s*script/i, // Potential XSS payloads
  /\(\)\s*{.*}/, // Command execution attempt
  /\b(sqlmap|nikto|gobuster|dirb|nmap)\b/i, // Known scanning tools
] as const;

export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  const securityBlock = handleSecurityFiltering(request);
  if (securityBlock) return securityBlock;
  const isAuth = await isAuthenticatedNextjs();

  if (isSignInPage(request) && isAuth) {
    return nextjsMiddlewareRedirect(request, "/chat");
  }
  if (isProtectedRoute(request) && !isAuth) {
    return nextjsMiddlewareRedirect(request, "/auth");
  }
});

export const config = {
  // The following matcher runs middleware on all routes
  // except static assets.
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};

function handleSecurityFiltering(request: NextRequest): NextResponse | null {
  const userAgent = request.headers.get("user-agent") || "";

  const isSuspicious = SUSPICIOUS_UA_PATTERNS.some((pattern) =>
    pattern.test(userAgent)
  );

  // Block suspicious requests, but exempt webhook endpoints from User-Agent validation
  if (isSuspicious) {
    return new NextResponse(null, {
      status: 403,
      statusText: "Forbidden",
      headers: {
        "Content-Type": "text/plain",
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "Content-Security-Policy": "default-src 'none'",
        "Cache-Control":
          "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  }

  return null;
}
