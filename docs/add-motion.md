# Add Motion (framer-motion)

SaaSBridge ships with `tw-animate-css` plus Radix primitives' built-in transitions, which cover ~90% of polish needs with zero bundle cost. Add `motion` (the successor to `framer-motion`) only when you need gesture interactions, shared-layout transitions, or orchestrated physics.

## Install

```bash
pnpm add motion
```

## Usage

```tsx
"use client";
import { motion, AnimatePresence } from "motion/react";

<motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.18 }}
>
  ...
</motion.div>
```

## Rules

- Wrap only the minimum subtree in `motion.*` — keep the rest Server Components.
- Keep durations short (≤ 200ms) for UI polish; longer for intentional hero moments.
- Respect `prefers-reduced-motion`:

  ```tsx
  const shouldReduce = useReducedMotion();
  ```

- Don't animate layout (width/height/margin) when you can transform — use `x`, `y`, `scale`, `opacity`.
