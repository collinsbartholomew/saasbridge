# Add full i18n

SaaSBridge ships `src/lib/i18n.ts` — a typed `t(key)` stub over a single English dictionary. It gives you the *shape* of i18n without adding a dependency.

When you actually need multiple locales, graduate to `next-intl`.

## 1. Install

```bash
pnpm add next-intl
```

## 2. Define locales

Create `messages/en.json`, `messages/es.json`, etc. Key shape can mirror your existing `src/lib/i18n.ts` dictionary to minimize refactor.

## 3. Configure

Follow https://next-intl.dev/docs/getting-started/app-router — set up the `i18n.ts` config, add the `[locale]` segment to `src/app/`, wire the middleware/proxy.

**Note:** SaaSBridge uses `proxy.ts`, not `middleware.ts`. Fold `next-intl`'s middleware logic into the existing `proxy.ts`.

## 4. Replace the stub

```ts
// Old (src/lib/i18n.ts):
export function t(key: keyof typeof dict): string { return dict[key]; }

// New:
import { getTranslations } from "next-intl/server";

export async function t(key: string) {
  const translations = await getTranslations();
  return translations(key);
}
```

Update every call site (small count — the stub is rarely used in v1).

## 5. Language switcher

Add to the dashboard nav. Persist selected locale in a cookie, read in `proxy.ts`.

## Considerations

- Date/number formatting: use `Intl.DateTimeFormat` and `Intl.NumberFormat` directly where possible — they're built-in.
- Email templates: parameterize with `locale` and render the right template variant.
- SEO: add `alternate` links for each locale in metadata.
