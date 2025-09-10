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
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  verificationCode: z.string().min(6, "Verification code must be at least 6 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
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
        title: "Error",
        description: "Please enter a valid and available email address first",
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
      console.error("Send code error:", error);
      toast({
        title: "Send failed",
        description: "Network error, please try again later",
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
        title: "Registration failed",
        description: "Email is not available, please use a different email",
        variant: "destructive",
      });
      return;
    }

    if (passwordStrength && passwordStrength.score < 3) {
      toast({
        title: "Password strength insufficient",
        description: "Please set a stronger password",
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
          title: "Registration successful",
        description: "Account created successfully, redirecting to login page",
        });
        setTimeout(() => {
          router.push(`/${lang}/login`);
        }, 1500);
      } else {
        toast({
          title: "Registration failed",
        description: result.error || "Registration failed, please try again later",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Register error:", error);
      toast({
        title: "Registration failed",
        description: "Network error, please try again later",
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
    if (score < 2) return "Weak";
    if (score < 3) return "Fair";
    if (score < 4) return "Good";
    return "Strong";
  };

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-4">
          {/* Email input */}
          <div className="grid gap-2">
            <Label htmlFor="email">Email Address</Label>
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
                <Icons.Close className="absolute right-3 top-3 h-4 w-4 text-red-500" />
              )}
            </div>
            {errors?.email && (
              <p className="text-xs text-red-600">{errors.email.message}</p>
            )}
            {emailAvailable === false && (
              <p className="text-xs text-red-600">This email is already registered</p>
            )}
          </div>

          {/* Password input */}
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              placeholder="Enter password"
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
                  <span className="text-xs text-muted-foreground">Password Strength</span>
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
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              placeholder="Enter password again"
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
            <Label htmlFor="verificationCode">Email Verification Code</Label>
            <div className="flex gap-2">
              <Input
                id="verificationCode"
                placeholder="Enter verification code"
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
                {countdown > 0 ? `${countdown}s` : codeSent ? "Resend" : "Send Code"}
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
            Create Account
          </Button>
        </div>
      </form>
    </div>
  );
}