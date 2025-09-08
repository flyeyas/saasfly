import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@saasfly/db';
import { hashPassword, checkPasswordStrength } from '../lib/password';
import { generateVerificationCode, verifyVerificationCode } from '../lib/verification';
import { createId } from '@paralleldrive/cuid2';

/**
 * 注册请求验证模式
 */
const registerSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(8, '密码至少需要8个字符'),
  name: z.string().min(1, '请输入姓名').max(50, '姓名不能超过50个字符'),
  verificationCode: z.string().length(6, '验证码必须是6位数字'),
});

/**
 * 发送注册验证码
 */
export async function sendRegisterVerificationCode(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = z.object({ email: z.string().email() }).parse(body);

    // 检查邮箱是否已注册
    const existingUser = await db
      .selectFrom('users')
      .select('id')
      .where('email', '=', email)
      .executeTakeFirst();

    if (existingUser) {
      return NextResponse.json(
        { error: '该邮箱已被注册' },
        { status: 400 }
      );
    }

    // 生成并发送验证码
    const result = await generateVerificationCode(
      email,
      'EMAIL_VERIFICATION'
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
    console.error('发送注册验证码失败:', error);
    
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
 * 用户注册
 */
export async function registerUser(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, verificationCode } = registerSchema.parse(body);

    // 验证密码强度
    const passwordValidation = checkPasswordStrength(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { 
          error: '密码强度不足',
          errors: passwordValidation.errors,
          suggestions: passwordValidation.suggestions
        },
        { status: 400 }
      );
    }

    // 验证邮箱验证码
    const codeVerification = await verifyVerificationCode(
      email,
      verificationCode,
      'EMAIL_VERIFICATION'
    );

    if (!codeVerification.success) {
      return NextResponse.json(
        { error: codeVerification.error || '验证码无效' },
        { status: 400 }
      );
    }

    // 再次检查邮箱是否已注册（防止并发注册）
    const existingUser = await db
      .selectFrom('users')
      .select('id')
      .where('email', '=', email)
      .executeTakeFirst();

    if (existingUser) {
      return NextResponse.json(
        { error: '该邮箱已被注册' },
        { status: 400 }
      );
    }

    // 加密密码
    const hashedPassword = await hashPassword(password);

    // 创建用户
    const userId = createId();
    const now = new Date();

    await db
      .insertInto('users')
      .values({
        id: userId,
        email,
        name,
        password: hashedPassword,
        emailVerified: now, // 邮箱已验证
        createdAt: now,
        updatedAt: now,
      })
      .execute();

    // 清理已使用的验证码
    await db
      .deleteFrom('verification_codes')
      .where('email', '=', email)
      .where('type', '=', 'EMAIL_VERIFICATION')
      .execute();

    return NextResponse.json({
      success: true,
      message: '注册成功',
      user: {
        id: userId,
        email,
        name,
        emailVerified: true,
      },
    });
  } catch (error) {
    console.error('用户注册失败:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '请求参数无效', details: error.errors },
        { status: 400 }
      );
    }

    // 检查是否是数据库唯一约束错误
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === '23505') { // PostgreSQL unique violation
        return NextResponse.json(
          { error: '该邮箱已被注册' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}

/**
 * 检查邮箱是否可用
 */
export async function checkEmailAvailability(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: '请提供邮箱地址' },
        { status: 400 }
      );
    }

    // 验证邮箱格式
    const emailSchema = z.string().email();
    try {
      emailSchema.parse(email);
    } catch {
      return NextResponse.json(
        { error: '邮箱格式无效' },
        { status: 400 }
      );
    }

    // 检查邮箱是否已存在
    const existingUser = await db
      .selectFrom('users')
      .select('id')
      .where('email', '=', email)
      .executeTakeFirst();

    return NextResponse.json({
      available: !existingUser,
      message: existingUser ? '该邮箱已被注册' : '邮箱可用',
    });
  } catch (error) {
    console.error('检查邮箱可用性失败:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}