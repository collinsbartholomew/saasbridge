"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { logger } from "@/lib/logger";

type ErrorWithDigest = Error & { digest?: string };

export default function GlobalError({
  error,
  reset,
}: {
  error: ErrorWithDigest;
  reset: () => void;
}) {
  useEffect(() => {
    void logger.error("Global app error boundary triggered", {
      digest: error.digest,
      message: error.message,
      name: error.name,
      stack: error.stack,
    });
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground">
        <main className="flex min-h-screen items-center justify-center px-6 py-10">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle>Application unavailable</CardTitle>
              <CardDescription>
                A root-level error interrupted the app shell. Try again, or return to the homepage.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button onClick={() => reset()} type="button">
                Try again
              </Button>
              <Button asChild variant="outline">
                <a href="/">Go home</a>
              </Button>
            </CardContent>
          </Card>
        </main>
      </body>
    </html>
  );
}
