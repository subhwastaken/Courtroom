"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Database, Box, Sparkles, Layers, Cpu, Mic } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="relative flex-1 flex flex-col items-center justify-center px-4 py-12 text-center overflow-hidden bg-[#0a0e17]">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-amber-500/10 via-cyan-500/10 to-indigo-500/10 blur-[130px] rounded-full pointer-events-none" />

      {/* ChatDev Title Banner */}
      <div className="relative w-72 sm:w-96 h-24 mb-3">
        <Image
          src="/chatdev/figures/title.png"
          alt="ChatDev"
          fill
          className="object-contain pixelated"
          priority
        />
      </div>

      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#141824] border border-amber-500/30 text-amber-400 font-mono text-xs uppercase tracking-widest mb-6 shadow-xl">
        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        <span>Courtroom Mode: Multi-Agent Personal Decision Arbiter</span>
      </div>

      {/* Main Headline */}
      <h1 className="max-w-3xl text-3xl sm:text-5xl font-black tracking-tight text-white uppercase leading-tight font-sans">
        AGENT COLLABORATION <br />
        <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 bg-clip-text text-transparent">
          IN THREE.JS & PIXEL ART
        </span>
      </h1>

      <p className="mt-4 max-w-2xl text-sm sm:text-base text-slate-300 font-sans leading-relaxed">
        Pits the <span className="text-emerald-400 font-bold">Counselor (Advocate)</span> and{" "}
        <span className="text-rose-400 font-bold">Code Reviewer (Skeptic)</span> against each other before the{" "}
        <span className="text-amber-400 font-bold">CEO (Chief Justice)</span>, deliberating in an interactive 3D Three.js diorama and pixel-art office using your actual values, regrets, and vector memories.
      </p>

      {/* CTA Buttons */}
      <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 z-10 font-mono text-xs uppercase tracking-wider">
        <Link
          href="/courtroom"
          className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/25 hover:brightness-110 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
        >
          <Box className="w-4 h-4 text-slate-950" />
          <span>Launch 3D Chamber</span>
          <ArrowRight className="w-4 h-4 text-slate-950" />
        </Link>

        <Link
          href="/profile"
          className="px-6 py-3.5 rounded-xl bg-[#141824] border border-[#2d3442] text-slate-200 hover:border-amber-500/50 hover:text-amber-300 transition-all flex items-center gap-2"
        >
          <Database className="w-4 h-4 text-amber-400" />
          <span>Inspect Living Profile</span>
        </Link>
      </div>

      {/* 3 Pixel Characters Showcase from ChatDev */}
      <div className="mt-14 w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-5 text-left z-10">
        {/* Counselor / Advocate */}
        <div className="rounded-xl border border-emerald-500/30 bg-[#121622]/90 backdrop-blur-xl p-5 hover:border-emerald-400/60 transition-all group">
          <div className="flex items-center gap-3 mb-3">
            <div className="relative w-12 h-14 flex-shrink-0">
              <Image
                src="/chatdev/figures/counselor.png?v=3"
                alt="Counselor"
                fill
                className="object-contain pixelated group-hover:scale-110 transition-transform"
              />
            </div>
            <div>
              <div className="text-xs uppercase font-mono tracking-widest font-bold text-emerald-400">
                The Advocate
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                Counsel for Opportunity
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            Builds the aggressive case FOR action. Cites your core values and past regrets of inaction. Quotes your own history as evidence.
          </p>
        </div>

        {/* CEO / Chief Justice */}
        <div className="rounded-xl border border-amber-500/40 bg-[#121622]/90 backdrop-blur-xl p-5 hover:border-amber-400/70 transition-all group shadow-glow-amber/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="relative w-12 h-14 flex-shrink-0">
              <Image
                src="/chatdev/figures/ceo.png?v=3"
                alt="CEO"
                fill
                className="object-contain pixelated group-hover:scale-110 transition-transform"
              />
            </div>
            <div>
              <div className="text-xs uppercase font-mono tracking-widest font-bold text-amber-400">
                The Chief Justice
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                Arbiter of History
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            Weighs both arguments against your living profile in <code className="text-amber-300 font-mono">user.md</code>. Strikes the gavel and issues a definitive personal verdict.
          </p>
        </div>

        {/* Code Reviewer / Skeptic */}
        <div className="rounded-xl border border-rose-500/30 bg-[#121622]/90 backdrop-blur-xl p-5 hover:border-rose-400/60 transition-all group">
          <div className="flex items-center gap-3 mb-3">
            <div className="relative w-12 h-14 flex-shrink-0">
              <Image
                src="/chatdev/figures/reviewer.png?v=3"
                alt="Code Reviewer"
                fill
                className="object-contain pixelated group-hover:scale-110 transition-transform"
              />
            </div>
            <div>
              <div className="text-xs uppercase font-mono tracking-widest font-bold text-rose-400">
                The Skeptic
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                Counsel for Caution
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            Builds the counter-case. Directly rebuts the Advocate. Quotes past boundaries and hard-learned lessons about stress and balance.
          </p>
        </div>
      </div>

      {/* Tech Stack Pillars */}
      <div className="mt-12 pt-6 border-t border-slate-800/80 w-full max-w-4xl flex flex-wrap items-center justify-around gap-6 text-slate-400 font-mono text-xs">
        <div className="flex items-center gap-2">
          <Box className="w-4 h-4 text-amber-400" />
          <span>Three.js 3D Engine</span>
        </div>
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span>ChatDev Pixel Art Assets</span>
        </div>
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-emerald-400" />
          <span>Lyzr Multi-Agent Deliberation</span>
        </div>
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-violet-400" />
          <span>Qdrant Vector Retrieval</span>
        </div>
      </div>
    </div>
  );
}
