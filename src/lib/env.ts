import { z } from "zod";

const serverSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  // Database
  DATABASE_URL: z.string().url().startsWith("postgres"),

  // Better Auth
  BETTER_AUTH_SECRET: z.string().min(32, "BETTER_AUTH_SECRET must be at least 32 chars"),
  BETTER_AUTH_URL: z.string().url().default("http://localhost:3000"),

  // Email (Resend) — optional in dev (falls back to console)
  RESEND_API_KEY: z.string().optional(),
  // Accepts either "user@domain.tld" OR "Display Name <user@domain.tld>" (RFC 5322 addr-spec).
  EMAIL_FROM: z
    .string()
    .min(1)
    .regex(/^(?:[^<>\s]+@[^<>\s]+|.+<[^<>\s]+@[^<>\s]+>)$/, {
      message: 'Must be an email address or "Name <email@domain>" form',
    })
    .default("SaaSBridge <onboarding@resend.dev>"),

  // AI Gateway — optional; when unset, AI features are disabled
  AI_GATEWAY_API_KEY: z.string().optional(),
});

const clientSchema = z.object({
  NEXT_PUBLIC_APP_NAME: z.string().default("SaaSBridge"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
});

type ServerEnv = z.infer<typeof serverSchema>;
type ClientEnv = z.infer<typeof clientSchema>;

function format(issues: z.ZodIssue[]): string {
  return issues.map((i) => `  - ${i.path.join(".") || "(root)"}: ${i.message}`).join("\n");
}

function parseServer(): ServerEnv {
  const parsed = serverSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(
      `\n❌ Invalid server environment variables:\n${format(parsed.error.issues)}\n\nCheck .env.example for required values.\n`,
    );
  }
  return parsed.data;
}

function parseClient(): ClientEnv {
  const parsed = clientSchema.safeParse({
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  });
  if (!parsed.success) {
    throw new Error(`\n❌ Invalid client environment variables:\n${format(parsed.error.issues)}\n`);
  }
  return parsed.data;
}

const isServer = typeof window === "undefined";

export const env: ServerEnv & ClientEnv = isServer
  ? { ...parseServer(), ...parseClient() }
  : ({ ...parseClient() } as ServerEnv & ClientEnv);
