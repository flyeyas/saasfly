"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { cn } from "@saasfly/ui";
import { Button, buttonVariants } from "@saasfly/ui/button";
import * as Icons from "@saasfly/ui/icons";
import { Input } from "@saasfly/ui/input";
import { Label } from "@saasfly/ui/label";
import { toast } from "@saasfly/ui/use-toast";
// Progress component will be implemented inline

type Dictionary = Record<string, string>;

interface UserRegisterFormProps extends React.HTMLAttributes<HTMLDivElement> {
  lang: string;
  dict: Dictionary;
}

const registerSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
  password: z.string().min(8, "密码长度至少8位"),
  confirmPassword: z.string(),
  verificationCode: z.string().min(6, "验证码长度至少6位"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "两次输入的密码不一致",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof registerSchema>;

interface PasswordStrength {
  score: number;
  errors: string[];
  suggestions: string[];
}

export function UserRegisterForm({
  className,
  lang,
  dict,
  ...props
}: UserRegisterFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(registerSchema),
  });
  
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isCodeSending, setIsCodeSending] = React.useState<boolean>(false);
  const [codeSent, setCodeSent] = React.useState<boolean>(false);
  const [countdown, setCountdown] = React.useState<number>(0);
  const [passwordStrength, setPasswordStrength] = React.useState<PasswordStrength | null>(null);
  const [emailAvailable, setEmailAvailable] = React.useState<boolean | null>(null);
  const [checkingEmail, setCheckingEmail] = React.useState<boolean>(false);
  
  const watchedEmail = watch("email");
  const watchedPassword = watch("password");

  // 倒计时效果
  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // 检查邮箱可用性
  React.useEffect(() => {
    const checkEmail = async () => {
      if (!watchedEmail || !z.string().email().safeParse(watchedEmail).success) {
        setEmailAvailable(null);
        return;
      }

      setCheckingEmail(true);
      try {
        const response = await fetch(`/api/auth/register/check-email?email=${encodeURIComponent(watchedEmail)}`);
        const data = await response.json();
        setEmailAvailable(data.available);
      } catch (error) {
        console.error("Check email error:", error);
        setEmailAvailable(null);
      } finally {
        setCheckingEmail(false);
      }
    };

    const debounceTimer = setTimeout(checkEmail, 500);
    return () => clearTimeout(debounceTimer);
  }, [watchedEmail]);

  // 检查密码强度
  React.useEffect(() => {
    const checkPasswordStrength = async () => {
      if (!watchedPassword || watchedPassword.length < 1) {
        setPasswordStrength(null);
        return;
      }

      try {
        const response = await fetch("/api/auth/password/check-strength", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: watchedPassword }),
        });
        const data = await response.json();
        setPasswordStrength(data);
      } catch (error) {
        console.error("Check password strength error:", error);
      }
    };

    const debounceTimer = setTimeout(checkPasswordStrength, 300);
    return () => clearTimeout(debounceTimer);
  }, [watchedPassword]);

  // 发送验证码
  const sendVerificationCode = async () => {
    if (!watchedEmail || !emailAvailable) {
      toast({
        title: "错误",
        description: "请先输入有效且可用的邮箱地址",
        variant: "destructive",
      });
      return;
    }

    setIsCodeSending(true);
    try {
      const response = await fetch("/api/auth/register/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: watchedEmail }),
      });

      const data = await response.json();
      if (response.ok) {
        setCodeSent(true);
        setCountdown(60);
        toast({
          title: "验证码已发送",
          description: "请查收邮箱中的验证码",
        });
      } else {
        toast({
          title: "发送失败",
          description: data.error || "验证码发送失败，请稍后重试",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Send code error:", error);
      toast({
        title: "发送失败",
        description: "网络错误，请稍后重试",
        variant: "destructive",
      });
    } finally {
      setIsCodeSending(false);
    }
  };

  // 提交注册
  async function onSubmit(data: FormData) {
    if (!emailAvailable) {
      toast({
        title: "注册失败",
        description: "邮箱不可用，请更换邮箱",
        variant: "destructive",
      });
      return;
    }

    if (passwordStrength && passwordStrength.score < 3) {
      toast({
        title: "密码强度不足",
        description: "请设置更强的密码",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          verificationCode: data.verificationCode,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        toast({
          title: "注册成功",
          description: "账户创建成功，正在跳转到登录页面",
        });
        setTimeout(() => {
          router.push(`/${lang}/login`);
        }, 1500);
      } else {
        toast({
          title: "注册失败",
          description: result.error || "注册失败，请稍后重试",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Register error:", error);
      toast({
        title: "注册失败",
        description: "网络错误，请稍后重试",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const getPasswordStrengthColor = (score: number) => {
    if (score < 2) return "bg-red-500";
    if (score < 3) return "bg-yellow-500";
    if (score < 4) return "bg-blue-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = (score: number) => {
    if (score < 2) return "弱";
    if (score < 3) return "一般";
    if (score < 4) return "良好";
    return "强";
  };

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-4">
          {/* 邮箱输入 */}
          <div className="grid gap-2">
            <Label htmlFor="email">邮箱地址</Label>
            <div className="relative">
              <Input
                id="email"
                placeholder="name@example.com"
                type="email"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
                disabled={isLoading}
                {...register("email")}
              />
              {checkingEmail && (
                <Icons.Spinner className="absolute right-3 top-3 h-4 w-4 animate-spin" />
              )}
              {!checkingEmail && emailAvailable === true && (
                <Icons.Check className="absolute right-3 top-3 h-4 w-4 text-green-500" />
              )}
              {!checkingEmail && emailAvailable === false && (
                <Icons.X className="absolute right-3 top-3 h-4 w-4 text-red-500" />
              )}
            </div>
            {errors?.email && (
              <p className="text-xs text-red-600">{errors.email.message}</p>
            )}
            {emailAvailable === false && (
              <p className="text-xs text-red-600">该邮箱已被注册</p>
            )}
          </div>

          {/* 密码输入 */}
          <div className="grid gap-2">
            <Label htmlFor="password">密码</Label>
            <Input
              id="password"
              placeholder="请输入密码"
              type="password"
              autoComplete="new-password"
              disabled={isLoading}
              {...register("password")}
            />
            {errors?.password && (
              <p className="text-xs text-red-600">{errors.password.message}</p>
            )}
            
            {/* 密码强度指示器 */}
            {passwordStrength && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">密码强度</span>
                  <span className={cn(
                    "text-xs font-medium",
                    passwordStrength.score < 2 ? "text-red-500" :
                    passwordStrength.score < 3 ? "text-yellow-500" :
                    passwordStrength.score < 4 ? "text-blue-500" : "text-green-500"
                  )}>
                    {getPasswordStrengthText(passwordStrength.score)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all duration-300" 
                    style={{ 
                      width: `${(passwordStrength.score + 1) * 20}%`,
                      backgroundColor: passwordStrength.score < 2 ? '#ef4444' : 
                                     passwordStrength.score < 3 ? '#f59e0b' : 
                                     passwordStrength.score < 4 ? '#3b82f6' : '#10b981'
                    }}
                  />
                </div>
                {passwordStrength.errors.length > 0 && (
                  <ul className="text-xs text-red-600 space-y-1">
                    {passwordStrength.errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                )}
                {passwordStrength.suggestions.length > 0 && (
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {passwordStrength.suggestions.map((suggestion, index) => (
                      <li key={index}>• {suggestion}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* 确认密码 */}
          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">确认密码</Label>
            <Input
              id="confirmPassword"
              placeholder="请再次输入密码"
              type="password"
              autoComplete="new-password"
              disabled={isLoading}
              {...register("confirmPassword")}
            />
            {errors?.confirmPassword && (
              <p className="text-xs text-red-600">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* 验证码 */}
          <div className="grid gap-2">
            <Label htmlFor="verificationCode">邮箱验证码</Label>
            <div className="flex gap-2">
              <Input
                id="verificationCode"
                placeholder="请输入验证码"
                disabled={isLoading}
                {...register("verificationCode")}
              />
              <Button
                type="button"
                variant="outline"
                disabled={isCodeSending || countdown > 0 || !emailAvailable || isLoading}
                onClick={sendVerificationCode}
                className="whitespace-nowrap"
              >
                {isCodeSending && (
                  <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />
                )}
                {countdown > 0 ? `${countdown}s` : codeSent ? "重新发送" : "发送验证码"}
              </Button>
            </div>
            {errors?.verificationCode && (
              <p className="text-xs text-red-600">{errors.verificationCode.message}</p>
            )}
          </div>

          {/* 提交按钮 */}
          <Button 
            type="submit" 
            disabled={isLoading || !emailAvailable || (passwordStrength && passwordStrength.score < 3)}
            className="w-full"
          >
            {isLoading && (
              <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            创建账户
          </Button>
        </div>
      </form>
    </div>
  );
}