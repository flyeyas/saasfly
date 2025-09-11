"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { cn } from "@saasfly/ui";
import { Button } from "@saasfly/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@saasfly/ui/form";
import * as Icons from "@saasfly/ui/icons";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@saasfly/ui/input";
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
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [showPassword, setShowPassword] = React.useState<boolean>(false);

  const form = useForm<FormData>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
  });

  async function onSubmit(data: FormData) {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: data.username,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast({
          title: "Login failed",
          description: result.error || "Invalid username or password",
          variant: "destructive",
        });
        return;
      }

      if (result.success) {
        toast({
          title: "Login successful",
          description: "Welcome to the admin dashboard!",
        });
        setTimeout(() => {
          router.push(result.redirectUrl || "/admin/dashboard");
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
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <div className="grid gap-4">
            {/* Username input */}
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    <Icons.User className="inline w-4 h-4 mr-1" />
                    Admin Username
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Please enter admin username"
                      type="text"
                      autoCapitalize="none"
                      autoComplete="username"
                      autoCorrect="off"
                      disabled={isLoading}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 bg-white"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-red-500" />
                </FormItem>
              )}
            />

            {/* Password input */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    <Icons.Key className="inline w-4 h-4 mr-1" />
                    Admin Password
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="Please enter admin password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        disabled={isLoading}
                        className="mt-1 block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 bg-white"
                        {...field}
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
                          <EyeOff className="h-4 w-4 text-gray-500" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-500" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs text-red-500" />
                </FormItem>
              )}
            />

            {/* Remember me and forgot password */}
            <div className="flex items-center justify-between mb-6">
              <FormField
                control={form.control}
                name="rememberMe"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="rounded border-gray-400 data-[state=checked]:border-gray-600 data-[state=checked]:bg-gray-100 [&>span>svg]:h-3 [&>span>svg]:w-3 [&>span>svg]:text-gray-700"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormLabel className="text-sm text-gray-600 cursor-pointer">
                      Remember password
                    </FormLabel>
                  </FormItem>
                )}
              />
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
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-gray-700 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isLoading && (
                <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />
              )}

              Login
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}