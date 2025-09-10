"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";

import { Button } from "@saasfly/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@saasfly/ui/card";
import { Input } from "@saasfly/ui/input";

import { games, categories, searchGames, getCategoryById, type Game } from "../../data/mock-games";

interface GameSearchProps {
  lang: string;
  placeholder?: string;
  className?: string;
}

export default function GameSearch({ lang, placeholder = "Search games...", className = "" }: GameSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Game[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle search
  useEffect(() => {
    if (query.trim().length === 0) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    
    // Simulate API delay
    const timeoutId = setTimeout(() => {
      const searchResults = searchGames(query);
      setResults(searchResults.slice(0, 8)); // Limit to 8 results
      setIsOpen(true);
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Handle click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleResultClick = () => {
    setIsOpen(false);
    setQuery("");
  };

  return (
    <div ref={searchRef} className={`relative w-full ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query && setIsOpen(true)}
          className="pl-10 pr-10 w-full text-sm md:text-base"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 max-h-96 overflow-hidden shadow-lg w-full">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-3 sm:p-4 text-center text-muted-foreground">
                <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-primary mx-auto mb-2"></div>
                <span className="text-sm">Searching...</span>
              </div>
            ) : results.length > 0 ? (
              <>
                <div className="p-2 sm:p-3 border-b bg-muted/50">
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Found {results.length} game{results.length !== 1 ? 's' : ''} for "{query}"
                  </p>
                </div>
                <div className="max-h-64 sm:max-h-80 overflow-y-auto">
                  {results.map((game: Game) => {
                    const category = getCategoryById(game.categoryId);
                    return (
                      <Link
                        key={game.id}
                        href={`/${lang}/games/${game.id}`}
                        onClick={handleResultClick}
                        className="block hover:bg-muted/50 transition-colors"
                      >
                        <div className="p-2 sm:p-3 border-b last:border-b-0">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <img
                              src={game.coverImage || '/placeholder-game.jpg'}
                              alt={game.title}
                              className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-xs sm:text-sm truncate">
                                {game.title}
                              </h4>
                              <p className="text-xs text-muted-foreground truncate hidden sm:block">
                                {game.description || 'No description available'}
                              </p>
                              <div className="flex items-center gap-1 sm:gap-2 mt-1">
                                <span className="text-xs bg-muted px-1.5 sm:px-2 py-0.5 rounded-full">
                                  {category?.name || 'Unknown'}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  ★ {game.rating.toFixed(1)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
                {results.length >= 8 && (
                  <div className="p-3 border-t bg-muted/50">
                    <Link
                      href={`/${lang}/search?q=${encodeURIComponent(query)}`}
                      onClick={handleResultClick}
                      className="text-sm text-primary hover:underline"
                    >
                      View all results for "{query}"
                    </Link>
                  </div>
                )}
              </>
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No games found for "{query}"</p>
                <p className="text-xs mt-1">Try searching with different keywords</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Popular Searches (when input is focused but empty) */}
      {isOpen && query.trim().length === 0 && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Popular Categories</CardTitle>
            <CardDescription className="text-xs">
              Browse games by category
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 gap-2">
              {categories.slice(0, 6).map((category) => (
                <Link
                  key={category.id}
                  href={`/${lang}/categories/${category.id}`}
                  onClick={handleResultClick}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <span className="text-lg">{category.icon}</span>
                  <span className="text-sm font-medium">{category.name}</span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}