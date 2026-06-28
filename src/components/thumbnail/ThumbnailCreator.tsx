"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toPng } from "html-to-image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ThumbnailPreview, type TemplateId, type Ratio } from "./ThumbnailPreview";
import { Sparkles, Download, Loader2, ImageIcon, LayoutTemplate } from "lucide-react";
import { cn } from "@/lib/utils";

const RATIOS: { value: Ratio; label: string; desc: string }[] = [
  { value: "16:9", label: "16:9", desc: "youtube" },
  { value: "9:16", label: "9:16", desc: "shorts" },
  { value: "1:1", label: "1:1", desc: "square" },
  { value: "4:3", label: "4:3", desc: "classic" },
];

const COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#ef4444",
  "#f97316", "#eab308", "#22c55e", "#06b6d4",
  "#3b82f6", "#ffffff", "#18181b", "#64748b",
];

const TEMPLATES: { id: TemplateId; label: string; emoji: string }[] = [
  { id: "modern", label: "modern", emoji: "🌌" },
  { id: "minimal", label: "minimal", emoji: "⬜" },
  { id: "bold", label: "bold", emoji: "🔥" },
  { id: "neon", label: "neon", emoji: "⚡" },
  { id: "corporate", label: "corporate", emoji: "💼" },
];

type Mode = "template" | "image-gen";

export function ThumbnailCreator() {
  const router = useRouter();
  const previewRef = useRef<HTMLDivElement>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [ratio, setRatio] = useState<Ratio>("16:9");
  const [primaryColor, setPrimaryColor] = useState("#6366f1");
  const [template, setTemplate] = useState<TemplateId>("modern");
  const [mode, setMode] = useState<Mode>("template");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [caption, setCaption] = useState("");
  const [subtext, setSubtext] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [generated, setGenerated] = useState(false);

  async function handleGenerate() {
    if (!title.trim()) { setError("title is required"); return; }
    setError("");
    setLoading(true);
    setGenerated(false);

    try {
      const createResp = await fetch("/api/thumbnails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, ratio, primaryColor, template, mode }),
      });
      if (!createResp.ok) throw new Error((await createResp.json()).error || "failed to create");
      const created = await createResp.json();

      const genResp = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, ratio, primaryColor, template, mode, thumbnailId: created.id }),
      });
      if (!genResp.ok) throw new Error((await genResp.json()).error || "generation failed");
      const result = await genResp.json();

      if (mode === "template") {
        setCaption(result.caption || "");
        setSubtext(result.subtext || "");
      } else {
        setImageUrl(result.imageUrl || "");
      }

      setGenerated(true);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload() {
    if (!previewRef.current) return;
    try {
      const dataUrl = await toPng(previewRef.current, { quality: 1, pixelRatio: 2 });
      const link = document.createElement("a");
      link.download = `thumbnail-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      setError("download failed");
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left: form */}
      <div className="space-y-5">
        {/* mode */}
        <div>
          <Label className="mb-2 block">generation mode</Label>
          <div className="grid grid-cols-2 gap-2">
            {(["template", "image-gen"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={cn(
                  "flex items-center gap-2.5 p-3.5 rounded-xl border transition-all text-left",
                  mode === m
                    ? "border-violet-500/60 bg-violet-500/10 text-white"
                    : "border-zinc-800 bg-zinc-900 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
                )}
              >
                {m === "template" ? <LayoutTemplate className="w-4 h-4 shrink-0" /> : <ImageIcon className="w-4 h-4 shrink-0" />}
                <div>
                  <div className="font-medium text-sm">{m === "template" ? "template + ai" : "ai image gen"}</div>
                  <div className="text-xs opacity-50 mt-0.5">{m === "template" ? "styled + ai copy" : "full ai image"}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* title */}
        <div className="space-y-1.5">
          <Label htmlFor="title">video title</Label>
          <Input id="title" placeholder="e.g. 10 things i wish i knew before..." value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>

        {/* description */}
        <div className="space-y-1.5">
          <Label htmlFor="description">short description</Label>
          <Textarea
            id="description"
            placeholder="what is this video about? helps ai generate better content"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* ratio */}
        <div className="space-y-1.5">
          <Label>ratio</Label>
          <div className="grid grid-cols-4 gap-2">
            {RATIOS.map((r) => (
              <button
                key={r.value}
                onClick={() => setRatio(r.value)}
                className={cn(
                  "flex flex-col items-center py-2.5 px-2 rounded-lg border text-xs font-medium transition-all",
                  ratio === r.value
                    ? "border-violet-500/60 bg-violet-500/10 text-white"
                    : "border-zinc-800 bg-zinc-900 text-zinc-500 hover:border-zinc-700"
                )}
              >
                <span className="font-semibold">{r.label}</span>
                <span className="opacity-50 mt-0.5">{r.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* color */}
        <div className="space-y-1.5">
          <Label>primary color</Label>
          <div className="flex flex-wrap gap-1.5">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setPrimaryColor(c)}
                title={c}
                className={cn(
                  "w-7 h-7 rounded-lg border-2 transition-all hover:scale-110",
                  primaryColor === c
                    ? "border-white scale-110"
                    : "border-transparent hover:border-zinc-600"
                )}
                style={{ background: c }}
              />
            ))}
            <input
              type="color"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="w-7 h-7 rounded-lg cursor-pointer border-2 border-zinc-800 bg-transparent"
              title="custom color"
            />
          </div>
        </div>

        {/* template */}
        {mode === "template" && (
          <div className="space-y-1.5">
            <Label>template</Label>
            <div className="grid grid-cols-5 gap-1.5">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTemplate(t.id)}
                  className={cn(
                    "flex flex-col items-center py-2.5 px-1 rounded-lg border text-xs font-medium transition-all",
                    template === t.id
                      ? "border-violet-500/60 bg-violet-500/10 text-white"
                      : "border-zinc-800 bg-zinc-900 text-zinc-500 hover:border-zinc-700"
                  )}
                >
                  <span className="text-base mb-0.5">{t.emoji}</span>
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <Button onClick={handleGenerate} disabled={loading} className="w-full">
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> generating...</>
          ) : (
            <><Sparkles className="w-4 h-4" /> generate thumbnail</>
          )}
        </Button>
      </div>

      {/* Right: preview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>preview</Label>
          {generated && (
            <Button size="sm" variant="outline" onClick={handleDownload}>
              <Download className="w-3.5 h-3.5" /> download png
            </Button>
          )}
        </div>

        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-3">
          <ThumbnailPreview
            title={title}
            description={description}
            primaryColor={primaryColor}
            template={template}
            ratio={ratio}
            caption={caption}
            subtext={subtext}
            imageUrl={imageUrl}
            mode={mode}
            previewRef={previewRef}
          />
        </div>

        {loading && (
          <p className="text-violet-400 text-sm flex items-center gap-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            {mode === "image-gen" ? "generating image with ai..." : "ai is writing your copy..."}
          </p>
        )}

        {generated && (
          <p className="text-emerald-400 text-sm flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" />
            thumbnail generated — click download to save
          </p>
        )}
      </div>
    </div>
  );
}
