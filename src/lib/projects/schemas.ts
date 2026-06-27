import { z } from "zod";

export const projectStatusValues = ["active", "archived"] as const;

export const CreateProjectInput = z.object({
  description: z
    .string()
    .trim()
    .max(2000, "Description must be 2000 characters or fewer")
    .optional(),
  name: z
    .string()
    .trim()
    .min(1, "Project name is required")
    .max(200, "Project name must be 200 characters or fewer"),
  status: z.enum(projectStatusValues).default("active"),
});

export const UpdateProjectInput = CreateProjectInput.partial().extend({
  id: z.uuid("Project id must be a valid UUID"),
});

export type CreateProjectFormValues = z.input<typeof CreateProjectInput>;
export type CreateProjectInputData = z.output<typeof CreateProjectInput>;
export type UpdateProjectInputData = z.output<typeof UpdateProjectInput>;
