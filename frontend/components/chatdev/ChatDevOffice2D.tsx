"use client";
import React from "react";
import Image from "next/image";
import { AgentTurn } from "@/lib/types";

interface ChatDevOffice2DProps {
  activeTurnIndex: number;
  turns: AgentTurn[];
}

export function ChatDevOffice2D({ activeTurnIndex, turns }: ChatDevOffice2DProps) {
  const currentTurn = activeTurnIndex > 0 ? turns[activeTurnIndex - 1] : null;

  return (
    <div className="relative w-full h-[460px] sm:h-[520px] rounded-2xl overflow-hidden border border-[#2d3442] bg-[#141824] shadow-2xl flex items-center justify-center select-none">
      {/* Background Pixel-art Office Image from ChatDev */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src="/chatdev/figures/company.png"
          alt="ChatDev Virtual Office"
          fill
          className="object-cover pixelated opacity-90"
          priority
        />
        <div className="absolute inset-0 bg-slate-950/25" />
      </div>

      {/* Top Banner Tag */}
      <div className="absolute top-3 left-4 z-20 flex items-center gap-2 bg-[#121622]/90 border border-slate-700/60 px-3 py-1.5 rounded-lg font-mono text-[10px] text-slate-200 backdrop-blur">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>ChatDev Virtual Office Scene (2D Pixel-Art Mode)</span>
      </div>

      {/* Blinking Direction Arrows from ChatDev (left.png & right.png) */}
      {activeTurnIndex === 1 && (
        <div className="absolute top-[48%] left-[34%] z-30 animate-bounce">
          <Image
            src="/chatdev/figures/right.png"
            alt="Speaking to Skeptic"
            width={44}
            height={44}
            className="pixelated drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]"
          />
        </div>
      )}

      {activeTurnIndex === 2 && (
        <div className="absolute top-[48%] right-[34%] z-30 animate-bounce">
          <Image
            src="/chatdev/figures/left.png"
            alt="Rebutting Advocate"
            width={44}
            height={44}
            className="pixelated drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]"
          />
        </div>
      )}

      {/* Glowing Spotlight Rings & Badges anchored to characters in company.png */}
      {/* 1. Advocate (Counselor in Designing Lounge: left-[21%], top-[58%]) */}
      <div className="absolute top-[50%] left-[20%] z-20 flex flex-col items-center pointer-events-none">
        {activeTurnIndex === 1 && (
          <div className="w-20 h-20 rounded-full border-2 border-emerald-400 bg-emerald-500/20 shadow-[0_0_25px_rgba(16,185,129,0.8)] animate-pulse -mb-4" />
        )}
        <div
          className={`px-2 py-0.5 rounded font-mono text-[9px] font-bold uppercase tracking-wider transition-all duration-300 shadow-lg ${
            activeTurnIndex === 1
              ? "bg-emerald-950/90 border border-emerald-400 text-emerald-300 scale-110 shadow-emerald-500/50"
              : "bg-slate-950/75 border border-slate-700/60 text-slate-300"
          }`}
        >
          Advocate
        </div>
      </div>

      {/* 2. Chief Justice (CEO behind Center Curved Desk: left-[49.5%], top-[32%]) */}
      <div className="absolute top-[28%] left-[49.5%] -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none">
        {activeTurnIndex >= 3 && (
          <div className="w-24 h-24 rounded-full border-2 border-amber-400 bg-amber-500/25 shadow-[0_0_30px_rgba(245,158,11,0.9)] animate-pulse -mb-4" />
        )}
        <div
          className={`px-2.5 py-0.5 rounded font-mono text-[9px] font-bold uppercase tracking-widest transition-all duration-300 shadow-lg ${
            activeTurnIndex >= 3
              ? "bg-amber-950/90 border border-amber-400 text-amber-300 scale-115 shadow-amber-500/50"
              : "bg-slate-950/75 border border-slate-700/60 text-slate-300"
          }`}
        >
          Chief Justice
        </div>
      </div>

      {/* 3. Skeptic (Code Reviewer at Testing Round Table: right-[25%], top-[60%]) */}
      <div className="absolute top-[52%] right-[24%] z-20 flex flex-col items-center pointer-events-none">
        {activeTurnIndex === 2 && (
          <div className="w-20 h-20 rounded-full border-2 border-rose-400 bg-rose-500/20 shadow-[0_0_25px_rgba(244,63,94,0.8)] animate-pulse -mb-4" />
        )}
        <div
          className={`px-2 py-0.5 rounded font-mono text-[9px] font-bold uppercase tracking-wider transition-all duration-300 shadow-lg ${
            activeTurnIndex === 2
              ? "bg-rose-950/90 border border-rose-400 text-rose-300 scale-110 shadow-rose-500/50"
              : "bg-slate-950/75 border border-slate-700/60 text-slate-300"
          }`}
        >
          Skeptic
        </div>
      </div>

      {/* Active Dialogue Bubble Floating in 2D Space */}
      {currentTurn && (
        <div className="absolute bottom-4 left-6 right-6 sm:bottom-6 sm:left-auto sm:right-12 sm:max-w-md z-30 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <div className="rounded-xl border border-amber-500/50 bg-[#121622]/95 backdrop-blur-xl p-4 shadow-2xl font-mono text-xs text-slate-100">
            <div className="flex items-center justify-between pb-1 mb-2 border-b border-white/10 uppercase tracking-wider text-[10px] text-amber-400 font-bold">
              <span>{currentTurn.role.toUpperCase()} Speaking Now</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="font-sans text-xs sm:text-sm text-slate-200 leading-relaxed line-clamp-3">
              "{currentTurn.content}"
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
