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
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@saasfly/ui/input";
import { Label } from "@saasfly/ui/label";
import { Checkbox } from "@saasfly/ui/checkbox";
import { toast } from "@saasfly/ui/use-toast";

const adminLoginSchema = z.object({
  username: z.string().min(1, "Please enter admin username"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional(),
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
  const [showPassword, setShowPassword] = React.useState<boolean>(false);

  async function onSubmit(data: FormData) {
    setIsLoading(true);
    try {
      // Check if user is admin by username
      const adminUsernames = process.env.NEXT_PUBLIC_ADMIN_USERNAMES?.split(",") || ["admin", "gameadmin", "superadmin"];
      if (!adminUsernames.includes(data.username)) {
        toast({
          title: "Access denied",
          description: "Admin privileges required.",
          variant: "destructive",
        });
        return;
      }

      const result = await signIn("credentials", {
        email: data.username + "@admin.local", // Convert username to email format for NextAuth
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
          {/* Username input */}
          <div className="grid gap-2">
            <Label htmlFor="username" className="text-sm font-medium text-gray-700">
              <Icons.User className="inline w-4 h-4 mr-1" />
              Admin Username
            </Label>
            <Input
              id="username"
              placeholder="Please enter admin username"
              type="text"
              autoCapitalize="none"
              autoComplete="username"
              autoCorrect="off"
              disabled={isLoading}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
              {...register("username")}
            />
            {errors?.username && (
              <p className="text-xs text-red-500">{errors.username.message}</p>
            )}
          </div>

          {/* Password input */}
          <div className="grid gap-2">
            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
              <Icons.Key className="inline w-4 h-4 mr-1" />
              Admin Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                placeholder="Please enter admin password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                disabled={isLoading}
                className="mt-1 block w-full px-3 py-2 pr-10 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                {...register("password")}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
            {errors?.password && (
              <p className="text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          {/* Remember me and forgot password */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="rememberMe"
                className="rounded border-gray-400 data-[state=checked]:border-gray-600 data-[state=checked]:bg-transparent [&>span>svg]:h-3 [&>span>svg]:w-3 [&>span>svg]:text-gray-600"
                {...register("rememberMe")}
                disabled={isLoading}
              />
              <Label htmlFor="rememberMe" className="text-sm text-gray-600 cursor-pointer">
                Remember password
              </Label>
            </div>
            <Button
              type="button"
              variant="link"
              className="text-sm text-gray-500 hover:text-gray-700 p-0 h-auto font-normal underline"
              onClick={() => {
                toast({
                  title: "Forgot Password",
                  description: "Please contact system administrator to reset password.",
                });
              }}
            >
              Forgot password?
            </Button>
          </div>

          <Button 
            disabled={isLoading} 
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded text-sm font-medium text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading && (
              <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            {!isLoading && (
              <Icons.ArrowRight className="mr-2 h-4 w-4" />
            )}
            Login to Admin Dashboard
          </Button>
        </div>
      </form>
    </div>
  );
}