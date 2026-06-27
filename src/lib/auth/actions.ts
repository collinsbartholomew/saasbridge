"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { audit } from "@/lib/audit";
import { requireSession } from "@/lib/auth/require-session";
import {
  RevokeSessionInput,
  RevokeTrustedDeviceInput,
  UpdateProfileInput,
  VerifyTwoFactorInput,
} from "@/lib/auth/schemas";
import { auth } from "@/lib/auth/server";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";

type ActionResult<T> = { ok: true; data?: T } | { ok: false; error: string; field?: string };

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown error";
}

async function getRequestHeaders() {
  const headerStore = await headers();

  return new Headers(headerStore);
}

function revalidateAuthViews() {
  revalidatePath("/dashboard");
  revalidatePath("/projects");
  revalidatePath("/settings/profile");
  revalidatePath("/settings/security");
}

export async function updateProfileAction(input: unknown): Promise<ActionResult<{ name: string }>> {
  const session = await requireSession();
  const parsed = UpdateProfileInput.safeParse(input);

  if (!parsed.success) {
    const issue = parsed.error.issues[0];

    return {
      ok: false,
      error: issue?.message ?? "Invalid profile details",
      field: issue?.path[0]?.toString(),
    };
  }

  try {
    const requestHeaders = await getRequestHeaders();
    await auth.api.updateUser({
      body: {
        name: parsed.data.name,
      },
      headers: requestHeaders,
    });

    await audit({
      action: "user.profile.updated",
      actor: session.user.id,
      metadata: {
        name: parsed.data.name,
      },
      req: requestHeaders,
      target: {
        id: session.user.id,
        type: "user",
      },
    });

    revalidateAuthViews();

    return {
      ok: true,
      data: {
        name: parsed.data.name,
      },
    };
  } catch (error) {
    const message = getErrorMessage(error);

    logger.error("updateProfileAction failed", {
      error: message,
      userId: session.user.id,
    });

    return {
      ok: false,
      error: "Unable to update profile",
    };
  }
}

export async function enableTwoFactorAction(): Promise<
  ActionResult<{ backupCodes: string[]; totpURI: string }>
> {
  const session = await requireSession();

  try {
    const requestHeaders = await getRequestHeaders();
    const result = await auth.api.enableTwoFactor({
      body: {
        issuer: env.NEXT_PUBLIC_APP_NAME,
      },
      headers: requestHeaders,
    });

    await audit({
      action: "auth.two_factor.enrollment_started",
      actor: session.user.id,
      metadata: {
        issuer: env.NEXT_PUBLIC_APP_NAME,
      },
      req: requestHeaders,
      target: {
        id: session.user.id,
        type: "user",
      },
    });

    revalidateAuthViews();

    return {
      ok: true,
      data: {
        backupCodes: result.backupCodes,
        totpURI: result.totpURI,
      },
    };
  } catch (error) {
    const message = getErrorMessage(error);

    logger.error("enableTwoFactorAction failed", {
      error: message,
      userId: session.user.id,
    });

    return {
      ok: false,
      error: "Unable to start two-factor setup",
    };
  }
}

export async function verifyTwoFactorAction(
  input: unknown,
): Promise<ActionResult<{ verified: true }>> {
  const session = await requireSession();
  const parsed = VerifyTwoFactorInput.safeParse(input);

  if (!parsed.success) {
    const issue = parsed.error.issues[0];

    return {
      ok: false,
      error: issue?.message ?? "Invalid verification code",
      field: issue?.path[0]?.toString(),
    };
  }

  try {
    const requestHeaders = await getRequestHeaders();
    await auth.api.verifyTOTP({
      body: {
        code: parsed.data.code,
      },
      headers: requestHeaders,
    });

    await audit({
      action: "auth.two_factor.enabled",
      actor: session.user.id,
      metadata: {
        method: "totp",
      },
      req: requestHeaders,
      target: {
        id: session.user.id,
        type: "user",
      },
    });

    revalidateAuthViews();

    return {
      ok: true,
      data: {
        verified: true,
      },
    };
  } catch (error) {
    const message = getErrorMessage(error);

    logger.error("verifyTwoFactorAction failed", {
      error: message,
      userId: session.user.id,
    });

    return {
      ok: false,
      error: "Unable to verify the authenticator code",
      field: "code",
    };
  }
}

