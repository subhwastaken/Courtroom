"use client";
import React from "react";
import { Shield, AlertCircle, Scale } from "lucide-react";
import { AgentRole } from "@/lib/types";

interface AgentCardProps {
  role: AgentRole;
  content: string;
  active: boolean;
  citedMemories?: string[];
  title?: string;
}

export function AgentCard({ role, content, active, citedMemories, title }: AgentCardProps) {
  const meta = {
    advocate: {
      name: "Advocate",
      title: title || "Counsel for Opportunity",
      icon: <Shield className="w-4 h-4 text-emerald-400" />,
      themeBorder: "border-emerald-500/60 shadow-glow-emerald",
      badgeBg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
      accentText: "text-emerald-400",
      pedestal: "from-emerald-950/60 to-slate-900 border-emerald-500/40",
    },
    skeptic: {
      name: "Skeptic",
      title: title || "Counsel for Caution",
      icon: <AlertCircle className="w-4 h-4 text-rose-400" />,
      themeBorder: "border-rose-500/60 shadow-glow-rose",
      badgeBg: "bg-rose-500/20 text-rose-300 border-rose-500/40",
      accentText: "text-rose-400",
      pedestal: "from-rose-950/60 to-slate-900 border-rose-500/40",
    },
    judge: {
      name: "Chief Justice",
      title: title || "Arbiter of History",
      icon: <Scale className="w-4 h-4 text-amber-400" />,
      themeBorder: "border-amber-400/80 shadow-glow-amber",
      badgeBg: "bg-amber-500/20 text-amber-300 border-amber-500/40",
      accentText: "text-amber-400",
      pedestal: "from-amber-950/60 to-slate-900 border-amber-500/40",
    },
  }[role];

  return (
    <div
      className="transition-all duration-700 ease-out select-text"
      style={{
        transform: "rotateZ(38deg) rotateX(-58deg)",
        transformStyle: "preserve-3d",
      }}
    >
      {/* 3D Floating Agent Card */}
      <div
        className={`
          w-72 sm:w-80 rounded-xl border bg-slate-950/90 backdrop-blur-xl p-4 sm:p-5
          transition-all duration-500 relative
          ${active ? `${meta.themeBorder} scale-105 opacity-100 z-30` : "border-slate-800/80 opacity-55 scale-95 z-10"}
        `}
      >
        {/* Active Speaker Hologram Indicator */}
        {active && (
          <div className="absolute -top-3 right-4 px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-mono text-[9px] font-bold tracking-widest uppercase flex items-center gap-1 shadow-lg animate-bounce">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping" />
            Speaking
          </div>
        )}

        {/* Card Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5 mb-3">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg border ${meta.badgeBg}`}>
              {meta.icon}
            </div>
            <div>
              <div className="text-xs uppercase font-mono tracking-widest font-bold text-slate-200">
                {meta.name}
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                {meta.title}
              </div>
            </div>
          </div>
          <span className={`text-[10px] uppercase font-mono tracking-wider font-semibold ${meta.accentText}`}>
            {role.toUpperCase()}
          </span>
        </div>

        {/* Argument Speech Bubble Content */}
        <div className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans min-h-[90px] whitespace-pre-line">
          {content}
        </div>

        {/* Grounded Memory Citations */}
        {citedMemories && citedMemories.length > 0 && (
          <div className="mt-3.5 pt-2.5 border-t border-slate-800/90">
            <div className="text-[9px] uppercase tracking-wider text-amber-400 font-mono mb-1.5 flex items-center gap-1">
              <span>Grounding Citations:</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {citedMemories.map((mem, idx) => (
                <span
                  key={idx}
                  className="inline-block px-2 py-0.5 rounded bg-amber-950/40 border border-amber-500/30 text-[10px] text-amber-200 font-mono leading-tight"
                >
                  "{mem}"
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
