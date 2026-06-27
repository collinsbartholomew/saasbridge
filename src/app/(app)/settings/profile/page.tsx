import { eq } from "drizzle-orm";

import { ProfileForm } from "@/components/settings/profile-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/db/client";
import { user } from "@/db/schema";
import { requireSession } from "@/lib/auth/require-session";

export default async function ProfileSettingsPage() {
  const session = await requireSession();
  const currentUser = await db.query.user.findFirst({
    where: eq(user.id, session.user.id),
  });

  if (!currentUser) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>
          Update the name attached to your account. Your email address is read-only.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <p className="text-sm font-medium">Email</p>
          <div className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm">
            {currentUser.email}
          </div>
        </div>

        <ProfileForm initialName={currentUser.name} />
      </CardContent>
    </Card>
  );
}
