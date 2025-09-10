import { match as matchLocale } from "@formatjs/intl-localematcher";
import { withAuth } from "next-auth/middleware";
import { NextRequest, NextResponse } from 'next/server';
import Negotiator from "negotiator";
import crypto from 'crypto';

import { i18n } from "~/config/i18n-config";

const noNeedProcessRoute = [".*\\.png", ".*\\.jpg", ".*\\.opengraph-image.png"];

const noRedirectRoute = ["/api(.*)", "/trpc(.*)", "/admin(.*)"];

// 速率限制存储
interface AttemptRecord {
  count: number;
  firstAttempt: number;
  lastAttempt: number;
  blocked: boolean;
  blockExpires?: number;
}

class MemoryStore {
  private store = new Map<string, AttemptRecord>();
  
  get(key: string): AttemptRecord | undefined {
    const record = this.store.get(key);
    if (!record) return undefined;
    
    const now = Date.now();
    if (record.blocked && record.blockExpires && now > record.blockExpires) {
      record.blocked = false;
      record.blockExpires = undefined;
      record.count = 0;
    }
    
    return record;
  }
  
  set(key: string, record: AttemptRecord): void {
    this.store.set(key, record);
  }
}

const rateLimitStore = new MemoryStore();

// 速率限制配置
const RATE_LIMITS = {
  login: { windowMs: 15 * 60 * 1000, maxAttempts: 5, blockDurationMs: 30 * 60 * 1000 },
  register: { windowMs: 60 * 60 * 1000, maxAttempts: 3, blockDurationMs: 2 * 60 * 60 * 1000 },
  verification: { windowMs: 60 * 1000, maxAttempts: 1, blockDurationMs: 60 * 1000 },
  passwordReset: { windowMs: 60 * 60 * 1000, maxAttempts: 3, blockDurationMs: 60 * 60 * 1000 },
};

function getClientKey(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0] || realIp || request.ip || 'unknown';
  return `rate_limit:${ip}`;
}

function checkRateLimit(request: NextRequest, config: typeof RATE_LIMITS.login): NextResponse | null {
  const key = getClientKey(request);
  const now = Date.now();
  
  let record = rateLimitStore.get(key);
  
  if (!record) {
    record = {
      count: 1,
      firstAttempt: now,
      lastAttempt: now,
      blocked: false,
    };
  } else {
    if (record.blocked && record.blockExpires && now < record.blockExpires) {
      const remainingTime = Math.ceil((record.blockExpires - now) / 1000);
      return NextResponse.json(
        { error: 'Too many attempts. Please try again later.', retryAfter: remainingTime },
        { status: 429, headers: { 'Retry-After': remainingTime.toString() } }
      );
    }
    
    if (now - record.firstAttempt > config.windowMs) {
      record.count = 1;
      record.firstAttempt = now;
      record.blocked = false;
    } else {
      record.count++;
    }
    
    record.lastAttempt = now;
    
    if (record.count > config.maxAttempts) {
      record.blocked = true;
      record.blockExpires = now + config.blockDurationMs;
      
      rateLimitStore.set(key, record);
      
      const remainingTime = Math.ceil(config.blockDurationMs / 1000);
      return NextResponse.json(
        { error: 'Too many attempts. Account temporarily blocked.', retryAfter: remainingTime },
        { status: 429, headers: { 'Retry-After': remainingTime.toString() } }
      );
    }
  }
  
  rateLimitStore.set(key, record);
  return null;
}

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
      // 添加安全头部
    const response = NextResponse.next();
    
    // 安全头部
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // 仅在HTTPS环境下设置HSTS
    if (req.nextUrl.protocol === 'https:') {
      response.headers.set(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains; preload'
      );
    }
    
    return response;
    }

    const pathname = req.nextUrl.pathname;
    
    // 应用速率限制（仅对认证API）
    if (pathname.includes('/api/auth/')) {
      let rateLimitResult = null;
      
      if (pathname.includes('/login')) {
        rateLimitResult = checkRateLimit(req, RATE_LIMITS.login);
      } else if (pathname.includes('/register')) {
        rateLimitResult = checkRateLimit(req, RATE_LIMITS.register);
      } else if (pathname.includes('/send-code')) {
        rateLimitResult = checkRateLimit(req, RATE_LIMITS.verification);
      } else if (pathname.includes('/password')) {
        rateLimitResult = checkRateLimit(req, RATE_LIMITS.passwordReset);
      }
      
      if (rateLimitResult) {
        return rateLimitResult;
      }
    }
    
    // Check if there is any supported locale in the pathname
    const pathnameIsMissingLocale = i18n.locales.every(
      (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`,
    );

    // Redirect if there is no locale (but skip admin routes)
    if (pathnameIsMissingLocale && !isNoRedirect(req)) {
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

    // Admin routes protection
    const isAdminRoute = /^\/admin/.test(req.nextUrl.pathname);
    if (isAdminRoute && req.nextUrl.pathname !== "/admin/login") {
      if (!token) {
        return NextResponse.redirect(new URL("/admin/login", req.url));
      }
      
      // Check if user is admin
      const adminEmails = process.env.ADMIN_EMAIL?.split(",") || [];
      if (!adminEmails.includes(token.email || "")) {
        return NextResponse.redirect(new URL("/admin/login", req.url));
      }
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
    "/admin/:path*",
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)"
  ],
};