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
        title: "仪表盘",
        href: "/dashboard/",
        icon: Activity
      },
      {
        id: "games",
        title: "游戏管理",
        href: "/dashboard/games",
        icon: Gamepad2
      },
      {
        id: "categories",
        title: "分类管理",
        href: "/dashboard/categories",
        icon: Blocks
      },
      {
        id: "users",
        title: "用户管理",
        href: "/dashboard/users",
        icon: User
      },
      {
        id: "reviews",
        title: "评价管理",
        href: "/dashboard/reviews",
        icon: Heart
      },
      {
        id: "comments",
        title: "评论管理",
        href: "/dashboard/comments",
        icon: FileText
      },
      {
        id: "reports",
        title: "举报管理",
        href: "/dashboard/reports",
        icon: AlertTriangle
      },
      {
        id: "analytics",
        title: "数据分析",
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
