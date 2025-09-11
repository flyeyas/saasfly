import { notFound } from "next/navigation";
import Link from "next/link";
import { getDictionary } from "~/lib/get-dictionary";
import { getGameBySlug, getRelatedGames, getCategoryById } from "~/data/mock-games";
import { Star, Play, Heart, Share2, ArrowLeft, Gamepad2, Rocket, Calendar, Users, Tag, Info, Trophy, Music, Globe, Gem, Settings, Flag, Expand } from "lucide-react";

import type { Locale } from "~/config/i18n-config";

interface GameDetailPageProps {
  params: {
    lang: Locale;
    id: string;
  };
}

export default async function GameDetailPage({
  params: { lang, id },
}: GameDetailPageProps) {
  const dict = await getDictionary(lang);
  
  // Use slug as id for mock data
  const game = getGameBySlug(id);
  
  if (!game || !game.isActive) {
    notFound();
  }
  
  const relatedGames = getRelatedGames(game);

  // Structured Data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "VideoGame",
    "name": game.title,
    "description": game.description,
    "image": game.coverImage,
    "url": `https://yourdomain.com/${lang}/games/${game.slug}`,
    "genre": getCategoryById(game.categoryId)?.name || "Game",
    "gamePlatform": "Web Browser",
    "operatingSystem": "Any",
    "applicationCategory": "Game",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": game.rating,
      "ratingCount": Math.floor(game.playCount / 10),
      "bestRating": "5",
      "worstRating": "1"
    },
    "interactionStatistic": {
      "@type": "InteractionCounter",
      "interactionType": "https://schema.org/PlayAction",
      "userInteractionCount": game.playCount
    },
    "keywords": game.tags?.join(", ") || "HTML5, Game, Browser",
    "datePublished": "2024-01-01",
    "publisher": {
      "@type": "Organization",
      "name": "HTML5 Games Platform",
      "url": "https://yourdomain.com"
    }
  };

  return (
    <div className="game-detail-page">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      
      {/* Navigation */}
      <nav className="game-nav bg-white border-b">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <Link href={`/${lang}/games`} className="inline-flex items-center text-gray-600 hover:text-gray-900 text-sm md:text-base">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {dict.game_detail.back_to_games}
          </Link>
        </div>
      </nav>

      {/* Game Header */}
      <section className="game-header">
        <div className="game-header-content">
          <div 
            className="game-icon" 
            style={{ backgroundImage: `url(${game.coverImage})` }}
          ></div>
          
          <div className="game-info">
            <h1 className="game-title">
              <Rocket className="w-8 h-8 mr-3" />
              {game.title}
            </h1>
            <p className="game-subtitle">
              {game.description}
            </p>
            
            <div className="game-meta flex-wrap gap-3 md:gap-6">
              <div className="meta-item">
                 <Tag className="meta-icon" />
                 <span className="text-sm md:text-base">{getCategoryById(game.categoryId)?.name || dict.game_detail.unknown_category}</span>
               </div>
              <div className="meta-item hidden sm:flex">
                <Calendar className="meta-icon" />
                <span className="text-sm md:text-base">{new Date(game.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</span>
              </div>
              <div className="meta-item hidden md:flex">
                <Users className="meta-icon" />
                <span className="text-sm md:text-base">{dict.game_detail.single_player}</span>
              </div>
              <div className="meta-item">
                <Star className="meta-icon" />
                <span className="text-sm md:text-base">{game.rating} {dict.game_detail.rating}</span>
              </div>
            </div>
            
            <div className="game-tags">
              {game.tags?.map((tag, index) => (
                <span key={index} className="game-tag">{tag}</span>
              )) || [
                <span key="html5" className="game-tag">HTML5</span>,
                <span key="adventure" className="game-tag">Adventure</span>,
                <span key="fun" className="game-tag">Fun</span>
              ]}
            </div>
          </div>
          
          <div className="game-actions">
            <button className="play-btn">
              <Play className="w-5 h-5" />
              <span>{dict.game_detail.start_game}</span>
            </button>
            
            <div className="action-buttons">
              <button className="action-btn" title={dict.game_detail.favorite_game}>
                <Heart className="w-5 h-5" />
              </button>
              <button className="action-btn" title={dict.game_detail.share_game}>
                <Share2 className="w-5 h-5" />
              </button>
              <button className="action-btn" title={dict.game_detail.report_game}>
                <Flag className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="main-content-section">
        <div className="container mx-auto px-4">
          <div className="main-content grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="left-content lg:col-span-2">
              {/* Game Container */}
              <div className="game-container bg-white rounded-xl overflow-hidden shadow-lg mb-6">
                <div className="game-frame-header bg-gray-100 px-4 py-3 border-b flex items-center justify-between">
                  <div className="frame-controls flex gap-2">
                    <div className="control-btn close w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="control-btn minimize w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="control-btn maximize w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="frame-title text-sm font-medium text-gray-600 truncate mx-4">{game.title}</div>
                  <div className="frame-actions flex gap-2">
                    <button className="frame-btn p-1 hover:bg-gray-200 rounded">
                      <Expand className="w-4 h-4 text-gray-500" />
                    </button>
                    <button className="frame-btn p-1 hover:bg-gray-200 rounded">
                      <Settings className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </div>
                <div className="game-frame">
                  <iframe
                    src={game.iframeUrl}
                    title={game.title}
                    className="game-iframe w-full h-64 sm:h-80 md:h-96 lg:h-[500px] border-none"
                    allowFullScreen
                  />
                </div>
              </div>

              {/* Game Description */}
              <div className="game-description bg-white rounded-xl p-4 md:p-6 shadow-lg mb-6">
                <h2 className="text-xl md:text-2xl font-bold mb-4">{dict.game_detail.about_this_game}</h2>
                <p className="text-gray-700 mb-6 text-sm md:text-base leading-relaxed">{game.description || dict.game_detail.no_description_available}</p>
                
                <div className="game-features">
                  <h3 className="text-lg md:text-xl font-semibold mb-3">{dict.game_detail.game_features}</h3>
                  <ul className="space-y-2 text-sm md:text-base">
                    <li className="flex items-center"><span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>{dict.game_detail.feature_free_to_play}</li>
                    <li className="flex items-center"><span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>{dict.game_detail.feature_no_download}</li>
                    <li className="flex items-center"><span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>{dict.game_detail.feature_instant_play}</li>
                    <li className="flex items-center"><span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>{dict.game_detail.feature_mobile_friendly}</li>
                  </ul>
                </div>
              </div>

              {/* Rating and Reviews */}
              <div className="rating-section bg-white rounded-xl p-4 md:p-6 shadow-lg mb-6">
                <h2 className="text-xl md:text-2xl font-bold mb-4">{dict.game_detail.ratings_reviews}</h2>
                <div className="rating-overview flex flex-col lg:flex-row gap-6">
                  <div className="rating-score text-center lg:text-left">
                    <span className="score text-4xl md:text-5xl font-bold text-blue-600">{game.rating}</span>
                    <div className="stars flex justify-center lg:justify-start my-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-5 h-5 mx-0.5 ${
                            star <= Math.floor(game.rating)
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="rating-count text-sm text-gray-600">Based on {Math.floor(game.playCount / 10)} reviews</span>
                  </div>
                  <div className="rating-bars flex-1 space-y-2">
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <div key={rating} className="rating-bar flex items-center gap-3">
                        <span className="rating-label text-sm w-4">{rating}</span>
                        <div className="bar-container flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bar-fill bg-yellow-400 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${rating <= game.rating ? (rating / 5) * 100 : 20}%` }}
                          ></div>
                        </div>
                        <span className="rating-percentage text-sm text-gray-600 w-10">{rating <= game.rating ? Math.floor((rating / 5) * 100) : 20}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="right-sidebar lg:col-span-1 space-y-6">
              <div className="game-stats bg-white rounded-xl p-4 md:p-6 shadow-lg">
                <h3 className="text-lg md:text-xl font-bold mb-4">{dict.game_statistics}</h3>
                <div className="space-y-4">
                  <div className="stat-item flex items-center gap-3">
                    <Trophy className="stat-icon w-5 h-5 text-yellow-500" />
                    <div className="stat-content flex-1">
                      <span className="stat-label block text-xs text-gray-600">{dict.game_detail.total_plays}</span>
                      <span className="stat-value text-lg font-semibold">{game.playCount.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="stat-item flex items-center gap-3">
                    <Star className="stat-icon w-5 h-5 text-yellow-400" />
                    <div className="stat-content flex-1">
                      <span className="stat-label block text-xs text-gray-600">{dict.game_detail.rating}</span>
                      <span className="stat-value text-lg font-semibold">{game.rating}/5</span>
                    </div>
                  </div>
                  <div className="stat-item flex items-center gap-3">
                    <Tag className="stat-icon w-5 h-5 text-blue-500" />
                    <div className="stat-content flex-1">
                      <span className="stat-label block text-xs text-gray-600">{dict.game_detail.category}</span>
                      <span className="stat-value text-sm font-medium">{getCategoryById(game.categoryId)?.name ?? 'Unknown'}</span>
                    </div>
                  </div>
                  <div className="stat-item flex items-start gap-3">
                    <Gem className="stat-icon w-5 h-5 text-purple-500 mt-1" />
                    <div className="stat-content flex-1">
                      <span className="stat-label block text-xs text-gray-600">{dict.game_detail.tags}</span>
                      <span className="stat-value text-sm font-medium">{game.tags?.join(", ") || "HTML5, Adventure, Fun"}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="game-controls bg-white rounded-xl p-4 md:p-6 shadow-lg">
                <h3 className="text-lg md:text-xl font-bold mb-4">{dict.game_detail.game_controls}</h3>
                <div className="controls-list space-y-3">
                  <div className="control-item flex items-center justify-between">
                    <span className="control-key bg-gray-100 px-3 py-1 rounded text-sm font-mono">WASD</span>
                    <span className="control-desc text-sm text-gray-600">{dict.game_detail.control_move}</span>
                  </div>
                  <div className="control-item flex items-center justify-between">
                    <span className="control-key bg-gray-100 px-3 py-1 rounded text-sm font-mono">SPACE</span>
                    <span className="control-desc text-sm text-gray-600">{dict.game_detail.control_action}</span>
                  </div>
                  <div className="control-item flex items-center justify-between">
                    <span className="control-key bg-gray-100 px-3 py-1 rounded text-sm font-mono">ESC</span>
                    <span className="control-desc text-sm text-gray-600">{dict.game_detail.control_pause}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Games */}
      {relatedGames.length > 0 && (
        <section className="related-games-section bg-gray-50 py-8 lg:py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-center lg:text-left">{dict.game_detail.related_games}</h2>
            <div className="games-grid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {relatedGames.map((relatedGame) => (
                <Link key={relatedGame.id} href={`/${lang}/games/${relatedGame.slug}`} className="game-card bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="game-image relative aspect-square overflow-hidden">
                    <img src={relatedGame.coverImage || ''} alt={relatedGame.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                    <div className="game-overlay absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 flex items-center justify-center transition-all duration-300">
                      <Gamepad2 className="play-icon w-8 h-8 md:w-10 md:h-10 text-white opacity-0 hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  </div>
                  <div className="game-info p-3 md:p-4">
                    <h3 className="game-title text-sm md:text-base font-semibold mb-1 line-clamp-2 leading-tight">{relatedGame.title}</h3>
                    <p className="game-category text-xs md:text-sm text-gray-600 mb-2 truncate">{getCategoryById(relatedGame.categoryId)?.name || 'Unknown'}</p>
                    <div className="game-meta flex items-center justify-between text-xs">
                      <span className="game-rating flex items-center gap-1 text-yellow-500">
                        <Star className="w-3 h-3 md:w-4 md:h-4 fill-current" />
                        <span className="text-gray-700">{relatedGame.rating}</span>
                      </span>
                      <span className="game-plays text-gray-500 text-xs">{Math.floor(relatedGame.playCount / 1000)}k plays</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

interface GenerateMetadataProps {
  params: {
    id: string;
    lang: Locale;
  };
}

export async function generateMetadata({
  params: { id, lang },
}: GenerateMetadataProps) {
  const dict = await getDictionary(lang);
  const game = getGameBySlug(id);
  
  if (!game) {
    return {
      title: dict.game_not_found_title,
      description: dict.game_not_found_description,
    };
  }

  const category = getCategoryById(game.categoryId);
  const gameUrl = `https://yourdomain.com/${lang}/games/${game.slug}`;
  
  return {
    title: dict.game_meta_title.replace('{title}', game.title),
    description: dict.game_meta_description
      .replace('{title}', game.title)
      .replace('{description}', game.description || '')
      .replace('{rating}', game.rating.toString())
      .replace('{playCount}', game.playCount.toLocaleString()),
    keywords: [
      game.title,
      dict.game_meta_keywords_base,
      category?.name || 'game',
      ...(game.tags || []),
    ].join(', '),
    authors: [{ name: dict.game_meta_authors }],
    creator: dict.game_meta_authors,
    publisher: dict.game_meta_authors,
    formatDetection: {
      telephone: false,
    },
    metadataBase: new URL('https://yourdomain.com'),
    alternates: {
      canonical: gameUrl,
      languages: {
        'en-US': `/en/games/${game.slug}`,
        'x-default': `/en/games/${game.slug}`,
      },
    },
    openGraph: {
      title: dict.game_meta_og_title.replace('{title}', game.title),
      description: dict.game_meta_og_description
        .replace('{title}', game.title)
        .replace('{description}', game.description || ''),
      url: gameUrl,
      siteName: dict.game_meta_og_sitename,
      images: [
        {
          url: game.coverImage,
          width: 1200,
          height: 630,
          alt: dict.game_meta_og_image_alt.replace('{title}', game.title),
        },
      ],
      locale: lang,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: dict.game_meta_twitter_title.replace('{title}', game.title),
      description: dict.game_meta_twitter_description
        .replace('{title}', game.title)
        .replace('{rating}', game.rating.toString()),
      images: [game.coverImage],
      creator: dict.game_meta_twitter_creator,
      site: dict.game_meta_twitter_site,
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