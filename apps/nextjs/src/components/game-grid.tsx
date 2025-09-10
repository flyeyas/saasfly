"use client";

import Image from "next/image";
import Link from "next/link";

interface Game {
  id: string;
  title: string;
  description: string | null;
  coverImage: string | null;
  iframeUrl: string;
  isActive: boolean;
  slug: string;
  playCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface GameGridProps {
  games: Game[];
  lang: string;
}

export function GameGrid({ games, lang }: GameGridProps) {
  if (!games || games.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          No games available
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Check back later for new games!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {games.map((game) => (
        <Link
          key={game.id}
          href={`/${lang}/games/${game.id}`}
          className="group block bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
        >
          <div className="aspect-video relative bg-gray-100 dark:bg-gray-700">
            {game.coverImage ? (
              <Image
                src={game.coverImage}
                alt={game.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-200"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-4xl">🎮</div>
              </div>
            )}
            {!game.isActive && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <span className="text-white font-medium">Coming Soon</span>
              </div>
            )}
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {game.title}
            </h3>
            {game.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                {game.description}
              </p>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}