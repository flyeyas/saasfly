import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, procedure, protectedProcedure } from "../trpc";
import { db } from "@saasfly/db";

// 添加收藏schema
const addFavoriteSchema = z.object({
  gameId: z.string().min(1, "游戏ID不能为空"),
});

// 移除收藏schema
const removeFavoriteSchema = z.object({
  gameId: z.string().min(1, "游戏ID不能为空"),
});

// 获取收藏列表schema
const getFavoritesSchema = z.object({
  categoryIds: z.array(z.string()).optional(), // 分类筛选
  tagIds: z.array(z.string()).optional(), // 标签筛选
  sortBy: z.enum([
    "recent", // 最近添加
    "name", // 按名称排序
    "rating", // 按评分排序
    "playCount", // 按播放次数排序
  ]).default("recent"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(20),
});

// 检查收藏状态schema
const checkFavoriteSchema = z.object({
  gameId: z.string().min(1, "游戏ID不能为空"),
});

// 批量操作schema
const batchFavoriteSchema = z.object({
  gameIds: z.array(z.string()).min(1, "至少选择一个游戏").max(50, "一次最多操作50个游戏"),
  action: z.enum(["add", "remove"]),
});

export const favoriteRouter = createTRPCRouter({
  // 添加收藏 (需要登录)
  add: protectedProcedure
    .input(addFavoriteSchema)
    .mutation(async ({ input, ctx }) => {
      const { gameId } = input;
      const userId = ctx.session.user.id;

      // 检查游戏是否存在
      const game = await db
        .selectFrom("games")
        .select(["id", "title"])
        .where("id", "=", gameId)
        .where("isActive", "=", true)
        .executeTakeFirst();

      if (!game) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "游戏不存在或已下架",
        });
      }

      // 检查是否已经收藏
      const existingFavorite = await db
        .selectFrom("game_favorites")
        .select("id")
        .where("gameId", "=", gameId)
        .where("userId", "=", userId)
        .executeTakeFirst();

      if (existingFavorite) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "游戏已在收藏列表中",
        });
      }

      // 添加收藏
      await db
        .insertInto("game_favorites")
        .values({
          id: crypto.randomUUID(),
          gameId,
          userId,
          createdAt: new Date(),
        })
        .execute();

      return {
        success: true,
        message: `已将「${game.title}」添加到收藏`,
      };
    }),

  // 移除收藏 (需要登录)
  remove: protectedProcedure
    .input(removeFavoriteSchema)
    .mutation(async ({ input, ctx }) => {
      const { gameId } = input;
      const userId = ctx.session.user.id;

      // 检查收藏是否存在
      const favorite = await db
        .selectFrom("game_favorites")
        .innerJoin("games", "game_favorites.gameId", "games.id")
        .select(["game_favorites.id", "games.title"])
        .where("game_favorites.gameId", "=", gameId)
        .where("game_favorites.userId", "=", userId)
        .executeTakeFirst();

      if (!favorite) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "收藏记录不存在",
        });
      }

      // 删除收藏
      await db
        .deleteFrom("game_favorites")
        .where("id", "=", favorite.id)
        .execute();

      return {
        success: true,
        message: `已将「${favorite.title}」从收藏中移除`,
      };
    }),

  // 切换收藏状态 (需要登录)
  toggle: protectedProcedure
    .input(addFavoriteSchema)
    .mutation(async ({ input, ctx }) => {
      const { gameId } = input;
      const userId = ctx.session.user.id;

      // 检查游戏是否存在
      const game = await db
        .selectFrom("games")
        .select(["id", "title"])
        .where("id", "=", gameId)
        .where("isActive", "=", true)
        .executeTakeFirst();

      if (!game) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "游戏不存在或已下架",
        });
      }

      // 检查是否已经收藏
      const existingFavorite = await db
        .selectFrom("game_favorites")
        .select("id")
        .where("gameId", "=", gameId)
        .where("userId", "=", userId)
        .executeTakeFirst();

      if (existingFavorite) {
        // 移除收藏
        await db
          .deleteFrom("game_favorites")
          .where("id", "=", existingFavorite.id)
          .execute();

        return {
          success: true,
          isFavorited: false,
          message: `已将「${game.title}」从收藏中移除`,
        };
      } else {
        // 添加收藏
        await db
          .insertInto("game_favorites")
          .values({
            id: crypto.randomUUID(),
            gameId,
            userId,
            createdAt: new Date(),
          })
          .execute();

        return {
          success: true,
          isFavorited: true,
          message: `已将「${game.title}」添加到收藏`,
        };
      }
    }),

  // 检查收藏状态 (需要登录)
  check: protectedProcedure
    .input(checkFavoriteSchema)
    .query(async ({ input, ctx }) => {
      const { gameId } = input;
      const userId = ctx.session.user.id;

      const favorite = await db
        .selectFrom("game_favorites")
        .select(["id", "createdAt"])
        .where("gameId", "=", gameId)
        .where("userId", "=", userId)
        .executeTakeFirst();

      return {
        isFavorited: !!favorite,
        favoritedAt: favorite?.createdAt,
      };
    }),

  // 批量检查收藏状态 (需要登录)
  checkMultiple: protectedProcedure
    .input(z.object({ gameIds: z.array(z.string()) }))
    .query(async ({ input, ctx }) => {
      const { gameIds } = input;
      const userId = ctx.session.user.id;

      if (gameIds.length === 0) {
        return {};
      }

      const favorites = await db
        .selectFrom("game_favorites")
        .select(["gameId", "createdAt"])
        .where("gameId", "in", gameIds)
        .where("userId", "=", userId)
        .execute();

      // 转换为对象格式
      const favoriteMap: Record<string, { isFavorited: boolean; favoritedAt?: Date }> = {};
      
      gameIds.forEach(gameId => {
        const favorite = favorites.find(f => f.gameId === gameId);
        favoriteMap[gameId] = {
          isFavorited: !!favorite,
          favoritedAt: favorite?.createdAt,
        };
      });

      return favoriteMap;
    }),

  // 获取收藏列表 (需要登录)
  list: protectedProcedure
    .input(getFavoritesSchema)
    .query(async ({ input, ctx }) => {
      const {
        categoryIds,
        tagIds,
        sortBy,
        sortOrder,
        page,
        limit,
      } = input;
      const userId = ctx.session.user.id;
      const offset = (page - 1) * limit;

      // 构建基础查询
      let query = db
        .selectFrom("game_favorites")
        .innerJoin("games", "game_favorites.gameId", "games.id")
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
          "games.createdAt as gameCreatedAt",
          "game_favorites.createdAt as favoritedAt",
        ])
        .where("game_favorites.userId", "=", userId)
        .where("games.isActive", "=", true);

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

      // 排序
      switch (sortBy) {
        case "recent":
          query = query.orderBy("game_favorites.createdAt", sortOrder);
          break;
        case "name":
          query = query.orderBy("games.slug", sortOrder);
          break;
        case "rating":
          query = query.orderBy("games.averageRating", sortOrder);
          break;
        case "playCount":
          query = query.orderBy("games.playCount", sortOrder);
          break;
        default:
          query = query.orderBy("game_favorites.createdAt", "desc");
      }

      // 获取收藏游戏列表
      const favorites = await query.limit(limit).offset(offset).execute();

      // 获取总数
      let countQuery = db
        .selectFrom("game_favorites")
        .innerJoin("games", "game_favorites.gameId", "games.id")
        .select((eb) => eb.fn.countAll().as("count"))
        .where("game_favorites.userId", "=", userId)
        .where("games.isActive", "=", true);

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

      const totalResult = await countQuery.executeTakeFirst();
      const total = Number(totalResult?.count ?? 0);

      // 获取每个游戏的分类和标签信息
      const favoritesWithDetails = await Promise.all(
        favorites.map(async (favorite) => {
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
            .where("game_categories.gameId", "=", favorite.id)
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
            .where("game_tag_relations.gameId", "=", favorite.id)
            .execute();

          return {
            ...favorite,
            categories,
            tags,
          };
        })
      );

      return {
        favorites: favoritesWithDetails,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        filters: {
          categoryIds,
          tagIds,
          sortBy,
          sortOrder,
        },
      };
    }),

  // 批量操作收藏 (需要登录)
  batch: protectedProcedure
    .input(batchFavoriteSchema)
    .mutation(async ({ input, ctx }) => {
      const { gameIds, action } = input;
      const userId = ctx.session.user.id;

      if (action === "add") {
        // 批量添加收藏
        // 首先检查哪些游戏存在且未收藏
        const existingGames = await db
          .selectFrom("games")
          .select(["id", "title"])
          .where("id", "in", gameIds)
          .where("isActive", "=", true)
          .execute();

        const existingGameIds = existingGames.map(g => g.id);

        // 检查已收藏的游戏
        const existingFavorites = await db
          .selectFrom("game_favorites")
          .select("gameId")
          .where("gameId", "in", existingGameIds)
          .where("userId", "=", userId)
          .execute();

        const alreadyFavoritedIds = existingFavorites.map(f => f.gameId);
        const toAddIds = existingGameIds.filter(id => !alreadyFavoritedIds.includes(id));

        if (toAddIds.length > 0) {
          // 批量插入收藏记录
          const favoriteRecords = toAddIds.map(gameId => ({
            id: crypto.randomUUID(),
            gameId,
            userId,
            createdAt: new Date(),
          }));

          await db
            .insertInto("game_favorites")
            .values(favoriteRecords)
            .execute();
        }

        return {
          success: true,
          message: `成功添加 ${toAddIds.length} 个游戏到收藏`,
          addedCount: toAddIds.length,
          skippedCount: gameIds.length - toAddIds.length,
        };
      } else {
        // 批量移除收藏
        const result = await db
          .deleteFrom("game_favorites")
          .where("gameId", "in", gameIds)
          .where("userId", "=", userId)
          .execute();

        return {
          success: true,
          message: `成功移除 ${result.length} 个游戏收藏`,
          removedCount: result.length,
        };
      }
    }),

  // 获取收藏统计 (需要登录)
  stats: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.session.user.id;

      // 获取总收藏数
      const totalFavoritesResult = await db
        .selectFrom("game_favorites")
        .innerJoin("games", "game_favorites.gameId", "games.id")
        .select((eb) => eb.fn.countAll().as("count"))
        .where("game_favorites.userId", "=", userId)
        .where("games.isActive", "=", true)
        .executeTakeFirst();

      // 获取分类分布
      const categoryStats = await db
        .selectFrom("game_favorites")
        .innerJoin("games", "game_favorites.gameId", "games.id")
        .innerJoin("game_categories", "games.id", "game_categories.gameId")
        .innerJoin("categories", "game_categories.categoryId", "categories.id")
        .select([
          "categories.id",
          "categories.name",
          "categories.slug",
          (eb) => eb.fn.countAll().as("count"),
        ])
        .where("game_favorites.userId", "=", userId)
        .where("games.isActive", "=", true)
        .groupBy("categories.id")
        .orderBy("count", "desc")
        .limit(10)
        .execute();

      // 获取总游戏时长（估算）
      const totalDurationResult = await db
        .selectFrom("game_favorites")
        .innerJoin("games", "game_favorites.gameId", "games.id")
        .select((eb) => eb.fn.sum("games.estimatedDuration").as("totalDuration"))
        .where("game_favorites.userId", "=", userId)
        .where("games.isActive", "=", true)
        .executeTakeFirst();

      return {
        totalFavorites: Number(totalFavoritesResult?.count ?? 0),
        categoryStats: categoryStats.map(stat => ({
          ...stat,
          count: Number(stat.count),
        })),
        totalEstimatedDuration: Number(totalDurationResult?.totalDuration ?? 0),
      };
    }),

  // 获取最近收藏的游戏 (需要登录)
  recent: protectedProcedure
    .input(z.object({ limit: z.number().int().min(1).max(20).default(5) }))
    .query(async ({ input, ctx }) => {
      const { limit } = input;
      const userId = ctx.session.user.id;

      const recentFavorites = await db
        .selectFrom("game_favorites")
        .innerJoin("games", "game_favorites.gameId", "games.id")
        .select([
          "games.id",
          "games.title",
          "games.slug",
          "games.thumbnailImage",
          "games.averageRating",
          "games.playCount",
          "game_favorites.createdAt as favoritedAt",
        ])
        .where("game_favorites.userId", "=", userId)
        .where("games.isActive", "=", true)
        .orderBy("game_favorites.createdAt", "desc")
        .limit(limit)
        .execute();

      return recentFavorites;
    }),
});