import Link from "next/link";
import { auth } from "@saasfly/auth";
import { redirect } from "next/navigation";
import { cn } from "@saasfly/ui";
import { Button } from "@saasfly/ui/button";
import {
  BarChart3,
  Gamepad2,
  LayoutDashboard,
  Settings,
  Star,
  MessageCircle,
  Flag,
  Users,
  Folder,
} from "lucide-react";
import { getUserRole, UserRole } from "~/lib/permissions";
import { AdminSidebarClient } from "./admin-sidebar-client";

interface SidebarProps {
  className?: string;
}

const navigation = [
  {
    title: "Main Functions",
    items: [
      {
        title: "Dashboard",
        href: "/admin/dashboard",
        icon: "LayoutDashboard",
      },
      {
        title: "Game Management",
        href: "/admin/games",
        icon: "Gamepad2",
      },
      {
        title: "Category Management",
        href: "/admin/categories",
        icon: "Folder",
      },
      {
        title: "User Management",
        href: "/admin/users",
        icon: "Users",
      },
    ],
  },
  {
    title: "Content Management",
    items: [
      {
        title: "Review Management",
        href: "/admin/reviews",
        icon: "Star",
      },
      {
        title: "Comment Management",
        href: "/admin/comments",
        icon: "MessageCircle",
      },
      {
        title: "Report Management",
        href: "/admin/reports",
        icon: "Flag",
      },
    ],
  },
  {
    title: "System Settings",
    items: [
      {
        title: "Analytics",
        href: "/admin/analytics",
        icon: "BarChart3",
      },
      {
        title: "System Settings",
        href: "/admin/settings",
        icon: "Settings",
      },
    ],
  },
];

export async function AdminSidebar({ className }: SidebarProps) {
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

  // Only render sidebar for authenticated admins
  return (
    <AdminSidebarClient className={className} navigation={navigation} />
  );
}