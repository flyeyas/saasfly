import { NextRequest, NextResponse } from 'next/server';

/**
 * 速率限制配置
 */
interface RateLimitConfig {
  windowMs: number; // 时间窗口（毫秒）
  maxAttempts: number; // 最大尝试次数
  blockDurationMs: number; // 封锁时长（毫秒）
  keyGenerator?: (request: NextRequest) => string; // 自定义key生成器
}

/**
 * 默认配置
 */
const DEFAULT_CONFIG: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15分钟
  maxAttempts: 5, // 5次尝试
  blockDurationMs: 30 * 60 * 1000, // 封锁30分钟
};

/**
 * 存储尝试记录的接口
 */
interface AttemptRecord {
  count: number;
  firstAttempt: number;
  lastAttempt: number;
  blocked: boolean;
  blockExpires?: number;
}

/**
 * 内存存储（生产环境建议使用Redis）
 */
class MemoryStore {
  private store = new Map<string, AttemptRecord>();
  
  get(key: string): AttemptRecord | undefined {
    const record = this.store.get(key);
    if (!record) return undefined;
    
    // 检查记录是否过期
    const now = Date.now();
    if (record.blocked && record.blockExpires && now > record.blockExpires) {
      // 解除封锁
      record.blocked = false;
      record.blockExpires = undefined;
      record.count = 0;
    }
    
    return record;
  }
  
  set(key: string, record: AttemptRecord): void {
    this.store.set(key, record);
  }
  
  delete(key: string): void {
    this.store.delete(key);
  }
  
  // 清理过期记录
  cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.store.entries()) {
      if (record.blocked && record.blockExpires && now > record.blockExpires) {
        this.store.delete(key);
      }
    }
  }
}

const store = new MemoryStore();

// 定期清理过期记录
setInterval(() => {
  store.cleanup();
}, 5 * 60 * 1000); // 每5分钟清理一次

/**
 * 获取客户端标识
 */
function getClientKey(request: NextRequest, keyGenerator?: (req: NextRequest) => string): string {
  if (keyGenerator) {
    return keyGenerator(request);
  }
  
  // 优先使用真实IP
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0] || realIp || request.ip || 'unknown';
  
  return `rate_limit:${ip}`;
}

/**
 * 创建速率限制中间件
 */
export function createRateLimit(config: Partial<RateLimitConfig> = {}) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  return async (request: NextRequest) => {
    const key = getClientKey(request, finalConfig.keyGenerator);
    const now = Date.now();
    
    let record = store.get(key);
    
    if (!record) {
      // 首次访问
      record = {
        count: 1,
        firstAttempt: now,
        lastAttempt: now,
        blocked: false,
      };
    } else {
      // 检查是否被封锁
      if (record.blocked && record.blockExpires && now < record.blockExpires) {
        const remainingTime = Math.ceil((record.blockExpires - now) / 1000);
        return NextResponse.json(
          {
            error: 'Too many attempts. Please try again later.',
            retryAfter: remainingTime,
          },
          {
            status: 429,
            headers: {
              'Retry-After': remainingTime.toString(),
              'X-RateLimit-Limit': finalConfig.maxAttempts.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': new Date(record.blockExpires).toISOString(),
            },
          }
        );
      }
      
      // 检查时间窗口
      if (now - record.firstAttempt > finalConfig.windowMs) {
        // 重置计数器
        record.count = 1;
        record.firstAttempt = now;
        record.blocked = false;
      } else {
        // 增加计数
        record.count++;
      }
      
      record.lastAttempt = now;
      
      // 检查是否超过限制
      if (record.count > finalConfig.maxAttempts) {
        record.blocked = true;
        record.blockExpires = now + finalConfig.blockDurationMs;
        
        store.set(key, record);
        
        const remainingTime = Math.ceil(finalConfig.blockDurationMs / 1000);
        return NextResponse.json(
          {
            error: 'Too many attempts. Account temporarily blocked.',
            retryAfter: remainingTime,
          },
          {
            status: 429,
            headers: {
              'Retry-After': remainingTime.toString(),
              'X-RateLimit-Limit': finalConfig.maxAttempts.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': new Date(record.blockExpires).toISOString(),
            },
          }
        );
      }
    }
    
    store.set(key, record);
    
    // 添加速率限制头部
    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', finalConfig.maxAttempts.toString());
    response.headers.set('X-RateLimit-Remaining', (finalConfig.maxAttempts - record.count).toString());
    response.headers.set('X-RateLimit-Reset', new Date(record.firstAttempt + finalConfig.windowMs).toISOString());
    
    return response;
  };
}

/**
 * 登录专用速率限制
 */
export const loginRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟窗口
  maxAttempts: 5, // 最多5次尝试
  blockDurationMs: 30 * 60 * 1000, // 封锁30分钟
  keyGenerator: (request) => {
    // 基于IP和用户邮箱的组合key
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
              request.headers.get('x-real-ip') || 
              request.ip || 'unknown';
    return `login_rate_limit:${ip}`;
  },
});

/**
 * 注册专用速率限制
 */
export const registerRateLimit = createRateLimit({
  windowMs: 60 * 60 * 1000, // 1小时窗口
  maxAttempts: 3, // 最多3次注册尝试
  blockDurationMs: 2 * 60 * 60 * 1000, // 封锁2小时
});

/**
 * 验证码发送速率限制
 */
export const verificationCodeRateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1分钟窗口
  maxAttempts: 1, // 1分钟内只能发送1次
  blockDurationMs: 60 * 1000, // 封锁1分钟
});

/**
 * 密码重置速率限制
 */
export const passwordResetRateLimit = createRateLimit({
  windowMs: 60 * 60 * 1000, // 1小时窗口
  maxAttempts: 3, // 最多3次重置尝试
  blockDurationMs: 60 * 60 * 1000, // 封锁1小时
});