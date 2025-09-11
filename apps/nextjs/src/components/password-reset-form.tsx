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

const createResetSchema = (dict: Dictionary) => z.object({
  email: z.string().email(dict.password_reset_form_email_validation),
  verificationCode: z.string().min(6, dict.password_reset_form_verification_code_validation),
  newPassword: z.string().min(8, dict.password_reset_form_new_password_validation),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: dict.password_reset_form_confirm_password_validation,
  path: ["confirmPassword"],
});

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
  const resetSchema = createResetSchema(dict);
  type FormData = z.infer<typeof resetSchema>;
  
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

  // Countdown effect
  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Password strength check
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

  // Send reset verification code
  const sendResetCode = async () => {
    if (!watchedEmail || !z.string().email().safeParse(watchedEmail).success) {
      toast({
        title: dict.password_reset_form_error,
        description: dict.password_reset_form_email_required,
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
          title: dict.password_reset_form_code_sent,
          description: dict.password_reset_form_code_sent_desc,
        });
      } else {
        toast({
          title: dict.password_reset_form_send_failed,
          description: data.error || dict.password_reset_form_send_failed_desc,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Send reset code error:", error);
      toast({
        title: dict.password_reset_form_send_failed,
        description: dict.password_reset_form_network_error,
        variant: "destructive",
      });
    } finally {
      setIsCodeSending(false);
    }
  };

  // Submit password reset
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
          title: dict.password_reset_form_reset_success,
          description: dict.password_reset_form_reset_success_desc,
        });
        setTimeout(() => {
          router.push(`/${lang}/login`);
        }, 1500);
      } else {
        toast({
          title: dict.password_reset_form_reset_failed,
          description: result.error || dict.password_reset_form_reset_failed_desc,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Password reset error:", error);
      toast({
        title: dict.password_reset_form_reset_failed,
        description: dict.password_reset_form_network_error,
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
        return dict.password_reset_form_password_weak;
      case 2:
        return dict.password_reset_form_password_fair;
      case 3:
        return dict.password_reset_form_password_strong;
      case 4:
        return dict.password_reset_form_password_very_strong;
      default:
        return "";
    }
  };

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-4">
          {/* Email input */}
          <div className="grid gap-2">
            <Label htmlFor="email">{dict.password_reset_form_email}</Label>
            <Input
              id="email"
              placeholder={dict.password_reset_form_email_placeholder}
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
              {dict.password_reset_form_send_code}
            </Button>
          )}

          {step === 'reset' && (
            <>
              {/* Verification code input */}
              <div className="grid gap-2">
                <Label htmlFor="verificationCode">{dict.password_reset_form_verification_code}</Label>
                <div className="flex space-x-2">
                  <Input
                    id="verificationCode"
                    placeholder={dict.password_reset_form_verification_code_placeholder}
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
                    {countdown > 0 ? `${countdown}s` : dict.password_reset_form_resend}
                  </Button>
                </div>
                {errors?.verificationCode && (
                  <p className="text-xs text-red-600">{errors.verificationCode.message}</p>
                )}
              </div>

              {/* New password input */}
              <div className="grid gap-2">
                <Label htmlFor="newPassword">{dict.password_reset_form_new_password}</Label>
                <Input
                  id="newPassword"
                  placeholder={dict.password_reset_form_new_password_placeholder}
                  type="password"
                  disabled={isLoading}
                  {...register("newPassword")}
                />
                {errors?.newPassword && (
                  <p className="text-xs text-red-600">{errors.newPassword.message}</p>
                )}
                
                {/* Password strength indicator */}
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
                        {dict.password_reset_form_password_strength}: {getPasswordStrengthText(passwordStrength.score)}
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

              {/* Confirm password input */}
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">{dict.password_reset_form_confirm_password}</Label>
                <Input
                  id="confirmPassword"
                  placeholder={dict.password_reset_form_confirm_password_placeholder}
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
                {dict.password_reset_form_reset_password}
              </Button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}