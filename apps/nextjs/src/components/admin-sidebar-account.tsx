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
    <div className="border-t border-gray-100 mt-auto bg-gray-50/50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-start p-4 h-auto hover:bg-white/80 rounded-none focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 transition-all duration-200"
          >
            <div className="flex items-center gap-3 w-full">
              <Avatar className="h-10 w-10 ring-2 ring-blue-100">
                <AvatarImage src={userImage} alt={displayName} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold text-sm">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start text-left flex-1 min-w-0">
                <span className="text-sm font-semibold text-gray-900 truncate">
                  {displayName}
                </span>
                <span className="text-xs text-gray-500 font-medium">Super Admin</span>
              </div>
              <ChevronUp className="h-4 w-4 text-gray-400 flex-shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-64 p-2 shadow-lg border-0 bg-white/95 backdrop-blur-sm"
          sideOffset={8}
        >
          <DropdownMenuLabel className="font-normal p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg mb-2">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 ring-2 ring-blue-200">
                <AvatarImage src={userImage} alt={displayName} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-semibold leading-none text-gray-900">{displayName}</p>
                <p className="text-xs leading-none text-gray-600 font-medium">
                  {userEmail}
                </p>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Super Admin
                </span>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="my-2" />
          <DropdownMenuItem className="cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-colors duration-150">
            <User className="mr-3 h-4 w-4 text-gray-500" />
            <span className="font-medium text-gray-700">Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-colors duration-150">
            <Settings className="mr-3 h-4 w-4 text-gray-500" />
            <span className="font-medium text-gray-700">Settings</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="my-2" />
          <DropdownMenuItem
            className="cursor-pointer p-3 rounded-lg hover:bg-red-50 focus:bg-red-50 text-red-600 focus:text-red-600 transition-colors duration-150"
            onSelect={handleLogout}
          >
            <LogOut className="mr-3 h-4 w-4" />
            <span className="font-medium">Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}