import React from "react";
import { redirect } from "next/navigation";

import { authOptions, getCurrentUser } from "@saasfly/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@saasfly/ui/card";
import { Badge } from "@saasfly/ui/badge";
import { Button } from "@saasfly/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@saasfly/ui/table";

import { StatsCard } from "~/components/admin/stats-card";
import { GamesTable } from "~/components/admin/games-table";
import { ChartCard } from "~/components/admin/chart-card";

import { DashboardShell } from "~/components/shell";
import type { Locale } from "~/config/i18n-config";
import { getDictionary } from "~/lib/get-dictionary";
import { trpc } from "~/trpc/server";

export const metadata = {
  title: "后台管理 - 仪表盘",
};

export default async function DashboardPage({
  params: { lang },
}: {
  params: {
    lang: Locale;
  };
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const dict = await getDictionary(lang);

  // Mock data for admin dashboard
  const stats = [
    {
      title: "总游戏数",
      value: "1,234",
      change: "+12%",
      icon: "gamepad",
    },
    {
      title: "活跃用户",
      value: "8,456",
      change: "+8%",
      icon: "users",
    },
    {
      title: "今日访问",
      value: "2,345",
      change: "+15%",
      icon: "eye",
    },
    {
      title: "收入",
      value: "¥12,345",
      change: "+5%",
      icon: "dollar-sign",
    },
  ];

  const recentGames = [
    {
      id: "1",
      title: "超级马里奥",
      category: "动作",
      status: "published" as const,
      views: 1234,
      createdAt: "2024-01-15",
    },
    {
      id: "2",
      title: "俄罗斯方块",
      category: "益智",
      status: "published" as const,
      views: 987,
      createdAt: "2024-01-14",
    },
    {
      id: "3",
      title: "贪吃蛇",
      category: "休闲",
      status: "draft" as const,
      views: 456,
      createdAt: "2024-01-13",
    },
  ];

  const trendData = [
    { name: "周一", value: 120 },
    { name: "周二", value: 150 },
    { name: "周三", value: 180 },
    { name: "周四", value: 160 },
    { name: "周五", value: 200 },
    { name: "周六", value: 240 },
    { name: "周日", value: 220 },
  ];

  const categoryData = [
    { name: "动作", value: 45 },
    { name: "益智", value: 32 },
    { name: "休闲", value: 28 },
    { name: "冒险", value: 21 },
  ];

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <StatsCard
              key={index}
              title={stat.title}
              value={stat.value}
              change={stat.change}
              icon={stat.icon}
            />
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid gap-4 md:grid-cols-2">
          <ChartCard
            title="游戏访问趋势"
            data={trendData}
          />
          
          <ChartCard
            title="热门分类"
            data={categoryData}
          />
        </div>

        {/* Recent Games Table */}
        <Card>
          <CardHeader>
            <CardTitle>最新游戏</CardTitle>
          </CardHeader>
          <CardContent>
            <GamesTable games={recentGames} />
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
  }
