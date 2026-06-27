import { ArrowRight, GitBranch } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { env } from "@/lib/env";

const footerLinks = [
  { href: "https://github.com", label: "GitHub" },
  { href: "https://nextjs.org/docs", label: "Docs" },
  { href: "https://vercel.com/legal/privacy-policy", label: "Privacy" },
] as const;

export default function MarketingPage() {
  return (
    <main className="min-h-screen bg-background" id="main">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-10 sm:px-8 lg:px-12">
        <header className="flex items-center justify-between">
          <Link className="text-sm font-semibold tracking-tight" href="/">
            {env.NEXT_PUBLIC_APP_NAME}
          </Link>
          <Button asChild size="sm" variant="ghost">
            <Link href="/sign-in">Sign in</Link>
          </Button>
        </header>

        <div className="flex flex-1 items-center py-16">
          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div className="space-y-6">
              <span className="inline-flex rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Next.js 16 • Better Auth • Drizzle
              </span>
              <div className="space-y-4">
                <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                  {env.NEXT_PUBLIC_APP_NAME}
                </h1>
                <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                  A lean, production-shaped Next.js 16 SaaS starter
                </p>
                <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                  Start with passwordless auth, typed server actions, Drizzle + Neon, and a narrow
                  stack that stays readable as you extend it.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild className="gap-2" size="lg">
                  <Link href="/sign-in">
                    Sign in
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <a href="https://github.com">
                    <GitBranch className="h-4 w-4" />
                    View on GitHub
                  </a>
                </Button>
              </div>
            </div>

            <Card className="border-border/70 bg-card/70 backdrop-blur">
              <CardContent className="space-y-6 p-6 sm:p-8">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border border-border bg-background/80 p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                      Server first
                    </p>
                    <p className="mt-3 text-sm text-foreground">
                      App Router defaults, server actions for mutations, and client state only where
                      it earns its keep.
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-background/80 p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                      Security shaped
                    </p>
                    <p className="mt-3 text-sm text-foreground">
                      OTP sign-in, TOTP 2FA, audit logs, rate limiting, and typed env validation
                      already in place.
                    </p>
                  </div>
                </div>
                <div className="rounded-2xl border border-dashed border-border p-5">
                  <p className="text-sm font-medium">What ships out of the box</p>
                  <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                    <li>Protected dashboard shell with theme support</li>
                    <li>Projects CRUD example with typed data boundaries</li>
                    <li>Profile and security settings wired to Better Auth</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <footer className="flex flex-col gap-3 border-t border-border pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>Built for shipping quickly without inheriting noise.</p>
          <div className="flex items-center gap-4">
            {footerLinks.map((link) => (
              <a className="hover:text-foreground" href={link.href} key={link.label}>
                {link.label}
              </a>
            ))}
          </div>
        </footer>
      </section>
    </main>
  );
}
