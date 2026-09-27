"use client";
import React, { useState } from "react";
import Link from "next/link";
import {
  Scale,
  Gavel,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Database,
  Flame,
  Layers,
  ChevronRight,
  BookOpen,
  CheckCircle2,
  Terminal,
  Volume2
} from "lucide-react";

export default function LandingPage() {
  const [previewMode, setPreviewMode] = useState<"chamber" | "rpg">("chamber");
  const [activeSpeaker, setActiveSpeaker] = useState<"advocate" | "judge" | "skeptic">("advocate");

  return (
    <div className="relative flex-1 flex flex-col items-center overflow-x-hidden bg-[#120907] text-[#FFF8E7] select-none pb-20">
      <style jsx global>{`
        @keyframes marqueeScroll {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        @keyframes stickerFloat {
          0%, 100% { transform: translateY(0) rotate(-2deg); }
          50% { transform: translateY(-4px) rotate(-1deg); }
        }
        @keyframes pixelPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.03); }
        }
      `}</style>

      {/* ──────────────────────────────────────────────────────────
       *  TOP NEO-BRUTALIST TICKER MARQUEE
       * ────────────────────────────────────────────────────────── */}
      <div className="w-full bg-neo-yellow border-b-4 border-black text-black py-2.5 overflow-hidden whitespace-nowrap shadow-[0_4px_0px_#000] z-20 font-mono text-xs sm:text-sm font-black uppercase tracking-widest">
        <div className="inline-block animate-[marqueeScroll_20s_linear_infinite]">
          <span className="mx-4">⚡ COURT IN SESSION ⚡</span>
          <span className="mx-4">⚖️ ADVERSARIAL TRIAL FOR PERSONAL CHOICES</span>
          <span className="mx-4">✦ 16-BIT RETRO BENCH</span>
          <span className="mx-4">🎮 2D POKÉMON RPG CHAMBER PLAN</span>
          <span className="mx-4">📜 GROUNDED IN YOUR ACTUAL LIVING MEMORIES</span>
          <span className="mx-4">👨‍⚖️ 2 LAWYERS & 1 JUDGE</span>
          <span className="mx-4">⚡ OBJECTION! BINDING PRECEDENT</span>
          <span className="mx-4">⚡ COURT IN SESSION ⚡</span>
          <span className="mx-4">⚖️ ADVERSARIAL TRIAL FOR PERSONAL CHOICES</span>
          <span className="mx-4">✦ 16-BIT RETRO BENCH</span>
          <span className="mx-4">🎮 2D POKÉMON RPG CHAMBER PLAN</span>
          <span className="mx-4">📜 GROUNDED IN YOUR ACTUAL LIVING MEMORIES</span>
          <span className="mx-4">👨‍⚖️ 2 LAWYERS & 1 JUDGE</span>
          <span className="mx-4">⚡ OBJECTION! BINDING PRECEDENT</span>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────
       *  HERO SECTION (PIXEL NEO-BRUTALIST)
       * ────────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 pt-12 sm:pt-16 pb-12 flex flex-col items-center text-center z-10 w-full">
        {/* Top Badges & Stickers */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
          <div className="bg-neo-yellow text-black border-3 border-black px-3.5 py-1 text-[11px] font-mono font-black uppercase tracking-wider shadow-[3px_3px_0px_#000] animate-[stickerFloat_3s_infinite_ease-in-out]">
            ⚖️ VERDICT ARBITER v2.0
          </div>
          <div className="bg-[#26150F] text-neo-green border-3 border-black px-3 py-1 text-[11px] font-mono font-bold uppercase tracking-wider shadow-[3px_3px_0px_#000]">
            ● 12 VECTOR MEMORIES SYNCED
          </div>
          <div className="bg-neo-red text-white border-3 border-black px-3 py-1 text-[11px] font-mono font-bold uppercase tracking-wider shadow-[3px_3px_0px_#000] rotate-1">
            ⚡ 100% UNBIASED CLASH
          </div>
        </div>

        {/* Big Neo-Brutalist Headline */}
        <h1 className="max-w-4xl font-sans font-black text-4xl sm:text-6xl md:text-7xl uppercase tracking-tight text-white leading-[1.08] mb-6">
          YOUR LIFE DECISIONS. <br className="hidden sm:inline" />
          <span className="relative inline-block mt-2 sm:mt-1">
            <span className="bg-neo-yellow text-black px-4 py-1.5 border-4 border-black shadow-[6px_6px_0px_#000] inline-block -rotate-1 font-pixel text-xl sm:text-3xl md:text-4xl">
              PUT ON TRIAL.
            </span>
          </span>
        </h1>

        {/* Subtitle Card */}
        <div className="max-w-2xl bg-[#1C100B] border-3 border-black p-5 shadow-[6px_6px_0px_#000] mb-8 text-left sm:text-center">
          <p className="font-mono text-xs sm:text-sm text-[#FFF8E7] leading-relaxed">
            Stop agonizing in circles. Submit your toughest dilemma to the{" "}
            <span className="text-neo-yellow font-bold">Chamber of Personal Conscience</span>.
            Watch the <span className="text-neo-green font-bold">Advocate</span> and{" "}
            <span className="text-neo-red font-bold">Skeptic</span> fiercely cross-examine your case using your actual values, regrets, and vector memories before the{" "}
            <span className="text-neo-yellow font-bold">Chief Justice</span> slams the gavel with a binding verdict.
          </p>
        </div>

        {/* Tactile Neo-Brutalist CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 font-mono text-xs sm:text-sm uppercase font-black tracking-wider">
          <Link
            href="/courtroom"
            className="neo-btn bg-neo-yellow text-black px-8 py-4 flex items-center gap-3 text-sm sm:text-base border-3 border-black shadow-[6px_6px_0px_#000] hover:bg-amber-300 active:translate-x-[2px] active:translate-y-[2px]"
          >
            <Scale className="w-5 h-5 stroke-[2.5]" />
            <span>Enter Courtroom Chamber</span>
            <ArrowRight className="w-5 h-5 stroke-[2.5]" />
          </Link>

          <Link
            href="/profile"
            className="neo-btn bg-[#26150F] text-[#FFF8E7] px-6 py-4 flex items-center gap-2.5 border-3 border-black shadow-[6px_6px_0px_#000] hover:bg-[#382017] active:translate-x-[2px] active:translate-y-[2px]"
          >
            <Database className="w-4 h-4 text-neo-green" />
            <span>Inspect Living Dossier</span>
          </Link>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
       *  INTERACTIVE COURTROOM PREVIEW (THE HERO VISUAL STAGE)
       * ────────────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 w-full mb-20 z-10">
        <div className="bg-[#180d09] border-4 border-black shadow-[10px_10px_0px_#000] rounded-none overflow-hidden">
          {/* Window Title Bar */}
          <div className="bg-neo-yellow border-b-4 border-black px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-black">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 bg-neo-red border-2 border-black inline-block" />
              <span className="w-3.5 h-3.5 bg-black inline-block" />
              <span className="w-3.5 h-3.5 bg-neo-green border-2 border-black inline-block" />
              <span className="font-pixel text-[11px] sm:text-xs font-black uppercase tracking-wider ml-2">
                COURT_CHAMBER_DISPLAY.EXE
              </span>
            </div>

            {/* View Mode Tabs */}
            <div className="flex items-center gap-1.5 font-mono text-[11px] font-black uppercase">
              <button
                onClick={() => setPreviewMode("chamber")}
                className={`px-3 py-1 border-2 border-black transition-all ${
                  previewMode === "chamber"
                    ? "bg-black text-neo-yellow shadow-[2px_2px_0px_#000]"
                    : "bg-white text-black hover:bg-neo-yellow"
                }`}
              >
                16-Bit Front Chamber
              </button>
              <button
                onClick={() => setPreviewMode("rpg")}
                className={`px-3 py-1 border-2 border-black transition-all ${
                  previewMode === "rpg"
                    ? "bg-black text-neo-green shadow-[2px_2px_0px_#000]"
                    : "bg-white text-black hover:bg-neo-green"
                }`}
              >
                2D Nintendo RPG Map
              </button>
            </div>
          </div>

          {/* Main Visual Display */}
          <div className="relative aspect-video w-full bg-black overflow-hidden group">
            {previewMode === "chamber" ? (
              <img
                src="/courtroom_pixel_reference.jpg"
                alt="16-Bit Pixel Courtroom"
                className="w-full h-full object-cover pixelated"
              />
            ) : (
              <img
                src="/courtroom_2d_rpg_plan.jpg"
                alt="2D Nintendo RPG Courtroom Map"
                className="w-full h-full object-cover pixelated"
              />
            )}

            {/* Interactive Preview Dialogue Overlay */}
            <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 bg-[#180d09]/95 border-2 sm:border-3 border-black shadow-[4px_4px_0px_#000] p-2.5 sm:p-3 backdrop-blur flex items-start gap-2.5 sm:gap-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 border-2 border-black overflow-hidden bg-black flex-shrink-0 shadow-[2px_2px_0px_#000]">
                <img
                  src={
                    activeSpeaker === "advocate"
                      ? "/pixel_advocate_portrait.jpg"
                      : activeSpeaker === "skeptic"
                      ? "/pixel_skeptic_portrait.jpg"
                      : "/pixel_judge_portrait.jpg"
                  }
                  alt="Speaker Portrait"
                  className="w-full h-full object-cover"
                  style={{ imageRendering: "pixelated" }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-pixel text-[10px] px-2 py-0.5 border-2 border-black font-black uppercase ${
                        activeSpeaker === "advocate"
                          ? "bg-neo-green text-black"
                          : activeSpeaker === "skeptic"
                          ? "bg-neo-red text-white"
                          : "bg-neo-yellow text-black"
                      }`}
                    >
                      {activeSpeaker === "advocate"
                        ? "THE ADVOCATE"
                        : activeSpeaker === "skeptic"
                        ? "THE SKEPTIC"
                        : "THE CHIEF JUSTICE"}
                    </span>
                    <span className="font-mono text-[10px] text-[#FFE885] uppercase hidden sm:inline font-bold">
                      {activeSpeaker === "advocate"
                        ? "Counsel for Opportunity"
                        : activeSpeaker === "skeptic"
                        ? "Counsel for Caution"
                        : "Supreme Verdict"}
                    </span>
                  </div>

                  {/* Speaker Switcher Pills */}
                  <div className="flex items-center gap-1 font-mono text-[9px] font-bold uppercase">
                    <button
                      onClick={() => setActiveSpeaker("advocate")}
                      className={`px-2 py-0.5 border border-black ${
                        activeSpeaker === "advocate"
                          ? "bg-neo-green text-black"
                          : "bg-[#26150F] text-[#FFF8E7] hover:bg-neo-green hover:text-black"
                      }`}
                    >
                      Advocate
                    </button>
                    <button
                      onClick={() => setActiveSpeaker("skeptic")}
                      className={`px-2 py-0.5 border border-black ${
                        activeSpeaker === "skeptic"
                          ? "bg-neo-red text-white"
                          : "bg-[#26150F] text-[#FFF8E7] hover:bg-neo-red hover:text-white"
                      }`}
                    >
                      Skeptic
                    </button>
                    <button
                      onClick={() => setActiveSpeaker("judge")}
                      className={`px-2 py-0.5 border border-black ${
                        activeSpeaker === "judge"
                          ? "bg-neo-yellow text-black"
                          : "bg-[#26150F] text-[#FFF8E7] hover:bg-neo-yellow hover:text-black"
                      }`}
                    >
                      Judge
                    </button>
                  </div>
                </div>

                <p className="font-sans text-xs sm:text-sm text-[#FFF8E7] leading-relaxed italic">
                  {activeSpeaker === "advocate" &&
                    "“Inaction is the greatest liability. Citing your early startup memories, every major leap was preceded by fear. We move to take the offer!”"}
                  {activeSpeaker === "skeptic" &&
                    "“Objection! The Advocate willfully ignores the runway crisis from 2022. Without a 12-month financial cushion, this leap invites catastrophic burnout!”"}
                  {activeSpeaker === "judge" &&
                    "“Order in the court. The bench has examined the evidence in user.md. Judgment is rendered: Proceed with caution, provided milestone gates are met.”"}
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Action Footer */}
          <div className="bg-[#1C100B] border-t-4 border-black px-4 py-3 flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
            <div className="flex items-center gap-2 text-[#FFE885]">
              <span className="w-2.5 h-2.5 bg-neo-green border border-black inline-block animate-pulse" />
              <span className="font-bold">Interactive 16-Bit Engine • Built with Web Audio & Vector Memory</span>
            </div>
            <Link
              href="/courtroom"
              className="neo-btn bg-neo-green text-black font-black px-4 py-1.5 border-2 border-black shadow-[3px_3px_0px_#000] flex items-center gap-1.5 uppercase tracking-wider text-[11px]"
            >
              <span>Try Live in Chamber</span>
              <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </Link>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
       *  3 NEO-BRUTALIST AGENT DOSSIER CARDS (16-BIT RETRO PORTRAITS)
       * ────────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 w-full mb-20 z-10">
        <div className="text-center mb-10">
          <div className="inline-block bg-neo-yellow text-black border-3 border-black px-3.5 py-1 text-xs font-mono font-black uppercase tracking-widest shadow-[3px_3px_0px_#000] -rotate-1 mb-3">
            ⚖️ THE THREE TRIBUNAL AGENTS
          </div>
          <h2 className="font-sans text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
            MEET YOUR PERSONAL COURT
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 1. THE ADVOCATE */}
          <div className="bg-[#1C100B] border-4 border-black shadow-[8px_8px_0px_#000] p-6 flex flex-col justify-between group hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all">
            <div>
              <div className="flex items-center justify-between border-b-3 border-black pb-4 mb-4">
                <div className="bg-neo-green text-black font-pixel text-[10px] px-2.5 py-1 border-2 border-black font-black uppercase shadow-[2px_2px_0px_#000]">
                  THE ADVOCATE
                </div>
                <div className="font-mono text-[10px] font-bold text-neo-green uppercase">
                  Aggressive Action
                </div>
              </div>

              {/* Pixel Avatar Box */}
              <div className="w-28 h-28 mx-auto border-3 border-black overflow-hidden bg-black shadow-[4px_4px_0px_#000] mb-5">
                <img
                  src="/pixel_advocate_portrait.jpg"
                  alt="The Advocate"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  style={{ imageRendering: "pixelated" }}
                />
              </div>

              <div className="font-mono text-xs uppercase font-bold text-neo-green mb-1">
                Counsel for Opportunity
              </div>
              <p className="font-sans text-xs text-[#FFF8E7] leading-relaxed mb-4">
                Builds the offensive case FOR growth, risk, and career leaps. Scours your memory archive for past moments where hesitation cost you valuable momentum.
              </p>

              {/* Neo-brutalist Stat Bars */}
              <div className="space-y-2 font-mono text-[10px] uppercase font-bold border-t-2 border-black pt-3">
                <div className="flex justify-between text-[#FFE885]">
                  <span>Growth Bias</span>
                  <span className="text-neo-green">98%</span>
                </div>
                <div className="w-full h-2.5 bg-black border border-black p-0.5">
                  <div className="h-full bg-neo-green w-[98%]" />
                </div>
                <div className="flex justify-between text-[#FFE885]">
                  <span>Precedent Recall</span>
                  <span className="text-neo-green">92%</span>
                </div>
                <div className="w-full h-2.5 bg-black border border-black p-0.5">
                  <div className="h-full bg-neo-green w-[92%]" />
                </div>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t-2 border-black/40 font-mono text-[10px] text-neo-green font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Quotes your core values as evidence</span>
            </div>
          </div>

          {/* 2. THE CHIEF JUSTICE */}
          <div className="bg-[#1C100B] border-4 border-black shadow-[8px_8px_0px_#000] p-6 flex flex-col justify-between group hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all">
            <div>
              <div className="flex items-center justify-between border-b-3 border-black pb-4 mb-4">
                <div className="bg-neo-yellow text-black font-pixel text-[10px] px-2.5 py-1 border-2 border-black font-black uppercase shadow-[2px_2px_0px_#000]">
                  CHIEF JUSTICE
                </div>
                <div className="font-mono text-[10px] font-bold text-neo-yellow uppercase">
                  Supreme Ruling
                </div>
              </div>

              {/* Pixel Avatar Box */}
              <div className="w-28 h-28 mx-auto border-3 border-black overflow-hidden bg-black shadow-[4px_4px_0px_#000] mb-5">
                <img
                  src="/pixel_judge_portrait.jpg"
                  alt="Chief Justice"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  style={{ imageRendering: "pixelated" }}
                />
              </div>

              <div className="font-mono text-xs uppercase font-bold text-neo-yellow mb-1">
                Supreme Arbiter of History
              </div>
              <p className="font-sans text-xs text-[#FFF8E7] leading-relaxed mb-4">
                Weighs the passionate debate against your complete personal profile in <code className="text-neo-yellow font-mono">user.md</code>. Slams the gavel to issue a binding, clear verdict.
              </p>

              {/* Neo-brutalist Stat Bars */}
              <div className="space-y-2 font-mono text-[10px] uppercase font-bold border-t-2 border-black pt-3">
                <div className="flex justify-between text-[#FFE885]">
                  <span>Impartiality</span>
                  <span className="text-neo-yellow">100%</span>
                </div>
                <div className="w-full h-2.5 bg-black border border-black p-0.5">
                  <div className="h-full bg-neo-yellow w-[100%]" />
                </div>
                <div className="flex justify-between text-[#FFE885]">
                  <span>Gavel Authority</span>
                  <span className="text-neo-yellow">MAX</span>
                </div>
                <div className="w-full h-2.5 bg-black border border-black p-0.5">
                  <div className="h-full bg-neo-yellow w-[100%]" />
                </div>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t-2 border-black/40 font-mono text-[10px] text-neo-yellow font-bold flex items-center gap-1.5">
              <Gavel className="w-3.5 h-3.5" />
              <span>Delivers definitive life rulings</span>
            </div>
          </div>

          {/* 3. THE SKEPTIC */}
          <div className="bg-[#1C100B] border-4 border-black shadow-[8px_8px_0px_#000] p-6 flex flex-col justify-between group hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all">
            <div>
              <div className="flex items-center justify-between border-b-3 border-black pb-4 mb-4">
                <div className="bg-neo-red text-white font-pixel text-[10px] px-2.5 py-1 border-2 border-black font-black uppercase shadow-[2px_2px_0px_#000]">
                  THE SKEPTIC
                </div>
                <div className="font-mono text-[10px] font-bold text-neo-red uppercase">
                  Risk Defense
                </div>
              </div>

              {/* Pixel Avatar Box */}
              <div className="w-28 h-28 mx-auto border-3 border-black overflow-hidden bg-black shadow-[4px_4px_0px_#000] mb-5">
                <img
                  src="/pixel_skeptic_portrait.jpg"
                  alt="The Skeptic"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  style={{ imageRendering: "pixelated" }}
                />
              </div>

              <div className="font-mono text-xs uppercase font-bold text-neo-red mb-1">
                Counsel for Caution
              </div>
              <p className="font-sans text-xs text-[#FFF8E7] leading-relaxed mb-4">
                Fiercely objects to impulsive moves. Protects your financial runway, mental stability, and boundaries by recalling past failures caused by rushing in unprepared.
              </p>

              {/* Neo-brutalist Stat Bars */}
              <div className="space-y-2 font-mono text-[10px] uppercase font-bold border-t-2 border-black pt-3">
                <div className="flex justify-between text-[#FFE885]">
                  <span>Critical Scrutiny</span>
                  <span className="text-neo-red">96%</span>
                </div>
                <div className="w-full h-2.5 bg-black border border-black p-0.5">
                  <div className="h-full bg-neo-red w-[96%]" />
                </div>
                <div className="flex justify-between text-[#FFE885]">
                  <span>Burnout Shield</span>
                  <span className="text-neo-red">99%</span>
                </div>
                <div className="w-full h-2.5 bg-black border border-black p-0.5">
                  <div className="h-full bg-neo-red w-[99%]" />
                </div>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t-2 border-black/40 font-mono text-[10px] text-neo-red font-bold flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Prevents reckless overcommitments</span>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
       *  4-STEP JUDICIAL TRIAL WORKFLOW (NEO-BRUTALIST TILES)
       * ────────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 w-full mb-20 z-10">
        <div className="bg-[#1C100B] border-4 border-black shadow-[10px_10px_0px_#000] p-6 sm:p-10">
          <div className="text-left mb-8 border-b-4 border-black pb-6">
            <span className="bg-neo-yellow text-black px-3 py-1 font-pixel text-xs font-black uppercase border-2 border-black shadow-[3px_3px_0px_#000] inline-block -rotate-1 mb-2">
              HOW IT WORKS
            </span>
            <h2 className="font-sans text-2xl sm:text-4xl font-black uppercase text-white tracking-tight">
              FROM RAW ANXIETY TO DEFINITIVE VERDICT
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Step 1 */}
            <div className="bg-[#26150F] border-3 border-black p-5 shadow-[4px_4px_0px_#000] flex flex-col justify-between">
              <div>
                <div className="font-pixel text-2xl font-black text-neo-yellow mb-2">01</div>
                <div className="font-mono text-xs font-bold uppercase text-white mb-2">
                  Summon Dilemma
                </div>
                <p className="font-sans text-xs text-[#FFF8E7] leading-relaxed">
                  Type or voice your internal conflict. Whether it's taking a seed round, quitting your job, or moving cities.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t-2 border-black font-mono text-[10px] text-neo-yellow uppercase font-bold">
                Docket Initiated
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-[#26150F] border-3 border-black p-5 shadow-[4px_4px_0px_#000] flex flex-col justify-between">
              <div>
                <div className="font-pixel text-2xl font-black text-neo-green mb-2">02</div>
                <div className="font-mono text-xs font-bold uppercase text-white mb-2">
                  Subpoena Records
                </div>
                <p className="font-sans text-xs text-[#FFF8E7] leading-relaxed">
                  Qdrant semantic vector search retrieves your actual past journals, lessons, failures, and personal principles.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t-2 border-black font-mono text-[10px] text-neo-green uppercase font-bold">
                No Hallucination
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-[#26150F] border-3 border-black p-5 shadow-[4px_4px_0px_#000] flex flex-col justify-between">
              <div>
                <div className="font-pixel text-2xl font-black text-neo-red mb-2">03</div>
                <div className="font-mono text-xs font-bold uppercase text-white mb-2">
                  Adversarial Clash
                </div>
                <p className="font-sans text-xs text-[#FFF8E7] leading-relaxed">
                  The Advocate and Skeptic enter the arena, quoting your own memories against each other in real-time cross-examination.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t-2 border-black font-mono text-[10px] text-neo-red uppercase font-bold">
                Fierce Cross-Exam
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-[#26150F] border-3 border-black p-5 shadow-[4px_4px_0px_#000] flex flex-col justify-between">
              <div>
                <div className="font-pixel text-2xl font-black text-neo-yellow mb-2">04</div>
                <div className="font-mono text-xs font-bold uppercase text-white mb-2">
                  Binding Verdict
                </div>
                <p className="font-sans text-xs text-[#FFF8E7] leading-relaxed">
                  The Chief Justice issues a decisive ruling with specific conditionality and appends the outcome to your memory base.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t-2 border-black font-mono text-[10px] text-neo-yellow uppercase font-bold">
                Gavel Slammed
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
       *  SAMPLE CASE DOCKETS (NEO-BRUTALIST CASE FILES)
       * ────────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 w-full mb-16 z-10">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2">
            <span className="bg-neo-yellow text-black px-3 py-1 font-pixel text-xs font-black uppercase border-2 border-black shadow-[2px_2px_0px_#000]">
              CASE DOCKETS
            </span>
            <span className="font-mono text-xs text-[#FFE885] uppercase tracking-widest font-bold">
              Ready for Deliberation
            </span>
          </div>
          <Link
            href="/courtroom"
            className="font-mono text-xs text-neo-yellow font-bold hover:underline flex items-center gap-1"
          >
            <span>Open Custom Case</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Case 1 */}
          <div className="bg-[#1C100B] border-3 border-black p-5 shadow-[5px_5px_0px_#000] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-neo-yellow font-mono text-[10px] font-black uppercase mb-2">
                <span>DOCKET #402</span>
                <span className="px-1.5 py-0.2 bg-neo-yellow/20 border border-neo-yellow text-neo-yellow">
                  CAREER
                </span>
              </div>
              <h3 className="font-mono text-sm font-bold text-white mb-3">
                “Should I quit my senior engineering role to build my AI startup full-time?”
              </h3>
              <p className="font-sans text-xs text-[#FFF8E7] leading-relaxed mb-4">
                Advocate cites your 2021 regret of not launching earlier. Skeptic objects based on current mortgage and 6-month burn rate.
              </p>
            </div>
            <Link
              href="/courtroom"
              className="neo-btn w-full bg-neo-yellow text-black font-mono font-bold text-xs uppercase py-2 text-center border-2 border-black shadow-[3px_3px_0px_#000] flex items-center justify-center gap-1.5"
            >
              <span>Argue This Case</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Case 2 */}
          <div className="bg-[#1C100B] border-3 border-black p-5 shadow-[5px_5px_0px_#000] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-neo-green font-mono text-[10px] font-black uppercase mb-2">
                <span>DOCKET #718</span>
                <span className="px-1.5 py-0.2 bg-neo-green/20 border border-neo-green text-neo-green">
                  FINANCE
                </span>
              </div>
              <h3 className="font-mono text-sm font-bold text-white mb-3">
                “Should I buy a property in Bangalore now or keep 100% of liquid assets in equity?”
              </h3>
              <p className="font-sans text-xs text-[#FFF8E7] leading-relaxed mb-4">
                Advocate argues for family grounding and inflation hedge. Skeptic highlights liquidity constraints and high interest rates.
              </p>
            </div>
            <Link
              href="/courtroom"
              className="neo-btn w-full bg-neo-green text-black font-mono font-bold text-xs uppercase py-2 text-center border-2 border-black shadow-[3px_3px_0px_#000] flex items-center justify-center gap-1.5"
            >
              <span>Argue This Case</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Case 3 */}
          <div className="bg-[#1C100B] border-3 border-black p-5 shadow-[5px_5px_0px_#000] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-neo-red font-mono text-[10px] font-black uppercase mb-2">
                <span>DOCKET #109</span>
                <span className="px-1.5 py-0.2 bg-neo-red/20 border border-neo-red text-neo-red">
                  PARTNERSHIP
                </span>
              </div>
              <h3 className="font-mono text-sm font-bold text-white mb-3">
                “Should I part ways with a non-technical cofounder who is lagging on execution?”
              </h3>
              <p className="font-sans text-xs text-[#FFF8E7] leading-relaxed mb-4">
                Advocate argues that speed is the only startup moat. Skeptic recalls how legal dispute in 2020 almost destroyed the prior project.
              </p>
            </div>
            <Link
              href="/courtroom"
              className="neo-btn w-full bg-neo-red text-white font-mono font-bold text-xs uppercase py-2 text-center border-2 border-black shadow-[3px_3px_0px_#000] flex items-center justify-center gap-1.5"
            >
              <span>Argue This Case</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
       *  BOTTOM CALLOUT BANNER (NEO-BRUTALIST GOLD TILE)
       * ────────────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 w-full z-10">
        <div className="bg-neo-yellow text-black border-4 border-black p-8 sm:p-10 shadow-[8px_8px_0px_#000] text-center flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-3 border-black overflow-hidden bg-black shadow-[4px_4px_0px_#000]">
            <img
              src="/pixel_gavel_gold.jpg"
              alt="Supreme Gavel"
              className="w-full h-full object-cover"
              style={{ imageRendering: "pixelated" }}
            />
          </div>
          <h2 className="font-sans text-2xl sm:text-4xl font-black uppercase tracking-tight">
            STOP OVERTHINKING ALONE.
          </h2>
          <p className="font-mono text-xs sm:text-sm max-w-lg leading-relaxed font-bold">
            Let your living memories speak. Bring your question before the bench and get an adversarial, transparent resolution.
          </p>
          <Link
            href="/courtroom"
            className="neo-btn bg-black text-neo-yellow px-8 py-3.5 font-mono text-sm uppercase font-black tracking-wider border-3 border-black shadow-[4px_4px_0px_#E52521] hover:bg-[#1C100B] active:translate-x-[2px] active:translate-y-[2px] transition-all flex items-center gap-2"
          >
            <span>Open Court Docket</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </Link>
        </div>
      </section>
    </div>
  );
}
