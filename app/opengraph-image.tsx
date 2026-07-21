import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

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
          alignItems: "center",
          justifyContent: "center",
          background: "#1c2530",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            fontSize: 72,
            fontWeight: 800,
          }}
        >
          <div
            style={{
              display: "flex",
              width: 96,
              height: 96,
              borderRadius: 20,
              background: "#c6572a",
            }}
          />
          <div style={{ display: "flex" }}>
            Top Choice <span style={{ color: "#c6572a", marginLeft: 16 }}>HVAC</span>
          </div>
        </div>
        <div style={{ marginTop: 24, fontSize: 32, color: "rgba(255,255,255,0.75)", display: "flex" }}>
          {site.tagline}
        </div>
      </div>
    ),
    { ...size }
  );
}
