# Add password-based auth

SaaSBridge defaults to email-OTP. Add email+password if you want a more familiar flow.

Better Auth makes this mostly a config flip.

## 1. Enable the plugin in `src/lib/auth/server.ts`

```ts
export const auth = betterAuth({
  // ... existing config
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Reset your password",
        react: <ResetPasswordEmail url={url} />,
      });
    },
  },
});
```

## 2. Update the client

```ts
// src/lib/auth/client.ts already exports authClient — nothing to add.
// Call authClient.signIn.email({ email, password }) from your form.
```

## 3. Add reset-password pages

```
src/app/(auth)/forgot-password/page.tsx
src/app/(auth)/reset-password/page.tsx
```

Create a React Email template at `src/lib/email/templates/reset-password.tsx`.

## 4. Migrations

Better Auth will expect a `password` column on the `user` table. Add it:

```ts
// src/db/schema/auth.ts
password: text("password"),
```

Then `pnpm db:generate && pnpm db:migrate`.

## 5. Keep OTP as a secondary method

You can enable *both* flows. Users see two buttons on `/sign-in`. This is more surface area to test but sometimes exactly what you want.

## 6. Don't skip

- Password length + strength validation with Zod on the client AND server.
- Rate-limit the password sign-in endpoint more aggressively than OTP (e.g. 5/hour per email).
- Audit password changes and resets via `audit()`.
- Never log passwords — not even truncated.
