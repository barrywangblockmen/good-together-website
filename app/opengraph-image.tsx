import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/constants";

export const runtime = "edge";

export const alt = SITE_NAME;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 72,
          background:
            "linear-gradient(135deg, #1a1f1e 0%, #232a28 45%, #2f3a38 100%)",
          color: "#e8eeec",
          fontFamily:
            'ui-sans-serif, system-ui, "Noto Sans TC", "Apple Color Emoji"',
        }}
      >
        <div
          style={{
            fontSize: 56,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
          }}
        >
          {SITE_NAME}
        </div>
        <div style={{ marginTop: 16, fontSize: 28, color: "#9caaa7" }}>
          {SITE_TAGLINE}
        </div>
        <div
          style={{
            marginTop: 40,
            display: "flex",
            gap: 16,
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: 6,
              background: "#5e8b8a",
            }}
          />
          <div style={{ fontSize: 22, color: "#7a9e9d" }}>GT 俱樂部 · AI · Web3 · 永續</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
