import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@saasfly/db';
import { generateVerificationCode, verifyVerificationCode } from '../lib/verification';
import { sendVerificationEmail } from '../lib/email';
import { hashPassword } from '../lib/password';

// 发送重置验证码请求验证
const sendResetCodeSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
});

// 重置密码请求验证
const resetPasswordSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  code: z.string().min(6, '验证码长度至少6位'),
  newPassword: z.string().min(8, '密码长度至少8位'),
});

// 发送密码重置验证码
export async function sendPasswordResetCode(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = sendResetCodeSchema.parse(body);

    // 检查用户是否存在
    const user = await db
      .selectFrom('users')
      .select(['id', 'email'])
      .where('email', '=', email)
      .executeTakeFirst();

    if (!user) {
      return NextResponse.json(
        { error: '该邮箱未注册' },
        { status: 404 }
      );
    }

    // 生成验证码
    const result = await generateVerificationCode(
      email,
      'PASSWORD_RESET',
      user.id
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || '验证码生成失败' },
        { status: 400 }
      );
    }

    // 发送邮件
    if (!result.code) {
      return NextResponse.json(
        { error: '验证码生成失败' },
        { status: 500 }
      );
    }

    const emailResult = await sendVerificationEmail(
      email,
      result.code,
      'reset_password'
    );

    return NextResponse.json({
      success: true,
      message: '验证码已发送到您的邮箱',
      emailSent: emailResult,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || '验证失败' },
        { status: 400 }
      );
    }

    console.error('Send password reset code error:', error);
    return NextResponse.json(
      { error: '发送验证码失败，请稍后重试' },
      { status: 500 }
    );
  }
}

// 重置密码
export async function resetPassword(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, code, newPassword } = resetPasswordSchema.parse(body);

    // 验证验证码
    const verifyResult = await verifyVerificationCode(
      email,
      code,
      'PASSWORD_RESET'
    );

    if (!verifyResult.success) {
      return NextResponse.json(
        { error: verifyResult.error || '验证码验证失败' },
        { status: 400 }
      );
    }

    // 检查用户是否存在
    const user = await db
      .selectFrom('users')
      .select(['id'])
      .where('email', '=', email)
      .executeTakeFirst();

    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }

    // 加密新密码
    const hashedPassword = await hashPassword(newPassword);

    // 更新密码并重置登录失败次数

    await db
      .updateTable('users')
      .set({
        password: hashedPassword,
        loginAttempts: 0,
        lockedUntil: null,
        updatedAt: new Date(),
      })
      .where('id', '=', user.id)
      .execute();

    return NextResponse.json({
      success: true,
      message: '密码重置成功',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || '验证失败' },
        { status: 400 }
      );
    }

    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: '密码重置失败，请稍后重试' },
      { status: 500 }
    );
  }
}

// 验证重置验证码（不重置密码，仅验证）
export async function verifyResetCode(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, code } = z.object({
      email: z.string().email(),
      code: z.string().min(6),
    }).parse(body);

    const result = await verifyVerificationCode(
      email,
      code,
      'PASSWORD_RESET'
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || '验证失败' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '验证码验证成功',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || '验证失败' },
        { status: 400 }
      );
    }

    console.error('Verify reset code error:', error);
    return NextResponse.json(
      { error: '验证失败，请稍后重试' },
      { status: 500 }
    );
  }
}