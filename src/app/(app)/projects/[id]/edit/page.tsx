import { notFound } from "next/navigation";

import { ProjectForm } from "@/components/projects/project-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireSession } from "@/lib/auth/require-session";
import { getProjectById } from "@/lib/projects/queries";

type EditProjectPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditProjectPage({ params }: EditProjectPageProps) {
  const session = await requireSession();
  const { id } = await params;

  try {
    const project = await getProjectById(id, session.user.id);

    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Projects</p>
          <h1 className="text-3xl font-semibold tracking-tight">Edit {project.name}</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Project settings</CardTitle>
            <CardDescription>
              Update the fields that drive the canonical CRUD example.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProjectForm
              initialValues={{
                description: project.description ?? "",
                name: project.name,
                status: project.status as "active" | "archived",
              }}
              mode="edit"
              projectId={project.id}
            />
          </CardContent>
        </Card>
      </div>
    );
  } catch {
    notFound();
  }
}
