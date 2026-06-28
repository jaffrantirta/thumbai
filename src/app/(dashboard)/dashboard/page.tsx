"use client";

import { useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { type Thumbnail } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Sparkles, ImageIcon, Download } from "lucide-react";
import Link from "next/link";
import { ThumbnailPreview, type TemplateId, type Ratio } from "@/components/thumbnail/ThumbnailPreview";
import { Skeleton } from "@/components/ui/skeleton";

function ThumbnailCard({ t, onDelete }: { t: Thumbnail; onDelete: (id: string) => void }) {
  const previewRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const slug = t.title.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").slice(0, 60);

  async function handleDownload() {
    setDownloading(true);
    try {
      if (t.mode === "image-gen" && t.imageUrl) {
        const link = document.createElement("a");
        link.download = `${slug}.png`;
        link.href = t.imageUrl;
        link.target = "_blank";
        link.click();
      } else if (previewRef.current) {
        const dataUrl = await toPng(previewRef.current, { quality: 1, pixelRatio: 2 });
        const link = document.createElement("a");
        link.download = `${slug}.png`;
        link.href = dataUrl;
        link.click();
      }
    } finally {
      setDownloading(false);
    }
  }

  const canDownload = t.status === "done" && (t.mode === "template" || !!t.imageUrl);

  return (
    <div className="group bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-all">
      <div className="p-2.5 bg-zinc-950 relative">
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
          previewRef={t.mode === "template" ? previewRef : undefined}
        />
        {canDownload && (
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="absolute bottom-4 right-4 p-2 rounded-lg bg-black/60 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 hover:bg-black/80 transition-all disabled:opacity-50"
            title="download"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      <div className="px-4 py-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-medium text-sm text-white leading-tight line-clamp-1">{t.title}</h3>
          <button
            onClick={() => onDelete(t.id)}
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
            <Badge variant="secondary"><ImageIcon className="w-3 h-3 mr-1" />ai image</Badge>
          )}
        </div>
        <p className="text-xs text-zinc-600 mt-2">{new Date(t.createdAt).toLocaleDateString()}</p>
      </div>
    </div>
  );
}

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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold text-white">thumbnails</h1>
          <p className="text-zinc-500 text-sm mt-0.5">{thumbnails.length} created</p>
        </div>
        <Button asChild size="sm">
          <Link href="/create"><Plus className="w-4 h-4" /> new</Link>
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
              <div className="p-2.5 bg-zinc-950">
                <Skeleton className="w-full aspect-video" />
              </div>
              <div className="px-4 py-3 space-y-2.5">
                <Skeleton className="h-4 w-3/4" />
                <div className="flex gap-1.5">
                  <Skeleton className="h-5 w-12 rounded-full" />
                  <Skeleton className="h-5 w-10 rounded-full" />
                </div>
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : thumbnails.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {thumbnails.map((t) => (
            <ThumbnailCard key={t.id} t={t} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
