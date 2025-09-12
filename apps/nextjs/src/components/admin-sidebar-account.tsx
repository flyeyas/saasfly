"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@saasfly/ui/avatar";
import { Button } from "@saasfly/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@saasfly/ui/dropdown-menu";
import { ChevronUp, LogOut, Settings, User } from "lucide-react";
import { signOut } from "next-auth/react";

interface AdminSidebarAccountProps {
  userEmail: string;
  userName?: string;
  userImage?: string;
}

export function AdminSidebarAccount({ 
  userEmail, 
  userName, 
  userImage 
}: AdminSidebarAccountProps) {
  const handleLogout = async () => {
    try {
      await signOut({
        callbackUrl: "/admin/login",
        redirect: true,
      });
    } catch (error) {
      console.error("Error during admin logout:", error);
      window.location.href = "/admin/login";
    }
  };

  // Get initials from email or name
  const getInitials = () => {
    if (userName) {
      return userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return userEmail.charAt(0).toUpperCase();
  };

  const displayName = userName || userEmail.split("@")[0];

  return (
    <div className="border-t border-gray-200 mt-auto">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-start p-4 h-auto hover:bg-gray-50 rounded-none"
          >
            <div className="flex items-center gap-3 w-full">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white font-semibold text-sm">
                A
              </div>
              <div className="flex flex-col items-start text-left flex-1 min-w-0">
                <span className="text-sm font-medium text-gray-900 truncate">
                  Admin
                </span>
                <span className="text-xs text-gray-500">Super Admin</span>
              </div>
              <ChevronUp className="h-4 w-4 text-gray-400 flex-shrink-0" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{displayName}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {userEmail}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer text-red-600 focus:text-red-600"
            onSelect={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}