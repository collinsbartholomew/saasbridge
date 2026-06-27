import { db } from "@/db/client";
import { auditLogs } from "@/db/schema";

type AuditInput = {
  action: string;
  actor?: string | null;
  metadata?: Record<string, unknown>;
  req?: Headers | Request;
  target: {
    id?: string | null;
    type: string;
  };
};

function readHeaders(req?: Headers | Request) {
  if (!req) {
    return null;
  }

  if (req instanceof Headers) {
    return req;
  }

  return req.headers;
}

export async function audit({ action, actor, metadata, req, target }: AuditInput) {
  const headerStore = readHeaders(req);
  const forwardedFor = headerStore?.get("x-forwarded-for");
  const ip = forwardedFor?.split(",")[0]?.trim() ?? headerStore?.get("x-real-ip") ?? null;

  await db.insert(auditLogs).values({
    action,
    actorUserId: actor ?? null,
    createdAt: new Date(),
    id: crypto.randomUUID(),
    ip,
    metadata: metadata ?? {},
    targetId: target.id ?? null,
    targetType: target.type,
    userAgent: headerStore?.get("user-agent") ?? null,
  });
}
