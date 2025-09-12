import { Activity, AlertTriangle, Blocks, CreditCard, FileText, Gamepad2, Heart, Settings, User } from "lucide-react";

import type { Locale } from "~/config/i18n-config";
import { getDictionary } from "~/lib/get-dictionary";
import type { DashboardConfig } from "~/types";

export const getDashboardConfig = async ({
  params: { lang },
}: {
  params: {
    lang: Locale;
  };
}): Promise<DashboardConfig> => {
  const dict = await getDictionary(lang);

  return {
    mainNav: [
      {
        title: dict.common.dashboard.main_nav_documentation,
        href: "/docs",
      },
      {
        title: dict.common.dashboard.main_nav_support,
        href: "/support",
        disabled: true,
      },
    ],
    sidebarNav: [
      {
        id: "dashboard",
        title: "Dashboard",
        href: "/dashboard/",
        icon: Activity
      },
      {
        id: "games",
        title: "Game Management",
        href: "/dashboard/games",
        icon: Gamepad2
      },
      {
        id: "categories",
        title: "Category Management",
        href: "/dashboard/categories",
        icon: Blocks
      },
      {
        id: "users",
        title: "User Management",
        href: "/dashboard/users",
        icon: User
      },
      {
        id: "reviews",
        title: "Review Management",
        href: "/dashboard/reviews",
        icon: Heart
      },
      {
        id: "comments",
        title: "Comment Management",
        href: "/dashboard/comments",
        icon: FileText
      },
      {
        id: "reports",
        title: "Report Management",
        href: "/dashboard/reports",
        icon: AlertTriangle
      },
      {
        id: "analytics",
        title: "Analytics",
        href: "/dashboard/analytics",
        icon: Activity
      },
      {
        id: "settings",
        title: dict.common.dashboard.sidebar_nav_settings,
        href: "/dashboard/settings",
        icon: Settings
      },
    ],
  };
};
