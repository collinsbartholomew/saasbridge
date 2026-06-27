import { eq } from "drizzle-orm";
import { headers } from "next/headers";

import { SecurityPanel } from "@/components/settings/security-panel";
import { db } from "@/db/client";
import { user } from "@/db/schema";
import { requireSession } from "@/lib/auth/require-session";
import { auth } from "@/lib/auth/server";

export default async function SecuritySettingsPage() {
  const session = await requireSession();
  const headerStore = await headers();
  const requestHeaders = new Headers(headerStore);
  const [currentUser, activeSessions] = await Promise.all([
    db.query.user.findFirst({
      where: eq(user.id, session.user.id),
    }),
    auth.api.listSessions({
      headers: requestHeaders,
    }),
  ]);

  const sessions = [...activeSessions]
    .sort((left, right) => right.updatedAt.getTime() - left.updatedAt.getTime())
    .map((activeSession) => ({
      createdAt: activeSession.createdAt.toISOString(),
      expiresAt: activeSession.expiresAt.toISOString(),
      ipAddress: activeSession.ipAddress ?? null,
      token: activeSession.token,
      updatedAt: activeSession.updatedAt.toISOString(),
      userAgent: activeSession.userAgent ?? null,
    }));

  return (
    <SecurityPanel
      currentSessionToken={session.session.token}
      sessions={sessions}
      twoFactorEnabled={currentUser?.twoFactorEnabled ?? false}
    />
  );
}
