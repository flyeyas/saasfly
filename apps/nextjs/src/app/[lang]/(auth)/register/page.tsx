import Link from "next/link";
import type { Metadata } from "next";

import { cn } from "@saasfly/ui";
import { buttonVariants } from "@saasfly/ui/button";

import { UserRegisterForm } from "~/components/user-register-form";
import type { Locale } from "~/config/i18n-config";
import { getDictionary } from "~/lib/get-dictionary";

export async function generateMetadata({
  params: { lang },
}: {
  params: { lang: Locale };
}): Promise<Metadata> {
  const dict = await getDictionary(lang);
  
  return {
    title: dict.login.register_meta_title,
    description: dict.login.register_meta_description,
  };
}

export default async function RegisterPage({
  params: { lang },
}: {
  params: {
    lang: Locale;
  };
}) {
  const dict = await getDictionary(lang);

  return (
    <div className="container grid h-screen w-screen flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0">
      <Link
        href={`/${lang}/login`}
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "absolute right-4 top-4 md:right-8 md:top-8",
        )}
      >
        {dict.marketing.login}
      </Link>
      <div className="hidden h-full bg-muted lg:block" />
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            {/*<Icons.Logo className="mx-auto h-6 w-6" />*/}
            <h1 className="text-2xl font-semibold tracking-tight">
              {dict.login.create_account_title}
            </h1>
            <p className="text-sm text-muted-foreground">
              {dict.login.create_account_description}
            </p>
          </div>
          <UserRegisterForm lang={lang} dict={dict.login} />
          <p className="px-8 text-center text-sm text-muted-foreground">
            {dict.login.agree_terms}{" "}
            <Link
              href={`/${lang}/terms`}
              className="hover:text-brand underline underline-offset-4"
            >
              {dict.login.terms_service}
            </Link>{" "}
            {dict.login.and}{" "}
            <Link
              href={`/${lang}/privacy`}
              className="hover:text-brand underline underline-offset-4"
            >
              {dict.login.privacy_policy}
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
