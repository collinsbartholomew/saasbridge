"use client";

import { Check, LaptopMinimal, MoonStar, SunMedium } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const themes = [
  { icon: SunMedium, label: "Light", value: "light" },
  { icon: MoonStar, label: "Dark", value: "dark" },
  { icon: LaptopMinimal, label: "System", value: "system" },
] as const;

export function ThemeToggle() {
  const { resolvedTheme, setTheme, theme } = useTheme();

  const activeTheme = theme === "system" ? "system" : (resolvedTheme ?? "system");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="w-full justify-start" size="sm" variant="outline">
          <SunMedium className="h-4 w-4" />
          Theme
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {themes.map(({ icon: Icon, label, value }) => (
          <DropdownMenuItem key={value} onClick={() => setTheme(value)}>
            <Icon className="h-4 w-4" />
            <span>{label}</span>
            {activeTheme === value ? <Check className="ml-auto h-4 w-4" /> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
