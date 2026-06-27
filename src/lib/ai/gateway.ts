import "server-only";

import { createGateway, generateText, type ModelMessage } from "ai";

import { env } from "@/lib/env";

export type GenerateInput = {
  model: string;
  prompt?: string;
  messages?: Array<{ role: "user" | "assistant" | "system"; content: string }>;
  system?: string;
};

export type GenerateOk = {
  ok: true;
  text: string;
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
  };
};

export type GenerateErr = {
  ok: false;
  error: string;
  reason?: "disabled" | "rate_limited" | "upstream";
};

export async function generate(input: GenerateInput): Promise<GenerateOk | GenerateErr> {
  if (!env.AI_GATEWAY_API_KEY) {
    return { ok: false, error: "AI disabled", reason: "disabled" };
  }

  if (!input.prompt && !input.messages?.length) {
    return { ok: false, error: "AI prompt or messages are required", reason: "upstream" };
  }

  try {
    // AI SDK v6 documents AI_GATEWAY_API_KEY as the default env var; we also pass it
    // explicitly so this wrapper does not depend on implicit global provider state.
    const gateway = createGateway({ apiKey: env.AI_GATEWAY_API_KEY });
    const model = gateway(input.model);
    const messages: ModelMessage[] | undefined = input.messages?.map((message) => ({
      content: message.content,
      role: message.role,
    }));
    const prompt = input.prompt ?? "";
    const result = messages?.length
      ? await generateText({
          model,
          ...(input.system ? { system: input.system } : {}),
          messages,
        })
      : await generateText({
          model,
          ...(input.system ? { system: input.system } : {}),
          prompt,
        });

    return {
      ok: true,
      text: result.text,
      usage: {
        inputTokens: result.totalUsage.inputTokens,
        outputTokens: result.totalUsage.outputTokens,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const loweredMessage = message.toLowerCase();

    if (loweredMessage.includes("rate limit")) {
      return { ok: false, error: message, reason: "rate_limited" };
    }

    return { ok: false, error: message, reason: "upstream" };
  }
}
