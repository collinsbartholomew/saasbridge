"use client";

import { ShieldCheck, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const settingsTabs = [
  {
    href: "/settings/profile",
    icon: UserRound,
    label: "Profile",
    value: "profile",
  },
  {
    href: "/settings/security",
    icon: ShieldCheck,
    label: "Security",
    value: "security",
  },
] as const;

export function SettingsTabs() {
  const pathname = usePathname();
  const currentValue = pathname.startsWith("/settings/security") ? "security" : "profile";

  return (
    <Tabs value={currentValue}>
      <TabsList className="w-full justify-start">
        {settingsTabs.map(({ href, icon: Icon, label, value }) => (
          <TabsTrigger asChild key={value} value={value}>
            <Link className="inline-flex items-center gap-2" href={href}>
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
