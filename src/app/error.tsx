"use client";

import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { logger } from "@/lib/logger";

type ErrorWithDigest = Error & { digest?: string };

export default function ErrorPage({ error, reset }: { error: ErrorWithDigest; reset: () => void }) {
  useEffect(() => {
    void logger.error("App route error boundary triggered", {
      digest: error.digest,
      message: error.message,
      name: error.name,
      stack: error.stack,
    });
  }, [error]);

  return (
    <main
      className="flex min-h-screen items-center justify-center bg-background px-6 py-10"
      id="main"
    >
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="rounded-full border border-border bg-muted p-2">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <CardTitle>Something went wrong</CardTitle>
          </div>
          <CardDescription>
            We could not finish rendering this page. Try the action again, or refresh if the problem
            keeps happening.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => reset()} type="button">
            Try again
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
