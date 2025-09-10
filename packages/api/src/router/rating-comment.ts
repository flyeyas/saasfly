import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, procedure, protectedProcedure } from "../trpc";
import { db } from "@saasfly/db";

// 评分schema
const ratingSchema = z.object({
  gameId: z.string().min(1, "游戏ID不能为空"),
  rating: z.number().int().min(1, "评分不能低于1星").max(5, "评分不能超过5星"),
});

// 评论schema
const commentSchema = z.object({
  gameId: z.string().min(1, "游戏ID不能为空"),
  content: z.string().min(1, "评论内容不能为空").max(1000, "评论内容不能超过1000字符"),
  parentId: z.string().optional(), // 回复评论的父评论ID
});

// 获取评论列表schema
const getCommentsSchema = z.object({
  gameId: z.string().min(1, "游戏ID不能为空"),
  parentId: z.string().optional(), // 获取特定评论的回复
  sortBy: z.enum(["newest", "oldest", "likes"]).default("newest"),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(20),
});

// 评论点赞schema
const likeCommentSchema = z.object({
  commentId: z.string().min(1, "评论ID不能为空"),
});

// 获取评分统计schema
const getRatingStatsSchema = z.object({
  gameId: z.string().min(1, "游戏ID不能为空"),
});

export const ratingCommentRouter = createTRPCRouter({
  // 提交评分 (需要登录)
  submitRating: protectedProcedure
    .input(ratingSchema)
    .mutation(async ({ input, ctx }) => {
      const { gameId, rating } = input;
      const userId = ctx.session?.user?.id;
      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "用户未登录",
        });
      }

      // 检查游戏是否存在
      const game = await db
        .selectFrom("games")
        .select("id")
        .where("id", "=", gameId)
        .where("isActive", "=", true)
        .executeTakeFirst();

      if (!game) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "游戏不存在或已下架",
        });
      }

      // 检查用户是否已经评分过
      const existingRating = await db
        .selectFrom("game_ratings")
        .select("id")
        .where("gameId", "=", gameId)
        .where("userId", "=", userId)
        .executeTakeFirst();

      if (existingRating) {
        // 更新现有评分
        await db
          .updateTable("game_ratings")
          .set({
            rating,
            updatedAt: new Date(),
          })
          .where("id", "=", existingRating.id)
          .execute();
      } else {
        // 创建新评分
        await db
          .insertInto("game_ratings")
          .values({
            id: crypto.randomUUID(),
            gameId,
            userId,
            rating,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .execute();
      }

      // 重新计算游戏的平均评分和评分数量
      const ratingStats = await db
        .selectFrom("game_ratings")
        .select([
          (eb) => eb.fn.avg("rating").as("averageRating"),
          (eb) => eb.fn.countAll().as("ratingCount"),
        ])
        .where("gameId", "=", gameId)
        .executeTakeFirst();

      // 更新游戏的评分数量（平均评分由数据库触发器或应用层计算）
      await db
        .updateTable("games")
        .set({
          ratingCount: Number(ratingStats?.ratingCount ?? 0),
        })
        .where("id", "=", gameId)
        .execute();

      return {
        success: true,
        message: existingRating ? "评分已更新" : "评分已提交",
        rating,
        averageRating: Number(ratingStats?.averageRating ?? 0),
        ratingCount: Number(ratingStats?.ratingCount ?? 0),
      };
    }),

  // 获取用户对游戏的评分 (需要登录)
  getUserRating: protectedProcedure
    .input(z.object({ gameId: z.string() }))
    .query(async ({ input, ctx }) => {
      const { gameId } = input;
      const userId = ctx.session?.user?.id;
      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "用户未登录",
        });
      }

      const rating = await db
        .selectFrom("game_ratings")
        .select(["rating", "createdAt", "updatedAt"])
        .where("gameId", "=", gameId)
        .where("userId", "=", userId)
        .executeTakeFirst();

      return rating;
    }),

  // 获取游戏评分统计 (公开接口)
  getRatingStats: procedure
    .input(getRatingStatsSchema)
    .query(async ({ input }) => {
      const { gameId } = input;

      // 获取基本统计
      const basicStats = await db
        .selectFrom("game_ratings")
        .select([
          (eb) => eb.fn.avg("rating").as("averageRating"),
          (eb) => eb.fn.countAll().as("totalRatings"),
        ])
        .where("gameId", "=", gameId)
        .executeTakeFirst();

      // 获取各星级的分布
      const ratingDistribution = await db
        .selectFrom("game_ratings")
        .select([
          "rating",
          (eb) => eb.fn.countAll().as("count"),
        ])
        .where("gameId", "=", gameId)
        .groupBy("rating")
        .orderBy("rating", "desc")
        .execute();

      // 构建完整的分布数据（1-5星）
      const distribution = [5, 4, 3, 2, 1].map(star => {
        const found = ratingDistribution.find(r => r.rating === star);
        return {
          rating: star,
          count: Number(found?.count ?? 0),
          percentage: basicStats?.totalRatings 
            ? Math.round((Number(found?.count ?? 0) / Number(basicStats.totalRatings)) * 100)
            : 0,
        };
      });

      return {
        averageRating: Number(basicStats?.averageRating ?? 0),
        totalRatings: Number(basicStats?.totalRatings ?? 0),
        distribution,
      };
    }),

  // 提交评论 (需要登录)
  submitComment: protectedProcedure
    .input(commentSchema)
    .mutation(async ({ input, ctx }) => {
      const { gameId, content, parentId } = input;
      const userId = ctx.session?.user?.id;
      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "用户未登录",
        });
      }

      // 检查游戏是否存在
      const game = await db
        .selectFrom("games")
        .select("id")
        .where("id", "=", gameId)
        .where("isActive", "=", true)
        .executeTakeFirst();

      if (!game) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "游戏不存在或已下架",
        });
      }

      // 如果是回复评论，检查父评论是否存在
      if (parentId) {
        const parentComment = await db
          .selectFrom("game_comments")
          .select("id")
          .where("id", "=", parentId)
          .where("gameId", "=", gameId)
          .where("isActive", "=", true)
          .executeTakeFirst();

        if (!parentComment) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "父评论不存在",
          });
        }
      }

      // 创建评论
      const commentId = crypto.randomUUID();
      await db
        .insertInto("game_comments")
        .values({
          id: commentId,
          gameId,
          userId,
          content,
          parentId: parentId || null,
          likes: 0,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .execute();

      // 获取创建的评论详情
      const comment = await db
        .selectFrom("game_comments")
        .innerJoin("users", "game_comments.userId", "users.id")
        .select([
          "game_comments.id",
          "game_comments.content",
          "game_comments.likes",
          "game_comments.createdAt",
          "game_comments.updatedAt",
          "users.name as userName",
          "users.image as userImage",
        ])
        .where("game_comments.id", "=", commentId)
        .executeTakeFirst();

      return {
        success: true,
        message: "评论已发布",
        comment,
      };
    }),

  // 获取评论列表 (公开接口)
  getComments: procedure
    .input(getCommentsSchema)
    .query(async ({ input }) => {
      const { gameId, parentId, sortBy, page, limit } = input;
      const offset = (page - 1) * limit;

      // 构建查询
      let query = db
        .selectFrom("game_comments")
        .innerJoin("users", "game_comments.userId", "users.id")
        .select([
          "game_comments.id",
          "game_comments.content",
          "game_comments.parentId",
          "game_comments.likes",
          "game_comments.createdAt",
          "game_comments.updatedAt",
          "users.name as userName",
          "users.image as userImage",
        ])
        .where("game_comments.gameId", "=", gameId)
        .where("game_comments.isActive", "=", true);

      // 筛选父评论或回复
      if (parentId) {
        query = query.where("game_comments.parentId", "=", parentId);
      } else {
        query = query.where("game_comments.parentId", "is", null);
      }

      // 排序
      switch (sortBy) {
        case "newest":
          query = query.orderBy("game_comments.createdAt", "desc");
          break;
        case "oldest":
          query = query.orderBy("game_comments.createdAt", "asc");
          break;
        case "likes":
          query = query.orderBy("game_comments.likes", "desc");
          break;
      }

      // 获取评论列表
      const comments = await query.limit(limit).offset(offset).execute();

      // 获取总数
      let countQuery = db
        .selectFrom("game_comments")
        .select((eb) => eb.fn.countAll().as("count"))
        .where("gameId", "=", gameId)
        .where("isActive", "=", true);

      if (parentId) {
        countQuery = countQuery.where("parentId", "=", parentId);
      } else {
        countQuery = countQuery.where("parentId", "is", null);
      }

      const totalResult = await countQuery.executeTakeFirst();
      const total = Number(totalResult?.count ?? 0);

      // 如果是获取主评论，同时获取每个评论的回复数量
      const commentsWithReplies = await Promise.all(
        comments.map(async (comment) => {
          if (!parentId) {
            // 获取回复数量
            const replyCountResult = await db
              .selectFrom("game_comments")
              .select((eb) => eb.fn.countAll().as("count"))
              .where("parentId", "=", comment.id)
              .where("isActive", "=", true)
              .executeTakeFirst();

            return {
              ...comment,
              replyCount: Number(replyCountResult?.count ?? 0),
            };
          }
          return comment;
        })
      );

      return {
        comments: commentsWithReplies,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }),

  // 点赞/取消点赞评论 (需要登录)
  toggleCommentLike: protectedProcedure
    .input(likeCommentSchema)
    .mutation(async ({ input, ctx }) => {
      const { commentId } = input;
      const userId = ctx.session?.user?.id;
      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "用户未登录",
        });
      }

      // 检查评论是否存在
      const comment = await db
        .selectFrom("game_comments")
        .select(["id", "likes"])
        .where("id", "=", commentId)
        .where("isActive", "=", true)
        .executeTakeFirst();

      if (!comment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "评论不存在",
        });
      }

      // 检查用户是否已经点赞过（这里需要一个点赞记录表，暂时简化处理）
      // 实际项目中应该有一个 comment_likes 表来记录用户点赞
      
      // 暂时直接增加点赞数（实际应该检查用户是否已点赞）
      await db
        .updateTable("game_comments")
        .set({
          likes: comment.likes + 1,
          updatedAt: new Date(),
        })
        .where("id", "=", commentId)
        .execute();

      return {
        success: true,
        message: "点赞成功",
        likes: comment.likes + 1,
      };
    }),

  // 删除评论 (需要登录，只能删除自己的评论)
  deleteComment: protectedProcedure
    .input(z.object({ commentId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { commentId } = input;
      const userId = ctx.session?.user?.id;
      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "用户未登录",
        });
      }

      // 检查评论是否存在且属于当前用户
      const comment = await db
        .selectFrom("game_comments")
        .select(["id", "userId"])
        .where("id", "=", commentId)
        .where("isActive", "=", true)
        .executeTakeFirst();

      if (!comment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "评论不存在",
        });
      }

      if (comment.userId !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "只能删除自己的评论",
        });
      }

      // 软删除评论（设置为不活跃）
      await db
        .updateTable("game_comments")
        .set({
          isActive: false,
          updatedAt: new Date(),
        })
        .where("id", "=", commentId)
        .execute();

      return {
        success: true,
        message: "评论已删除",
      };
    }),

  // 获取游戏的评论统计 (公开接口)
  getCommentStats: procedure
    .input(z.object({ gameId: z.string() }))
    .query(async ({ input }) => {
      const { gameId } = input;

      // 获取评论总数
      const totalCommentsResult = await db
        .selectFrom("game_comments")
        .select((eb) => eb.fn.countAll().as("count"))
        .where("gameId", "=", gameId)
        .where("isActive", "=", true)
        .executeTakeFirst();

      // 获取主评论数（不包括回复）
      const mainCommentsResult = await db
        .selectFrom("game_comments")
        .select((eb) => eb.fn.countAll().as("count"))
        .where("gameId", "=", gameId)
        .where("parentId", "is", null)
        .where("isActive", "=", true)
        .executeTakeFirst();

      return {
        totalComments: Number(totalCommentsResult?.count ?? 0),
        mainComments: Number(mainCommentsResult?.count ?? 0),
        replies: Number(totalCommentsResult?.count ?? 0) - Number(mainCommentsResult?.count ?? 0),
      };
    }),
});