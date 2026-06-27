import { inspect } from "node:util";

type LogLevel = "debug" | "info" | "warn" | "error";
type LogMeta = Record<string, unknown> | undefined;

async function getRequestId(): Promise<string | undefined> {
  try {
    const nextHeaders = await import("next/headers");
    const headerStore = await nextHeaders.headers();

    return headerStore.get("x-request-id") ?? undefined;
  } catch {
    return undefined;
  }
}

function formatDev(level: LogLevel, message: string, meta: LogMeta, requestId?: string): string {
  const parts = [`[${level.toUpperCase()}]`, message];

  if (requestId) {
    parts.push(`requestId=${requestId}`);
  }

  if (meta && Object.keys(meta).length > 0) {
    parts.push(inspect(meta, { depth: null, colors: false, compact: false }));
  }

  return parts.join(" ");
}

async function write(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  const requestId = await getRequestId();
  const payload = {
    level,
    message,
    requestId,
    ...(meta ? { meta } : {}),
    timestamp: new Date().toISOString(),
  };

  if (process.env.NODE_ENV === "production") {
    // biome-ignore lint/suspicious/noConsole: logger delegates to console by design.
    console[level === "debug" ? "log" : level](JSON.stringify(payload));
    return;
  }

  // biome-ignore lint/suspicious/noConsole: logger delegates to console by design.
  console[level === "debug" ? "log" : level](formatDev(level, message, meta, requestId));
}

export const logger = {
  debug: (message: string, meta?: Record<string, unknown>) => write("debug", message, meta),
  error: (message: string, meta?: Record<string, unknown>) => write("error", message, meta),
  info: (message: string, meta?: Record<string, unknown>) => write("info", message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => write("warn", message, meta),
};
