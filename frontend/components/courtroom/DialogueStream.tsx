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
      avatar: "/pixel_advocate_portrait.jpg",
      tagColor: "bg-neo-green text-black border-2 border-black shadow-[2px_2px_0px_#000]",
      bubbleBorder: "border-3 border-black bg-[#1C100B]",
      glowColor: "shadow-[6px_6px_0px_#05F196]",
    },
    skeptic: {
      name: "The Skeptic",
      roleTitle: "Counsel for Caution",
      avatar: "/pixel_skeptic_portrait.jpg",
      tagColor: "bg-neo-red text-white border-2 border-black shadow-[2px_2px_0px_#000]",
      bubbleBorder: "border-3 border-black bg-[#1C100B]",
      glowColor: "shadow-[6px_6px_0px_#E52521]",
    },
    judge: {
      name: "The Chief Justice",
      roleTitle: "Supreme Arbiter of History",
      avatar: "/pixel_judge_portrait.jpg",
      tagColor: "bg-neo-yellow text-black border-2 border-black shadow-[2px_2px_0px_#000]",
      bubbleBorder: "border-3 border-black bg-[#1C100B]",
      glowColor: "shadow-[6px_6px_0px_#FFE600]",
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
        <div className="bg-[#1C100B] border-3 border-black p-4 flex items-start gap-3.5 shadow-[5px_5px_0px_#000]">
          <div className="w-10 h-10 flex-shrink-0 border-2 border-black overflow-hidden bg-black shadow-[2px_2px_0px_#000]">
            <img
              src="/pixel_court_badge.jpg"
              alt="Docket Seal"
              className="w-full h-full object-cover"
              style={{ imageRendering: "pixelated" }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-pixel text-[10px] text-neo-yellow uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 bg-neo-green border border-black animate-pulse" />
                Case Docket #2024
              </span>
              <span className="text-[10px] text-[#FFE885] font-mono uppercase font-bold">Sub Judice</span>
            </div>
            <p className="text-xs sm:text-sm text-[#FFF8E7] font-mono leading-relaxed font-bold">
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
              className={`p-4 transition-all duration-300 ${
                meta.bubbleBorder
              } ${meta.glowColor} ${isLatest ? "translate-x-[-1px] translate-y-[-1px]" : ""}`}
            >
              {/* Header row: Character + Title + Turn Tag */}
              <div className="flex items-center justify-between gap-3 mb-3 border-b-2 border-black pb-2.5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-black border-2 border-black flex-shrink-0 overflow-hidden shadow-[2px_2px_0px_#000]">
                    <img
                      src={meta.avatar}
                      alt={meta.name}
                      className="w-full h-full object-cover"
                      style={{ imageRendering: "pixelated" }}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-white uppercase tracking-wider">
                        {meta.name}
                      </span>
                      <span
                        className={`text-[9px] px-2 py-0.5 font-bold uppercase tracking-wider ${meta.tagColor}`}
                      >
                        {meta.roleTitle}
                      </span>
                    </div>
                    <div className="text-[10px] text-[#FFE885] font-mono mt-0.5 font-bold">
                      Courtroom Stage {idx + 1} of 3
                    </div>
                  </div>
                </div>

                {/* Copy Button */}
                <button
                  onClick={() => copyToClipboard(turn.content, idx)}
                  className="neo-btn bg-[#26150F] text-[#FFF8E7] hover:text-black hover:bg-neo-yellow p-1.5 border-2 border-black shadow-[2px_2px_0px_#000]"
                  title="Copy speech to clipboard"
                >
                  {copiedIndex === idx ? (
                    <Check className="w-3.5 h-3.5 text-neo-green stroke-[2.5]" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {/* Main Spoken Legal Argument */}
              <div className="my-2">
                <p className="text-xs sm:text-sm text-[#FFF8E7] font-sans leading-relaxed">
                  &ldquo;{turn.content}&rdquo;
                </p>
              </div>

              {/* Grounded Evidence / Precedent Footnotes */}
              {turn.cited_memories && turn.cited_memories.length > 0 && (
                <div className="mt-3 pt-2.5 border-t-2 border-black flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5 text-[10px] uppercase font-black text-neo-yellow tracking-wider">
                    <BookOpen className="w-3 h-3 text-neo-yellow stroke-[2.5]" />
                    <span>Evidence Grounded in Your Personal History:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {turn.cited_memories.map((m, mIdx) => (
                      <span
                        key={mIdx}
                        className="text-[10px] bg-[#26150F] text-[#FFE885] border-2 border-black shadow-[2px_2px_0px_#000] px-2 py-0.5 flex items-center gap-1 max-w-full truncate font-mono"
                        title={m}
                      >
                        <Quote className="w-2.5 h-2.5 text-neo-yellow flex-shrink-0" />
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
