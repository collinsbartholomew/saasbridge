"use client";

import { FolderKanban, LayoutDashboard, LogOut, Menu, PanelLeft, Settings2 } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { startTransition, useState } from "react";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { authClient } from "@/lib/auth/client";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/stores/ui-store";

import { ThemeToggle } from "./theme-toggle";

type AppSidebarProps = {
  userEmail: string;
  userName?: string | null;
};

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/projects", icon: FolderKanban, label: "Projects" },
  { href: "/settings/profile", icon: Settings2, label: "Settings" },
] as const;

function getInitials(input: string) {
  return input
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function NavLinks({
  collapsed,
  onNavigate,
  pathname,
}: {
  collapsed: boolean;
  onNavigate?: () => void;
  pathname: string;
}) {
  return (
    <TooltipProvider>
      <nav className="space-y-1">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          const link = (
            <Link
              className={cn(
                "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/80",
                collapsed ? "justify-center" : "gap-3",
              )}
              href={href}
              onClick={onNavigate}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {collapsed ? <span className="sr-only">{label}</span> : <span>{label}</span>}
            </Link>
          );

          if (!collapsed) {
            return <div key={href}>{link}</div>;
          }

          return (
            <Tooltip key={href}>
              <TooltipTrigger asChild>{link}</TooltipTrigger>
              <TooltipContent side="right">{label}</TooltipContent>
            </Tooltip>
          );
        })}
      </nav>
    </TooltipProvider>
  );
}

export function AppSidebar({ userEmail, userName }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const { isCollapsed, toggleCollapsed } = useUiStore();

  const initials = getInitials(userName?.trim() || userEmail);

  const signOut = async () => {
    setIsSigningOut(true);

    const { error } = await authClient.signOut();

    if (error) {
      toast.error(error.message ?? "Unable to sign out");
      setIsSigningOut(false);
      return;
    }

    toast.success("Signed out");
    startTransition(() => {
      router.push("/sign-in");
      router.refresh();
    });
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="space-y-0.5">
          <p className="text-sm font-semibold">{userName || userEmail}</p>
          <p className="text-xs text-muted-foreground">{userEmail}</p>
        </div>
        <Sheet onOpenChange={setIsMobileOpen} open={isMobileOpen}>
          <SheetTrigger asChild>
            <Button size="icon-sm" variant="outline">
              <Menu className="h-4 w-4" />
              <span className="sr-only">Open navigation</span>
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[18rem] p-0" side="left">
            <SheetHeader className="border-b border-border px-6 py-5">
              <SheetTitle>SaaSBridge</SheetTitle>
              <SheetDescription>Navigate your workspace.</SheetDescription>
            </SheetHeader>
            <div className="flex h-full flex-col px-4 py-4">
              <NavLinks
                collapsed={false}
                onNavigate={() => setIsMobileOpen(false)}
                pathname={pathname}
              />
              <div className="mt-auto space-y-4">
                <Separator />
                <div className="rounded-lg border border-border bg-muted/50 p-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{userName || "Signed in"}</p>
                      <p className="truncate text-xs text-muted-foreground">{userEmail}</p>
                    </div>
                  </div>
                </div>
                <ThemeToggle />
                <Button
                  className="w-full justify-start"
                  disabled={isSigningOut}
                  onClick={signOut}
                  variant="ghost"
                >
                  <LogOut className="h-4 w-4" />
                  {isSigningOut ? "Signing out..." : "Sign out"}
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </header>

      <aside
        className={cn(
          "hidden border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200 lg:flex lg:min-h-screen lg:flex-col",
          isCollapsed ? "lg:w-20" : "lg:w-72",
        )}
      >
        <div
          className={cn(
            "flex items-center border-b border-sidebar-border px-4 py-4",
            isCollapsed ? "justify-center" : "justify-between",
          )}
        >
          {isCollapsed ? (
            <span className="text-sm font-semibold tracking-tight">N</span>
          ) : (
            <div>
              <p className="text-sm font-semibold tracking-tight">SaaSBridge</p>
              <p className="text-xs text-sidebar-foreground/70">SaaS starter</p>
            </div>
          )}
          <Button onClick={toggleCollapsed} size="icon-sm" variant="ghost">
            <PanelLeft className="h-4 w-4" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
        </div>

        <div className="flex flex-1 flex-col px-3 py-4">
          <NavLinks collapsed={isCollapsed} pathname={pathname} />
          <div className="mt-auto space-y-4">
            <Separator />
            <div
              className={cn(
                "rounded-lg border border-sidebar-border bg-sidebar-accent/50 p-3",
                isCollapsed && "p-2",
              )}
            >
              <div className={cn("flex items-center gap-3", isCollapsed && "justify-center")}>
                <Avatar className="h-9 w-9">
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                {isCollapsed ? null : (
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{userName || "Signed in"}</p>
                    <p className="truncate text-xs text-sidebar-foreground/70">{userEmail}</p>
                  </div>
                )}
              </div>
            </div>
            {isCollapsed ? (
              <TooltipProvider>
                <div className="space-y-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <ThemeToggle />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right">Theme</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        className="w-full justify-center"
                        disabled={isSigningOut}
                        onClick={signOut}
                        size="icon-sm"
                        variant="ghost"
                      >
                        <LogOut className="h-4 w-4" />
                        <span className="sr-only">Sign out</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">Sign out</TooltipContent>
                  </Tooltip>
                </div>
              </TooltipProvider>
            ) : (
              <>
                <ThemeToggle />
                <Button
                  className="w-full justify-start"
                  disabled={isSigningOut}
                  onClick={signOut}
                  variant="ghost"
                >
                  <LogOut className="h-4 w-4" />
                  {isSigningOut ? "Signing out..." : "Sign out"}
                </Button>
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
