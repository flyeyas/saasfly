import { getDictionary } from "~/lib/get-dictionary";
import { trpc } from "~/trpc/server";
import { GameGrid } from "~/components/game-grid";

import type { Locale } from "~/config/i18n-config";

export default async function GamesPage({
  params: { lang },
  searchParams,
}: {
  params: {
    lang: Locale;
  };
  searchParams: { category?: string; search?: string };
}) {
  const dict = await getDictionary(lang);
  const gamesResult = await trpc.game.list.query({
    page: 1,
    limit: 50,
    search: searchParams.search,
    isActive: true,
  });
  const games = gamesResult.games;

  return (
    <>
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container">
          <h1 className="text-4xl font-bold mb-4">Free Online Games</h1>
          <p className="text-xl opacity-90">Discover and play amazing games right in your browser</p>
        </div>
      </section>
      
      <section className="container py-8">
        <GameGrid games={games} lang={lang} />
        
        {games.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No games found</p>
          </div>
        )}
      </section>
    </>
  );
}

export const metadata = {
  title: "Games - Play Free Online Games",
  description: "Discover and play amazing free online games. Choose from various categories and enjoy hours of entertainment.",
};