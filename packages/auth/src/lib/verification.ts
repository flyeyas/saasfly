import { db } from '@saasfly/db';
import { VerificationCodeType } from '@saasfly/db';
import crypto from 'crypto';
import { createId } from '@paralleldrive/cuid2';
import { sendVerificationEmail } from './email';

/**
 * 验证码配置
 */
export const VERIFICATION_CONFIG = {
  // 验证码长度
  codeLength: 6,
  // 验证码有效期（分钟）
  expirationMinutes: {
    EMAIL_VERIFICATION: 30,
    PASSWORD_RESET: 15,
    LOGIN_VERIFICATION: 10,
  },
  // 发送频率限制（秒）
  sendCooldown: 60,
  // 每日最大发送次数
  maxDailySends: 10,
} as const;

/**
 * 验证码生成结果
 */
export interface GenerateCodeResult {
  success: boolean;
  code?: string;
  expiresAt?: Date;
  error?: string;
}

/**
 * 验证码验证结果
 */
export interface VerifyCodeResult {
  success: boolean;
  error?: string;
  userId?: string;
}

/**
 * 生成随机验证码
 * @param length 验证码长度
 * @returns 验证码字符串
 */
function generateRandomCode(length: number): string {
  const digits = '0123456789';
  let code = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, digits.length);
    code += digits[randomIndex];
  }
  
  return code;
}

/**
 * 检查发送频率限制
 * @param email 邮箱地址
 * @param type 验证码类型
 * @returns 是否可以发送
 */
async function checkSendLimit(email: string, type: VerificationCodeType): Promise<{ canSend: boolean; error?: string }> {
  const now = new Date();
  const cooldownTime = new Date(now.getTime() - VERIFICATION_CONFIG.sendCooldown * 1000);
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // 检查冷却时间
  const recentCode = await db.selectFrom('verification_codes')
    .selectAll()
    .where('email', '=', email)
    .where('type', '=', type)
    .where('createdAt', '>=', cooldownTime)
    .orderBy('createdAt', 'desc')
    .executeTakeFirst();
  
  if (recentCode) {
    const remainingSeconds = Math.ceil((recentCode.createdAt.getTime() + VERIFICATION_CONFIG.sendCooldown * 1000 - now.getTime()) / 1000);
    return {
      canSend: false,
      error: `请等待 ${remainingSeconds} 秒后再试`,
    };
  }
  
  // 检查每日发送次数
  const dailyCountResult = await db.selectFrom('verification_codes')
    .select(db.fn.count('id').as('count'))
    .where('email', '=', email)
    .where('type', '=', type)
    .where('createdAt', '>=', dayStart)
    .executeTakeFirst();
  
  const dailyCount = Number(dailyCountResult?.count || 0);
  
  if (dailyCount >= VERIFICATION_CONFIG.maxDailySends) {
    return {
      canSend: false,
      error: '今日发送次数已达上限，请明天再试',
    };
  }
  
  return { canSend: true };
}

/**
 * 生成并保存验证码
 * @param email 邮箱地址
 * @param type 验证码类型
 * @param userId 用户ID（可选）
 * @returns 生成结果
 */
export async function generateVerificationCode(
  email: string,
  type: VerificationCodeType,
  userId?: string
): Promise<GenerateCodeResult> {
  try {
    // 检查发送限制
    const limitCheck = await checkSendLimit(email, type);
    if (!limitCheck.canSend) {
      return {
        success: false,
        error: limitCheck.error,
      };
    }
    
    // 生成验证码
    const code = generateRandomCode(VERIFICATION_CONFIG.codeLength);
    const expirationMinutes = VERIFICATION_CONFIG.expirationMinutes[type];
    const expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000);
    
    // 使验证码失效（同一邮箱同一类型的旧验证码）
    await db.updateTable('verification_codes')
      .set({ used: true })
      .where('email', '=', email)
      .where('type', '=', type)
      .where('used', '=', false)
      .where('expiresAt', '>', new Date())
      .execute();
    
    // 保存新验证码
    await db.insertInto('verification_codes')
      .values({
        id: createId(),
        email,
        code,
        type,
        expiresAt,
        userId,
      })
      .execute();
    
    // 发送验证码邮件
    const emailType = type === 'EMAIL_VERIFICATION' ? 'register' : 
                     type === 'LOGIN_VERIFICATION' ? 'login' : 'reset_password';
    
    const emailSent = await sendVerificationEmail(email, code, emailType);
    
    if (!emailSent) {
      console.warn(`验证码邮件发送失败: ${email}`);
    }
    
    return {
      success: true,
      code,
      expiresAt,
    };
  } catch (error) {
    console.error('生成验证码失败:', error);
    return {
      success: false,
      error: '生成验证码失败，请稍后重试',
    };
  }
}

/**
 * 验证验证码
 * @param email 邮箱地址
 * @param code 验证码
 * @param type 验证码类型
 * @returns 验证结果
 */
export async function verifyVerificationCode(
  email: string,
  code: string,
  type: VerificationCodeType
): Promise<VerifyCodeResult> {
  try {
    // 查找验证码
    const verificationCode = await db.selectFrom('verification_codes')
      .selectAll()
      .where('email', '=', email)
      .where('code', '=', code)
      .where('type', '=', type)
      .where('used', '=', false)
      .where('expiresAt', '>', new Date())
      .orderBy('createdAt', 'desc')
      .executeTakeFirst();
    
    if (!verificationCode) {
      return {
        success: false,
        error: '验证码无效或已过期',
      };
    }
    
    // 标记验证码为已使用
    await db.updateTable('verification_codes')
      .set({ used: true })
      .where('id', '=', verificationCode.id)
      .execute();
    
    return {
      success: true,
      userId: verificationCode.userId || undefined,
    };
  } catch (error) {
    console.error('验证验证码失败:', error);
    return {
      success: false,
      error: '验证失败，请稍后重试',
    };
  }
}

/**
 * 清理过期验证码
 * @returns 清理的数量
 */
export async function cleanupExpiredCodes(): Promise<number> {
  try {
    const expiredResult = await db.deleteFrom('verification_codes')
      .where('expiresAt', '<', new Date())
      .executeTakeFirst();
    
    const usedResult = await db.deleteFrom('verification_codes')
      .where('used', '=', true)
      .where('createdAt', '<', new Date(Date.now() - 24 * 60 * 60 * 1000))
      .executeTakeFirst();
    
    const result = {
      count: Number(expiredResult.numDeletedRows || 0) + Number(usedResult.numDeletedRows || 0)
    };
    
    return result.count;
  } catch (error) {
    console.error('清理过期验证码失败:', error);
    return 0;
  }
}

/**
 * 获取验证码剩余有效时间（秒）
 * @param email 邮箱地址
 * @param type 验证码类型
 * @returns 剩余时间（秒），-1表示无有效验证码
 */
export async function getCodeRemainingTime(
  email: string,
  type: VerificationCodeType
): Promise<number> {
  try {
    const verificationCode = await db.selectFrom('verification_codes')
      .selectAll()
      .where('email', '=', email)
      .where('type', '=', type)
      .where('used', '=', false)
      .where('expiresAt', '>', new Date())
      .orderBy('createdAt', 'desc')
      .executeTakeFirst();
    
    if (!verificationCode) {
      return -1;
    }
    
    const remainingMs = verificationCode.expiresAt.getTime() - Date.now();
    return Math.max(0, Math.floor(remainingMs / 1000));
  } catch (error) {
    console.error('获取验证码剩余时间失败:', error);
    return -1;
  }
}