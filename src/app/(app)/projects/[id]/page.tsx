import Link from "next/link";
import { notFound } from "next/navigation";

import { DeleteProjectButton } from "@/components/projects/delete-project-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireSession } from "@/lib/auth/require-session";
import { getProjectById } from "@/lib/projects/queries";

type ProjectDetailPageProps = {
  params: Promise<{ id: string }>;
};

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const session = await requireSession();
  const { id } = await params;

  try {
    const project = await getProjectById(id, session.user.id);

    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Projects</p>
            <h1 className="text-3xl font-semibold tracking-tight">{project.name}</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild size="sm" variant="outline">
              <Link href={`/projects/${project.id}/edit`}>Edit</Link>
            </Button>
            <DeleteProjectButton
              id={project.id}
              name={project.name}
              redirectTo="/projects"
              triggerVariant="destructive"
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Project details</CardTitle>
            <CardDescription>
              Canonical server-rendered detail view for a user-owned record.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <Badge variant={project.status === "active" ? "default" : "secondary"}>
                {project.status === "active" ? "Active" : "Archived"}
              </Badge>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Description</p>
              <p className="text-sm leading-7 text-foreground">
                {project.description || "No description provided yet."}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Created</p>
                <p className="mt-2 text-sm font-medium">{formatDate(project.createdAt)}</p>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Updated</p>
                <p className="mt-2 text-sm font-medium">{formatDate(project.updatedAt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  } catch {
    notFound();
  }
}
