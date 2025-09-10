"use client";

import React from "react";
import { signIn } from "next-auth/react";
import { Shield, User, Lock, Eye, EyeOff } from "lucide-react";

import { cn } from "@saasfly/ui";
import { Button } from "@saasfly/ui/button";
import { Input } from "@saasfly/ui/input";
import { Label } from "@saasfly/ui/label";
import { Checkbox } from "@saasfly/ui/checkbox";
import * as Icons from "@saasfly/ui/icons";
import type { Locale } from "~/config/i18n-config";

interface LoginPageProps {
  params: {
    lang: Locale;
  };
}

export default function LoginPage({ params }: LoginPageProps) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [showPassword, setShowPassword] = React.useState<boolean>(false);
  const [username, setUsername] = React.useState<string>("");
  const [password, setPassword] = React.useState<string>("");
  const [rememberMe, setRememberMe] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string>("");
  const [fieldErrors, setFieldErrors] = React.useState<{username?: string; password?: string}>({});

  const validateForm = () => {
    const errors: {username?: string; password?: string} = {};
    
    if (!username.trim()) {
      errors.username = "请输入管理员账户";
    } else if (username.length < 3) {
      errors.username = "账户名至少需要3个字符";
    }
    
    if (!password.trim()) {
      errors.password = "请输入管理员密码";
    } else if (password.length < 6) {
      errors.password = "密码至少需要6个字符";
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);

    try {
      // 这里可以添加实际的登录逻辑
      // 目前使用GitHub登录作为示例
      await signIn("github", {
        redirect: true,
        callbackUrl: "/admin/dashboard",
      });
    } catch (error) {
      setError("登录失败，请重试");
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-4 overflow-hidden">
      <div className="w-full max-w-sm sm:max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* 头部区域 */}
        <div className="bg-slate-600 px-6 sm:px-8 py-8 sm:py-12 text-center">
          <div className="inline-flex items-center justify-center w-12 sm:w-16 h-12 sm:h-16 bg-white/10 rounded-full mb-4">
            <Shield className="w-6 sm:w-8 h-6 sm:h-8 text-white" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">GameHub Admin</h1>
          <p className="text-slate-200 text-sm">管理员控制台</p>
        </div>

        {/* 表单区域 */}
        <div className="px-6 sm:px-8 py-6 sm:py-8 flex-1">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">管理员登录</h2>
            <p className="text-gray-500 text-sm">请使用管理员账户登录系统</p>
          </div>

          {error && (
             <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-center">
               <Icons.Warning className="w-4 h-4 mr-2" />
               {error}
             </div>
           )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium text-gray-700 flex items-center">
                <User className="w-4 h-4 mr-2" />
                管理员用户名
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="请输入管理员用户名"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (fieldErrors.username) {
                    setFieldErrors(prev => ({...prev, username: undefined}));
                  }
                }}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${
                  fieldErrors.username 
                    ? 'border-red-300 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-slate-500'
                }`}
                required
              />
              {fieldErrors.username && (
                <p className="text-sm text-red-600 flex items-center">
                  <Icons.Warning className="w-3 h-3 mr-1" />
                  {fieldErrors.username}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700 flex items-center">
                <Lock className="w-4 h-4 mr-2" />
                管理员密码
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="请输入管理员密码"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) {
                      setFieldErrors(prev => ({...prev, password: undefined}));
                    }
                  }}
                  className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:border-transparent ${
                    fieldErrors.password 
                      ? 'border-red-300 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-slate-500'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-sm text-red-600 flex items-center">
                  <Icons.Warning className="w-3 h-3 mr-1" />
                  {fieldErrors.password}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <Label htmlFor="remember" className="text-sm text-gray-600">
                  记住登录状态
                </Label>
              </div>
              <button
                 type="button"
                 className="text-sm text-gray-700 hover:text-gray-900 flex items-center font-medium"
                 onClick={() => alert("请联系系统管理员重置密码")}
               >
                 <Icons.Help className="w-4 h-4 mr-1" />
                 忘记密码？
               </button>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-600 hover:bg-slate-700 text-white py-3 rounded-lg font-medium transition-colors text-sm sm:text-base"
            >
              {isLoading ? (
                <>
                  <Icons.Spinner className="w-4 h-4 mr-2 animate-spin" />
                  登录中...
                </>
              ) : (
                 <>
                   <Icons.ShieldCheck className="w-4 h-4 mr-2" />
                   登录管理后台
                 </>
               )}
            </Button>
          </form>
        </div>

        {/* 底部信息 */}
        <div className="px-6 sm:px-8 pt-4 sm:pt-5 pb-6 sm:pb-8 bg-white text-center flex-shrink-0">
          <p className="text-xs sm:text-sm text-gray-500 flex items-center justify-center mb-2 flex-wrap">
            <Icons.Gamepad2 className="w-4 h-4 mr-2" />
            <span className="break-words">HTML5游戏中心管理系统 v2.0</span>
          </p>
          <div className="text-xs text-gray-400">
            <span>技术支持</span>
          </div>
        </div>
      </div>
    </div>
  );
}
