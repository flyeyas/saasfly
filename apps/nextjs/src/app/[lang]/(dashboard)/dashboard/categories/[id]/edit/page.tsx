import React from "react";
import { redirect } from "next/navigation";

import { authOptions, getCurrentUser } from "@saasfly/auth";

import { DashboardHeader } from "~/components/header";
import { DashboardShell } from "~/components/shell";
import { CategoryForm } from "~/components/categories/category-form";
import type { Locale } from "~/config/i18n-config";
import { getDictionary } from "~/lib/get-dictionary";
import { trpc } from "~/trpc/server";

export const metadata = {
  title: "Edit Category",
  description: "Edit category details",
};

export default async function EditCategoryPage({
  params: { lang, id },
}: {
  params: {
    lang: Locale;
    id: string;
  };
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect(authOptions?.pages?.signIn ?? "/login");
  }

  const category = await trpc.category.getById.query({ id });
  if (!category) {
    redirect("/dashboard/categories");
  }

  const dict = await getDictionary(lang);

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Edit Category"
        text="Update category details"
      />
      <div className="grid gap-10">
        <CategoryForm initialData={category} />
      </div>
    </DashboardShell>
  );
}