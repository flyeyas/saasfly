import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { cn } from "@saasfly/ui";
import { buttonVariants } from "@saasfly/ui/button";
import * as Icons from "@saasfly/ui/icons";

import { PasswordResetForm } from "~/components/password-reset-form";
import type { Locale } from "~/config/i18n-config";
import { getDictionary } from "~/lib/get-dictionary";

export const metadata: Metadata = {
  title: "Password Reset",
  description: "Reset your password",
};

export default async function PasswordResetPage({
  params: { lang },
}: {
  params: {
    lang: Locale;
  };
}) {
  const dict = await getDictionary(lang);
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Link
        href={`/${lang}/login`}
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "absolute left-4 top-4 md:left-8 md:top-8",
        )}
      >
        <>
          <Icons.ChevronLeft className="mr-2 h-4 w-4" />
          返回登录
        </>
      </Link>
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <Image
            src="/images/avatars/saasfly-logo.svg"
            className="mx-auto"
            width="64"
            height="64"
            alt=""
          />
          <h1 className="text-2xl font-semibold tracking-tight">
            重置密码
          </h1>
          <p className="text-sm text-muted-foreground">
            输入您的邮箱地址，我们将发送重置验证码
          </p>
        </div>
        <PasswordResetForm lang={lang} dict={dict.login} />
        <p className="px-8 text-center text-sm text-muted-foreground">
          记起密码了？{" "}
          <Link
            href={`/${lang}/login`}
            className="hover:text-brand underline underline-offset-4"
          >
            返回登录
          </Link>
        </p>
      </div>
    </div>
  );
}