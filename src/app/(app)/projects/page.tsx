import Link from "next/link";

import { ProjectsTable } from "@/components/projects/projects-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireSession } from "@/lib/auth/require-session";
import { listProjectsForUser } from "@/lib/projects/queries";

export default async function ProjectsPage() {
  const session = await requireSession();
  const { items } = await listProjectsForUser(session.user.id, { limit: 100 });

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Projects</p>
          <h1 className="text-3xl font-semibold tracking-tight">Your workspace projects</h1>
          <p className="text-sm text-muted-foreground">
            Use the starter CRUD slice as the canonical example for new features.
          </p>
        </div>
        <Button asChild>
          <Link href="/projects/new">Create project</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Projects</CardTitle>
          <CardDescription>
            {items.length === 1 ? "1 project" : `${items.length} projects`} loaded for this user.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProjectsTable
            projects={items.map((project) => ({
              createdAt: project.createdAt.toISOString(),
              id: project.id,
              name: project.name,
              status: project.status as "active" | "archived",
            }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
