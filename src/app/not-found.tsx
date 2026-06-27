import { FileSearch } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NotFoundPage() {
  return (
    <main
      className="flex min-h-screen items-center justify-center bg-background px-6 py-10"
      id="main"
    >
      <Card className="w-full max-w-xl">
        <CardHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="rounded-full border border-border bg-muted p-2">
              <FileSearch className="h-5 w-5" />
            </div>
            <CardTitle>Page not found</CardTitle>
          </div>
          <CardDescription>
            The route you requested does not exist, or it has already moved.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/">Back to home</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard">Open dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