export async function disableTwoFactorAction(): Promise<ActionResult<{ disabled: true }>> {
  const session = await requireSession();

  try {
    const requestHeaders = await getRequestHeaders();
    await auth.api.disableTwoFactor({
      body: {},
      headers: requestHeaders,
    });

    await audit({
      action: "auth.two_factor.disabled",
      actor: session.user.id,
      req: requestHeaders,
      target: {
        id: session.user.id,
        type: "user",
      },
    });

    revalidateAuthViews();

    return {
      ok: true,
      data: {
        disabled: true,
      },
    };
  } catch (error) {
    const message = getErrorMessage(error);

    logger.error("disableTwoFactorAction failed", {
      error: message,
      userId: session.user.id,
    });

    return {
      ok: false,
      error: "Unable to disable two-factor authentication",
    };
  }
}

export async function regenerateBackupCodesAction(): Promise<
  ActionResult<{ backupCodes: string[] }>
> {
  const session = await requireSession();

  try {
    const requestHeaders = await getRequestHeaders();
    const result = await auth.api.generateBackupCodes({
      body: {},
      headers: requestHeaders,
    });

    await audit({
      action: "auth.two_factor.backup_codes_regenerated",
      actor: session.user.id,
      metadata: {
        count: result.backupCodes.length,
      },
      req: requestHeaders,
      target: {
        id: session.user.id,
        type: "user",
      },
    });

    revalidateAuthViews();

    return {
      ok: true,
      data: {
        backupCodes: result.backupCodes,
      },
    };
  } catch (error) {
    const message = getErrorMessage(error);

    logger.error("regenerateBackupCodesAction failed", {
      error: message,
      userId: session.user.id,
    });

    return {
      ok: false,
      error: "Unable to regenerate backup codes",
    };
  }
}

export async function revokeSessionAction(
  input: unknown,
): Promise<ActionResult<{ revokedToken: string }>> {
  const session = await requireSession();
  const parsed = RevokeSessionInput.safeParse(input);

  if (!parsed.success) {
    const issue = parsed.error.issues[0];

    return {
      ok: false,
      error: issue?.message ?? "Invalid session token",
      field: issue?.path[0]?.toString(),
    };
  }

  try {
    const requestHeaders = await getRequestHeaders();
    await auth.api.revokeSession({
      body: {
        token: parsed.data.token,
      },
      headers: requestHeaders,
    });

    await audit({
      action: "auth.session.revoked",
      actor: session.user.id,
      metadata: {
        revokedCurrentSession: parsed.data.token === session.session.token,
      },
      req: requestHeaders,
      target: {
        id: parsed.data.token,
        type: "session",
      },
    });

    revalidateAuthViews();

    return {
      ok: true,
      data: {
        revokedToken: parsed.data.token,
      },
    };
  } catch (error) {
    const message = getErrorMessage(error);

    logger.error("revokeSessionAction failed", {
      error: message,
      userId: session.user.id,
    });

    return {
      ok: false,
      error: "Unable to revoke session",
    };
  }
}

export async function revokeTrustedDeviceAction(
  input: unknown,
): Promise<ActionResult<{ revoked: false }>> {
  const session = await requireSession();
  const parsed = RevokeTrustedDeviceInput.safeParse(input);

  if (!parsed.success) {
    const issue = parsed.error.issues[0];

    return {
      ok: false,
      error: issue?.message ?? "Invalid trusted device",
      field: issue?.path[0]?.toString(),
    };
  }

  logger.warn("revokeTrustedDeviceAction unavailable", {
    deviceId: parsed.data.deviceId,
    userId: session.user.id,
  });

  return {
    ok: false,
    error: "Trusted device management is not available with the current Better Auth API",
  };
}
