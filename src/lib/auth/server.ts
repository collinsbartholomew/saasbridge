import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { emailOTP, twoFactor } from "better-auth/plugins";
import { createElement } from "react";

import { db } from "@/db/client";
import { account, session, twoFactor as twoFactorTable, user, verification } from "@/db/schema";
import { sendEmail } from "@/lib/email/send";
import { OtpEmail } from "@/lib/email/templates/otp";
import { env } from "@/lib/env";

const otpExpirySeconds = 60 * 10;

export const auth = betterAuth({
  appName: env.NEXT_PUBLIC_APP_NAME,
  basePath: "/api/auth",
  baseURL: env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      account,
      session,
      twoFactor: twoFactorTable,
      user,
      verification,
    },
  }),
  plugins: [
    nextCookies(),
    emailOTP({
      expiresIn: otpExpirySeconds,
      otpLength: 6,
      async sendVerificationOTP({ email, otp, type }) {
        const titles: Record<string, string> = {
          "email-verification": "Verify your email",
          "forget-password": "Reset your password",
          "sign-in": "Sign in to your account",
        };

        await sendEmail({
          react: createElement(OtpEmail, {
            appName: env.NEXT_PUBLIC_APP_NAME,
            code: otp,
            expiresInMinutes: otpExpirySeconds / 60,
            title: titles[type] ?? "Your verification code",
          }),
          subject: `${env.NEXT_PUBLIC_APP_NAME} verification code`,
          to: email,
        });
      },
    }),
    twoFactor({
      allowPasswordless: true,
      issuer: env.NEXT_PUBLIC_APP_NAME,
      trustDeviceMaxAge: 60 * 60 * 24 * 30,
    }),
  ],
  secret: env.BETTER_AUTH_SECRET,
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
    expiresIn: 60 * 60 * 24 * 7,
    freshAge: 60 * 60 * 24,
  },
});
