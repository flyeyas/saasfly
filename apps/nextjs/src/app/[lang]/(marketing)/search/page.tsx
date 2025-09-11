import { Suspense } from "react";
import Link from "next/link";
import { Search, Filter, Grid, List, ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

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

import { searchGames, categories, getCategoryById, type Game } from "../../../../data/mock-games";
import GameSearch from "../../../../components/search/GameSearch";
import { getDictionary } from "~/lib/get-dictionary";
import type { Locale } from "~/config/i18n-config";

interface SearchPageProps {
  params: {
    lang: Locale;
  };
  searchParams: {
    q?: string;
    category?: string;
    sort?: string;
    view?: string;
  };
}

export async function generateMetadata({ params, searchParams }: SearchPageProps): Promise<Metadata> {
  const dict = await getDictionary(params.lang);
  const query = searchParams.q || "";
  
  return {
    title: query ? dict.search.search_results_title.replace('{query}', query) : dict.search.search_title,
    description: query 
      ? dict.search.search_results_description.replace('{query}', query)
      : dict.search.search_description,
  };
}

async function SearchResults({ searchParams, lang }: { searchParams: SearchPageProps["searchParams"]; lang: Locale }) {
  const dict = await getDictionary(lang);
  const query = searchParams.q || "";
  const categoryFilter = searchParams.category || "";
  const sortBy = searchParams.sort || "relevance";
  const viewMode = searchParams.view || "grid";

  // Get search results
  let results: Game[] = [];
  if (query.trim()) {
    results = searchGames(query);
  } else {
    // If no query, show all games
    results = [...require("../../../../data/mock-games").games];
  }

  // Apply category filter
  if (categoryFilter) {
    results = results.filter(game => game.categoryId === categoryFilter);
  }

  // Apply sorting
  switch (sortBy) {
    case "rating":
      results.sort((a, b) => b.rating - a.rating);
      break;
    case "newest":
      results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      break;
    case "popular":
      results.sort((a, b) => Math.random() - 0.5); // Random for demo
      break;
    default:
      // Keep relevance order from search
      break;
  }

  const selectedCategory = categoryFilter ? getCategoryById(categoryFilter) : null;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href={`/${lang}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {dict.search.back_to_home}
            </Button>
          </Link>
        </div>
        
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {query ? (
                <>{dict.search.search_results_for.replace('{query}', query)}</>
              ) : (
                dict.search.browse_all_games
              )}
            </h1>
            <p className="text-muted-foreground">
              {dict.search.games_found.replace('{count}', results.length.toString())}
              {selectedCategory && (
                <> {dict.search.in_category.replace('{category}', selectedCategory.name)}</>
              )}
            </p>
          </div>
          
          {/* Search Bar */}
          <div className="w-full lg:w-96">
            <GameSearch lang={lang} placeholder={dict.search.search_placeholder} />
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 flex flex-wrap gap-2">
          {/* Category Filter */}
          <Select value={categoryFilter} onValueChange={(value) => {
            const params = new URLSearchParams(window.location.search);
            if (value) {
              params.set('category', value);
            } else {
              params.delete('category');
            }
            window.location.search = params.toString();
          }}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder={dict.search.all_categories} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">{dict.search.all_categories}</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort Filter */}
          <Select value={sortBy} onValueChange={(value) => {
            const params = new URLSearchParams(window.location.search);
            params.set('sort', value);
            window.location.search = params.toString();
          }}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">{dict.search.sort_relevance}</SelectItem>
              <SelectItem value="rating">{dict.search.sort_rating}</SelectItem>
              <SelectItem value="newest">{dict.search.sort_newest}</SelectItem>
              <SelectItem value="popular">{dict.search.sort_popular}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* View Mode Toggle */}
        <div className="flex gap-1 border rounded-lg p-1">
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            onClick={() => {
              const params = new URLSearchParams(window.location.search);
              params.set('view', 'grid');
              window.location.search = params.toString();
            }}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => {
              const params = new URLSearchParams(window.location.search);
              params.set('view', 'list');
              window.location.search = params.toString();
            }}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Results */}
      {results.length > 0 ? (
        <div className={viewMode === "grid" ? 
          "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" :
          "space-y-4"
        }>
          {results.map((game: Game) => {
            const category = getCategoryById(game.categoryId);
            
            if (viewMode === "list") {
              return (
                <Card key={game.id} className="hover:shadow-lg transition-shadow">
                  <div className="flex items-center p-4 gap-4">
                    <img
                      src={game.coverImage || '/placeholder-game.jpg'}
                      alt={game.title}
                      className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg mb-1 truncate">{game.title}</h3>
                      <p className="text-muted-foreground text-sm mb-2 line-clamp-2">
                        {game.description || dict.search.no_description}
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <span className="text-yellow-500">★</span>
                          {game.rating.toFixed(1)}
                        </span>
                        <span className="bg-muted px-2 py-1 rounded-full">
                          {category?.name || dict.search.unknown_category}
                        </span>
                        <span className="text-muted-foreground">
                          {new Date(game.createdAt).getFullYear()}
                        </span>
                      </div>
                    </div>
                    <Link href={`/${lang}/games/${game.id}`}>
                      <Button>{dict.search.play_now}</Button>
                    </Link>
                  </div>
                </Card>
              );
            }

            return (
              <Card key={game.id} className="group hover:shadow-lg transition-all duration-300">
                <div className="aspect-video relative overflow-hidden rounded-t-lg">
                  <img
                    src={game.coverImage || '/placeholder-game.jpg'}
                    alt={game.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2">
                    <span className="bg-black/70 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                      <span className="text-yellow-400">★</span>
                      {game.rating.toFixed(1)}
                    </span>
                  </div>
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg line-clamp-1">{game.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {game.description || dict.search.no_description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm bg-muted px-2 py-1 rounded-full">
                      {category?.name || dict.search.unknown_category}
                    </span>
                    <Link href={`/${lang}/games/${game.id}`}>
                      <Button size="sm">{dict.search.play}</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <Search className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-xl font-semibold mb-2">{dict.search.no_games_found}</h3>
          <p className="text-muted-foreground mb-4">
            {query ? (
              <>{dict.search.no_games_matching.replace('{query}', query)}</>
            ) : (
              dict.search.no_games_filters
            )}
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Link href={`/${lang}`}>
              <Button variant="outline">{dict.search.browse_all_games}</Button>
            </Link>
            {(query || categoryFilter) && (
              <Button
                variant="outline"
                onClick={() => {
                  window.location.href = `/${lang}/search`;
                }}
              >
                {dict.search.clear_filters}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SearchPage({ params, searchParams }: SearchPageProps) {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-64 mb-4"></div>
          <div className="h-4 bg-muted rounded w-32 mb-8"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-muted rounded-lg h-64"></div>
            ))}
          </div>
        </div>
      </div>
    }>
      <SearchResults searchParams={searchParams} lang={params.lang} />
    </Suspense>
  );
}