import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { randomUUID } from "crypto";

import { createTRPCRouter, protectedProcedure } from "../trpc";

const uploadImageSchema = z.object({
  file: z.string().min(1, "File data is required"),
  fileName: z.string().min(1, "File name is required"),
  fileType: z.string().min(1, "File type is required"),
  fileSize: z.number().min(1, "File size is required"),
});

const deleteImageSchema = z.object({
  imageUrl: z.string().url("Valid image URL is required"),
});

export const uploadRouter = createTRPCRouter({
  // Upload image (requires authentication)
  uploadImage: protectedProcedure
    .input(uploadImageSchema)
    .mutation(async ({ input }) => {
      try {
        const { file, fileName, fileType, fileSize } = input;

        // Validate file type (only images)
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(fileType)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Only image files are allowed (JPEG, PNG, GIF, WebP)",
          });
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        if (fileSize > maxSize) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "File size must be less than 5MB",
          });
        }

        // Generate unique filename
        const fileExtension = fileName.split('.').pop();
        const uniqueFileName = `${randomUUID()}.${fileExtension}`;

        // For MVP, we'll use a simple base64 data URL approach
        // In production, you would upload to cloud storage (AWS S3, Cloudinary, etc.)
        const imageUrl = `data:${fileType};base64,${file}`;

        return {
          success: true,
          imageUrl,
          fileName: uniqueFileName,
          message: "Image uploaded successfully",
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to upload image",
          cause: error,
        });
      }
    }),

  // Delete image (requires authentication)
  deleteImage: protectedProcedure
    .input(deleteImageSchema)
    .mutation(async ({ input }) => {
      try {
        const { imageUrl } = input;

        // For MVP with base64 images, we don't need to delete anything from storage
        // In production, you would delete from cloud storage here
        
        return {
          success: true,
          message: "Image deleted successfully",
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete image",
          cause: error,
        });
      }
    }),

  // Get upload limits and configuration
  getUploadConfig: protectedProcedure
    .query(() => {
      return {
        maxFileSize: 5 * 1024 * 1024, // 5MB
        allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
        maxFiles: 1, // For game cover images
      };
    }),
});