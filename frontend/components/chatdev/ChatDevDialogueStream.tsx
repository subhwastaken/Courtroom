"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Copy, Check, Quote, Sparkles } from "lucide-react";
import { AgentTurn } from "@/lib/types";

interface ChatDevDialogueStreamProps {
  turns: AgentTurn[];
  activeTurnIndex: number;
  question?: string;
}

export function ChatDevDialogueStream({
  turns,
  activeTurnIndex,
  question,
}: ChatDevDialogueStreamProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const roleMeta = {
    advocate: {
      name: "Counselor (Advocate)",
      roleTitle: "Counsel for Opportunity",
      avatar: "/chatdev/avatars/Counselor.png",
      tagColor: "bg-emerald-950/70 border-emerald-500/40 text-emerald-300",
      bubbleBorder: "border-l-4 border-l-emerald-500 border-[#2d3442] bg-[#1a202c]",
    },
    skeptic: {
      name: "Code Reviewer (Skeptic)",
      roleTitle: "Counsel for Caution",
      avatar: "/chatdev/avatars/Code Reviewer.png",
      tagColor: "bg-rose-950/70 border-rose-500/40 text-rose-300",
      bubbleBorder: "border-l-4 border-l-rose-500 border-[#2d3442] bg-[#1a202c]",
    },
    judge: {
      name: "CEO (Chief Justice)",
      roleTitle: "Arbiter of Personal History",
      avatar: "/chatdev/avatars/Chief Executive Officer.png",
      tagColor: "bg-amber-950/70 border-amber-500/40 text-amber-300",
      bubbleBorder: "border-l-4 border-l-amber-500 border-[#2d3442] bg-[#1a202c]",
    },
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="w-full flex flex-col space-y-4 font-mono">
      {/* Question / Human Request Prompt Card */}
      {question && (
        <div className="rounded-lg bg-[#141824] border border-[#2d3442] p-4 flex items-start gap-3 shadow-lg">
          <div className="relative w-10 h-10 flex-shrink-0 rounded-lg overflow-hidden border border-amber-500/40 bg-slate-900">
            <Image
              src="/chatdev/avatars/User.png"
              alt="User"
              width={40}
              height={40}
              className="object-cover pixelated"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="font-bold text-amber-400 uppercase tracking-wider">
                Human Client [Case In Dilemma]
              </span>
              <span className="text-[10px] text-slate-500">Live Input</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-100 font-sans leading-relaxed">
              "{question}"
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
              className={`rounded-lg border p-4 transition-all duration-300 shadow-md ${
                meta.bubbleBorder
              } ${isLatest ? "ring-1 ring-amber-400/40" : ""}`}
            >
              {/* Header row: Avatar + Name + Turn Tag */}
              <div className="flex items-center justify-between gap-3 mb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="relative w-9 h-9 rounded overflow-hidden border border-slate-700 bg-slate-900 flex-shrink-0">
                    <Image
                      src={meta.avatar}
                      alt={meta.name}
                      width={36}
                      height={36}
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      {meta.name}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {meta.roleTitle}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${meta.tagColor}`}
                  >
                    Phase {idx + 1}: {turn.role}
                  </span>
                  <button
                    onClick={() => copyToClipboard(turn.content, idx)}
                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                    title="Copy dialogue"
                  >
                    {copiedIndex === idx ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Message Body */}
              <div className="text-xs sm:text-sm text-slate-200 font-sans leading-relaxed whitespace-pre-line pl-11">
                {turn.content}
              </div>

              {/* Memory Citations Chips */}
              {turn.cited_memories && turn.cited_memories.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-800/80 pl-11 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] uppercase font-mono text-amber-400/80 flex items-center gap-1">
                    <Quote className="w-3 h-3" />
                    Grounding:
                  </span>
                  {turn.cited_memories.map((cite, cIdx) => (
                    <span
                      key={cIdx}
                      className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-[10px] font-mono text-amber-200/90 leading-tight"
                    >
                      "{cite}"
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
