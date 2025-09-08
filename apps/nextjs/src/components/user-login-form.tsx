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

type Dictionary = Record<string, string>;

interface UserLoginFormProps extends React.HTMLAttributes<HTMLDivElement> {
  lang: string;
  dict: Dictionary;
}

const loginSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
  password: z.string().optional(),
  verificationCode: z.string().optional(),
}).refine((data) => {
  return data.password || data.verificationCode;
}, {
  message: "请输入密码或验证码",
  path: ["password"],
});

type FormData = z.infer<typeof loginSchema>;

export function UserLoginForm({
  className,
  lang,
  dict,
  ...props
}: UserLoginFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(loginSchema),
  });
  
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isCodeSending, setIsCodeSending] = React.useState<boolean>(false);
  const [codeSent, setCodeSent] = React.useState<boolean>(false);
  const [countdown, setCountdown] = React.useState<number>(0);
  const [loginMode, setLoginMode] = React.useState<'password' | 'code'>('password');
  
  const watchedEmail = watch("email");

  // 倒计时效果
  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // 发送登录验证码
  const sendLoginCode = async () => {
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
      const response = await fetch("/api/auth/login/send-code", {
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
      console.error("Send login code error:", error);
      toast({
        title: "发送失败",
        description: "网络错误，请稍后重试",
        variant: "destructive",
      });
    } finally {
      setIsCodeSending(false);
    }
  };

  // 提交登录
  async function onSubmit(data: FormData) {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          password: loginMode === 'password' ? data.password : undefined,
          verificationCode: loginMode === 'code' ? data.verificationCode : undefined,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        toast({
          title: "登录成功",
          description: "欢迎回来！正在跳转...",
        });
        setTimeout(() => {
          router.push(`/${lang}/dashboard`);
        }, 1500);
      } else {
        toast({
          title: "登录失败",
          description: result.error || "登录失败，请检查邮箱和密码",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "登录失败",
        description: "网络错误，请稍后重试",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

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
              disabled={isLoading}
              {...register("email")}
            />
            {errors?.email && (
              <p className="text-xs text-red-600">{errors.email.message}</p>
            )}
          </div>

          {/* 登录方式切换 */}
          <div className="flex space-x-2">
            <Button
              type="button"
              variant={loginMode === 'password' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setLoginMode('password')}
              disabled={isLoading}
            >
              密码登录
            </Button>
            <Button
              type="button"
              variant={loginMode === 'code' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setLoginMode('code')}
              disabled={isLoading}
            >
              验证码登录
            </Button>
          </div>

          {/* 密码登录 */}
          {loginMode === 'password' && (
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">密码</Label>
                <a
                  href={`/${lang}/password-reset`}
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  忘记密码？
                </a>
              </div>
              <Input
                id="password"
                placeholder="请输入密码"
                type="password"
                autoComplete="current-password"
                disabled={isLoading}
                {...register("password")}
              />
              {errors?.password && (
                <p className="text-xs text-red-600">{errors.password.message}</p>
              )}
            </div>
          )}

          {/* 验证码登录 */}
          {loginMode === 'code' && (
            <div className="grid gap-2">
              <Label htmlFor="verificationCode">验证码</Label>
              <div className="flex space-x-2">
                <Input
                  id="verificationCode"
                  placeholder="请输入验证码"
                  disabled={isLoading}
                  {...register("verificationCode")}
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={isCodeSending || countdown > 0 || !watchedEmail}
                  onClick={sendLoginCode}
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
          )}

          <Button disabled={isLoading} type="submit">
            {isLoading && (
              <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            登录
          </Button>
        </div>
      </form>
    </div>
  );
}