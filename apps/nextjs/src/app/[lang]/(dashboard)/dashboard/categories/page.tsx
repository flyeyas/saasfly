import React from "react";
import { redirect } from "next/navigation";
import Link from "next/link";

import { authOptions, getCurrentUser } from "@saasfly/auth";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@saasfly/ui/table";
import { Button } from "@saasfly/ui/button";
// Badge component not available, will use inline styles
import * as Icons from "@saasfly/ui/icons";

import { EmptyPlaceholder } from "~/components/empty-placeholder";
import { DashboardHeader } from "~/components/header";
import { DashboardShell } from "~/components/shell";
import type { Locale } from "~/config/i18n-config";
import { getDictionary } from "~/lib/get-dictionary";
import { categories } from "~/data/mock-games";
import { Edit, Trash2, Plus, Tag } from "lucide-react";

export const metadata = {
  title: "Category Management",
  description: "Manage game categories",
};

export default async function CategoriesPage({
  params: { lang },
}: {
  params: {
    lang: Locale;
  };
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect(authOptions?.pages?.signIn ?? "/login");
  }

  const dict = await getDictionary(lang);
  
  // Use mock data instead of database
  const categoryIcons: { [key: string]: string } = {
    'action': '⚔️',
    'puzzle': '🧩',
    'adventure': '🗺️',
    'strategy': '♟️',
    'arcade': '🕹️',
    'sports': '⚽'
  };
  
  const categoryList = categories.map((cat, index) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    icon: categoryIcons[cat.slug] || '🎮',
    isActive: cat.isActive,
    sortOrder: index + 1,
    createdAt: new Date(2024, 0, index + 1),
    gameCount: cat.gameCount
  }));

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Category Management"
        text="Create and manage game categories"
      >
        <Link href={`/${lang}/dashboard/categories/new`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </Link>
      </DashboardHeader>
      <div>
        {categoryList && categoryList.length ? (
          <div className="admin-content">
            <div className="admin-stats">
              <div className="stat-card">
                <h3>Total Categories</h3>
                <p className="stat-number">{categoryList.length}</p>
              </div>
              <div className="stat-card">
                <h3>Active Categories</h3>
                <p className="stat-number">{categoryList.filter(c => c.isActive).length}</p>
              </div>
              <div className="stat-card">
                <h3>Total Games</h3>
                <p className="stat-number">{categoryList.reduce((sum, c) => sum + c.gameCount, 0)}</p>
              </div>
            </div>
            
            <div className="admin-table-container">
              <Table>
                <TableCaption>Category Management</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]">Icon</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Games</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categoryList.map((category) => (
                    <TableRow key={category.id} className="admin-table-row">
                      <TableCell>
                        <div className="category-icon">
                          <span className="text-2xl">{category.icon}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="category-info">
                          <h4 className="font-medium">{category.name}</h4>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">{category.slug}</code>
                      </TableCell>
                      <TableCell>
                        <div className="game-count-badge">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {category.gameCount} games
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="sort-order">{category.sortOrder}</span>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          category.isActive 
                            ? "bg-green-100 text-green-800" 
                            : "bg-gray-100 text-gray-800"
                        }`}>
                          {category.isActive ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {category.createdAt.toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="action-buttons">
                          <Link href={`/${lang}/dashboard/categories/${category.id}/edit`}>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : (
          <EmptyPlaceholder>
            <EmptyPlaceholder.Icon name="Gamepad2" />
            <EmptyPlaceholder.Title>No Categories</EmptyPlaceholder.Title>
            <EmptyPlaceholder.Description>
              You haven't added any categories yet. Click the button below to get started.
            </EmptyPlaceholder.Description>
            <Link href={`/${lang}/dashboard/categories/new`}>
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            </Link>
          </EmptyPlaceholder>
        )}
      </div>
    </DashboardShell>
  );
}