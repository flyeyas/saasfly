import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@saasfly/db';
import { verifyPassword } from '../lib/password';
import { generateVerificationCode, verifyVerificationCode } from '../lib/verification';
import { createId } from '@paralleldrive/cuid2';

/**
 * 登录请求验证模式
 */
const loginSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(1, '请输入密码'),
  verificationCode: z.string().optional(),
  rememberMe: z.boolean().optional().default(false),
});

/**
 * 登录失败限制配置
 */
const LOGIN_LIMITS = {
  maxAttempts: 5, // 最大失败次数
  lockoutDuration: 30 * 60 * 1000, // 锁定时长（30分钟）
  requireVerificationAfter: 3, // 失败3次后需要验证码
} as const;

/**
 * 检查登录失败次数和锁定状态
 */
async function checkLoginAttempts(email: string) {
  const user = await db
    .selectFrom('users')
    .select(['id', 'loginAttempts', 'lockedUntil'])
    .where('email', '=', email)
    .executeTakeFirst();

  if (!user) {
    return { canAttempt: false, error: '用户不存在' };
  }

  const now = new Date();
  const lockedUntil = user.lockedUntil;

  // 检查是否被锁定
  if (lockedUntil && lockedUntil > now) {
    const remainingMinutes = Math.ceil((lockedUntil.getTime() - now.getTime()) / (1000 * 60));
    return {
      canAttempt: false,
      error: `账户已被锁定，请在 ${remainingMinutes} 分钟后重试`,
      isLocked: true,
    };
  }

  // 检查是否需要验证码
  const needsVerification = (user.loginAttempts || 0) >= LOGIN_LIMITS.requireVerificationAfter;

  return {
    canAttempt: true,
    user,
    needsVerification,
    failedAttempts: user.loginAttempts || 0,
  };
}

/**
 * 更新登录失败次数
 */
async function updateLoginAttempts(userId: string, failed: boolean) {
  const now = new Date();

  if (failed) {
    // 增加失败次数
    const user = await db
      .selectFrom('users')
      .select('loginAttempts')
      .where('id', '=', userId)
      .executeTakeFirst();

    const newAttempts = (user?.loginAttempts || 0) + 1;
    const shouldLock = newAttempts >= LOGIN_LIMITS.maxAttempts;

    await db
      .updateTable('users')
      .set({
        loginAttempts: newAttempts,
        lockedUntil: shouldLock 
          ? new Date(now.getTime() + LOGIN_LIMITS.lockoutDuration)
          : null,
        updatedAt: now,
      })
      .where('id', '=', userId)
      .execute();

    return { newAttempts, isLocked: shouldLock };
  } else {
    // 登录成功，重置失败次数
    await db
      .updateTable('users')
      .set({
        loginAttempts: 0,
        lockedUntil: null,
        updatedAt: now,
      })
      .where('id', '=', userId)
      .execute();

    return { newAttempts: 0, isLocked: false };
  }
}

/**
 * 发送登录验证码
 */
export async function sendLoginVerificationCode(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = z.object({ email: z.string().email() }).parse(body);

    // 检查用户是否存在
    const user = await db
      .selectFrom('users')
      .select(['id', 'loginAttempts'])
      .where('email', '=', email)
      .executeTakeFirst();

    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }

    // 检查是否需要验证码（失败次数达到阈值）
    if ((user.loginAttempts || 0) < LOGIN_LIMITS.requireVerificationAfter) {
      return NextResponse.json(
        { error: '当前不需要验证码' },
        { status: 400 }
      );
    }

    // 生成并发送验证码
    const result = await generateVerificationCode(
      email,
      'LOGIN_VERIFICATION',
      user.id
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || '发送验证码失败' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '验证码已发送到您的邮箱',
      expiresAt: result.expiresAt,
    });
  } catch (error) {
    console.error('发送登录验证码失败:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '请求参数无效', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}

/**
 * 用户登录
 */
export async function loginUser(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, verificationCode, rememberMe } = loginSchema.parse(body);

    // 检查登录限制
    const attemptCheck = await checkLoginAttempts(email);
    if (!attemptCheck.canAttempt) {
      return NextResponse.json(
        { 
          error: attemptCheck.error,
          isLocked: attemptCheck.isLocked || false,
        },
        { status: 400 }
      );
    }

    const { user, needsVerification, failedAttempts } = attemptCheck;

    // 如果需要验证码但未提供
    if (needsVerification && !verificationCode) {
      return NextResponse.json(
        { 
          error: '需要验证码',
          needsVerification: true,
          failedAttempts,
        },
        { status: 400 }
      );
    }

    // 获取用户完整信息
    const fullUser = await db
      .selectFrom('users')
      .select(['id', 'email', 'name', 'password', 'emailVerified'])
      .where('email', '=', email)
      .executeTakeFirst();

    if (!fullUser || !fullUser.password) {
      await updateLoginAttempts(user!.id, true);
      return NextResponse.json(
        { error: '邮箱或密码错误' },
        { status: 401 }
      );
    }

    // 验证密码
    const isPasswordValid = await verifyPassword(password, fullUser.password);
    if (!isPasswordValid) {
      const { newAttempts, isLocked } = await updateLoginAttempts(fullUser.id, true);
      
      let errorMessage = '邮箱或密码错误';
      if (isLocked) {
        errorMessage = '登录失败次数过多，账户已被锁定30分钟';
      } else if (newAttempts >= LOGIN_LIMITS.requireVerificationAfter) {
        errorMessage = '登录失败次数过多，下次登录需要验证码';
      }

      return NextResponse.json(
        { 
          error: errorMessage,
          failedAttempts: newAttempts,
          needsVerification: newAttempts >= LOGIN_LIMITS.requireVerificationAfter,
          isLocked,
        },
        { status: 401 }
      );
    }

    // 如果需要验证码，验证验证码
    if (needsVerification && verificationCode) {
      const codeVerification = await verifyVerificationCode(
        email,
        verificationCode,
        'LOGIN_VERIFICATION'
      );

      if (!codeVerification.success) {
        return NextResponse.json(
          { error: codeVerification.error || '验证码无效' },
          { status: 400 }
        );
      }
    }

    // 登录成功，重置失败次数
    await updateLoginAttempts(fullUser.id, false);

    // 清理登录验证码
    if (needsVerification) {
      await db
        .deleteFrom('verification_codes')
        .where('email', '=', email)
        .where('type', '=', 'LOGIN_VERIFICATION')
        .execute();
    }

    // 返回用户信息（不包含密码）
    const userResponse = {
      id: fullUser.id,
      email: fullUser.email,
      name: fullUser.name,
      emailVerified: !!fullUser.emailVerified,
    };

    return NextResponse.json({
      success: true,
      message: '登录成功',
      user: userResponse,
      rememberMe,
    });
  } catch (error) {
    console.error('用户登录失败:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '请求参数无效', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}

/**
 * 检查登录状态
 */
export async function checkLoginStatus(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: '请提供邮箱地址' },
        { status: 400 }
      );
    }

    const attemptCheck = await checkLoginAttempts(email);
    
    return NextResponse.json({
      canAttempt: attemptCheck.canAttempt,
      needsVerification: attemptCheck.needsVerification || false,
      failedAttempts: attemptCheck.failedAttempts || 0,
      isLocked: attemptCheck.isLocked || false,
      error: attemptCheck.error,
    });
  } catch (error) {
    console.error('检查登录状态失败:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}