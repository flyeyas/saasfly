import { z } from "zod";
import { createTRPCRouter, procedure } from "../trpc";
import { db } from "@saasfly/db";

// 排行榜类型schema
const rankingTypeSchema = z.enum([
  "popular", // 热门游戏（按播放次数）
  "rating", // 高评分游戏
  "recent", // 最新游戏
  "trending", // 趋势游戏（最近播放增长）
  "mostFavorited", // 最多收藏
  "mostCommented", // 最多评论
  "featured", // 精选游戏
]);

// 排行榜查询schema
const getRankingSchema = z.object({
  type: rankingTypeSchema,
  categoryId: z.string().optional(), // 分类筛选
  tagIds: z.array(z.string()).optional(), // 标签筛选
  timeRange: z.enum(["day", "week", "month", "year", "all"]).default("all"), // 时间范围
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

// 分类排行榜schema
const getCategoryRankingSchema = z.object({
  limit: z.number().int().min(1).max(50).default(10),
});

// 标签排行榜schema
const getTagRankingSchema = z.object({
  limit: z.number().int().min(1).max(50).default(10),
});

// 用户排行榜schema
const getUserRankingSchema = z.object({
  type: z.enum(["mostActive", "topRaters", "topCommenters"]),
  limit: z.number().int().min(1).max(50).default(10),
});

export const rankingRouter = createTRPCRouter({
  // 获取游戏排行榜
  games: procedure
    .input(getRankingSchema)
    .query(async ({ input }) => {
      const { type, categoryId, tagIds, timeRange, limit, offset } = input;

      // 构建基础查询
      let query = db
        .selectFrom("games")
        .select([
          "games.id",
          "games.title",
          "games.description",
          "games.slug",
          "games.coverImage",
          "games.thumbnailImage",
          "games.difficulty",
          "games.estimatedDuration",
          "games.playCount",
          "games.shareCount",
          "games.averageRating",
          "games.ratingCount",
          "games.isFeatured",
          "games.createdAt",
          "games.updatedAt",
        ])
        .where("games.isActive", "=", true);

      // 分类筛选
      if (categoryId) {
        query = query
          .innerJoin("game_categories", "games.id", "game_categories.gameId")
          .where("game_categories.categoryId", "=", categoryId);
      }

      // 标签筛选
      if (tagIds && tagIds.length > 0) {
        query = query
          .innerJoin("game_tag_relations", "games.id", "game_tag_relations.gameId")
          .where("game_tag_relations.tagId", "in", tagIds);
      }

      // 时间范围筛选
      if (timeRange !== "all") {
        const now = new Date();
        let startDate: Date;

        switch (timeRange) {
          case "day":
            startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            break;
          case "week":
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case "month":
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          case "year":
            startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
            break;
          default:
            startDate = new Date(0);
        }

        query = query.where("games.createdAt", ">=", startDate);
      }

      // 根据排行榜类型排序
      switch (type) {
        case "popular":
          query = query.orderBy("games.playCount", "desc");
          break;
        case "rating":
          query = query
            .where("games.ratingCount", ">=", 5) // 至少5个评分
            .orderBy("games.averageRating", "desc")
            .orderBy("games.ratingCount", "desc");
          break;
        case "recent":
          query = query.orderBy("games.createdAt", "desc");
          break;
        case "trending":
          // 趋势游戏：最近创建且播放次数较高
          query = query
            .where("games.createdAt", ">=", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
            .orderBy("games.playCount", "desc")
            .orderBy("games.createdAt", "desc");
          break;
        case "mostFavorited":
          // 需要联表查询收藏数
          query = query
            .leftJoin("game_favorites", "games.id", "game_favorites.gameId")
            .select((eb) => eb.fn.countAll().as("favoriteCount"))
            .groupBy("games.id")
            .orderBy("favoriteCount", "desc");
          break;
        case "mostCommented":
          // 需要联表查询评论数
          query = query
            .leftJoin("game_comments", "games.id", "game_comments.gameId")
            .select((eb) => eb.fn.countAll().as("commentCount"))
            .groupBy("games.id")
            .orderBy("commentCount", "desc");
          break;
        case "featured":
          query = query
            .where("games.isFeatured", "=", true)
            .orderBy("games.averageRating", "desc")
            .orderBy("games.playCount", "desc");
          break;
        default:
          query = query.orderBy("games.playCount", "desc");
      }

      // 执行查询
      const games = await query.limit(limit).offset(offset).execute();

      // 获取每个游戏的详细信息
      const gamesWithDetails = await Promise.all(
        games.map(async (game, index) => {
          // 获取分类
          const categories = await db
            .selectFrom("game_categories")
            .innerJoin("categories", "game_categories.categoryId", "categories.id")
            .select([
              "categories.id",
              "categories.name",
              "categories.slug",
              "categories.icon",
            ])
            .where("game_categories.gameId", "=", game.id)
            .execute();

          // 获取标签
          const tags = await db
            .selectFrom("game_tag_relations")
            .innerJoin("game_tags", "game_tag_relations.tagId", "game_tags.id")
            .select([
              "game_tags.id",
              "game_tags.name",
              "game_tags.slug",
              "game_tags.color",
              "game_tags.icon",
            ])
            .where("game_tag_relations.gameId", "=", game.id)
            .execute();

          // 获取收藏数（如果需要）
          let favoriteCount = 0;
          if (type === "mostFavorited") {
            const favoriteResult = await db
              .selectFrom("game_favorites")
              .select((eb) => eb.fn.countAll().as("count"))
              .where("gameId", "=", game.id)
              .executeTakeFirst();
            favoriteCount = Number(favoriteResult?.count ?? 0);
          }

          // 获取评论数（如果需要）
          let commentCount = 0;
          if (type === "mostCommented") {
            const commentResult = await db
              .selectFrom("game_comments")
              .select((eb) => eb.fn.countAll().as("count"))
              .where("gameId", "=", game.id)
              .executeTakeFirst();
            commentCount = Number(commentResult?.count ?? 0);
          }

          return {
            ...game,
            rank: offset + index + 1, // 排名
            categories,
            tags,
            ...(type === "mostFavorited" && { favoriteCount }),
            ...(type === "mostCommented" && { commentCount }),
          };
        })
      );

      return {
        games: gamesWithDetails,
        type,
        timeRange,
        filters: {
          categoryId,
          tagIds,
        },
      };
    }),

  // 获取分类排行榜
  categories: procedure
    .input(getCategoryRankingSchema)
    .query(async ({ input }) => {
      const { limit } = input;

      const categoryRanking = await db
        .selectFrom("categories")
        .leftJoin("game_categories", "categories.id", "game_categories.categoryId")
        .leftJoin("games", "game_categories.gameId", "games.id")
        .select([
          "categories.id",
          "categories.name",
          "categories.slug",
          "categories.description",
          "categories.icon",
          "categories.color",
          (eb) => eb.fn.countAll().as("gameCount"),
          (eb) => eb.fn.sum("games.playCount").as("totalPlayCount"),
          (eb) => eb.fn.avg("games.averageRating").as("averageRating"),
        ])
        .where("categories.isActive", "=", true)
        .where("games.isActive", "=", true)
        .groupBy("categories.id")
        .orderBy("gameCount", "desc")
        .orderBy("totalPlayCount", "desc")
        .limit(limit)
        .execute();

      return categoryRanking.map((category, index) => ({
        ...category,
        rank: index + 1,
        gameCount: Number(category.gameCount),
        totalPlayCount: Number(category.totalPlayCount ?? 0),
        averageRating: Number(category.averageRating ?? 0),
      }));
    }),

  // 获取标签排行榜
  tags: procedure
    .input(getTagRankingSchema)
    .query(async ({ input }) => {
      const { limit } = input;

      const tagRanking = await db
        .selectFrom("game_tags")
        .leftJoin("game_tag_relations", "game_tags.id", "game_tag_relations.tagId")
        .leftJoin("games", "game_tag_relations.gameId", "games.id")
        .select([
          "game_tags.id",
          "game_tags.name",
          "game_tags.slug",
          "game_tags.description",
          "game_tags.icon",
          "game_tags.color",
          (eb) => eb.fn.countAll().as("gameCount"),
          (eb) => eb.fn.sum("games.playCount").as("totalPlayCount"),
          (eb) => eb.fn.avg("games.averageRating").as("averageRating"),
        ])
        .where("game_tags.isActive", "=", true)
        .where("games.isActive", "=", true)
        .groupBy("game_tags.id")
        .orderBy("gameCount", "desc")
        .orderBy("totalPlayCount", "desc")
        .limit(limit)
        .execute();

      return tagRanking.map((tag, index) => ({
        ...tag,
        rank: index + 1,
        gameCount: Number(tag.gameCount),
        totalPlayCount: Number(tag.totalPlayCount ?? 0),
        averageRating: Number(tag.averageRating ?? 0),
      }));
    }),

  // 获取用户排行榜
  users: procedure
    .input(getUserRankingSchema)
    .query(async ({ input }) => {
      const { type, limit } = input;

      switch (type) {
        case "mostActive":
          // 最活跃用户（基于收藏数）
          const activeUsers = await db
            .selectFrom("users")
            .leftJoin("game_favorites", "users.id", "game_favorites.userId")
            .select([
              "users.id",
              "users.name",
              "users.image",
              (eb) => eb.fn.countAll().as("favoriteCount"),
            ])
            .groupBy("users.id")
            .orderBy("favoriteCount", "desc")
            .limit(limit)
            .execute();

          return activeUsers.map((user, index) => ({
            ...user,
            rank: index + 1,
            favoriteCount: Number(user.favoriteCount),
          }));

        case "topRaters":
          // 评分最多的用户
          const topRaters = await db
            .selectFrom("users")
            .leftJoin("game_ratings", "users.id", "game_ratings.userId")
            .select([
              "users.id",
              "users.name",
              "users.image",
              (eb) => eb.fn.countAll().as("ratingCount"),
              (eb) => eb.fn.avg("game_ratings.rating").as("averageRating"),
            ])
            .groupBy("users.id")
            .orderBy("ratingCount", "desc")
            .limit(limit)
            .execute();

          return topRaters.map((user, index) => ({
            ...user,
            rank: index + 1,
            ratingCount: Number(user.ratingCount),
            averageRating: Number(user.averageRating ?? 0),
          }));

        case "topCommenters":
          // 评论最多的用户
          const topCommenters = await db
            .selectFrom("users")
            .leftJoin("game_comments", "users.id", "game_comments.userId")
            .select([
              "users.id",
              "users.name",
              "users.image",
              (eb) => eb.fn.countAll().as("commentCount"),
            ])
            .groupBy("users.id")
            .orderBy("commentCount", "desc")
            .limit(limit)
            .execute();

          return topCommenters.map((user, index) => ({
            ...user,
            rank: index + 1,
            commentCount: Number(user.commentCount),
          }));

        default:
          return [];
      }
    }),

  // 获取综合统计数据
  stats: procedure
    .query(async () => {
      // 获取总游戏数
      const totalGamesResult = await db
        .selectFrom("games")
        .select((eb) => eb.fn.countAll().as("count"))
        .where("isActive", "=", true)
        .executeTakeFirst();

      // 获取总播放次数
      const totalPlaysResult = await db
        .selectFrom("games")
        .select((eb) => eb.fn.sum("playCount").as("totalPlays"))
        .where("isActive", "=", true)
        .executeTakeFirst();

      // 获取总用户数
      const totalUsersResult = await db
        .selectFrom("users")
        .select((eb) => eb.fn.countAll().as("count"))
        .executeTakeFirst();

      // 获取总评分数
      const totalRatingsResult = await db
        .selectFrom("game_ratings")
        .select((eb) => eb.fn.countAll().as("count"))
        .executeTakeFirst();

      // 获取总评论数
      const totalCommentsResult = await db
        .selectFrom("game_comments")
        .select((eb) => eb.fn.countAll().as("count"))
        .executeTakeFirst();

      // 获取总收藏数
      const totalFavoritesResult = await db
        .selectFrom("game_favorites")
        .select((eb) => eb.fn.countAll().as("count"))
        .executeTakeFirst();

      // 获取平均评分
      const averageRatingResult = await db
        .selectFrom("games")
        .select((eb) => eb.fn.avg("averageRating").as("averageRating"))
        .where("isActive", "=", true)
        .where("ratingCount", ">", 0)
        .executeTakeFirst();

      return {
        totalGames: Number(totalGamesResult?.count ?? 0),
        totalPlays: Number(totalPlaysResult?.totalPlays ?? 0),
        totalUsers: Number(totalUsersResult?.count ?? 0),
        totalRatings: Number(totalRatingsResult?.count ?? 0),
        totalComments: Number(totalCommentsResult?.count ?? 0),
        totalFavorites: Number(totalFavoritesResult?.count ?? 0),
        averageRating: Number(averageRatingResult?.averageRating ?? 0),
      };
    }),

  // 获取热门搜索关键词排行
  popularSearches: procedure
    .input(z.object({ limit: z.number().int().min(1).max(50).default(10) }))
    .query(async ({ input }) => {
      const { limit } = input;

      // 这里假设有搜索日志表，如果没有可以基于游戏标题和标签的热度
      // 暂时基于游戏播放次数来模拟热门搜索
      const popularGames = await db
        .selectFrom("games")
        .select(["title", "playCount"])
        .where("isActive", "=", true)
        .orderBy("playCount", "desc")
        .limit(limit)
        .execute();

      const popularTags = await db
        .selectFrom("game_tags")
        .leftJoin("game_tag_relations", "game_tags.id", "game_tag_relations.tagId")
        .leftJoin("games", "game_tag_relations.gameId", "games.id")
        .select([
          "game_tags.name",
          (eb) => eb.fn.sum("games.playCount").as("totalPlays"),
        ])
        .where("game_tags.isActive", "=", true)
        .where("games.isActive", "=", true)
        .groupBy("game_tags.id")
        .orderBy("totalPlays", "desc")
        .limit(limit)
        .execute();

      // 合并游戏标题和标签作为热门搜索词
      const searches = [
        ...popularGames.map((game, index) => ({
          keyword: game.title,
          type: "game" as const,
          popularity: game.playCount,
          rank: index + 1,
        })),
        ...popularTags.map((tag, index) => ({
          keyword: tag.name,
          type: "tag" as const,
          popularity: Number(tag.totalPlays ?? 0),
          rank: index + 1,
        })),
      ];

      // 按热度重新排序并限制数量
      return searches
        .sort((a, b) => b.popularity - a.popularity)
        .slice(0, limit)
        .map((search, index) => ({ ...search, rank: index + 1 }));
    }),
});