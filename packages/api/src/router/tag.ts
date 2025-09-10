import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, procedure, protectedProcedure } from "../trpc";
import { db } from "@saasfly/db";
import { randomUUID } from "crypto";

// 多语言内容schema
const multiLangSchema = z.object({
  en: z.string().min(1, "英文内容不能为空"),
  zh: z.string().optional(),
});

// 标签创建schema
const tagCreateSchema = z.object({
  name: multiLangSchema,
  description: multiLangSchema.optional(),
  slug: z.string().min(1, "标识符不能为空").regex(/^[a-z0-9-]+$/, "标识符只能包含小写字母、数字和连字符"),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "颜色必须是有效的十六进制颜色代码").optional(),
  icon: z.string().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0),
});

// 标签更新schema
const tagUpdateSchema = z.object({
  id: z.string(),
  name: multiLangSchema.optional(),
  description: multiLangSchema.optional(),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  icon: z.string().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

// 标签列表查询schema
const tagListSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  isActive: z.boolean().optional(),
  language: z.enum(["en", "zh"]).default("en"),
  sortBy: z.enum(["name", "gameCount", "createdAt", "sortOrder"]).default("sortOrder"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

export const tagRouter = createTRPCRouter({
  // Get tag list (public interface)
  list: procedure
    .input(tagListSchema)
    .query(async ({ input }) => {
      const { page, limit, search, isActive, language, sortBy, sortOrder } = input;
      const offset = (page - 1) * limit;

      let query = db
        .selectFrom("game_tags")
        .select([
          "id",
          "name",
          "description",
          "slug",
          "color",
          "icon",
          "isActive",
          "sortOrder",
          "createdAt",
          "updatedAt",
        ]);

      // 状态筛选
      if (isActive !== undefined) {
        query = query.where("isActive", "=", isActive);
      }

      // 搜索条件
      if (search) {
        query = query.where((eb) =>
          eb.or([
            eb("slug", "ilike", `%${search}%`),
          ])
        );
      }

      // 排序
      if (sortBy === "gameCount") {
        // 需要关联查询游戏数量
        query = query
          .leftJoin("game_tag_relations", "game_tags.id", "game_tag_relations.tagId")
          .groupBy("game_tags.id")
          .select((eb) => eb.fn.countAll().as("gameCount"))
          .orderBy("gameCount", sortOrder);
      } else {
        query = query.orderBy(sortBy, sortOrder);
      }

      // 获取总数
      const totalQuery = db
        .selectFrom("game_tags")
        .select((eb) => eb.fn.countAll().as("count"));
      
      if (isActive !== undefined) {
        totalQuery.where("isActive", "=", isActive);
      }
      if (search) {
        totalQuery.where("slug", "ilike", `%${search}%`);
      }

      const totalResult = await totalQuery.executeTakeFirst();
      const total = Number(totalResult?.count ?? 0);

      // 获取分页数据
      const tags = await query.limit(limit).offset(offset).execute();

      // 获取每个标签的游戏数量
      const tagsWithGameCount = await Promise.all(
        tags.map(async (tag) => {
          const gameCountResult = await db
            .selectFrom("game_tag_relations")
            .select((eb) => eb.fn.countAll().as("count"))
            .where("tagId", "=", tag.id)
            .executeTakeFirst();

          return {
            ...tag,
            gameCount: Number(gameCountResult?.count ?? 0),
          };
        })
      );

      return {
        tags: tagsWithGameCount,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }),

  // Get single tag details (public interface)
  getById: procedure
    .input(z.object({ 
      id: z.string(),
      language: z.enum(["en", "zh"]).default("en")
    }))
    .query(async ({ input }) => {
      const tag = await db
        .selectFrom("game_tags")
        .selectAll()
        .where("id", "=", input.id)
        .where("isActive", "=", true)
        .executeTakeFirst();

      if (!tag) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "标签不存在",
        });
      }

      // 获取关联的游戏数量
      const gameCountResult = await db
        .selectFrom("game_tag_relations")
        .select((eb) => eb.fn.countAll().as("count"))
        .where("tagId", "=", tag.id)
        .executeTakeFirst();

      return {
        ...tag,
        gameCount: Number(gameCountResult?.count ?? 0),
      };
    }),

  // Get tag by slug (public interface)
  getBySlug: procedure
    .input(z.object({ 
      slug: z.string(),
      language: z.enum(["en", "zh"]).default("en")
    }))
    .query(async ({ input }) => {
      const tag = await db
        .selectFrom("game_tags")
        .selectAll()
        .where("slug", "=", input.slug)
        .where("isActive", "=", true)
        .executeTakeFirst();

      if (!tag) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "标签不存在",
        });
      }

      // 获取关联的游戏数量
      const gameCountResult = await db
        .selectFrom("game_tag_relations")
        .select((eb) => eb.fn.countAll().as("count"))
        .where("tagId", "=", input.id)
        .executeTakeFirst();

      return {
        ...tag,
        gameCount: Number(gameCountResult?.count ?? 0),
      };
    }),

  // Get popular tags (public interface)
  getPopular: procedure
    .input(z.object({
      limit: z.number().int().min(1).max(50).default(10),
      language: z.enum(["en", "zh"]).default("en"),
    }))
    .query(async ({ input }) => {
      const { limit, language } = input;

      const popularTags = await db
        .selectFrom("game_tags")
        .leftJoin("game_tag_relations", "game_tags.id", "game_tag_relations.tagId")
        .select([
          "game_tags.id",
          "game_tags.name",
          "game_tags.slug",
          "game_tags.color",
          "game_tags.icon",
          (eb) => eb.fn.countAll().as("gameCount"),
        ])
        .where("game_tags.isActive", "=", true)
        .groupBy("game_tags.id")
        .orderBy("gameCount", "desc")
        .limit(limit)
        .execute();

      return popularTags.map(tag => ({
        ...tag,
        gameCount: Number(tag.gameCount),
      }));
    }),

  // Create tag (admin only)
  create: protectedProcedure
    .input(tagCreateSchema)
    .mutation(async ({ input }) => {
      // Check if slug already exists
      const existingTag = await db
        .selectFrom("game_tags")
        .select("id")
        .where("slug", "=", input.slug)
        .executeTakeFirst();

      if (existingTag) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "标签标识符已存在",
        });
      }

      const tagId = randomUUID();
      const now = new Date();

      const tag = await db
        .insertInto("game_tags")
        .values({
          id: tagId,
          name: JSON.stringify(input.name),
          description: input.description ? JSON.stringify(input.description) : null,
          slug: input.slug,
          color: input.color ?? null,
          icon: input.icon ?? null,
          isActive: input.isActive ?? true,
          sortOrder: input.sortOrder ?? 0,
          createdAt: now,
          updatedAt: now,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      return tag;
    }),

  // Update tag (admin only)
  update: protectedProcedure
    .input(tagUpdateSchema)
    .mutation(async ({ input }) => {
      const { id, ...updateData } = input;

      // Check if tag exists
      const existingTag = await db
        .selectFrom("game_tags")
        .selectAll()
        .where("id", "=", id)
        .executeTakeFirst();

      if (!existingTag) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "标签不存在",
        });
      }

      // Check slug uniqueness if slug is being updated
      if (updateData.slug) {
        const slugExists = await db
          .selectFrom("game_tags")
          .select("id")
          .where("slug", "=", updateData.slug)
          .where("id", "!=", id)
          .executeTakeFirst();

        if (slugExists) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "标签标识符已存在",
          });
        }
      }

      // 准备更新数据
      const updateValues: any = {
        updatedAt: new Date(),
      };

      if (updateData.name) {
        updateValues.name = JSON.stringify(updateData.name);
      }
      if (updateData.description !== undefined) {
        updateValues.description = updateData.description ? JSON.stringify(updateData.description) : null;
      }
      if (updateData.slug) {
        updateValues.slug = updateData.slug;
      }
      if (updateData.color !== undefined) {
        updateValues.color = updateData.color;
      }
      if (updateData.icon !== undefined) {
        updateValues.icon = updateData.icon;
      }
      if (updateData.isActive !== undefined) {
        updateValues.isActive = updateData.isActive;
      }
      if (updateData.sortOrder !== undefined) {
        updateValues.sortOrder = updateData.sortOrder;
      }

      const updatedTag = await db
        .updateTable("game_tags")
        .set(updateValues)
        .where("id", "=", id)
        .returningAll()
        .executeTakeFirstOrThrow();

      return updatedTag;
    }),

  // Delete tag (admin only)
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const { id } = input;

      // Check if tag exists
      const existingTag = await db
        .selectFrom("game_tags")
        .select("id")
        .where("id", "=", id)
        .executeTakeFirst();

      if (!existingTag) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "标签不存在",
        });
      }

      // Check if tag has associated games
      const gamesCount = await db
        .selectFrom("game_tag_relations")
        .select((eb) => eb.fn.countAll().as("count"))
        .where("tagId", "=", id)
        .executeTakeFirst();

      if (Number(gamesCount?.count || 0) > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "不能删除包含游戏的标签",
        });
      }

      await db.deleteFrom("game_tags").where("id", "=", id).execute();

      return {
        success: true,
        message: "标签删除成功",
      };
    }),

  // Batch assign tags to game (admin only)
  assignToGame: protectedProcedure
    .input(z.object({
      gameId: z.string(),
      tagIds: z.array(z.string()),
    }))
    .mutation(async ({ input }) => {
      const { gameId, tagIds } = input;

      // 验证游戏存在
      const game = await db
        .selectFrom("games")
        .select("id")
        .where("id", "=", gameId)
        .executeTakeFirst();

      if (!game) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "游戏不存在",
        });
      }

      // 验证所有标签存在
      const existingTags = await db
        .selectFrom("game_tags")
        .select("id")
        .where("id", "in", tagIds)
        .execute();

      if (existingTags.length !== tagIds.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "部分标签不存在",
        });
      }

      // 删除现有关联
      await db
        .deleteFrom("game_tag_relations")
        .where("gameId", "=", gameId)
        .execute();

      // 创建新关联
      if (tagIds.length > 0) {
        const gameTagRelations = tagIds.map(tagId => ({
          id: randomUUID(),
          gameId,
          tagId,
          createdAt: new Date(),
        }));

        await db
          .insertInto("game_tag_relations")
          .values(gameTagRelations)
          .execute();
      }

      return {
        success: true,
        message: "标签分配成功",
      };
    }),
});