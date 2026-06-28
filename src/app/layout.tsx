import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ThumbAI — AI Thumbnail Generator",
  description: "Generate stunning YouTube thumbnails with AI",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
