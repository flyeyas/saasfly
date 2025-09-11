"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
        icon: LayoutDashboard,
      },
      {
        title: "Game Management",
        href: "/admin/games",
        icon: Gamepad2,
      },
      {
        title: "Category Management",
        href: "/admin/categories",
        icon: Folder,
      },
      {
        title: "User Management",
        href: "/admin/users",
        icon: Users,
      },
    ],
  },
  {
    title: "Content Management",
    items: [
      {
        title: "Review Management",
        href: "/admin/reviews",
        icon: Star,
      },
      {
        title: "Comment Management",
        href: "/admin/comments",
        icon: MessageCircle,
      },
      {
        title: "Report Management",
        href: "/admin/reports",
        icon: Flag,
      },
    ],
  },
  {
    title: "System Settings",
    items: [
      {
        title: "Analytics",
        href: "/admin/analytics",
        icon: BarChart3,
      },
      {
        title: "System Settings",
        href: "/admin/settings",
        icon: Settings,
      },
    ],
  },
];

export function AdminSidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className={cn("flex h-full w-64 flex-col bg-white border-r border-gray-200", className)}>
      {/* Brand */}
      <div className="flex h-16 items-center gap-3 px-6 border-b border-gray-200">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600">
          <Gamepad2 className="h-4 w-4 text-white" />
        </div>
        <span className="text-lg font-semibold text-gray-900">GameHub Admin</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6">
        {navigation.map((section) => (
          <div key={section.title} className="mb-8">
            <h3 className="mb-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Button
                    key={item.href}
                    asChild
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-3 px-6 py-3 h-auto text-sm font-medium [&_svg]:size-6",
                      isActive
                        ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700 hover:bg-blue-50"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <Link href={item.href}>
                      <item.icon className={cn(
                        isActive ? "text-blue-700" : "text-gray-500"
                      )} />
                      <span className="flex-1">{item.title}</span>
                    </Link>
                  </Button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </div>
  );
}