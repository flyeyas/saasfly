"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

import { cn } from "@saasfly/ui";
import { buttonVariants } from "@saasfly/ui/button";
import * as Icons from "@saasfly/ui/icons";
import { Toaster } from "@saasfly/ui/toaster";

import { GameAdminLoginForm } from "~/components/game-admin-login-form";

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      {/* Login card */}
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-sm border border-gray-300 overflow-hidden">
          {/* Header */}
          <div className="bg-gray-800 text-center py-8 px-8">
            <div className="mx-auto w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center mb-4">
              <Icons.ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              GameHub Admin
            </h1>
            <p className="text-gray-300 text-sm">
              Admin Management Console
            </p>
          </div>

          {/* Login form */}
          <div className="p-8">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Admin Login
              </h2>
              <p className="text-sm text-gray-600">
                Please use admin account to login to the system
              </p>
            </div>
            
            <GameAdminLoginForm />
          </div>

          {/* Footer */}
          <div className="px-8 pb-6 text-center border-t border-gray-100">
             <p className="text-xs text-gray-400 mb-4">
               <Icons.ShieldCheck className="inline w-3 h-3 mr-1" />
               HTML5 Game Management System v2.0
             </p>
             <Link
               href="/"
               className="text-sm text-gray-500 hover:text-gray-700 hover:underline"
             >
               Return to Homepage
             </Link>
           </div>
        </div>
      </div>
      <Toaster />
    </div>
  );
}