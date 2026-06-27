import "server-only";

export type FeatureFlag = "ai" | "billing" | "teams";

const enabledValues = new Set(["1", "on", "true", "yes"]);

export function isEnabled(key: string): boolean {
  const envKey = `FLAG_${key.replace(/[^a-zA-Z0-9]+/g, "_").toUpperCase()}_ENABLED`;
  const value = process.env[envKey];

  if (!value) {
    return false;
  }

  return enabledValues.has(value.trim().toLowerCase());
}
