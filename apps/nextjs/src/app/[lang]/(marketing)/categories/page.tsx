import Link from "next/link";
import { ChevronRight, Grid, Search, TrendingUp } from "lucide-react";
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

import { getDictionary } from "~/lib/get-dictionary";
import type { Locale } from "~/config/i18n-config";
import { games, categories, type Game, type Category } from "../../../../data/mock-games";

interface CategoriesPageProps {
  params: {
    lang: Locale;
  };
}

export default async function CategoriesPage({ params }: CategoriesPageProps) {
  const dict = await getDictionary(params.lang);
  
  // Calculate games count per category
  const getCategoryGameCount = (categoryId: string) => {
    return games.filter((game: Game) => game.categoryId === categoryId).length;
  };

  // Get most popular category
  const getMostPopularCategory = () => {
    return categories.reduce((max, cat) => 
      getCategoryGameCount(cat.id) > getCategoryGameCount(max.id) ? cat : max
    );
  };

  const mostPopular = getMostPopularCategory();

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
            <span className="text-foreground">{dict.categories.all_categories}</span>
          </nav>

          {/* Page Header */}
          <div className="text-center">
            <h1 className="text-4xl md:text-3xl sm:text-2xl font-bold tracking-tight mb-4">{dict.categories.page_title}</h1>
            <p className="text-xl md:text-lg sm:text-base text-muted-foreground max-w-2xl mx-auto px-4">
              {dict.categories.page_subtitle.replace('{count}', categories.length.toString()).replace('{total}', games.length.toString())}
            </p>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={dict.categories.search_placeholder}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Featured Category */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">{dict.categories.most_popular_category}</h2>
            <p className="text-muted-foreground">
              {dict.categories.most_popular_subtitle}
            </p>
          </div>
          <Card className="max-w-2xl mx-auto hover:shadow-lg transition-shadow">
            <CardContent className="p-8">
              <div className="flex items-center justify-center mb-6">
                <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-3xl">
                  {mostPopular.icon || mostPopular.name.charAt(0)}
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-2">{mostPopular.name}</h3>
                <p className="text-muted-foreground mb-4">
                  {mostPopular.description}
                </p>
                <div className="flex items-center justify-center gap-6 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {getCategoryGameCount(mostPopular.id)}
                    </div>
                    <div className="text-sm text-muted-foreground">{dict.categories.games_count}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {Math.round(games.filter(g => g.categoryId === mostPopular.id).reduce((sum, g) => sum + g.playCount, 0) / 1000)}K
                    </div>
                    <div className="text-sm text-muted-foreground">{dict.categories.total_plays}</div>
                  </div>
                </div>
                <Button asChild size="lg">
                  <Link href={`/${params.lang}/categories/${mostPopular.id}`}>
                    {dict.categories.explore_category.replace('{name}', mostPopular.name)}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">{dict.categories.all_categories_title}</h2>
          <p className="text-muted-foreground">
            {dict.categories.all_categories_subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4 sm:px-0">
          {categories.map((category: Category) => {
            const gameCount = getCategoryGameCount(category.id);
            const totalPlays = games
              .filter((g: Game) => g.categoryId === category.id)
              .reduce((sum, g) => sum + g.playCount, 0);
            
            return (
              <Link key={category.id} href={`/${params.lang}/categories/${category.id}`}>
                <Card className="h-full group hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
                  <CardHeader className="text-center pb-4">
                    <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                      {category.icon || category.name.charAt(0)}
                    </div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      {category.name}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {category.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{dict.categories.games_count}</span>
                        <span className="font-semibold">{gameCount}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{dict.categories.total_plays}</span>
                        <span className="font-semibold">
                          {totalPlays > 1000 ? `${Math.round(totalPlays / 1000)}K` : totalPlays}
                        </span>
                      </div>
                      <div className="pt-2">
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300 group-hover:from-blue-600 group-hover:to-purple-700"
                            style={{ width: `${Math.min((gameCount / Math.max(...categories.map(c => getCategoryGameCount(c.id)))) * 100, 100)}%` }}
                          />
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 text-center">
                          {dict.categories.popularity}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-muted/30 border-t">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">{dict.categories.platform_statistics}</h2>
            <p className="text-muted-foreground">
              {dict.categories.platform_statistics_subtitle}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center mx-auto mb-4">
                  <Grid className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {categories.length}
                </div>
                <div className="text-sm text-muted-foreground">
                  {dict.categories.game_categories_stat}
                </div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {games.length}
                </div>
                <div className="text-sm text-muted-foreground">
                  {dict.categories.total_games_stat}
                </div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {Math.round(games.reduce((sum, g) => sum + g.playCount, 0) / 1000)}K
                </div>
                <div className="text-sm text-muted-foreground">
                  {dict.categories.total_plays_stat}
                </div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  {Math.round(games.length / categories.length)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {dict.categories.avg_games_per_category}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="border-t">
        <div className="container mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl font-bold mb-4">{dict.categories.ready_to_play}</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            {dict.categories.ready_to_play_subtitle}
          </p>
          <Button asChild size="lg">
            <Link href={`/${params.lang}`}>
              {dict.categories.browse_all_games}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: CategoriesPageProps): Promise<Metadata> {
  const dict = await getDictionary(params.lang);
  
  return {
    title: dict.categories.page_title,
    description: dict.categories.page_subtitle.replace('{count}', categories.length.toString()).replace('{total}', games.length.toString()),
  };
}