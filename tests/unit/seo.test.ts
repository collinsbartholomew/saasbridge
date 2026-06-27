import { beforeEach, describe, expect, it, vi } from "vitest";

async function importSeoModule() {
  vi.resetModules();
  vi.stubEnv("DATABASE_URL", "postgres://test:test@127.0.0.1:5432/nextbase?sslmode=disable");
  vi.stubEnv("BETTER_AUTH_SECRET", "test-better-auth-secret-with-32-chars");
  vi.stubEnv("NEXT_PUBLIC_APP_NAME", "SaaSBridge Test");
  vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://nextbase.test");

  return import("@/lib/seo");
}

describe("buildMetadata", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it("builds the expected metadata shape for a page", async () => {
    const { buildMetadata } = await importSeoModule();

    const metadata = buildMetadata({
      title: "Privacy",
      description: "How SaaSBridge handles privacy.",
      path: "/privacy",
    });
    const openGraphImages = metadata.openGraph?.images;
    const firstOpenGraphImage = Array.isArray(openGraphImages)
      ? openGraphImages[0]
      : openGraphImages;

    expect(metadata).toMatchObject({
      title: "Privacy",
      description: "How SaaSBridge handles privacy.",
      applicationName: "SaaSBridge Test",
      alternates: {
        canonical: "https://nextbase.test/privacy",
      },
      openGraph: {
        siteName: "SaaSBridge Test",
        title: "Privacy",
        description: "How SaaSBridge handles privacy.",
        type: "website",
        url: "https://nextbase.test/privacy",
      },
      twitter: {
        card: "summary_large_image",
        title: "Privacy",
        description: "How SaaSBridge handles privacy.",
      },
    });
    expect(metadata.metadataBase?.toString()).toBe("https://nextbase.test/");
    expect(firstOpenGraphImage).toMatchObject({
      alt: "SaaSBridge Test Open Graph image",
      height: 630,
      url: "https://nextbase.test/opengraph-image",
      width: 1200,
    });
    expect(metadata.twitter?.images).toEqual(["https://nextbase.test/twitter-image"]);
  });
});
