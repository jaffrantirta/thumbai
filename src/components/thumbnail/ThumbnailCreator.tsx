"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toPng } from "html-to-image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ThumbnailPreview, type TemplateId, type Ratio } from "./ThumbnailPreview";
import { Sparkles, Download, Loader2, ImageIcon, LayoutTemplate, User, ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

const RATIOS: { value: Ratio; label: string; desc: string }[] = [
  { value: "16:9", label: "16:9", desc: "youtube" },
  { value: "9:16", label: "9:16", desc: "shorts" },
  { value: "1:1", label: "1:1", desc: "square" },
  { value: "4:3", label: "4:3", desc: "classic" },
];

const COLORS = [
  "#7c3aed", "#6366f1", "#ec4899", "#ef4444",
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
  const [primaryColor, setPrimaryColor] = useState("#7c3aed");
  const [template, setTemplate] = useState<TemplateId>("modern");
  const [mode, setMode] = useState<Mode>("template");

  // image-gen state
  const [includeSubject, setIncludeSubject] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [genError, setGenError] = useState("");

  // save state (template mode)
  const [saving, setSaving] = useState(false);

  const canDownload = mode === "template" ? !!title.trim() : !!imageUrl;

  async function handleDownload() {
    if (!title.trim()) return;

    if (mode === "template") {
      // Save to DB then export PNG from DOM — no AI needed
      setSaving(true);
      try {
        await fetch("/api/thumbnails", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            description,
            ratio,
            primaryColor,
            template,
            mode,
            status: "done",
            aiCaption: title,
            aiSubtext: description,
          }),
        });
        router.refresh();
      } catch {
        // non-blocking — still download even if save fails
      } finally {
        setSaving(false);
      }

      if (!previewRef.current) return;
      const dataUrl = await toPng(previewRef.current, { quality: 1, pixelRatio: 2 });
      const link = document.createElement("a");
      link.download = `thumbnail-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } else {
      // image-gen mode: download the AI image URL
      const link = document.createElement("a");
      link.download = `thumbnail-${Date.now()}.png`;
      link.href = imageUrl;
      link.target = "_blank";
      link.click();
    }
  }

  async function handleAiGenerate() {
    if (!title.trim()) { setGenError("title is required"); return; }
    setGenError("");
    setGenerating(true);
    setImageUrl("");

    try {
      const createResp = await fetch("/api/thumbnails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, ratio, primaryColor, template, mode }),
      });
      if (!createResp.ok) throw new Error((await createResp.json()).error || "failed");
      const created = await createResp.json();

      const genResp = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, ratio, primaryColor, template, mode, includeSubject, thumbnailId: created.id }),
      });
      const genData = await genResp.json();
      if (!genResp.ok) throw new Error(genData.error || "generation failed");
      if (!genData.imageUrl) throw new Error("no image returned — check your image model name in settings");

      setImageUrl(genData.imageUrl);
      router.refresh();
    } catch (err: unknown) {
      setGenError(err instanceof Error ? err.message : "something went wrong");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left: form */}
      <div className="space-y-5">
        {/* mode */}
        <div>
          <Label className="mb-2 block">mode</Label>
          <div className="grid grid-cols-2 gap-2">
            {(["template", "image-gen"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setImageUrl(""); setGenError(""); }}
                className={cn(
                  "flex items-center gap-2.5 p-3.5 rounded-xl border transition-all text-left",
                  mode === m
                    ? "border-violet-500/60 bg-violet-500/10 text-white"
                    : "border-zinc-800 bg-zinc-900 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
                )}
              >
                {m === "template"
                  ? <LayoutTemplate className="w-4 h-4 shrink-0" />
                  : <ImageIcon className="w-4 h-4 shrink-0" />}
                <div>
                  <div className="font-medium text-sm">
                    {m === "template" ? "design" : "ai generate"}
                  </div>
                  <div className="text-xs opacity-50 mt-0.5">
                    {m === "template" ? "instant, no api call" : "uses your ai key"}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* title */}
        <div className="space-y-1.5">
          <Label htmlFor="title">video title</Label>
          <Input
            id="title"
            placeholder="e.g. 10 things i wish i knew before..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* description */}
        <div className="space-y-1.5">
          <Label htmlFor="description">
            {mode === "template" ? "subtitle / tagline" : "description (helps ai)"}
          </Label>
          <Textarea
            id="description"
            placeholder={
              mode === "template"
                ? "a short line shown below the title"
                : "what is this video about?"
            }
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
                  primaryColor === c ? "border-white scale-110" : "border-transparent hover:border-zinc-600"
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

        {/* template picker — only for design mode */}
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

        {/* subject toggle — image-gen only */}
        {mode === "image-gen" && (
          <div className="space-y-1.5">
            <Label>subject in thumbnail</Label>
            <div className="grid grid-cols-2 gap-2">
              {([
                { value: true,  icon: User,     label: "with person",  sub: "include a human subject" },
                { value: false, icon: ImageOff, label: "no person",    sub: "scenery, objects, text only" },
              ] as const).map(({ value, icon: Icon, label, sub }) => (
                <button
                  key={String(value)}
                  onClick={() => setIncludeSubject(value)}
                  className={cn(
                    "flex items-center gap-2.5 p-3.5 rounded-xl border transition-all text-left",
                    includeSubject === value
                      ? "border-violet-500/60 bg-violet-500/10 text-white"
                      : "border-zinc-800 bg-zinc-900 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <div>
                    <div className="font-medium text-sm">{label}</div>
                    <div className="text-xs opacity-50 mt-0.5">{sub}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* actions */}
        {mode === "template" ? (
          <Button
            onClick={handleDownload}
            disabled={!title.trim() || saving}
            className="w-full"
          >
            {saving
              ? <><Loader2 className="w-4 h-4 animate-spin" /> saving...</>
              : <><Download className="w-4 h-4" /> save & download</>}
          </Button>
        ) : (
          <div className="space-y-3">
            <Button
              onClick={handleAiGenerate}
              disabled={generating}
              className="w-full"
            >
              {generating
                ? <><Loader2 className="w-4 h-4 animate-spin" /> generating...</>
                : <><Sparkles className="w-4 h-4" /> generate with ai</>}
            </Button>
            {genError && <p className="text-red-400 text-sm">{genError}</p>}
            {imageUrl && (
              <Button variant="outline" onClick={handleDownload} className="w-full">
                <Download className="w-4 h-4" /> download image
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Right: preview */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>
            {mode === "template" ? "live preview" : "ai result"}
          </Label>
          {mode === "template" && (
            <span className="text-xs text-zinc-600">updates as you type</span>
          )}
        </div>

        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-3">
          <ThumbnailPreview
            title={title}
            description={description}
            primaryColor={primaryColor}
            template={template}
            ratio={ratio}
            imageUrl={imageUrl}
            mode={mode}
            previewRef={previewRef}
          />
        </div>

        {mode === "template" && (
          <p className="text-xs text-zinc-600">
            what you see is exactly what you get — no ai call needed
          </p>
        )}

        {mode === "image-gen" && generating && (
          <p className="text-violet-400 text-sm flex items-center gap-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> ai is generating your image...
          </p>
        )}
      </div>
    </div>
  );
}
