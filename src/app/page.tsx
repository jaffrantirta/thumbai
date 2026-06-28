import Link from "next/link";
import {
  Sparkles, Zap, ImageIcon, Settings2, ArrowRight,
  Check, Star, Layers, Upload,
} from "lucide-react";

// ── mock thumbnail cards for hero ────────────────────────────

const MOCK_CARDS = [
  { color: "#7c3aed", label: "how i made $10k in 30 days", tag: "ai image", ratio: "16:9" },
  { color: "#ec4899", label: "top 5 mistakes you're making", tag: "design",   ratio: "16:9" },
  { color: "#06b6d4", label: "watch this before you start", tag: "ai image", ratio: "16:9" },
];

function MockCard({ card }: { card: typeof MOCK_CARDS[0] }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      <div
        className="aspect-video flex items-end p-3"
        style={{ background: `linear-gradient(135deg, ${card.color}33 0%, #09090b 100%)` }}
      >
        <div
          className="h-1.5 w-2/3 rounded-full"
          style={{ background: card.color }}
        />
      </div>
      <div className="px-3 py-2.5 flex items-center justify-between gap-2">
        <p className="text-xs text-zinc-300 font-medium leading-snug line-clamp-1">{card.label}</p>
        <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-800 text-zinc-500">{card.tag}</span>
      </div>
    </div>
  );
}

// ── features ─────────────────────────────────────────────────

const FEATURES = [
  {
    icon: Zap,
    title: "instant design mode",
    desc: "pick a template, type your title, download. no ai key needed — fast and free.",
  },
  {
    icon: ImageIcon,
    title: "ai image generation",
    desc: "bring your own openai-compatible key. generate photorealistic thumbnails tailored to your vibe.",
  },
  {
    icon: Upload,
    title: "face blending",
    desc: "upload a photo and the ai will blend your likeness into the thumbnail for personal branding.",
  },
  {
    icon: Settings2,
    title: "your key, your data",
    desc: "we never store your api key server-side beyond your session. you stay in control.",
  },
];

// ── steps ─────────────────────────────────────────────────────

const STEPS = [
  { n: "01", title: "connect your ai", desc: "paste your openai-compatible endpoint and api key in settings. takes 30 seconds." },
  { n: "02", title: "describe your video", desc: "enter a title, pick a ratio and vibe, optionally upload your face." },
  { n: "03", title: "download & publish", desc: "your thumbnail is generated and ready to upload directly to youtube." },
];

// ── pricing ───────────────────────────────────────────────────

const PLAN_FEATURES = [
  "unlimited design-mode thumbnails",
  "ai image generation (your key)",
  "face reference blending",
  "12 vibes & 5 templates",
  "16:9, 9:16, 1:1, 4:3 ratios",
  "dashboard history",
];

// ── page ──────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">

      {/* nav */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-zinc-900/80 bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-white tracking-tight">thumbai</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-zinc-400 hover:text-white transition-colors">sign in</Link>
            <Link
              href="/register"
              className="text-sm bg-violet-600 hover:bg-violet-500 text-white px-3.5 py-1.5 rounded-lg font-medium transition-colors"
            >
              get started
            </Link>
          </div>
        </div>
      </header>

      <main>

        {/* hero */}
        <section className="pt-32 pb-20 px-4">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-1.5 bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs px-3 py-1 rounded-full mb-6">
              <Sparkles className="w-3 h-3" />
              ai-powered thumbnail generator
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-5">
              thumbnails that{" "}
              <span className="bg-gradient-to-r from-violet-400 to-violet-600 bg-clip-text text-transparent">
                get clicks
              </span>
            </h1>

            <p className="text-zinc-400 text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
              generate stunning youtube thumbnails in seconds. design mode needs no api key.
              ai mode uses your own endpoint — full control, no markup.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
              <Link
                href="/register"
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-6 py-3 rounded-xl font-medium transition-colors"
              >
                start for free <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white px-6 py-3 rounded-xl font-medium transition-colors"
              >
                sign in
              </Link>
            </div>

            {/* mock cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto">
              {MOCK_CARDS.map((c, i) => <MockCard key={i} card={c} />)}
            </div>
          </div>
        </section>

        {/* features */}
        <section className="py-20 px-4 border-t border-zinc-900">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold mb-3">everything you need</h2>
              <p className="text-zinc-500">two modes, one tool — design fast or generate with ai.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {FEATURES.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-violet-500/10 flex items-center justify-center mb-4">
                    <Icon className="w-4 h-4 text-violet-400" />
                  </div>
                  <h3 className="font-semibold text-sm mb-1.5">{title}</h3>
                  <p className="text-zinc-500 text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* how it works */}
        <section className="py-20 px-4 border-t border-zinc-900">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold mb-3">how it works</h2>
              <p className="text-zinc-500">from zero to youtube-ready in under a minute.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {STEPS.map(({ n, title, desc }) => (
                <div key={n} className="relative">
                  <div className="text-5xl font-black text-zinc-900 mb-4 select-none">{n}</div>
                  <h3 className="font-semibold mb-2">{title}</h3>
                  <p className="text-zinc-500 text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* pricing */}
        <section className="py-20 px-4 border-t border-zinc-900">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold mb-3">simple pricing</h2>
              <p className="text-zinc-500">free to use. bring your own ai key.</p>
            </div>
            <div className="max-w-sm mx-auto bg-zinc-900 border border-violet-500/30 rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />
              <div className="flex items-center gap-1.5 text-violet-400 text-xs font-medium mb-4">
                <Star className="w-3 h-3 fill-current" />
                free forever
              </div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-black">$0</span>
                <span className="text-zinc-600">/ month</span>
              </div>
              <p className="text-zinc-500 text-sm mb-6">you only pay your ai provider for image generation.</p>
              <ul className="space-y-2.5 mb-8">
                {PLAN_FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-zinc-300">
                    <Check className="w-4 h-4 text-violet-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="flex items-center justify-center gap-2 w-full bg-violet-600 hover:bg-violet-500 text-white py-3 rounded-xl font-medium transition-colors text-sm"
              >
                get started free <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* cta banner */}
        <section className="py-20 px-4 border-t border-zinc-900">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-12 h-12 rounded-2xl bg-violet-600 flex items-center justify-center mx-auto mb-5">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">ready to create?</h2>
            <p className="text-zinc-500 mb-8">join creators who use thumbai to design thumbnails that stand out.</p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-7 py-3.5 rounded-xl font-medium transition-colors"
            >
              start for free <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

      </main>

      {/* footer */}
      <footer className="border-t border-zinc-900 py-8 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-violet-600 flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <span className="font-bold text-sm">thumbai</span>
          </div>
          <p className="text-zinc-600 text-sm">© 2025 thumbai. all rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-zinc-600 hover:text-zinc-400 text-sm transition-colors">sign in</Link>
            <Link href="/register" className="text-zinc-600 hover:text-zinc-400 text-sm transition-colors">sign up</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
