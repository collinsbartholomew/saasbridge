import { z } from "zod";

export const UpdateProfileInput = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(120, "Name must be 120 characters or fewer"),
});

export const VerifyTwoFactorInput = z.object({
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Enter the 6-digit code from your authenticator app"),
});

export const RevokeSessionInput = z.object({
  token: z.string().min(1, "Session token is required"),
});

export const RevokeTrustedDeviceInput = z.object({
  deviceId: z.string().min(1, "Trusted device id is required"),
});

export type UpdateProfileInputData = z.infer<typeof UpdateProfileInput>;
export type VerifyTwoFactorInputData = z.infer<typeof VerifyTwoFactorInput>;
export type RevokeSessionInputData = z.infer<typeof RevokeSessionInput>;
export type RevokeTrustedDeviceInputData = z.infer<typeof RevokeTrustedDeviceInput>;
