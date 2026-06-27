import { render } from "@react-email/render";
import type { ReactElement } from "react";
import { Resend } from "resend";

import { env } from "@/lib/env";
import { logger } from "@/lib/logger";

type SendEmailInput = {
  react: ReactElement;
  subject: string;
  to: string | string[];
};

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

export async function sendEmail({ react, subject, to }: SendEmailInput) {
  if (env.NODE_ENV !== "production" || !resend) {
    const html = await render(react);

    await logger.info("email.send.dev", {
      html,
      subject,
      to,
    });

    return {
      id: "dev-email",
    };
  }

  const result = await resend.emails.send({
    from: env.EMAIL_FROM,
    react,
    subject,
    to,
  });

  if (result.error) {
    await logger.error("email.send.failed", {
      error: result.error,
      subject,
      to,
    });

    throw new Error(result.error.message);
  }

  await logger.info("email.send.success", {
    emailId: result.data?.id ?? null,
    subject,
    to,
  });

  return result.data;
}
