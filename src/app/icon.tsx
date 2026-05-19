import { ImageResponse } from "next/og"

export const size = {
  width: 64,
  height: 64,
}

export const contentType = "image/png"

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "#020617",
          border: "4px solid #dc2626",
          borderRadius: 14,
          color: "white",
          display: "flex",
          height: "100%",
          justifyContent: "center",
          position: "relative",
          width: "100%",
        }}
      >
        <div
          style={{
            border: "3px solid #ffffff",
            borderRadius: 999,
            height: 34,
            left: 13,
            opacity: 0.95,
            position: "absolute",
            top: 9,
            width: 34,
          }}
        />
        <div
          style={{
            background: "#dc2626",
            borderRadius: 999,
            height: 12,
            position: "absolute",
            right: 11,
            top: 13,
            width: 12,
          }}
        />
        <div
          style={{
            background: "#ffffff",
            height: 3,
            position: "absolute",
            right: 18,
            top: 22,
            transform: "rotate(42deg)",
            transformOrigin: "right center",
            width: 24,
          }}
        />
        <div
          style={{
            background: "#dc2626",
            borderRadius: 4,
            bottom: 12,
            height: 22,
            position: "absolute",
            right: 12,
            width: 24,
          }}
        />
        <div
          style={{
            border: "2px solid #ffffff",
            borderBottom: "0",
            borderRadius: "50% 50% 0 0",
            bottom: 30,
            height: 8,
            position: "absolute",
            right: 12,
            width: 24,
          }}
        />
        <div
          style={{
            bottom: 15,
            color: "#ffffff",
            fontFamily: "Arial",
            fontSize: 13,
            fontWeight: 800,
            letterSpacing: 0,
            position: "absolute",
          }}
        >
          OA
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
