import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * CSRF Token configuration
 */
const CSRF_CONFIG = {
  tokenLength: 32,
  cookieName: 'csrf-token',
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: 60 * 60 * 24, // 24 hours
  },
} as const;

/**
 * Generate CSRF Token
 */
function generateCSRFToken(): string {
  return crypto.randomBytes(CSRF_CONFIG.tokenLength).toString('hex');
}

/**
 * Get CSRF Token
 */
export async function GET(request: NextRequest) {
  const cookies = request.cookies;
  let token = cookies.get(CSRF_CONFIG.cookieName)?.value;
  
  // If no token exists, generate a new one
  if (!token) {
    token = generateCSRFToken();
  }
  
  const response = NextResponse.json({ csrfToken: token });
  response.cookies.set(CSRF_CONFIG.cookieName, token, CSRF_CONFIG.cookieOptions);
  
  return response;
}

/**
 * Refresh CSRF Token
 */
export async function POST(request: NextRequest) {
  const newToken = generateCSRFToken();
  
  const response = NextResponse.json({ csrfToken: newToken });
  response.cookies.set(CSRF_CONFIG.cookieName, newToken, CSRF_CONFIG.cookieOptions);
  
  return response;
}