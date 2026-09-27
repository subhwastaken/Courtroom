"use client";
import React, { useEffect } from "react";
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
        particleCount: 65,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#FFE600", "#E52521", "#00E676", "#FFF8E7"],
      });
    } catch {
      // safe
    }
  }, []);

  return (
    <div className="w-full max-w-3xl mx-auto px-4 my-6 select-none animate-in fade-in zoom-in-95 duration-500">
      <div className="relative bg-[#1C100B] border-4 border-black shadow-[8px_8px_0px_#000] p-6 sm:p-8">
        {/* Top Neo-brutalist Ribbon */}
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-neo-yellow text-black border-3 border-black font-pixel text-[10px] sm:text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-[3px_3px_0px_#000] -rotate-1">
          <Gavel className="w-4 h-4 stroke-[2.5]" />
          <span>FINAL JUDICIAL VERDICT</span>
          <Sparkles className="w-3.5 h-3.5 fill-black" />
        </div>

        {/* Verdict Header with Pixel Gavel and Chief Justice Portrait */}
        <div className="flex flex-col sm:flex-row items-center gap-5 mt-3 border-b-3 border-black pb-5">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 sm:w-20 sm:h-20 border-3 border-black overflow-hidden bg-black shadow-[4px_4px_0px_#000] flex-shrink-0">
              <img
                src="/pixel_gavel_gold.jpg"
                alt="Golden Gavel"
                className="w-full h-full object-cover"
                style={{ imageRendering: "pixelated" }}
              />
            </div>
            <div className="w-16 h-16 sm:w-20 sm:h-20 border-3 border-black overflow-hidden bg-black shadow-[4px_4px_0px_#000] flex-shrink-0">
              <img
                src="/pixel_judge_portrait.jpg"
                alt="Chief Justice"
                className="w-full h-full object-cover"
                style={{ imageRendering: "pixelated" }}
              />
            </div>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <div className="text-[11px] uppercase font-mono tracking-widest text-neo-yellow font-black mb-1.5 flex items-center justify-center sm:justify-start gap-1.5">
              <span className="w-2 h-2 bg-neo-yellow border border-black animate-pulse" />
              <span>Chief Justice Pronouncement</span>
            </div>
            <h2 className="text-base sm:text-xl md:text-2xl font-black text-white tracking-tight leading-snug font-sans">
              &ldquo;{verdict}&rdquo;
            </h2>
          </div>
        </div>

        {/* Grounding Citations */}
        {citations && citations.length > 0 && (
          <div className="mt-6 pt-5 border-t-3 border-black">
            <div className="text-xs uppercase font-mono font-bold tracking-widest text-neo-yellow mb-3 flex items-center gap-1.5">
              <Quote className="w-3.5 h-3.5 text-neo-yellow stroke-[2.5]" />
              <span>Direct Personal Grounding Evidence:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {citations.map((cite, i) => (
                <div
                  key={i}
                  className="bg-[#26150F] border-2 border-black shadow-[3px_3px_0px_#000] px-3.5 py-2 text-xs text-[#FFF8E7] font-mono leading-relaxed flex items-start gap-2"
                >
                  <span className="text-neo-yellow font-black">#{i + 1}</span>
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
              className="neo-btn px-6 py-2.5 bg-neo-yellow text-black font-mono text-xs font-black uppercase tracking-widest border-2 border-black shadow-[3px_3px_0px_#000] flex items-center gap-2"
            >
              <span>Record Your Decision</span>
              <span>→</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
