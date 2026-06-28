"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Plus, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "dashboard", icon: LayoutDashboard },
  { href: "/create", label: "create", icon: Plus },
  { href: "/settings", label: "settings", icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 h-20 bg-zinc-950 border-t border-zinc-900 flex items-start pt-2 px-2 pb-safe">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded-xl transition-colors",
              active ? "text-white" : "text-zinc-600 hover:text-zinc-400"
            )}
          >
            <div className={cn("p-1.5 rounded-lg transition-colors", active && "bg-zinc-800")}>
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-medium">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
