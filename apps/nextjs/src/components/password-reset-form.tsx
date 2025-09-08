"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { cn } from "@saasfly/ui";
import { Button } from "@saasfly/ui/button";
import * as Icons from "@saasfly/ui/icons";
import { Input } from "@saasfly/ui/input";
import { Label } from "@saasfly/ui/label";
import { toast } from "@saasfly/ui/use-toast";

type Dictionary = Record<string, string>;

interface PasswordResetFormProps extends React.HTMLAttributes<HTMLDivElement> {
  lang: string;
  dict: Dictionary;
}

const resetSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
  verificationCode: z.string().min(6, "验证码长度为6位"),
  newPassword: z.string().min(8, "密码长度至少8位"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "两次输入的密码不一致",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof resetSchema>;

interface PasswordStrength {
  score: number;
  errors: string[];
  suggestions: string[];
}

export function PasswordResetForm({
  className,
  lang,
  dict,
  ...props
}: PasswordResetFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(resetSchema),
  });
  
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isCodeSending, setIsCodeSending] = React.useState<boolean>(false);
  const [codeSent, setCodeSent] = React.useState<boolean>(false);
  const [countdown, setCountdown] = React.useState<number>(0);
  const [step, setStep] = React.useState<'email' | 'reset'>('email');
  const [passwordStrength, setPasswordStrength] = React.useState<PasswordStrength | null>(null);
  
  const watchedEmail = watch("email");
  const watchedPassword = watch("newPassword");

  // 倒计时效果
  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // 密码强度检查
  React.useEffect(() => {
    const checkPasswordStrength = async () => {
      if (!watchedPassword || watchedPassword.length < 3) {
        setPasswordStrength(null);
        return;
      }

      try {
        const response = await fetch("/api/auth/password/check-strength", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: watchedPassword }),
        });

        if (response.ok) {
          const strength = await response.json();
          setPasswordStrength(strength);
        }
      } catch (error) {
        console.error("Password strength check error:", error);
      }
    };

    const debounceTimer = setTimeout(checkPasswordStrength, 300);
    return () => clearTimeout(debounceTimer);
  }, [watchedPassword]);

  // 发送重置验证码
  const sendResetCode = async () => {
    if (!watchedEmail || !z.string().email().safeParse(watchedEmail).success) {
      toast({
        title: "错误",
        description: "请先输入有效的邮箱地址",
        variant: "destructive",
      });
      return;
    }

    setIsCodeSending(true);
    try {
      const response = await fetch("/api/auth/password-reset/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: watchedEmail }),
      });

      const data = await response.json();
      if (response.ok) {
        setCodeSent(true);
        setCountdown(60);
        setStep('reset');
        toast({
          title: "验证码已发送",
          description: "请查收邮箱中的重置验证码",
        });
      } else {
        toast({
          title: "发送失败",
          description: data.error || "验证码发送失败，请稍后重试",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Send reset code error:", error);
      toast({
        title: "发送失败",
        description: "网络错误，请稍后重试",
        variant: "destructive",
      });
    } finally {
      setIsCodeSending(false);
    }
  };

  // 提交密码重置
  async function onSubmit(data: FormData) {
    if (step === 'email') {
      await sendResetCode();
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          verificationCode: data.verificationCode,
          newPassword: data.newPassword,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        toast({
          title: "密码重置成功",
          description: "密码已重置，请使用新密码登录",
        });
        setTimeout(() => {
          router.push(`/${lang}/login`);
        }, 1500);
      } else {
        toast({
          title: "重置失败",
          description: result.error || "密码重置失败，请检查验证码",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Password reset error:", error);
      toast({
        title: "重置失败",
        description: "网络错误，请稍后重试",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const getPasswordStrengthColor = (score: number) => {
    switch (score) {
      case 0:
      case 1:
        return "bg-red-500";
      case 2:
        return "bg-yellow-500";
      case 3:
        return "bg-blue-500";
      case 4:
        return "bg-green-500";
      default:
        return "bg-gray-300";
    }
  };

  const getPasswordStrengthText = (score: number) => {
    switch (score) {
      case 0:
      case 1:
        return "弱";
      case 2:
        return "中等";
      case 3:
        return "强";
      case 4:
        return "很强";
      default:
        return "";
    }
  };

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-4">
          {/* 邮箱输入 */}
          <div className="grid gap-2">
            <Label htmlFor="email">邮箱</Label>
            <Input
              id="email"
              placeholder="name@example.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading || step === 'reset'}
              {...register("email")}
            />
            {errors?.email && (
              <p className="text-xs text-red-600">{errors.email.message}</p>
            )}
          </div>

          {step === 'email' && (
            <Button disabled={isCodeSending || !watchedEmail} type="submit">
              {isCodeSending && (
                <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              发送重置验证码
            </Button>
          )}

          {step === 'reset' && (
            <>
              {/* 验证码输入 */}
              <div className="grid gap-2">
                <Label htmlFor="verificationCode">验证码</Label>
                <div className="flex space-x-2">
                  <Input
                    id="verificationCode"
                    placeholder="请输入6位验证码"
                    disabled={isLoading}
                    {...register("verificationCode")}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isCodeSending || countdown > 0}
                    onClick={sendResetCode}
                  >
                    {isCodeSending && (
                      <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {countdown > 0 ? `${countdown}s` : "重新发送"}
                  </Button>
                </div>
                {errors?.verificationCode && (
                  <p className="text-xs text-red-600">{errors.verificationCode.message}</p>
                )}
              </div>

              {/* 新密码输入 */}
              <div className="grid gap-2">
                <Label htmlFor="newPassword">新密码</Label>
                <Input
                  id="newPassword"
                  placeholder="请输入新密码"
                  type="password"
                  disabled={isLoading}
                  {...register("newPassword")}
                />
                {errors?.newPassword && (
                  <p className="text-xs text-red-600">{errors.newPassword.message}</p>
                )}
                
                {/* 密码强度指示器 */}
                {passwordStrength && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            getPasswordStrengthColor(passwordStrength.score)
                          }`}
                          style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">
                        {getPasswordStrengthText(passwordStrength.score)}
                      </span>
                    </div>
                    {passwordStrength.errors.length > 0 && (
                      <div className="text-xs text-red-600">
                        {passwordStrength.errors.join("、")}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 确认密码输入 */}
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">确认新密码</Label>
                <Input
                  id="confirmPassword"
                  placeholder="请再次输入新密码"
                  type="password"
                  disabled={isLoading}
                  {...register("confirmPassword")}
                />
                {errors?.confirmPassword && (
                  <p className="text-xs text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>

              <Button disabled={isLoading} type="submit">
                {isLoading && (
                  <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />
                )}
                重置密码
              </Button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}