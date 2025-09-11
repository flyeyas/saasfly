"use client";

import { signOut } from "next-auth/react";
import { CircleUser } from "lucide-react";

import { Button } from "@saasfly/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@saasfly/ui/dropdown-menu";

interface AdminAccountNavProps {
  className?: string;
}

export function AdminAccountNav({ className }: AdminAccountNavProps) {
  const handleLogout = async () => {
    try {
      // Use signOut with callbackUrl to redirect to admin login
      await signOut({
        callbackUrl: "/admin/login",
        redirect: true,
      });
    } catch (error) {
      console.error("Error during admin logout:", error);
      // Fallback redirect if signOut fails
      window.location.href = "/admin/login";
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" className="rounded-full">
          <CircleUser className="h-5 w-5" />
          <span className="sr-only">Toggle user menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Admin Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Settings</DropdownMenuItem>
        <DropdownMenuItem>Support</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          onSelect={handleLogout}
        >
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}