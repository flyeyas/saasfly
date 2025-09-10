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
  email: z.string().email("Please enter a valid email address"),
  password: z.string().optional(),
  verificationCode: z.string().optional(),
}).refine((data) => {
  return data.password || data.verificationCode;
}, {
  message: "Please enter password or verification code",
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

  // Countdown effect
  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Send login verification code
  const sendLoginCode = async () => {
    if (!watchedEmail || !z.string().email().safeParse(watchedEmail).success) {
      toast({
        title: "Error",
        description: "Please enter a valid email address first",
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
          title: "Verification code sent",
        description: "Please check your email for the verification code",
        });
      } else {
        toast({
          title: "Send failed",
        description: data.error || "Failed to send verification code, please try again later",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Send login code error:", error);
      toast({
        title: "Send failed",
      description: "Network error, please try again later",
        variant: "destructive",
      });
    } finally {
      setIsCodeSending(false);
    }
  };

  // Submit login
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
          title: "Login successful",
        description: "Welcome back! Redirecting...",
        });
        setTimeout(() => {
          router.push(`/${lang}/dashboard`);
        }, 1500);
      } else {
        toast({
          title: "Login failed",
        description: result.error || "Login failed, please check your email and password",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
      description: "Network error, please try again later",
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
          {/* Email input */}
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
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

          {/* Login method toggle */}
          <div className="flex space-x-2">
            <Button
              type="button"
              variant={loginMode === 'password' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setLoginMode('password')}
              disabled={isLoading}
            >
              Password Login
            </Button>
            <Button
              type="button"
              variant={loginMode === 'code' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setLoginMode('code')}
              disabled={isLoading}
            >
              Code Login
            </Button>
          </div>

          {/* Password login */}
          {loginMode === 'password' && (
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <a
                  href={`/${lang}/password-reset`}
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Forgot password?
                </a>
              </div>
              <Input
                id="password"
                placeholder="Enter password"
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

          {/* Verification code login */}
          {loginMode === 'code' && (
            <div className="grid gap-2">
              <Label htmlFor="verificationCode">Verification Code</Label>
              <div className="flex space-x-2">
                <Input
                  id="verificationCode"
                  placeholder="Enter verification code"
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
                  {countdown > 0 ? `${countdown}s` : codeSent ? "Resend" : "Send Code"}
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
            Login
          </Button>
        </div>
      </form>
    </div>
  );
}