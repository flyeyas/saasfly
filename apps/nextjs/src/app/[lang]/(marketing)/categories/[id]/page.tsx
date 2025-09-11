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


import { getDictionary } from "~/lib/get-dictionary";
import type { Locale } from "~/config/i18n-config";
import { games, categories, getCategoryById, type Game } from "../../../../../data/mock-games";

interface CategoryPageProps {
  params: {
    lang: Locale;
    id: string;
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const dict = await getDictionary(params.lang);
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
              {dict.categories.home}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link href={`/${params.lang}/categories`} className="hover:text-foreground">
              {dict.categories.all_categories}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">{category.name}</span>
          </nav>

          {/* Category Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">
                {dict.categories.category_games_title.replace('{name}', category.name)}
              </h1>
              <p className="text-xl text-muted-foreground mt-2">
                {dict.categories.category_games_subtitle.replace('{count}', categoryGames.length.toString()).replace('{name}', category.name.toLowerCase())}
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
                  placeholder={dict.categories.search_games_placeholder}
                  className="pl-10 w-full sm:w-[300px]"
                />
              </div>

              {/* Sort */}
              <Select defaultValue="popular">
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder={dict.categories.sort_by} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">{dict.categories.most_popular}</SelectItem>
                  <SelectItem value="newest">{dict.categories.newest_first}</SelectItem>
                  <SelectItem value="oldest">{dict.categories.oldest_first}</SelectItem>
                  <SelectItem value="name">{dict.categories.name_a_z}</SelectItem>
                  <SelectItem value="name-desc">{dict.categories.name_z_a}</SelectItem>
                </SelectContent>
              </Select>

              {/* Additional Filters */}
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                {dict.categories.more_filters}
              </Button>
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Grid className="h-4 w-4" />
                {dict.categories.grid_view}
              </Button>
              <Button variant="ghost" size="sm" className="gap-2">
                <List className="h-4 w-4" />
                {dict.categories.list_view}
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
            <h3 className="text-xl font-semibold mb-2">{dict.categories.no_games_found}</h3>
            <p className="text-muted-foreground mb-4">
              {dict.categories.no_games_in_category.replace('{name}', category.name)}
            </p>
            <Button asChild>
              <Link href={`/${params.lang}`}>{dict.categories.browse_all_games}</Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-muted-foreground">
                {dict.categories.showing_results.replace('{count}', categoryGames.length.toString()).replace('{category}', category.name)}
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
                      {game.description || dict.categories.no_description_available}
                    </CardDescription>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {getCategoryById(game.categoryId)?.name || dict.categories.unknown_category}
                      </span>
                      <Button asChild size="sm">
                        <Link href={`/${params.lang}/games/${game.id}`}>
                          {dict.categories.play_now}
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
                  {dict.categories.load_more_games}
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Related Categories */}
      <div className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold mb-6">{dict.categories.explore_other_categories}</h2>
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
                          {dict.categories.games_count.replace('{count}', catGameCount.toString())}
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
  const dict = await getDictionary(params.lang);
  const category = getCategoryById(params.id);
  
  if (!category) {
    return {
      title: dict.categories.category_not_found_title,
    };
  }

  const gameCount = games.filter((game: Game) => game.categoryId === params.id).length;

  return {
    title: dict.categories.category_meta_title
      .replace('{name}', category.name)
      .replace('{count}', gameCount.toString()),
    description: dict.categories.category_meta_description
      .replace('{count}', gameCount.toString())
      .replace(/{name}/g, category.name.toLowerCase()),
    keywords: dict.categories.category_meta_keywords
      .replace(/{name}/g, category.name.toLowerCase()),
  };
}