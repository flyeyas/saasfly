import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { randomUUID } from "crypto";

import { db } from "@saasfly/db";

import { createTRPCRouter, protectedProcedure, procedure } from "../trpc";

// 多语言内容schema
const multiLangSchema = z.object({
  en: z.string(),
  zh: z.string().optional(),
});

const categoryCreateSchema = z.object({
  name: multiLangSchema,
  description: multiLangSchema.optional(),
  slug: z.string().min(1, "Category slug cannot be empty"),
  icon: z.string().optional(),
  parentId: z.string().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().default(0),
});

const categoryUpdateSchema = z.object({
  id: z.string(),
  name: multiLangSchema.optional(),
  description: multiLangSchema.optional(),
  slug: z.string().min(1, "Category slug cannot be empty").optional(),
  icon: z.string().optional(),
  parentId: z.string().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().optional(),
});

const categoryDeleteSchema = z.object({
  id: z.string(),
});

const categoryListSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  search: z.string().optional(),
  parentId: z.string().optional(),
  includeChildren: z.boolean().default(false),
  isActive: z.boolean().optional(),
  language: z.enum(["en", "zh"]).default("en"),
});

const gameCategoryAssignSchema = z.object({
  gameId: z.string(),
  categoryIds: z.array(z.string()),
});

