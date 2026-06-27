"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { deleteProjectAction } from "@/app/(app)/projects/actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

type DeleteProjectButtonProps = {
  id: string;
  name: string;
  redirectTo?: string;
  triggerLabel?: string;
  triggerVariant?: "default" | "destructive" | "ghost" | "outline" | "secondary";
};

export function DeleteProjectButton({
  id,
  name,
  redirectTo,
  triggerLabel = "Delete",
  triggerVariant = "destructive",
}: DeleteProjectButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteProjectAction({ id });

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      toast.success(`Deleted ${name}`);
      setIsOpen(false);

      if (redirectTo) {
        // typedRoutes: redirectTo is a runtime string; trust caller.
        router.push(redirectTo as Parameters<typeof router.push>[0]);
      }

      router.refresh();
    });
  };

  return (
    <AlertDialog onOpenChange={setIsOpen} open={isOpen}>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant={triggerVariant}>
          <Trash2 className="h-4 w-4" />
          {triggerLabel}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete project?</AlertDialogTitle>
          <AlertDialogDescription>
            This removes <span className="font-medium text-foreground">{name}</span> permanently and
            writes an audit entry for the deletion.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction disabled={isPending} onClick={handleDelete}>
            {isPending ? "Deleting..." : "Delete project"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
