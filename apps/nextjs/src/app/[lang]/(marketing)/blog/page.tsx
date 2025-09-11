import { compareDesc } from "date-fns";

import { BlogPosts } from "~/components/blog/blog-posts";
import { allPosts } from ".contentlayer/generated";
import type { Locale } from "~/config/i18n-config";
import { getDictionary } from "~/lib/get-dictionary";

export const metadata = {
  title: "Blog",
};

export default async function BlogPage({
  params: { lang },
}: {
  params: { lang: Locale };
}) {
  const dict = await getDictionary(lang);
  const posts = allPosts
    .filter((post) => post.published)
    .sort((a, b) => {
      return compareDesc(new Date(a.date), new Date(b.date));
    });

  return (
    <main>
      <BlogPosts posts={posts} dict={dict} />
    </main>
  );
}
