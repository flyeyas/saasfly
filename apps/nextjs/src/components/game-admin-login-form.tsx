"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { signIn } from "next-auth/react";

import { cn } from "@saasfly/ui";
import { Button } from "@saasfly/ui/button";
import * as Icons from "@saasfly/ui/icons";
import { Input } from "@saasfly/ui/input";
import { Label } from "@saasfly/ui/label";
import { toast } from "@saasfly/ui/use-toast";

const adminLoginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormData = z.infer<typeof adminLoginSchema>;

export function GameAdminLoginForm({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(adminLoginSchema),
  });
  
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  async function onSubmit(data: FormData) {
    setIsLoading(true);
    try {
      // Check if user is admin by email
      const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAIL?.split(",") || [];
      if (!adminEmails.includes(data.email)) {
        toast({
          title: "Access denied",
          description: "Admin privileges required.",
          variant: "destructive",
        });
        return;
      }

      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        toast({
          title: "Login failed",
          description: "Invalid email or password",
          variant: "destructive",
        });
      } else if (result?.ok) {
        toast({
          title: "Login successful",
          description: "Welcome to the admin dashboard!",
        });
        setTimeout(() => {
          router.push("/admin/dashboard");
        }, 1500);
      }
    } catch (error) {
      console.error("Admin login error:", error);
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
            <Label htmlFor="email" className="text-white">
              Admin Email
            </Label>
            <Input
              id="email"
              placeholder="admin@gameportal.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading}
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-400"
              {...register("email")}
            />
            {errors?.email && (
              <p className="text-xs text-red-400">{errors.email.message}</p>
            )}
          </div>

          {/* Password input */}
          <div className="grid gap-2">
            <Label htmlFor="password" className="text-white">
              Password
            </Label>
            <Input
              id="password"
              placeholder="Enter admin password"
              type="password"
              autoComplete="current-password"
              disabled={isLoading}
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-400"
              {...register("password")}
            />
            {errors?.password && (
              <p className="text-xs text-red-400">{errors.password.message}</p>
            )}
          </div>

          <Button 
            disabled={isLoading} 
            type="submit"
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105"
          >
            {isLoading && (
              <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            Login to Admin Dashboard
          </Button>
        </div>
      </form>

      {/* Security notice */}
      <div className="text-center">
        <p className="text-xs text-gray-400">
          <Icons.ShieldCheck className="inline w-3 h-3 mr-1" />
          Secure admin access only
        </p>
      </div>
    </div>
  );
}