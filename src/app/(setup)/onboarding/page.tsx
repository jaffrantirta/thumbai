"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Key, Cpu, CheckCircle2, Loader2, Eye, EyeOff } from "lucide-react";
import { LogoIcon } from "@/components/ui/logo-icon";
import { cn } from "@/lib/utils";

const STEPS = ["welcome", "connect", "models", "done"] as const;
type Step = (typeof STEPS)[number];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("welcome");
  const [aiEndpoint, setAiEndpoint] = useState("");
  const [aiKey, setAiKey] = useState("");
  const [aiModel, setAiModel] = useState("gpt-4o");
  const [imageModel, setImageModel] = useState("dall-e-3");
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const stepIndex = STEPS.indexOf(step);

  async function handleFinish() {
    if (!aiEndpoint.trim() || !aiKey.trim()) {
      setError("endpoint and api key are required");
      return;
    }
    setError("");
    setSaving(true);
    try {
      const resp = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aiEndpoint, aiKey, aiModel, imageModel }),
      });
      if (!resp.ok) throw new Error("failed to save");
      setStep("done");
    } catch {
      setError("something went wrong, please try again");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* logo */}
        <div className="flex items-center gap-2 justify-center mb-10">
          <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center">
            <LogoIcon className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white text-xl tracking-tight">thumbai</span>
        </div>

        {/* step indicator */}
        {step !== "done" && (
          <div className="flex items-center gap-2 justify-center mb-8">
            {["connect", "models"].map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all",
                    stepIndex > i + 1
                      ? "bg-violet-600 text-white"
                      : stepIndex === i + 1
                      ? "bg-violet-600 text-white"
                      : "bg-zinc-800 text-zinc-500"
                  )}
                >
                  {stepIndex > i + 1 ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
                </div>
                {i < 1 && <div className="w-12 h-px bg-zinc-800" />}
              </div>
            ))}
          </div>
        )}

        {/* welcome */}
        {step === "welcome" && (
          <div className="text-center space-y-6">
            <div className="space-y-3">
              <h1 className="text-3xl font-bold text-white">welcome to thumbai</h1>
              <p className="text-zinc-400 text-base leading-relaxed">
                generate ai-powered thumbnails for your videos.<br />
                let&apos;s set up your ai provider to get started — it only takes a minute.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 py-4">
              {[
                { icon: "🎨", label: "5 templates", sub: "ready to use" },
                { icon: "🤖", label: "your ai key", sub: "you control costs" },
                { icon: "⚡", label: "fast export", sub: "png download" },
              ].map((f) => (
                <div key={f.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
                  <div className="text-2xl mb-2">{f.icon}</div>
                  <div className="text-sm font-medium text-white">{f.label}</div>
                  <div className="text-xs text-zinc-500 mt-0.5">{f.sub}</div>
                </div>
              ))}
            </div>

            <Button size="lg" onClick={() => setStep("connect")} className="w-full">
              get started <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* connect ai */}
        {step === "connect" && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-violet-400" />
              <h2 className="font-semibold text-white">connect your ai provider</h2>
            </div>
            <p className="text-sm text-zinc-400">
              thumbai works with any openai-compatible endpoint — tokenrouter, openai, sumopod, or others.
              your key is stored privately per-account.
            </p>

            <div className="space-y-2">
              <Label htmlFor="endpoint">base url</Label>
              <Input
                id="endpoint"
                placeholder="https://api.tokenrouter.io/v1"
                value={aiEndpoint}
                onChange={(e) => setAiEndpoint(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="key">api key</Label>
              <div className="relative">
                <Input
                  id="key"
                  type={showKey ? "text" : "password"}
                  placeholder="sk-..."
                  value={aiKey}
                  onChange={(e) => setAiKey(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}

            <div className="flex gap-3 pt-1">
              <Button variant="ghost" onClick={() => setStep("welcome")} className="flex-1">
                back
              </Button>
              <Button
                onClick={() => {
                  if (!aiEndpoint.trim() || !aiKey.trim()) {
                    setError("both fields are required");
                    return;
                  }
                  setError("");
                  setStep("models");
                }}
                className="flex-1"
              >
                continue <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* models */}
        {step === "models" && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-violet-400" />
              <h2 className="font-semibold text-white">choose your models</h2>
            </div>
            <p className="text-sm text-zinc-400">
              you can change these anytime in settings. leave the defaults if you&apos;re unsure.
            </p>

            <div className="space-y-2">
              <Label htmlFor="chat-model">chat model</Label>
              <Input
                id="chat-model"
                placeholder="gpt-4o"
                value={aiModel}
                onChange={(e) => setAiModel(e.target.value)}
              />
              <p className="text-xs text-zinc-500">used to generate captions in template mode</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="img-model">image model</Label>
              <Input
                id="img-model"
                placeholder="dall-e-3"
                value={imageModel}
                onChange={(e) => setImageModel(e.target.value)}
              />
              <p className="text-xs text-zinc-500">used for full ai image generation mode</p>
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <div className="flex gap-3 pt-1">
              <Button variant="ghost" onClick={() => setStep("connect")} className="flex-1">
                back
              </Button>
              <Button onClick={handleFinish} disabled={saving} className="flex-1">
                {saving ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> saving...</>
                ) : (
                  <>finish setup <CheckCircle2 className="w-4 h-4" /></>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* done */}
        {step === "done" && (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-violet-400" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">you&apos;re all set</h2>
              <p className="text-zinc-400">
                your ai provider is connected. start creating thumbnails now.
              </p>
            </div>
            <Button size="lg" onClick={() => router.push("/dashboard")} className="w-full">
              go to dashboard <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
