"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2, Save, LogOut, CheckCircle2,
  LayoutDashboard, ImageIcon, Mail, User,
} from "lucide-react";

interface ProfileData {
  id: string;
  name: string;
  email: string;
  image: string | null;
  createdAt: string;
  thumbnailCount: number;
}

function Avatar({ name, image, size = 16 }: { name: string; image: string | null; size?: number }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  if (image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={image}
        alt={name}
        className={`w-${size} h-${size} rounded-full object-cover ring-2 ring-zinc-800`}
      />
    );
  }

  return (
    <div
      className={`w-${size} h-${size} rounded-full bg-violet-600 flex items-center justify-center ring-2 ring-zinc-800 text-white font-bold`}
      style={{ fontSize: size * 2.5 }}
    >
      {initials || <User className="w-6 h-6" />}
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile]   = useState<ProfileData | null>(null);
  const [name, setName]         = useState("");
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [nameError, setNameError] = useState("");
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data: ProfileData) => {
        setProfile(data);
        setName(data.name);
        setLoading(false);
      });
  }, []);

  async function handleSaveName() {
    if (!name.trim()) { setNameError("name cannot be empty"); return; }
    if (name.trim() === profile?.name) return;
    setNameError("");
    setSaving(true);
    setSaved(false);
    try {
      const resp = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!resp.ok) throw new Error("failed");
      setProfile((p) => p ? { ...p, name: name.trim() } : p);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setNameError("failed to update name");
    } finally {
      setSaving(false);
    }
  }

  async function handleSignOut() {
    setSigningOut(true);
    await signOut();
    router.push("/login");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40 text-zinc-600 text-sm gap-2">
        <Loader2 className="animate-spin w-4 h-4" /> loading...
      </div>
    );
  }

  if (!profile) return null;

  const memberSince = new Date(profile.createdAt).toLocaleDateString("en-US", {
    month: "long", year: "numeric",
  });

  const isGoogle = !!profile.image;

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-white">profile</h1>
        <p className="text-zinc-500 text-sm mt-0.5">manage your account information</p>
      </div>

      <div className="space-y-4">

        {/* avatar + identity */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-4 mb-5">
            <Avatar name={profile.name} image={profile.image} size={16} />
            <div>
              <p className="font-semibold text-white text-base">{profile.name}</p>
              <p className="text-zinc-500 text-sm">{profile.email}</p>
              <span className="inline-flex items-center gap-1 mt-1.5 text-[11px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-medium">
                {isGoogle ? (
                  <>
                    <svg width="10" height="10" viewBox="0 0 18 18" fill="none" aria-hidden="true" className="shrink-0">
                      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
                      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
                      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
                      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
                    </svg>
                    google account
                  </>
                ) : (
                  <><Mail className="w-2.5 h-2.5" /> email account</>
                )}
              </span>
            </div>
          </div>

          {/* edit name */}
          <div className="space-y-1.5">
            <Label htmlFor="name">display name</Label>
            <div className="flex gap-2">
              <Input
                id="name"
                value={name}
                onChange={(e) => { setName(e.target.value); setNameError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                placeholder="your name"
                className="flex-1"
              />
              <Button
                onClick={handleSaveName}
                disabled={saving || name.trim() === profile.name}
                size="default"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              </Button>
            </div>
            {nameError && <p className="text-red-400 text-xs">{nameError}</p>}
            {saved && (
              <p className="text-emerald-400 text-xs flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> name updated
              </p>
            )}
          </div>
        </div>

        {/* stats */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <h2 className="text-sm font-medium text-white mb-4">stats</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <ImageIcon className="w-4 h-4 text-violet-400" />
                <span className="text-xs text-zinc-500">thumbnails</span>
              </div>
              <p className="text-2xl font-bold text-white">{profile.thumbnailCount}</p>
            </div>
            <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <LayoutDashboard className="w-4 h-4 text-violet-400" />
                <span className="text-xs text-zinc-500">member since</span>
              </div>
              <p className="text-sm font-semibold text-white">{memberSince}</p>
            </div>
          </div>
        </div>

        {/* email (read-only) */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <h2 className="text-sm font-medium text-white mb-3">email address</h2>
          <div className="flex items-center gap-3 bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-3">
            <Mail className="w-4 h-4 text-zinc-600 shrink-0" />
            <span className="text-sm text-zinc-400">{profile.email}</span>
          </div>
          <p className="text-xs text-zinc-600 mt-2">
            {isGoogle ? "managed by google — change it in your google account" : "email cannot be changed"}
          </p>
        </div>

        {/* sign out */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <h2 className="text-sm font-medium text-white mb-1">sign out</h2>
          <p className="text-zinc-500 text-sm mb-4">you'll be redirected to the login page.</p>
          <Button
            variant="destructive"
            onClick={handleSignOut}
            disabled={signingOut}
          >
            {signingOut
              ? <><Loader2 className="w-4 h-4 animate-spin" /> signing out...</>
              : <><LogOut className="w-4 h-4" /> sign out</>
            }
          </Button>
        </div>

      </div>
    </div>
  );
}
