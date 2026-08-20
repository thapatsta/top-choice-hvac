import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "#2b2b2b",
          borderRadius: 6,
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 2,
            left: 3,
            fontSize: 20,
            fontWeight: 800,
            fontStyle: "italic",
            color: "#e2653c",
            fontFamily: "Georgia, serif",
          }}
        >
          T
        </span>
        <span
          style={{
            position: "absolute",
            bottom: 1,
            right: 3,
            fontSize: 18,
            fontWeight: 800,
            color: "#4fa8db",
            fontFamily: "Georgia, serif",
          }}
        >
          C
        </span>
        <div
          style={{
            position: "absolute",
            width: 2,
            height: 26,
            background: "#f2f2f2",
            top: 3,
            left: 15,
            transform: "rotate(28deg)",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 0,
            height: 0,
            top: -1,
            left: 19,
            borderLeft: "4px solid transparent",
            borderRight: "4px solid transparent",
            borderBottom: "6px solid #f2f2f2",
            transform: "rotate(28deg)",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
