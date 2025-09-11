import { auth } from "@saasfly/auth";
import { redirect } from "next/navigation";
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
import { getUserRole, UserRole } from "~/lib/permissions";
import { AdminAccountNavClient } from "./admin-account-nav-client";

interface AdminAccountNavProps {
  className?: string;
}

export async function AdminAccountNav({ className }: AdminAccountNavProps) {
  // Server-side authentication check
  const session = await auth();
  
  // Redirect to login if not authenticated
  if (!session?.user?.email) {
    redirect("/admin/login");
  }
  
  // Check if user has admin privileges
  const userRole = getUserRole(session.user.email);
  if (userRole !== UserRole.ADMIN) {
    redirect("/admin/login");
  }

  // Only render account nav for authenticated admins
  return (
    <AdminAccountNavClient className={className} userEmail={session.user.email} />
  );
}