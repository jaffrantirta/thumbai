"use client";

import React from "react";
import { cn } from "@/lib/utils";

export type TemplateId = "modern" | "minimal" | "bold" | "neon" | "corporate";
export type Ratio = "16:9" | "9:16" | "1:1" | "4:3";

interface ThumbnailPreviewProps {
  title: string;
  description: string;
  primaryColor: string;
  template: TemplateId;
  ratio: Ratio;
  caption?: string;
  subtext?: string;
  imageUrl?: string;
  mode?: "template" | "image-gen";
  className?: string;
  previewRef?: React.RefObject<HTMLDivElement | null>;
}

const RATIO_CLASSES: Record<Ratio, string> = {
  "16:9": "aspect-video",
  "9:16": "aspect-[9/16]",
  "1:1": "aspect-square",
  "4:3": "aspect-[4/3]",
};

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

function lighten(hex: string, amount = 40) {
  const { r, g, b } = hexToRgb(hex);
  return `rgb(${Math.min(r + amount, 255)}, ${Math.min(g + amount, 255)}, ${Math.min(b + amount, 255)})`;
}

export function ThumbnailPreview({
  title,
  description,
  primaryColor,
  template,
  ratio,
  caption,
  subtext,
  imageUrl,
  mode = "template",
  className,
  previewRef,
}: ThumbnailPreviewProps) {
  const displayCaption = caption || title || "YOUR TITLE";
  const displaySubtext = subtext || description || "Your description here";

  if (mode === "image-gen" && imageUrl) {
    return (
      <div
        ref={previewRef}
        className={cn("relative overflow-hidden rounded-xl w-full", RATIO_CLASSES[ratio], className)}
      >
        <img src={imageUrl} alt="Generated thumbnail" className="w-full h-full object-cover" />
      </div>
    );
  }

  const templates: Record<TemplateId, React.ReactNode> = {
    modern: (
      <div
        className="w-full h-full flex flex-col justify-end p-6 relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, #0f0f0f 0%, ${primaryColor}33 100%)` }}
      >
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: `radial-gradient(circle at 80% 20%, ${primaryColor}, transparent 60%)`,
          }}
        />
        <div
          className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-30 blur-3xl"
          style={{ background: primaryColor }}
        />
        <div className="relative z-10">
          <div
            className="inline-block text-xs font-bold uppercase tracking-widest px-2 py-1 rounded mb-3"
            style={{ background: primaryColor, color: "#fff" }}
          >
            Video
          </div>
          <h1 className="text-white text-2xl font-black leading-tight uppercase mb-2 drop-shadow-lg">
            {displayCaption}
          </h1>
          <p className="text-zinc-400 text-sm font-medium">{displaySubtext}</p>
        </div>
      </div>
    ),

    minimal: (
      <div
        className="w-full h-full flex flex-col justify-center p-8"
        style={{ background: "#ffffff" }}
      >
        <div
          className="w-12 h-1 rounded-full mb-4"
          style={{ background: primaryColor }}
        />
        <h1
          className="text-3xl font-black leading-tight mb-3"
          style={{ color: "#111111" }}
        >
          {displayCaption}
        </h1>
        <p className="text-base font-medium" style={{ color: "#666666" }}>
          {displaySubtext}
        </p>
        <div
          className="absolute bottom-0 left-0 right-0 h-1"
          style={{ background: primaryColor }}
        />
      </div>
    ),

    bold: (
      <div
        className="w-full h-full flex flex-col items-center justify-center p-6 text-center"
        style={{ background: primaryColor }}
      >
        <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZmZmZiIgb3BhY2l0eT0iMC4yIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')]" />
        <h1 className="text-white text-4xl font-black leading-none uppercase mb-3 drop-shadow-2xl relative z-10">
          {displayCaption}
        </h1>
        <div className="w-16 h-1 bg-white opacity-60 rounded mb-3" />
        <p className="text-white text-base font-semibold opacity-90 relative z-10">
          {displaySubtext}
        </p>
      </div>
    ),

    neon: (
      <div
        className="w-full h-full flex flex-col justify-center p-6"
        style={{ background: "#050505" }}
      >
        <div
          className="absolute inset-0 opacity-15"
          style={{
            background: `linear-gradient(45deg, ${primaryColor}44 0%, transparent 50%, ${lighten(primaryColor)}22 100%)`,
          }}
        />
        <div
          className="text-xs font-bold uppercase tracking-[0.3em] mb-4"
          style={{ color: primaryColor }}
        >
          ▶ Now Playing
        </div>
        <h1
          className="text-2xl font-black uppercase leading-tight mb-3"
          style={{
            color: "#ffffff",
            textShadow: `0 0 20px ${primaryColor}, 0 0 40px ${primaryColor}88`,
          }}
        >
          {displayCaption}
        </h1>
        <p className="text-sm font-medium" style={{ color: "#aaaaaa" }}>
          {displaySubtext}
        </p>
        <div
          className="absolute bottom-4 left-6 right-6 h-px opacity-40"
          style={{ background: `linear-gradient(90deg, ${primaryColor}, transparent)` }}
        />
      </div>
    ),

    corporate: (
      <div
        className="w-full h-full flex flex-col justify-between p-6"
        style={{ background: "#f8fafc" }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded"
            style={{ background: primaryColor }}
          />
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">ThumbAI</span>
        </div>
        <div>
          <h1 className="text-2xl font-black text-zinc-900 leading-tight mb-2">
            {displayCaption}
          </h1>
          <p className="text-sm text-zinc-500 font-medium">{displaySubtext}</p>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="h-1 flex-1 rounded-full"
            style={{ background: primaryColor }}
          />
          <div className="h-1 w-1/4 rounded-full bg-zinc-200" />
        </div>
      </div>
    ),
  };

  return (
    <div
      ref={previewRef}
      className={cn(
        "relative overflow-hidden rounded-xl w-full",
        RATIO_CLASSES[ratio],
        className
      )}
    >
      {templates[template]}
    </div>
  );
}
