import Link from "next/link";
import Image from "next/image";
import { getDictionary } from "~/lib/get-dictionary";

import { Button } from "@saasfly/ui/button";
import * as Icons from "@saasfly/ui/icons";

import type { Locale } from "~/config/i18n-config";
import { getFeaturedGames, getPopularGames, getLatestGames, categories } from "~/data/mock-games";
import { Gamepad2, TrendingUp, Clock, Star, Search, ArrowRight, Play } from "lucide-react";
import GameSearch from "~/components/search/GameSearch";
import "~/styles/games.css";

// Game statistics
const gameStats = {
  totalGames: "500+",
  categories: categories.length,
  playersOnline: "1M+",
  onlineService: "24/7"
};

export default async function IndexPage({
  params: { lang },
}: {
  params: {
    lang: Locale;
  };
}) {
  const dict = await getDictionary(lang);
  const featuredGames = getFeaturedGames();
  const hotGames = getPopularGames();
  const latestGames = getLatestGames();

  // Structured Data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "HTML5 Games Platform",
    "description": "Play thousands of free HTML5 games online. No downloads required - play instantly in your browser!",
    "url": `https://yourdomain.com/${lang}`,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `https://yourdomain.com/${lang}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": "HTML5 Games Platform",
      "url": "https://yourdomain.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://yourdomain.com/logo.png"
      }
    }
  };

  const gameCollectionData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Featured HTML5 Games",
    "description": "Collection of popular and featured HTML5 games",
    "numberOfItems": featuredGames.length,
    "itemListElement": featuredGames.map((game, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "VideoGame",
        "name": game.title,
        "description": game.description,
        "image": game.coverImage,
        "url": `https://yourdomain.com/${lang}/games/${game.slug}`,
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": game.rating,
          "ratingCount": Math.floor(game.playCount / 10)
        }
      }
    }))
  };

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(gameCollectionData),
        }}
      />
      
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              Play Amazing HTML5 Games
              <span className="hero-subtitle">Free Online Games Collection</span>
            </h1>
            <p className="hero-description">
              Discover thousands of free HTML5 games. Play instantly in your browser - no downloads required!
            </p>
            
            {/* Search Bar */}
            <div className="search-container">
              <div className="max-w-md mx-auto w-full px-4">
                <GameSearch lang={lang} placeholder="Search for games..." />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-number">{gameStats.totalGames}</span>
            <span className="stat-label">Games Available</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{gameStats.categories}</span>
            <span className="stat-label">Game Categories</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{gameStats.playersOnline}</span>
            <span className="stat-label">Active Players</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{gameStats.onlineService}</span>
            <span className="stat-label">Online Service</span>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories-section">
        <div className="section-header">
          <h2 className="section-title">Popular Game Categories</h2>
          <p className="section-subtitle">
            Explore various exciting game types and find the perfect entertainment for you
          </p>
        </div>
        
        <div className="categories-grid">
          {categories.map((category: any) => (
            <Link key={category.id} href={`/${lang}/games/category/${category.slug}`} className="category-card">
              <div className="category-image" style={{backgroundImage: `url(${category.image || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'})`}}>
                <div className="category-overlay">
                  <Gamepad2 className="category-icon" />
                </div>
              </div>
              <div className="category-content">
                <h3 className="category-title">{category.name}</h3>
                <p className="category-description">{category.description}</p>
                <div className="category-stats">
                  <span className="game-count">{category.gameCount}+ games</span>
                  <ArrowRight className="category-arrow" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Games */}
      <section className="featured-games">
        <div className="section-header">
          <h2 className="section-title">Featured Games</h2>
          <p className="section-subtitle">
            Editor's carefully selected quality games for the best gaming experience
          </p>
        </div>
        
        <div className="games-grid grid-responsive">
          {featuredGames.slice(0, 6).map((game: any) => (
            <Link key={game.id} href={`/${lang}/games/${game.slug}`} className="game-card">
              <div className="game-thumbnail" style={{backgroundImage: `url(${game.coverImage})`}}>
                <div className="game-overlay">
                  <button className="play-button">
                    <Play className="w-6 h-6" />
                  </button>
                </div>
              </div>
              <div className="game-info">
                <h3 className="game-title">{game.title}</h3>
                <div className="game-meta">
                  <span className="game-category">{game.category}</span>
                  <div className="game-rating">
                    <div className="rating-stars">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < Math.floor(game.rating) ? 'fill-current text-yellow-400' : 'text-gray-300'}`} />
                      ))}
                    </div>
                    <span className="rating-score">{game.rating}</span>
                  </div>
                </div>
                <p className="game-description">{game.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Hot Games */}
      <section className="featured-games bg-gray-50">
        <div className="section-header">
          <h2 className="section-title">🔥 Hot Games</h2>
          <p className="section-subtitle">
            Most popular games trending right now
          </p>
        </div>
        
        <div className="games-grid grid-responsive">
          {hotGames.slice(0, 6).map((game: any) => (
            <Link key={game.id} href={`/${lang}/games/${game.slug}`} className="game-card">
              <div className="game-thumbnail" style={{backgroundImage: `url(${game.coverImage})`}}>
                <div className="game-overlay">
                  <button className="play-button">
                    <Play className="w-6 h-6" />
                  </button>
                </div>
              </div>
              <div className="game-info">
                <h3 className="game-title">{game.title}</h3>
                <div className="game-meta">
                  <span className="game-category">{game.category}</span>
                  <div className="game-rating">
                    <div className="rating-stars">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < Math.floor(game.rating) ? 'fill-current text-yellow-400' : 'text-gray-300'}`} />
                      ))}
                    </div>
                    <span className="rating-score">{game.rating}</span>
                  </div>
                </div>
                <p className="game-description">{game.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Latest Games */}
      <section className="featured-games">
        <div className="section-header">
          <h2 className="section-title">🆕 Latest Games</h2>
          <p className="section-subtitle">
            Newest additions to our game collection
          </p>
        </div>
        
        <div className="games-grid grid-responsive">
          {latestGames.slice(0, 6).map((game: any) => (
            <Link key={game.id} href={`/${lang}/games/${game.slug}`} className="game-card">
              <div className="game-thumbnail" style={{backgroundImage: `url(${game.coverImage})`}}>
                <div className="game-overlay">
                  <button className="play-button">
                    <Play className="w-6 h-6" />
                  </button>
                </div>
              </div>
              <div className="game-info">
                <h3 className="game-title">{game.title}</h3>
                <div className="game-meta">
                  <span className="game-category">{game.category}</span>
                  <div className="game-rating">
                    <div className="rating-stars">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < Math.floor(game.rating) ? 'fill-current text-yellow-400' : 'text-gray-300'}`} />
                      ))}
                    </div>
                    <span className="rating-score">{game.rating}</span>
                  </div>
                </div>
                <p className="game-description">{game.description}</p>
              </div>
            </Link>
          ))}
        </div>
       </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2 className="cta-title">Ready to Start Playing?</h2>
          <p className="cta-description">
            Join millions of players worldwide and discover your next favorite game today!
          </p>
          <div className="cta-buttons">
            <Link href={`/${lang}/games`}>
              <Button className="btn btn-primary btn-lg">
                Browse All Games
              </Button>
            </Link>
            <Link href={`/${lang}/games/category/action`}>
              <Button className="btn btn-secondary btn-lg">
                Popular Categories
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>  
  );
}

export async function generateMetadata({
  params: { lang },
}: {
  params: {
    lang: Locale;
  };
}) {
  const homeUrl = `https://yourdomain.com/${lang}`;
  
  return {
    title: "Free HTML5 Games - Play Online Games Instantly | HTML5 Games Platform",
    description: "Play thousands of free HTML5 games online! No downloads required. Enjoy action, puzzle, adventure, and more games directly in your browser. Updated daily with new games.",
    keywords: [
      'HTML5 games',
      'free online games',
      'browser games',
      'no download games',
      'instant play games',
      'web games',
      'action games',
      'puzzle games',
      'adventure games',
      'arcade games'
    ].join(', '),
    authors: [{ name: 'HTML5 Games Platform' }],
    creator: 'HTML5 Games Platform',
    publisher: 'HTML5 Games Platform',
    formatDetection: {
      telephone: false,
    },
    metadataBase: new URL('https://yourdomain.com'),
    alternates: {
      canonical: homeUrl,
      languages: {
        'en-US': '/en',
        'x-default': '/en',
      },
    },
    openGraph: {
      title: 'Free HTML5 Games - Play Online Games Instantly',
      description: 'Play thousands of free HTML5 games online! No downloads required. Action, puzzle, adventure games and more.',
      url: homeUrl,
      siteName: 'HTML5 Games Platform',
      images: [
        {
          url: '/og-image.jpg',
          width: 1200,
          height: 630,
          alt: 'HTML5 Games Platform - Free Online Games',
        },
      ],
      locale: lang,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Free HTML5 Games - Play Online Games Instantly',
      description: 'Play thousands of free HTML5 games online! No downloads required.',
      images: ['/og-image.jpg'],
      creator: '@html5games',
      site: '@html5games',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: 'your-google-verification-code',
    },
  };
}
