"use client";
import React from "react";
import Image from "next/image";
import { AgentTurn } from "@/lib/types";
import { Scale, ShieldAlert, Award, Sparkles } from "lucide-react";

interface ChatDevOffice2DProps {
  activeTurnIndex: number;
  turns: AgentTurn[];
}

export function ChatDevOffice2D({ activeTurnIndex, turns }: ChatDevOffice2DProps) {
  const currentTurn = activeTurnIndex > 0 ? turns[activeTurnIndex - 1] : null;

  return (
    <div className="relative w-full h-[500px] sm:h-[560px] rounded-2xl overflow-hidden border border-[#3a2012] bg-[#0d0907] shadow-2xl flex items-center justify-center select-none">
      {/* Courtroom Architectural Floor Plan Background */}
      <div className="absolute inset-0 w-full h-full bg-[radial-gradient(circle_at_50%_30%,#20120a_0%,#0c0806_100%)]">
        {/* Parquet Floor Grid Lines */}
        <div className="absolute inset-0 opacity-15 bg-[linear-gradient(to_right,#d4af37_1px,transparent_1px),linear-gradient(to_bottom,#d4af37_1px,transparent_1px)] bg-[size:48px_48px]" />

        {/* Central Crimson & Gold Judicial Runner */}
        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-32 bg-[#4a0d14] border-x-2 border-[#d4af37]/60 shadow-[0_0_35px_rgba(74,13,20,0.8)]" />

        {/* Wall Molding at Top */}
        <div className="absolute top-0 left-0 right-0 h-28 bg-[#1a0e07] border-b-4 border-[#3d2112] flex items-center justify-center">
          {/* Scales of Justice Wall Emblem */}
          <div className="flex flex-col items-center gap-1 opacity-80">
            <Scale className="w-8 h-8 text-[#d4af37] drop-shadow-[0_0_10px_rgba(212,175,55,0.6)]" />
            <span className="font-mono text-[9px] uppercase tracking-widest text-[#d4af37]">
              High Court of Personal Conscience
            </span>
          </div>
        </div>

        {/* The Judicial Bar (Rail dividing Well from Gallery) */}
        <div className="absolute bottom-24 left-8 right-8 h-3 bg-[#331c10] border-y border-[#522d1a] flex items-center justify-center">
          <div className="w-20 h-4 bg-[#1a0e07] border border-[#d4af37]/40 -translate-y-0.5 rounded-sm flex items-center justify-center font-mono text-[7px] text-[#d4af37]/80 uppercase tracking-widest">
            Bar Gate
          </div>
        </div>

        {/* Spectator Gallery Benches in Rear */}
        <div className="absolute bottom-8 left-12 right-12 flex justify-between gap-12 opacity-60">
          <div className="flex-1 h-8 rounded bg-[#1e1008] border border-[#3d2112] flex items-center justify-center font-mono text-[9px] text-amber-200/40">
            Spectator Gallery
          </div>
          <div className="flex-1 h-8 rounded bg-[#1e1008] border border-[#3d2112] flex items-center justify-center font-mono text-[9px] text-amber-200/40">
            Spectator Gallery
          </div>
        </div>
      </div>

      {/* Top Banner Tag */}
      <div className="absolute top-3 left-4 z-20 flex items-center gap-2 bg-[#170e08]/90 border border-[#4a2a16] px-3 py-1.5 rounded-lg font-mono text-[10px] text-amber-200 backdrop-blur">
        <Scale className="w-3.5 h-3.5 text-amber-400" />
        <span>Courtroom Chamber (Architectural 2D Plan)</span>
      </div>

      {/* 1. CHIEF JUSTICE BENCH (Top Center) */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
        {/* Dais Aura */}
        {activeTurnIndex >= 3 && (
          <div className="w-36 h-28 rounded-2xl border-2 border-amber-400 bg-amber-500/25 shadow-[0_0_35px_rgba(245,158,11,0.9)] animate-pulse -mb-16" />
        )}
        {/* Bench Desk Box */}
        <div className="w-44 h-16 rounded-xl bg-[#2e190e] border-2 border-[#5c321c] shadow-2xl flex flex-col items-center justify-center relative">
          <div className="absolute -top-3 w-16 h-4 rounded bg-[#d4af37] text-slate-950 font-mono font-bold text-[8px] flex items-center justify-center tracking-widest shadow-md">
            HIGH BENCH
          </div>
          <div className="relative w-12 h-14 -mt-2">
            <Image
              src="/chatdev/figures/ceo.png?v=4"
              alt="Chief Justice"
              fill
              className="object-contain pixelated"
            />
          </div>
        </div>
        <div
          className={`mt-2 px-3 py-0.5 rounded font-mono text-[9px] font-bold uppercase tracking-widest transition-all duration-300 shadow-lg ${
            activeTurnIndex >= 3
              ? "bg-amber-950/95 border border-amber-400 text-amber-300 scale-110 shadow-amber-500/50"
              : "bg-[#170e08]/90 border border-[#4a2a16] text-amber-200/70"
          }`}
        >
          Chief Justice
        </div>
      </div>

      {/* 2. THE ADVOCATE BAR (Left Counsel Table) */}
      <div className="absolute top-52 left-[15%] z-20 flex flex-col items-center">
        {activeTurnIndex === 1 && (
          <div className="w-32 h-32 rounded-full border-2 border-emerald-400 bg-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.8)] animate-pulse -mb-12" />
        )}
        {/* Counsel Table Box */}
        <div className="w-36 h-20 rounded-xl bg-[#2b170c] border-2 border-[#4d2a16] shadow-xl flex flex-col items-center justify-center relative">
          <div className="absolute -top-2.5 px-2 py-0.5 rounded bg-emerald-950 border border-emerald-400 text-emerald-300 font-mono text-[8px] font-bold tracking-wider">
            OPPORTUNITY BAR
          </div>
          <div className="relative w-14 h-16 -mt-1">
            <Image
              src="/chatdev/figures/counselor.png?v=4"
              alt="The Advocate"
              fill
              className="object-contain pixelated"
            />
          </div>
        </div>
        <div
          className={`mt-2 px-2.5 py-0.5 rounded font-mono text-[9px] font-bold uppercase tracking-wider transition-all duration-300 shadow-lg ${
            activeTurnIndex === 1
              ? "bg-emerald-950/95 border border-emerald-400 text-emerald-300 scale-110 shadow-emerald-500/50"
              : "bg-[#170e08]/90 border border-[#4a2a16] text-slate-300"
          }`}
        >
          The Advocate
        </div>
      </div>

      {/* 3. THE SKEPTIC BAR (Right Counsel Table) */}
      <div className="absolute top-52 right-[15%] z-20 flex flex-col items-center">
        {activeTurnIndex === 2 && (
          <div className="w-32 h-32 rounded-full border-2 border-rose-400 bg-rose-500/20 shadow-[0_0_30px_rgba(244,63,94,0.8)] animate-pulse -mb-12" />
        )}
        {/* Counsel Table Box */}
        <div className="w-36 h-20 rounded-xl bg-[#2b170c] border-2 border-[#4d2a16] shadow-xl flex flex-col items-center justify-center relative">
          <div className="absolute -top-2.5 px-2 py-0.5 rounded bg-rose-950 border border-rose-400 text-rose-300 font-mono text-[8px] font-bold tracking-wider">
            CAUTION BAR
          </div>
          <div className="relative w-14 h-16 -mt-1">
            <Image
              src="/chatdev/figures/reviewer.png?v=4"
              alt="The Skeptic"
              fill
              className="object-contain pixelated"
            />
          </div>
        </div>
        <div
          className={`mt-2 px-2.5 py-0.5 rounded font-mono text-[9px] font-bold uppercase tracking-wider transition-all duration-300 shadow-lg ${
            activeTurnIndex === 2
              ? "bg-rose-950/95 border border-rose-400 text-rose-300 scale-110 shadow-rose-500/50"
              : "bg-[#170e08]/90 border border-[#4a2a16] text-slate-300"
          }`}
        >
          The Skeptic
        </div>
      </div>

      {/* Center Evidence Podium */}
      <div className="absolute top-[48%] left-1/2 -translate-x-1/2 z-10 flex flex-col items-center opacity-70">
        <div className="w-14 h-12 rounded-lg bg-[#24130a] border border-[#d4af37]/40 flex items-center justify-center">
          <Scale className="w-5 h-5 text-[#d4af37]/80" />
        </div>
        <span className="font-mono text-[8px] text-[#d4af37]/60 mt-1 uppercase tracking-widest">
          Evidence Box
        </span>
      </div>

      {/* Blinking Direction Arrows between Counsel Tables */}
      {activeTurnIndex === 1 && (
        <div className="absolute top-[55%] left-[34%] z-30 animate-bounce">
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
        <div className="absolute top-[55%] right-[34%] z-30 animate-bounce">
          <Image
            src="/chatdev/figures/left.png"
            alt="Rebutting Advocate"
            width={44}
            height={44}
            className="pixelated drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]"
          />
        </div>
      )}

      {/* Active Dialogue Floating Decree */}
      {currentTurn && (
        <div className="absolute bottom-4 left-6 right-6 sm:bottom-6 sm:left-auto sm:right-8 sm:max-w-md z-30 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <div
            className={`rounded-xl border p-4 shadow-2xl font-mono text-xs backdrop-blur-xl ${
              currentTurn.role === "advocate"
                ? "bg-[#0b1b17]/95 border-emerald-500/70 text-emerald-200"
                : currentTurn.role === "skeptic"
                ? "bg-[#1f0f14]/95 border-rose-500/70 text-rose-200"
                : "bg-[#231508]/95 border-amber-500/80 text-amber-200"
            }`}
          >
            <div className="flex items-center justify-between pb-1 mb-2 border-b border-white/10 uppercase tracking-wider text-[10px] font-bold">
              <span>{currentTurn.role.toUpperCase()} Delivering Stance</span>
              <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
            </div>
            <p className="font-sans text-xs sm:text-sm text-slate-100 leading-relaxed line-clamp-3">
              "{currentTurn.content}"
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
