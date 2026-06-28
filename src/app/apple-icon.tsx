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
        <svg width="130" height="130" viewBox="0 0 32 32">
          {/* frame outer (white fill = border) */}
          <rect x="3" y="9" width="18" height="12" rx="2.5" fill="white"/>
          {/* frame inner (violet fill = interior) */}
          <rect x="5" y="11" width="14" height="8" rx="1.5" fill="#5b21b6"/>
          {/* play triangle */}
          <path d="M8.5 12.5L15 15L8.5 17.5Z" fill="white"/>
          {/* sparkle — 4-pointed star */}
          <path d="M25 4L26.1 5.9L28 7L26.1 8.1L25 10L23.9 8.1L22 7L23.9 5.9Z" fill="white"/>
        </svg>
      </div>
    ),
    { ...size }
  );
}
