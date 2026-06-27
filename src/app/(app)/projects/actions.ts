"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { requireSession } from "@/lib/auth/require-session";
import { logger } from "@/lib/logger";
import { createProject, deleteProject, updateProject } from "@/lib/projects/mutations";
import { CreateProjectInput, UpdateProjectInput } from "@/lib/projects/schemas";

type ActionResult<T> = { ok: true; data?: T } | { ok: false; error: string; field?: string };

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown error";
}

export async function createProjectAction(input: unknown): Promise<ActionResult<{ id: string }>> {
  const session = await requireSession();
  const parsed = CreateProjectInput.safeParse(input);

  if (!parsed.success) {
    const issue = parsed.error.issues[0];

    return {
      ok: false,
      error: issue?.message ?? "Invalid project details",
      field: issue?.path[0]?.toString(),
    };
  }

  try {
    const headerStore = await headers();
    const project = await createProject(parsed.data, {
      actorUserId: session.user.id,
      headers: new Headers(headerStore),
    });

    revalidatePath("/dashboard");
    revalidatePath("/projects");

    return { ok: true, data: { id: project.id } };
  } catch (error) {
    const message = getErrorMessage(error);

    logger.error("createProjectAction failed", {
      error: message,
      userId: session.user.id,
    });

    return { ok: false, error: "Unable to create project" };
  }
}

export async function updateProjectAction(input: unknown): Promise<ActionResult<{ id: string }>> {
  const session = await requireSession();
  const parsed = UpdateProjectInput.safeParse(input);

  if (!parsed.success) {
    const issue = parsed.error.issues[0];

    return {
      ok: false,
      error: issue?.message ?? "Invalid project details",
      field: issue?.path[0]?.toString(),
    };
  }

  try {
    const headerStore = await headers();
    const project = await updateProject(parsed.data, {
      actorUserId: session.user.id,
      headers: new Headers(headerStore),
    });

    revalidatePath("/dashboard");
    revalidatePath("/projects");
    revalidatePath(`/projects/${project.id}`);

    return { ok: true, data: { id: project.id } };
  } catch (error) {
    const message = getErrorMessage(error);

    logger.error("updateProjectAction failed", {
      error: message,
      projectId: parsed.data.id,
      userId: session.user.id,
    });

    return {
      ok: false,
      error: message === "PROJECT_NOT_FOUND" ? "Project not found" : "Unable to update project",
      field: message === "PROJECT_NOT_FOUND" ? "id" : undefined,
    };
  }
}

export async function deleteProjectAction(input: unknown): Promise<ActionResult<{ id: string }>> {
  const session = await requireSession();
  const parsed = UpdateProjectInput.pick({ id: true }).safeParse(input);

  if (!parsed.success) {
    return { ok: false, error: "A valid project id is required", field: "id" };
  }

  try {
    const headerStore = await headers();
    const project = await deleteProject(parsed.data, {
      actorUserId: session.user.id,
      headers: new Headers(headerStore),
    });

    revalidatePath("/dashboard");
    revalidatePath("/projects");
    revalidatePath(`/projects/${project.id}`);

    return { ok: true, data: { id: project.id } };
  } catch (error) {
    const message = getErrorMessage(error);

    logger.error("deleteProjectAction failed", {
      error: message,
      projectId: parsed.data.id,
      userId: session.user.id,
    });

    return {
      ok: false,
      error: message === "PROJECT_NOT_FOUND" ? "Project not found" : "Unable to delete project",
      field: message === "PROJECT_NOT_FOUND" ? "id" : undefined,
    };
  }
}
