import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, procedure } from "../trpc";
import { db } from "@saasfly/db";

// 搜索参数schema
const searchSchema = z.object({
  query: z.string().optional(), // 搜索关键词
  categoryIds: z.array(z.string()).optional(), // 分类筛选
  tagIds: z.array(z.string()).optional(), // 标签筛选
  difficulty: z.enum(["easy", "medium", "hard"]).optional(), // 难度筛选
  minRating: z.number().min(0).max(5).optional(), // 最低评分
  maxRating: z.number().min(0).max(5).optional(), // 最高评分
  minDuration: z.number().int().min(0).optional(), // 最短时长（分钟）
  maxDuration: z.number().int().min(0).optional(), // 最长时长（分钟）
  isFeatured: z.boolean().optional(), // 是否精选
  isActive: z.boolean().default(true), // 是否激活
  language: z.enum(["en", "zh"]).default("en"), // 语言
  sortBy: z.enum([
    "relevance", // 相关性
    "rating", // 评分
    "playCount", // 播放次数
    "createdAt", // 创建时间
    "title", // 标题
    "duration", // 时长
  ]).default("relevance"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(20),
});

// 热门搜索关键词schema
const popularSearchSchema = z.object({
  limit: z.number().int().min(1).max(20).default(10),
  language: z.enum(["en", "zh"]).default("en"),
});

// 搜索建议schema
const searchSuggestionsSchema = z.object({
  query: z.string().min(1),
  limit: z.number().int().min(1).max(10).default(5),
  language: z.enum(["en", "zh"]).default("en"),
});

export const searchRouter = createTRPCRouter({
  // 游戏搜索 (公开接口)
  games: procedure
    .input(searchSchema)
    .query(async ({ input }) => {
      const {
        query,
        categoryIds,
        tagIds,
        difficulty,
        minRating,
        maxRating,
        minDuration,
        maxDuration,
        isFeatured,
        isActive,
        language,
        sortBy,
        sortOrder,
        page,
        limit,
      } = input;

      const offset = (page - 1) * limit;

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
        .where("games.isActive", "=", isActive);

      // 关键词搜索
      if (query && query.trim()) {
        query = query.where((eb) =>
          eb.or([
            eb("games.slug", "ilike", `%${query}%`),
            // 可以添加更复杂的全文搜索逻辑
          ])
        );
      }

      // 分类筛选
      if (categoryIds && categoryIds.length > 0) {
        query = query
          .innerJoin("game_categories", "games.id", "game_categories.gameId")
          .where("game_categories.categoryId", "in", categoryIds);
      }

      // 标签筛选
      if (tagIds && tagIds.length > 0) {
        query = query
          .innerJoin("game_tag_relations", "games.id", "game_tag_relations.gameId")
          .where("game_tag_relations.tagId", "in", tagIds);
      }

      // 难度筛选
      if (difficulty) {
        query = query.where("difficulty", "=", difficulty);
      }

      // 评分筛选
      if (minRating !== undefined) {
        query = query.where("averageRating", ">=", minRating);
      }
      if (maxRating !== undefined) {
        query = query.where("averageRating", "<=", maxRating);
      }

      // 时长筛选
      if (minDuration !== undefined) {
        query = query.where("estimatedDuration", ">=", minDuration);
      }
      if (maxDuration !== undefined) {
        query = query.where("estimatedDuration", "<=", maxDuration);
      }

      // 精选筛选
      if (isFeatured !== undefined) {
        query = query.where("isFeatured", "=", isFeatured);
      }

      // 排序
      switch (sortBy) {
        case "relevance":
          // 相关性排序：精选 > 评分 > 播放次数
          query = query
            .orderBy("isFeatured", "desc")
            .orderBy("averageRating", "desc")
            .orderBy("playCount", "desc");
          break;
        case "rating":
          query = query.orderBy("averageRating", sortOrder);
          break;
        case "playCount":
          query = query.orderBy("playCount", sortOrder);
          break;
        case "createdAt":
          query = query.orderBy("createdAt", sortOrder);
          break;
        case "title":
          query = query.orderBy("slug", sortOrder);
          break;
        case "duration":
          query = query.orderBy("estimatedDuration", sortOrder);
          break;
        default:
          query = query.orderBy("createdAt", "desc");
      }

      // 获取总数（用于分页）
      let countQuery = db
        .selectFrom("games")
        .select((eb) => eb.fn.countAll().as("count"))
        .where("games.isActive", "=", isActive);

      // 应用相同的筛选条件到计数查询
      if (query && query.trim()) {
        countQuery = countQuery.where((eb) =>
          eb.or([
            eb("games.slug", "ilike", `%${query}%`),
          ])
        );
      }

      if (categoryIds && categoryIds.length > 0) {
        countQuery = countQuery
          .innerJoin("game_categories", "games.id", "game_categories.gameId")
          .where("game_categories.categoryId", "in", categoryIds);
      }

      if (tagIds && tagIds.length > 0) {
        countQuery = countQuery
          .innerJoin("game_tag_relations", "games.id", "game_tag_relations.gameId")
          .where("game_tag_relations.tagId", "in", tagIds);
      }

      if (difficulty) {
        countQuery = countQuery.where("games.difficulty", "=", difficulty);
      }

      if (minRating !== undefined) {
        countQuery = countQuery.where("games.averageRating", ">=", minRating);
      }
      if (maxRating !== undefined) {
        countQuery = countQuery.where("games.averageRating", "<=", maxRating);
      }

      if (minDuration !== undefined) {
        countQuery = countQuery.where("games.estimatedDuration", ">=", minDuration);
      }
      if (maxDuration !== undefined) {
        countQuery = countQuery.where("games.estimatedDuration", "<=", maxDuration);
      }

      if (isFeatured !== undefined) {
        countQuery = countQuery.where("games.isFeatured", "=", isFeatured);
      }

      // 执行查询
      const [games, totalResult] = await Promise.all([
        query.limit(limit).offset(offset).execute(),
        countQuery.executeTakeFirst(),
      ]);

      const total = Number(totalResult?.count ?? 0);

      // 获取每个游戏的分类和标签信息
      const gamesWithDetails = await Promise.all(
        games.map(async (game) => {
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

          return {
            ...game,
            categories,
            tags,
          };
        })
      );

      return {
        games: gamesWithDetails,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        filters: {
          query,
          categoryIds,
          tagIds,
          difficulty,
          minRating,
          maxRating,
          minDuration,
          maxDuration,
          isFeatured,
          sortBy,
          sortOrder,
        },
      };
    }),

  // 获取搜索建议 (公开接口)
  suggestions: procedure
    .input(searchSuggestionsSchema)
    .query(async ({ input }) => {
      const { query, limit, language } = input;

      // 搜索游戏标题建议
      const gamesSuggestions = await db
        .selectFrom("games")
        .select(["slug", "title"])
        .where("games.isActive", "=", true)
        .where("games.slug", "ilike", `%${query}%`)
        .limit(limit)
        .execute();

      // 搜索分类建议
      const categorySuggestions = await db
        .selectFrom("categories")
        .select(["slug", "name"])
        .where("categories.isActive", "=", true)
        .where("categories.slug", "ilike", `%${query}%`)
        .limit(limit)
        .execute();

      // 搜索标签建议
      const tagSuggestions = await db
        .selectFrom("game_tags")
        .select(["slug", "name"])
        .where("game_tags.isActive", "=", true)
        .where("game_tags.slug", "ilike", `%${query}%`)
        .limit(limit)
        .execute();

      return {
        games: gamesSuggestions.map(game => ({
          type: "game" as const,
          slug: game.slug,
          title: game.title,
        })),
        categories: categorySuggestions.map(category => ({
          type: "category" as const,
          slug: category.slug,
          name: category.name,
        })),
        tags: tagSuggestions.map(tag => ({
          type: "tag" as const,
          slug: tag.slug,
          name: tag.name,
        })),
      };
    }),

  // 获取热门搜索关键词 (公开接口)
  popular: procedure
    .input(popularSearchSchema)
    .query(async ({ input }) => {
      const { limit, language } = input;

      // 获取播放次数最多的游戏作为热门搜索
      const popularGames = await db
        .selectFrom("games")
        .select(["slug", "title", "playCount"])
        .where("games.isActive", "=", true)
        .orderBy("games.playCount", "desc")
        .limit(limit)
        .execute();

      // 获取使用最多的标签
      const popularTags = await db
        .selectFrom("game_tags")
        .leftJoin("game_tag_relations", "game_tags.id", "game_tag_relations.tagId")
        .select([
          "game_tags.slug",
          "game_tags.name",
          (eb) => eb.fn.countAll().as("usageCount"),
        ])
        .where("game_tags.isActive", "=", true)
        .groupBy("game_tags.id")
        .orderBy("usageCount", "desc")
        .limit(limit)
        .execute();

      return {
        games: popularGames.map(game => ({
          type: "game" as const,
          slug: game.slug,
          title: game.title,
          playCount: game.playCount,
        })),
        tags: popularTags.map(tag => ({
          type: "tag" as const,
          slug: tag.slug,
          name: tag.name,
          usageCount: Number(tag.usageCount),
        })),
      };
    }),

  // 获取筛选选项 (公开接口)
  filters: procedure
    .input(z.object({
      language: z.enum(["en", "zh"]).default("en"),
    }))
    .query(async ({ input }) => {
      const { language } = input;

      // 获取所有激活的分类
      const categories = await db
        .selectFrom("categories")
        .select(["id", "name", "slug", "icon"])
        .where("isActive", "=", true)
        .orderBy("sortOrder", "asc")
        .execute();

      // 获取所有激活的标签
      const tags = await db
        .selectFrom("game_tags")
        .select(["id", "name", "slug", "color", "icon"])
        .where("isActive", "=", true)
        .orderBy("sortOrder", "asc")
        .execute();

      // 获取难度选项
      const difficulties = [
        { value: "easy", label: language === "zh" ? "简单" : "Easy" },
        { value: "medium", label: language === "zh" ? "中等" : "Medium" },
        { value: "hard", label: language === "zh" ? "困难" : "Hard" },
      ];

      // 获取评分范围
      const ratingRanges = [
        { min: 4, max: 5, label: language === "zh" ? "4星以上" : "4+ Stars" },
        { min: 3, max: 5, label: language === "zh" ? "3星以上" : "3+ Stars" },
        { min: 2, max: 5, label: language === "zh" ? "2星以上" : "2+ Stars" },
        { min: 1, max: 5, label: language === "zh" ? "1星以上" : "1+ Stars" },
      ];

      // 获取时长范围
      const durationRanges = [
        { min: 0, max: 5, label: language === "zh" ? "5分钟以内" : "Under 5 min" },
        { min: 5, max: 15, label: language === "zh" ? "5-15分钟" : "5-15 min" },
        { min: 15, max: 30, label: language === "zh" ? "15-30分钟" : "15-30 min" },
        { min: 30, max: 60, label: language === "zh" ? "30-60分钟" : "30-60 min" },
        { min: 60, max: null, label: language === "zh" ? "60分钟以上" : "Over 60 min" },
      ];

      return {
        categories,
        tags,
        difficulties,
        ratingRanges,
        durationRanges,
      };
    }),
});