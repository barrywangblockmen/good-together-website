import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#5e8b8a",
          borderRadius: 8,
        }}
      >
        <div
          style={{
            color: "white",
            fontSize: 18,
            fontWeight: 800,
            letterSpacing: "-0.05em",
          }}
        >
          GT
        </div>
      </div>
    ),
    { ...size }
  );
}
