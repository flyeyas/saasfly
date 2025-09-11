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

const createLoginSchema = (dict: Dictionary) => z.object({
  email: z.string().email(dict.login_form_email_validation),
  password: z.string().optional(),
  verificationCode: z.string().optional(),
}).refine((data) => {
  return data.password || data.verificationCode;
}, {
  message: dict.login_form_password_validation,
  path: ["password"],
});

export function UserLoginForm({
  className,
  lang,
  dict,
  ...props
}: UserLoginFormProps) {
  const loginSchema = createLoginSchema(dict);
  type FormData = z.infer<typeof loginSchema>;
  
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
        title: dict.login_form_error_title,
        description: dict.login_form_email_required,
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
          title: dict.login_form_code_sent_title,
        description: dict.login_form_code_sent_desc,
        });
      } else {
        toast({
          title: dict.login_form_send_failed_title,
        description: data.error || dict.login_form_send_failed_desc,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Send login code error:", error);
      toast({
        title: dict.login_form_send_failed_title,
      description: dict.login_form_network_error,
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
          title: dict.login_form_login_success_title,
        description: dict.login_form_login_success_desc,
        });
        setTimeout(() => {
          router.push(`/${lang}/dashboard`);
        }, 1500);
      } else {
        toast({
          title: dict.login_form_login_failed_title,
        description: result.error || dict.login_form_login_failed_desc,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: dict.login_form_login_failed_title,
      description: dict.login_form_network_error,
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
            <Label htmlFor="email">{dict.login_form_email}</Label>
            <Input
              id="email"
              placeholder={dict.login_form_email_placeholder}
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
              {dict.login_form_password_login}
            </Button>
            <Button
              type="button"
              variant={loginMode === 'code' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setLoginMode('code')}
              disabled={isLoading}
            >
              {dict.login_form_code_login}
            </Button>
          </div>

          {/* Password login */}
          {loginMode === 'password' && (
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{dict.login_form_password}</Label>
                <a
                  href={`/${lang}/password-reset`}
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  {dict.login_form_forgot_password}
                </a>
              </div>
              <Input
                id="password"
                placeholder={dict.login_form_password_placeholder}
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
              <Label htmlFor="verificationCode">{dict.login_form_verification_code}</Label>
              <div className="flex space-x-2">
                <Input
                  id="verificationCode"
                  placeholder={dict.login_form_verification_code_placeholder}
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
                  {countdown > 0 ? `${countdown}s` : codeSent ? dict.login_form_resend : dict.login_form_send_code}
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
            {dict.login_form_login}
          </Button>
        </div>
      </form>
    </div>
  );
}