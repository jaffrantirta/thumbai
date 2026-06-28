"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";

export function MobileHeader() {
  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-zinc-950 border-b border-zinc-900 flex items-center px-4">
      <Link href="/dashboard" className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
          <Sparkles className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="font-semibold text-white text-base tracking-tight">thumbai</span>
      </Link>
    </header>
  );
}
