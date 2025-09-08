"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

import { UserNextAuthForm } from "~/components/user-nextauth-form";

type Dictionary = Record<string, string>;

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {
  lang: string;
  dict?: Dictionary;
  disabled?: boolean;
}

export function UserClerkAuthForm({
  className,
  lang,
  dict,
  ...props
}: UserAuthFormProps) {
  const { data: session } = useSession();
  
  if (session?.user) {
    redirect(`/${lang}/dashboard`);
  }

  return (
    <UserNextAuthForm 
      className={className}
      lang={lang}
      dict={dict}
      {...props}
    />
  );
}
