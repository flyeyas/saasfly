// Mock game data for HTML5 Game Website
// English content only, no database required

export interface Game {
  id: string;
  title: string;
  description: string | null;
  coverImage: string | null;
  iframeUrl: string;
  isActive: boolean;
  slug: string;
  playCount: number;
  categoryId: string;
  rating: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  gameCount: number;
  icon: string;
  createdAt: Date;
  updatedAt: Date;
}

// Game Categories
export const categories: Category[] = [
  {
    id: "1",
    name: "Action Games",
    slug: "action",
    description: "Fast-paced action and adventure games",
    gameCount: 15,
    icon: "⚔️",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "2",
    name: "Puzzle Games",
    slug: "puzzle",
    description: "Brain-teasing puzzle challenges",
    gameCount: 12,
    icon: "🧩",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "3",
    name: "Casual Games",
    slug: "casual",
    description: "Relaxing and fun casual entertainment",
    gameCount: 20,
    icon: "🎮",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "4",
    name: "Strategy Games",
    slug: "strategy",
    description: "Strategic thinking and planning games",
    gameCount: 8,
    icon: "🎯",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "5",
    name: "Racing Games",
    slug: "racing",
    description: "High-speed racing and driving games",
    gameCount: 10,
    icon: "🏎️",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "6",
    name: "Sports Games",
    slug: "sports",
    description: "Athletic and sports simulation games",
    gameCount: 14,
    icon: "⚽",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
];

// Mock Games Data
export const games: Game[] = [
  {
    id: '1',
    title: 'Space Explorer',
    description: 'Navigate through space, avoid asteroids, and collect power-ups in this thrilling space adventure.',
    iframeUrl: 'https://html5games.com/Game/space-explorer/embed',
    coverImage: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=400&h=300&fit=crop',
    slug: 'space-explorer',
    isActive: true,
    playCount: 1250,
    categoryId: '1',
    rating: 4.5,
    tags: ['space', 'shooter', 'retro'],
    createdAt: new Date('2024-01-15T10:00:00Z'),
    updatedAt: new Date('2024-01-15T10:00:00Z')
  },
  {
    id: '2',
    title: 'Puzzle Master',
    description: 'Challenge your mind with increasingly difficult puzzles that will test your logic and creativity.',
    iframeUrl: 'https://html5games.com/Game/puzzle-master/embed',
    coverImage: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=400&h=300&fit=crop',
    slug: 'puzzle-master',
    isActive: true,
    playCount: 890,
    categoryId: '2',
    rating: 4.2,
    tags: ['brain', 'logic', 'challenging'],
    createdAt: new Date('2024-01-14T15:30:00Z'),
    updatedAt: new Date('2024-01-14T15:30:00Z')
  },
  {
    id: '3',
    title: 'Racing Thunder',
    description: 'High-speed racing action with stunning graphics and realistic physics.',
    iframeUrl: 'https://html5games.com/Game/racing-thunder/embed',
    coverImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
    slug: 'racing-thunder',
    isActive: true,
    playCount: 2100,
    categoryId: '5',
    rating: 4.7,
    tags: ['racing', 'cars', 'speed'],
    createdAt: new Date('2024-01-13T09:15:00Z'),
    updatedAt: new Date('2024-01-13T09:15:00Z')
  },
  {
    id: '4',
    title: 'Magic Kingdom',
    description: 'Embark on a magical adventure through enchanted lands filled with mysteries and treasures.',
    iframeUrl: 'https://html5games.com/Game/magic-kingdom/embed',
    coverImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
    slug: 'magic-kingdom',
    isActive: true,
    playCount: 1680,
    categoryId: '1',
    rating: 4.4,
    tags: ['fantasy', 'magic', 'exploration'],
    createdAt: new Date('2024-01-12T14:20:00Z'),
    updatedAt: new Date('2024-01-12T14:20:00Z')
  },
  {
    id: '5',
    title: 'Retro Arcade',
    description: 'Classic arcade gameplay with modern twists. Collect coins, avoid enemies, and beat high scores.',
    iframeUrl: 'https://html5games.com/Game/retro-arcade/embed',
    coverImage: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=300&fit=crop',
    slug: 'retro-arcade',
    isActive: true,
    playCount: 3200,
    categoryId: '3',
    rating: 4.8,
    tags: ['retro', 'classic', 'highscore'],
    createdAt: new Date('2024-01-11T11:45:00Z'),
    updatedAt: new Date('2024-01-11T11:45:00Z')
  },
  {
    id: '6',
    title: 'Strategy Empire',
    description: 'Build your empire, manage resources, and conquer territories in this strategic masterpiece.',
    iframeUrl: 'https://html5games.com/Game/strategy-empire/embed',
    coverImage: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=400&h=300&fit=crop',
    slug: 'strategy-empire',
    isActive: true,
    playCount: 950,
    categoryId: '4',
    rating: 4.3,
    tags: ['empire', 'building', 'tactical'],
    createdAt: new Date('2024-01-10T16:00:00Z'),
    updatedAt: new Date('2024-01-10T16:00:00Z')
  },
  {
    id: '7',
    title: 'Ninja Runner',
    description: 'Run, jump, and slice through obstacles as a skilled ninja in this endless runner game.',
    iframeUrl: 'https://html5games.com/Game/ninja-runner/embed',
    coverImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
    slug: 'ninja-runner',
    isActive: true,
    playCount: 1850,
    categoryId: '1',
    rating: 4.6,
    tags: ['ninja', 'runner', 'endless'],
    createdAt: new Date('2024-01-09T13:30:00Z'),
    updatedAt: new Date('2024-01-09T13:30:00Z')
  },
  {
    id: '8',
    title: 'Ocean Adventure',
    description: 'Dive deep into the ocean, discover marine life, and uncover hidden treasures.',
    iframeUrl: 'https://html5games.com/Game/ocean-adventure/embed',
    coverImage: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop',
    slug: 'ocean-adventure',
    isActive: true,
    playCount: 1320,
    categoryId: '1',
    rating: 4.1,
    tags: ['ocean', 'underwater', 'exploration'],
    createdAt: new Date('2024-01-08T10:15:00Z'),
    updatedAt: new Date('2024-01-08T10:15:00Z')
  },
  {
    id: '9',
    title: 'Word Quest',
    description: 'Test your vocabulary and spelling skills in this engaging word puzzle game.',
    iframeUrl: 'https://html5games.com/Game/word-quest/embed',
    coverImage: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=400&h=300&fit=crop',
    slug: 'word-quest',
    isActive: true,
    playCount: 780,
    categoryId: '2',
    rating: 4.0,
    tags: ['words', 'vocabulary', 'educational'],
    createdAt: new Date('2024-01-07T12:00:00Z'),
    updatedAt: new Date('2024-01-07T12:00:00Z')
  },
  {
    id: '10',
    title: 'Cyber Defense',
    description: 'Defend your base from waves of cyber attacks using advanced weapons and strategies.',
    iframeUrl: 'https://html5games.com/Game/cyber-defense/embed',
    coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop',
    slug: 'cyber-defense',
    isActive: true,
    playCount: 1450,
    categoryId: '4',
    rating: 4.5,
    tags: ['cyber', 'defense', 'futuristic'],
    createdAt: new Date('2024-01-06T14:45:00Z'),
    updatedAt: new Date('2024-01-06T14:45:00Z')
  },
  {
    id: '11',
    title: 'Bubble Pop',
    description: 'Match and pop colorful bubbles in this relaxing and addictive puzzle game.',
    iframeUrl: 'https://html5games.com/Game/bubble-pop/embed',
    coverImage: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=400&h=300&fit=crop',
    slug: 'bubble-pop',
    isActive: true,
    playCount: 2800,
    categoryId: '3',
    rating: 4.4,
    tags: ['bubbles', 'matching', 'casual'],
    createdAt: new Date('2024-01-05T09:30:00Z'),
    updatedAt: new Date('2024-01-05T09:30:00Z')
  },
  {
    id: '12',
    title: 'Football Manager',
    description: 'Manage your football team, make strategic decisions, and lead them to victory.',
    iframeUrl: 'https://html5games.com/Game/football-manager/embed',
    coverImage: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=400&h=300&fit=crop',
    slug: 'football-manager',
    isActive: true,
    playCount: 1150,
    categoryId: '6',
    rating: 4.2,
    tags: ['football', 'management', 'simulation'],
    createdAt: new Date('2024-01-04T16:20:00Z'),
    updatedAt: new Date('2024-01-04T16:20:00Z')
  },
  {
    id: '13',
    title: 'Block Breaker',
    description: 'Classic brick-breaking game with modern twists and power-ups.',
    iframeUrl: 'https://html5games.com/Game/block-breaker/embed',
    coverImage: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=300&fit=crop',
    slug: 'block-breaker',
    isActive: true,
    playCount: 1580,
    categoryId: '3',
    rating: 4.3,
    tags: ['arcade', 'classic', 'casual'],
    createdAt: new Date('2024-01-03T16:45:00Z'),
    updatedAt: new Date('2024-01-03T16:45:00Z')
  },
  {
    id: '14',
    title: 'Basketball Pro',
    description: 'Shoot hoops and become the ultimate basketball champion.',
    iframeUrl: 'https://html5games.com/Game/basketball-pro/embed',
    coverImage: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=300&fit=crop',
    slug: 'basketball-pro',
    isActive: true,
    playCount: 1780,
    categoryId: '6',
    rating: 4.3,
    tags: ['basketball', 'sports', 'shooting'],
    createdAt: new Date('2024-01-02T14:20:00Z'),
    updatedAt: new Date('2024-01-02T14:20:00Z')
  },
  {
    id: '15',
    title: 'Tower Defense Pro',
    description: 'Strategic tower defense with multiple upgrade paths and challenging enemies.',
    iframeUrl: 'https://html5games.com/Game/tower-defense-pro/embed',
    coverImage: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=400&h=300&fit=crop',
    slug: 'tower-defense-pro',
    isActive: true,
    playCount: 1920,
    categoryId: '4',
    rating: 4.4,
    tags: ['strategy', 'defense', 'towers'],
    createdAt: new Date('2024-01-01T13:30:00Z'),
    updatedAt: new Date('2024-01-01T13:30:00Z')
  }
];

// Helper functions
export const getGameById = (id: string): Game | undefined => {
  return games.find(game => game.id === id);
};

export const getGameBySlug = (slug: string): Game | undefined => {
  return games.find(game => game.slug === slug);
};

export const getGamesByCategory = (categoryId: string): Game[] => {
  return games.filter(game => game.categoryId === categoryId);
};

export const getCategoryBySlug = (slug: string): Category | undefined => {
  return categories.find(category => category.slug === slug);
};

export const getCategoryById = (id: string): Category | undefined => {
  return categories.find(category => category.id === id);
};

export const searchGames = (query: string): Game[] => {
  const lowercaseQuery = query.toLowerCase();
  return games.filter(game => 
    game.title.toLowerCase().includes(lowercaseQuery) ||
    game.description.toLowerCase().includes(lowercaseQuery) ||
    game.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
};

export const getFeaturedGames = (): Game[] => {
  return games
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 6);
};

export const getPopularGames = (): Game[] => {
  return games
    .sort((a, b) => b.playCount - a.playCount)
    .slice(0, 8);
};

export const getLatestGames = (): Game[] => {
  return games
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);
};

export const getRelatedGames = (currentGame: Game): Game[] => {
  return games
    .filter(game => 
      game.id !== currentGame.id &&
      game.categoryId === currentGame.categoryId
    )
    .slice(0, 4);
};