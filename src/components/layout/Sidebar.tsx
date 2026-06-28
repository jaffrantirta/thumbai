"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Plus, Settings, LogOut, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut, useSession } from "@/lib/auth-client";
import { LogoIcon } from "@/components/ui/logo-icon";

const NAV = [
  { href: "/dashboard", label: "dashboard", icon: LayoutDashboard },
  { href: "/create",    label: "create",    icon: Plus },
  { href: "/settings",  label: "settings",  icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const { data: session } = useSession();

  async function handleSignOut() {
    await signOut();
    router.push("/login");
  }

  const user    = session?.user;
  const initials = user?.name
    ?.split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("") ?? "?";

  return (
    <aside className="hidden lg:flex w-56 shrink-0 flex-col h-screen bg-zinc-950 border-r border-zinc-900 py-6 px-3 fixed left-0 top-0">
      <Link href="/dashboard" className="flex items-center gap-2 px-2 mb-8">
        <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
          <LogoIcon className="w-3.5 h-3.5 text-white" />
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

      {/* profile link */}
      <Link
        href="/profile"
        className={cn(
          "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors mb-1",
          pathname === "/profile"
            ? "bg-zinc-800 text-white font-medium"
            : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900"
        )}
      >
        {user?.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.image} alt={user.name} className="w-4 h-4 rounded-full object-cover shrink-0" />
        ) : (
          <div className="w-4 h-4 rounded-full bg-violet-600 flex items-center justify-center shrink-0">
            <User className="w-2.5 h-2.5 text-white" />
          </div>
        )}
        {user?.name?.split(" ")[0] ?? "profile"}
      </Link>

      <button
        onClick={handleSignOut}
        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-zinc-600 hover:text-red-400 hover:bg-zinc-900 transition-colors w-full"
      >
        <LogOut className="w-4 h-4" />
        sign out
      </button>

      {user && (
        <div className="mt-3 px-3 py-2.5 rounded-lg bg-zinc-900 border border-zinc-800">
          <div className="flex items-center gap-2">
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.image} alt={user.name} className="w-7 h-7 rounded-full object-cover shrink-0" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center shrink-0 text-white text-xs font-bold">
                {initials}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-medium text-white truncate">{user.name}</p>
              <p className="text-[11px] text-zinc-600 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
