"use client";

import { useState } from "react";
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
import { Switch } from "@saasfly/ui/switch";
import * as Icons from "@saasfly/ui/icons";

import { trpc } from "~/trpc/client";

const categoryFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  slug: z.string().min(1, "Slug is required").max(100, "Slug is too long"),
  sortOrder: z.number().min(0, "Sort order must be positive"),
  isActive: z.boolean().default(true),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

interface CategoryFormProps {
  initialData?: Partial<CategoryFormValues> & { id?: string };
}

export function CategoryForm({ initialData }: CategoryFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      slug: initialData?.slug || "",
      sortOrder: initialData?.sortOrder || 0,
      isActive: initialData?.isActive ?? true,
    },
  });

  const createCategoryMutation = async (data: CategoryFormValues) => {
    try {
      await trpc.category.create.mutate(data);
      router.push("/dashboard/categories");
      router.refresh();
    } catch (error: any) {
      console.error("Error creating category:", error);
    }
  };

  const updateCategoryMutation = async (data: CategoryFormValues) => {
    try {
      await trpc.category.update.mutate({
        id: initialData?.id!,
        ...data,
      });
      router.push("/dashboard/categories");
      router.refresh();
    } catch (error: any) {
      console.error("Error updating category:", error);
    }
  };

  const onSubmit = async (data: CategoryFormValues) => {
    setIsLoading(true);

    if (initialData?.id) {
      await updateCategoryMutation(data);
    } else {
      await createCategoryMutation(data);
    }

    setIsLoading(false);
  };

  // Auto-generate slug from name
  const handleNameChange = (value: string) => {
    const slug = value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    form.setValue("slug", slug);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter category name"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    handleNameChange(e.target.value);
                  }}
                />
              </FormControl>
              <FormDescription>
                The display name for this category.
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
                <Input
                  placeholder="category-slug"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                URL-friendly version of the name. Auto-generated from name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sortOrder"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sort Order</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="0"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                />
              </FormControl>
              <FormDescription>
                Lower numbers appear first in the category list.
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
                <FormLabel className="text-base">Active</FormLabel>
                <FormDescription>
                  Whether this category is visible to users.
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
            {initialData?.id ? "Update Category" : "Create Category"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard/categories")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}