import { NextRequest, NextResponse } from 'next/server';
import { csrfProtection } from './csrf';
import { 
  loginRateLimit, 
  registerRateLimit, 
  verificationCodeRateLimit, 
  passwordResetRateLimit 
} from './rate-limit';

/**
 * 安全中间件配置
 */
interface SecurityConfig {
  enableCSRF?: boolean;
  enableRateLimit?: boolean;
  customRateLimits?: Record<string, (request: NextRequest) => Promise<NextResponse | void>>;
}

/**
 * 默认安全配置
 */
const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
  enableCSRF: true,
  enableRateLimit: true,
};

/**
 * 路径匹配器
 */
function matchPath(pathname: string, pattern: string): boolean {
  if (pattern.endsWith('*')) {
    return pathname.startsWith(pattern.slice(0, -1));
  }
  return pathname === pattern;
}

/**
 * 获取适用的速率限制中间件
 */
function getRateLimitMiddleware(pathname: string): ((request: NextRequest) => Promise<NextResponse | void>) | null {
  // 登录相关路径
  if (matchPath(pathname, '/api/auth/login*') || 
      matchPath(pathname, '/api/auth/signin*')) {
    return loginRateLimit;
  }
  
  // 注册相关路径
  if (matchPath(pathname, '/api/auth/register*') || 
      matchPath(pathname, '/api/auth/signup*')) {
    return registerRateLimit;
  }
  
  // 验证码发送路径
  if (matchPath(pathname, '/api/auth/*/send-code') || 
      matchPath(pathname, '/api/auth/verification/send')) {
    return verificationCodeRateLimit;
  }
  
  // 密码重置路径
  if (matchPath(pathname, '/api/auth/password*')) {
    return passwordResetRateLimit;
  }
  
  return null;
}

/**
 * 创建安全中间件
 */
export function createSecurityMiddleware(config: SecurityConfig = {}) {
  const finalConfig = { ...DEFAULT_SECURITY_CONFIG, ...config };
  const csrfMiddleware = csrfProtection();
  
  return async (request: NextRequest) => {
    const { pathname } = request.nextUrl;
    
    try {
      // 1. 应用速率限制
      if (finalConfig.enableRateLimit) {
        // 检查自定义速率限制
        if (finalConfig.customRateLimits) {
          for (const [pattern, middleware] of Object.entries(finalConfig.customRateLimits)) {
            if (matchPath(pathname, pattern)) {
              const result = await middleware(request);
              if (result) return result;
            }
          }
        }
        
        // 应用默认速率限制
        const rateLimitMiddleware = getRateLimitMiddleware(pathname);
        if (rateLimitMiddleware) {
          const result = await rateLimitMiddleware(request);
          if (result) return result;
        }
      }
      
      // 2. 应用CSRF保护（仅对API路径）
      if (finalConfig.enableCSRF && pathname.startsWith('/api/')) {
        const result = await csrfMiddleware(request);
        if (result) return result;
      }
      
      // 3. 添加安全头部
      const response = NextResponse.next();
      
      // 安全头部
      response.headers.set('X-Content-Type-Options', 'nosniff');
      response.headers.set('X-Frame-Options', 'DENY');
      response.headers.set('X-XSS-Protection', '1; mode=block');
      response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
      
      // 仅在HTTPS环境下设置HSTS
      if (request.nextUrl.protocol === 'https:') {
        response.headers.set(
          'Strict-Transport-Security',
          'max-age=31536000; includeSubDomains; preload'
        );
      }
      
      return response;
      
    } catch (error) {
      console.error('Security middleware error:', error);
      
      // 发生错误时返回通用错误响应
      return NextResponse.json(
        { error: 'Security check failed' },
        { status: 500 }
      );
    }
  };
}

/**
 * 默认安全中间件实例
 */
export const securityMiddleware = createSecurityMiddleware();

/**
 * 仅CSRF保护的中间件
 */
export const csrfOnlyMiddleware = createSecurityMiddleware({
  enableCSRF: true,
  enableRateLimit: false,
});

/**
 * 仅速率限制的中间件
 */
export const rateLimitOnlyMiddleware = createSecurityMiddleware({
  enableCSRF: false,
  enableRateLimit: true,
});

/**
 * 用于开发环境的宽松安全中间件
 */
export const developmentSecurityMiddleware = createSecurityMiddleware({
  enableCSRF: false, // 开发环境可能不需要CSRF保护
  enableRateLimit: true, // 但仍然需要速率限制
});