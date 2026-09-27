"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Scale, User, Box, Sparkles, Terminal, Flame } from "lucide-react";
import { fetchHealth } from "@/lib/api";

export function Navbar() {
  const pathname = usePathname();
  const [memoriesCount, setMemoriesCount] = useState<number>(12);

  useEffect(() => {
    fetchHealth()
      .then((data) => {
        if (data.memories_synced) setMemoriesCount(data.memories_synced);
      })
      .catch(() => {});
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 w-full border-b-4 border-black bg-[#0e131f] shadow-[0_4px_0px_#000]">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Brand with Neo-Brutalist Pixel Badge */}
        <Link href="/" className="flex items-center gap-3 group select-none">
          <div className="w-10 h-10 bg-neo-yellow border-3 border-black flex items-center justify-center shadow-[3px_3px_0px_#000] group-hover:translate-x-[-1px] group-hover:translate-y-[-1px] group-hover:shadow-[4px_4px_0px_#000] transition-all">
            <Scale className="w-6 h-6 text-black stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-pixel text-xs sm:text-sm font-black tracking-wider text-white uppercase drop-shadow-[2px_2px_0px_#000]">
                COURTROOM
              </span>
              <span className="hidden sm:inline-block font-mono text-[9px] font-black uppercase px-1.5 py-0.2 bg-neo-green text-black border-2 border-black shadow-[2px_2px_0px_#000] -rotate-2">
                16-BIT BENCH
              </span>
            </div>
            <div className="font-mono text-[10px] text-amber-200/60 uppercase tracking-widest hidden sm:block">
              Autonomous Life-Decision Engine
            </div>
          </div>
        </Link>

        {/* Center Nav: Chunky Neo-brutalist Pills */}
        <nav className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/courtroom"
            className={`px-3 sm:px-4 py-1.5 font-mono text-xs uppercase tracking-wider font-bold transition-all border-2 border-black flex items-center gap-1.5 ${
              pathname === "/courtroom"
                ? "bg-neo-yellow text-black shadow-[3px_3px_0px_#000] translate-x-[-1px] translate-y-[-1px]"
                : "bg-[#182030] text-slate-200 shadow-[2px_2px_0px_#000] hover:bg-[#202b40] hover:text-white"
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Chamber</span>
          </Link>

          <Link
            href="/profile"
            className={`px-3 sm:px-4 py-1.5 font-mono text-xs uppercase tracking-wider font-bold transition-all border-2 border-black flex items-center gap-1.5 ${
              pathname === "/profile"
                ? "bg-neo-green text-black shadow-[3px_3px_0px_#000] translate-x-[-1px] translate-y-[-1px]"
                : "bg-[#182030] text-slate-200 shadow-[2px_2px_0px_#000] hover:bg-[#202b40] hover:text-white"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Living</span>
            <span>Dossier</span>
          </Link>
        </nav>

        {/* Right Status Indicator: Neo-brutalist Memory Pill */}
        <div className="flex items-center gap-2.5">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[#141a27] border-2 border-black shadow-[3px_3px_0px_#000] text-slate-200 font-mono text-xs">
            <span className="w-2.5 h-2.5 bg-neo-green border border-black animate-pulse" />
            <span className="font-bold text-white">{memoriesCount}</span>
            <span className="text-slate-400 text-[11px]">Memories</span>
          </div>

          <Link
            href="/courtroom"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-neo-yellow text-black font-mono font-bold text-xs uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#000] transition-all"
          >
            <Flame className="w-3.5 h-3.5 fill-black" />
            <span>Try Dilemma</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
