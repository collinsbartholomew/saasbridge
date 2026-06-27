import { and, asc, desc, eq, gt, type InferSelectModel, lt, or, type SQL } from "drizzle-orm";

import { db } from "@/db/client";
import { projects } from "@/db/schema";

type ProjectRecord = InferSelectModel<typeof projects>;

export type ProjectSort = "createdAt" | "name" | "status" | "updatedAt";
export type ProjectOrder = "asc" | "desc";

export type ListProjectsOptions = {
  cursor?: string;
  limit?: number;
  order?: ProjectOrder;
  sort?: ProjectSort;
};

export type ListProjectsResult = {
  items: ProjectRecord[];
  nextCursor: string | null;
};

const sortColumns = {
  createdAt: projects.createdAt,
  name: projects.name,
  status: projects.status,
  updatedAt: projects.updatedAt,
} as const;

function buildCursorWhereClause(
  cursorProject: ProjectRecord,
  order: ProjectOrder,
  sort: ProjectSort,
): SQL<unknown> {
  const column = sortColumns[sort];
  const cursorValue = cursorProject[sort];

  if (order === "asc") {
    const cursorClause = or(
      gt(column, cursorValue),
      and(eq(column, cursorValue), gt(projects.id, cursorProject.id)),
    );

    if (!cursorClause) {
      throw new Error("INVALID_PROJECT_CURSOR");
    }

    return cursorClause;
  }

  const cursorClause = or(
    lt(column, cursorValue),
    and(eq(column, cursorValue), lt(projects.id, cursorProject.id)),
  );

  if (!cursorClause) {
    throw new Error("INVALID_PROJECT_CURSOR");
  }

  return cursorClause;
}

export async function listProjectsForUser(
  userId: string,
  options: ListProjectsOptions = {},
): Promise<ListProjectsResult> {
  const limit = Math.min(Math.max(options.limit ?? 20, 1), 100);
  const sort = options.sort ?? "createdAt";
  const order = options.order ?? "desc";
  const orderBy = order === "asc" ? asc(sortColumns[sort]) : desc(sortColumns[sort]);
  const tiebreaker = order === "asc" ? asc(projects.id) : desc(projects.id);
  const clauses: SQL<unknown>[] = [eq(projects.ownerUserId, userId)];

  if (options.cursor) {
    const cursorProject = await db.query.projects.findFirst({
      where: and(eq(projects.id, options.cursor), eq(projects.ownerUserId, userId)),
    });

    if (cursorProject) {
      clauses.push(buildCursorWhereClause(cursorProject, order, sort));
    }
  }

  const items = await db
    .select()
    .from(projects)
    .where(and(...clauses))
    .orderBy(orderBy, tiebreaker)
    .limit(limit + 1);

  const hasMore = items.length > limit;
  const trimmed = hasMore ? items.slice(0, limit) : items;

  return {
    items: trimmed,
    nextCursor: hasMore ? (trimmed.at(-1)?.id ?? null) : null,
  };
}

export async function getProjectById(id: string, userId: string): Promise<ProjectRecord> {
  const project = await db.query.projects.findFirst({
    where: and(eq(projects.id, id), eq(projects.ownerUserId, userId)),
  });

  if (!project) {
    throw new Error("PROJECT_NOT_FOUND");
  }

  return project;
}

export type { ProjectRecord };
