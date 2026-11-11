import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #0a0a0a 0%, #161412 100%)",
          color: "#f5f2ee",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            width: 64,
            height: 6,
            background: "#e8792c",
            marginBottom: 40,
          }}
        />
        <div style={{ display: "flex", fontSize: 84, fontWeight: 700, letterSpacing: -2 }}>
          OUTTA RENTALS
        </div>
        <div style={{ display: "flex", fontSize: 32, color: "#a3a09b", marginTop: 24 }}>
          Professional Production Equipment
        </div>
      </div>
    ),
    { ...size }
  );
}
