import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Filter, Grid, List, Search } from "lucide-react";

import { Button } from "@saasfly/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@saasfly/ui/card";
import { Input } from "@saasfly/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@saasfly/ui/select";


import { games, categories, getCategoryById, type Game } from "../../../../../data/mock-games";

interface CategoryPageProps {
  params: {
    lang: string;
    id: string;
  };
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const category = getCategoryById(params.id);
  
  if (!category) {
    notFound();
  }

  // Filter games by category
  const categoryGames = games.filter((game: Game) => game.categoryId === params.id);

  // Sort games by popularity (using random for demo)
  const sortedGames = [...categoryGames].sort(() => Math.random() - 0.5);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-6">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
            <Link href={`/${params.lang}`} className="hover:text-foreground">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link href={`/${params.lang}/categories`} className="hover:text-foreground">
              Categories
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">{category.name}</span>
          </nav>

          {/* Category Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">{category.name} Games</h1>
              <p className="text-xl text-muted-foreground mt-2">
                Discover {categoryGames.length} amazing {category.name.toLowerCase()} games
              </p>
            </div>
            <div className="hidden md:block">
              <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl">
                {category.icon || category.name.charAt(0)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search games..."
                  className="pl-10 w-full sm:w-[300px]"
                />
              </div>

              {/* Sort */}
              <Select defaultValue="popular">
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="name">Name A-Z</SelectItem>
                  <SelectItem value="name-desc">Name Z-A</SelectItem>
                </SelectContent>
              </Select>

              {/* Additional Filters */}
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                More Filters
              </Button>
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Grid className="h-4 w-4" />
                Grid
              </Button>
              <Button variant="ghost" size="sm" className="gap-2">
                <List className="h-4 w-4" />
                List
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Games Grid */}
      <div className="container mx-auto px-4 py-8">
        {categoryGames.length === 0 ? (
          <div className="text-center py-12">
            <div className="h-24 w-24 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <Grid className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No games found</h3>
            <p className="text-muted-foreground mb-4">
              There are no games in the {category.name} category yet.
            </p>
            <Button asChild>
              <Link href={`/${params.lang}`}>Browse All Games</Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-muted-foreground">
                Showing {categoryGames.length} games in {category.name}
              </p>
            </div>

            {/* Games Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {sortedGames.map((game: Game) => (
                <Card key={game.id} className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
                  <CardHeader className="p-0">
                    <div className="relative overflow-hidden rounded-t-lg">
                      <img
                        src={game.coverImage || '/placeholder-game.jpg'}
                        alt={game.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <CardTitle className="text-lg mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                      {game.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 mb-3">
                      {game.description || 'No description available for this game.'}
                    </CardDescription>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {getCategoryById(game.categoryId)?.name || 'Unknown'}
                      </span>
                      <Button asChild size="sm">
                        <Link href={`/${params.lang}/games/${game.id}`}>
                          Play Now
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Load More */}
            {categoryGames.length > 20 && (
              <div className="text-center mt-12">
                <Button variant="outline" size="lg">
                  Load More Games
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Related Categories */}
      <div className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold mb-6">Explore Other Categories</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories
              .filter((cat) => cat.id !== params.id)
              .slice(0, 6)
              .map((cat) => {
                const catGameCount = games.filter((g: Game) => g.categoryId === cat.id).length;
                return (
                  <Link
                    key={cat.id}
                    href={`/${params.lang}/categories/${cat.id}`}
                    className="group"
                  >
                    <Card className="text-center hover:shadow-md transition-all duration-200 hover:-translate-y-1">
                      <CardContent className="p-4">
                        <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg mx-auto mb-3 group-hover:scale-110 transition-transform duration-200">
                          {cat.icon || cat.name.charAt(0)}
                        </div>
                        <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                          {cat.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {catGameCount} games
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  return categories.map((category) => ({
    id: category.id,
  }));
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const category = getCategoryById(params.id);
  
  if (!category) {
    return {
      title: 'Category Not Found',
    };
  }

  const gameCount = games.filter((game: Game) => game.categoryId === params.id).length;

  return {
    title: `${category.name} Games - Play ${gameCount} Free Online Games`,
    description: `Discover ${gameCount} amazing ${category.name.toLowerCase()} games. Play free online games in the ${category.name} category.`,
    keywords: `${category.name.toLowerCase()} games, free online games, ${category.name.toLowerCase()}, browser games`,
  };
}