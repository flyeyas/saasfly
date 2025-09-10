"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@saasfly/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@saasfly/ui/form";
import { Input } from "@saasfly/ui/input";
import { Textarea } from "@saasfly/ui";
import { Switch } from "@saasfly/ui/switch";
import { toast } from "@saasfly/ui/use-toast";
import * as Icons from "@saasfly/ui/icons";

import { trpc } from "~/trpc/client";
import { ImageUpload } from "~/components/upload/image-upload";

const gameFormSchema = z.object({
  title: z.string().min(1, "Game title cannot be empty").max(100, "Title cannot exceed 100 characters"),
  slug: z.string().min(1, "Slug cannot be empty").max(50, "Slug cannot exceed 50 characters").regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers and hyphens"),
  description: z.string().optional(),
  iframeUrl: z.string().url("Please enter a valid URL"),
  coverImage: z.string().optional(),
  isActive: z.boolean().default(true),
});

type GameFormValues = z.infer<typeof gameFormSchema>;

interface GameFormProps {
  initialData?: Partial<GameFormValues> & { id?: string };
}

export function GameForm({ initialData }: GameFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<GameFormValues>({
    resolver: zodResolver(gameFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      slug: initialData?.slug || "",
      description: initialData?.description || "",
      iframeUrl: initialData?.iframeUrl || "",
      coverImage: initialData?.coverImage || "",
      isActive: initialData?.isActive ?? true,
    },
  });

  const createGameMutation = async (data: GameFormValues) => {
    try {
      await trpc.game.create.mutate(data);
      toast({
        title: "Success",
        description: "Game created successfully",
      });
      router.push("/dashboard/games");
      router.refresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create game",
        variant: "destructive",
      });
    }
  };

  const updateGameMutation = async (data: GameFormValues) => {
    try {
      await trpc.game.update.mutate({ id: initialData?.id!, ...data });
      toast({
        title: "Success",
        description: "Game updated successfully",
      });
      router.push("/dashboard/games");
      router.refresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update game",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: GameFormValues) => {
    setIsLoading(true);

    if (initialData?.id) {
      await updateGameMutation(data);
    } else {
      await createGameMutation(data);
    }

    setIsLoading(false);
  };

  // Auto-generate slug from title
  const handleTitleChange = (value: string) => {
    const slug = value
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    form.setValue('slug', slug);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Game Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter game title"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    handleTitleChange(e.target.value);
                  }}
                />
              </FormControl>
              <FormDescription>
                Display name of the game
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input placeholder="game-slug" {...field} />
              </FormControl>
              <FormDescription>
                Unique identifier for URL, can only contain lowercase letters, numbers and hyphens
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Game Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter game description (optional)"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Detailed description of the game
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="iframeUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Game URL</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/game" {...field} />
              </FormControl>
              <FormDescription>
                Iframe embed URL for the game
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="coverImage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cover Image</FormLabel>
              <FormControl>
                <ImageUpload
                  value={field.value}
                  onChange={field.onChange}
                  onRemove={() => field.onChange("")}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>
                Upload game cover image (optional, supports PNG, JPG, GIF, WebP formats, max 5MB)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  Enable Game
                </FormLabel>
                <FormDescription>
                  Control whether the game is displayed on the frontend
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex items-center space-x-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading && (
              <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            {initialData?.id ? "Update Game" : "Create Game"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}