"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Plus, Settings, LogOut, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

const NAV = [
  { href: "/dashboard", label: "dashboard", icon: LayoutDashboard },
  { href: "/create", label: "create", icon: Plus },
  { href: "/settings", label: "settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push("/login");
  }

  return (
    <aside className="w-56 shrink-0 flex flex-col h-screen bg-zinc-950 border-r border-zinc-900 py-6 px-3 fixed left-0 top-0">
      <Link href="/dashboard" className="flex items-center gap-2 px-2 mb-8">
        <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
          <Sparkles className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="font-semibold text-white text-base tracking-tight">thumbai</span>
      </Link>

      <nav className="flex-1 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
              pathname === href || pathname.startsWith(href + "/")
                ? "bg-zinc-800 text-white font-medium"
                : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900"
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </Link>
        ))}
      </nav>

      <button
        onClick={handleSignOut}
        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-zinc-600 hover:text-red-400 hover:bg-zinc-900 transition-colors w-full"
      >
        <LogOut className="w-4 h-4" />
        sign out
      </button>
    </aside>
  );
}
