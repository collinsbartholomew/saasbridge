import { ImageResponse } from "next/og";

import { env } from "@/lib/env";

export const alt = `${env.NEXT_PUBLIC_APP_NAME} Open Graph image`;
export const contentType = "image/png";
export const size = {
  width: 1200,
  height: 630,
};

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        alignItems: "stretch",
        background:
          "radial-gradient(circle at top left, rgba(255,255,255,0.24), transparent 34%), linear-gradient(135deg, #111827 0%, #1f2937 45%, #0f172a 100%)",
        color: "#f8fafc",
        display: "flex",
        flexDirection: "column",
        fontFamily: "Geist, sans-serif",
        height: "100%",
        justifyContent: "space-between",
        padding: "72px",
        width: "100%",
      }}
    >
      <div
        style={{
          border: "1px solid rgba(248,250,252,0.18)",
          borderRadius: "999px",
          display: "flex",
          fontSize: 26,
          letterSpacing: "0.24em",
          opacity: 0.82,
          padding: "14px 22px",
          textTransform: "uppercase",
        }}
      >
        Next.js 16 SaaS starter
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          maxWidth: "880px",
        }}
      >
        <div style={{ fontSize: 82, fontWeight: 700, letterSpacing: "-0.05em", lineHeight: 1 }}>
          {env.NEXT_PUBLIC_APP_NAME}
        </div>
        <div style={{ color: "rgba(248,250,252,0.84)", fontSize: 34, lineHeight: 1.35 }}>
          Lean, production-shaped foundations for auth, data, security, and typed server flows.
        </div>
      </div>

      <div
        style={{
          alignItems: "center",
          display: "flex",
          fontSize: 28,
          gap: "18px",
        }}
      >
        <div
          style={{
            background: "rgba(248,250,252,0.12)",
            border: "1px solid rgba(248,250,252,0.18)",
            borderRadius: "18px",
            padding: "16px 22px",
          }}
        >
          Better Auth
        </div>
        <div
          style={{
            background: "rgba(248,250,252,0.12)",
            border: "1px solid rgba(248,250,252,0.18)",
            borderRadius: "18px",
            padding: "16px 22px",
          }}
        >
          Drizzle + Neon
        </div>
        <div
          style={{
            background: "rgba(248,250,252,0.12)",
            border: "1px solid rgba(248,250,252,0.18)",
            borderRadius: "18px",
            padding: "16px 22px",
          }}
        >
          App Router
        </div>
      </div>
    </div>,
    size,
  );
}
