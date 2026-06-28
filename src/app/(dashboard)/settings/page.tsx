"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save, Key, Cpu, CheckCircle2, Eye, EyeOff } from "lucide-react";

export default function SettingsPage() {
  const [aiEndpoint, setAiEndpoint] = useState("");
  const [aiKey, setAiKey] = useState("");
  const [aiModel, setAiModel] = useState("gpt-4o");
  const [imageModel, setImageModel] = useState("dall-e-3");
  const [hasKey, setHasKey] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        setAiEndpoint(data.aiEndpoint || "");
        setAiKey(data.hasKey ? "••••••••" + (data.aiKey?.slice(-4) || "") : "");
        setAiModel(data.aiModel || "gpt-4o");
        setImageModel(data.imageModel || "dall-e-3");
        setHasKey(!!data.hasKey);
        setLoading(false);
      });
  }, []);

  async function handleSave() {
    if (!aiEndpoint.trim()) { setError("api endpoint is required"); return; }
    setError("");
    setSaving(true);
    setSaved(false);
    try {
      const resp = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aiEndpoint, aiKey, aiModel, imageModel }),
      });
      if (!resp.ok) throw new Error("failed to save");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40 text-zinc-600 text-sm gap-2">
        <Loader2 className="animate-spin w-4 h-4" /> loading...
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-white">settings</h1>
        <p className="text-zinc-500 text-sm mt-0.5">
          configure your ai provider — stored privately per-account
        </p>
      </div>

      <div className="space-y-6">
        {/* provider */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Key className="w-3.5 h-3.5 text-zinc-500" />
            <h2 className="text-sm font-medium text-white">ai provider</h2>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="endpoint">base url</Label>
            <Input
              id="endpoint"
              placeholder="https://api.tokenrouter.io/v1"
              value={aiEndpoint}
              onChange={(e) => setAiEndpoint(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="key">api key</Label>
            <div className="relative">
              <Input
                id="key"
                type={showKey ? "text" : "password"}
                placeholder={hasKey ? "leave blank to keep existing" : "sk-..."}
                value={aiKey}
                onChange={(e) => setAiKey(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {hasKey && (
              <p className="text-xs text-emerald-500 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> key saved
              </p>
            )}
          </div>
        </div>

        {/* models */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-zinc-500" />
            <h2 className="text-sm font-medium text-white">models</h2>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="chat-model">chat model</Label>
            <Input
              id="chat-model"
              placeholder="gpt-4o"
              value={aiModel}
              onChange={(e) => setAiModel(e.target.value)}
            />
            <p className="text-xs text-zinc-600">for template mode captions</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="img-model">image model</Label>
            <Input
              id="img-model"
              placeholder="dall-e-3"
              value={imageModel}
              onChange={(e) => setImageModel(e.target.value)}
            />
            <p className="text-xs text-zinc-600">for ai image generation mode</p>
          </div>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        {saved && (
          <p className="text-emerald-400 text-sm flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> settings saved
          </p>
        )}

        <Button onClick={handleSave} disabled={saving}>
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> saving...</> : <><Save className="w-4 h-4" /> save settings</>}
        </Button>
      </div>
    </div>
  );
}
