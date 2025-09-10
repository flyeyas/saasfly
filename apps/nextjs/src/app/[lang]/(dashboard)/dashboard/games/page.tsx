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
// Badge component not available, using inline styles instead
import * as Icons from "@saasfly/ui/icons";

import { EmptyPlaceholder } from "~/components/empty-placeholder";
import { DashboardHeader } from "~/components/header";
import { DashboardShell } from "~/components/shell";
import type { Locale } from "~/config/i18n-config";
import { getDictionary } from "~/lib/get-dictionary";
import { games } from "~/data/mock-games";
import { Edit, Trash2, Plus, Image } from "lucide-react";

export const metadata = {
  title: "Game Management",
  description: "Manage game library",
};

export default async function GamesPage({
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
  const gamesList = games.filter(game => game.isActive);

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Game Management"
        text="Create and manage your game library"
      >
        <Link href={`/${lang}/dashboard/games/new`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Game
          </Button>
        </Link>
      </DashboardHeader>
      <div>
        {gamesList.length ? (
          <div className="admin-content">
            <div className="admin-stats">
              <div className="stat-card">
                <h3>Total Games</h3>
                <p className="stat-number">{gamesList.length}</p>
              </div>
              <div className="stat-card">
                <h3>Active Games</h3>
                <p className="stat-number">{gamesList.filter(g => g.isActive).length}</p>
              </div>
              <div className="stat-card">
                <h3>Total Plays</h3>
                <p className="stat-number">{gamesList.reduce((sum, g) => sum + g.playCount, 0)}</p>
              </div>
            </div>
            
            <div className="admin-table-container">
              <Table>
                <TableCaption>Game Library</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Cover</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Plays</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gamesList.map((game) => (
                    <TableRow key={game.id} className="admin-table-row">
                      <TableCell>
                        <div className="game-cover">
                          <img
                            src={game.coverImage}
                            alt={game.title}
                            className="w-12 h-12 rounded object-cover"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="game-info">
                          <h4 className="font-medium">{game.title}</h4>
                          <p className="text-sm text-muted-foreground">{game.slug}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="category-badge">{game.categories[0]}</span>
                      </TableCell>
                      <TableCell>
                        <div className="rating-display">
                          <span className="rating-stars">★</span>
                          <span>{game.rating}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="play-count">{game.playCount.toLocaleString()}</span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            game.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {game.isActive ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(game.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="action-buttons">
                          <Link href={`/${lang}/dashboard/games/${game.id}/edit`}>
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
            <EmptyPlaceholder.Title>No Games Found</EmptyPlaceholder.Title>
            <EmptyPlaceholder.Description>
              You haven't added any games yet. Click the button below to get started.
            </EmptyPlaceholder.Description>
            <Link href={`/${lang}/dashboard/games/new`}>
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add Game
              </Button>
            </Link>
          </EmptyPlaceholder>
        )}
      </div>
    </DashboardShell>
  );
}