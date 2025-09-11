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

const createRegisterSchema = (dict: Dictionary) => z.object({
  email: z.string().email(dict.register_form_email_validation),
  password: z.string().min(8, dict.register_form_password_validation),
  confirmPassword: z.string(),
  verificationCode: z.string().min(6, dict.register_form_verification_code_validation),
}).refine((data) => data.password === data.confirmPassword, {
  message: dict.register_form_password_match_validation,
  path: ["confirmPassword"],
});

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
  const registerSchema = createRegisterSchema(dict);
  type FormData = z.infer<typeof registerSchema>;
  
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

  // Countdown effect
  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Check email availability
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

  // Check password strength
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

  // Send verification code
  const sendVerificationCode = async () => {
    if (!watchedEmail || !emailAvailable) {
      toast({
        title: dict.register_form_error_title,
        description: dict.register_form_email_required,
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
          title: dict.register_form_code_sent_title,
        description: dict.register_form_code_sent_desc,
        });
      } else {
        toast({
          title: dict.register_form_send_failed_title,
        description: data.error || dict.register_form_send_failed_desc,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Send code error:", error);
      toast({
        title: dict.register_form_send_failed_title,
        description: dict.register_form_network_error,
        variant: "destructive",
      });
    } finally {
      setIsCodeSending(false);
    }
  };

  // Submit registration
  async function onSubmit(data: FormData) {
    if (!emailAvailable) {
      toast({
        title: dict.register_form_registration_failed_title,
        description: dict.register_form_email_unavailable,
        variant: "destructive",
      });
      return;
    }

    if (passwordStrength && passwordStrength.score < 3) {
      toast({
        title: dict.register_form_password_weak_title,
        description: dict.register_form_password_weak_desc,
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
          title: dict.register_form_registration_success_title,
        description: dict.register_form_registration_success_desc,
        });
        setTimeout(() => {
          router.push(`/${lang}/login`);
        }, 1500);
      } else {
        toast({
          title: dict.register_form_registration_failed_title,
        description: result.error || dict.register_form_registration_failed_desc,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Register error:", error);
      toast({
        title: dict.register_form_registration_failed_title,
        description: dict.register_form_network_error,
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
    if (score < 2) return dict.register_form_password_weak;
    if (score < 3) return dict.register_form_password_fair;
    if (score < 4) return dict.register_form_password_good;
    return dict.register_form_password_strong;
  };

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-4">
          {/* Email input */}
          <div className="grid gap-2">
            <Label htmlFor="email">{dict.register_form_email_address}</Label>
            <div className="relative">
              <Input
                id="email"
                placeholder={dict.register_form_email_placeholder}
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
                <Icons.Close className="absolute right-3 top-3 h-4 w-4 text-red-500" />
              )}
            </div>
            {errors?.email && (
              <p className="text-xs text-red-600">{errors.email.message}</p>
            )}
            {emailAvailable === false && (
              <p className="text-xs text-red-600">{dict.register_form_email_already_registered}</p>
            )}
          </div>

          {/* Password input */}
          <div className="grid gap-2">
            <Label htmlFor="password">{dict.register_form_password}</Label>
            <Input
              id="password"
              placeholder={dict.register_form_password_placeholder}
              type="password"
              autoComplete="new-password"
              disabled={isLoading}
              {...register("password")}
            />
            {errors?.password && (
              <p className="text-xs text-red-600">{errors.password.message}</p>
            )}
            
            {/* Password strength indicator */}
            {passwordStrength && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{dict.register_form_password_strength}</span>
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

          {/* Confirm password */}
          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">{dict.register_form_confirm_password}</Label>
            <Input
              id="confirmPassword"
              placeholder={dict.register_form_confirm_password_placeholder}
              type="password"
              autoComplete="new-password"
              disabled={isLoading}
              {...register("confirmPassword")}
            />
            {errors?.confirmPassword && (
              <p className="text-xs text-red-600">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Verification code */}
          <div className="grid gap-2">
            <Label htmlFor="verificationCode">{dict.register_form_verification_code}</Label>
            <div className="flex gap-2">
              <Input
                id="verificationCode"
                placeholder={dict.register_form_verification_code_placeholder}
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
                {countdown > 0 ? `${countdown}s` : codeSent ? dict.register_form_resend : dict.register_form_send_code}
              </Button>
            </div>
            {errors?.verificationCode && (
              <p className="text-xs text-red-600">{errors.verificationCode.message}</p>
            )}
          </div>

          {/* Submit button */}
          <Button 
            type="submit" 
            disabled={isLoading || emailAvailable === false || (passwordStrength?.score ?? 0) < 3}
            className="w-full"
          >
            {isLoading && (
              <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            {dict.register_form_create_account}
          </Button>
        </div>
      </form>
    </div>
  );
}