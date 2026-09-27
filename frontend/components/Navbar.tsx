"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Scale, User, Volume2, VolumeX, Sparkles, Box } from "lucide-react";
import { fetchHealth } from "@/lib/api";

export function Navbar() {
  const pathname = usePathname();
  const [memoriesCount, setMemoriesCount] = useState<number>(8);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    fetchHealth()
      .then((data) => {
        if (data.memories_synced) setMemoriesCount(data.memories_synced);
      })
      .catch(() => {});
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#2d3442] bg-[#0c1017]/95 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Brand with ChatDev Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-7 h-7 flex-shrink-0 rounded-lg overflow-hidden border border-amber-500/40 bg-slate-900">
            <Image
              src="/chatdev/figures/ceo.png"
              alt="Chief Justice"
              fill
              className="object-contain pixelated group-hover:scale-110 transition-transform"
            />
          </div>
          <div>
            <div className="font-mono text-xs font-black tracking-widest uppercase text-slate-100 flex items-center gap-1.5">
              <span>Courtroom Mode</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                3D High Chamber
              </span>
            </div>
            <div className="text-[10px] font-mono text-slate-400">
              Autonomous Judicial Arbiter
            </div>
          </div>
        </Link>

        {/* Center Nav */}
        <nav className="flex items-center gap-1.5 sm:gap-3">
          <Link
            href="/courtroom"
            className={`px-3 py-1.5 rounded-lg font-mono text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              pathname === "/courtroom"
                ? "bg-amber-500 text-slate-950 font-bold shadow-md"
                : "text-slate-300 hover:text-white hover:bg-[#1a2130]"
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>Chamber</span>
          </Link>

          <Link
            href="/profile"
            className={`px-3 py-1.5 rounded-lg font-mono text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              pathname === "/profile"
                ? "bg-amber-500 text-slate-950 font-bold shadow-md"
                : "text-slate-300 hover:text-white hover:bg-[#1a2130]"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile & Memories</span>
          </Link>
        </nav>

        {/* Right Status Indicator */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg bg-[#141824] border border-[#2d3442] font-mono text-[11px] text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Qdrant: {memoriesCount} Synced</span>
          </div>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-[#1a2130] transition-all border border-transparent hover:border-amber-500/20"
            title={soundEnabled ? "Audio FX Active" : "Audio FX Muted"}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-amber-400" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
