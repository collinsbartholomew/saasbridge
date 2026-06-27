"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/client";

const twoFactorSchema = z.object({
  code: z.string().trim().min(6, "Enter your authenticator code"),
  trustDevice: z.boolean().default(true),
});

type TwoFactorValues = z.infer<typeof twoFactorSchema>;

export default function TwoFactorPage() {
  const router = useRouter();
  const form = useForm<TwoFactorValues>({
    defaultValues: {
      code: "",
      trustDevice: true,
    },
  });

  const onSubmit = form.handleSubmit(async ({ code, trustDevice }) => {
    const parsed = twoFactorSchema.safeParse({ code, trustDevice });

    if (!parsed.success) {
      const issue = parsed.error.issues[0];

      form.setError("code", {
        message: issue?.message ?? "Enter your authenticator code",
      });
      return;
    }

    const { error } = await authClient.twoFactor.verifyTotp({
      code: parsed.data.code,
      trustDevice: parsed.data.trustDevice,
    });

    if (error) {
      toast.error(error.message ?? "Unable to verify your authenticator code");
      return;
    }

    toast.success("Two-factor verification complete");
    router.push("/dashboard");
    router.refresh();
  });

  return (
    <main
      className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center px-6 py-12"
      id="main"
    >
      <section className="w-full rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Two-factor authentication</h1>
          <p className="text-sm text-muted-foreground">
            Enter the code from your authenticator app to finish signing in.
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={onSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="code">
              Authenticator code
            </label>
            <input
              {...form.register("code")}
              autoComplete="one-time-code"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-center font-mono text-lg tracking-[0.3em] outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
              id="code"
              inputMode="numeric"
              placeholder="123456"
              type="text"
            />
            {form.formState.errors.code ? (
              <p className="text-sm text-destructive">{form.formState.errors.code.message}</p>
            ) : null}
          </div>

          <label className="flex items-center gap-3 text-sm text-muted-foreground">
            <input
              {...form.register("trustDevice")}
              className="size-4 rounded border border-input"
              type="checkbox"
            />
            Trust this device for 30 days
          </label>

          <Button className="w-full" disabled={form.formState.isSubmitting} type="submit">
            {form.formState.isSubmitting ? "Verifying..." : "Verify code"}
          </Button>
        </form>
      </section>
    </main>
  );
}
