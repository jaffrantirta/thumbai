import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          borderRadius: 40,
          background: "linear-gradient(135deg, #8b5cf6 0%, #5b21b6 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="130" height="130" viewBox="0 0 24 24" fill="none">
          {/* thumbnail frame */}
          <rect x="1.5" y="5.5" width="16" height="11" rx="2" stroke="white" strokeWidth="1.5" />
          {/* play triangle */}
          <path d="M7 8.5L12.5 11L7 13.5V8.5Z" fill="white" />
          {/* 4-pointed sparkle */}
          <path d="M20 2L20.9 4.1L23 5L20.9 5.9L20 8L19.1 5.9L17 5L19.1 4.1L20 2Z" fill="white" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
