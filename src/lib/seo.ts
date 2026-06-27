import type { Metadata } from "next";

import { env } from "@/lib/env";

type BuildMetadataInput = {
  title: string;
  description: string;
  path: `/${string}` | "/";
};

export function buildMetadata({ title, description, path }: BuildMetadataInput): Metadata {
  const metadataBase = new URL(env.NEXT_PUBLIC_APP_URL);
  const canonicalUrl = new URL(path, metadataBase).toString();
  const openGraphImage = new URL("/opengraph-image", metadataBase).toString();
  const twitterImage = new URL("/twitter-image", metadataBase).toString();

  return {
    title,
    description,
    metadataBase,
    applicationName: env.NEXT_PUBLIC_APP_NAME,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: "website",
      siteName: env.NEXT_PUBLIC_APP_NAME,
      url: canonicalUrl,
      title,
      description,
      images: [
        {
          url: openGraphImage,
          width: 1200,
          height: 630,
          alt: `${env.NEXT_PUBLIC_APP_NAME} Open Graph image`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [twitterImage],
    },
  };
}
