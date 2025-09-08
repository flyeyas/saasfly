import { NextRequest, NextResponse } from "next/server";
import * as z from "zod";

const checkStrengthSchema = z.object({
  password: z.string(),
});

interface PasswordStrength {
  score: number;
  errors: string[];
  suggestions: string[];
}

function checkPasswordStrength(password: string): PasswordStrength {
  let score = 0;
  const errors: string[] = [];
  const suggestions: string[] = [];

  // 长度检查
  if (password.length < 8) {
    errors.push("密码长度至少需要8位");
    suggestions.push("增加密码长度");
  } else if (password.length >= 8) {
    score += 1;
  }

  // 包含小写字母
  if (!/[a-z]/.test(password)) {
    errors.push("缺少小写字母");
    suggestions.push("添加小写字母");
  } else {
    score += 1;
  }

  // 包含大写字母
  if (!/[A-Z]/.test(password)) {
    errors.push("缺少大写字母");
    suggestions.push("添加大写字母");
  } else {
    score += 1;
  }

  // 包含数字
  if (!/\d/.test(password)) {
    errors.push("缺少数字");
    suggestions.push("添加数字");
  } else {
    score += 1;
  }

  // 包含特殊字符
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("缺少特殊字符");
    suggestions.push("添加特殊字符如 !@#$%^&*");
  } else {
    score += 1;
  }

  // 长度奖励
  if (password.length >= 12) {
    score += 1;
  }

  // 确保分数在0-4之间
  score = Math.min(4, Math.max(0, score - 1));

  return {
    score,
    errors,
    suggestions,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { password } = checkStrengthSchema.parse(body);

    const strength = checkPasswordStrength(password);

    return NextResponse.json(strength);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "请求参数无效" },
        { status: 400 }
      );
    }

    console.error("Password strength check error:", error);
    return NextResponse.json(
      { error: "密码强度检查失败" },
      { status: 500 }
    );
  }
}