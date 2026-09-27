"use client";
import React, { useEffect, useState } from "react";
import { Gavel, Sparkles, Quote } from "lucide-react";
import confetti from "canvas-confetti";
import { playGavelStrikeSound } from "@/lib/sounds";

interface VerdictGavelProps {
  verdict: string;
  citations: string[];
  onLogOutcomeClick?: () => void;
}

export function VerdictGavel({ verdict, citations, onLogOutcomeClick }: VerdictGavelProps) {
  useEffect(() => {
    // Play sound and trigger confetti on mount
    playGavelStrikeSound();

    try {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#f59e0b", "#fbbf24", "#06b6d4", "#10b981"],
      });
    } catch {
      // safe
    }
  }, []);

  return (
    <div className="w-full max-w-3xl mx-auto px-4 my-6 animate-in fade-in zoom-in-95 duration-500">
      <div className="relative rounded-2xl border-2 border-amber-500/80 bg-gradient-to-b from-slate-900/95 via-slate-950/95 to-slate-900/95 backdrop-blur-2xl p-6 sm:p-8 shadow-[0_0_50px_rgba(245,158,11,0.3)]">
        {/* Top Gold Seal Ribbon */}
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600 text-slate-950 font-mono text-xs font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg">
          <Gavel className="w-3.5 h-3.5" />
          <span>Final Judicial Verdict</span>
          <Sparkles className="w-3.5 h-3.5" />
        </div>

        {/* Verdict Statement */}
        <div className="text-center mt-2">
          <div className="text-xs uppercase font-mono tracking-widest text-amber-400/80 mb-2">
            The Court Has Ruled
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-50 tracking-tight leading-snug">
            "{verdict}"
          </h2>
        </div>

        {/* Grounding Citations */}
        {citations && citations.length > 0 && (
          <div className="mt-6 pt-5 border-t border-slate-800">
            <div className="text-xs uppercase font-mono tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
              <Quote className="w-3.5 h-3.5 text-amber-400" />
              <span>Direct Personal Grounding Evidence:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {citations.map((cite, i) => (
                <div
                  key={i}
                  className="rounded-lg bg-slate-950/70 border border-amber-500/20 px-3.5 py-2 text-xs text-amber-200/90 font-mono leading-relaxed flex items-start gap-2"
                >
                  <span className="text-amber-500 font-bold">#{i + 1}</span>
                  <span>{cite}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom CTA to log outcome */}
        {onLogOutcomeClick && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={onLogOutcomeClick}
              className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-mono text-xs font-bold uppercase tracking-widest hover:brightness-110 shadow-lg shadow-amber-500/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <span>Record Your Decision</span>
              <span className="text-slate-950">→</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
