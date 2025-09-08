import { match as matchLocale } from "@formatjs/intl-localematcher";
import { withAuth } from "next-auth/middleware";
import { NextRequest, NextResponse } from 'next/server';
import Negotiator from "negotiator";

import { i18n } from "~/config/i18n-config";

const noNeedProcessRoute = [".*\\.png", ".*\\.jpg", ".*\\.opengraph-image.png"];

const noRedirectRoute = ["/api(.*)", "/trpc(.*)", "/admin"];

export function getLocale(request: NextRequest): string | undefined {
  // Negotiator expects plain object so we need to transform headers
  const negotiatorHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));
  const locales = Array.from(i18n.locales);
  // Use negotiator and intl-localematcher to get best locale
  const languages = new Negotiator({ headers: negotiatorHeaders }).languages(
    locales,
  );

  const locale = matchLocale(languages, locales, i18n.defaultLocale);
  return locale;
}

function isNoNeedProcess(req: NextRequest) {
  const { pathname } = req.nextUrl;
  return noNeedProcessRoute.some((route) => new RegExp(route).test(pathname));
}

function isNoRedirect(req: NextRequest) {
  const { pathname } = req.nextUrl;
  return noRedirectRoute.some((route) => new RegExp(route).test(pathname));
}

export const middleware = withAuth(
  async function middlewares(req) {
    if (isNoNeedProcess(req)) {
      return NextResponse.next();
    }

    const pathname = req.nextUrl.pathname;
    
    // Check if there is any supported locale in the pathname
    const pathnameIsMissingLocale = i18n.locales.every(
      (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`,
    );

    // Redirect if there is no locale
    if (pathnameIsMissingLocale) {
      const locale = getLocale(req);
      return NextResponse.redirect(
        new URL(`/${locale}${pathname.startsWith("/") ? "" : "/"}${pathname}`, req.url),
      );
    }

    // Check if user is authenticated
    const token = req.nextauth.token;
    const isAuthPage = /^\/[a-zA-Z]{2,}\/(login|register)/.test(
      req.nextUrl.pathname,
    );

    if (isAuthPage) {
      if (token) {
        const locale = getLocale(req);
        return NextResponse.redirect(new URL(`/${locale}/dashboard`, req.url));
      }
      return NextResponse.next();
    }

    // Protected routes
    const isProtectedRoute = /^\/[a-zA-Z]{2,}\/(dashboard|editor)/.test(
      req.nextUrl.pathname,
    );

    if (isProtectedRoute && !token) {
      const locale = getLocale(req);
      const from = encodeURIComponent(req.nextUrl.pathname + req.nextUrl.search);
      return NextResponse.redirect(
        new URL(`/${locale}/login?from=${from}`, req.url),
      );
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => true, // Allow all requests to pass through to the middleware function
    },
  }
);

export const config = {
  matcher: [
    "/((?!.*\\..*|_next).*)",
    "/",
    "/(api|trpc)(.*)",
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)"
  ],
};