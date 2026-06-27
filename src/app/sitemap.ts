import type { MetadataRoute } from "next";

import { env } from "@/lib/env";

const publicPaths = ["/", "/privacy", "/sign-in"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return publicPaths.map((path) => ({
    url: new URL(path, env.NEXT_PUBLIC_APP_URL).toString(),
    lastModified,
  }));
}
