# Add TanStack Query

TanStack Query is intentionally *not* a default dep. Server Components + Server Actions cover 90% of remote data needs in an App Router app.

Reach for Query when you need:

- **Optimistic updates** with complex rollback
- **Polling** or server-sent events / websockets adapters
- **Infinite scroll**
- A **single cache shared across many client components** on the same page

Otherwise, Server Components are simpler and cheaper.

## Install

```bash
pnpm add @tanstack/react-query @tanstack/react-query-devtools
```

## Provider

Create `src/components/providers/query-provider.tsx`:

```tsx
"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60_000, refetchOnWindowFocus: false },
        },
      }),
  );
  return (
    <QueryClientProvider client={client}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

Wrap it in `src/app/layout.tsx` *inside* `ThemeProvider`.

## Integration with Server Actions

Use Server Actions as the *source of truth* and Query as the *cache layer on the client only*. `useMutation` wraps the action, then invalidates affected query keys:

```tsx
const mutation = useMutation({
  mutationFn: updateProjectAction,
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects"] }),
});
```

## What NOT to do

- Don't pass Query cache as the primary datastore — Server Components + `revalidatePath` already give you fresh data.
- Don't duplicate data between Zustand and Query. Pick one, and it's Query for remote data.
