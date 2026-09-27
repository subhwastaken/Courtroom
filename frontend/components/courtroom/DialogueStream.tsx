"use client";
import React, { useState } from "react";
import { Copy, Check, Quote, Scale, BookOpen, ShieldAlert, Sparkles, Gavel } from "lucide-react";
import { AgentTurn } from "@/lib/types";

interface DialogueStreamProps {
  turns: AgentTurn[];
  activeTurnIndex: number;
  question?: string;
}

export function DialogueStream({
  turns,
  activeTurnIndex,
  question,
}: DialogueStreamProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const roleMeta = {
    advocate: {
      name: "The Advocate",
      roleTitle: "Counsel for Opportunity",
      avatar: "/sprite_cutout_advocate.png",
      tagColor: "bg-emerald-950/80 border-emerald-500/50 text-emerald-300",
      bubbleBorder: "border-l-4 border-l-emerald-500 border-[#3d2415] bg-[#160f0a]",
      glowColor: "shadow-[0_0_20px_rgba(16,185,129,0.15)]",
    },
    skeptic: {
      name: "The Skeptic",
      roleTitle: "Counsel for Caution",
      avatar: "/sprite_cutout_skeptic.png",
      tagColor: "bg-rose-950/80 border-rose-500/50 text-rose-300",
      bubbleBorder: "border-l-4 border-l-rose-500 border-[#3d2415] bg-[#160f0a]",
      glowColor: "shadow-[0_0_20px_rgba(244,63,94,0.15)]",
    },
    judge: {
      name: "The Chief Justice",
      roleTitle: "Supreme Arbiter of History",
      avatar: "/sprite_cutout_judge.png",
      tagColor: "bg-amber-950/80 border-amber-500/60 text-amber-300",
      bubbleBorder: "border-l-4 border-l-amber-500 border-[#4a2e1c] bg-[#1a120b]",
      glowColor: "shadow-[0_0_25px_rgba(245,158,11,0.2)]",
    },
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="w-full flex flex-col space-y-4 font-mono select-none">
      {/* Question / Docket Case Card */}
      {question && (
        <div className="rounded-xl bg-[#170e08] border border-[#4a2a16] p-4 flex items-start gap-3.5 shadow-xl">
          <div className="relative w-10 h-10 flex-shrink-0 rounded-lg overflow-hidden border border-amber-500/40 bg-slate-950 flex items-center justify-center">
            <Scale className="w-6 h-6 text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between text-xs text-amber-200/60 mb-1">
              <span className="font-bold text-amber-400 uppercase tracking-widest text-[11px] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                Case Docket [Sub judice]
              </span>
              <span className="text-[10px] text-amber-200/40 font-mono">Active Question</span>
            </div>
            <p className="text-xs sm:text-sm text-amber-100 font-sans leading-relaxed italic">
              &ldquo;{question}&rdquo;
            </p>
          </div>
        </div>
      )}

      {/* Sequential Dialogue Turns */}
      <div className="space-y-4">
        {turns.slice(0, activeTurnIndex).map((turn, idx) => {
          const meta = roleMeta[turn.role] || roleMeta.advocate;
          const isLatest = idx === activeTurnIndex - 1;

          return (
            <div
              key={idx}
              className={`rounded-xl border p-4.5 transition-all duration-300 shadow-xl ${
                meta.bubbleBorder
              } ${meta.glowColor} ${isLatest ? "ring-1 ring-amber-400/50" : ""}`}
            >
              {/* Header row: Character + Title + Turn Tag */}
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-[#4a2a16] bg-slate-950 flex-shrink-0 p-0.5">
                    <img
                      src={meta.avatar}
                      alt={meta.name}
                      className="w-full h-full object-contain"
                      style={{ imageRendering: "pixelated" }}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                        {meta.name}
                      </span>
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded border uppercase tracking-wider font-bold ${meta.tagColor}`}
                      >
                        {meta.roleTitle}
                      </span>
                    </div>
                    <div className="text-[10px] text-amber-200/50">
                      Courtroom Stage {idx + 1} of 3
                    </div>
                  </div>
                </div>

                {/* Copy Button */}
                <button
                  onClick={() => copyToClipboard(turn.content, idx)}
                  className="text-amber-200/40 hover:text-amber-300 transition-colors p-1"
                  title="Copy speech to clipboard"
                >
                  {copiedIndex === idx ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {/* Main Spoken Legal Argument */}
              <div className="pl-3 border-l-2 border-amber-500/20 my-2">
                <p className="text-xs sm:text-sm text-slate-200 font-sans leading-relaxed">
                  &ldquo;{turn.content}&rdquo;
                </p>
              </div>

              {/* Grounded Evidence / Precedent Footnotes */}
              {turn.cited_memories && turn.cited_memories.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-[#3d2415] flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-amber-300/80 tracking-wider">
                    <BookOpen className="w-3 h-3 text-amber-400" />
                    <span>Evidence Grounded in Your Personal History:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {turn.cited_memories.map((m, mIdx) => (
                      <span
                        key={mIdx}
                        className="text-[10px] bg-[#24140b] text-amber-200/80 border border-[#522d1a] px-2 py-0.5 rounded flex items-center gap-1 max-w-full truncate"
                        title={m}
                      >
                        <Quote className="w-2.5 h-2.5 text-amber-400 flex-shrink-0" />
                        <span className="truncate">{m}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
