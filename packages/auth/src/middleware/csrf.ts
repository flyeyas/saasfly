import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * CSRF Token 配置
 */
const CSRF_CONFIG = {
  tokenLength: 32,
  cookieName: 'csrf-token',
  headerName: 'x-csrf-token',
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: 60 * 60 * 24, // 24小时
  },
} as const;

/**
 * 生成CSRF Token
 */
function generateCSRFToken(): string {
  return crypto.randomBytes(CSRF_CONFIG.tokenLength).toString('hex');
}

/**
 * 验证CSRF Token
 */
function verifyCSRFToken(cookieToken: string, headerToken: string): boolean {
  if (!cookieToken || !headerToken) {
    return false;
  }
  
  // 使用时间安全的比较函数
  const cookieBuffer = Buffer.from(cookieToken, 'hex');
  const headerBuffer = Buffer.from(headerToken, 'hex');
  
  if (cookieBuffer.length !== headerBuffer.length) {
    return false;
  }
  
  return crypto.timingSafeEqual(
    new Uint8Array(cookieBuffer),
    new Uint8Array(headerBuffer)
  );
}

/**
 * CSRF 防护中间件
 */
export function csrfProtection() {
  return async (request: NextRequest) => {
    const { method, headers, cookies } = request;
    
    // 对于安全的HTTP方法，不需要CSRF检查
    if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      return NextResponse.next();
    }
    
    // 获取现有的CSRF token
    const cookieToken = cookies.get(CSRF_CONFIG.cookieName)?.value;
    const headerToken = headers.get(CSRF_CONFIG.headerName);
    
    // 如果没有cookie token，生成一个新的
    if (!cookieToken) {
      const newToken = generateCSRFToken();
      const response = NextResponse.json(
        { error: 'CSRF token missing. Please refresh and try again.' },
        { status: 403 }
      );
      
      response.cookies.set(CSRF_CONFIG.cookieName, newToken, CSRF_CONFIG.cookieOptions);
      return response;
    }
    
    // 验证CSRF token
    if (!headerToken || !verifyCSRFToken(cookieToken, headerToken)) {
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      );
    }
    
    return NextResponse.next();
  };
}

/**
 * 获取CSRF Token的API端点
 */
export async function getCSRFToken(request: NextRequest) {
  const cookies = request.cookies;
  let token = cookies.get(CSRF_CONFIG.cookieName)?.value;
  
  // 如果没有token，生成一个新的
  if (!token) {
    token = generateCSRFToken();
  }
  
  const response = NextResponse.json({ csrfToken: token });
  response.cookies.set(CSRF_CONFIG.cookieName, token, CSRF_CONFIG.cookieOptions);
  
  return response;
}

/**
 * 刷新CSRF Token
 */
export async function refreshCSRFToken(request: NextRequest) {
  const newToken = generateCSRFToken();
  
  const response = NextResponse.json({ csrfToken: newToken });
  response.cookies.set(CSRF_CONFIG.cookieName, newToken, CSRF_CONFIG.cookieOptions);
  
  return response;
}