import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { cn } from "@saasfly/ui";
import { buttonVariants } from "@saasfly/ui/button";
import * as Icons from "@saasfly/ui/icons";

import { GameAdminLoginForm } from "~/components/game-admin-login-form";

export const metadata: Metadata = {
  title: "Admin Login - HTML5 Games Portal",
  description: "Login to the HTML5 Games Portal admin dashboard",
};

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      {/* Background gaming elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-400 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-32 right-20 w-16 h-16 bg-pink-400 rounded-full opacity-20 animate-bounce"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-green-400 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-32 right-32 w-12 h-12 bg-blue-400 rounded-full opacity-20 animate-bounce"></div>
      </div>

      {/* Login card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4">
              <Icons.Gamepad2 className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              HTML5 Games Portal
            </h1>
            <p className="text-gray-300">
              Admin Dashboard Login
            </p>
          </div>

          {/* Login form */}
          <GameAdminLoginForm />

          {/* Footer */}
          <div className="mt-8 text-center">
            <Link
              href="/"
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "text-gray-300 hover:text-white hover:bg-white/10"
              )}
            >
              <Icons.ChevronLeft className="mr-2 h-4 w-4" />
              Back to Games Portal
            </Link>
          </div>
        </div>

        {/* Gaming stats decoration */}
        <div className="mt-6 grid grid-cols-3 gap-4 text-center">
          <div className="bg-white/5 backdrop-blur rounded-lg p-3">
            <div className="text-2xl font-bold text-white">1000+</div>
            <div className="text-xs text-gray-300">Games</div>
          </div>
          <div className="bg-white/5 backdrop-blur rounded-lg p-3">
            <div className="text-2xl font-bold text-white">50K+</div>
            <div className="text-xs text-gray-300">Players</div>
          </div>
          <div className="bg-white/5 backdrop-blur rounded-lg p-3">
            <div className="text-2xl font-bold text-white">24/7</div>
            <div className="text-xs text-gray-300">Online</div>
          </div>
        </div>
      </div>
    </div>
  );
}