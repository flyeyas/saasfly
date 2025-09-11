"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@saasfly/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@saasfly/ui/dropdown-menu";

import * as Icons from "@saasfly/ui/icons";

interface ThemeToggleProps {
  dict?: any;
  align?: "center" | "start" | "end";
}

export default function ThemeToggle(props: ThemeToggleProps & {
  side?: "top" | "bottom";
}) {
  const { dict, align = "end", side } = props;
  const { setTheme, theme } = useTheme();

  const triggerIcon = {
    light: <Icons.Sun className="h-6 w-6" />,
    dark: <Icons.Moon className="h-6 w-6" />,
    system: <Icons.System className="h-6 w-6" />,
  }[theme as "light" | "dark" | "system"];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1 px-2 text-lg font-semibold md:text-base"
        >
          {triggerIcon}
          <span className="capitalize">{theme}</span>
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={props.align} side={props.side}>
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Icons.Sun className="mr-2 h-4 w-4" />
          <span>{dict?.theme?.light || "Light"}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Icons.Moon className="mr-2 h-4 w-4" />
          <span>{dict?.theme?.dark || "Dark"}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <Icons.Laptop className="mr-2 h-4 w-4" />
          <span>{dict?.theme?.system || "System"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
