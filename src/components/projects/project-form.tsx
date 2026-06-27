"use client";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { createProjectAction, updateProjectAction } from "@/app/(app)/projects/actions";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  type CreateProjectFormValues,
  CreateProjectInput,
  projectStatusValues,
} from "@/lib/projects/schemas";

type ProjectFormProps = {
  initialValues?: Partial<CreateProjectFormValues>;
  mode: "create" | "edit";
  projectId?: string;
};

export function ProjectForm({ initialValues, mode, projectId }: ProjectFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const form = useForm<CreateProjectFormValues>({
    defaultValues: {
      description: initialValues?.description ?? "",
      name: initialValues?.name ?? "",
      status: initialValues?.status ?? "active",
    },
    resolver: standardSchemaResolver(CreateProjectInput),
  });

  const handleSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const result =
        mode === "create"
          ? await createProjectAction(values)
          : await updateProjectAction({
              ...values,
              id: projectId,
            });

      if (!result.ok) {
        if (result.field) {
          form.setError(result.field as keyof CreateProjectFormValues, {
            message: result.error,
          });
        }

        toast.error(result.error);
        return;
      }

      const nextPath = `/projects/${result.data?.id ?? projectId}`;
      toast.success(mode === "create" ? "Project created" : "Project updated");
      router.push(nextPath as Parameters<typeof router.push>[0]);
      router.refresh();
    });
  });

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project name</FormLabel>
              <FormControl>
                <Input placeholder="Acme redesign" {...field} />
              </FormControl>
              <FormDescription>
                Choose a clear name you can scan in the projects table.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="What is this project for?"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormDescription>Optional. Keep it short and operational.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select defaultValue={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {projectStatusValues.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status === "active" ? "Active" : "Archived"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center gap-3">
          <Button disabled={isPending} type="submit">
            {isPending
              ? mode === "create"
                ? "Creating..."
                : "Saving..."
              : mode === "create"
                ? "Create project"
                : "Save changes"}
          </Button>
          <Button asChild type="button" variant="outline">
            <Link href={mode === "create" ? "/projects" : `/projects/${projectId}`}>Cancel</Link>
          </Button>
        </div>
      </form>
    </Form>
  );
}
