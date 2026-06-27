"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/client";

const signInSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

type SignInValues = z.infer<typeof signInSchema>;

export default function SignInPage() {
  const router = useRouter();
  const form = useForm<SignInValues>({
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = form.handleSubmit(async ({ email }) => {
    const parsed = signInSchema.safeParse({ email });

    if (!parsed.success) {
      const issue = parsed.error.issues[0];

      form.setError("email", {
        message: issue?.message ?? "Enter a valid email address",
      });
      return;
    }

    const { error } = await authClient.emailOtp.sendVerificationOtp({
      email: parsed.data.email,
      type: "sign-in",
    });

    if (error) {
      toast.error(error.message ?? "Unable to send a sign-in code");
      return;
    }

    toast.success("Check your email for the sign-in code");
    router.push(`/verify?email=${encodeURIComponent(email)}`);
  });

  return (
    <main
      className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center px-6 py-12"
      id="main"
    >
      <section className="w-full rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
          <p className="text-sm text-muted-foreground">
            Enter your email and we&apos;ll send you a one-time code.
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={onSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="email">
              Email
            </label>
            <input
              {...form.register("email")}
              autoComplete="email"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
              id="email"
              inputMode="email"
              placeholder="you@example.com"
              type="email"
            />
            {form.formState.errors.email ? (
              <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
            ) : null}
          </div>

          <Button className="w-full" disabled={form.formState.isSubmitting} type="submit">
            {form.formState.isSubmitting ? "Sending code..." : "Send sign-in code"}
          </Button>
        </form>
      </section>
    </main>
  );
}
