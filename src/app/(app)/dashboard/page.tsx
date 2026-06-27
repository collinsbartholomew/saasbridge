import { count, eq } from "drizzle-orm";
import { ArrowRight, FolderKanban, Sparkles } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/db/client";
import { projects } from "@/db/schema";
import { requireSession } from "@/lib/auth/require-session";

export default async function DashboardPage() {
  const session = await requireSession();
  const [{ projectCount }] = await db
    .select({ projectCount: count() })
    .from(projects)
    .where(eq(projects.ownerUserId, session.user.id));

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">Dashboard</p>
        <h1 className="text-3xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          Signed in as <span className="font-medium text-foreground">{session.user.email}</span>.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Ready to build
            </CardTitle>
            <CardDescription>
              Your starter already has auth, audit logs, and server-side data flows in place.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-xl border border-border bg-muted/40 p-5">
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                Workspace owner
              </p>
              <p className="mt-3 text-base font-medium">{session.user.email}</p>
            </div>
            <Button asChild className="gap-2">
              <Link href="/projects/new">
                Create project
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderKanban className="h-5 w-5" />
              Recent projects
            </CardTitle>
            <CardDescription>A quick count from your database.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-4xl font-semibold tracking-tight">{projectCount}</p>
            <p className="text-sm text-muted-foreground">
              {projectCount === 1 ? "1 project" : `${projectCount} projects`} available in your
              account.
            </p>
            <Button asChild size="sm" variant="outline">
              <Link href="/projects">View projects</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
