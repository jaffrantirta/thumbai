"use client";

import { useEffect, useState } from "react";
import { type Thumbnail } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Sparkles, ImageIcon } from "lucide-react";
import Link from "next/link";
import { ThumbnailPreview, type TemplateId, type Ratio } from "@/components/thumbnail/ThumbnailPreview";

export default function DashboardPage() {
  const [thumbnails, setThumbnails] = useState<Thumbnail[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadThumbnails() {
    const resp = await fetch("/api/thumbnails");
    if (resp.ok) setThumbnails(await resp.json());
    setLoading(false);
  }

  async function handleDelete(id: string) {
    await fetch(`/api/thumbnails?id=${id}`, { method: "DELETE" });
    setThumbnails((prev) => prev.filter((t) => t.id !== id));
  }

  useEffect(() => { loadThumbnails(); }, []);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold text-white">thumbnails</h1>
          <p className="text-zinc-500 text-sm mt-0.5">
            {thumbnails.length} created
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/create">
            <Plus className="w-4 h-4" /> new
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="text-zinc-600 text-sm py-20 text-center">loading...</div>
      ) : thumbnails.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4">
            <Sparkles className="w-6 h-6 text-zinc-700" />
          </div>
          <h2 className="text-base font-medium text-white mb-1">no thumbnails yet</h2>
          <p className="text-zinc-600 text-sm mb-5">create your first ai-powered thumbnail</p>
          <Button asChild size="sm">
            <Link href="/create"><Plus className="w-4 h-4" /> create thumbnail</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {thumbnails.map((t) => (
            <div
              key={t.id}
              className="group bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-all"
            >
              <div className="p-2.5 bg-zinc-950">
                <ThumbnailPreview
                  title={t.title}
                  description={t.description}
                  primaryColor={t.primaryColor}
                  template={t.template as TemplateId}
                  ratio={t.ratio as Ratio}
                  caption={t.aiCaption || undefined}
                  subtext={t.aiSubtext || undefined}
                  imageUrl={t.imageUrl || undefined}
                  mode={t.mode as "template" | "image-gen"}
                />
              </div>
              <div className="px-4 py-3">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-medium text-sm text-white leading-tight line-clamp-1">{t.title}</h3>
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="text-zinc-700 hover:text-red-400 transition-colors shrink-0 opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Badge variant={t.status === "done" ? "success" : t.status === "failed" ? "destructive" : "secondary"}>
                    {t.status}
                  </Badge>
                  <Badge variant="outline">{t.ratio}</Badge>
                  {t.mode === "image-gen" && (
                    <Badge variant="secondary">
                      <ImageIcon className="w-3 h-3 mr-1" />ai image
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-zinc-600 mt-2">
                  {new Date(t.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
