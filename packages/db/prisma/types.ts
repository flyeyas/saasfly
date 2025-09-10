import type { ColumnType } from "kysely";

import type {
  AdPosition,
  AdType,
  ConfigCategory,
  EmailType,
  Status,
  SubscriptionPlan,
  VerificationCodeType,
} from "./enums";

export type Generated<T> =
  T extends ColumnType<infer S, infer I, infer U>
    ? ColumnType<S, I | undefined, U>
    : ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export type Account = {
  id: Generated<string>;
  userId: string;
  type: string;
  provider: string;
  providerAccountId: string;
  refresh_token: string | null;
  access_token: string | null;
  expires_at: number | null;
  token_type: string | null;
  scope: string | null;
  id_token: string | null;
  session_state: string | null;
};
export type Advertisement = {
  id: string;
  name: string;
  type: AdType;
  position: AdPosition;
  content: string;
  targetUrl: string | null;
  imageUrl: string | null;
  isActive: Generated<boolean>;
  startDate: Timestamp | null;
  endDate: Timestamp | null;
  clickCount: Generated<number>;
  viewCount: Generated<number>;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
};
export type Authenticator = {
  credentialID: string;
  userId: string;
  providerAccountId: string;
  credentialPublicKey: string;
  counter: number;
  credentialDeviceType: string;
  credentialBackedUp: boolean;
  transports: string | null;
};
export type Category = {
  id: string;
  name: unknown;
  description: unknown | null;
  slug: string;
  icon: string | null;
  parentId: string | null;
  sortOrder: Generated<number>;
  isActive: Generated<boolean>;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
};
export type Customer = {
  id: Generated<number>;
  authUserId: string;
  name: string | null;
  plan: SubscriptionPlan | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripePriceId: string | null;
  stripeCurrentPeriodEnd: Timestamp | null;
  createdAt: Generated<Timestamp>;
  updatedAt: Generated<Timestamp>;
};
export type EmailTemplate = {
  id: string;
  name: string;
  subject: unknown;
  content: unknown;
  type: EmailType;
  variables: unknown | null;
  isActive: Generated<boolean>;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
};
export type Game = {
  id: string;
  title: unknown;
  description: unknown;
  iframeUrl: string;
  coverImage: string | null;
  thumbnail: string | null;
  screenshots: string[];
  slug: string;
  isActive: Generated<boolean>;
  isFeatured: Generated<boolean>;
  playCount: Generated<number>;
  shareCount: Generated<number>;
  avgRating: Generated<number | null>;
  ratingCount: Generated<number>;
  gameplayGuide: unknown | null;
  difficultyLevel: number | null;
  estimatedDuration: number | null;
  developerInfo: unknown | null;
  gameStory: unknown | null;
  controlsInfo: unknown | null;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
};
export type GameCategory = {
  id: string;
  gameId: string;
  categoryId: string;
  createdAt: Generated<Timestamp>;
};
export type GameComment = {
  id: string;
  gameId: string;
  userId: string;
  content: string;
  parentId: string | null;
  likes: Generated<number>;
  isActive: Generated<boolean>;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
};
export type GameFavorite = {
  id: string;
  gameId: string;
  userId: string;
  createdAt: Generated<Timestamp>;
};
export type GameGuide = {
  id: string;
  gameId: string;
  title: unknown;
  content: unknown;
  author: string;
  difficulty: string;
  isOfficial: Generated<boolean>;
  viewCount: Generated<number>;
  likeCount: Generated<number>;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
};
export type GameHistory = {
  id: string;
  userId: string;
  gameId: string;
  playTime: number;
  completed: Generated<boolean>;
  score: number | null;
  createdAt: Generated<Timestamp>;
};
export type GameRanking = {
  id: string;
  gameId: string;
  rankType: string;
  score: number;
  position: number;
  period: string;
  createdAt: Generated<Timestamp>;
};
export type GameRating = {
  id: string;
  gameId: string;
  userId: string;
  rating: number;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
};
export type GameTag = {
  id: string;
  name: unknown;
  slug: string;
  description: unknown | null;
  color: string | null;
  icon: string | null;
  isActive: Generated<boolean>;
  sortOrder: Generated<number>;
  usageCount: Generated<number>;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
};
export type GameTagRelation = {
  id: string;
  gameId: string;
  tagId: string;
  createdAt: Generated<Timestamp>;
};
export type K8sClusterConfig = {
  id: Generated<number>;
  name: string;
  location: string;
  authUserId: string;
  plan: Generated<SubscriptionPlan | null>;
  network: string | null;
  createdAt: Generated<Timestamp>;
  updatedAt: Generated<Timestamp>;
  status: Generated<Status | null>;
  delete: Generated<boolean | null>;
};
export type Session = {
  id: Generated<string>;
  sessionToken: string;
  userId: string;
  expires: Timestamp;
};
export type SocialShare = {
  id: string;
  gameId: string;
  platform: string;
  userId: string | null;
  ipAddress: string;
  userAgent: string | null;
  createdAt: Generated<Timestamp>;
};
export type SystemConfig = {
  id: string;
  key: string;
  value: unknown;
  category: ConfigCategory;
  description: string | null;
  isActive: Generated<boolean>;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
};
export type User = {
  id: string;
  name: string | null;
  email: string;
  emailVerified: Timestamp | null;
  image: string | null;
  password: string | null;
  loginAttempts: Generated<number>;
  lockedUntil: Timestamp | null;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  stripe_current_period_end: Timestamp | null;
};
export type UserAchievement = {
  id: string;
  userId: string;
  gameId: string;
  achievementType: string;
  value: string | null;
  unlockedAt: Generated<Timestamp>;
};
export type VerificationCode = {
  id: string;
  email: string;
  code: string;
  type: VerificationCodeType;
  expiresAt: Timestamp;
  used: Generated<boolean>;
  userId: string | null;
  createdAt: Generated<Timestamp>;
};
export type VerificationToken = {
  identifier: string;
  token: string;
  expires: Timestamp;
};
export type DB = {
  Account: Account;
  advertisements: Advertisement;
  Authenticator: Authenticator;
  categories: Category;
  Customer: Customer;
  email_templates: EmailTemplate;
  game_categories: GameCategory;
  game_comments: GameComment;
  game_favorites: GameFavorite;
  game_guides: GameGuide;
  game_histories: GameHistory;
  game_rankings: GameRanking;
  game_ratings: GameRating;
  game_tag_relations: GameTagRelation;
  game_tags: GameTag;
  games: Game;
  K8sClusterConfig: K8sClusterConfig;
  Session: Session;
  social_shares: SocialShare;
  system_configs: SystemConfig;
  user_achievements: UserAchievement;
  users: User;
  verification_codes: VerificationCode;
  VerificationToken: VerificationToken;
};
