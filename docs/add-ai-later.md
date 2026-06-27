# Add AI features (Vercel AI Gateway)

The AI scaffolding is already wired — it's inert until you set an API key.

## 1. Get a key

https://vercel.com/docs/ai-gateway — create a gateway and copy the API key.

## 2. Set the env var

Locally in `.env.local`:

```env
AI_GATEWAY_API_KEY="..."
```

On Vercel/Netlify, add it to your environment variables.

## 3. Use it

```ts
// Anywhere in a Server Action or route handler:
import { generate } from "@/lib/ai/gateway";

const result = await generate({
  model: "anthropic/claude-sonnet-4-6",  // "provider/model" string
  prompt: "Summarize this in 2 sentences: ...",
});

if (result.ok) {
  console.log(result.text);
}
```

Without `AI_GATEWAY_API_KEY`, `generate()` returns `{ ok: false, reason: "disabled" }` — no crash, just a typed disable.

## Streaming to the UI

For chat UIs, pair with `@ai-sdk/react`:

```bash
pnpm add @ai-sdk/react
```

Wire a Route Handler that returns `result.toUIMessageStreamResponse()`, then `useChat({ transport: new DefaultChatTransport({ api: "/api/chat" }) })` on the client. See [AI SDK docs](https://sdk.vercel.ai/docs).

## Model routing

Change models by swapping the `provider/model` string. Gateway handles auth, fallbacks, and billing transparently.

## Rate limiting AI calls

Wrap the call in `rateLimit()` (see `src/lib/rate-limit/`) keyed by user ID. AI calls are the most abusable endpoint in a starter — always rate-limit.

## Observability

AI responses appear as JSON lines from `src/lib/logger.ts`. The gateway adds cost + latency headers; log them for cost tracking.
