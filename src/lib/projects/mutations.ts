import { and, eq } from "drizzle-orm";

import { db } from "@/db/client";
import { projects } from "@/db/schema";
import { audit } from "@/lib/audit";

import type { CreateProjectInputData, UpdateProjectInputData } from "./schemas";

type MutationContext = {
  actorUserId: string;
  headers?: Headers;
};

export async function createProject(input: CreateProjectInputData, context: MutationContext) {
  const [project] = await db
    .insert(projects)
    .values({
      description: input.description,
      name: input.name,
      ownerUserId: context.actorUserId,
      status: input.status,
      updatedAt: new Date(),
    })
    .returning();

  return project;
}

export async function updateProject(input: UpdateProjectInputData, context: MutationContext) {
  const [project] = await db
    .update(projects)
    .set({
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      updatedAt: new Date(),
    })
    .where(and(eq(projects.id, input.id), eq(projects.ownerUserId, context.actorUserId)))
    .returning();

  if (!project) {
    throw new Error("PROJECT_NOT_FOUND");
  }

  return project;
}

export async function deleteProject(input: { id: string }, context: MutationContext) {
  const [project] = await db
    .delete(projects)
    .where(and(eq(projects.id, input.id), eq(projects.ownerUserId, context.actorUserId)))
    .returning();

  if (!project) {
    throw new Error("PROJECT_NOT_FOUND");
  }

  await audit({
    action: "project.deleted",
    actor: context.actorUserId,
    metadata: {
      name: project.name,
      status: project.status,
    },
    req: context.headers,
    target: {
      id: project.id,
      type: "project",
    },
  });

  return project;
}