export const categoryRouter = createTRPCRouter({
  // Get category list (public interface)
  list: procedure
    .input(categoryListSchema)
    .query(async ({ input }) => {
      const { page, limit, search, parentId, includeChildren, isActive, language } = input;
      const offset = (page - 1) * limit;

      let query = db
        .selectFrom("categories")
        .select([
          "id",
          "name",
          "description",
          "slug",
          "icon",
          "parentId",
          "isActive",
          "sortOrder",
          "createdAt",
          "updatedAt",
        ])
        .orderBy("sortOrder", "asc")
        .orderBy("createdAt", "asc");

      // 父分类筛选
      if (parentId !== undefined) {
        query = query.where("parentId", "=", parentId);
      }

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

      // 获取总数
      const totalQuery = query.clearSelect().select((eb) => eb.fn.countAll().as("count"));
      const totalResult = await totalQuery.executeTakeFirst();
      const total = Number(totalResult?.count ?? 0);

      // 获取分页数据
      const categories = await query.limit(limit).offset(offset).execute();

      // 如果需要包含子分类
      let categoriesWithChildren = categories;
      if (includeChildren) {
        categoriesWithChildren = await Promise.all(
          categories.map(async (category) => {
            const children = await db
              .selectFrom("categories")
              .select([
                "id",
                "name",
                "description",
                "slug",
                "icon",
                "parentId",
                "isActive",
                "sortOrder",
              ])
              .where("parentId", "=", category.id)
              .where("isActive", "=", true)
              .orderBy("sortOrder", "asc")
              .execute();

            return {
              ...category,
              children,
            };
          })
        );
      }

      return {
        categories: categoriesWithChildren,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }),

  // Get single category details (public interface)
  getById: procedure
    .input(z.object({ 
      id: z.string(),
      language: z.enum(["en", "zh"]).default("en")
    }))
    .query(async ({ input }) => {
      const category = await db
        .selectFrom("categories")
        .selectAll()
        .where("id", "=", input.id)
        .where("isActive", "=", true)
        .executeTakeFirst();

      if (!category) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "分类不存在",
        });
      }

      // Get child categories
      const children = await db
        .selectFrom("categories")
        .selectAll()
        .where("parentId", "=", input.id)
        .where("isActive", "=", true)
        .orderBy("sortOrder", "asc")
        .execute();

      return {
        ...category,
        children,
      };
    }),

  // Get category with game count
  getWithGameCount: procedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const category = await db
        .selectFrom("categories")
        .selectAll()
        .where("id", "=", input.id)
        .executeTakeFirst();

      if (!category) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Category not found",
        });
      }

      // Get game count for this category
      const gameCountQuery = await db
        .selectFrom("game_categories")
        .select((eb) => eb.fn.count("gameId").as("count"))
        .where("categoryId", "=", input.id)
        .executeTakeFirst();

      const gameCount = Number(gameCountQuery?.count || 0);

      return {
        ...category,
        gameCount,
      };
    }),

  // Create category (admin only)
  create: protectedProcedure
    .input(categoryCreateSchema)
    .mutation(async ({ input }) => {
      // Check if slug already exists
      const existingCategory = await db
        .selectFrom("categories")
        .select("id")
        .where("slug", "=", input.slug)
        .executeTakeFirst();

      if (existingCategory) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "分类标识符已存在",
        });
      }

      // 验证父分类存在性
      if (input.parentId) {
        const parentCategory = await db
          .selectFrom("categories")
          .select("id")
          .where("id", "=", input.parentId)
          .executeTakeFirst();

        if (!parentCategory) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "父分类不存在",
          });
        }
      }

      const categoryId = randomUUID();
       const now = new Date();

       const category = await db
         .insertInto("categories")
         .values({
           id: categoryId,
           name: JSON.stringify(input.name),
           description: input.description ? JSON.stringify(input.description) : null,
           slug: input.slug,
           icon: input.icon ?? null,
           parentId: input.parentId ?? null,
           isActive: input.isActive ?? true,
           sortOrder: input.sortOrder ?? 0,
           createdAt: now,
           updatedAt: now,
         })
         .returningAll()
         .executeTakeFirstOrThrow();

      return category;
    }),

  // Update category (requires authentication)
  update: protectedProcedure
    .input(categoryUpdateSchema)
    .mutation(async ({ input }) => {
      const { id, ...updateData } = input;

      // Check if category exists
      const existingCategory = await db
        .selectFrom("categories")
        .selectAll()
        .where("id", "=", id)
        .executeTakeFirst();

      if (!existingCategory) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "分类不存在",
        });
      }

      // Check slug uniqueness if slug is being updated
      if (updateData.slug) {
        const slugExists = await db
          .selectFrom("categories")
          .select("id")
          .where("slug", "=", updateData.slug)
          .where("id", "!=", id)
          .executeTakeFirst();

        if (slugExists) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "分类标识符已存在",
          });
        }
      }

      // 验证父分类存在性
      if (updateData.parentId) {
        const parentCategory = await db
          .selectFrom("categories")
          .select("id")
          .where("id", "=", updateData.parentId)
          .executeTakeFirst();

        if (!parentCategory) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "父分类不存在",
          });
        }

        // 防止循环引用
        if (updateData.parentId === id) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "不能将分类设置为自己的父分类",
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
      if (updateData.icon !== undefined) {
        updateValues.icon = updateData.icon;
      }
      if (updateData.parentId !== undefined) {
        updateValues.parentId = updateData.parentId;
      }
      if (updateData.isActive !== undefined) {
        updateValues.isActive = updateData.isActive;
      }
      if (updateData.sortOrder !== undefined) {
        updateValues.sortOrder = updateData.sortOrder;
      }

      const updatedCategory = await db
        .updateTable("categories")
        .set(updateValues)
        .where("id", "=", id)
        .returningAll()
        .executeTakeFirstOrThrow();

      return updatedCategory;
    }),

  // Delete category (admin only)
  delete: protectedProcedure
    .input(categoryDeleteSchema)
    .mutation(async ({ input }) => {
      const { id } = input;

      // Check if category exists
      const existingCategory = await db
        .selectFrom("categories")
        .select("id")
        .where("id", "=", id)
        .executeTakeFirst();

      if (!existingCategory) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "分类不存在",
        });
      }

      // Check if category has child categories
      const childrenCount = await db
        .selectFrom("categories")
        .select((eb) => eb.fn.countAll().as("count"))
        .where("parentId", "=", id)
        .executeTakeFirst();

      if (Number(childrenCount?.count || 0) > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "不能删除包含子分类的分类",
        });
      }

      // Check if category has associated games
      const gamesCount = await db
        .selectFrom("game_categories")
        .select((eb) => eb.fn.countAll().as("count"))
        .where("categoryId", "=", id)
        .executeTakeFirst();

      if (Number(gamesCount?.count || 0) > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "不能删除包含游戏的分类",
        });
      }

      await db.deleteFrom("categories").where("id", "=", id).execute();

      return {
        success: true,
        message: "分类删除成功",
      };
    }),

  // Admin get category list (includes inactive categories)
  adminList: protectedProcedure
    .input(categoryListSchema)
    .query(async ({ input }) => {
      const { page, limit, search } = input;
      const offset = (page - 1) * limit;

      let query = db.selectFrom("categories").selectAll();

      if (search) {
        query = query.where("name", "ilike", `%${search}%`);
      }

      // Get total count
      const totalQuery = await db
        .selectFrom("categories")
        .select((eb) => eb.fn.count("id").as("count"))
        .executeTakeFirst();
      
      const total = Number(totalQuery?.count || 0);

      // Paginated query
      const categories = await query
        .orderBy("createdAt", "desc")
        .limit(limit)
        .offset(offset)
        .execute();

      return {
        categories,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }),

  // Assign games to category (requires authentication)
  assignGamesToCategory: protectedProcedure
    .input(gameCategoryAssignSchema)
    .mutation(async ({ input }) => {
      const { gameId, categoryIds } = input;

      try {
        // Check if game exists
        const existingGame = await db
          .selectFrom("games")
          .select("id")
          .where("id", "=", gameId)
          .executeTakeFirst();

        if (!existingGame) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Game not found",
          });
        }

        // Remove existing associations for this game
        await db.deleteFrom("game_categories").where("gameId", "=", gameId).execute();

        // Add new associations
        if (categoryIds.length > 0) {
          const associations = categoryIds.map(categoryId => ({
            id: randomUUID(),
            gameId,
            categoryId,
          }));

          await db
            .insertInto("game_categories")
            .values(associations)
            .execute();
        }

        return {
          success: true,
          message: "Game categories updated successfully",
        };
      } catch (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", cause: error });
      }
    }),

  // Get games by category
  getGamesByCategory: procedure
    .input(z.object({ 
      categoryId: z.string(),
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(20),
    }))
    .query(async ({ input }) => {
      const { categoryId, page, limit } = input;
      const offset = (page - 1) * limit;

      // Get games in this category
      const games = await db
        .selectFrom("games")
        .innerJoin("game_categories", "games.id", "game_categories.gameId")
        .selectAll("games")
        .where("game_categories.categoryId", "=", categoryId)
        .where("games.isActive", "=", true)
        .orderBy("games.createdAt", "desc")
        .limit(limit)
        .offset(offset)
        .execute();

      // Get total count
      const totalQuery = await db
        .selectFrom("games")
        .innerJoin("game_categories", "games.id", "game_categories.gameId")
        .select((eb) => eb.fn.count("games.id").as("count"))
        .where("game_categories.categoryId", "=", categoryId)
        .where("games.isActive", "=", true)
        .executeTakeFirst();

      const total = Number(totalQuery?.count || 0);

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