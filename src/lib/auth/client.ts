"use client";

import { emailOTPClient, twoFactorClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import { env } from "@/lib/env";

export const authClient = createAuthClient({
  basePath: "/api/auth",
  baseURL: env.NEXT_PUBLIC_APP_URL,
  plugins: [
    emailOTPClient(),
    twoFactorClient({
      twoFactorPage: "/two-factor",
    }),
  ],
});
