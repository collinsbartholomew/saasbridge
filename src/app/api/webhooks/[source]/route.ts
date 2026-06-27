import { createHmac, timingSafeEqual } from "node:crypto";

import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db/client";
import { webhookEvents } from "@/db/schema";

type WebhookPayload = {
  id?: string;
  type?: string;
  [key: string]: unknown;
};

function readSecret(source: string) {
  const envKey = `NEXTBASE_WEBHOOK_SECRET_${source.replace(/[^a-zA-Z0-9]/g, "_").toUpperCase()}`;

  return {
    secret: process.env[envKey],
    secretEnvKey: envKey,
  };
}

function verifySignature(body: string, signature: string, secret: string) {
  const digest = createHmac("sha256", secret).update(body).digest("hex");
  const provided = Buffer.from(signature, "utf8");
  const expected = Buffer.from(digest, "utf8");

  if (provided.length !== expected.length) {
    return false;
  }

  return timingSafeEqual(provided, expected);
}

async function dispatchWebhookEvent(source: string, payload: WebhookPayload) {
  // TODO: dispatch to handlers based on event type.
  void source;
  void payload;
}

export const runtime = "nodejs";

export async function POST(
  request: Request,
  context: {
    params: Promise<{ source: string }>;
  },
) {
  const { source } = await context.params;
  const { secret, secretEnvKey } = readSecret(source);

  if (!secret) {
    return NextResponse.json(
      {
        error: `Missing webhook secret env var: ${secretEnvKey}`,
      },
      {
        status: 500,
      },
    );
  }

  const signature =
    request.headers.get("x-signature") ?? request.headers.get("x-webhook-signature");

  if (!signature) {
    return NextResponse.json(
      {
        error: "Missing webhook signature",
      },
      {
        status: 400,
      },
    );
  }

  const rawBody = await request.text();

  if (!verifySignature(rawBody, signature, secret)) {
    return NextResponse.json(
      {
        error: "Invalid webhook signature",
      },
      {
        status: 401,
      },
    );
  }

  const payload = JSON.parse(rawBody) as WebhookPayload;
  const externalId = request.headers.get("x-event-id") ?? payload.id ?? null;

  if (!externalId) {
    return NextResponse.json(
      {
        error: "Missing webhook event identifier",
      },
      {
        status: 400,
      },
    );
  }

  const [existing] = await db
    .select({ id: webhookEvents.id })
    .from(webhookEvents)
    .where(and(eq(webhookEvents.source, source), eq(webhookEvents.externalId, externalId)))
    .limit(1);

  if (!existing) {
    await db.insert(webhookEvents).values({
      externalId,
      payload,
      source,
    });

    await dispatchWebhookEvent(source, payload);
  }

  return NextResponse.json(
    {
      accepted: true,
      deduped: Boolean(existing),
    },
    {
      status: 202,
    },
  );
}
