"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/client";

const verifySchema = z.object({
  code: z.string().trim().length(6, "Enter the 6-digit code"),
});

type VerifyValues = z.infer<typeof verifySchema>;

function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const form = useForm<VerifyValues>({
    defaultValues: {
      code: "",
    },
  });

  const onSubmit = form.handleSubmit(async ({ code }) => {
    if (!email) {
      toast.error("Missing email address for verification");
      return;
    }

    const parsed = verifySchema.safeParse({ code });

    if (!parsed.success) {
      const issue = parsed.error.issues[0];

      form.setError("code", {
        message: issue?.message ?? "Enter the 6-digit code",
      });
      return;
    }

    const { error } = await authClient.signIn.emailOtp({
      email,
      otp: parsed.data.code,
    });

    if (error) {
      toast.error(error.message ?? "Invalid or expired sign-in code");
      return;
    }

    toast.success("Signed in successfully");
    router.push("/dashboard");
    router.refresh();
  });

  return (
    <section className="w-full rounded-2xl border border-border bg-card p-8 shadow-sm">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Enter your code</h1>
        <p className="text-sm text-muted-foreground">
          We sent a one-time sign-in code to{" "}
          <span className="font-medium text-foreground">{email}</span>.
        </p>
      </div>

      <form className="mt-8 space-y-5" onSubmit={onSubmit}>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="code">
            Verification code
          </label>
          <input
            {...form.register("code")}
            autoComplete="one-time-code"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-center font-mono text-lg tracking-[0.3em] outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
            id="code"
            inputMode="numeric"
            maxLength={6}
            placeholder="123456"
            type="text"
          />
          {form.formState.errors.code ? (
            <p className="text-sm text-destructive">{form.formState.errors.code.message}</p>
          ) : null}
        </div>

        <Button className="w-full" disabled={form.formState.isSubmitting} type="submit">
          {form.formState.isSubmitting ? "Verifying..." : "Continue"}
        </Button>
      </form>

      <p className="mt-6 text-sm text-muted-foreground">
        Need a different email?{" "}
        <Link className="font-medium text-foreground underline underline-offset-4" href="/sign-in">
          Start over
        </Link>
      </p>
    </section>
  );
}

export default function VerifyPage() {
  return (
    <main
      className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center px-6 py-12"
      id="main"
    >
      <Suspense
        fallback={
          <section className="w-full rounded-2xl border border-border bg-card p-8 shadow-sm">
            <div className="h-6 w-1/3 animate-pulse rounded bg-muted" />
          </section>
        }
      >
        <VerifyForm />
      </Suspense>
    </main>
  );
}
