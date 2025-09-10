import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { db } from "@saasfly/db";

import { createTRPCRouter, protectedProcedure, procedure } from "../trpc";

// 多语言内容schema
const multiLangSchema = z.object({
  en: z.string(),
  zh: z.string().optional(),
});

const gameCreateSchema = z.object({
  title: multiLangSchema,
  description: multiLangSchema.optional(),
  iframeUrl: z.string().url("Please enter a valid game URL"),
  coverImage: z.string().url("Please enter a valid cover image URL").optional(),
  thumbnail: z.string().url("Please enter a valid thumbnail URL").optional(),
  screenshots: z.array(z.string().url()).optional(),
  slug: z.string().min(1, "Game slug cannot be empty"),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  gameplayGuide: multiLangSchema.optional(),
  difficultyLevel: z.number().min(1).max(5).optional(),
  estimatedDuration: z.number().positive().optional(),
  developerInfo: multiLangSchema.optional(),
  gameStory: multiLangSchema.optional(),
  controlsInfo: multiLangSchema.optional(),
  categoryIds: z.array(z.string()).optional(),
  tagIds: z.array(z.string()).optional(),
});

const gameUpdateSchema = z.object({
  id: z.string(),
  title: multiLangSchema.optional(),
  description: multiLangSchema.optional(),
  iframeUrl: z.string().url("Please enter a valid game URL").optional(),
  coverImage: z.string().url("Please enter a valid cover image URL").optional(),
  thumbnail: z.string().url("Please enter a valid thumbnail URL").optional(),
  screenshots: z.array(z.string().url()).optional(),
  slug: z.string().min(1, "Game slug cannot be empty").optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  gameplayGuide: multiLangSchema.optional(),
  difficultyLevel: z.number().min(1).max(5).optional(),
  estimatedDuration: z.number().positive().optional(),
  developerInfo: multiLangSchema.optional(),
  gameStory: multiLangSchema.optional(),
  controlsInfo: multiLangSchema.optional(),
  categoryIds: z.array(z.string()).optional(),
  tagIds: z.array(z.string()).optional(),
});

const gameDeleteSchema = z.object({
  id: z.string(),
});

const gameListSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  search: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const gameRouter = createTRPCRouter({
  // 获取游戏列表（公开接口）
  list: procedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        search: z.string().optional(),
        categoryId: z.string().optional(),
        tagId: z.string().optional(),
        isActive: z.boolean().optional(),
        isFeatured: z.boolean().optional(),
        sortBy: z.enum(["createdAt", "title", "avgRating", "playCount"]).default("createdAt"),
        sortOrder: z.enum(["asc", "desc"]).default("desc"),
        language: z.enum(["en", "zh"]).default("en"),
      }),
    )
    .query(async ({ input }) => {
      const { page, limit, search, categoryId, tagId, isActive, isFeatured, sortBy, sortOrder, language } = input;
      const offset = (page - 1) * limit;

      let query = db
        .selectFrom("games")
        .leftJoin("game_categories", "games.id", "game_categories.gameId")
        .leftJoin("categories", "game_categories.categoryId", "categories.id")
        .leftJoin("game_tag_relations", "games.id", "game_tag_relations.gameId")
        .leftJoin("game_tags", "game_tag_relations.tagId", "game_tags.id")
        .select([
          "games.id",
          "games.title",
          "games.description",
          "games.slug",
          "games.coverImage",
          "games.thumbnail",
          "games.screenshots",
          "games.isActive",
          "games.isFeatured",
          "games.avgRating",
          "games.playCount",
          "games.createdAt",
          "games.updatedAt",
        ])
        .groupBy([
          "games.id",
          "games.title",
          "games.description",
          "games.slug",
          "games.coverImage",
          "games.thumbnail",
          "games.screenshots",
          "games.isActive",
          "games.isFeatured",
          "games.avgRating",
          "games.playCount",
          "games.createdAt",
          "games.updatedAt",
        ]);

      // 搜索条件 - 支持多语言搜索
      if (search) {
        query = query.where((eb) => {
          const titleSearch = eb("games.title", "->", language, "ilike", `%${search}%`);
          const descSearch = eb("games.description", "->", language, "ilike", `%${search}%`);
          return eb.or([titleSearch, descSearch]);
        });
      }

      // 分类筛选
      if (categoryId) {
        query = query.where("game_categories.categoryId", "=", categoryId);
      }

      // 标签筛选
      if (tagId) {
        query = query.where("game_tag_relations.tagId", "=", tagId);
      }

      // 状态筛选
      if (isActive !== undefined) {
        query = query.where("games.isActive", "=", isActive);
      }

      // 推荐筛选
      if (isFeatured !== undefined) {
        query = query.where("games.isFeatured", "=", isFeatured);
      }

      // 排序
      if (sortBy === "title") {
        query = query.orderBy(`games.title->${language}`, sortOrder);
      } else {
        query = query.orderBy(`games.${sortBy}`, sortOrder);
      }

      // 获取总数
      const totalQuery = query.clearSelect().select((eb) => eb.fn.countAll().as("count"));
      const totalResult = await totalQuery.executeTakeFirst();
      const total = Number(totalResult?.count ?? 0);

      // 获取分页数据
      const games = await query.limit(limit).offset(offset).execute();

      return {
        games,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }),

  // 根据ID获取游戏详情（公开接口）
  getById: procedure
    .input(z.object({ 
      id: z.string(),
      language: z.enum(["en", "zh"]).default("en"),
    }))
    .query(async ({ input }) => {
      const { id, language } = input;
      
      const game = await db
        .selectFrom("games")
        .selectAll()
        .where("id", "=", id)
        .executeTakeFirst();

      if (!game) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Game not found",
        });
      }

      // 获取游戏分类
      const categories = await db
        .selectFrom("game_categories")
        .innerJoin("categories", "game_categories.categoryId", "categories.id")
        .select([
          "categories.id",
          "categories.name",
          "categories.slug",
          "categories.icon",
        ])
        .where("game_categories.gameId", "=", id)
        .execute();

      // 获取游戏标签
      const tags = await db
        .selectFrom("game_tag_relations")
        .innerJoin("game_tags", "game_tag_relations.tagId", "game_tags.id")
        .select([
          "game_tags.id",
          "game_tags.name",
          "game_tags.color",
        ])
        .where("game_tag_relations.gameId", "=", id)
        .execute();

      // 获取评分统计
      const ratingStats = await db
        .selectFrom("game_ratings")
        .select((eb) => [
          eb.fn.avg("rating").as("avgRating"),
          eb.fn.count("id").as("totalRatings"),
        ])
        .where("gameId", "=", id)
        .executeTakeFirst();

      // 获取最新评论（前5条）
      const recentComments = await db
        .selectFrom("game_comments")
        .innerJoin("users", "game_comments.userId", "users.id")
        .select([
          "game_comments.id",
          "game_comments.content",
          "game_comments.createdAt",
          "users.name as userName",
          "users.image as userImage",
        ])
        .where("game_comments.gameId", "=", id)
        .where("game_comments.isApproved", "=", true)
        .orderBy("game_comments.createdAt", "desc")
        .limit(5)
        .execute();

      return {
        ...game,
        categories,
        tags,
        ratingStats: {
          avgRating: Number(ratingStats?.avgRating ?? 0),
          totalRatings: Number(ratingStats?.totalRatings ?? 0),
        },
        recentComments,
      };
    }),

  // 根据slug获取游戏详情（公开接口）
  getBySlug: procedure
    .input(z.object({ 
      slug: z.string(),
      language: z.enum(["en", "zh"]).default("en"),
    }))
    .query(async ({ input }) => {
      const { slug, language } = input;
      
      const game = await db
        .selectFrom("games")
        .selectAll()
        .where("slug", "=", slug)
        .executeTakeFirst();

      if (!game) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Game not found",
        });
      }

      // 获取完整游戏信息（复用getById的逻辑）
      const gameDetails = await db
        .selectFrom("games")
        .selectAll()
        .where("id", "=", game.id)
        .executeTakeFirst();

      // 获取游戏分类
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

      // 获取游戏标签
      const tags = await db
        .selectFrom("game_tag_relations")
        .innerJoin("game_tags", "game_tag_relations.tagId", "game_tags.id")
        .select([
          "game_tags.id",
          "game_tags.name",
          "game_tags.color",
        ])
        .where("game_tag_relations.gameId", "=", game.id)
        .execute();

      return {
        ...gameDetails,
        categories,
        tags,
      };
    }),

  // 增加游戏播放次数
  incrementPlayCount: procedure
    .input(z.object({ gameId: z.string() }))
    .mutation(async ({ input }) => {
      await db
        .updateTable("games")
        .set((eb) => ({
          playCount: eb("playCount", "+", 1),
        }))
        .where("id", "=", input.gameId)
        .execute();

      return { success: true };
    }),

  // 获取推荐游戏
  getRecommended: procedure
    .input(z.object({
      gameId: z.string().optional(),
      limit: z.number().min(1).max(20).default(6),
      language: z.enum(["en", "zh"]).default("en"),
    }))
    .query(async ({ input }) => {
      const { gameId, limit, language } = input;
      
      let query = db
        .selectFrom("games")
        .select([
          "id",
          "title",
          "description",
          "slug",
          "coverImage",
          "thumbnail",
          "avgRating",
          "playCount",
        ])
        .where("isActive", "=", true);

      // 如果提供了gameId，排除当前游戏
      if (gameId) {
        query = query.where("id", "!=", gameId);
      }

      // 按评分和播放次数排序推荐
      const games = await query
        .orderBy("avgRating", "desc")
        .orderBy("playCount", "desc")
        .limit(limit)
        .execute();

      return games;
    }),

  // 创建游戏（需要认证）
  create: protectedProcedure
    .input(gameCreateSchema)
    .mutation(async ({ input }) => {
      const { categoryIds, tagIds, ...gameData } = input;
      
      try {
        // 检查slug是否已存在
        const existingGame = await db
          .selectFrom("games")
          .select("id")
          .where("slug", "=", input.slug)
          .executeTakeFirst();

        if (existingGame) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Game slug already exists",
          });
        }

        // 创建游戏
        const newGame = await db
          .insertInto("games")
          .values(gameData)
          .returningAll()
          .executeTakeFirst();

        if (!newGame) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "创建游戏失败",
          });
        }

        // 创建分类关联
        if (categoryIds && categoryIds.length > 0) {
          await db
            .insertInto("game_categories")
            .values(
              categoryIds.map(categoryId => ({
                gameId: newGame.id,
                categoryId,
              }))
            )
            .execute();
        }

        // 创建标签关联
        if (tagIds && tagIds.length > 0) {
          await db
            .insertInto("game_tag_relations")
            .values(
              tagIds.map(tagId => ({
                gameId: newGame.id,
                tagId,
              }))
            )
            .execute();
        }

        return newGame;
      } catch (error) {
        if (error instanceof z.ZodError) {
          throw new TRPCError({ code: "BAD_REQUEST", cause: error });
        }
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", cause: error });
      }
    }),

  // 更新游戏（需要认证）
  update: protectedProcedure
    .input(gameUpdateSchema)
    .mutation(async ({ input }) => {
      const { id, categoryIds, tagIds, ...updateData } = input;

      try {
        // 检查游戏是否存在
        const existingGame = await db
          .selectFrom("games")
          .selectAll()
          .where("id", "=", id)
          .executeTakeFirst();

        if (!existingGame) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Game not found",
          });
        }

        // 如果更新slug，检查是否与其他游戏冲突
        if (updateData.slug && updateData.slug !== existingGame.slug) {
          const slugConflict = await db
            .selectFrom("games")
            .select("id")
            .where("slug", "=", updateData.slug)
            .where("id", "!=", id)
            .executeTakeFirst();

          if (slugConflict) {
            throw new TRPCError({
              code: "CONFLICT",
              message: "Game slug already exists",
            });
          }
        }

        // 更新游戏基本信息
        let updatedGame = existingGame;
        if (Object.keys(updateData).length > 0) {
          updatedGame = await db
            .updateTable("games")
            .set(updateData)
            .where("id", "=", id)
            .returningAll()
            .executeTakeFirst();
        }

        // 更新分类关联
        if (categoryIds !== undefined) {
          // 删除现有关联
          await db
            .deleteFrom("game_categories")
            .where("gameId", "=", id)
            .execute();

          // 创建新关联
          if (categoryIds.length > 0) {
            await db
              .insertInto("game_categories")
              .values(
                categoryIds.map(categoryId => ({
                  gameId: id,
                  categoryId,
                }))
              )
              .execute();
          }
        }

        // 更新标签关联
        if (tagIds !== undefined) {
          // 删除现有关联
          await db
            .deleteFrom("game_tag_relations")
            .where("gameId", "=", id)
            .execute();

          // 创建新关联
          if (tagIds.length > 0) {
            await db
              .insertInto("game_tag_relations")
              .values(
                tagIds.map(tagId => ({
                  gameId: id,
                  tagId,
                }))
              )
              .execute();
          }
        }

        return updatedGame;
      } catch (error) {
        if (error instanceof z.ZodError) {
          throw new TRPCError({ code: "BAD_REQUEST", cause: error });
        }
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", cause: error });
      }
    }),

  // 删除游戏（需要认证）
  delete: protectedProcedure
    .input(gameDeleteSchema)
    .mutation(async ({ input }) => {
      const { id } = input;

      try {
        // 检查游戏是否存在
        const existingGame = await db
          .selectFrom("games")
          .select("id")
          .where("id", "=", id)
          .executeTakeFirst();

        if (!existingGame) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "游戏不存在",
          });
        }

        // 删除游戏分类关联
        await db.deleteFrom("game_categories").where("gameId", "=", id).execute();

        // 删除游戏
        await db.deleteFrom("games").where("id", "=", id).execute();

        return {
          success: true,
          message: "游戏删除成功",
        };
      } catch (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", cause: error });
      }
    }),

  // 管理员获取游戏列表（包含非活跃游戏）
  adminList: protectedProcedure
    .input(gameListSchema)
    .query(async ({ input }) => {
      const { page, limit, search } = input;
      const offset = (page - 1) * limit;

      let query = db.selectFrom("games").selectAll();

      if (search) {
        query = query.where((eb) =>
          eb.or([
            eb("title", "ilike", `%${search}%`),
            eb("description", "ilike", `%${search}%`),
          ])
        );
      }

      // 获取总数
      const totalQuery = await db
        .selectFrom("games")
        .select((eb) => eb.fn.count("id").as("count"))
        .executeTakeFirst();
      
      const total = Number(totalQuery?.count || 0);

      // 分页查询
      const games = await query
        .orderBy("createdAt", "desc")
        .limit(limit)
        .offset(offset)
        .execute();

      return {
        games,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }),
});