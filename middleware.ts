import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  isAuthenticatedNextjs,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";
const isSignInPage = createRouteMatcher(["/auth"]);
const isProtectedRoute = createRouteMatcher(["/chat(.*)"]);
const isHomePage = createRouteMatcher(["/"]);

export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  const isAuth = await isAuthenticatedNextjs();
  // console.log({ isAuth });
  // if (isHomePage(request) && isAuth) {
  //   return nextjsMiddlewareRedirect(request, "/chat");
  // }
  // if (isHomePage(request) && isAuth) {
  //   return nextjsMiddlewareRedirect(request, "/chat");
  // }
  if (isSignInPage(request) && isAuth) {
    return nextjsMiddlewareRedirect(request, "/chat");
  }
  if (isProtectedRoute(request) && !isAuth) {
    return nextjsMiddlewareRedirect(request, "/auth");
  }

  // if (isHomePage(request) && !isAuth) {
  //   return nextjsMiddlewareRedirect(request, "/auth");
  // }
});

export const config = {
  // The following matcher runs middleware on all routes
  // except static assets.
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
