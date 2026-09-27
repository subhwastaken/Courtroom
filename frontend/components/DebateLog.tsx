"use client";
import React from "react";
import { AgentTurn } from "@/lib/types";
import { Shield, AlertCircle, Scale } from "lucide-react";

interface DebateLogProps {
  turns: AgentTurn[];
  activeTurnIndex: number;
}

export function DebateLog({ turns, activeTurnIndex }: DebateLogProps) {
  if (!turns || turns.length === 0) return null;

  const roleStyles = {
    advocate: {
      label: "Advocate (Counsel for Action)",
      icon: <Shield className="w-3.5 h-3.5 text-emerald-400" />,
      border: "border-l-4 border-l-emerald-500 border-slate-800",
      badge: "bg-emerald-950/60 text-emerald-300 border-emerald-500/30",
    },
    skeptic: {
      label: "Skeptic (Counsel for Caution)",
      icon: <AlertCircle className="w-3.5 h-3.5 text-rose-400" />,
      border: "border-l-4 border-l-rose-500 border-slate-800",
      badge: "bg-rose-950/60 text-rose-300 border-rose-500/30",
    },
    judge: {
      label: "Chief Justice (Final Verdict)",
      icon: <Scale className="w-3.5 h-3.5 text-amber-400" />,
      border: "border-l-4 border-l-amber-500 border-slate-800",
      badge: "bg-amber-950/60 text-amber-300 border-amber-500/30",
    },
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 mt-8 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <h3 className="font-mono text-xs uppercase tracking-widest text-slate-400 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          Courtroom Argument Record
        </h3>
        <span className="font-mono text-[11px] text-slate-500">
          {Math.min(activeTurnIndex, turns.length)} / {turns.length} Arguments Presented
        </span>
      </div>

      <div className="space-y-3">
        {turns.slice(0, activeTurnIndex).map((turn, i) => {
          const style = roleStyles[turn.role] || roleStyles.judge;
          return (
            <div
              key={i}
              className={`rounded-lg bg-slate-950/70 border p-4 backdrop-blur transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 ${style.border}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded bg-slate-900 border border-slate-800">{style.icon}</span>
                  <span className="font-mono text-xs font-semibold text-slate-200 uppercase tracking-wider">
                    {style.label}
                  </span>
                </div>
                <span className="font-mono text-[10px] text-slate-500 uppercase">Turn {i + 1}</span>
              </div>

              <p className="text-sm text-slate-300 font-sans leading-relaxed whitespace-pre-line pl-1">
                {turn.content}
              </p>

              {turn.cited_memories && turn.cited_memories.length > 0 && (
                <div className="mt-3 pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    Citations:
                  </span>
                  {turn.cited_memories.map((cite, cIdx) => (
                    <span
                      key={cIdx}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 border border-slate-700 text-amber-300/90"
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
